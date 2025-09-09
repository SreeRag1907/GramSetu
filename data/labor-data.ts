// Labor Management static data

export interface Laborer {
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

export interface WorkEntry {
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

export interface PaymentRecord {
  id: string;
  laborerId: string;
  amount: number;
  date: string;
  workEntryIds: string[];
  paymentMethod: 'cash' | 'bank_transfer' | 'upi';
  notes?: string;
}

export const mockLaborers: Laborer[] = [
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
    name: 'Priya Sharma',
    phoneNumber: '9876543211',
    wageRate: 50,
    wageType: 'hourly',
    joiningDate: '2024-01-05',
    totalEarnings: 4800,
    totalHours: 96,
    totalDays: 12,
    isActive: true,
  },
  {
    id: '3',
    name: 'Suresh Patel',
    phoneNumber: '9876543212',
    wageRate: 300,
    wageType: 'daily',
    joiningDate: '2023-12-15',
    totalEarnings: 12000,
    totalHours: 320,
    totalDays: 40,
    isActive: false,
  },
];

export const mockWorkEntries: WorkEntry[] = [
  {
    id: '1',
    laborerId: '1',
    date: '2024-01-15',
    hours: 8,
    task: 'Field Preparation',
    description: 'Plowing and leveling the wheat field',
    calculatedWage: 350,
    isPaid: true,
    paymentDate: '2024-01-15',
  },
  {
    id: '2',
    laborerId: '2',
    date: '2024-01-15',
    hours: 6,
    task: 'Sowing',
    description: 'Wheat seeds sowing in prepared field',
    calculatedWage: 300,
    isPaid: false,
  },
  {
    id: '3',
    laborerId: '1',
    date: '2024-01-14',
    hours: 8,
    task: 'Irrigation',
    description: 'Setting up irrigation system and watering',
    calculatedWage: 350,
    isPaid: true,
    paymentDate: '2024-01-15',
  },
];

export const mockPayments: PaymentRecord[] = [
  {
    id: '1',
    laborerId: '1',
    amount: 1750,
    date: '2024-01-15',
    workEntryIds: ['1', '3'],
    paymentMethod: 'cash',
    notes: 'Payment for 2 days work - field preparation and irrigation',
  },
  {
    id: '2',
    laborerId: '2',
    amount: 2400,
    date: '2024-01-10',
    workEntryIds: ['2'],
    paymentMethod: 'upi',
    notes: 'Weekly payment for sowing work',
  },
];

export const commonTasks = [
  'Field Preparation',
  'Sowing',
  'Weeding',
  'Irrigation',
  'Fertilizer Application',
  'Pest Control',
  'Harvesting',
  'Threshing',
  'Loading/Unloading',
  'General Farm Work',
  'Pruning',
  'Transplanting',
  'Mulching',
  'Composting',
  'Equipment Maintenance'
];

export const wageTypes = [
  { value: 'daily', label: 'Daily' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'piece', label: 'Piece Rate' }
];

export const paymentMethods = [
  { value: 'cash', label: 'Cash', icon: '💵' },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
  { value: 'upi', label: 'UPI', icon: '📱' }
];

// Initial form states
export const initialLaborerForm = {
  name: '',
  phoneNumber: '',
  wageRate: '',
  wageType: 'daily' as 'daily' | 'hourly' | 'piece',
};

export const initialWorkEntryForm = {
  date: new Date().toISOString().split('T')[0],
  hours: '',
  task: '',
  description: '',
};

// Utility functions
export const calculateWage = (laborer: Laborer, hours: number = 8): number => {
  switch (laborer.wageType) {
    case 'hourly':
      return laborer.wageRate * hours;
    case 'daily':
      return laborer.wageRate;
    case 'piece':
      return laborer.wageRate; // Assuming 1 piece for now
    default:
      return 0;
  }
};

export const getWageTypeLabel = (wageType: string): string => {
  switch (wageType) {
    case 'daily': return 'per day';
    case 'hourly': return 'per hour';
    case 'piece': return 'per piece';
    default: return '';
  }
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const getPaymentMethodIcon = (method: string): string => {
  switch (method) {
    case 'cash': return '💵';
    case 'bank_transfer': return '🏦';
    case 'upi': return '📱';
    default: return '💳';
  }
};
