/**
 * Invitation & Template Cloud Firestore Service for MIT Invitations
 * Handles templates, custom invitations, guest lists, RSVPs, slug reservation, and media uploads.
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  writeBatch,
  serverTimestamp,
  limit
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, auth, handleFirestoreError, OperationType } from '../config/firebase';
import { 
  InvitationTemplate, 
  Invitation, 
  Guest, 
  ClientProfile, 
  AdminLogItem, 
  InvitationVersion 
} from '../types/invitation';

export const COLLECTIONS = {
  TEMPLATES: 'templates',
  INVITATIONS: 'invitations',
  GUESTS: 'guests', // subcollection under invitations/{id}/guests
  SLUGS: 'invitationSlugs',
  CLIENTS: 'clients',
  ADMIN_LOG: 'adminLog',
};

// ==========================================
// 1. TEMPLATES (Admin Builder & Public Read)
// ==========================================

export async function listTemplates(): Promise<InvitationTemplate[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.TEMPLATES));
    const templates: InvitationTemplate[] = [];
    snap.forEach((d) => {
      templates.push(d.data() as InvitationTemplate);
    });
    return templates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.TEMPLATES);
  }
}

export async function getTemplate(id: string): Promise<InvitationTemplate | null> {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.TEMPLATES, id));
    if (docSnap.exists()) {
      return docSnap.data() as InvitationTemplate;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `${COLLECTIONS.TEMPLATES}/${id}`);
  }
}

export async function saveTemplate(template: InvitationTemplate): Promise<void> {
  const path = `${COLLECTIONS.TEMPLATES}/${template.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.TEMPLATES, template.id), {
      ...template,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteTemplate(id: string): Promise<void> {
  const path = `${COLLECTIONS.TEMPLATES}/${id}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.TEMPLATES, id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function duplicateTemplate(id: string): Promise<InvitationTemplate | null> {
  const original = await getTemplate(id);
  if (!original) return null;

  const newId = `tpl_${Date.now()}`;
  const copy: InvitationTemplate = {
    ...original,
    id: newId,
    name: `${original.name} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
  };

  await saveTemplate(copy);
  return copy;
}

// ==========================================
// 2. SLUG RESERVATION & VALIDATION
// ==========================================

export function formatSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

export async function isSlugAvailable(slug: string, currentInvitationId?: string): Promise<boolean> {
  const clean = formatSlug(slug);
  if (clean.length < 3 || clean.length > 40) return false;

  try {
    const slugDoc = await getDoc(doc(db, COLLECTIONS.SLUGS, clean));
    if (!slugDoc.exists()) return true;
    const data = slugDoc.data();
    if (currentInvitationId && data.invitationId === currentInvitationId) {
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Error checking slug availability:', err);
    return false;
  }
}

export function generateSlugSuggestions(baseText: string): string[] {
  const clean = formatSlug(baseText) || 'wedding';
  const year = new Date().getFullYear();
  const rand = Math.floor(100 + Math.random() * 900);
  return [
    clean,
    `${clean}-${year}`,
    `${clean}-celebration`,
    `${clean}-${rand}`,
    `mit-${clean}`,
  ];
}

// ==========================================
// 3. INVITATIONS (Client & Admin)
// ==========================================

export async function createInvitation(invitation: Invitation): Promise<void> {
  const cleanSlug = formatSlug(invitation.slug);
  const path = `${COLLECTIONS.INVITATIONS}/${invitation.id}`;

  try {
    const batch = writeBatch(db);

    // Save invitation
    const invRef = doc(db, COLLECTIONS.INVITATIONS, invitation.id);
    batch.set(invRef, {
      ...invitation,
      slug: cleanSlug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deleted: false,
      versions: [
        {
          timestamp: new Date().toISOString(),
          data: invitation.data,
          note: 'Initial creation',
        },
      ],
    });

    // Reserve slug
    const slugRef = doc(db, COLLECTIONS.SLUGS, cleanSlug);
    batch.set(slugRef, {
      invitationId: invitation.id,
      ownerUid: invitation.ownerUid,
      createdAt: new Date().toISOString(),
    });

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateInvitation(
  invitation: Invitation, 
  versionNote?: string
): Promise<void> {
  const path = `${COLLECTIONS.INVITATIONS}/${invitation.id}`;
  try {
    const currentSnap = await getDoc(doc(db, COLLECTIONS.INVITATIONS, invitation.id));
    const currentData = currentSnap.exists() ? (currentSnap.data() as Invitation) : null;

    // Maintain max 3 version snapshots
    const existingVersions = currentData?.versions || [];
    const newVersion: InvitationVersion = {
      timestamp: new Date().toISOString(),
      data: invitation.data,
      note: versionNote || 'Saved updates',
      updatedBy: auth.currentUser?.email || 'User',
    };
    const updatedVersions = [newVersion, ...existingVersions].slice(0, 3);

    // If slug changed, update slug reservation
    const cleanSlug = formatSlug(invitation.slug);
    if (currentData && currentData.slug !== cleanSlug) {
      const batch = writeBatch(db);
      // Delete old slug
      batch.delete(doc(db, COLLECTIONS.SLUGS, currentData.slug));
      // Set new slug
      batch.set(doc(db, COLLECTIONS.SLUGS, cleanSlug), {
        invitationId: invitation.id,
        ownerUid: invitation.ownerUid,
        createdAt: new Date().toISOString(),
      });
      // Update invitation
      batch.update(doc(db, COLLECTIONS.INVITATIONS, invitation.id), {
        ...invitation,
        slug: cleanSlug,
        updatedAt: new Date().toISOString(),
        versions: updatedVersions,
      });
      await batch.commit();
      return;
    }

    await updateDoc(doc(db, COLLECTIONS.INVITATIONS, invitation.id), {
      ...invitation,
      slug: cleanSlug,
      updatedAt: new Date().toISOString(),
      versions: updatedVersions,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function getInvitation(id: string): Promise<Invitation | null> {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.INVITATIONS, id));
    if (docSnap.exists()) {
      return docSnap.data() as Invitation;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `${COLLECTIONS.INVITATIONS}/${id}`);
  }
}

export async function getInvitationBySlug(slug: string): Promise<Invitation | null> {
  const clean = formatSlug(slug);
  try {
    const slugSnap = await getDoc(doc(db, COLLECTIONS.SLUGS, clean));
    if (!slugSnap.exists()) {
      // Fallback query directly on invitations collection
      const q = query(
        collection(db, COLLECTIONS.INVITATIONS),
        where('slug', '==', clean),
        limit(1)
      );
      const qSnap = await getDocs(q);
      if (qSnap.empty) return null;
      return qSnap.docs[0].data() as Invitation;
    }

    const { invitationId } = slugSnap.data();
    return await getInvitation(invitationId);
  } catch (err) {
    console.warn('Error fetching invitation by slug:', err);
    return null;
  }
}

export async function listMyInvitations(ownerUid: string): Promise<Invitation[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.INVITATIONS),
      where('ownerUid', '==', ownerUid)
    );
    const snap = await getDocs(q);
    const list: Invitation[] = [];
    snap.forEach((d) => {
      const inv = d.data() as Invitation;
      if (!inv.deleted) {
        list.push(inv);
      }
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.INVITATIONS);
  }
}

export async function listAllInvitations(includeDeleted = true): Promise<Invitation[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.INVITATIONS));
    const list: Invitation[] = [];
    snap.forEach((d) => {
      const inv = d.data() as Invitation;
      if (includeDeleted || !inv.deleted) {
        list.push(inv);
      }
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, COLLECTIONS.INVITATIONS);
  }
}

export async function softDeleteInvitation(id: string, deletedBy = 'client'): Promise<void> {
  const path = `${COLLECTIONS.INVITATIONS}/${id}`;
  try {
    await updateDoc(doc(db, COLLECTIONS.INVITATIONS, id), {
      deleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function restoreInvitation(id: string): Promise<void> {
  const path = `${COLLECTIONS.INVITATIONS}/${id}`;
  try {
    await updateDoc(doc(db, COLLECTIONS.INVITATIONS, id), {
      deleted: false,
      deletedAt: null,
      deletedBy: null,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function permanentlyDeleteInvitation(id: string): Promise<void> {
  const path = `${COLLECTIONS.INVITATIONS}/${id}`;
  try {
    const inv = await getInvitation(id);

    const batch = writeBatch(db);

    // Delete slug if present
    if (inv?.slug) {
      batch.delete(doc(db, COLLECTIONS.SLUGS, inv.slug));
    }

    // Delete subcollection guests
    const guestsSnap = await getDocs(collection(db, COLLECTIONS.INVITATIONS, id, COLLECTIONS.GUESTS));
    guestsSnap.forEach((g) => {
      batch.delete(g.ref);
    });

    // Delete main invitation doc
    batch.delete(doc(db, COLLECTIONS.INVITATIONS, id));

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ==========================================
// 4. GUESTS & RSVP (Private Subcollection)
// ==========================================

export async function listGuests(invitationId: string, includeDeleted = false): Promise<Guest[]> {
  const path = `${COLLECTIONS.INVITATIONS}/${invitationId}/${COLLECTIONS.GUESTS}`;
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.INVITATIONS, invitationId, COLLECTIONS.GUESTS));
    const list: Guest[] = [];
    snap.forEach((d) => {
      const g = d.data() as Guest;
      if (includeDeleted || !g.deleted) {
        list.push(g);
      }
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function addGuest(invitationId: string, guest: Omit<Guest, 'id' | 'createdAt' | 'updatedAt' | 'deleted' | 'editToken'>): Promise<Guest> {
  const id = `gst_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const editToken = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
  const fullGuest: Guest = {
    ...guest,
    id,
    editToken,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deleted: false,
  };

  const path = `${COLLECTIONS.INVITATIONS}/${invitationId}/${COLLECTIONS.GUESTS}/${id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.INVITATIONS, invitationId, COLLECTIONS.GUESTS, id), fullGuest);
    return fullGuest;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updateGuest(invitationId: string, guest: Guest): Promise<void> {
  const path = `${COLLECTIONS.INVITATIONS}/${invitationId}/${COLLECTIONS.GUESTS}/${guest.id}`;
  try {
    await updateDoc(doc(db, COLLECTIONS.INVITATIONS, invitationId, COLLECTIONS.GUESTS, guest.id), {
      ...guest,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function softDeleteGuest(invitationId: string, guestId: string): Promise<void> {
  const path = `${COLLECTIONS.INVITATIONS}/${invitationId}/${COLLECTIONS.GUESTS}/${guestId}`;
  try {
    await updateDoc(doc(db, COLLECTIONS.INVITATIONS, invitationId, COLLECTIONS.GUESTS, guestId), {
      deleted: true,
      deletedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function submitRsvp(
  invitationId: string, 
  data: {
    name: string;
    phone: string;
    email?: string;
    attending: 'yes' | 'no' | 'maybe';
    guestCount: number;
    message?: string;
    customAnswers?: Record<string, string>;
    editToken?: string;
  }
): Promise<{ guest: Guest; isNew: boolean }> {
  const cleanPhone = data.phone.replace(/[^0-9]/g, '');
  const path = `${COLLECTIONS.INVITATIONS}/${invitationId}/${COLLECTIONS.GUESTS}`;

  // If editToken provided, update existing
  if (data.editToken) {
    const q = query(
      collection(db, COLLECTIONS.INVITATIONS, invitationId, COLLECTIONS.GUESTS),
      where('editToken', '==', data.editToken),
      limit(1)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const existing = snap.docs[0].data() as Guest;
      const updated: Guest = {
        ...existing,
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || '',
        attending: data.attending,
        guestCount: Math.max(1, data.guestCount || 1),
        message: data.message?.trim() || '',
        customAnswers: data.customAnswers || {},
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(snap.docs[0].ref, updated as any);
      return { guest: updated, isNew: false };
    }
  }

  // De-duplicate by phone number
  const qPhone = query(
    collection(db, COLLECTIONS.INVITATIONS, invitationId, COLLECTIONS.GUESTS),
    where('phone', '==', data.phone.trim()),
    limit(1)
  );
  try {
    const phoneSnap = await getDocs(qPhone);
    if (!phoneSnap.empty) {
      const existing = phoneSnap.docs[0].data() as Guest;
      const updated: Guest = {
        ...existing,
        name: data.name.trim(),
        email: data.email?.trim() || existing.email,
        attending: data.attending,
        guestCount: Math.max(1, data.guestCount || 1),
        message: data.message?.trim() || existing.message,
        customAnswers: data.customAnswers || existing.customAnswers,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(phoneSnap.docs[0].ref, updated as any);
      return { guest: updated, isNew: false };
    }
  } catch (err) {
    // Continue to create new
  }

  // Create new guest response
  const newGuest = await addGuest(invitationId, {
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email?.trim() || '',
    attending: data.attending,
    guestCount: Math.max(1, data.guestCount || 1),
    message: data.message?.trim() || '',
    customAnswers: data.customAnswers || {},
    source: 'link',
  });

  return { guest: newGuest, isNew: true };
}

export function exportGuestsToCsv(guests: Guest[]): string {
  const headers = ['Name', 'Phone', 'Email', 'Attending', 'Guest Count', 'Date', 'Message', 'Source'];
  const rows = guests.map((g) => [
    `"${(g.name || '').replace(/"/g, '""')}"`,
    `"${(g.phone || '').replace(/"/g, '""')}"`,
    `"${(g.email || '').replace(/"/g, '""')}"`,
    `"${g.attending}"`,
    g.guestCount || 1,
    `"${new Date(g.createdAt).toLocaleDateString()}"`,
    `"${(g.message || '').replace(/"/g, '""')}"`,
    `"${g.source}"`,
  ]);

  // UTF-8 BOM so Excel opens Urdu/Arabic text correctly
  return '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

// ==========================================
// 5. AUDIT & ADMIN ACTIONS LOG
// ==========================================

export async function logAdminAction(
  action: string, 
  targetId: string, 
  details?: Record<string, any>
): Promise<void> {
  try {
    const id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const logItem: AdminLogItem = {
      id,
      timestamp: new Date().toISOString(),
      adminEmail: auth.currentUser?.email || 'admin',
      action,
      targetId,
      details: details || {},
    };
    await setDoc(doc(db, COLLECTIONS.ADMIN_LOG, id), logItem);
  } catch (e) {
    console.warn('Could not record admin log:', e);
  }
}

// ==========================================
// 6. IMAGE COMPRESSION & FIREBASE STORAGE
// ==========================================

export async function compressImage(
  file: File, 
  maxWidth: number, 
  maxHeight: number, 
  quality = 0.8,
  preservePng = false
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      // If preserving PNG transparency, keep format
      const isPng = preservePng && file.type === 'image/png';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        isPng ? 'image/png' : 'image/jpeg',
        quality
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function uploadInvitationMedia(
  file: File, 
  storagePath: string, 
  onProgress?: (percent: number) => void,
  isAdminAsset = false
): Promise<string> {
  // Compress appropriately:
  // Admin assets: up to 2400px preserving transparency
  // Client photos: up to 1600px quality 0.8
  const compressedBlob = await compressImage(
    file,
    isAdminAsset ? 2400 : 1600,
    isAdminAsset ? 2400 : 1600,
    0.85,
    isAdminAsset
  );

  const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const storageRef = ref(storage, `${storagePath}/${cleanFileName}`);
  const uploadTask = uploadBytesResumable(storageRef, compressedBlob);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) onProgress(percent);
      },
      (error) => {
        console.error('Storage upload error:', error);
        reject(error);
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadUrl);
      }
    );
  });
}
