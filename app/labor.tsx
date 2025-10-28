import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useI18n } from '../i18n/useI18n';

interface WorkerProfile {
  id?: string;
  workerId: string;
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
}

interface JobListing {
  id?: string;
  farmerId: string;
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
  applicants: string[];
  createdAt: Date;
  views: number;
}

const LaborMarketplace = () => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'find-work' | 'find-workers' | 'my-profile'>('find-work');
  const [showJobModal, setShowJobModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [jobListings, setJobListings] = useState<JobListing[]>([]);
  const [workerProfiles, setWorkerProfiles] = useState<WorkerProfile[]>([]);
  const [userRole, setUserRole] = useState<'farmer' | 'worker' | null>(null);
  const [userLocation, setUserLocation] = useState('');
  const [userState, setUserState] = useState('');
  const [userDistrict, setUserDistrict] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedWageRange, setSelectedWageRange] = useState('');

  const [newJob, setNewJob] = useState({
    jobTitle: '',
    taskType: '',
    description: '',
    skillsRequired: [] as string[],
    workersNeeded: '',
    dailyWage: '',
    duration: 'daily',
    startDate: new Date(),
    workingHours: '8',
    accommodationProvided: false,
    mealsProvided: false,
    transportProvided: false,
    urgency: 'planned' as 'immediate' | 'within_week' | 'planned',
  });

  const [workerProfile, setWorkerProfile] = useState({
    skills: [] as string[],
    experience: '0-1',
    dailyWage: '',
    availability: 'available' as 'available' | 'busy' | 'seasonal',
    preferredTasks: [] as string[],
    description: '',
  });

  // Common agricultural tasks and skills
  const commonTasks = [
    'Land Preparation', 'Sowing/Planting', 'Weeding', 'Irrigation', 'Fertilizer Application',
    'Pest Control', 'Pruning', 'Harvesting', 'Post-harvest Processing', 'Livestock Care',
    'Dairy Operations', 'Machinery Operation', 'Construction Work', 'General Farm Labor'
  ];

  const skillsList = [
    'Tractor Operation', 'Harvester Operation', 'Irrigation Systems', 'Organic Farming',
    'Crop Disease Identification', 'Animal Husbandry', 'Dairy Technology', 'Greenhouse Management',
    'Soil Testing', 'Seed Treatment', 'Storage Management', 'Quality Control'
  ];

  const experienceLevels = ['0-1', '1-3', '3-5', '5+'];
  const durations = ['daily', 'weekly', 'monthly', 'seasonal'];
  const urgencyLevels = ['immediate', 'within_week', 'planned'];
  const wageRanges = ['200-400', '400-600', '600-800', '800+'];

  useEffect(() => {
    loadUserData();
    loadLaborData();
  }, []);

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

  const loadLaborData = async () => {
    setLoading(true);
    try {
      // Mock data for now - will be replaced with Firebase calls
      const mockJobs: JobListing[] = [
        {
          id: '1',
          farmerId: '9876543210',
          farmerName: 'Rajesh Patil',
          farmerPhone: '9876543210',
          farmerLocation: 'Pune, Maharashtra',
          farmerState: 'Maharashtra',
          farmerDistrict: 'Pune',
          jobTitle: 'Cotton Harvesting Workers Needed',
          taskType: 'Harvesting',
          description: 'Need experienced workers for cotton harvesting. 5-acre farm, good quality cotton ready for harvest.',
          skillsRequired: ['Manual Harvesting', 'Quality Control'],
          workersNeeded: 8,
          dailyWage: 450,
          duration: 'weekly',
          startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          workingHours: '8 hours (6 AM - 2 PM)',
          accommodationProvided: false,
          mealsProvided: true,
          transportProvided: true,
          urgency: 'within_week',
          isActive: true,
          applicants: [],
          createdAt: new Date(),
          views: 15,
        },
        {
          id: '2',
          farmerId: '9123456789',
          farmerName: 'Sunita Sharma',
          farmerPhone: '9123456789',
          farmerLocation: 'Nashik, Maharashtra',
          farmerState: 'Maharashtra',
          farmerDistrict: 'Nashik',
          jobTitle: 'Grape Vineyard Maintenance',
          taskType: 'Pruning',
          description: 'Seasonal work for grape vineyard pruning and maintenance. Experience with grape farming preferred.',
          skillsRequired: ['Pruning', 'Vineyard Management'],
          workersNeeded: 4,
          dailyWage: 500,
          duration: 'monthly',
          startDate: new Date(),
          workingHours: '7 hours (7 AM - 2 PM)',
          accommodationProvided: true,
          mealsProvided: true,
          transportProvided: false,
          urgency: 'immediate',
          isActive: true,
          applicants: ['9999999999'],
          createdAt: new Date(),
          views: 23,
        }
      ];

      const mockWorkers: WorkerProfile[] = [
        {
          id: '1',
          workerId: '9999999999',
          workerName: 'Ramesh Kumar',
          workerPhone: '9999999999',
          workerLocation: 'Satara, Maharashtra',
          workerState: 'Maharashtra',
          workerDistrict: 'Satara',
          skills: ['Tractor Operation', 'Harvesting', 'Irrigation Systems'],
          experience: '3-5',
          dailyWage: 550,
          availability: 'available',
          preferredTasks: ['Harvesting', 'Land Preparation', 'Machinery Operation'],
          description: 'Experienced farm worker with 4 years of experience. Skilled in operating various farm machinery.',
          rating: 4.5,
          completedJobs: 28,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          workerId: '9888888888',
          workerName: 'Priya Devi',
          workerPhone: '9888888888',
          workerLocation: 'Solapur, Maharashtra',
          workerState: 'Maharashtra',
          workerDistrict: 'Solapur',
          skills: ['Organic Farming', 'Crop Disease Identification', 'Quality Control'],
          experience: '1-3',
          dailyWage: 400,
          availability: 'available',
          preferredTasks: ['Weeding', 'Pest Control', 'Post-harvest Processing'],
          description: 'Dedicated worker specializing in organic farming methods and crop care.',
          rating: 4.8,
          completedJobs: 15,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      setJobListings(mockJobs);
      setWorkerProfiles(mockWorkers);
    } catch (error) {
      console.error('Error loading labor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLaborData();
    setRefreshing(false);
  };

  const handlePostJob = async () => {
    if (!newJob.jobTitle || !newJob.taskType || !newJob.workersNeeded || !newJob.dailyWage) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setModalLoading(true);
    try {
      // TODO: Implement Firebase job posting
      Alert.alert('Success', 'Job posted successfully!');
      setShowJobModal(false);
      setNewJob({
        jobTitle: '',
        taskType: '',
        description: '',
        skillsRequired: [],
        workersNeeded: '',
        dailyWage: '',
        duration: 'daily',
        startDate: new Date(),
        workingHours: '8',
        accommodationProvided: false,
        mealsProvided: false,
        transportProvided: false,
        urgency: 'planned',
      });
      loadLaborData();
    } catch (error) {
      Alert.alert('Error', 'Failed to post job. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!workerProfile.experience || !workerProfile.dailyWage || workerProfile.skills.length === 0) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setModalLoading(true);
    try {
      // TODO: Implement Firebase worker profile creation
      Alert.alert('Success', 'Worker profile created successfully!');
      setShowProfileModal(false);
      setUserRole('worker');
      loadLaborData();
    } catch (error) {
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleApplyJob = (jobId: string) => {
    Alert.alert(
      'Apply for Job',
      'Are you sure you want to apply for this job?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: () => {
            // TODO: Implement job application
            Alert.alert('Success', 'Application submitted successfully!');
          }
        }
      ]
    );
  };

  const handleContactWorker = (worker: WorkerProfile) => {
    Alert.alert(
      'Contact Worker',
      `Call ${worker.workerName} at ${worker.workerPhone}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            // TODO: Implement calling functionality
            console.log(`Calling ${worker.workerPhone}`);
          }
        }
      ]
    );
  };

  const filteredJobs = jobListings.filter(job => {
    const matchesSearch = !searchQuery || 
      job.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.taskType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.farmerLocation.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTask = !selectedTask || job.taskType === selectedTask;
    
    return matchesSearch && matchesTask;
  });

  const filteredWorkers = workerProfiles.filter(worker => {
    const matchesSearch = !searchQuery || 
      worker.workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
      worker.workerLocation.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesExperience = !selectedExperience || worker.experience === selectedExperience;
    
    const matchesWage = !selectedWageRange || (() => {
      const wage = worker.dailyWage;
      switch (selectedWageRange) {
        case '200-400': return wage >= 200 && wage <= 400;
        case '400-600': return wage >= 400 && wage <= 600;
        case '600-800': return wage >= 600 && wage <= 800;
        case '800+': return wage >= 800;
        default: return true;
      }
    })();
    
    return matchesSearch && matchesExperience && matchesWage;
  });

  const toggleSkill = (skill: string, isJob: boolean = false) => {
    if (isJob) {
      setNewJob(prev => ({
        ...prev,
        skillsRequired: prev.skillsRequired.includes(skill)
          ? prev.skillsRequired.filter(s => s !== skill)
          : [...prev.skillsRequired, skill]
      }));
    } else {
      setWorkerProfile(prev => ({
        ...prev,
        skills: prev.skills.includes(skill)
          ? prev.skills.filter(s => s !== skill)
          : [...prev.skills, skill]
      }));
    }
  };

  const togglePreferredTask = (task: string) => {
    setWorkerProfile(prev => ({
      ...prev,
      preferredTasks: prev.preferredTasks.includes(task)
        ? prev.preferredTasks.filter(t => t !== task)
        : [...prev.preferredTasks, task]
    }));
  };

  const renderFindWorkTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search jobs by title, task, or location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, !selectedTask && styles.selectedFilterChip]}
          onPress={() => setSelectedTask('')}
        >
          <Text style={[styles.filterChipText, !selectedTask && styles.selectedFilterChipText]}>
            All Tasks
          </Text>
        </TouchableOpacity>
        {commonTasks.map((task) => (
          <TouchableOpacity
            key={task}
            style={[styles.filterChip, selectedTask === task && styles.selectedFilterChip]}
            onPress={() => setSelectedTask(task)}
          >
            <Text style={[styles.filterChipText, selectedTask === task && styles.selectedFilterChipText]}>
              {task}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Available Jobs ({filteredJobs.length})</Text>
      
      {filteredJobs.length > 0 ? (
        filteredJobs.map((job) => (
          <View key={job.id} style={styles.jobCard}>
            <View style={styles.jobHeader}>
              <Text style={styles.jobTitle}>{job.jobTitle}</Text>
              <Text style={[styles.wageText, { color: '#4CAF50' }]}>
                ₹{job.dailyWage}/day
              </Text>
            </View>
            
            <View style={styles.jobDetails}>
              <Text style={styles.taskType}>📋 {job.taskType}</Text>
              <Text style={styles.workersNeeded}>👥 {job.workersNeeded} workers needed</Text>
              <Text style={styles.duration}>⏰ Duration: {job.duration}</Text>
              <Text style={styles.workingHours}>🕐 {job.workingHours}</Text>
            </View>

            <Text style={styles.jobDescription}>{job.description}</Text>

            {job.skillsRequired.length > 0 && (
              <View style={styles.skillsContainer}>
                <Text style={styles.skillsTitle}>Skills Required:</Text>
                <View style={styles.skillsRow}>
                  {job.skillsRequired.map((skill, index) => (
                    <Text key={index} style={styles.skillTag}>{skill}</Text>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.farmerInfo}>
              <Text style={styles.farmerName}>👨‍🌾 {job.farmerName}</Text>
              <Text style={styles.locationText}>📍 {job.farmerLocation}</Text>
            </View>

            <View style={styles.benefitsContainer}>
              {job.mealsProvided && <Text style={styles.benefit}>🍽️ Meals</Text>}
              {job.transportProvided && <Text style={styles.benefit}>🚌 Transport</Text>}
              {job.accommodationProvided && <Text style={styles.benefit}>🏠 Stay</Text>}
            </View>

            <View style={styles.jobFooter}>
              <Text style={styles.urgencyText}>
                {job.urgency === 'immediate' ? '🔴 Immediate' : 
                 job.urgency === 'within_week' ? '🟡 This Week' : '🟢 Planned'}
              </Text>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => handleApplyJob(job.id!)}
              >
                <Text style={styles.applyButtonText}>Apply Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💼</Text>
          <Text style={styles.emptyTitle}>No jobs found</Text>
          <Text style={styles.emptySubtitle}>Try adjusting your search filters</Text>
        </View>
      )}
    </View>
  );

  const renderFindWorkersTab = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity
        style={styles.postJobButton}
        onPress={() => setShowJobModal(true)}
      >
        <Text style={styles.postJobIcon}>📝</Text>
        <View>
          <Text style={styles.postJobTitle}>Post a Job</Text>
          <Text style={styles.postJobSubtitle}>Find workers for your farm</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search workers by name, skills, or location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, !selectedExperience && styles.selectedFilterChip]}
          onPress={() => setSelectedExperience('')}
        >
          <Text style={[styles.filterChipText, !selectedExperience && styles.selectedFilterChipText]}>
            All Experience
          </Text>
        </TouchableOpacity>
        {experienceLevels.map((level) => (
          <TouchableOpacity
            key={level}
            style={[styles.filterChip, selectedExperience === level && styles.selectedFilterChip]}
            onPress={() => setSelectedExperience(level)}
          >
            <Text style={[styles.filterChipText, selectedExperience === level && styles.selectedFilterChipText]}>
              {level} years
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, !selectedWageRange && styles.selectedFilterChip]}
          onPress={() => setSelectedWageRange('')}
        >
          <Text style={[styles.filterChipText, !selectedWageRange && styles.selectedFilterChipText]}>
            All Wages
          </Text>
        </TouchableOpacity>
        {wageRanges.map((range) => (
          <TouchableOpacity
            key={range}
            style={[styles.filterChip, selectedWageRange === range && styles.selectedFilterChip]}
            onPress={() => setSelectedWageRange(range)}
          >
            <Text style={[styles.filterChipText, selectedWageRange === range && styles.selectedFilterChipText]}>
              ₹{range}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Available Workers ({filteredWorkers.length})</Text>
      
      {filteredWorkers.length > 0 ? (
        filteredWorkers.map((worker) => (
          <View key={worker.id} style={styles.workerCard}>
            <View style={styles.workerHeader}>
              <View style={styles.workerBasicInfo}>
                <Text style={styles.workerName}>{worker.workerName}</Text>
                <Text style={styles.workerLocation}>📍 {worker.workerLocation}</Text>
              </View>
              <View style={styles.workerRating}>
                <Text style={styles.ratingText}>⭐ {worker.rating}</Text>
                <Text style={styles.jobsCompleted}>({worker.completedJobs} jobs)</Text>
              </View>
            </View>

            <View style={styles.workerDetails}>
              <Text style={styles.experience}>💼 {worker.experience} years experience</Text>
              <Text style={styles.dailyWage}>💰 ₹{worker.dailyWage}/day</Text>
              <Text style={[styles.availability, { 
                color: worker.availability === 'available' ? '#4CAF50' : 
                       worker.availability === 'busy' ? '#F44336' : '#FF9800' 
              }]}>
                🟢 {worker.availability.charAt(0).toUpperCase() + worker.availability.slice(1)}
              </Text>
            </View>

            {worker.description && (
              <Text style={styles.workerDescription}>{worker.description}</Text>
            )}

            <View style={styles.skillsContainer}>
              <Text style={styles.skillsTitle}>Skills:</Text>
              <View style={styles.skillsRow}>
                {worker.skills.slice(0, 3).map((skill, index) => (
                  <Text key={index} style={styles.skillTag}>{skill}</Text>
                ))}
                {worker.skills.length > 3 && (
                  <Text style={styles.moreSkills}>+{worker.skills.length - 3} more</Text>
                )}
              </View>
            </View>

            <View style={styles.preferredTasksContainer}>
              <Text style={styles.skillsTitle}>Preferred Tasks:</Text>
              <View style={styles.skillsRow}>
                {worker.preferredTasks.slice(0, 2).map((task, index) => (
                  <Text key={index} style={styles.taskTag}>{task}</Text>
                ))}
                {worker.preferredTasks.length > 2 && (
                  <Text style={styles.moreTasks}>+{worker.preferredTasks.length - 2} more</Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => handleContactWorker(worker)}
            >
              <Text style={styles.contactButtonText}>📞 Contact Worker</Text>
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👷</Text>
          <Text style={styles.emptyTitle}>No workers found</Text>
          <Text style={styles.emptySubtitle}>Try adjusting your search filters</Text>
        </View>
      )}
    </View>
  );

  const renderMyProfileTab = () => (
    <View style={styles.tabContent}>
      {userRole === 'worker' ? (
        <View style={styles.profileContainer}>
          <Text style={styles.sectionTitle}>My Worker Profile</Text>
          <Text style={styles.comingSoon}>Worker profile management coming soon!</Text>
        </View>
      ) : (
        <View style={styles.profileContainer}>
          <Text style={styles.sectionTitle}>Create Worker Profile</Text>
          <Text style={styles.profileDescription}>
            Create a worker profile to find farm jobs in your area
          </Text>
          <TouchableOpacity
            style={styles.createProfileButton}
            onPress={() => setShowProfileModal(true)}
          >
            <Text style={styles.createProfileText}>Create Worker Profile</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Labor Market</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'find-work' && styles.activeTab]}
          onPress={() => setActiveTab('find-work')}
        >
          <Text style={[styles.tabText, activeTab === 'find-work' && styles.activeTabText]}>
            Find Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'find-workers' && styles.activeTab]}
          onPress={() => setActiveTab('find-workers')}
        >
          <Text style={[styles.tabText, activeTab === 'find-workers' && styles.activeTabText]}>
            Find Workers
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-profile' && styles.activeTab]}
          onPress={() => setActiveTab('my-profile')}
        >
          <Text style={[styles.tabText, activeTab === 'my-profile' && styles.activeTabText]}>
            My Profile
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        {activeTab === 'find-work' && renderFindWorkTab()}
        {activeTab === 'find-workers' && renderFindWorkersTab()}
        {activeTab === 'my-profile' && renderMyProfileTab()}
      </ScrollView>

      {/* Post Job Modal */}
      <Modal
        visible={showJobModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Post a Job</Text>
              <TouchableOpacity 
                onPress={() => setShowJobModal(false)}
                disabled={modalLoading}
              >
                <Text style={[styles.closeButton, modalLoading && { opacity: 0.5 }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {modalLoading && (
              <View style={styles.modalLoadingOverlay}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Posting your job...</Text>
              </View>
            )}

            <ScrollView style={modalLoading && { opacity: 0.3 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Job Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Cotton Harvesting Workers Needed"
                  value={newJob.jobTitle}
                  onChangeText={(text) => setNewJob({...newJob, jobTitle: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Task Type *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {commonTasks.map((task) => (
                    <TouchableOpacity
                      key={task}
                      style={[
                        styles.taskChip,
                        newJob.taskType === task && styles.selectedTaskChip
                      ]}
                      onPress={() => setNewJob({...newJob, taskType: task})}
                    >
                      <Text style={[
                        styles.taskChipText,
                        newJob.taskType === task && styles.selectedTaskChipText
                      ]}>
                        {task}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Number of Workers *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter number of workers needed"
                  value={newJob.workersNeeded}
                  onChangeText={(text) => setNewJob({...newJob, workersNeeded: text})}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Daily Wage (₹) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter daily wage amount"
                  value={newJob.dailyWage}
                  onChangeText={(text) => setNewJob({...newJob, dailyWage: text})}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {durations.map((duration) => (
                    <TouchableOpacity
                      key={duration}
                      style={[
                        styles.durationChip,
                        newJob.duration === duration && styles.selectedDurationChip
                      ]}
                      onPress={() => setNewJob({...newJob, duration})}
                    >
                      <Text style={[
                        styles.durationChipText,
                        newJob.duration === duration && styles.selectedDurationChipText
                      ]}>
                        {duration}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Working Hours</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 8 hours (6 AM - 2 PM)"
                  value={newJob.workingHours}
                  onChangeText={(text) => setNewJob({...newJob, workingHours: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Skills Required</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {skillsList.map((skill) => (
                    <TouchableOpacity
                      key={skill}
                      style={[
                        styles.skillChip,
                        newJob.skillsRequired.includes(skill) && styles.selectedSkillChip
                      ]}
                      onPress={() => toggleSkill(skill, true)}
                    >
                      <Text style={[
                        styles.skillChipText,
                        newJob.skillsRequired.includes(skill) && styles.selectedSkillChipText
                      ]}>
                        {skill}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Job Description</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  placeholder="Describe the work details, requirements, and other information..."
                  value={newJob.description}
                  onChangeText={(text) => setNewJob({...newJob, description: text})}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.benefitsGroup}>
                <Text style={styles.inputLabel}>Benefits Provided</Text>
                
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setNewJob({...newJob, mealsProvided: !newJob.mealsProvided})}
                >
                  <View style={[styles.checkbox, newJob.mealsProvided && styles.checkedBox]}>
                    {newJob.mealsProvided && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Meals provided</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setNewJob({...newJob, transportProvided: !newJob.transportProvided})}
                >
                  <View style={[styles.checkbox, newJob.transportProvided && styles.checkedBox]}>
                    {newJob.transportProvided && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Transport provided</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setNewJob({...newJob, accommodationProvided: !newJob.accommodationProvided})}
                >
                  <View style={[styles.checkbox, newJob.accommodationProvided && styles.checkedBox]}>
                    {newJob.accommodationProvided && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Accommodation provided</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, modalLoading && styles.disabledButton]}
                onPress={handlePostJob}
                disabled={modalLoading}
              >
                {modalLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={[styles.submitButtonText, { marginLeft: 10 }]}>Posting...</Text>
                  </View>
                ) : (
                  <Text style={styles.submitButtonText}>Post Job</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Worker Profile Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Worker Profile</Text>
              <TouchableOpacity 
                onPress={() => setShowProfileModal(false)}
                disabled={modalLoading}
              >
                <Text style={[styles.closeButton, modalLoading && { opacity: 0.5 }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {modalLoading && (
              <View style={styles.modalLoadingOverlay}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Creating your profile...</Text>
              </View>
            )}

            <ScrollView style={modalLoading && { opacity: 0.3 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Experience Level *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {experienceLevels.map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.experienceChip,
                        workerProfile.experience === level && styles.selectedExperienceChip
                      ]}
                      onPress={() => setWorkerProfile({...workerProfile, experience: level})}
                    >
                      <Text style={[
                        styles.experienceChipText,
                        workerProfile.experience === level && styles.selectedExperienceChipText
                      ]}>
                        {level} years
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Expected Daily Wage (₹) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your expected daily wage"
                  value={workerProfile.dailyWage}
                  onChangeText={(text) => setWorkerProfile({...workerProfile, dailyWage: text})}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Skills *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {skillsList.map((skill) => (
                    <TouchableOpacity
                      key={skill}
                      style={[
                        styles.skillChip,
                        workerProfile.skills.includes(skill) && styles.selectedSkillChip
                      ]}
                      onPress={() => toggleSkill(skill)}
                    >
                      <Text style={[
                        styles.skillChipText,
                        workerProfile.skills.includes(skill) && styles.selectedSkillChipText
                      ]}>
                        {skill}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Preferred Tasks</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {commonTasks.map((task) => (
                    <TouchableOpacity
                      key={task}
                      style={[
                        styles.taskChip,
                        workerProfile.preferredTasks.includes(task) && styles.selectedTaskChip
                      ]}
                      onPress={() => togglePreferredTask(task)}
                    >
                      <Text style={[
                        styles.taskChipText,
                        workerProfile.preferredTasks.includes(task) && styles.selectedTaskChipText
                      ]}>
                        {task}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>About You</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  placeholder="Describe your experience, specializations, and what makes you a good worker..."
                  value={workerProfile.description}
                  onChangeText={(text) => setWorkerProfile({...workerProfile, description: text})}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, modalLoading && styles.disabledButton]}
                onPress={handleCreateProfile}
                disabled={modalLoading}
              >
                {modalLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={[styles.submitButtonText, { marginLeft: 10 }]}>Creating...</Text>
                  </View>
                ) : (
                  <Text style={styles.submitButtonText}>Create Profile</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 24,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#4CAF50',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  filterContainer: {
    marginBottom: 15,
  },
  filterChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedFilterChip: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterChipText: {
    color: '#666',
    fontSize: 12,
  },
  selectedFilterChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  // Job Card Styles
  jobCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  wageText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  jobDetails: {
    marginBottom: 10,
  },
  taskType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  workersNeeded: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  duration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  workingHours: {
    fontSize: 14,
    color: '#666',
  },
  jobDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    lineHeight: 20,
  },
  skillsContainer: {
    marginBottom: 10,
  },
  skillsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#E3F2FD',
    color: '#1976D2',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 5,
    marginBottom: 3,
  },
  farmerInfo: {
    marginBottom: 10,
  },
  farmerName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
  benefitsContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  benefit: {
    fontSize: 12,
    color: '#4CAF50',
    marginRight: 10,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Worker Card Styles
  workerCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  workerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  workerBasicInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  workerLocation: {
    fontSize: 12,
    color: '#666',
  },
  workerRating: {
    alignItems: 'flex-end',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  jobsCompleted: {
    fontSize: 11,
    color: '#666',
  },
  workerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  experience: {
    fontSize: 13,
    color: '#666',
  },
  dailyWage: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  availability: {
    fontSize: 13,
    fontWeight: '600',
  },
  workerDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    lineHeight: 18,
  },
  moreSkills: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
  },
  preferredTasksContainer: {
    marginBottom: 15,
  },
  taskTag: {
    backgroundColor: '#F3E5F5',
    color: '#7B1FA2',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 5,
    marginBottom: 3,
  },
  moreTasks: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
  },
  contactButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  contactButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Post Job Button
  postJobButton: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    elevation: 2,
  },
  postJobIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  postJobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  postJobSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  arrow: {
    fontSize: 20,
    color: '#4CAF50',
    marginLeft: 'auto',
  },

  // Profile Tab
  profileContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    elevation: 2,
  },
  profileDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  createProfileButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  createProfileText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  comingSoon: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  modalLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    borderRadius: 15,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  
  // Chip Styles
  taskChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedTaskChip: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  taskChipText: {
    color: '#666',
    fontSize: 12,
  },
  selectedTaskChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  durationChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedDurationChip: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  durationChipText: {
    color: '#666',
    fontSize: 12,
  },
  selectedDurationChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  skillChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedSkillChip: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  skillChipText: {
    color: '#666',
    fontSize: 12,
  },
  selectedSkillChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  experienceChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedExperienceChip: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  experienceChipText: {
    color: '#666',
    fontSize: 12,
  },
  selectedExperienceChipText: {
    color: 'white',
    fontWeight: 'bold',
  },

  // Checkbox and Benefits
  benefitsGroup: {
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },

  // Buttons
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default LaborMarketplace;