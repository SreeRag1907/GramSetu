import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { JobListing, WorkerProfile } from '../../services/laborService';

interface ProfileOverviewProps {
  myJobs: (JobListing & { id: string })[];
  myApplications: (JobListing & { id: string })[];
  myProfile: (WorkerProfile & { id: string }) | null;
  onSectionChange: (section: 'my-jobs' | 'my-applications' | 'worker-profile') => void;
  onCreateProfile: () => void;
  onPostJob: () => void;
  onBrowseJobs: () => void;
}

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({
  myJobs,
  myApplications,
  myProfile,
  onSectionChange,
  onCreateProfile,
  onPostJob,
  onBrowseJobs,
}) => {
  const totalApplicants = myJobs.reduce((sum, job) => sum + (job.applicants?.length || 0), 0);

  return (
    <View style={styles.overviewSection}>
      <Text style={styles.sectionTitle}>My Activity</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{myJobs.length}</Text>
          <Text style={styles.statLabel}>Jobs Posted</Text>
          <TouchableOpacity 
            style={styles.statButton}
            onPress={() => onSectionChange('my-jobs')}
          >
            <Text style={styles.statButtonText}>View →</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{myApplications.length}</Text>
          <Text style={styles.statLabel}>Applications</Text>
          <TouchableOpacity 
            style={styles.statButton}
            onPress={() => onSectionChange('my-applications')}
          >
            <Text style={styles.statButtonText}>View →</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalApplicants}</Text>
          <Text style={styles.statLabel}>Total Applicants</Text>
          <TouchableOpacity 
            style={styles.statButton}
            onPress={() => onSectionChange('my-jobs')}
          >
            <Text style={styles.statButtonText}>View →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {myProfile && (
        <View style={styles.quickProfileCard}>
          <Text style={styles.quickProfileTitle}>Your Worker Profile</Text>
          <View style={styles.quickProfileRow}>
            <Text style={styles.quickProfileName}>{myProfile.workerName}</Text>
            <Text style={styles.quickProfileRating}>⭐ {myProfile.rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.quickProfileDetail}>
            💰 ₹{myProfile.dailyWage}/day • {myProfile.experience} years exp
          </Text>
          <Text style={styles.quickProfileStatus}>
            {myProfile.availability === 'available' ? '✅ Available for work' : 
             myProfile.availability === 'busy' ? '🔴 Currently busy' : '🌾 Seasonal'}
          </Text>
          <TouchableOpacity 
            style={styles.viewFullProfileButton}
            onPress={() => onSectionChange('worker-profile')}
          >
            <Text style={styles.viewFullProfileText}>View Full Profile →</Text>
          </TouchableOpacity>
        </View>
      )}

      {!myProfile && (
        <View style={styles.noProfileCard}>
          <Text style={styles.noProfileIcon}>👤</Text>
          <Text style={styles.noProfileTitle}>No Worker Profile</Text>
          <Text style={styles.noProfileText}>
            Create a worker profile to find jobs and showcase your skills
          </Text>
          <TouchableOpacity
            style={styles.createProfileButtonSmall}
            onPress={onCreateProfile}
          >
            <Text style={styles.createProfileTextSmall}>Create Profile</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.quickActionsCard}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={onPostJob}
        >
          <Text style={styles.quickActionIcon}>📝</Text>
          <Text style={styles.quickActionText}>Post a New Job</Text>
          <Text style={styles.quickActionArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={onBrowseJobs}
        >
          <Text style={styles.quickActionIcon}>🔍</Text>
          <Text style={styles.quickActionText}>Browse Available Jobs</Text>
          <Text style={styles.quickActionArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overviewSection: {
    gap: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  statButton: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statButtonText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickProfileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickProfileTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  quickProfileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickProfileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  quickProfileRating: {
    fontSize: 16,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  quickProfileDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  quickProfileStatus: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 15,
  },
  viewFullProfileButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  viewFullProfileText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noProfileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noProfileIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  noProfileTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  noProfileText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  createProfileButtonSmall: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  createProfileTextSmall: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickActionsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  quickActionIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  quickActionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  quickActionArrow: {
    fontSize: 20,
    color: '#666',
  },
});
