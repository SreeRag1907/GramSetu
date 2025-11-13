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
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  categories,
  mockSchemes,
  getStatusColor,
  getStatusIcon,
  validateApplicationForm,
  initialApplicationForm,
} from '../data/schemes-data';
import {
  Scheme,
  SchemeApplication,
  getActiveSchemes,
  submitSchemeApplication,
  getUserApplications,
  initializeSchemesCollection,
} from '../services/schemesService';

const Schemes = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [applications, setApplications] = useState<SchemeApplication[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'applications'>('available');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [applicationForm, setApplicationForm] = useState(initialApplicationForm);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // User data
  const [userPhone, setUserPhone] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [userState, setUserState] = useState<string>('');
  const [userDistrict, setUserDistrict] = useState<string>('');

  useEffect(() => {
    loadUserData();
    initializeData();
  }, []);

  useEffect(() => {
    if (userPhone) {
      loadApplicationsData();
    }
  }, [userPhone]);

  const loadUserData = async () => {
    try {
      const [phone, name, state, district] = await AsyncStorage.multiGet([
        'userPhone',
        'userName',
        'userState',
        'userDistrict',
      ]);
      
      setUserPhone(phone[1] || '');
      setUserName(name[1] || '');
      setUserState(state[1] || '');
      setUserDistrict(district[1] || '');
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const initializeData = async () => {
    try {
      setLoading(true);
      
      // Initialize schemes in Firestore (only runs once)
      await initializeSchemesCollection(mockSchemes);
      
      // Load schemes from Firebase
      await loadSchemesData();
      
      setLoading(false);
    } catch (error) {
      console.error('Error initializing data:', error);
      setLoading(false);
    }
  };

  const loadSchemesData = async () => {
    try {
      const schemesData = await getActiveSchemes(selectedCategory);
      setSchemes(schemesData);
    } catch (error) {
      console.error('Error loading schemes:', error);
      Alert.alert('Error', 'Failed to load schemes. Please try again.');
    }
  };

  const loadApplicationsData = async () => {
    try {
      if (!userPhone) return;
      
      const applicationsData = await getUserApplications(userPhone);
      setApplications(applicationsData);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSchemesData();
    if (userPhone) {
      await loadApplicationsData();
    }
    setRefreshing(false);
  };



  useEffect(() => {
    if (!loading) {
      loadSchemesData();
    }
  }, [selectedCategory]);

  const filteredSchemes = schemes;

  const handleApplyScheme = (scheme: Scheme) => {
    // Check if user is logged in
    if (!userPhone) {
      Alert.alert(
        'Login Required',
        'Please complete registration to apply for schemes',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Registration', onPress: () => router.push('/onboarding/registration') }
        ]
      );
      return;
    }

    // Check if already applied
    const alreadyApplied = applications.some(app => app.schemeId === scheme.id);
    if (alreadyApplied) {
      Alert.alert(
        'Already Applied',
        'You have already applied for this scheme. Check the "My Applications" tab to track its status.'
      );
      return;
    }

    setSelectedScheme(scheme);
    setShowApplicationModal(true);
    
    // Pre-fill form with user data
    setApplicationForm(prev => ({
      ...prev,
      farmerName: userName || '',
      mobileNumber: userPhone || '',
      address: `${userDistrict || ''}, ${userState || ''}`.trim().replace(/^, |, $/, ''),
    }));
  };

  const submitApplication = async () => {
    if (!selectedScheme) return;

    // Validate required fields
    const missingFields = validateApplicationForm(applicationForm);

    if (missingFields.length > 0) {
      Alert.alert('Error', 'Please fill all required fields: Full Name, Aadhar Number, Mobile Number, and Address');
      return;
    }

    // Validate Aadhar number (12 digits)
    if (applicationForm.aadharNumber.length !== 12) {
      Alert.alert('Error', 'Please enter a valid 12-digit Aadhar number');
      return;
    }

    // Validate mobile number (10 digits)
    if (applicationForm.mobileNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitSchemeApplication({
        schemeId: selectedScheme.id!,
        schemeName: selectedScheme.title,
        userId: userPhone,
        userName: userName,
        userPhone: userPhone,
        userState: userState,
        userDistrict: userDistrict,
        ...applicationForm,
        status: 'pending',
      });

      if (result.success) {
        setShowApplicationModal(false);
        setApplicationForm(initialApplicationForm);

        Alert.alert(
          'Success!', 
          result.message || 'Your application has been submitted successfully. You can track its status in the "My Applications" tab.',
          [
            { 
              text: 'View Applications', 
              onPress: () => {
                setActiveTab('applications');
                loadApplicationsData();
              }
            },
            { text: 'OK', style: 'cancel' }
          ]
        );
        
        // Reload applications
        await loadApplicationsData();
      } else {
        Alert.alert('Error', result.error || 'Failed to submit application');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderSchemeCard = (scheme: Scheme) => (
    <View key={scheme.id} style={styles.schemeCard}>
      <View style={styles.schemeHeader}>
        <Text style={styles.schemeIcon}>{scheme.icon}</Text>
        <View style={styles.schemeInfo}>
          <Text style={styles.schemeTitle}>{scheme.title}</Text>
          <Text style={styles.schemeBenefits}>{scheme.benefits}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: scheme.status === 'active' ? '#4CAF50' : '#FF9800' }]}>
          <Text style={styles.statusText}>{scheme.status.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.schemeDescription}>{scheme.description}</Text>

      <View style={styles.schemeDetails}>
        <Text style={styles.detailTitle}>📋 Eligibility:</Text>
        {scheme.eligibility.map((item, index) => (
          <Text key={index} style={styles.detailItem}>• {item}</Text>
        ))}
      </View>

      <View style={styles.schemeDetails}>
        <Text style={styles.detailTitle}>📄 Required Documents:</Text>
        <Text style={styles.detailItem}>{scheme.documents.join(', ')}</Text>
      </View>

      <View style={styles.schemeFooter}>
        <Text style={styles.deadline}>⏰ Deadline: {scheme.deadline}</Text>
        <TouchableOpacity
          style={[styles.applyButton, scheme.status !== 'active' && styles.disabledButton]}
          onPress={() => handleApplyScheme(scheme)}
          disabled={scheme.status !== 'active'}
        >
          <Text style={styles.applyButtonText}>
            {scheme.status === 'active' ? 'Apply Now' : 'Not Available'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderApplicationCard = (application: SchemeApplication) => {
    const formatDate = (date: Date | undefined) => {
      if (!date) return 'N/A';
      return date.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    };

    return (
      <View key={application.id} style={styles.applicationCard}>
        <View style={styles.applicationHeader}>
          <Text style={styles.applicationTitle}>{application.schemeName}</Text>
          <View style={[styles.applicationStatus, { backgroundColor: getStatusColor(application.status) }]}>
            <Text style={styles.applicationStatusText}>
              {getStatusIcon(application.status)} {application.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>
        
        <Text style={styles.applicationDate}>Applied on: {formatDate(application.applicationDate)}</Text>
        
        {application.remarks && (
          <View style={styles.remarksContainer}>
            <Text style={styles.remarksTitle}>📝 Status Update:</Text>
            <Text style={styles.remarksText}>{application.remarks}</Text>
            {application.reviewedAt && (
              <Text style={styles.reviewDate}>Updated: {formatDate(application.reviewedAt)}</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
        <Text style={styles.loadingText}>Loading schemes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Government Schemes</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
            Available Schemes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'applications' && styles.activeTab]}
          onPress={() => setActiveTab('applications')}
        >
          <Text style={[styles.tabText, activeTab === 'applications' && styles.activeTabText]}>
            My Applications ({applications.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'available' && (
        <View style={styles.filtersSection}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Categories</Text>
            <Text style={styles.filterSubtitle}>Select a category to filter schemes</Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.categoriesScrollContainer}
            style={styles.categoriesContainer}
          >
            {categories.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.selectedCategoryChip,
                  index === 0 && styles.firstCategory,
                  index === categories.length - 1 && styles.lastCategory
                ]}
                onPress={() => setSelectedCategory(category.id)}
                activeOpacity={0.7}
              >
                <View style={styles.categoryChipContent}>
                  <Text style={[
                    styles.categoryChipIcon,
                    selectedCategory === category.id && styles.selectedCategoryChipIcon
                  ]}>
                    {category.icon}
                  </Text>
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategory === category.id && styles.selectedCategoryChipText
                  ]}>
                    {category.name}
                  </Text>
                </View>
                {selectedCategory === category.id && <View style={styles.selectedIndicator} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#9C27B0']}
            tintColor="#9C27B0"
          />
        }
      >
        {activeTab === 'available' ? (
          <View style={styles.schemesContainer}>
            {filteredSchemes.map(renderSchemeCard)}
          </View>
        ) : (
          <View style={styles.applicationsContainer}>
            {applications.length > 0 ? (
              applications.map(renderApplicationCard)
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>No Applications Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Apply for schemes to track their status here
                </Text>
                <TouchableOpacity
                  style={styles.browseButton}
                  onPress={() => setActiveTab('available')}
                >
                  <Text style={styles.browseButtonText}>Browse Schemes</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Application Modal */}
      <Modal
        visible={showApplicationModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Apply for Scheme</Text>
              <TouchableOpacity onPress={() => setShowApplicationModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedScheme && (
              <View style={styles.schemePreview}>
                <Text style={styles.schemePreviewTitle}>{selectedScheme.title}</Text>
                <Text style={styles.schemePreviewBenefits}>{selectedScheme.benefits}</Text>
              </View>
            )}

            <ScrollView style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={applicationForm.farmerName}
                  onChangeText={(text) => setApplicationForm(prev => ({...prev, farmerName: text}))}
                  placeholder="Enter your full name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Father's Name</Text>
                <TextInput
                  style={styles.input}
                  value={applicationForm.fatherName}
                  onChangeText={(text) => setApplicationForm(prev => ({...prev, fatherName: text}))}
                  placeholder="Enter father's name"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Aadhar Number *</Text>
                <TextInput
                  style={styles.input}
                  value={applicationForm.aadharNumber}
                  onChangeText={(text) => setApplicationForm(prev => ({...prev, aadharNumber: text}))}
                  placeholder="Enter 12-digit Aadhar number"
                  keyboardType="numeric"
                  maxLength={12}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mobile Number *</Text>
                <TextInput
                  style={styles.input}
                  value={applicationForm.mobileNumber}
                  onChangeText={(text) => setApplicationForm(prev => ({...prev, mobileNumber: text}))}
                  placeholder="Enter mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Address *</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={applicationForm.address}
                  onChangeText={(text) => setApplicationForm(prev => ({...prev, address: text}))}
                  placeholder="Enter complete address"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Land Holding (in acres)</Text>
                <TextInput
                  style={styles.input}
                  value={applicationForm.landHolding}
                  onChangeText={(text) => setApplicationForm(prev => ({...prev, landHolding: text}))}
                  placeholder="Enter land holding"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Primary Crop</Text>
                <TextInput
                  style={styles.input}
                  value={applicationForm.cropType}
                  onChangeText={(text) => setApplicationForm(prev => ({...prev, cropType: text}))}
                  placeholder="Enter primary crop"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Bank Account Number</Text>
                <TextInput
                  style={styles.input}
                  value={applicationForm.bankAccount}
                  onChangeText={(text) => setApplicationForm(prev => ({...prev, bankAccount: text}))}
                  placeholder="Enter bank account number"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>IFSC Code</Text>
                <TextInput
                  style={styles.input}
                  value={applicationForm.ifscCode}
                  onChangeText={(text) => setApplicationForm(prev => ({...prev, ifscCode: text.toUpperCase()}))}
                  placeholder="Enter IFSC code"
                  autoCapitalize="characters"
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.disabledButton]}
                onPress={submitApplication}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#9C27B0',
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    minHeight: 50,
  },
  activeTab: {
    borderBottomColor: '#9C27B0',
    backgroundColor: 'rgba(156, 39, 176, 0.05)',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
    flexShrink: 1,
  },
  activeTabText: {
    color: '#9C27B0',
    fontWeight: '700',
  },
  filtersSection: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterHeader: {
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  filterSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  categoriesContainer: {
    flexGrow: 0,
  },
  categoriesScrollContainer: {
    paddingRight: 20,
  },
  categoryChip: {
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    minWidth: 80,
    maxWidth: 120,
    position: 'relative',
    overflow: 'hidden',
  },
  selectedCategoryChip: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  firstCategory: {
    marginLeft: 0,
  },
  lastCategory: {
    marginRight: 0,
  },
  categoryChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  selectedCategoryChipIcon: {
    color: '#4CAF50',
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#495057',
    textAlign: 'center',
  },
  selectedCategoryChipText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  content: {
    flex: 1,
  },
  schemesContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  schemeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 2,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  schemeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    minHeight: 60,
  },
  schemeIcon: {
    fontSize: 36,
    marginRight: 16,
    marginTop: 2,
  },
  schemeInfo: {
    flex: 1,
    paddingRight: 8,
  },
  schemeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 6,
    lineHeight: 22,
  },
  schemeBenefits: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
    lineHeight: 18,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 70,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  schemeDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 21,
    marginBottom: 16,
  },
  schemeDetails: {
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#9C27B0',
  },
  detailTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  detailItem: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
    paddingLeft: 8,
  },
  schemeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    minHeight: 50,
  },
  deadline: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
    flex: 1,
  },
  applyButton: {
    backgroundColor: '#9C27B0',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    minWidth: 100,
  },
  disabledButton: {
    backgroundColor: '#CCC',
    elevation: 0,
    shadowOpacity: 0,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  applicationsContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  applicationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 2,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    minHeight: 40,
  },
  applicationTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    marginRight: 12,
    lineHeight: 20,
  },
  applicationStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 80,
    alignItems: 'center',
  },
  applicationStatusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  applicationDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  remarksContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  remarksTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  remarksText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  reviewDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
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
    marginBottom: 30,
  },
  browseButton: {
    backgroundColor: '#9C27B0',
    borderRadius: 10,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    minHeight: 60,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    fontSize: 28,
    color: '#666',
    fontWeight: '300',
    padding: 4,
  },
  schemePreview: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  schemePreviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  schemePreviewBenefits: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  formContainer: {
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
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#9C27B0',
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

export default Schemes;
