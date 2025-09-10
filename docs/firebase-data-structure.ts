/* 
🔥 FIREBASE DATA STRUCTURE FOR GRAMSETU APP
================================================================

This document outlines all the data that can be stored in Firebase for GramSetu,
organized by Firebase services and collections.

*/

/* 
📊 FIRESTORE DATABASE STRUCTURE
================================================================
*/

/* 
1️⃣ USERS COLLECTION - /users/{userId}
================================================================ */
interface User {
  uid: string;                    // Firebase Auth UID
  phoneNumber: string;           // Primary identifier
  profile: {
    name: string;                // Full name
    village: string;             // Village name
    district: string;            // District
    state: string;               // State
    primaryCrop: string;         // Main crop
    farmSize?: number;           // Farm size in acres
    experience?: number;         // Years of farming
    profilePhoto?: string;       // URL to profile image
  };
  settings: {
    language: string;            // Preferred language (en, hi, mr, etc.)
    notifications: boolean;      // Notification preferences
    units: 'metric' | 'imperial'; // Measurement units
    currency: string;            // INR, USD, etc.
  };
  location: {
    latitude?: number;           // GPS coordinates
    longitude?: number;
    lastUpdated: Date;
  };
  createdAt: Date;
  lastActive: Date;
  isVerified: boolean;           // Phone verification status
}

/* 
2️⃣ FARMER PROFILES - /farmer-profiles/{userId}
================================================================ */
interface FarmerProfile {
  userId: string;
  personalInfo: {
    fatherName?: string;
    aadharNumber?: string;       // Encrypted
    panNumber?: string;          // Encrypted
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    education?: string;
    maritalStatus?: string;
  };
  farmDetails: {
    totalLandArea: number;       // In acres
    irrigatedArea?: number;
    soilType?: string[];
    waterSource?: string[];      // Bore well, canal, rain-fed, etc.
    crops: {
      cropName: string;
      area: number;              // Area under this crop
      season: 'kharif' | 'rabi' | 'summer';
      varieties?: string[];
    }[];
  };
  documents: {
    landRecords?: string[];      // URLs to document images
    identityProof?: string;
    bankDetails?: string;
    soilHealthCard?: string;
  };
  bankDetails: {
    accountNumber?: string;      // Encrypted
    ifscCode?: string;
    bankName?: string;
    branchName?: string;
  };
  updatedAt: Date;
}

/* 
3️⃣ WEATHER DATA - /weather-data/{locationId}
================================================================ */
interface WeatherData {
  locationId: string;            // Based on lat/lng or district
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    pressure: number;
    visibility: number;
    condition: string;
    icon: string;
    timestamp: Date;
  };
  forecast: {
    date: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    rainChance: number;
    humidity: number;
  }[];
  historical: {
    date: string;
    temperature: number;
    humidity: number;
    rainfall: number;
    windSpeed: number;
  }[];
  alerts: {
    type: 'rain' | 'heat' | 'storm' | 'cold';
    message: string;
    severity: 'low' | 'medium' | 'high';
    validUntil: Date;
  }[];
  lastUpdated: Date;
}

/* 
4️⃣ MARKET PRICES - /market-prices/{cropId}
================================================================ */
interface MarketPrice {
  cropId: string;
  cropName: string;
  prices: {
    location: string;            // Market location
    state: string;
    district: string;
    price: number;               // Price per unit
    unit: string;                // kg, quintal, ton
    market: string;              // Market name
    date: Date;
    trend: 'up' | 'down' | 'stable';
    change: number;              // Price change
  }[];
  averagePrice: number;
  priceHistory: {
    date: Date;
    price: number;
    volume?: number;             // Trading volume
  }[];
  predictions: {
    nextWeek: number;
    nextMonth: number;
    confidence: number;          // 0-100%
  };
  lastUpdated: Date;
}

/* 
5️⃣ MARKETPLACE LISTINGS - /marketplace/{listingId}
================================================================ */
interface MarketplaceListing {
  id: string;
  sellerId: string;              // User ID of farmer
  crop: string;
  quantity: number;
  price: number;
  unit: string;
  negotiable: boolean;
  description?: string;
  images?: string[];             // URLs to crop images
  location: {
    village: string;
    district: string;
    state: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone: string;
    preferredTime?: string;      // Best time to call
  };
  quality: {
    grade?: 'A' | 'B' | 'C';
    organic?: boolean;
    pesticidesUsed?: boolean;
  };
  availability: {
    harvestDate?: Date;
    availableFrom: Date;
    availableUntil?: Date;
  };
  status: 'active' | 'sold' | 'expired' | 'pending';
  views: number;
  inquiries: number;
  createdAt: Date;
  updatedAt: Date;
}

/* 
6️⃣ GOVERNMENT SCHEMES - /schemes/{schemeId}
================================================================ */
interface GovernmentScheme {
  id: string;
  title: string;
  description: string;
  category: 'subsidy' | 'insurance' | 'credit' | 'training' | 'equipment';
  targetAudience: string[];      // Small farmers, women farmers, etc.
  eligibility: string[];
  benefits: string;
  documents: string[];
  applicationProcess: {
    steps: string[];
    timeline: string;
    fees?: number;
  };
  deadlines: {
    applicationStart?: Date;
    applicationEnd?: Date;
    isOngoing: boolean;
  };
  implementation: {
    department: string;
    contactInfo: {
      phone?: string;
      email?: string;
      website?: string;
    };
  };
  multilingual: {
    [languageCode: string]: {
      title: string;
      description: string;
      benefits: string;
    };
  };
  status: 'active' | 'inactive' | 'upcoming';
  applicationsCount: number;
  lastUpdated: Date;
}

/* 
7️⃣ SCHEME APPLICATIONS - /applications/{applicationId}
================================================================ */
interface SchemeApplication {
  id: string;
  userId: string;
  schemeId: string;
  schemeName: string;
  applicationData: {
    farmerName: string;
    fatherName?: string;
    aadharNumber?: string;
    mobileNumber: string;
    email?: string;
    address: string;
    landArea?: number;
    cropDetails?: string;
    bankAccount?: string;
    documents: {
      [documentType: string]: string; // URL to uploaded document
    };
  };
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'completed';
  timeline: {
    submitted?: Date;
    reviewed?: Date;
    approved?: Date;
    completed?: Date;
  };
  remarks?: string;
  reviewedBy?: string;
  submittedAt: Date;
  updatedAt: Date;
}

/* 
8️⃣ CHATBOT CONVERSATIONS - /conversations/{userId}
================================================================ */
interface ChatbotConversation {
  userId: string;
  messages: {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    category?: string;           // weather, crop, pest, market, etc.
    metadata?: {
      queryType?: string;
      confidence?: number;
      relatedData?: any;
    };
  }[];
  summary: {
    totalMessages: number;
    commonTopics: string[];
    lastInteraction: Date;
    userSatisfaction?: number;   // 1-5 rating
  };
  createdAt: Date;
  updatedAt: Date;
}

/* 
9️⃣ ADVISORY & NOTIFICATIONS - /advisories/{advisoryId}
================================================================ */
interface Advisory {
  id: string;
  type: 'weather' | 'crop' | 'pest' | 'market' | 'scheme' | 'general';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetAudience: {
    crops?: string[];            // Relevant crops
    regions?: string[];          // Districts/states
    farmSize?: string;           // small, medium, large
    demographic?: string[];      // new farmers, women, etc.
  };
  content: {
    shortMessage: string;        // For notifications
    detailedAdvice: string;      // Full advisory
    actionItems?: string[];      // What farmer should do
    timing?: string;             // When to act
    resources?: string[];        // Links to more info
  };
  multilingual: {
    [languageCode: string]: {
      title: string;
      description: string;
      content: {
        shortMessage: string;
        detailedAdvice: string;
        actionItems?: string[];
      };
    };
  };
  metadata: {
    source: string;              // Weather API, expert, AI, etc.
    confidence?: number;
    validUntil?: Date;
    attachments?: string[];      // Images, documents
  };
  delivery: {
    channels: ('push' | 'sms' | 'email')[];
    sentTo: number;              // Number of users
    opened: number;              // Engagement stats
    clicked: number;
  };
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

/* 
🔟 LABOR MANAGEMENT - /labor/{recordId}
================================================================ */
interface LaborRecord {
  id: string;
  farmerId: string;
  laborerInfo: {
    name: string;
    phoneNumber?: string;
    skillLevel: 'beginner' | 'experienced' | 'expert';
    specialization?: string[];   // harvesting, plowing, etc.
    dailyWage?: number;
    availability?: {
      days: string[];            // Mon, Tue, etc.
      timeSlots: string[];
    };
  };
  workRecord: {
    date: Date;
    task: string;
    hoursWorked: number;
    wagePerHour?: number;
    totalWage: number;
    paymentStatus: 'pending' | 'paid' | 'advance_given';
    paymentMethod?: 'cash' | 'bank_transfer' | 'upi';
  };
  rating?: {
    quality: number;             // 1-5
    punctuality: number;         // 1-5
    reliability: number;         // 1-5
    comments?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/* 
1️⃣1️⃣ CROP MANAGEMENT - /crops/{farmId}
================================================================ */
interface CropManagement {
  farmId: string;
  userId: string;
  cropDetails: {
    cropName: string;
    variety: string;
    area: number;                // Acres
    sowingDate: Date;
    expectedHarvestDate: Date;
    season: 'kharif' | 'rabi' | 'summer';
  };
  activities: {
    id: string;
    type: 'sowing' | 'irrigation' | 'fertilizer' | 'pesticide' | 'weeding' | 'harvesting';
    description: string;
    date: Date;
    cost?: number;
    quantity?: number;
    unit?: string;
    supplier?: string;
    results?: string;
    images?: string[];
  }[];
  expenses: {
    category: 'seeds' | 'fertilizer' | 'pesticide' | 'labor' | 'equipment' | 'other';
    amount: number;
    description: string;
    date: Date;
    receipt?: string;            // Image URL
  }[];
  income: {
    quantity: number;
    unit: string;
    pricePerUnit: number;
    totalAmount: number;
    buyer?: string;
    date: Date;
    paymentStatus: 'pending' | 'received';
  }[];
  currentStatus: {
    growthStage: string;         // Vegetative, flowering, maturity
    health: 'excellent' | 'good' | 'fair' | 'poor';
    issues?: string[];           // Pest, disease, weather damage
    upcomingTasks: {
      task: string;
      scheduledDate: Date;
      priority: 'low' | 'medium' | 'high';
    }[];
  };
  analytics: {
    totalInvestment: number;
    totalRevenue: number;
    profit: number;
    roi: number;                 // Return on Investment %
    yieldPerAcre: number;
    qualityGrade?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/* 
1️⃣2️⃣ APP ANALYTICS - /analytics/{userId}
================================================================ */
interface UserAnalytics {
  userId: string;
  usage: {
    sessionsCount: number;
    totalTimeSpent: number;      // In minutes
    lastActiveDate: Date;
    frequentlyUsedFeatures: {
      feature: string;
      useCount: number;
    }[];
    preferredLanguage: string;
  };
  engagement: {
    advisoriesViewed: number;
    schemesApplied: number;
    marketListingsCreated: number;
    chatbotQueries: number;
    weatherChecks: number;
  };
  preferences: {
    notificationTypes: string[];
    cropInterests: string[];
    marketRegions: string[];
  };
  feedback: {
    ratings: {
      feature: string;
      rating: number;            // 1-5
      feedback?: string;
      date: Date;
    }[];
    suggestions: {
      category: string;
      suggestion: string;
      date: Date;
      status: 'new' | 'reviewed' | 'implemented';
    }[];
  };
  monthlyStats: {
    month: string;               // YYYY-MM
    sessionsCount: number;
    timeSpent: number;
    featuresUsed: string[];
  }[];
  lastUpdated: Date;
}

/* 
📱 FIREBASE STORAGE STRUCTURE
================================================================ */

/*
/users/{userId}/
  - profile-photos/
    - profile.jpg
  - documents/
    - aadhar-card.jpg
    - land-records.pdf
    - bank-passbook.jpg
    - soil-health-card.pdf
  - crop-images/
    - {cropId}/
      - sowing-{date}.jpg
      - growth-stage-{date}.jpg
      - pest-damage-{date}.jpg
      - harvest-{date}.jpg

/marketplace/
  - listings/{listingId}/
    - crop-image-1.jpg
    - crop-image-2.jpg
    - quality-certificate.pdf

/schemes/
  - documents/{schemeId}/
    - application-form.pdf
    - guidelines.pdf
    - brochure.jpg

/advisories/
  - attachments/{advisoryId}/
    - infographic.jpg
    - demonstration-video.mp4

/app-assets/
  - crop-guides/
    - wheat-cultivation-guide.pdf
    - rice-pest-identification.jpg
  - weather-icons/
  - ui-assets/
*/

/* 
🔔 FIREBASE CLOUD MESSAGING STRUCTURE
================================================================ */

/*
Topics for targeted notifications:
- weather-alerts-{district}
- crop-advisories-{cropName}
- market-updates-{region}
- scheme-notifications
- general-updates

Message types:
- Weather alerts
- Market price updates
- Government scheme notifications
- Crop advisory alerts
- App feature updates
*/

/* 
🔐 FIREBASE SECURITY RULES
================================================================ */

/*
Firestore Security Rules:
- Users can only read/write their own data
- Public data (schemes, weather, market prices) is readable by all authenticated users
- Admin-only write access for schemes and advisories
- Rate limiting for expensive operations
*/

/* 
📊 FIREBASE ANALYTICS EVENTS
================================================================ */

/*
Custom events to track:
- user_registration_completed
- weather_data_viewed
- scheme_application_started
- scheme_application_submitted
- marketplace_listing_created
- chatbot_query_sent
- advisory_viewed
- crop_management_entry_added
- labor_record_created
- market_price_checked
*/

export {};  // Make this a module
