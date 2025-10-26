// Marketplace Service for Firebase operations
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  deleteDoc,
  updateDoc,
  addDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface ProductListing {
  id?: string;
  sellerId: string; // farmer's phone number
  sellerName: string;
  sellerLocation: string;
  sellerState: string;
  sellerDistrict: string;
  sellerPhone: string;
  crop: string;
  variety?: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  negotiable: boolean;
  description?: string;
  images?: string[];
  quality: 'Premium' | 'Good' | 'Average';
  harvestDate?: Date;
  expiryDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  interested: string[]; // array of buyer phone numbers
}

export interface MarketPrice {
  id?: string;
  crop: string;
  variety?: string;
  market: string;
  state: string;
  district: string;
  price: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  date: Date;
  source: 'government' | 'local' | 'estimated';
}

export interface BuyRequest {
  id?: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerLocation: string;
  crop: string;
  quantityNeeded: number;
  unit: string;
  maxPrice: number;
  urgency: 'immediate' | 'within_week' | 'within_month';
  description?: string;
  isActive: boolean;
  createdAt: Date;
  responses: string[]; // array of seller IDs who responded
}

// Create a new product listing
export const createProductListing = async (listing: Omit<ProductListing, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'interested'>) => {
  try {
    const listingsRef = collection(db, 'marketplace_listings');
    const newListing = {
      ...listing,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      interested: [],
    };
    
    const docRef = await addDoc(listingsRef, newListing);
    return { success: true, id: docRef.id, data: newListing };
  } catch (error) {
    console.error('Error creating product listing:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get all active listings
export const getActiveListings = async (filters?: {
  state?: string;
  district?: string;
  crop?: string;
  maxPrice?: number;
  limit?: number;
}) => {
  try {
    let q = query(
      collection(db, 'marketplace_listings'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );

    if (filters?.state) {
      q = query(q, where('sellerState', '==', filters.state));
    }
    
    if (filters?.district) {
      q = query(q, where('sellerDistrict', '==', filters.district));
    }
    
    if (filters?.crop) {
      q = query(q, where('crop', '==', filters.crop));
    }
    
    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }

    const querySnapshot = await getDocs(q);
    const listings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (ProductListing & { id: string })[];

    return { success: true, data: listings };
  } catch (error) {
    console.error('Error getting listings:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get listings by seller
export const getSellerListings = async (sellerId: string) => {
  try {
    const q = query(
      collection(db, 'marketplace_listings'),
      where('sellerId', '==', sellerId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const listings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (ProductListing & { id: string })[];

    return { success: true, data: listings };
  } catch (error) {
    console.error('Error getting seller listings:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Update listing
export const updateProductListing = async (listingId: string, updates: Partial<ProductListing>) => {
  try {
    const listingRef = doc(db, 'marketplace_listings', listingId);
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    
    await updateDoc(listingRef, updateData);
    return { success: true };
  } catch (error) {
    console.error('Error updating listing:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Delete listing
export const deleteProductListing = async (listingId: string) => {
  try {
    await deleteDoc(doc(db, 'marketplace_listings', listingId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting listing:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Mark listing as inactive
export const deactivateListing = async (listingId: string) => {
  try {
    const listingRef = doc(db, 'marketplace_listings', listingId);
    await updateDoc(listingRef, {
      isActive: false,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error deactivating listing:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Express interest in a listing
export const expressInterest = async (listingId: string, buyerId: string) => {
  try {
    const listingRef = doc(db, 'marketplace_listings', listingId);
    // This would need to be implemented with array union
    // For now, we'll use a simple update approach
    const listing = await getDocs(query(collection(db, 'marketplace_listings'), where('__name__', '==', listingId)));
    if (!listing.empty) {
      const listingData = listing.docs[0].data() as ProductListing;
      const currentInterested = listingData.interested || [];
      
      if (!currentInterested.includes(buyerId)) {
        await updateDoc(listingRef, {
          interested: [...currentInterested, buyerId],
          updatedAt: new Date()
        });
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error expressing interest:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Increment views
export const incrementViews = async (listingId: string) => {
  try {
    const listingRef = doc(db, 'marketplace_listings', listingId);
    const listing = await getDocs(query(collection(db, 'marketplace_listings'), where('__name__', '==', listingId)));
    
    if (!listing.empty) {
      const listingData = listing.docs[0].data() as ProductListing;
      await updateDoc(listingRef, {
        views: (listingData.views || 0) + 1
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error incrementing views:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Create buy request
export const createBuyRequest = async (request: Omit<BuyRequest, 'id' | 'createdAt' | 'responses'>) => {
  try {
    const requestsRef = collection(db, 'buy_requests');
    const newRequest = {
      ...request,
      createdAt: new Date(),
      responses: [],
    };
    
    const docRef = await addDoc(requestsRef, newRequest);
    return { success: true, id: docRef.id, data: newRequest };
  } catch (error) {
    console.error('Error creating buy request:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get buy requests by location/crop
export const getBuyRequests = async (filters?: {
  crop?: string;
  location?: string;
  isActive?: boolean;
}) => {
  try {
    let q = query(
      collection(db, 'buy_requests'),
      orderBy('createdAt', 'desc')
    );

    if (filters?.isActive !== undefined) {
      q = query(q, where('isActive', '==', filters.isActive));
    }
    
    if (filters?.crop) {
      q = query(q, where('crop', '==', filters.crop));
    }

    const querySnapshot = await getDocs(q);
    const requests = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (BuyRequest & { id: string })[];

    return { success: true, data: requests };
  } catch (error) {
    console.error('Error getting buy requests:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Save market prices (for caching government API data)
export const saveMarketPrices = async (prices: Omit<MarketPrice, 'id'>[]) => {
  try {
    const batch = prices.map(async (price) => {
      const priceRef = collection(db, 'market_prices');
      return await addDoc(priceRef, price);
    });
    
    await Promise.all(batch);
    return { success: true };
  } catch (error) {
    console.error('Error saving market prices:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get latest market prices
export const getMarketPrices = async (filters?: {
  state?: string;
  district?: string;
  crop?: string;
  source?: string;
}) => {
  try {
    let q = query(
      collection(db, 'market_prices'),
      orderBy('date', 'desc'),
      limit(50)
    );

    if (filters?.state) {
      q = query(q, where('state', '==', filters.state));
    }
    
    if (filters?.crop) {
      q = query(q, where('crop', '==', filters.crop));
    }
    
    if (filters?.source) {
      q = query(q, where('source', '==', filters.source));
    }

    const querySnapshot = await getDocs(q);
    const prices = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (MarketPrice & { id: string })[];

    return { success: true, data: prices };
  } catch (error) {
    console.error('Error getting market prices:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Real-time listener for listings (useful for live updates)
export const subscribeToListings = (
  callback: (listings: (ProductListing & { id: string })[]) => void,
  filters?: { state?: string; district?: string; crop?: string }
) => {
  let q = query(
    collection(db, 'marketplace_listings'),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  if (filters?.state) {
    q = query(q, where('sellerState', '==', filters.state));
  }

  return onSnapshot(q, (querySnapshot) => {
    const listings = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (ProductListing & { id: string })[];
    
    callback(listings);
  });
};