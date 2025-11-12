import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../i18n/useI18n';
import { JobCard, WorkerCard, ProfileOverview } from '../components/labor';
import { useLaborData } from '../hooks/useLaborData';
import {
  createJobListing,
  createWorkerProfile,
  applyForJob,
  deleteJobListing,
  incrementJobViews,
  incrementWorkerViews,
  markWorkerContacted,
} from '../services/laborService';
import { COMMON_TASKS, SKILLS_LIST, WAGE_RANGES, EXPERIENCE_LEVELS } from '../constants/laborConstants';

export default function LaborMarketplace() {
  const { t } = useI18n();
  const {
    jobListings,
    workerProfiles,
    myJobs,
    myProfile,
    myApplications,
    loading,
    userPhone,
    userName,
    userState,
    userDistrict,
    refreshData,
  } = useLaborData();

  const [activeTab, setActiveTab] = useState<'find-work' | 'find-workers' | 'my-profile'>('find-work');
  const [profileSection, setProfileSection] = useState<'overview' | 'my-jobs' | 'my-applications' | 'worker-profile'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedWageRange, setSelectedWageRange] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Job posting form state
  const [newJob, setNewJob] = useState({
    jobTitle: '',
    taskType: '',
    workersNeeded: '',
    dailyWage: '',
    duration: '',
    workingHours: '8',
    providesMeals: false,
    providesTransport: false,
    providesAccommodation: false,
    urgency: 'within_week' as 'immediate' | 'within_week' | 'planned',
    skillsRequired: '',
    description: '',
  });
  const [jobSubmitting, setJobSubmitting] = useState(false);

  // Worker profile form state
  const [workerProfile, setWorkerProfile] = useState({
    skills: [] as string[],
    experience: '',
    dailyWage: '',
    availability: 'available' as 'available' | 'busy' | 'seasonal',
    preferredTasks: [] as string[],
    description: '',
  });
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const handleApplyJob = async (job: any) => {
    if (!userPhone) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    if (job.applicants && job.applicants.includes(userPhone)) {
      Alert.alert('Info', 'You have already applied for this job');
      return;
    }

    Alert.alert(
      'Apply for Job',
      'Are you sure you want to apply for this job?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Apply',
          onPress: async () => {
            try {
              const result = await applyForJob(job.id, userPhone);
              if (result.success) {
                Alert.alert('Success', 'Application submitted successfully!');
                await refreshData();
              } else {
                Alert.alert('Error', result.error || 'Failed to apply');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to apply for job');
            }
          }
        }
      ]
    );
  };

  const handleContactWorker = async (worker: any) => {
    if (worker.id) {
      await incrementWorkerViews(worker.id);
    }
    if (userPhone && worker.id) {
      await markWorkerContacted(worker.id, userPhone);
    }
    
    Alert.alert(
      'Contact Worker',
      `Call ${worker.workerName} at ${worker.workerPhone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            console.log(`Calling ${worker.workerPhone}`);
          }
        }
      ]
    );
  };

  const handleDeleteJob = async (jobId: string) => {
    Alert.alert(
      'Delete Job',
      'Are you sure you want to delete this job posting?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteJobListing(jobId);
              if (result.success) {
                Alert.alert('Success', 'Job deleted successfully');
                await refreshData();
              } else {
                Alert.alert('Error', result.error || 'Failed to delete job');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete job');
            }
          }
        }
      ]
    );
  };

  const handleViewApplicants = (job: any) => {
    Alert.alert(
      'Applicants',
      job.applicants && job.applicants.length > 0
        ? `${job.applicants.length} workers have applied:\n\n${job.applicants.map((id: string, i: number) => `${i + 1}. Worker ${id}`).join('\n')}`
        : 'No applicants yet'
    );
  };

  const handlePostJob = async () => {
    // Validation
    if (!newJob.jobTitle.trim()) {
      Alert.alert('Error', 'Please enter a job title');
      return;
    }
    if (!newJob.taskType) {
      Alert.alert('Error', 'Please select a task type');
      return;
    }
    if (!newJob.workersNeeded || parseInt(newJob.workersNeeded) < 1) {
      Alert.alert('Error', 'Please enter number of workers needed');
      return;
    }
    if (!newJob.dailyWage || parseInt(newJob.dailyWage) < 1) {
      Alert.alert('Error', 'Please enter daily wage');
      return;
    }
    if (!newJob.duration.trim()) {
      Alert.alert('Error', 'Please enter job duration');
      return;
    }

    setJobSubmitting(true);
    try {
      const result = await createJobListing({
        farmerId: userPhone!,
        farmerName: userName!,
        farmerPhone: userPhone!,
        farmerLocation: `${userDistrict}, ${userState}`,
        farmerState: userState!,
        farmerDistrict: userDistrict!,
        jobTitle: newJob.jobTitle.trim(),
        taskType: newJob.taskType,
        workersNeeded: parseInt(newJob.workersNeeded),
        dailyWage: parseInt(newJob.dailyWage),
        duration: newJob.duration.trim(),
        startDate: new Date(),
        workingHours: newJob.workingHours,
        mealsProvided: newJob.providesMeals,
        transportProvided: newJob.providesTransport,
        accommodationProvided: newJob.providesAccommodation,
        urgency: newJob.urgency,
        skillsRequired: newJob.skillsRequired.split(',').map(s => s.trim()).filter(s => s),
        description: newJob.description.trim(),
        isActive: true,
      });

      if (result.success) {
        Alert.alert('Success', 'Job posted successfully!');
        setShowJobModal(false);
        // Reset form
        setNewJob({
          jobTitle: '',
          taskType: '',
          workersNeeded: '',
          dailyWage: '',
          duration: '',
          workingHours: '8',
          providesMeals: false,
          providesTransport: false,
          providesAccommodation: false,
          urgency: 'within_week',
          skillsRequired: '',
          description: '',
        });
        await refreshData();
      } else {
        Alert.alert('Error', result.error || 'Failed to post job');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to post job. Please try again.');
    } finally {
      setJobSubmitting(false);
    }
  };

  const handleCreateProfile = async () => {
    // Validation
    if (workerProfile.skills.length === 0) {
      Alert.alert('Error', 'Please select at least one skill');
      return;
    }
    if (!workerProfile.experience) {
      Alert.alert('Error', 'Please select experience level');
      return;
    }
    if (!workerProfile.dailyWage || parseInt(workerProfile.dailyWage) < 1) {
      Alert.alert('Error', 'Please enter expected daily wage');
      return;
    }

    setProfileSubmitting(true);
    try {
      const result = await createWorkerProfile({
        workerId: userPhone!,
        workerName: userName!,
        workerPhone: userPhone!,
        workerLocation: `${userDistrict}, ${userState}`,
        workerState: userState!,
        workerDistrict: userDistrict!,
        skills: workerProfile.skills,
        experience: workerProfile.experience,
        dailyWage: parseInt(workerProfile.dailyWage),
        availability: workerProfile.availability,
        preferredTasks: workerProfile.preferredTasks,
        description: workerProfile.description.trim(),
        isActive: true,
      });

      if (result.success) {
        Alert.alert('Success', 'Worker profile created successfully!');
        setShowProfileModal(false);
        // Reset form
        setWorkerProfile({
          skills: [],
          experience: '',
          dailyWage: '',
          availability: 'available',
          preferredTasks: [],
          description: '',
        });
        await refreshData();
      } else {
        Alert.alert('Error', result.error || 'Failed to create profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create profile. Please try again.');
    } finally {
      setProfileSubmitting(false);
    }
  };

  // Filter jobs and workers
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

  if (loading && !jobListings.length && !workerProfiles.length) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading labor marketplace...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Labor Market</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tab Bar */}
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

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Find Work Tab */}
        {activeTab === 'find-work' && (
          <View style={styles.tabContent}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search jobs..."
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
              {COMMON_TASKS.map((task) => (
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
                <JobCard
                  key={job.id}
                  job={job}
                  userPhone={userPhone}
                  onApply={handleApplyJob}
                  onView={(j) => incrementJobViews(j.id)}
                  showApplyButton={true}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💼</Text>
                <Text style={styles.emptyTitle}>No jobs found</Text>
                <Text style={styles.emptySubtitle}>Try adjusting your search filters</Text>
              </View>
            )}
          </View>
        )}

        {/* Find Workers Tab */}
        {activeTab === 'find-workers' && (
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
                placeholder="Search workers..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <Text style={styles.sectionTitle}>Available Workers ({filteredWorkers.length})</Text>

            {filteredWorkers.length > 0 ? (
              filteredWorkers.map((worker) => (
                <WorkerCard
                  key={worker.id}
                  worker={worker}
                  onContact={handleContactWorker}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>👤</Text>
                <Text style={styles.emptyTitle}>No workers found</Text>
                <Text style={styles.emptySubtitle}>Try adjusting your search filters</Text>
              </View>
            )}
          </View>
        )}

        {/* My Profile Tab */}
        {activeTab === 'my-profile' && (
          <View style={styles.tabContent}>
            {/* Profile Section Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.profileSectionTabs}>
              <TouchableOpacity
                style={[styles.profileTab, profileSection === 'overview' && styles.activeProfileTab]}
                onPress={() => setProfileSection('overview')}
              >
                <Text style={[styles.profileTabText, profileSection === 'overview' && styles.activeProfileTabText]}>
                  📊 Overview
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.profileTab, profileSection === 'my-jobs' && styles.activeProfileTab]}
                onPress={() => setProfileSection('my-jobs')}
              >
                <Text style={[styles.profileTabText, profileSection === 'my-jobs' && styles.activeProfileTabText]}>
                  💼 My Jobs ({myJobs.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.profileTab, profileSection === 'my-applications' && styles.activeProfileTab]}
                onPress={() => setProfileSection('my-applications')}
              >
                <Text style={[styles.profileTabText, profileSection === 'my-applications' && styles.activeProfileTabText]}>
                  📨 Applications ({myApplications.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.profileTab, profileSection === 'worker-profile' && styles.activeProfileTab]}
                onPress={() => setProfileSection('worker-profile')}
              >
                <Text style={[styles.profileTabText, profileSection === 'worker-profile' && styles.activeProfileTabText]}>
                  👤 Worker Profile
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Overview Section */}
            {profileSection === 'overview' && (
              <ProfileOverview
                myJobs={myJobs}
                myApplications={myApplications}
                myProfile={myProfile}
                onSectionChange={setProfileSection}
                onCreateProfile={() => setShowProfileModal(true)}
                onPostJob={() => {
                  setActiveTab('find-workers');
                  setTimeout(() => setShowJobModal(true), 300);
                }}
                onBrowseJobs={() => setActiveTab('find-work')}
              />
            )}

            {/* My Jobs Section */}
            {profileSection === 'my-jobs' && (
              <View>
                <Text style={styles.sectionTitle}>My Job Postings ({myJobs.length})</Text>
                {myJobs.length > 0 ? (
                  myJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      userPhone={userPhone}
                      showApplyButton={false}
                      showApplicantCount={true}
                      onViewApplicants={handleViewApplicants}
                      onDelete={handleDeleteJob}
                    />
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>📋</Text>
                    <Text style={styles.emptyTitle}>No job postings yet</Text>
                    <Text style={styles.emptySubtitle}>Post a job to find workers for your farm</Text>
                    <TouchableOpacity
                      style={styles.emptyActionButton}
                      onPress={() => {
                        setActiveTab('find-workers');
                        setTimeout(() => setShowJobModal(true), 300);
                      }}
                    >
                      <Text style={styles.emptyActionText}>Post a Job</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* My Applications Section */}
            {profileSection === 'my-applications' && (
              <View>
                <Text style={styles.sectionTitle}>My Applications ({myApplications.length})</Text>
                {myApplications.length > 0 ? (
                  myApplications.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      userPhone={userPhone}
                      showApplyButton={false}
                    />
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>💼</Text>
                    <Text style={styles.emptyTitle}>No applications yet</Text>
                    <Text style={styles.emptySubtitle}>Browse available jobs and apply</Text>
                    <TouchableOpacity
                      style={styles.emptyActionButton}
                      onPress={() => setActiveTab('find-work')}
                    >
                      <Text style={styles.emptyActionText}>Find Jobs</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Worker Profile Section */}
            {profileSection === 'worker-profile' && (
              <View>
                {myProfile ? (
                  <View style={styles.profileCard}>
                    <Text style={styles.sectionTitle}>My Worker Profile</Text>
                    <Text style={styles.profileName}>{myProfile.workerName}</Text>
                    <Text style={styles.profileRating}>⭐ {myProfile.rating.toFixed(1)} • {myProfile.completedJobs} jobs completed</Text>
                    <Text style={styles.profileDetail}>📍 {myProfile.workerLocation}</Text>
                    <Text style={styles.profileDetail}>💰 ₹{myProfile.dailyWage}/day</Text>
                    <Text style={styles.profileDetail}>🕐 {myProfile.experience} years experience</Text>
                    {myProfile.description && <Text style={styles.profileDescription}>{myProfile.description}</Text>}
                  </View>
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>👤</Text>
                    <Text style={styles.emptyTitle}>No Worker Profile</Text>
                    <Text style={styles.emptySubtitle}>Create a profile to find jobs</Text>
                    <TouchableOpacity
                      style={styles.emptyActionButton}
                      onPress={() => setShowProfileModal(true)}
                    >
                      <Text style={styles.emptyActionText}>Create Profile</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Job Posting Modal */}
      <Modal
        visible={showJobModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowJobModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Post a Job</Text>
              <TouchableOpacity onPress={() => setShowJobModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Job Title */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Job Title *</Text>
                <TextInput
                  style={styles.input}
                  value={newJob.jobTitle}
                  onChangeText={(text) => setNewJob({...newJob, jobTitle: text})}
                  placeholder="e.g., Rice Harvesting Labor Needed"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Task Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Task Type *</Text>
                <View style={styles.pickerContainer}>
                  {['Planting', 'Harvesting', 'Spraying', 'General Labor', 'Maintenance', 'Other'].map((task) => (
                    <TouchableOpacity
                      key={task}
                      style={[
                        styles.optionButton,
                        newJob.taskType === task && styles.optionButtonSelected
                      ]}
                      onPress={() => setNewJob({...newJob, taskType: task})}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        newJob.taskType === task && styles.optionButtonTextSelected
                      ]}>{task}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Workers Needed */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Workers Needed *</Text>
                <TextInput
                  style={styles.input}
                  value={newJob.workersNeeded}
                  onChangeText={(text) => setNewJob({...newJob, workersNeeded: text})}
                  placeholder="e.g., 5"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Daily Wage */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Daily Wage (₹) *</Text>
                <TextInput
                  style={styles.input}
                  value={newJob.dailyWage}
                  onChangeText={(text) => setNewJob({...newJob, dailyWage: text})}
                  placeholder="e.g., 500"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Duration */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration *</Text>
                <TextInput
                  style={styles.input}
                  value={newJob.duration}
                  onChangeText={(text) => setNewJob({...newJob, duration: text})}
                  placeholder="e.g., 1 week, 2 days, seasonal"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Working Hours */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Working Hours per Day</Text>
                <TextInput
                  style={styles.input}
                  value={newJob.workingHours}
                  onChangeText={(text) => setNewJob({...newJob, workingHours: text})}
                  placeholder="e.g., 8"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Urgency */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Urgency</Text>
                <View style={styles.pickerContainer}>
                  {[
                    { value: 'immediate', label: 'Immediate' },
                    { value: 'within_week', label: 'Within a Week' },
                    { value: 'planned', label: 'Planned' }
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        newJob.urgency === option.value && styles.optionButtonSelected
                      ]}
                      onPress={() => setNewJob({...newJob, urgency: option.value as any})}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        newJob.urgency === option.value && styles.optionButtonTextSelected
                      ]}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Benefits */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Benefits</Text>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setNewJob({...newJob, providesMeals: !newJob.providesMeals})}
                >
                  <View style={[styles.checkbox, newJob.providesMeals && styles.checkboxChecked]}>
                    {newJob.providesMeals && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Provides Meals</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setNewJob({...newJob, providesTransport: !newJob.providesTransport})}
                >
                  <View style={[styles.checkbox, newJob.providesTransport && styles.checkboxChecked]}>
                    {newJob.providesTransport && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Provides Transport</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setNewJob({...newJob, providesAccommodation: !newJob.providesAccommodation})}
                >
                  <View style={[styles.checkbox, newJob.providesAccommodation && styles.checkboxChecked]}>
                    {newJob.providesAccommodation && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Provides Accommodation</Text>
                </TouchableOpacity>
              </View>

              {/* Skills Required */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Skills Required (comma separated)</Text>
                <TextInput
                  style={styles.input}
                  value={newJob.skillsRequired}
                  onChangeText={(text) => setNewJob({...newJob, skillsRequired: text})}
                  placeholder="e.g., harvesting, tractor operation"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newJob.description}
                  onChangeText={(text) => setNewJob({...newJob, description: text})}
                  placeholder="Additional details about the job..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, jobSubmitting && styles.submitButtonDisabled]}
                onPress={handlePostJob}
                disabled={jobSubmitting}
              >
                <Text style={styles.submitButtonText}>
                  {jobSubmitting ? 'Posting...' : 'Post Job'}
                </Text>
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
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Worker Profile</Text>
              <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {/* Skills */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Skills * (select at least one)</Text>
                <View style={styles.pickerContainer}>
                  {['Harvesting', 'Planting', 'Spraying', 'Irrigation', 'Tractor Operation', 'General Labor'].map((skill) => (
                    <TouchableOpacity
                      key={skill}
                      style={[
                        styles.optionButton,
                        workerProfile.skills.includes(skill) && styles.optionButtonSelected
                      ]}
                      onPress={() => {
                        const skills = workerProfile.skills.includes(skill)
                          ? workerProfile.skills.filter(s => s !== skill)
                          : [...workerProfile.skills, skill];
                        setWorkerProfile({...workerProfile, skills});
                      }}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        workerProfile.skills.includes(skill) && styles.optionButtonTextSelected
                      ]}>{skill}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Experience */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Experience Level *</Text>
                <View style={styles.pickerContainer}>
                  {[
                    { value: '0-1', label: '0-1 years' },
                    { value: '1-3', label: '1-3 years' },
                    { value: '3-5', label: '3-5 years' },
                    { value: '5+', label: '5+ years' }
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        workerProfile.experience === option.value && styles.optionButtonSelected
                      ]}
                      onPress={() => setWorkerProfile({...workerProfile, experience: option.value})}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        workerProfile.experience === option.value && styles.optionButtonTextSelected
                      ]}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Daily Wage */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Expected Daily Wage (₹) *</Text>
                <TextInput
                  style={styles.input}
                  value={workerProfile.dailyWage}
                  onChangeText={(text) => setWorkerProfile({...workerProfile, dailyWage: text})}
                  placeholder="e.g., 500"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Availability */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Availability</Text>
                <View style={styles.pickerContainer}>
                  {[
                    { value: 'available', label: 'Available' },
                    { value: 'busy', label: 'Busy' },
                    { value: 'seasonal', label: 'Seasonal' }
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        workerProfile.availability === option.value && styles.optionButtonSelected
                      ]}
                      onPress={() => setWorkerProfile({...workerProfile, availability: option.value as any})}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        workerProfile.availability === option.value && styles.optionButtonTextSelected
                      ]}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Preferred Tasks */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Preferred Tasks</Text>
                <View style={styles.pickerContainer}>
                  {['Planting', 'Harvesting', 'Spraying', 'Irrigation', 'Maintenance', 'General Labor'].map((task) => (
                    <TouchableOpacity
                      key={task}
                      style={[
                        styles.optionButton,
                        workerProfile.preferredTasks.includes(task) && styles.optionButtonSelected
                      ]}
                      onPress={() => {
                        const tasks = workerProfile.preferredTasks.includes(task)
                          ? workerProfile.preferredTasks.filter(t => t !== task)
                          : [...workerProfile.preferredTasks, task];
                        setWorkerProfile({...workerProfile, preferredTasks: tasks});
                      }}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        workerProfile.preferredTasks.includes(task) && styles.optionButtonTextSelected
                      ]}>{task}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>About You</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={workerProfile.description}
                  onChangeText={(text) => setWorkerProfile({...workerProfile, description: text})}
                  placeholder="Tell farmers about your experience and strengths..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, profileSubmitting && styles.submitButtonDisabled]}
                onPress={handleCreateProfile}
                disabled={profileSubmitting}
              >
                <Text style={styles.submitButtonText}>
                  {profileSubmitting ? 'Creating...' : 'Create Profile'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
    fontSize: 28,
    color: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 28,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 15,
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterContainer: {
    marginBottom: 15,
    maxHeight: 50,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedFilterChip: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
  },
  selectedFilterChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  postJobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 24,
    color: '#4CAF50',
    marginLeft: 'auto',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
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
  emptyActionButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 15,
  },
  emptyActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileSectionTabs: {
    marginBottom: 15,
    maxHeight: 50,
  },
  profileTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeProfileTab: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  profileTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeProfileTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  profileRating: {
    fontSize: 16,
    color: '#FF9800',
    marginBottom: 12,
  },
  profileDetail: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  profileDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    lineHeight: 20,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 28,
    color: '#666',
    fontWeight: '300',
  },
  modalScroll: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginTop: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  optionButtonTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: 'white',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
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
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
