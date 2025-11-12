// Labor Cache Service for session persistence
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JobListing, WorkerProfile } from './laborService';

const CACHE_KEYS = {
  ACTIVE_JOBS: 'labor_cache_active_jobs',
  ACTIVE_WORKERS: 'labor_cache_active_workers',
  MY_JOBS: 'labor_cache_my_jobs',
  MY_PROFILE: 'labor_cache_my_profile',
  MY_APPLICATIONS: 'labor_cache_my_applications',
  TIMESTAMP: 'labor_cache_timestamp',
};

const CACHE_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes

export class LaborCache {
  // Save active jobs to cache
  static async saveActiveJobs(jobs: (JobListing & { id: string })[]) {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.ACTIVE_JOBS, JSON.stringify(jobs));
      await AsyncStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.error('Error saving jobs to cache:', error);
    }
  }

  // Get active jobs from cache
  static async getActiveJobs(): Promise<(JobListing & { id: string })[] | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.ACTIVE_JOBS);
      const timestamp = await AsyncStorage.getItem(CACHE_KEYS.TIMESTAMP);
      
      if (!cached || !timestamp) return null;
      
      const age = Date.now() - parseInt(timestamp);
      if (age > CACHE_EXPIRATION_MS) {
        await this.clearActiveJobs();
        return null;
      }
      
      return JSON.parse(cached);
    } catch (error) {
      console.error('Error getting jobs from cache:', error);
      return null;
    }
  }

  // Save active workers to cache
  static async saveActiveWorkers(workers: (WorkerProfile & { id: string })[]) {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.ACTIVE_WORKERS, JSON.stringify(workers));
      await AsyncStorage.setItem(CACHE_KEYS.TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.error('Error saving workers to cache:', error);
    }
  }

  // Get active workers from cache
  static async getActiveWorkers(): Promise<(WorkerProfile & { id: string })[] | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.ACTIVE_WORKERS);
      const timestamp = await AsyncStorage.getItem(CACHE_KEYS.TIMESTAMP);
      
      if (!cached || !timestamp) return null;
      
      const age = Date.now() - parseInt(timestamp);
      if (age > CACHE_EXPIRATION_MS) {
        await this.clearActiveWorkers();
        return null;
      }
      
      return JSON.parse(cached);
    } catch (error) {
      console.error('Error getting workers from cache:', error);
      return null;
    }
  }

  // Save my jobs to cache (jobs posted by current user)
  static async saveMyJobs(jobs: (JobListing & { id: string })[]) {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.MY_JOBS, JSON.stringify(jobs));
    } catch (error) {
      console.error('Error saving my jobs to cache:', error);
    }
  }

  // Get my jobs from cache
  static async getMyJobs(): Promise<(JobListing & { id: string })[] | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.MY_JOBS);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting my jobs from cache:', error);
      return null;
    }
  }

  // Save my worker profile to cache
  static async saveMyProfile(profile: (WorkerProfile & { id: string }) | null) {
    try {
      if (profile) {
        await AsyncStorage.setItem(CACHE_KEYS.MY_PROFILE, JSON.stringify(profile));
      } else {
        await AsyncStorage.removeItem(CACHE_KEYS.MY_PROFILE);
      }
    } catch (error) {
      console.error('Error saving my profile to cache:', error);
    }
  }

  // Get my worker profile from cache
  static async getMyProfile(): Promise<(WorkerProfile & { id: string }) | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.MY_PROFILE);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting my profile from cache:', error);
      return null;
    }
  }

  // Save my applications to cache
  static async saveMyApplications(jobs: (JobListing & { id: string })[]) {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.MY_APPLICATIONS, JSON.stringify(jobs));
    } catch (error) {
      console.error('Error saving my applications to cache:', error);
    }
  }

  // Get my applications from cache
  static async getMyApplications(): Promise<(JobListing & { id: string })[] | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.MY_APPLICATIONS);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting my applications from cache:', error);
      return null;
    }
  }

  // Clear active jobs cache
  static async clearActiveJobs() {
    try {
      await AsyncStorage.removeItem(CACHE_KEYS.ACTIVE_JOBS);
    } catch (error) {
      console.error('Error clearing active jobs cache:', error);
    }
  }

  // Clear active workers cache
  static async clearActiveWorkers() {
    try {
      await AsyncStorage.removeItem(CACHE_KEYS.ACTIVE_WORKERS);
    } catch (error) {
      console.error('Error clearing active workers cache:', error);
    }
  }

  // Clear my jobs cache
  static async clearMyJobs() {
    try {
      await AsyncStorage.removeItem(CACHE_KEYS.MY_JOBS);
    } catch (error) {
      console.error('Error clearing my jobs cache:', error);
    }
  }

  // Clear my profile cache
  static async clearMyProfile() {
    try {
      await AsyncStorage.removeItem(CACHE_KEYS.MY_PROFILE);
    } catch (error) {
      console.error('Error clearing my profile cache:', error);
    }
  }

  // Clear my applications cache
  static async clearMyApplications() {
    try {
      await AsyncStorage.removeItem(CACHE_KEYS.MY_APPLICATIONS);
    } catch (error) {
      console.error('Error clearing my applications cache:', error);
    }
  }

  // Clear all labor cache
  static async clearAll() {
    try {
      await AsyncStorage.multiRemove([
        CACHE_KEYS.ACTIVE_JOBS,
        CACHE_KEYS.ACTIVE_WORKERS,
        CACHE_KEYS.MY_JOBS,
        CACHE_KEYS.MY_PROFILE,
        CACHE_KEYS.MY_APPLICATIONS,
        CACHE_KEYS.TIMESTAMP,
      ]);
    } catch (error) {
      console.error('Error clearing all labor cache:', error);
    }
  }

  // Check if cache is expired
  static async isCacheExpired(): Promise<boolean> {
    try {
      const timestamp = await AsyncStorage.getItem(CACHE_KEYS.TIMESTAMP);
      if (!timestamp) return true;
      
      const age = Date.now() - parseInt(timestamp);
      return age > CACHE_EXPIRATION_MS;
    } catch (error) {
      console.error('Error checking cache expiration:', error);
      return true;
    }
  }
}
