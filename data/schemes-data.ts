// Static data for schemes and categories

export interface Scheme {
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

export interface Application {
  id: string;
  schemeId: string;
  schemeName: string;
  applicationDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  remarks?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const categories: Category[] = [
  { id: 'all', name: 'All Schemes', icon: '📋' },
  { id: 'credit', name: 'Credit & Loans', icon: '💰' },
  { id: 'insurance', name: 'Insurance', icon: '🛡️' },
  { id: 'subsidy', name: 'Subsidies', icon: '🎯' },
  { id: 'technology', name: 'Technology', icon: '🚜' },
  { id: 'training', name: 'Training', icon: '📚' },
];

export const mockSchemes: Scheme[] = [
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
  {
    id: '7',
    title: 'National Mission for Sustainable Agriculture',
    description: 'Promoting sustainable agriculture practices through climate resilient technologies.',
    eligibility: [
      'All categories of farmers',
      'Farmer Producer Organizations',
      'Agricultural entrepreneurs'
    ],
    benefits: 'Support for organic farming, water conservation, and climate resilient practices',
    documents: ['Aadhar Card', 'Land Records', 'Bank Account', 'Project Proposal'],
    deadline: '2024-05-20',
    category: 'subsidy',
    icon: '🌿',
    status: 'active',
  },
  {
    id: '8',
    title: 'Paramparagat Krishi Vikas Yojana',
    description: 'Promoting organic farming through cluster approach and certification.',
    eligibility: [
      'Farmers willing to adopt organic farming',
      'Minimum cluster size of 50 acres',
      'Commitment for 3 years organic farming'
    ],
    benefits: '₹50,000 per hectare for 3 years including certification cost',
    documents: ['Aadhar Card', 'Land Records', 'Group Formation Certificate', 'Bank Account'],
    deadline: '2024-07-10',
    category: 'training',
    icon: '🌾',
    status: 'active',
  },
];

export const mockApplications: Application[] = [
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
  {
    id: '3',
    schemeId: '4',
    schemeName: 'Kisan Credit Card (KCC)',
    applicationDate: '2024-01-05',
    status: 'pending',
    remarks: 'Application submitted to bank. Verification in progress.',
  },
];

// Status utility functions
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'approved': return '#4CAF50';
    case 'pending': return '#FF9800';
    case 'under_review': return '#2196F3';
    case 'rejected': return '#F44336';
    default: return '#666';
  }
};

export const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'approved': return '✅';
    case 'pending': return '⏳';
    case 'under_review': return '🔍';
    case 'rejected': return '❌';
    default: return '📋';
  }
};

// Form validation utility
export const validateApplicationForm = (form: any): string[] => {
  const requiredFields = ['farmerName', 'aadharNumber', 'mobileNumber', 'address'];
  return requiredFields.filter(field => !form[field]);
};

// Initial form state
export const initialApplicationForm = {
  farmerName: '',
  fatherName: '',
  aadharNumber: '',
  mobileNumber: '',
  address: '',
  landHolding: '',
  cropType: '',
  bankAccount: '',
  ifscCode: '',
};
