import { db } from './firebaseConfig';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  doc,
  Timestamp,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';

// Interfaces
export interface Scheme {
  id?: string;
  title: string;
  description: string;
  eligibility: string[];
  benefits: string;
  documents: string[];
  deadline: string;
  category: string;
  icon: string;
  status: 'active' | 'coming_soon' | 'expired';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SchemeApplication {
  id?: string;
  schemeId: string;
  schemeName: string;
  userId: string; // farmer's phone number
  userName: string;
  userPhone: string;
  userState: string;
  userDistrict: string;
  
  // Application form data
  farmerName: string;
  fatherName?: string;
  aadharNumber: string;
  mobileNumber: string;
  address: string;
  landHolding?: string;
  cropType?: string;
  bankAccount?: string;
  ifscCode?: string;
  
  // Application status
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'documents_required';
  remarks?: string;
  applicationDate: Date;
  lastUpdated: Date;
  
  // Admin fields
  reviewedBy?: string;
  reviewedAt?: Date;
}

// Get all active schemes
export const getActiveSchemes = async (category?: string) => {
  try {
    const schemesRef = collection(db, 'government_schemes');
    let q;
    
    if (category && category !== 'all') {
      q = query(
        schemesRef,
        where('status', '==', 'active'),
        where('category', '==', category)
      );
    } else {
      q = query(
        schemesRef,
        where('status', '==', 'active')
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as (Scheme & { id: string })[];
  } catch (error) {
    console.error('Error getting schemes:', error);
    return [];
  }
};

// Submit scheme application
export const submitSchemeApplication = async (
  application: Omit<SchemeApplication, 'id' | 'applicationDate' | 'lastUpdated'>
) => {
  try {
    const applicationsRef = collection(db, 'scheme_applications');
    
    // Check if user already applied for this scheme
    const existingQuery = query(
      applicationsRef,
      where('schemeId', '==', application.schemeId),
      where('userId', '==', application.userId)
    );
    
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      return {
        success: false,
        error: 'You have already applied for this scheme. Check "My Applications" tab.',
      };
    }
    
    // Create new application
    const newApplication = {
      ...application,
      status: 'pending',
      applicationDate: serverTimestamp(),
      lastUpdated: serverTimestamp(),
    };
    
    const docRef = await addDoc(applicationsRef, newApplication);
    
    return {
      success: true,
      id: docRef.id,
      message: 'Application submitted successfully!',
    };
  } catch (error) {
    console.error('Error submitting application:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit application',
    };
  }
};

// Get user's applications
export const getUserApplications = async (userId: string) => {
  try {
    const applicationsRef = collection(db, 'scheme_applications');
    const q = query(
      applicationsRef,
      where('userId', '==', userId),
      orderBy('applicationDate', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      applicationDate: doc.data().applicationDate?.toDate(),
      lastUpdated: doc.data().lastUpdated?.toDate(),
      reviewedAt: doc.data().reviewedAt?.toDate(),
    })) as (SchemeApplication & { id: string })[];
  } catch (error) {
    console.error('Error getting user applications:', error);
    return [];
  }
};

// Get single application details
export const getApplicationById = async (applicationId: string) => {
  try {
    const docRef = doc(db, 'scheme_applications', applicationId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        applicationDate: docSnap.data().applicationDate?.toDate(),
        lastUpdated: docSnap.data().lastUpdated?.toDate(),
        reviewedAt: docSnap.data().reviewedAt?.toDate(),
      } as SchemeApplication & { id: string };
    }
    return null;
  } catch (error) {
    console.error('Error getting application:', error);
    return null;
  }
};

// Update application status (for admin use)
export const updateApplicationStatus = async (
  applicationId: string,
  status: SchemeApplication['status'],
  remarks?: string,
  reviewedBy?: string
) => {
  try {
    const docRef = doc(db, 'scheme_applications', applicationId);
    
    await updateDoc(docRef, {
      status,
      remarks: remarks || '',
      lastUpdated: serverTimestamp(),
      reviewedBy: reviewedBy || '',
      reviewedAt: serverTimestamp(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating application:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update application',
    };
  }
};

// Check if user is eligible for a scheme based on their profile
export const checkEligibility = (
  scheme: Scheme,
  userProfile: {
    landHolding?: number; // in hectares
    category?: 'general' | 'sc' | 'st' | 'obc';
    hasAadhar: boolean;
    hasBankAccount: boolean;
    isLandOwner: boolean;
  }
): { eligible: boolean; reasons: string[] } => {
  const reasons: string[] = [];
  
  // Basic document requirements
  if (!userProfile.hasAadhar) {
    reasons.push('❌ Aadhar card is required');
  }
  
  // Scheme-specific checks based on title keywords
  const titleLower = scheme.title.toLowerCase();
  
  // Land holding checks
  if (titleLower.includes('small') || titleLower.includes('marginal')) {
    if (userProfile.landHolding && userProfile.landHolding > 2) {
      reasons.push('❌ Land holding exceeds 2 hectares limit for small/marginal farmers');
    }
  }
  
  // PM-KISAN specific
  if (titleLower.includes('pm-kisan') || titleLower.includes('pm kisan')) {
    if (userProfile.landHolding && userProfile.landHolding > 2) {
      reasons.push('❌ PM-KISAN is for farmers with up to 2 hectares only');
    }
    if (!userProfile.hasAadhar) {
      reasons.push('❌ Aadhar card mandatory for PM-KISAN');
    }
    if (!userProfile.hasBankAccount) {
      reasons.push('❌ Bank account mandatory for PM-KISAN direct benefit transfer');
    }
  }
  
  // Crop insurance check
  if (titleLower.includes('fasal bima') || titleLower.includes('crop insurance')) {
    if (!userProfile.isLandOwner) {
      reasons.push('⚠️ Tenant farmers must provide tenancy agreement for crop insurance');
    }
  }
  
  // Credit/Loan schemes
  if (titleLower.includes('credit') || titleLower.includes('loan') || titleLower.includes('kcc')) {
    if (!userProfile.hasBankAccount) {
      reasons.push('❌ Bank account is mandatory for credit schemes');
    }
  }
  
  // General document checks
  if (scheme.documents.some(doc => doc.toLowerCase().includes('bank'))) {
    if (!userProfile.hasBankAccount) {
      reasons.push('❌ Bank account details required for this scheme');
    }
  }
  
  if (scheme.documents.some(doc => doc.toLowerCase().includes('land'))) {
    if (!userProfile.isLandOwner) {
      reasons.push('⚠️ Land ownership or tenancy documents required');
    }
  }
  
  // Priority categories
  if (titleLower.includes('sc') || titleLower.includes('st')) {
    if (userProfile.category !== 'sc' && userProfile.category !== 'st') {
      reasons.push('⚠️ This scheme gives priority to SC/ST category farmers');
    }
  }
  
  return {
    eligible: reasons.length === 0,
    reasons,
  };
};

// Initialize schemes collection with mock data (run once)
export const initializeSchemesCollection = async (schemes: Scheme[]) => {
  try {
    const schemesRef = collection(db, 'government_schemes');
    
    // Check if schemes already exist
    const snapshot = await getDocs(schemesRef);
    if (!snapshot.empty) {
      console.log('Schemes already initialized');
      return { success: true, message: 'Schemes already exist' };
    }
    
    // Add all schemes
    const promises = schemes.map(scheme => 
      addDoc(schemesRef, {
        ...scheme,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
    
    await Promise.all(promises);
    
    return {
      success: true,
      message: `${schemes.length} schemes initialized successfully`,
    };
  } catch (error) {
    console.error('Error initializing schemes:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize schemes',
    };
  }
};
