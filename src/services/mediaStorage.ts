/**
 * IndexedDB Media Storage Service for MIT Invitations
 * Stores large video and image Blobs in browser IndexedDB to bypass 5MB localStorage limit.
 */

// Internal IndexedDB name kept as AuraInvitations_MediaDB (invisible internal storage; renaming would lose saved media)
const DB_NAME = 'AuraInvitations_MediaDB';
const DB_VERSION = 1;
const STORE_NAME = 'media_blobs';

export interface StoredMediaItem {
  id: string;
  name: string;
  type: string;
  size: number;
  blob: Blob;
  createdAt: string;
}

export interface SerializedMediaItem {
  id: string;
  name: string;
  type: string;
  size: number;
  base64: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

// In-memory object URL cache so we don't recreate object URLs continuously
const objectUrlCache = new Map<string, string>();

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

/**
 * Save a File or Blob to Firebase Storage (and IndexedDB as local cache)
 */
export async function saveMediaBlob(
  fileOrBlob: File | Blob,
  preferredId?: string,
  fileName?: string
): Promise<{ id: string; size: number; type: string; url: string; cloudUrl?: string }> {
  const id = preferredId || `media_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const name = fileName || (fileOrBlob instanceof File ? fileOrBlob.name : 'media_file');
  const type = fileOrBlob.type || (name.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg');
  const size = fileOrBlob.size;

  // 1. Try uploading to Firebase Cloud Storage for universal cross-device access
  let cloudUrl: string | undefined;
  try {
    const cleanFileName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageRef = ref(storage, `invitations/${id}_${cleanFileName}`);
    await uploadBytes(storageRef, fileOrBlob);
    cloudUrl = await getDownloadURL(storageRef);
    console.log('Uploaded asset to Firebase Storage:', cloudUrl);
  } catch (storageError) {
    console.warn('Firebase Storage upload failed or offline. Storing in local IndexedDB:', storageError);
  }

  // 2. Also save to IndexedDB for offline capability & local cache
  try {
    const db = await getDB();
    const item: StoredMediaItem = {
      id,
      name,
      type,
      size,
      blob: fileOrBlob,
      createdAt: new Date().toISOString(),
    };

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (idbErr) {
    console.warn('IndexedDB write warning:', idbErr);
  }

  // Use the cloud URL as the primary permanent URL if available
  const localUrl = URL.createObjectURL(fileOrBlob);
  objectUrlCache.set(id, cloudUrl || localUrl);
  if (cloudUrl) {
    objectUrlCache.set(cloudUrl, cloudUrl);
  }

  return { 
    id: cloudUrl || id, 
    size, 
    type, 
    url: cloudUrl || localUrl, 
    cloudUrl 
  };
}

/**
 * Retrieve a media Blob by ID
 */
export async function getMediaBlob(id: string): Promise<Blob | null> {
  try {
    const db = await getDB();
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        const result = req.result as StoredMediaItem | undefined;
        resolve(result?.blob || null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn(`Failed to get media blob for ID ${id}:`, err);
    return null;
  }
}

/**
 * Resolves a media reference (ID or URL) to a usable playable URL.
 * If given an external URL (http, https, data:), returns it as is.
 * If given a media_ ID, pulls from IndexedDB and returns an object URL.
 */
export async function resolveMediaUrl(idOrUrl?: string): Promise<string> {
  if (!idOrUrl) return '';

  // If it's already an external HTTP URL or data URL
  if (idOrUrl.startsWith('http://') || idOrUrl.startsWith('https://') || idOrUrl.startsWith('data:')) {
    return idOrUrl;
  }

  // If it's already in our object URL cache
  if (objectUrlCache.has(idOrUrl)) {
    return objectUrlCache.get(idOrUrl)!;
  }

  // Check if it's an IndexedDB media ID
  if (idOrUrl.startsWith('media_')) {
    const blob = await getMediaBlob(idOrUrl);
    if (blob) {
      const url = URL.createObjectURL(blob);
      objectUrlCache.set(idOrUrl, url);
      return url;
    }
  }

  return idOrUrl;
}

/**
 * Delete a media item from IndexedDB
 */
export async function deleteMediaBlob(id: string): Promise<boolean> {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    if (objectUrlCache.has(id)) {
      try {
        URL.revokeObjectURL(objectUrlCache.get(id)!);
      } catch {
        // ignore
      }
      objectUrlCache.delete(id);
    }
    return true;
  } catch (err) {
    console.error(`Failed to delete media ${id}:`, err);
    return false;
  }
}

/**
 * Format bytes to readable string (e.g., "14.2 MB")
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Convert Blob to Base64 string for backup export
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert Base64 string back to Blob for backup import
 */
export function base64ToBlob(base64: string, fallbackType = 'application/octet-stream'): Blob {
  const parts = base64.split(';base64,');
  const contentType = parts.length > 1 ? parts[0].split(':')[1] : fallbackType;
  const raw = window.atob(parts.length > 1 ? parts[1] : parts[0]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

/**
 * Export all media in IndexedDB to base64 serialized items
 */
export async function exportAllMedia(): Promise<SerializedMediaItem[]> {
  try {
    const db = await getDB();
    const items = await new Promise<StoredMediaItem[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    const serialized: SerializedMediaItem[] = [];
    for (const item of items) {
      try {
        const base64 = await blobToBase64(item.blob);
        serialized.push({
          id: item.id,
          name: item.name,
          type: item.type,
          size: item.size,
          base64,
        });
      } catch (err) {
        console.warn(`Failed to export media item ${item.id}:`, err);
      }
    }
    return serialized;
  } catch (err) {
    console.error('Failed to export media from IndexedDB:', err);
    return [];
  }
}

/**
 * Import serialized media items back into IndexedDB
 */
export async function importSerializedMedia(items: SerializedMediaItem[]): Promise<number> {
  if (!items || !items.length) return 0;
  let count = 0;
  for (const item of items) {
    try {
      if (item.base64 && item.id) {
        const blob = base64ToBlob(item.base64, item.type);
        await saveMediaBlob(blob, item.id, item.name);
        count++;
      }
    } catch (err) {
      console.warn(`Failed to restore media item ${item.id}:`, err);
    }
  }
  return count;
}
