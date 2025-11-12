import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getActiveJobs,
  getActiveWorkers,
  getFarmerJobs,
  getWorkerProfile,
  getWorkerApplications,
  JobListing,
  WorkerProfile,
} from '../services/laborService';
import { LaborCache } from '../services/laborCache';

export const useLaborData = () => {
  const [jobListings, setJobListings] = useState<(JobListing & { id: string })[]>([]);
  const [workerProfiles, setWorkerProfiles] = useState<(WorkerProfile & { id: string })[]>([]);
  const [myJobs, setMyJobs] = useState<(JobListing & { id: string })[]>([]);
  const [myProfile, setMyProfile] = useState<(WorkerProfile & { id: string }) | null>(null);
  const [myApplications, setMyApplications] = useState<(JobListing & { id: string })[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [userPhone, setUserPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [userState, setUserState] = useState('');
  const [userDistrict, setUserDistrict] = useState('');
  const [userLocation, setUserLocation] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userPhone && !dataLoaded) {
      loadLaborDataWithCache();
    }
  }, [userPhone, dataLoaded]);

  const loadUserData = async () => {
    try {
      const state = await AsyncStorage.getItem('userState');
      const district = await AsyncStorage.getItem('userDistrict');
      const phone = await AsyncStorage.getItem('userPhone');
      const name = await AsyncStorage.getItem('userName');
      
      if (state && district) {
        setUserLocation(`${state}, ${district}`);
        setUserState(state);
        setUserDistrict(district);
      }
      if (phone) setUserPhone(phone);
      if (name) setUserName(name);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadLaborDataWithCache = async () => {
    setLoading(true);
    try {
      // Try to load from cache first
      const cachedJobs = await LaborCache.getActiveJobs();
      const cachedWorkers = await LaborCache.getActiveWorkers();
      const cachedMyJobs = await LaborCache.getMyJobs();
      const cachedMyProfile = await LaborCache.getMyProfile();
      const cachedMyApplications = await LaborCache.getMyApplications();

      // If we have cached data, use it
      if (cachedJobs) setJobListings(cachedJobs);
      if (cachedWorkers) setWorkerProfiles(cachedWorkers);
      if (cachedMyJobs) setMyJobs(cachedMyJobs);
      if (cachedMyProfile) setMyProfile(cachedMyProfile);
      if (cachedMyApplications) setMyApplications(cachedMyApplications);

      // Load fresh data from Firebase
      await loadLaborData();
      setDataLoaded(true);
    } catch (error) {
      console.error('Error loading labor data with cache:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLaborData = async () => {
    try {
      // Load active jobs (no state filter - do client-side filtering)
      const jobsResult = await getActiveJobs({ 
        limit: 50 
      });
      if (jobsResult.success && jobsResult.data) {
        setJobListings(jobsResult.data);
        await LaborCache.saveActiveJobs(jobsResult.data);
      }

      // Load active workers (no state filter - do client-side filtering)
      const workersResult = await getActiveWorkers({ 
        limit: 50 
      });
      if (workersResult.success && workersResult.data) {
        setWorkerProfiles(workersResult.data);
        await LaborCache.saveActiveWorkers(workersResult.data);
      }

      // Load my jobs if user is a farmer
      if (userPhone) {
        const myJobsResult = await getFarmerJobs(userPhone);
        if (myJobsResult.success && myJobsResult.data) {
          setMyJobs(myJobsResult.data);
          await LaborCache.saveMyJobs(myJobsResult.data);
        }

        // Load my worker profile if exists
        const profileResult = await getWorkerProfile(userPhone);
        if (profileResult.success && profileResult.data) {
          setMyProfile(profileResult.data);
          await LaborCache.saveMyProfile(profileResult.data);
        }

        // Load my applications if user is a worker
        const applicationsResult = await getWorkerApplications(userPhone);
        if (applicationsResult.success && applicationsResult.data) {
          setMyApplications(applicationsResult.data);
          await LaborCache.saveMyApplications(applicationsResult.data);
        }
      }
    } catch (error) {
      console.error('Error loading labor data:', error);
    }
  };

  const refreshData = async () => {
    await loadLaborData();
  };

  return {
    // Data
    jobListings,
    workerProfiles,
    myJobs,
    myProfile,
    myApplications,
    loading,
    
    // User data
    userPhone,
    userName,
    userState,
    userDistrict,
    userLocation,
    
    // Methods
    refreshData,
    loadLaborData,
  };
};
