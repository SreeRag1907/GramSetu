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
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Scheme {
  id: string;
  title: string;
  description: string;
  eligibility: string[];
  benefits: string;
  documents: string[];
  deadline: string;
  category: string;
  icon: string;
  status: 'active' | 'coming_soon' | 'expired';
}

interface Application {
  id: string;
  schemeId: string;
  schemeName: string;
  applicationDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  remarks?: string;
}

const Schemes = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'applications'>('available');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [applicationForm, setApplicationForm] = useState({
    farmerName: '',
    fatherName: '',
    aadharNumber: '',
    mobileNumber: '',
    address: '',
    landHolding: '',
    cropType: '',
    bankAccount: '',
    ifscCode: '',
  });
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'All Schemes', icon: '📋' },
    { id: 'credit', name: 'Credit & Loans', icon: '💰' },
    { id: 'insurance', name: 'Insurance', icon: '🛡️' },
    { id: 'subsidy', name: 'Subsidies', icon: '🎯' },
    { id: 'technology', name: 'Technology', icon: '🚜' },
    { id: 'training', name: 'Training', icon: '📚' },
  ];

  useEffect(() => {
    loadSchemesData();
    loadApplicationsData();
  }, []);

  const loadSchemesData = async () => {
    try {
      setLoading(true);
      
      // Mock schemes data
      const mockSchemes: Scheme[] = [
        {
          id: '1',
          title: 'PM-KISAN Samman Nidhi',
          description: 'Direct income support of ₹6,000 per year to small and marginal farmers.',
          eligibility: [
            'Small and marginal farmers with landholding up to 2 hectares',
            'Valid Aadhar card and bank account',
            'Land ownership documents required'
          ],
          benefits: '₹6,000 per year in three installments of ₹2,000 each',
          documents: ['Aadhar Card', 'Bank Account Details', 'Land Records', 'Mobile Number'],
          deadline: '2024-03-31',
          category: 'credit',
          icon: '💰',
          status: 'active',
        },
        {
          id: '2',
          title: 'Pradhan Mantri Fasal Bima Yojana',
          description: 'Crop insurance scheme providing comprehensive risk coverage for crops.',
          eligibility: [
            'All farmers including sharecroppers and tenant farmers',
            'Coverage for notified crops in notified areas',
            'Must have insurable interest in the crop'
          ],
          benefits: 'Coverage against natural calamities, pests, and diseases',
          documents: ['Aadhar Card', 'Bank Account', 'Land Records', 'Sowing Certificate'],
          deadline: '2024-02-15',
          category: 'insurance',
          icon: '🛡️',
          status: 'active',
        },
        {
          id: '3',
          title: 'Soil Health Card Scheme',
          description: 'Free soil testing and nutrient recommendations for farmers.',
          eligibility: [
            'All farmers with agricultural land',
            'Valid land ownership or tenancy documents',
            'No minimum land holding requirement'
          ],
          benefits: 'Free soil testing and fertilizer recommendations',
          documents: ['Aadhar Card', 'Land Documents', 'Contact Number'],
          deadline: 'Ongoing',
          category: 'subsidy',
          icon: '🌱',
          status: 'active',
        },
        {
          id: '4',
          title: 'Kisan Credit Card (KCC)',
          description: 'Credit facility for agricultural and allied activities.',
          eligibility: [
            'All farmers including tenant farmers',
            'Land ownership or valid tenancy documents',
            'Good credit history preferred'
          ],
          benefits: 'Credit up to ₹3 lakhs at subsidized interest rates',
          documents: ['Aadhar Card', 'PAN Card', 'Land Records', 'Bank Statements'],
          deadline: 'Ongoing',
          category: 'credit',
          icon: '💳',
          status: 'active',
        },
        {
          id: '5',
          title: 'Sub-Mission on Agricultural Mechanization',
          description: 'Financial assistance for purchase of agricultural machinery.',
          eligibility: [
            'Individual farmers and farmer groups',
            'Scheduled Caste/Scheduled Tribe farmers get priority',
            'Women farmers eligible for additional benefits'
          ],
          benefits: '40-50% subsidy on agricultural machinery',
          documents: ['Aadhar Card', 'Bank Account', 'Caste Certificate (if applicable)', 'Quotation'],
          deadline: '2024-04-30',
          category: 'technology',
          icon: '🚜',
          status: 'active',
        },
        {
          id: '6',
          title: 'Rashtriya Krishi Vikas Yojana',
          description: 'Comprehensive agricultural development scheme with multiple components.',
          eligibility: [
            'Farmer Producer Organizations (FPOs)',
            'Self Help Groups (SHGs)',
            'Individual farmers for specific components'
          ],
          benefits: 'Support for infrastructure, technology adoption, and capacity building',
          documents: ['Organization Registration', 'Project Proposal', 'Bank Account', 'Aadhar Cards of Members'],
          deadline: '2024-06-15',
          category: 'training',
          icon: '📈',
          status: 'active',
        },
      ];

      setSchemes(mockSchemes);
      setLoading(false);
    } catch (error) {
      console.error('Error loading schemes:', error);
      setLoading(false);
    }
  };

  const loadApplicationsData = async () => {
    try {
      // Mock applications data
      const mockApplications: Application[] = [
        {
          id: '1',
          schemeId: '1',
          schemeName: 'PM-KISAN Samman Nidhi',
          applicationDate: '2024-01-10',
          status: 'approved',
          remarks: 'Application approved. First installment credited to bank account.',
        },
        {
          id: '2',
          schemeId: '2',
          schemeName: 'Pradhan Mantri Fasal Bima Yojana',
          applicationDate: '2024-01-08',
          status: 'under_review',
          remarks: 'Documents under verification by insurance company.',
        },
      ];

      setApplications(mockApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'under_review': return '#2196F3';
      case 'rejected': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return '✅';
      case 'pending': return '⏳';
      case 'under_review': return '🔍';
      case 'rejected': return '❌';
      default: return '📋';
    }
  };

  const filteredSchemes = selectedCategory === 'all' 
    ? schemes 
    : schemes.filter(scheme => scheme.category === selectedCategory);

  const handleApplyScheme = (scheme: Scheme) => {
    setSelectedScheme(scheme);
    setShowApplicationModal(true);
    
    // Pre-fill form with saved user data
    AsyncStorage.multiGet(['userName', 'userPhone', 'userVillage', 'userDistrict'])
      .then(result => {
        const userData = Object.fromEntries(result);
        setApplicationForm(prev => ({
          ...prev,
          farmerName: userData.userName || '',
          mobileNumber: userData.userPhone || '',
          address: `${userData.userVillage || ''}, ${userData.userDistrict || ''}`.trim(),
        }));
      });
  };

  const submitApplication = async () => {
    if (!selectedScheme) return;

    // Validate required fields
    const requiredFields = ['farmerName', 'aadharNumber', 'mobileNumber', 'address'];
    const missingFields = requiredFields.filter(field => !applicationForm[field as keyof typeof applicationForm]);

    if (missingFields.length > 0) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      const newApplication: Application = {
        id: Date.now().toString(),
        schemeId: selectedScheme.id,
        schemeName: selectedScheme.title,
        applicationDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        remarks: 'Application submitted successfully. Under initial review.',
      };

      setApplications(prev => [newApplication, ...prev]);
      setShowApplicationModal(false);
      setApplicationForm({
        farmerName: '',
        fatherName: '',
        aadharNumber: '',
        mobileNumber: '',
        address: '',
        landHolding: '',
        cropType: '',
        bankAccount: '',
        ifscCode: '',
      });

      Alert.alert(
        'Success!', 
        'Your application has been submitted successfully. You can track its status in the "My Applications" tab.',
        [{ text: 'OK', onPress: () => setActiveTab('applications') }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit application. Please try again.');
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

  const renderApplicationCard = (application: Application) => (
    <View key={application.id} style={styles.applicationCard}>
      <View style={styles.applicationHeader}>
        <Text style={styles.applicationTitle}>{application.schemeName}</Text>
        <View style={[styles.applicationStatus, { backgroundColor: getStatusColor(application.status) }]}>
          <Text style={styles.applicationStatusText}>
            {getStatusIcon(application.status)} {application.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
      </View>
      
      <Text style={styles.applicationDate}>Applied on: {application.applicationDate}</Text>
      
      {application.remarks && (
        <View style={styles.remarksContainer}>
          <Text style={styles.remarksTitle}>📝 Status Update:</Text>
          <Text style={styles.remarksText}>{application.remarks}</Text>
        </View>
      )}
    </View>
  );

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

      <ScrollView style={styles.content}>
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
                style={styles.submitButton}
                onPress={submitApplication}
              >
                <Text style={styles.submitButtonText}>Submit Application</Text>
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
