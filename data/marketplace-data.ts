// Marketplace static data

export interface ProduceListing {
  id: string;
  crop: string;
  quantity: string;
  price: string;
  unit: string;
  negotiable: boolean;
  farmerName: string;
  location: string;
  phone: string;
  datePosted: string;
}

export interface MarketPrice {
  crop: string;
  market: string;
  price: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: string;
}

export const mockMarketPrices: MarketPrice[] = [
  { crop: 'Wheat', market: 'Mandi Samiti', price: '2,450', unit: 'quintal', trend: 'up', change: '+50' },
  { crop: 'Rice', market: 'Local Market', price: '3,200', unit: 'quintal', trend: 'down', change: '-80' },
  { crop: 'Cotton', market: 'APMC', price: '5,800', unit: 'quintal', trend: 'stable', change: '0' },
  { crop: 'Sugarcane', market: 'Sugar Mill', price: '350', unit: 'quintal', trend: 'up', change: '+15' },
  { crop: 'Tomato', market: 'Vegetable Market', price: '25', unit: 'kg', trend: 'up', change: '+5' },
  { crop: 'Onion', market: 'Wholesale Market', price: '18', unit: 'kg', trend: 'down', change: '-3' },
  { crop: 'Potato', market: 'Wholesale Market', price: '15', unit: 'kg', trend: 'stable', change: '0' },
  { crop: 'Maize', market: 'Feed Mill', price: '2,100', unit: 'quintal', trend: 'up', change: '+25' },
  { crop: 'Soybean', market: 'Oil Mill', price: '4,200', unit: 'quintal', trend: 'down', change: '-150' },
  { crop: 'Chilli', market: 'Spice Market', price: '120', unit: 'kg', trend: 'up', change: '+10' },
];

export const mockListings: ProduceListing[] = [
  {
    id: '1',
    crop: 'Wheat',
    quantity: '50',
    price: '2,400',
    unit: 'quintal',
    negotiable: true,
    farmerName: 'Ramesh Kumar',
    location: 'Bharatpur, Rajasthan',
    phone: '9876543210',
    datePosted: '2024-01-15',
  },
  {
    id: '2',
    crop: 'Rice',
    quantity: '100',
    price: '3,150',
    unit: 'quintal',
    negotiable: false,
    farmerName: 'Suresh Patel',
    location: 'Kota, Rajasthan',
    phone: '9876543211',
    datePosted: '2024-01-14',
  },
  {
    id: '3',
    crop: 'Cotton',
    quantity: '25',
    price: '5,750',
    unit: 'quintal',
    negotiable: true,
    farmerName: 'Mahesh Singh',
    location: 'Jodhpur, Rajasthan',
    phone: '9876543212',
    datePosted: '2024-01-13',
  },
  {
    id: '4',
    crop: 'Tomato',
    quantity: '500',
    price: '24',
    unit: 'kg',
    negotiable: true,
    farmerName: 'Priya Sharma',
    location: 'Jaipur, Rajasthan',
    phone: '9876543213',
    datePosted: '2024-01-12',
  },
];

export const cropUnits = [
  'quintal',
  'kg',
  'ton',
  'bag',
  'box',
  'crate'
];

// Utility functions
export const getTrendIcon = (trend: string): string => {
  switch (trend) {
    case 'up': return '📈';
    case 'down': return '📉';
    default: return '➡️';
  }
};

export const getTrendColor = (trend: string): string => {
  switch (trend) {
    case 'up': return '#4CAF50';
    case 'down': return '#F44336';
    default: return '#FF9800';
  }
};

export const initialListingForm = {
  crop: '',
  quantity: '',
  price: '',
  unit: 'quintal',
  negotiable: false
};
