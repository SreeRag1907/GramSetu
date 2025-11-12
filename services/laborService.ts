// Labor Service for Firebase operations
import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  deleteDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface WorkerProfile {
  id?: string;
  workerId: string; // worker's phone number
  workerName: string;
  workerPhone: string;
  workerLocation: string;
  workerState: string;
  workerDistrict: string;
  skills: string[];
  experience: string; // '0-1', '1-3', '3-5', '5+'
  dailyWage: number;
  availability: 'available' | 'busy' | 'seasonal';
  preferredTasks: string[];
  description?: string;
  profileImage?: string;
  rating: number;
  completedJobs: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  contactedBy: string[]; // array of farmer IDs who contacted
}

export interface JobListing {
  id?: string;
  farmerId: string; // farmer's phone number
  farmerName: string;
  farmerPhone: string;
  farmerLocation: string;
  farmerState: string;
  farmerDistrict: string;
  jobTitle: string;
  taskType: string;
  description: string;
  skillsRequired: string[];
  workersNeeded: number;
  dailyWage: number;
  duration: string; // 'daily', 'weekly', 'monthly', 'seasonal'
  startDate: Date;
  endDate?: Date;
  workingHours: string;
  accommodationProvided: boolean;
  mealsProvided: boolean;
  transportProvided: boolean;
  urgency: 'immediate' | 'within_week' | 'planned';
  isActive: boolean;
  applicants: string[]; // array of worker IDs who applied
  createdAt: Date;
  updatedAt: Date;
  views: number;
}

// Worker Profile Operations

// Create worker profile
export const createWorkerProfile = async (profile: Omit<WorkerProfile, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'contactedBy' | 'rating' | 'completedJobs'>) => {
  try {
    const profilesRef = collection(db, 'worker_profiles');
    
    // Check if worker already has a profile
    const existingQuery = query(
      profilesRef,
      where('workerId', '==', profile.workerId)
    );
    const existingDocs = await getDocs(existingQuery);
    
    if (!existingDocs.empty) {
      return { 
        success: false, 
        error: 'Worker profile already exists. Please update your existing profile.' 
      };
    }
    
    const newProfile = {
      ...profile,
      rating: 0,
      completedJobs: 0,
      views: 0,
      contactedBy: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const docRef = await addDoc(profilesRef, newProfile);
    return { success: true, id: docRef.id, data: newProfile };
  } catch (error) {
    console.error('Error creating worker profile:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get all active worker profiles
export const getActiveWorkers = async (filters?: {
  state?: string;
  district?: string;
  skills?: string[];
  experience?: string;
  maxWage?: number;
  availability?: string;
  limit?: number;
}) => {
  try {
    // Simple query with only isActive, rating, and createdAt (matches our index)
    let q = query(
      collection(db, 'worker_profiles'),
      where('isActive', '==', true),
      orderBy('rating', 'desc'),
      orderBy('createdAt', 'desc')
    );
    
    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }

    const querySnapshot = await getDocs(q);
    let workers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (WorkerProfile & { id: string })[];

    // Client-side filtering for all other filters
    if (filters?.state) {
      workers = workers.filter(w => w.workerState === filters.state);
    }
    
    if (filters?.district) {
      workers = workers.filter(w => w.workerDistrict === filters.district);
    }
    
    if (filters?.availability) {
      workers = workers.filter(w => w.availability === filters.availability);
    }
    
    if (filters?.experience) {
      workers = workers.filter(w => w.experience === filters.experience);
    }
    
    if (filters?.maxWage) {
      workers = workers.filter(w => w.dailyWage <= filters.maxWage!);
    }

    if (filters?.skills && filters.skills.length > 0) {
      workers = workers.filter(w => 
        filters.skills!.some(skill => w.skills.includes(skill))
      );
    }

    return { success: true, data: workers };
  } catch (error) {
    console.error('Error getting workers:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get worker profile by ID
export const getWorkerProfile = async (workerId: string) => {
  try {
    const q = query(
      collection(db, 'worker_profiles'),
      where('workerId', '==', workerId),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return { success: false, error: 'Worker profile not found' };
    }

    const workerData = {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data()
    } as WorkerProfile & { id: string };

    return { success: true, data: workerData };
  } catch (error) {
    console.error('Error getting worker profile:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Update worker profile
export const updateWorkerProfile = async (profileId: string, updates: Partial<WorkerProfile>) => {
  try {
    const profileRef = doc(db, 'worker_profiles', profileId);
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    
    await updateDoc(profileRef, updateData);
    return { success: true };
  } catch (error) {
    console.error('Error updating worker profile:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Delete worker profile
export const deleteWorkerProfile = async (profileId: string) => {
  try {
    await deleteDoc(doc(db, 'worker_profiles', profileId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting worker profile:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Increment worker profile views
export const incrementWorkerViews = async (profileId: string) => {
  try {
    const profileRef = doc(db, 'worker_profiles', profileId);
    await updateDoc(profileRef, {
      views: increment(1)
    });
    return { success: true };
  } catch (error) {
    console.error('Error incrementing views:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Mark that a farmer contacted a worker
export const markWorkerContacted = async (profileId: string, farmerId: string) => {
  try {
    const profileRef = doc(db, 'worker_profiles', profileId);
    await updateDoc(profileRef, {
      contactedBy: arrayUnion(farmerId),
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error marking worker as contacted:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Job Listing Operations

// Create job listing
export const createJobListing = async (job: Omit<JobListing, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'applicants'>) => {
  try {
    const jobsRef = collection(db, 'job_listings');
    const newJob = {
      ...job,
      applicants: [],
      views: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const docRef = await addDoc(jobsRef, newJob);
    return { success: true, id: docRef.id, data: newJob };
  } catch (error) {
    console.error('Error creating job listing:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get all active job listings
export const getActiveJobs = async (filters?: {
  state?: string;
  district?: string;
  taskType?: string;
  minWage?: number;
  urgency?: string;
  limit?: number;
}) => {
  try {
    // Simple query with only isActive and createdAt (matches our index)
    let q = query(
      collection(db, 'job_listings'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }

    const querySnapshot = await getDocs(q);
    let jobs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (JobListing & { id: string })[];

    // Client-side filtering for all other filters
    if (filters?.state) {
      jobs = jobs.filter(j => j.farmerState === filters.state);
    }
    
    if (filters?.district) {
      jobs = jobs.filter(j => j.farmerDistrict === filters.district);
    }
    
    if (filters?.taskType) {
      jobs = jobs.filter(j => j.taskType === filters.taskType);
    }
    
    if (filters?.urgency) {
      jobs = jobs.filter(j => j.urgency === filters.urgency);
    }
    
    if (filters?.minWage) {
      jobs = jobs.filter(j => j.dailyWage >= filters.minWage!);
    }

    return { success: true, data: jobs };
  } catch (error) {
    console.error('Error getting jobs:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get job listings by farmer
export const getFarmerJobs = async (farmerId: string) => {
  try {
    // Simple query without orderBy to avoid needing index
    const q = query(
      collection(db, 'job_listings'),
      where('farmerId', '==', farmerId)
    );

    const querySnapshot = await getDocs(q);
    let jobs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (JobListing & { id: string })[];

    // Sort by createdAt on client side
    jobs = jobs.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    return { success: true, data: jobs };
  } catch (error) {
    console.error('Error getting farmer jobs:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Update job listing
export const updateJobListing = async (jobId: string, updates: Partial<JobListing>) => {
  try {
    const jobRef = doc(db, 'job_listings', jobId);
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    
    await updateDoc(jobRef, updateData);
    return { success: true };
  } catch (error) {
    console.error('Error updating job:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Delete job listing
export const deleteJobListing = async (jobId: string) => {
  try {
    await deleteDoc(doc(db, 'job_listings', jobId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting job:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Deactivate job (mark as filled/closed)
export const deactivateJob = async (jobId: string) => {
  try {
    const jobRef = doc(db, 'job_listings', jobId);
    await updateDoc(jobRef, {
      isActive: false,
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error deactivating job:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Apply for a job
export const applyForJob = async (jobId: string, workerId: string) => {
  try {
    const jobRef = doc(db, 'job_listings', jobId);
    await updateDoc(jobRef, {
      applicants: arrayUnion(workerId),
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error applying for job:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Withdraw job application
export const withdrawApplication = async (jobId: string, workerId: string) => {
  try {
    const jobRef = doc(db, 'job_listings', jobId);
    await updateDoc(jobRef, {
      applicants: arrayRemove(workerId),
      updatedAt: new Date()
    });
    return { success: true };
  } catch (error) {
    console.error('Error withdrawing application:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Increment job views
export const incrementJobViews = async (jobId: string) => {
  try {
    const jobRef = doc(db, 'job_listings', jobId);
    await updateDoc(jobRef, {
      views: increment(1)
    });
    return { success: true };
  } catch (error) {
    console.error('Error incrementing job views:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Get jobs a worker has applied to
export const getWorkerApplications = async (workerId: string) => {
  try {
    // Simple query without orderBy to avoid needing index
    const q = query(
      collection(db, 'job_listings'),
      where('applicants', 'array-contains', workerId)
    );

    const querySnapshot = await getDocs(q);
    let jobs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (JobListing & { id: string })[];

    // Sort by createdAt on client side
    jobs = jobs.sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    return { success: true, data: jobs };
  } catch (error) {
    console.error('Error getting worker applications:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Real-time listener for job listings
export const subscribeToJobs = (
  callback: (jobs: (JobListing & { id: string })[]) => void,
  filters?: { state?: string; district?: string; taskType?: string }
) => {
  let q = query(
    collection(db, 'job_listings'),
    where('isActive', '==', true),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  if (filters?.state) {
    q = query(q, where('farmerState', '==', filters.state));
  }

  if (filters?.taskType) {
    q = query(q, where('taskType', '==', filters.taskType));
  }

  return onSnapshot(q, (querySnapshot) => {
    const jobs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (JobListing & { id: string })[];
    
    callback(jobs);
  });
};

// Real-time listener for worker profiles
export const subscribeToWorkers = (
  callback: (workers: (WorkerProfile & { id: string })[]) => void,
  filters?: { state?: string; district?: string; availability?: string }
) => {
  let q = query(
    collection(db, 'worker_profiles'),
    where('isActive', '==', true),
    orderBy('rating', 'desc'),
    limit(20)
  );

  if (filters?.state) {
    q = query(q, where('workerState', '==', filters.state));
  }

  if (filters?.availability) {
    q = query(q, where('availability', '==', filters.availability));
  }

  return onSnapshot(q, (querySnapshot) => {
    const workers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as (WorkerProfile & { id: string })[];
    
    callback(workers);
  });
};
