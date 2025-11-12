import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { JobListing } from '../../services/laborService';

interface JobCardProps {
  job: JobListing & { id: string };
  userPhone: string;
  onApply?: (job: JobListing & { id: string }) => void;
  onView?: (job: JobListing & { id: string }) => void;
  showApplyButton?: boolean;
  showApplicantCount?: boolean;
  onViewApplicants?: (job: JobListing & { id: string }) => void;
  onDelete?: (jobId: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  userPhone,
  onApply,
  onView,
  showApplyButton = true,
  showApplicantCount = false,
  onViewApplicants,
  onDelete,
}) => {
  const hasApplied = job.applicants && job.applicants.includes(userPhone);

  const handlePress = () => {
    if (onView) {
      onView(job);
    }
  };

  return (
    <View style={styles.jobCard}>
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
        {showApplicantCount && (
          <Text style={styles.applicants}>
            📨 {job.applicants?.length || 0} applicants
          </Text>
        )}
      </View>

      <Text style={styles.jobDescription}>{job.description}</Text>

      {job.skillsRequired && job.skillsRequired.length > 0 && (
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

      {showApplyButton && (
        <View style={styles.jobFooter}>
          <Text style={styles.urgencyText}>
            {job.urgency === 'immediate' ? '🔴 Immediate' : 
             job.urgency === 'within_week' ? '🟡 This Week' : '🟢 Planned'}
          </Text>
          <TouchableOpacity
            style={[styles.applyButton, hasApplied && styles.appliedButton]}
            onPress={() => {
              handlePress();
              if (onApply && !hasApplied) {
                onApply(job);
              }
            }}
            disabled={hasApplied}
          >
            <Text style={styles.applyButtonText}>
              {hasApplied ? 'Applied' : 'Apply Now'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {(onViewApplicants || onDelete) && (
        <View style={styles.jobActionsRow}>
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#f44336' }]}
              onPress={() => onDelete(job.id)}
            >
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
          {onViewApplicants && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
              onPress={() => onViewApplicants(job)}
            >
              <Text style={styles.actionButtonText}>
                View Applicants ({job.applicants?.length || 0})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  jobCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
    marginBottom: 4,
  },
  workersNeeded: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  duration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  workingHours: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  applicants: {
    fontSize: 14,
    color: '#2196F3',
    marginTop: 4,
  },
  jobDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  skillsContainer: {
    marginBottom: 12,
  },
  skillsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#E3F2FD',
    color: '#1976D2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    fontSize: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  farmerInfo: {
    marginBottom: 10,
  },
  farmerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
  },
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  benefit: {
    backgroundColor: '#FFF3E0',
    color: '#F57C00',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    marginRight: 8,
    marginBottom: 6,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  urgencyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  appliedButton: {
    backgroundColor: '#9E9E9E',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  jobActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
