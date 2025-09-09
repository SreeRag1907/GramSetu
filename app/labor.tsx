import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Laborer {
  id: string;
  name: string;
  phoneNumber: string;
  wageRate: number;
  wageType: 'daily' | 'hourly' | 'piece';
  joiningDate: string;
  totalEarnings: number;
  totalHours: number;
  totalDays: number;
  isActive: boolean;
}

interface WorkEntry {
  id: string;
  laborerId: string;
  date: string;
  hours?: number;
  task: string;
  description: string;
  calculatedWage: number;
  isPaid: boolean;
  paymentDate?: string;
}

interface PaymentRecord {
  id: string;
  laborerId: string;
  amount: number;
  date: string;
  workEntryIds: string[];
  paymentMethod: 'cash' | 'bank_transfer' | 'upi';
  notes?: string;
}

const LaborManagement = () => {
  const [activeTab, setActiveTab] = useState<'laborers' | 'work' | 'payments'>('laborers');
  const [laborers, setLaborers] = useState<Laborer[]>([]);
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  
  const [showAddLaborerModal, setShowAddLaborerModal] = useState(false);
  const [showLogWorkModal, setShowLogWorkModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const [selectedLaborer, setSelectedLaborer] = useState<Laborer | null>(null);
  
  const [newLaborer, setNewLaborer] = useState({
    name: '',
    phoneNumber: '',
    wageRate: '',
    wageType: 'daily' as 'daily' | 'hourly' | 'piece',
  });

  const [newWorkEntry, setNewWorkEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: '',
    task: '',
    description: '',
  });

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank_transfer' | 'upi'>('cash');
  const [paymentNotes, setPaymentNotes] = useState('');

  const commonTasks = [
    'Field Preparation', 'Sowing', 'Weeding', 'Irrigation', 'Fertilizer Application',
    'Pest Control', 'Harvesting', 'Threshing', 'Loading/Unloading', 'General Farm Work'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Mock data for demonstration
      const mockLaborers: Laborer[] = [
        {
          id: '1',
          name: 'Rajesh Kumar',
          phoneNumber: '9876543210',
          wageRate: 350,
          wageType: 'daily',
          joiningDate: '2024-01-01',
          totalEarnings: 8750,
          totalHours: 200,
          totalDays: 25,
          isActive: true,
        },
        {
          id: '2',
          name: 'Sunita Devi',
          phoneNumber: '9876543211',
          wageRate: 40,
          wageType: 'hourly',
          joiningDate: '2024-01-05',
          totalEarnings: 4800,
          totalHours: 120,
          totalDays: 20,
          isActive: true,
        },
        {
          id: '3',
          name: 'Mohan Singh',
          phoneNumber: '9876543212',
          wageRate: 300,
          wageType: 'daily',
          joiningDate: '2023-12-15',
          totalEarnings: 12600,
          totalHours: 336,
          totalDays: 42,
          isActive: false,
        },
      ];

      const mockWorkEntries: WorkEntry[] = [
        {
          id: '1',
          laborerId: '1',
          date: '2024-01-15',
          hours: 8,
          task: 'Field Preparation',
          description: 'Plowing and leveling the field for wheat sowing',
          calculatedWage: 350,
          isPaid: true,
          paymentDate: '2024-01-15',
        },
        {
          id: '2',
          laborerId: '1',
          date: '2024-01-14',
          hours: 6,
          task: 'Irrigation',
          description: 'Setting up irrigation channels',
          calculatedWage: 350,
          isPaid: false,
        },
        {
          id: '3',
          laborerId: '2',
          date: '2024-01-15',
          hours: 5,
          task: 'Weeding',
          description: 'Manual weeding in tomato field',
          calculatedWage: 200,
          isPaid: false,
        },
      ];

      const mockPayments: PaymentRecord[] = [
        {
          id: '1',
          laborerId: '1',
          amount: 1750,
          date: '2024-01-15',
          workEntryIds: ['1'],
          paymentMethod: 'cash',
          notes: 'Payment for 5 days work',
        },
      ];

      setLaborers(mockLaborers);
      setWorkEntries(mockWorkEntries);
      setPayments(mockPayments);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addLaborer = () => {
    if (!newLaborer.name || !newLaborer.phoneNumber || !newLaborer.wageRate) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const laborer: Laborer = {
      id: Date.now().toString(),
      name: newLaborer.name,
      phoneNumber: newLaborer.phoneNumber,
      wageRate: parseFloat(newLaborer.wageRate),
      wageType: newLaborer.wageType,
      joiningDate: new Date().toISOString().split('T')[0],
      totalEarnings: 0,
      totalHours: 0,
      totalDays: 0,
      isActive: true,
    };

    setLaborers([...laborers, laborer]);
    setNewLaborer({ name: '', phoneNumber: '', wageRate: '', wageType: 'daily' });
    setShowAddLaborerModal(false);
    Alert.alert('Success', 'Laborer added successfully!');
  };

  const logWork = () => {
    if (!selectedLaborer || !newWorkEntry.task || !newWorkEntry.hours) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const hours = parseFloat(newWorkEntry.hours);
    let calculatedWage = 0;

    switch (selectedLaborer.wageType) {
      case 'hourly':
        calculatedWage = hours * selectedLaborer.wageRate;
        break;
      case 'daily':
        calculatedWage = selectedLaborer.wageRate;
        break;
      case 'piece':
        calculatedWage = selectedLaborer.wageRate;
        break;
    }

    const workEntry: WorkEntry = {
      id: Date.now().toString(),
      laborerId: selectedLaborer.id,
      date: newWorkEntry.date,
      hours: hours,
      task: newWorkEntry.task,
      description: newWorkEntry.description,
      calculatedWage: calculatedWage,
      isPaid: false,
    };

    setWorkEntries([...workEntries, workEntry]);

    // Update laborer totals
    const updatedLaborers = laborers.map(laborer => {
      if (laborer.id === selectedLaborer.id) {
        return {
          ...laborer,
          totalHours: laborer.totalHours + hours,
          totalDays: laborer.totalDays + 1,
        };
      }
      return laborer;
    });
    setLaborers(updatedLaborers);

    setNewWorkEntry({
      date: new Date().toISOString().split('T')[0],
      hours: '',
      task: '',
      description: '',
    });
    setShowLogWorkModal(false);
    Alert.alert('Success', 'Work logged successfully!');
  };

  const makePayment = () => {
    if (!selectedLaborer || !paymentAmount) {
      Alert.alert('Error', 'Please enter payment amount');
      return;
    }

    const amount = parseFloat(paymentAmount);
    const unpaidEntries = workEntries.filter(
      entry => entry.laborerId === selectedLaborer.id && !entry.isPaid
    );

    if (unpaidEntries.length === 0) {
      Alert.alert('Info', 'No pending payments for this laborer');
      return;
    }

    const payment: PaymentRecord = {
      id: Date.now().toString(),
      laborerId: selectedLaborer.id,
      amount: amount,
      date: new Date().toISOString().split('T')[0],
      workEntryIds: unpaidEntries.map(entry => entry.id),
      paymentMethod: paymentMethod,
      notes: paymentNotes,
    };

    // Mark work entries as paid
    const updatedWorkEntries = workEntries.map(entry => {
      if (unpaidEntries.some(unpaid => unpaid.id === entry.id)) {
        return { ...entry, isPaid: true, paymentDate: payment.date };
      }
      return entry;
    });

    // Update laborer total earnings
    const updatedLaborers = laborers.map(laborer => {
      if (laborer.id === selectedLaborer.id) {
        return { ...laborer, totalEarnings: laborer.totalEarnings + amount };
      }
      return laborer;
    });

    setPayments([...payments, payment]);
    setWorkEntries(updatedWorkEntries);
    setLaborers(updatedLaborers);

    setPaymentAmount('');
    setPaymentNotes('');
    setShowPaymentModal(false);
    Alert.alert('Success', `Payment of ₹${amount} recorded successfully!`);
  };

  const getPendingWages = (laborerId: string) => {
    return workEntries
      .filter(entry => entry.laborerId === laborerId && !entry.isPaid)
      .reduce((total, entry) => total + entry.calculatedWage, 0);
  };

  const renderLaborerCard = (laborer: Laborer) => (
    <TouchableOpacity
      key={laborer.id}
      style={[styles.laborerCard, !laborer.isActive && styles.inactiveLaborerCard]}
      onPress={() => {
        setSelectedLaborer(laborer);
        // Could navigate to laborer details page
      }}
    >
      <View style={styles.laborerHeader}>
        <Text style={styles.laborerName}>{laborer.name}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: laborer.isActive ? '#4CAF50' : '#999' }
        ]}>
          <Text style={styles.statusText}>
            {laborer.isActive ? 'ACTIVE' : 'INACTIVE'}
          </Text>
        </View>
      </View>

      <Text style={styles.laborerPhone}>📞 {laborer.phoneNumber}</Text>
      <Text style={styles.wageInfo}>
        💰 ₹{laborer.wageRate} per {laborer.wageType}
      </Text>

      <View style={styles.laborerStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>₹{laborer.totalEarnings}</Text>
          <Text style={styles.statLabel}>Total Earned</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{laborer.totalDays}</Text>
          <Text style={styles.statLabel}>Days Worked</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>₹{getPendingWages(laborer.id)}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      <View style={styles.laborerActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setSelectedLaborer(laborer);
            setShowLogWorkModal(true);
          }}
        >
          <Text style={styles.actionButtonText}>📝 Log Work</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.paymentButton]}
          onPress={() => {
            setSelectedLaborer(laborer);
            setShowPaymentModal(true);
          }}
        >
          <Text style={[styles.actionButtonText, styles.paymentButtonText]}>💰 Pay</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderWorkEntry = (entry: WorkEntry) => {
    const laborer = laborers.find(l => l.id === entry.laborerId);
    return (
      <View key={entry.id} style={styles.workEntryCard}>
        <View style={styles.workEntryHeader}>
          <Text style={styles.workerName}>👨‍🌾 {laborer?.name}</Text>
          <Text style={styles.workDate}>{entry.date}</Text>
        </View>
        
        <Text style={styles.taskName}>📋 {entry.task}</Text>
        {entry.description && (
          <Text style={styles.taskDescription}>{entry.description}</Text>
        )}
        
        <View style={styles.workDetails}>
          <Text style={styles.workHours}>⏰ {entry.hours} hours</Text>
          <Text style={styles.workWage}>💰 ₹{entry.calculatedWage}</Text>
          <View style={[
            styles.paymentStatus,
            { backgroundColor: entry.isPaid ? '#4CAF50' : '#FF9800' }
          ]}>
            <Text style={styles.paymentStatusText}>
              {entry.isPaid ? '✅ PAID' : '⏳ PENDING'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPaymentRecord = (payment: PaymentRecord) => {
    const laborer = laborers.find(l => l.id === payment.laborerId);
    return (
      <View key={payment.id} style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <Text style={styles.paymentLaborer}>👨‍🌾 {laborer?.name}</Text>
          <Text style={styles.paymentAmount}>₹{payment.amount}</Text>
        </View>
        
        <Text style={styles.paymentDate}>📅 {payment.date}</Text>
        <Text style={styles.paymentMethod}>💳 {payment.paymentMethod.replace('_', ' ').toUpperCase()}</Text>
        
        {payment.notes && (
          <Text style={styles.paymentNotes}>📝 {payment.notes}</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Labor Management</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'laborers' && styles.activeTab]}
          onPress={() => setActiveTab('laborers')}
        >
          <Text style={[styles.tabText, activeTab === 'laborers' && styles.activeTabText]}>
            Workers ({laborers.filter(l => l.isActive).length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'work' && styles.activeTab]}
          onPress={() => setActiveTab('work')}
        >
          <Text style={[styles.tabText, activeTab === 'work' && styles.activeTabText]}>
            Work Log
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'payments' && styles.activeTab]}
          onPress={() => setActiveTab('payments')}
        >
          <Text style={[styles.tabText, activeTab === 'payments' && styles.activeTabText]}>
            Payments
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'laborers' && (
          <View style={styles.laborersContainer}>
            <TouchableOpacity
              style={styles.addLaborerButton}
              onPress={() => setShowAddLaborerModal(true)}
            >
              <Text style={styles.addLaborerIcon}>➕</Text>
              <Text style={styles.addLaborerText}>Add New Worker</Text>
            </TouchableOpacity>

            {laborers.filter(l => l.isActive).map(renderLaborerCard)}
            
            {laborers.filter(l => !l.isActive).length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Inactive Workers</Text>
                {laborers.filter(l => !l.isActive).map(renderLaborerCard)}
              </>
            )}
          </View>
        )}

        {activeTab === 'work' && (
          <View style={styles.workContainer}>
            {workEntries.length > 0 ? (
              workEntries
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(renderWorkEntry)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>No Work Entries</Text>
                <Text style={styles.emptySubtitle}>Log work for your laborers to track their activities</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'payments' && (
          <View style={styles.paymentsContainer}>
            {payments.length > 0 ? (
              payments
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(renderPaymentRecord)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💰</Text>
                <Text style={styles.emptyTitle}>No Payments Made</Text>
                <Text style={styles.emptySubtitle}>Payment records will appear here once you start making payments</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Add Laborer Modal */}
      <Modal visible={showAddLaborerModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Worker</Text>
              <TouchableOpacity onPress={() => setShowAddLaborerModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Worker Name *</Text>
                <TextInput
                  style={styles.input}
                  value={newLaborer.name}
                  onChangeText={(text) => setNewLaborer(prev => ({...prev, name: text}))}
                  placeholder="Enter worker's full name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  value={newLaborer.phoneNumber}
                  onChangeText={(text) => setNewLaborer(prev => ({...prev, phoneNumber: text}))}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Wage Type</Text>
                <View style={styles.wageTypeContainer}>
                  {(['daily', 'hourly', 'piece'] as const).map(type => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.wageTypeButton,
                        newLaborer.wageType === type && styles.selectedWageType
                      ]}
                      onPress={() => setNewLaborer(prev => ({...prev, wageType: type}))}
                    >
                      <Text style={[
                        styles.wageTypeText,
                        newLaborer.wageType === type && styles.selectedWageTypeText
                      ]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Wage Rate (₹ per {newLaborer.wageType}) *
                </Text>
                <TextInput
                  style={styles.input}
                  value={newLaborer.wageRate}
                  onChangeText={(text) => setNewLaborer(prev => ({...prev, wageRate: text}))}
                  placeholder={`Enter wage per ${newLaborer.wageType}`}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={addLaborer}>
                <Text style={styles.submitButtonText}>Add Worker</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Log Work Modal */}
      <Modal visible={showLogWorkModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Work Entry</Text>
              <TouchableOpacity onPress={() => setShowLogWorkModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedLaborer && (
              <View style={styles.selectedLaborerInfo}>
                <Text style={styles.selectedLaborerName}>
                  👨‍🌾 {selectedLaborer.name}
                </Text>
                <Text style={styles.selectedLaborerWage}>
                  ₹{selectedLaborer.wageRate} per {selectedLaborer.wageType}
                </Text>
              </View>
            )}

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date</Text>
                <TextInput
                  style={styles.input}
                  value={newWorkEntry.date}
                  onChangeText={(text) => setNewWorkEntry(prev => ({...prev, date: text}))}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Hours Worked *</Text>
                <TextInput
                  style={styles.input}
                  value={newWorkEntry.hours}
                  onChangeText={(text) => setNewWorkEntry(prev => ({...prev, hours: text}))}
                  placeholder="Enter hours worked"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Task *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {commonTasks.map(task => (
                    <TouchableOpacity
                      key={task}
                      style={[
                        styles.taskButton,
                        newWorkEntry.task === task && styles.selectedTask
                      ]}
                      onPress={() => setNewWorkEntry(prev => ({...prev, task}))}
                    >
                      <Text style={[
                        styles.taskButtonText,
                        newWorkEntry.task === task && styles.selectedTaskText
                      ]}>
                        {task}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={newWorkEntry.description}
                  onChangeText={(text) => setNewWorkEntry(prev => ({...prev, description: text}))}
                  placeholder="Describe the work done (optional)"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={logWork}>
                <Text style={styles.submitButtonText}>Log Work Entry</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Payment Modal */}
      <Modal visible={showPaymentModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Make Payment</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedLaborer && (
              <View style={styles.paymentSummary}>
                <Text style={styles.paymentSummaryTitle}>
                  👨‍🌾 {selectedLaborer.name}
                </Text>
                <Text style={styles.pendingAmount}>
                  Pending: ₹{getPendingWages(selectedLaborer.id)}
                </Text>
              </View>
            )}

            <ScrollView style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Payment Amount (₹) *</Text>
                <TextInput
                  style={styles.input}
                  value={paymentAmount}
                  onChangeText={setPaymentAmount}
                  placeholder="Enter payment amount"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Payment Method</Text>
                <View style={styles.paymentMethodContainer}>
                  {(['cash', 'bank_transfer', 'upi'] as const).map(method => (
                    <TouchableOpacity
                      key={method}
                      style={[
                        styles.paymentMethodButton,
                        paymentMethod === method && styles.selectedPaymentMethod
                      ]}
                      onPress={() => setPaymentMethod(method)}
                    >
                      <Text style={[
                        styles.paymentMethodText,
                        paymentMethod === method && styles.selectedPaymentMethodText
                      ]}>
                        {method === 'bank_transfer' ? 'Bank Transfer' : 
                         method === 'upi' ? 'UPI' : 'Cash'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={paymentNotes}
                  onChangeText={setPaymentNotes}
                  placeholder="Add any payment notes (optional)"
                  multiline
                  numberOfLines={2}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={makePayment}>
                <Text style={styles.submitButtonText}>Record Payment</Text>
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
    backgroundColor: '#F44336',
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
    borderBottomColor: '#F44336',
  },
  tabText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#F44336',
  },
  content: {
    flex: 1,
  },
  laborersContainer: {
    padding: 15,
  },
  addLaborerButton: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    borderWidth: 2,
    borderColor: '#F44336',
    borderStyle: 'dashed',
  },
  addLaborerIcon: {
    fontSize: 24,
    marginRight: 10,
    color: '#F44336',
  },
  addLaborerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
  },
  laborerCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  inactiveLaborerCard: {
    opacity: 0.7,
  },
  laborerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  laborerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  laborerPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  wageInfo: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 15,
  },
  laborerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  laborerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  paymentButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  paymentButtonText: {
    color: 'white',
  },
  workContainer: {
    padding: 15,
  },
  workEntryCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
  },
  workEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workerName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  workDate: {
    fontSize: 12,
    color: '#666',
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  taskDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
    lineHeight: 18,
  },
  workDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workHours: {
    fontSize: 12,
    color: '#666',
  },
  workWage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  paymentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  paymentStatusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  paymentsContainer: {
    padding: 15,
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentLaborer: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  paymentDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  paymentMethod: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  paymentNotes: {
    fontSize: 12,
    color: '#333',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
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
    fontSize: 24,
    color: '#666',
  },
  selectedLaborerInfo: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectedLaborerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  selectedLaborerWage: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  paymentSummary: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  paymentSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  pendingAmount: {
    fontSize: 18,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  modalForm: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  multilineInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  wageTypeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  wageTypeButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedWageType: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  wageTypeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  selectedWageTypeText: {
    color: 'white',
  },
  taskButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedTask: {
    backgroundColor: '#F44336',
    borderColor: '#F44336',
  },
  taskButtonText: {
    fontSize: 12,
    color: '#666',
  },
  selectedTaskText: {
    color: 'white',
    fontWeight: 'bold',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentMethodButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedPaymentMethod: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  paymentMethodText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  selectedPaymentMethodText: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#F44336',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LaborManagement;
