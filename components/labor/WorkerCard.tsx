import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WorkerProfile } from '../../services/laborService';

interface WorkerCardProps {
  worker: WorkerProfile & { id: string };
  onContact: (worker: WorkerProfile & { id: string }) => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({ worker, onContact }) => {
  return (
    <View style={styles.workerCard}>
      <View style={styles.workerHeader}>
        <View style={styles.workerInfo}>
          <Text style={styles.workerName}>{worker.workerName}</Text>
          <Text style={styles.workerLocation}>📍 {worker.workerLocation}</Text>
        </View>
        <View style={styles.workerRating}>
          <Text style={styles.ratingText}>⭐ {worker.rating.toFixed(1)}</Text>
          <Text style={styles.jobsCompleted}>{worker.completedJobs} jobs</Text>
        </View>
      </View>

      <View style={styles.workerDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.experience}>🕐 {worker.experience} years exp</Text>
          <Text style={styles.wage}>💰 ₹{worker.dailyWage}/day</Text>
        </View>
        <Text style={[styles.availability, {
          color: worker.availability === 'available' ? '#4CAF50' : 
                 worker.availability === 'busy' ? '#f44336' : '#FF9800'
        }]}>
          {worker.availability === 'available' ? '✅ Available' : 
           worker.availability === 'busy' ? '🔴 Busy' : '🌾 Seasonal'}
        </Text>
      </View>

      {worker.description && (
        <Text style={styles.description}>{worker.description}</Text>
      )}

      {worker.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          <Text style={styles.skillsTitle}>Skills:</Text>
          <View style={styles.skillsRow}>
            {worker.skills.slice(0, 4).map((skill, index) => (
              <Text key={index} style={styles.skillTag}>{skill}</Text>
            ))}
            {worker.skills.length > 4 && (
              <Text style={styles.moreSkills}>+{worker.skills.length - 4} more</Text>
            )}
          </View>
        </View>
      )}

      {worker.preferredTasks.length > 0 && (
        <View style={styles.tasksContainer}>
          <Text style={styles.tasksTitle}>Preferred:</Text>
          <View style={styles.tasksRow}>
            {worker.preferredTasks.slice(0, 3).map((task, index) => (
              <Text key={index} style={styles.taskTag}>{task}</Text>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity
        style={styles.contactButton}
        onPress={() => onContact(worker)}
      >
        <Text style={styles.contactButtonText}>📞 Contact Worker</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  workerCard: {
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
  workerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  workerLocation: {
    fontSize: 13,
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
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  experience: {
    fontSize: 13,
    color: '#666',
  },
  wage: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4CAF50',
  },
  availability: {
    fontSize: 13,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  skillsContainer: {
    marginBottom: 10,
  },
  skillsTitle: {
    fontSize: 12,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 11,
    marginRight: 6,
    marginBottom: 6,
  },
  moreSkills: {
    fontSize: 11,
    color: '#2196F3',
    fontWeight: '500',
    paddingVertical: 4,
  },
  tasksContainer: {
    marginBottom: 12,
  },
  tasksTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  tasksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  taskTag: {
    backgroundColor: '#FFF3E0',
    color: '#F57C00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 11,
    marginRight: 6,
    marginBottom: 6,
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
});
