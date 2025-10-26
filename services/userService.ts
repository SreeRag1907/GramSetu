// User Service for Firebase operations
import { collection, doc, setDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface UserData {
  phoneNumber: string;
  name: string;
  state: string;
  district: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create a new user in Firestore
export const createUser = async (userData: Omit<UserData, 'createdAt' | 'updatedAt'>) => {
  try {
    const userRef = doc(db, 'users', userData.phoneNumber);
    const userDoc = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(userRef, userDoc);
    return { success: true, data: userDoc };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get user data by phone number
export const getUserByPhone = async (phoneNumber: string) => {
  try {
    const userRef = doc(db, 'users', phoneNumber);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() as UserData };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('Error getting user:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Update user data
export const updateUser = async (phoneNumber: string, updates: Partial<UserData>) => {
  try {
    const userRef = doc(db, 'users', phoneNumber);
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    
    await setDoc(userRef, updateData, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Check if user exists
export const checkUserExists = async (phoneNumber: string) => {
  try {
    const userRef = doc(db, 'users', phoneNumber);
    const userDoc = await getDoc(userRef);
    return userDoc.exists();
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
};

// Get all users by state (for analytics)
export const getUsersByState = async (state: string) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('state', '==', state));
    const querySnapshot = await getDocs(q);
    
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (UserData & { id: string })[];
    
    return { success: true, data: users };
  } catch (error) {
    console.error('Error getting users by state:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};