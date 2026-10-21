/**
 * Cloud Firestore Service for MIT Invitations
 * Provides real-time synchronization, cloud persistence, and Firebase Storage uploads.
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../config/firebase';
import { 
  Product, 
  Category, 
  PageSection, 
  Review, 
  FAQItem, 
  Order, 
  DesignSettings, 
  StoreSettings 
} from '../types';
import * as dataService from './dataService';

// Collection Names
export const COLLECTIONS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  SECTIONS: 'sections',
  REVIEWS: 'reviews',
  FAQS: 'faqs',
  ORDERS: 'orders',
  SETTINGS: 'settings',
  ADMINS: 'admins',
};

// ==========================================
// 1. REAL-TIME SUBSCRIPTIONS
// ==========================================

export function subscribeProducts(
  callback: (products: Product[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const q = query(collection(db, COLLECTIONS.PRODUCTS), orderBy('order', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Product);
      });
      callback(items);
    },
    (error) => {
      console.warn('Realtime products listener error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.PRODUCTS);
    }
  );
}

export function subscribeCategories(
  callback: (categories: Category[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const q = query(collection(db, COLLECTIONS.CATEGORIES), orderBy('order', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Category[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Category);
      });
      callback(items);
    },
    (error) => {
      console.warn('Realtime categories listener error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.CATEGORIES);
    }
  );
}

export function subscribeSections(
  callback: (sections: PageSection[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const q = query(collection(db, COLLECTIONS.SECTIONS), orderBy('order', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: PageSection[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as PageSection);
      });
      callback(items);
    },
    (error) => {
      console.warn('Realtime sections listener error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.SECTIONS);
    }
  );
}

export function subscribeReviews(
  callback: (reviews: Review[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const q = collection(db, COLLECTIONS.REVIEWS);
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Review[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Review);
      });
      callback(items);
    },
    (error) => {
      console.warn('Realtime reviews listener error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.REVIEWS);
    }
  );
}

export function subscribeFAQs(
  callback: (faqs: FAQItem[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const q = query(collection(db, COLLECTIONS.FAQS), orderBy('order', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: FAQItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as FAQItem);
      });
      callback(items);
    },
    (error) => {
      console.warn('Realtime faqs listener error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, COLLECTIONS.FAQS);
    }
  );
}

export function subscribeOrders(
  callback: (orders: Order[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const q = collection(db, COLLECTIONS.ORDERS);
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Order[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Order);
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(items);
    },
    (error) => {
      console.warn('Realtime orders listener error (requires admin auth):', error);
      if (onError) onError(error);
    }
  );
}

export function subscribeDesignSettings(
  callback: (settings: DesignSettings | null) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const docRef = doc(db, COLLECTIONS.SETTINGS, 'design');
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as DesignSettings);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.warn('Realtime design settings listener error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, 'settings/design');
    }
  );
}

export function subscribeStoreSettings(
  callback: (settings: StoreSettings | null) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const docRef = doc(db, COLLECTIONS.SETTINGS, 'store');
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as StoreSettings);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.warn('Realtime store settings listener error:', error);
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, 'settings/store');
    }
  );
}

// ==========================================
// 2. CLOUD CRUD OPERATIONS
// ==========================================

export async function saveProductToFirestore(product: Product): Promise<void> {
  const path = `${COLLECTIONS.PRODUCTS}/${product.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.PRODUCTS, product.id), {
      ...product,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const path = `${COLLECTIONS.PRODUCTS}/${productId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveCategoryToFirestore(category: Category): Promise<void> {
  const path = `${COLLECTIONS.CATEGORIES}/${category.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.CATEGORIES, category.id), category);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCategoryFromFirestore(categoryId: string): Promise<void> {
  const path = `${COLLECTIONS.CATEGORIES}/${categoryId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.CATEGORIES, categoryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveSectionToFirestore(section: PageSection): Promise<void> {
  const path = `${COLLECTIONS.SECTIONS}/${section.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.SECTIONS, section.id), section);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSectionFromFirestore(sectionId: string): Promise<void> {
  const path = `${COLLECTIONS.SECTIONS}/${sectionId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.SECTIONS, sectionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveReviewToFirestore(review: Review): Promise<void> {
  const path = `${COLLECTIONS.REVIEWS}/${review.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.REVIEWS, review.id), review);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteReviewFromFirestore(reviewId: string): Promise<void> {
  const path = `${COLLECTIONS.REVIEWS}/${reviewId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.REVIEWS, reviewId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveFAQToFirestore(faq: FAQItem): Promise<void> {
  const path = `${COLLECTIONS.FAQS}/${faq.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.FAQS, faq.id), faq);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteFAQFromFirestore(faqId: string): Promise<void> {
  const path = `${COLLECTIONS.FAQS}/${faqId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.FAQS, faqId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveOrderToFirestore(order: Order): Promise<void> {
  const path = `${COLLECTIONS.ORDERS}/${order.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.ORDERS, order.id), order);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateOrderStatusInFirestore(orderId: string, status: Order['status']): Promise<void> {
  const path = `${COLLECTIONS.ORDERS}/${orderId}`;
  try {
    await updateDoc(doc(db, COLLECTIONS.ORDERS, orderId), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  const path = `${COLLECTIONS.ORDERS}/${orderId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.ORDERS, orderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveDesignSettingsToFirestore(settings: DesignSettings): Promise<void> {
  const path = 'settings/design';
  try {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'design'), settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveStoreSettingsToFirestore(settings: StoreSettings): Promise<void> {
  const path = 'settings/store';
  try {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'store'), settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ==========================================
// 3. FIREBASE STORAGE MEDIA UPLOAD
// ==========================================

export async function uploadMediaToFirebaseStorage(
  file: File | Blob,
  path: string,
  fileName?: string
): Promise<string> {
  const safeName = fileName || `${Date.now()}-${(file as File).name || 'asset'}`.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageRef = ref(storage, `${path}/${safeName}`);
  
  await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}

// ==========================================
// 4. SEED & INITIAL DATA MIGRATION
// ==========================================

/**
 * Checks if Firestore has been seeded. If not, seeds with existing localStorage/default data.
 * Can be triggered automatically or from the Admin Studio.
 */
export async function seedFirestoreIfEmpty(): Promise<{ seeded: boolean; count: number }> {
  try {
    const productsSnap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    if (!productsSnap.empty) {
      return { seeded: false, count: productsSnap.size };
    }

    // Seed defaults & existing local storage data
    const batch = writeBatch(db);
    let count = 0;

    // 1. Products
    const localProducts = dataService.getProducts();
    for (const prod of localProducts) {
      const docRef = doc(db, COLLECTIONS.PRODUCTS, prod.id);
      batch.set(docRef, prod);
      count++;
    }

    // 2. Categories
    const localCategories = dataService.getCategories();
    for (const cat of localCategories) {
      const docRef = doc(db, COLLECTIONS.CATEGORIES, cat.id);
      batch.set(docRef, cat);
      count++;
    }

    // 3. Sections
    const localSections = dataService.getPageSections();
    for (const sec of localSections) {
      const docRef = doc(db, COLLECTIONS.SECTIONS, sec.id);
      batch.set(docRef, sec);
      count++;
    }

    // 4. Reviews
    const localReviews = dataService.getReviews();
    for (const rev of localReviews) {
      const docRef = doc(db, COLLECTIONS.REVIEWS, rev.id);
      batch.set(docRef, rev);
      count++;
    }

    // 5. FAQs
    const localFAQs = dataService.getFAQs();
    for (const faq of localFAQs) {
      const docRef = doc(db, COLLECTIONS.FAQS, faq.id);
      batch.set(docRef, faq);
      count++;
    }

    // 6. Settings
    const design = dataService.getDesignSettings();
    batch.set(doc(db, COLLECTIONS.SETTINGS, 'design'), design);
    count++;

    const store = dataService.getStoreSettings();
    batch.set(doc(db, COLLECTIONS.SETTINGS, 'store'), store);
    count++;

    await batch.commit();
    console.log(`Cloud Firestore successfully seeded with ${count} items.`);
    return { seeded: true, count };
  } catch (error) {
    console.warn('Could not seed Firestore (might be unauthenticated or offline):', error);
    return { seeded: false, count: 0 };
  }
}
