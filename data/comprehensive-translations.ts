// Comprehensive localization system for entire GramSetu app

export interface ComprehensiveTranslations {
  // ========== SPLASH SCREEN ==========
  splash: {
    appName: string;
    tagline: string;
    loading: string;
  };

  // ========== GET STARTED SCREEN ==========
  getStarted: {
    title: string;
    subtitle: string;
    description: string;
    getStartedButton: string;
    alreadyHaveAccount: string;
    signIn: string;
  };

  // ========== LANGUAGE SELECTION ==========
  languageSelection: {
    title: string;
    subtitle: string;
    selectLanguage: string;
    continueButton: string;
    choosePreferredLanguage: string;
  };

  // ========== REGISTRATION ==========
  registration: {
    title: string;
    subtitle: string;
    fullName: string;
    fullNamePlaceholder: string;
    phoneNumber: string;
    phoneNumberPlaceholder: string;
    village: string;
    villagePlaceholder: string;
    district: string;
    districtPlaceholder: string;
    state: string;
    statePlaceholder: string;
    farmSize: string;
    farmSizePlaceholder: string;
    crops: string;
    cropsPlaceholder: string;
    continueButton: string;
    skipForNow: string;
    validation: {
      nameRequired: string;
      phoneRequired: string;
      villageRequired: string;
      districtRequired: string;
      stateRequired: string;
      invalidPhone: string;
    };
  };

  // ========== PERMISSIONS ==========
  permissions: {
    title: string;
    subtitle: string;
    location: string;
    locationDesc: string;
    camera: string;
    cameraDesc: string;
    notifications: string;
    notificationsDesc: string;
    storage: string;
    storageDesc: string;
    allowButton: string;
    skipButton: string;
    continueButton: string;
  };

  // ========== DASHBOARD ==========
  dashboard: {
    hello: string;
    goodMorning: string;
    goodAfternoon: string;
    goodEvening: string;
    farmer: string;
    searchPlaceholder: string;
    todayWeather: string;
    humidity: string;
    goodDayForFarming: string;
    quickActions: string;
    farmManagement: string;
    recentUpdates: string;
    viewAll: string;
    loading: string;
    logout: string;
    logoutConfirmation: string;
    logoutError: string;
    languageChangeError: string;
    profileMenu: string;
    changeLanguage: string;
  };

  // ========== MARKETPLACE ==========
  marketplace: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    categories: string;
    trending: string;
    nearbyMarkets: string;
    myListings: string;
    sellProduce: string;
    buyRequests: string;
    priceAlerts: string;
    marketNews: string;
    filters: string;
    sortBy: string;
    distance: string;
    price: string;
    quality: string;
    availability: string;
    fresh: string;
    organic: string;
    premium: string;
    negotiable: string;
    fixedPrice: string;
    perKg: string;
    perQuintal: string;
    contactSeller: string;
    addToCart: string;
    buyNow: string;
    makeOffer: string;
    reportListing: string;
    shareListng: string;
    saveForLater: string;
  };

  // ========== CLIMATE/WEATHER ==========
  climate: {
    title: string;
    subtitle: string;
    currentWeather: string;
    forecast: string;
    alerts: string;
    advisory: string;
    temperature: string;
    humidity: string;
    windSpeed: string;
    rainfall: string;
    uvIndex: string;
    soilMoisture: string;
    today: string;
    tomorrow: string;
    thisWeek: string;
    nextWeek: string;
    rainAlert: string;
    heatWave: string;
    coldWave: string;
    stormAlert: string;
    farmingAdvice: string;
    irrigationAdvice: string;
    harvestAdvice: string;
    sowingAdvice: string;
    pestAlert: string;
    diseaseAlert: string;
    weatherHistory: string;
    seasonalTrends: string;
  };

  // ========== AI CHATBOT ==========
  chatbot: {
    title: string;
    subtitle: string;
    welcomeMessage: string;
    typePlaceholder: string;
    sendButton: string;
    voiceInput: string;
    clearChat: string;
    chatHistory: string;
    quickQueries: string;
    weatherQuery: string;
    cropQuery: string;
    marketQuery: string;
    schemeQuery: string;
    pestQuery: string;
    fertilizer: string;
    irrigation: string;
    harvesting: string;
    pricing: string;
    government: string;
    loans: string;
    insurance: string;
    askAnything: string;
    listening: string;
    processing: string;
    error: string;
    tryAgain: string;
    noInternet: string;
  };

  // ========== SCHEMES ==========
  schemes: {
    title: string;
    subtitle: string;
    available: string;
    applied: string;
    approved: string;
    rejected: string;
    searchSchemes: string;
    filterBy: string;
    category: string;
    eligibility: string;
    benefits: string;
    documents: string;
    applyNow: string;
    checkStatus: string;
    downloadForm: string;
    uploadDocuments: string;
    submitApplication: string;
    trackApplication: string;
    applicationHistory: string;
    renewApplication: string;
    cancelApplication: string;
    farmSubsidy: string;
    cropInsurance: string;
    soilHealth: string;
    organicFarming: string;
    irrigation: string;
    mechanization: string;
    storage: string;
    processing: string;
    marketing: string;
    training: string;
    womenFarmers: string;
    youthFarmers: string;
    tribal: string;
    smallFarmers: string;
    marginalFarmers: string;
  };

  // ========== LABOR MANAGEMENT ==========
  labor: {
    title: string;
    subtitle: string;
    workforce: string;
    attendance: string;
    wages: string;
    tasks: string;
    schedule: string;
    payments: string;
    addWorker: string;
    removeWorker: string;
    editWorker: string;
    workerDetails: string;
    dailyWages: string;
    weeklyWages: string;
    monthlyWages: string;
    overtimeRate: string;
    totalHours: string;
    regularHours: string;
    overtimeHours: string;
    present: string;
    absent: string;
    halfDay: string;
    leave: string;
    holiday: string;
    markAttendance: string;
    generatePayroll: string;
    paymentHistory: string;
    advancePayment: string;
    deductions: string;
    bonuses: string;
    taskAssignment: string;
    taskCompletion: string;
    workQuality: string;
    performance: string;
    contracts: string;
    seasonal: string;
    permanent: string;
    temporary: string;
  };

  // ========== QUICK ACTIONS ==========
  quickActions: {
    todayWeather: string;
    marketPrices: string;
    quickQuery: string;
    alerts: string;
    notifications: string;
    camera: string;
    calculator: string;
    calendar: string;
    contacts: string;
    maps: string;
    news: string;
    settings: string;
  };

  // ========== MODULES ==========
  modules: {
    marketplace: string;
    marketplaceSubtitle: string;
    weather: string;
    weatherSubtitle: string;
    aiAssistant: string;
    aiAssistantSubtitle: string;
    schemes: string;
    schemesSubtitle: string;
    labor: string;
    laborSubtitle: string;
  };

  // ========== COMMON ELEMENTS ==========
  common: {
    loading: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    cancel: string;
    ok: string;
    yes: string;
    no: string;
    save: string;
    delete: string;
    edit: string;
    add: string;
    remove: string;
    update: string;
    submit: string;
    reset: string;
    clear: string;
    search: string;
    filter: string;
    sort: string;
    refresh: string;
    retry: string;
    back: string;
    next: string;
    previous: string;
    finish: string;
    skip: string;
    continue: string;
    close: string;
    open: string;
    share: string;
    download: string;
    upload: string;
    copy: string;
    paste: string;
    cut: string;
    select: string;
    selectAll: string;
    deselect: string;
    required: string;
    optional: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    date: string;
    time: string;
    amount: string;
    quantity: string;
    price: string;
    total: string;
    subtotal: string;
    tax: string;
    discount: string;
    currency: string;
    rupees: string;
    today: string;
    yesterday: string;
    tomorrow: string;
    thisWeek: string;
    lastWeek: string;
    nextWeek: string;
    thisMonth: string;
    lastMonth: string;
    nextMonth: string;
    thisYear: string;
    lastYear: string;
    nextYear: string;
  };

  // ========== NAVIGATION ==========
  navigation: {
    home: string;
    dashboard: string;
    marketplace: string;
    weather: string;
    chatbot: string;
    schemes: string;
    labor: string;
    profile: string;
    settings: string;
    help: string;
    about: string;
    privacy: string;
    terms: string;
    contact: string;
    feedback: string;
    support: string;
    logout: string;
  };

  // ========== VALIDATION MESSAGES ==========
  validation: {
    required: string;
    invalidEmail: string;
    invalidPhone: string;
    passwordTooShort: string;
    passwordsNotMatch: string;
    invalidDate: string;
    invalidAmount: string;
    fieldRequired: string;
    pleaseSelectOption: string;
    fileTooLarge: string;
    invalidFileType: string;
    networkError: string;
    serverError: string;
    tryAgainLater: string;
  };

  // ========== STATUS MESSAGES ==========
  status: {
    connecting: string;
    connected: string;
    disconnected: string;
    syncing: string;
    synced: string;
    uploading: string;
    uploaded: string;
    downloading: string;
    downloaded: string;
    processing: string;
    processed: string;
    completed: string;
    failed: string;
    pending: string;
    approved: string;
    rejected: string;
    cancelled: string;
    expired: string;
    active: string;
    inactive: string;
  };

  // ========== UNITS & MEASUREMENTS ==========
  units: {
    kg: string;
    quintal: string;
    ton: string;
    gram: string;
    liter: string;
    milliliter: string;
    meter: string;
    kilometer: string;
    centimeter: string;
    feet: string;
    acre: string;
    hectare: string;
    celsius: string;
    fahrenheit: string;
    percentage: string;
    currency: string;
    per: string;
  };
}

// English translations (base language)
const englishTranslations: ComprehensiveTranslations = {
  splash: {
    appName: "GramSetu",
    tagline: "Smart Farming Companion",
    loading: "Loading..."
  },

  getStarted: {
    title: "Welcome to GramSetu",
    subtitle: "Your Smart Farming Partner",
    description: "Empowering farmers with technology, market insights, and sustainable practices for better yields and prosperity.",
    getStartedButton: "Get Started",
    alreadyHaveAccount: "Already have an account?",
    signIn: "Sign In"
  },

  languageSelection: {
    title: "Choose Your Language",
    subtitle: "Select your preferred language",
    selectLanguage: "Select Language",
    continueButton: "Continue",
    choosePreferredLanguage: "Choose your preferred language to continue"
  },

  registration: {
    title: "Create Your Profile",
    subtitle: "Tell us about yourself",
    fullName: "Full Name",
    fullNamePlaceholder: "Enter your full name",
    phoneNumber: "Phone Number",
    phoneNumberPlaceholder: "Enter your mobile number",
    village: "Village",
    villagePlaceholder: "Enter your village name",
    district: "District",
    districtPlaceholder: "Enter your district",
    state: "State",
    statePlaceholder: "Enter your state",
    farmSize: "Farm Size (acres)",
    farmSizePlaceholder: "Enter farm size in acres",
    crops: "Main Crops",
    cropsPlaceholder: "Enter main crops you grow",
    continueButton: "Continue",
    skipForNow: "Skip for now",
    validation: {
      nameRequired: "Name is required",
      phoneRequired: "Phone number is required",
      villageRequired: "Village is required",
      districtRequired: "District is required",
      stateRequired: "State is required",
      invalidPhone: "Please enter a valid phone number"
    }
  },

  permissions: {
    title: "App Permissions",
    subtitle: "Allow permissions for better experience",
    location: "Location Access",
    locationDesc: "Get weather updates and nearby market information",
    camera: "Camera Access",
    cameraDesc: "Take photos of crops, pests, and diseases for analysis",
    notifications: "Notifications",
    notificationsDesc: "Receive alerts about weather, market prices, and schemes",
    storage: "Storage Access",
    storageDesc: "Save photos, documents, and offline data",
    allowButton: "Allow",
    skipButton: "Skip",
    continueButton: "Continue to Dashboard"
  },

  dashboard: {
    hello: "Hello",
    goodMorning: "Good Morning",
    goodAfternoon: "Good Afternoon",
    goodEvening: "Good Evening",
    farmer: "Farmer",
    searchPlaceholder: "Search here... Ask AI assistant",
    todayWeather: "Today's Weather",
    humidity: "Humidity",
    goodDayForFarming: "Good day for farming",
    quickActions: "Quick Actions",
    farmManagement: "Farm Management",
    recentUpdates: "Recent Updates",
    viewAll: "View all",
    loading: "Loading GramSetu...",
    logout: "Logout",
    logoutConfirmation: "Are you sure you want to logout?",
    logoutError: "Failed to logout. Please try again.",
    languageChangeError: "Failed to change language. Please try again.",
    profileMenu: "Profile Menu",
    changeLanguage: "Change Language"
  },

  marketplace: {
    title: "Marketplace",
    subtitle: "Buy & sell agricultural products",
    searchPlaceholder: "Search products, crops, equipment...",
    categories: "Categories",
    trending: "Trending Now",
    nearbyMarkets: "Nearby Markets",
    myListings: "My Listings",
    sellProduce: "Sell Produce",
    buyRequests: "Buy Requests",
    priceAlerts: "Price Alerts",
    marketNews: "Market News",
    filters: "Filters",
    sortBy: "Sort By",
    distance: "Distance",
    price: "Price",
    quality: "Quality",
    availability: "Availability",
    fresh: "Fresh",
    organic: "Organic",
    premium: "Premium",
    negotiable: "Negotiable",
    fixedPrice: "Fixed Price",
    perKg: "per kg",
    perQuintal: "per quintal",
    contactSeller: "Contact Seller",
    addToCart: "Add to Cart",
    buyNow: "Buy Now",
    makeOffer: "Make Offer",
    reportListing: "Report Listing",
    shareListng: "Share Listing",
    saveForLater: "Save for Later"
  },

  climate: {
    title: "Weather & Climate",
    subtitle: "Weather forecast and farming advisory",
    currentWeather: "Current Weather",
    forecast: "Forecast",
    alerts: "Alerts",
    advisory: "Advisory",
    temperature: "Temperature",
    humidity: "Humidity",
    windSpeed: "Wind Speed",
    rainfall: "Rainfall",
    uvIndex: "UV Index",
    soilMoisture: "Soil Moisture",
    today: "Today",
    tomorrow: "Tomorrow",
    thisWeek: "This Week",
    nextWeek: "Next Week",
    rainAlert: "Rain Alert",
    heatWave: "Heat Wave",
    coldWave: "Cold Wave",
    stormAlert: "Storm Alert",
    farmingAdvice: "Farming Advice",
    irrigationAdvice: "Irrigation Advice",
    harvestAdvice: "Harvest Advice",
    sowingAdvice: "Sowing Advice",
    pestAlert: "Pest Alert",
    diseaseAlert: "Disease Alert",
    weatherHistory: "Weather History",
    seasonalTrends: "Seasonal Trends"
  },

  chatbot: {
    title: "AI Assistant",
    subtitle: "Get instant help with farming questions",
    welcomeMessage: "Hello! I'm your farming assistant. How can I help you today?",
    typePlaceholder: "Type your question here...",
    sendButton: "Send",
    voiceInput: "Voice Input",
    clearChat: "Clear Chat",
    chatHistory: "Chat History",
    quickQueries: "Quick Queries",
    weatherQuery: "What's today's weather?",
    cropQuery: "Best crops for this season?",
    marketQuery: "Current market prices?",
    schemeQuery: "Available government schemes?",
    pestQuery: "Pest identification help",
    fertilizer: "Fertilizer recommendations",
    irrigation: "Irrigation scheduling",
    harvesting: "Harvesting tips",
    pricing: "Price predictions",
    government: "Government schemes",
    loans: "Agricultural loans",
    insurance: "Crop insurance",
    askAnything: "Ask me anything about farming!",
    listening: "Listening...",
    processing: "Processing your question...",
    error: "Sorry, I couldn't process that. Please try again.",
    tryAgain: "Try Again",
    noInternet: "No internet connection. Please check your network."
  },

  schemes: {
    title: "Government Schemes",
    subtitle: "Apply for agricultural schemes and subsidies",
    available: "Available Schemes",
    applied: "Applied",
    approved: "Approved",
    rejected: "Rejected",
    searchSchemes: "Search schemes...",
    filterBy: "Filter By",
    category: "Category",
    eligibility: "Eligibility",
    benefits: "Benefits",
    documents: "Documents Required",
    applyNow: "Apply Now",
    checkStatus: "Check Status",
    downloadForm: "Download Form",
    uploadDocuments: "Upload Documents",
    submitApplication: "Submit Application",
    trackApplication: "Track Application",
    applicationHistory: "Application History",
    renewApplication: "Renew Application",
    cancelApplication: "Cancel Application",
    farmSubsidy: "Farm Subsidy",
    cropInsurance: "Crop Insurance",
    soilHealth: "Soil Health",
    organicFarming: "Organic Farming",
    irrigation: "Irrigation",
    mechanization: "Farm Mechanization",
    storage: "Storage & Warehousing",
    processing: "Food Processing",
    marketing: "Marketing Support",
    training: "Training Programs",
    womenFarmers: "Women Farmers",
    youthFarmers: "Youth in Agriculture",
    tribal: "Tribal Farmers",
    smallFarmers: "Small Farmers",
    marginalFarmers: "Marginal Farmers"
  },

  labor: {
    title: "Labor Management",
    subtitle: "Manage your workforce and track payments",
    workforce: "Workforce",
    attendance: "Attendance",
    wages: "Wages",
    tasks: "Tasks",
    schedule: "Schedule",
    payments: "Payments",
    addWorker: "Add Worker",
    removeWorker: "Remove Worker",
    editWorker: "Edit Worker",
    workerDetails: "Worker Details",
    dailyWages: "Daily Wages",
    weeklyWages: "Weekly Wages",
    monthlyWages: "Monthly Wages",
    overtimeRate: "Overtime Rate",
    totalHours: "Total Hours",
    regularHours: "Regular Hours",
    overtimeHours: "Overtime Hours",
    present: "Present",
    absent: "Absent",
    halfDay: "Half Day",
    leave: "Leave",
    holiday: "Holiday",
    markAttendance: "Mark Attendance",
    generatePayroll: "Generate Payroll",
    paymentHistory: "Payment History",
    advancePayment: "Advance Payment",
    deductions: "Deductions",
    bonuses: "Bonuses",
    taskAssignment: "Task Assignment",
    taskCompletion: "Task Completion",
    workQuality: "Work Quality",
    performance: "Performance",
    contracts: "Contracts",
    seasonal: "Seasonal",
    permanent: "Permanent",
    temporary: "Temporary"
  },

  quickActions: {
    todayWeather: "Today's Weather",
    marketPrices: "Market Prices",
    quickQuery: "Quick Query",
    alerts: "Alerts",
    notifications: "Notifications",
    camera: "Camera",
    calculator: "Calculator",
    calendar: "Calendar",
    contacts: "Contacts",
    maps: "Maps",
    news: "News",
    settings: "Settings"
  },

  modules: {
    marketplace: "Marketplace",
    marketplaceSubtitle: "Buy & sell agricultural products",
    weather: "Weather & Climate",
    weatherSubtitle: "Weather forecast and farming advisory",
    aiAssistant: "AI Assistant",
    aiAssistantSubtitle: "Get instant help with farming questions",
    schemes: "Government Schemes",
    schemesSubtitle: "Apply for agricultural schemes and subsidies",
    labor: "Labor Management",
    laborSubtitle: "Manage your workforce and track payments"
  },

  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    warning: "Warning",
    info: "Information",
    cancel: "Cancel",
    ok: "OK",
    yes: "Yes",
    no: "No",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    remove: "Remove",
    update: "Update",
    submit: "Submit",
    reset: "Reset",
    clear: "Clear",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    refresh: "Refresh",
    retry: "Retry",
    back: "Back",
    next: "Next",
    previous: "Previous",
    finish: "Finish",
    skip: "Skip",
    continue: "Continue",
    close: "Close",
    open: "Open",
    share: "Share",
    download: "Download",
    upload: "Upload",
    copy: "Copy",
    paste: "Paste",
    cut: "Cut",
    select: "Select",
    selectAll: "Select All",
    deselect: "Deselect",
    required: "Required",
    optional: "Optional",
    name: "Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    date: "Date",
    time: "Time",
    amount: "Amount",
    quantity: "Quantity",
    price: "Price",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Tax",
    discount: "Discount",
    currency: "Currency",
    rupees: "₹",
    today: "Today",
    yesterday: "Yesterday",
    tomorrow: "Tomorrow",
    thisWeek: "This Week",
    lastWeek: "Last Week",
    nextWeek: "Next Week",
    thisMonth: "This Month",
    lastMonth: "Last Month",
    nextMonth: "Next Month",
    thisYear: "This Year",
    lastYear: "Last Year",
    nextYear: "Next Year"
  },

  navigation: {
    home: "Home",
    dashboard: "Dashboard",
    marketplace: "Marketplace",
    weather: "Weather",
    chatbot: "AI Assistant",
    schemes: "Schemes",
    labor: "Labor",
    profile: "Profile",
    settings: "Settings",
    help: "Help",
    about: "About",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    contact: "Contact Us",
    feedback: "Feedback",
    support: "Support",
    logout: "Logout"
  },

  validation: {
    required: "This field is required",
    invalidEmail: "Please enter a valid email address",
    invalidPhone: "Please enter a valid phone number",
    passwordTooShort: "Password must be at least 8 characters",
    passwordsNotMatch: "Passwords do not match",
    invalidDate: "Please enter a valid date",
    invalidAmount: "Please enter a valid amount",
    fieldRequired: "This field is required",
    pleaseSelectOption: "Please select an option",
    fileTooLarge: "File size is too large",
    invalidFileType: "Invalid file type",
    networkError: "Network connection error",
    serverError: "Server error occurred",
    tryAgainLater: "Please try again later"
  },

  status: {
    connecting: "Connecting...",
    connected: "Connected",
    disconnected: "Disconnected",
    syncing: "Syncing...",
    synced: "Synced",
    uploading: "Uploading...",
    uploaded: "Uploaded",
    downloading: "Downloading...",
    downloaded: "Downloaded",
    processing: "Processing...",
    processed: "Processed",
    completed: "Completed",
    failed: "Failed",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    cancelled: "Cancelled",
    expired: "Expired",
    active: "Active",
    inactive: "Inactive"
  },

  units: {
    kg: "kg",
    quintal: "quintal",
    ton: "ton",
    gram: "g",
    liter: "L",
    milliliter: "ml",
    meter: "m",
    kilometer: "km",
    centimeter: "cm",
    feet: "ft",
    acre: "acre",
    hectare: "hectare",
    celsius: "°C",
    fahrenheit: "°F",
    percentage: "%",
    currency: "₹",
    per: "per"
  }
};

// Hindi translations
const hindiTranslations: ComprehensiveTranslations = {
  splash: {
    appName: "ग्रामसेतु",
    tagline: "स्मार्ट खेती साथी",
    loading: "लोड हो रहा है..."
  },

  getStarted: {
    title: "ग्रामसेतु में आपका स्वागत है",
    subtitle: "आपका स्मार्ट खेती साथी",
    description: "बेहतर उत्पादन और समृद्धि के लिए किसानों को तकनीक, बाजार की जानकारी और टिकाऊ प्रथाओं से सशक्त बनाना।",
    getStartedButton: "शुरू करें",
    alreadyHaveAccount: "क्या आपका पहले से खाता है?",
    signIn: "साइन इन करें"
  },

  languageSelection: {
    title: "अपनी भाषा चुनें",
    subtitle: "अपनी पसंदीदा भाषा चुनें",
    selectLanguage: "भाषा चुनें",
    continueButton: "जारी रखें",
    choosePreferredLanguage: "जारी रखने के लिए अपनी पसंदीदा भाषा चुनें"
  },

  registration: {
    title: "अपनी प्रोफाइल बनाएं",
    subtitle: "हमें अपने बारे में बताएं",
    fullName: "पूरा नाम",
    fullNamePlaceholder: "अपना पूरा नाम दर्ज करें",
    phoneNumber: "फोन नंबर",
    phoneNumberPlaceholder: "अपना मोबाइल नंबर दर्ज करें",
    village: "गांव",
    villagePlaceholder: "अपने गांव का नाम दर्ज करें",
    district: "जिला",
    districtPlaceholder: "अपना जिला दर्ज करें",
    state: "राज्य",
    statePlaceholder: "अपना राज्य दर्ज करें",
    farmSize: "खेत का आकार (एकड़)",
    farmSizePlaceholder: "एकड़ में खेत का आकार दर्ज करें",
    crops: "मुख्य फसलें",
    cropsPlaceholder: "मुख्य फसलें जो आप उगाते हैं",
    continueButton: "जारी रखें",
    skipForNow: "अभी के लिए छोड़ें",
    validation: {
      nameRequired: "नाम आवश्यक है",
      phoneRequired: "फोन नंबर आवश्यक है",
      villageRequired: "गांव आवश्यक है",
      districtRequired: "जिला आवश्यक है",
      stateRequired: "राज्य आवश्यक है",
      invalidPhone: "कृपया एक वैध फोन नंबर दर्ज करें"
    }
  },

  permissions: {
    title: "ऐप अनुमतियां",
    subtitle: "बेहतर अनुभव के लिए अनुमतियां दें",
    location: "स्थान पहुंच",
    locationDesc: "मौसम अपडेट और आस-पास की बाजार जानकारी प्राप्त करें",
    camera: "कैमरा पहुंच",
    cameraDesc: "विश्लेषण के लिए फसलों, कीटों और बीमारियों की तस्वीरें लें",
    notifications: "सूचनाएं",
    notificationsDesc: "मौसम, बाजार की कीमतों और योजनाओं के बारे में अलर्ट प्राप्त करें",
    storage: "भंडारण पहुंच",
    storageDesc: "तस्वीरें, दस्तावेज और ऑफलाइन डेटा सहेजें",
    allowButton: "अनुमति दें",
    skipButton: "छोड़ें",
    continueButton: "डैशबोर्ड पर जाएं"
  },

  dashboard: {
    hello: "नमस्ते",
    goodMorning: "सुप्रभात",
    goodAfternoon: "नमस्कार",
    goodEvening: "शुभ संध्या",
    farmer: "किसान",
    searchPlaceholder: "यहाँ खोजें... AI सहायक से पूछें",
    todayWeather: "आज का मौसम",
    humidity: "आर्द्रता",
    goodDayForFarming: "खेती के लिए अच्छा दिन",
    quickActions: "त्वरित कार्य",
    farmManagement: "खेत प्रबंधन",
    recentUpdates: "हाल की अपडेट्स",
    viewAll: "सभी देखें",
    loading: "ग्रामसेतु लोड हो रहा है...",
    logout: "लॉग आउट",
    logoutConfirmation: "क्या आप वाकई लॉग आउट करना चाहते हैं?",
    logoutError: "लॉग आउट नहीं हो सका। कृपया फिर से कोशिश करें।",
    languageChangeError: "भाषा बदली नहीं जा सकी। कृपया फिर से कोशिश करें।",
    profileMenu: "प्रोफाइल मेनू",
    changeLanguage: "भाषा बदलें"
  },

  // Add all other Hindi translations following the same pattern...
  // (I'll continue with a few key sections to show the pattern)

  marketplace: {
    title: "बाजार",
    subtitle: "कृषि उत्पाद खरीदें और बेचें",
    searchPlaceholder: "उत्पाद, फसल, उपकरण खोजें...",
    categories: "श्रेणियां",
    trending: "ट्रेंडिंग",
    nearbyMarkets: "नजदीकी बाजार",
    myListings: "मेरी लिस्टिंग",
    sellProduce: "उत्पाद बेचें",
    buyRequests: "खरीद अनुरोध",
    priceAlerts: "मूल्य चेतावनी",
    marketNews: "बाजार समाचार",
    filters: "फिल्टर",
    sortBy: "इसके अनुसार क्रमबद्ध करें",
    distance: "दूरी",
    price: "मूल्य",
    quality: "गुणवत्ता",
    availability: "उपलब्धता",
    fresh: "ताजा",
    organic: "जैविक",
    premium: "प्रीमियम",
    negotiable: "बातचीत योग्य",
    fixedPrice: "निश्चित मूल्य",
    perKg: "प्रति किलो",
    perQuintal: "प्रति क्विंटल",
    contactSeller: "विक्रेता से संपर्क करें",
    addToCart: "कार्ट में जोड़ें",
    buyNow: "अभी खरीदें",
    makeOffer: "प्रस्ताव दें",
    reportListing: "लिस्टिंग रिपोर्ट करें",
    shareListng: "लिस्टिंग साझा करें",
    saveForLater: "बाद के लिए सहेजें"
  },

  // Continue with the pattern for all sections...
  // For brevity, I'll add placeholders for remaining sections

  climate: {
    title: "मौसम और जलवायु",
    subtitle: "मौसम पूर्वानुमान और कृषि सलाह",
    currentWeather: "वर्तमान मौसम",
    forecast: "पूर्वानुमान",
    alerts: "चेतावनियां",
    advisory: "सलाह",
    temperature: "तापमान",
    humidity: "आर्द्रता",
    windSpeed: "हवा की गति",
    rainfall: "वर्षा",
    uvIndex: "यूवी इंडेक्स",
    soilMoisture: "मिट्टी की नमी",
    today: "आज",
    tomorrow: "कल",
    thisWeek: "इस सप्ताह",
    nextWeek: "अगला सप्ताह",
    rainAlert: "बारिश की चेतावनी",
    heatWave: "गर्मी की लहर",
    coldWave: "सर्दी की लहर",
    stormAlert: "तूफान की चेतावनी",
    farmingAdvice: "कृषि सलाह",
    irrigationAdvice: "सिंचाई सलाह",
    harvestAdvice: "फसल काटने की सलाह",
    sowingAdvice: "बुआई की सलाह",
    pestAlert: "कीट चेतावनी",
    diseaseAlert: "रोग चेतावनी",
    weatherHistory: "मौसम इतिहास",
    seasonalTrends: "मौसमी रुझान"
  },

  // Adding placeholder patterns for remaining sections...
  chatbot: { title: "AI सहायक", subtitle: "खेती के सवालों में तुरंत मदद पाएं", welcomeMessage: "नमस्ते! मैं आपका खेती सहायक हूं। आज मैं आपकी कैसे मदद कर सकता हूं?", typePlaceholder: "यहाँ अपना सवाल लिखें...", sendButton: "भेजें", voiceInput: "आवाज इनपुट", clearChat: "चैट साफ़ करें", chatHistory: "चैट इतिहास", quickQueries: "त्वरित प्रश्न", weatherQuery: "आज का मौसम कैसा है?", cropQuery: "इस मौसम के लिए बेहतरीन फसलें?", marketQuery: "वर्तमान बाजार भाव?", schemeQuery: "उपलब्ध सरकारी योजनाएं?", pestQuery: "कीट पहचान सहायता", fertilizer: "उर्वरक सुझाव", irrigation: "सिंचाई योजना", harvesting: "फसल काटने के टिप्स", pricing: "मूल्य पूर्वानुमान", government: "सरकारी योजनाएं", loans: "कृषि ऋण", insurance: "फसल बीमा", askAnything: "खेती के बारे में कुछ भी पूछें!", listening: "सुन रहा हूं...", processing: "आपके सवाल पर विचार कर रहा हूं...", error: "माफ़ करें, मैं इसे समझ नहीं पाया। कृपया फिर कोशिश करें।", tryAgain: "फिर कोशिश करें", noInternet: "इंटरनेट कनेक्शन नहीं है। कृपया अपना नेटवर्क जांचें।" },

  schemes: { title: "सरकारी योजनाएं", subtitle: "कृषि योजनाओं और सब्सिडी के लिए आवेदन करें", available: "उपलब्ध योजनाएं", applied: "आवेदन किया", approved: "स्वीकृत", rejected: "अस्वीकृत", searchSchemes: "योजनाएं खोजें...", filterBy: "फिल्टर करें", category: "श्रेणी", eligibility: "पात्रता", benefits: "लाभ", documents: "आवश्यक दस्तावेज", applyNow: "अभी आवेदन करें", checkStatus: "स्थिति जांचें", downloadForm: "फॉर्म डाउनलोड करें", uploadDocuments: "दस्तावेज अपलोड करें", submitApplication: "आवेदन जमा करें", trackApplication: "आवेदन ट्रैक करें", applicationHistory: "आवेदन इतिहास", renewApplication: "आवेदन नवीनीकरण", cancelApplication: "आवेदन रद्द करें", farmSubsidy: "कृषि सब्सिडी", cropInsurance: "फसल बीमा", soilHealth: "मिट्टी स्वास्थ्य", organicFarming: "जैविक खेती", irrigation: "सिंचाई", mechanization: "कृषि मशीनीकरण", storage: "भंडारण और गोदाम", processing: "खाद्य प्रसंस्करण", marketing: "विपणन सहायता", training: "प्रशिक्षण कार्यक्रम", womenFarmers: "महिला किसान", youthFarmers: "कृषि में युवा", tribal: "आदिवासी किसान", smallFarmers: "छोटे किसान", marginalFarmers: "सीमांत किसान" },

  labor: { title: "श्रमिक प्रबंधन", subtitle: "अपनी श्रमशक्ति का प्रबंधन करें और भुगतान ट्रैक करें", workforce: "श्रमशक्ति", attendance: "उपस्थिति", wages: "मजदूरी", tasks: "कार्य", schedule: "कार्यक्रम", payments: "भुगतान", addWorker: "श्रमिक जोड़ें", removeWorker: "श्रमिक हटाएं", editWorker: "श्रमिक संपादित करें", workerDetails: "श्रमिक विवरण", dailyWages: "दैनिक मजदूरी", weeklyWages: "साप्ताहिक मजदूरी", monthlyWages: "मासिक मजदूरी", overtimeRate: "ओवरटाइम दर", totalHours: "कुल घंटे", regularHours: "नियमित घंटे", overtimeHours: "ओवरटाइम घंटे", present: "उपस्थित", absent: "अनुपस्थित", halfDay: "आधा दिन", leave: "छुट्टी", holiday: "अवकाश", markAttendance: "उपस्थिति चिह्नित करें", generatePayroll: "पेरोल जेनरेट करें", paymentHistory: "भुगतान इतिहास", advancePayment: "अग्रिम भुगतान", deductions: "कटौती", bonuses: "बोनस", taskAssignment: "कार्य असाइनमेंट", taskCompletion: "कार्य पूर्णता", workQuality: "कार्य गुणवत्ता", performance: "प्रदर्शन", contracts: "अनुबंध", seasonal: "मौसमी", permanent: "स्थायी", temporary: "अस्थायी" },

  quickActions: { todayWeather: "आज का मौसम", marketPrices: "बाजार भाव", quickQuery: "त्वरित प्रश्न", alerts: "चेतावनियां", notifications: "सूचनाएं", camera: "कैमरा", calculator: "कैलकुलेटर", calendar: "कैलेंडर", contacts: "संपर्क", maps: "नक्शे", news: "समाचार", settings: "सेटिंग्स" },

  modules: { marketplace: "बाजार", marketplaceSubtitle: "कृषि उत्पाद खरीदें और बेचें", weather: "मौसम और जलवायु", weatherSubtitle: "मौसम पूर्वानुमान और कृषि सलाह", aiAssistant: "AI सहायक", aiAssistantSubtitle: "खेती के सवालों में तुरंत मदद पाएं", schemes: "सरकारी योजनाएं", schemesSubtitle: "कृषि योजनाओं और सब्सिडी के लिए आवेदन करें", labor: "श्रमिक प्रबंधन", laborSubtitle: "अपनी श्रमशक्ति का प्रबंधन करें और भुगतान ट्रैक करें" },

  common: { loading: "लोड हो रहा है...", error: "त्रुटि", success: "सफलता", warning: "चेतावनी", info: "जानकारी", cancel: "रद्द करें", ok: "ठीक है", yes: "हाँ", no: "नहीं", save: "सहेजें", delete: "हटाएं", edit: "संपादित करें", add: "जोड़ें", remove: "हटाएं", update: "अपडेट करें", submit: "जमा करें", reset: "रीसेट करें", clear: "साफ़ करें", search: "खोजें", filter: "फिल्टर", sort: "क्रमबद्ध करें", refresh: "रिफ्रेश करें", retry: "फिर कोशिश करें", back: "वापस", next: "अगला", previous: "पिछला", finish: "समाप्त", skip: "छोड़ें", continue: "जारी रखें", close: "बंद करें", open: "खोलें", share: "साझा करें", download: "डाउनलोड करें", upload: "अपलोड करें", copy: "कॉपी करें", paste: "पेस्ट करें", cut: "काटें", select: "चुनें", selectAll: "सभी चुनें", deselect: "अचयनित करें", required: "आवश्यक", optional: "वैकल्पिक", name: "नाम", email: "ईमेल", phone: "फोन", address: "पता", date: "दिनांक", time: "समय", amount: "राशि", quantity: "मात्रा", price: "मूल्य", total: "कुल", subtotal: "उप-कुल", tax: "कर", discount: "छूट", currency: "मुद्रा", rupees: "₹", today: "आज", yesterday: "कल", tomorrow: "कल", thisWeek: "इस सप्ताह", lastWeek: "पिछला सप्ताह", nextWeek: "अगला सप्ताह", thisMonth: "इस महीने", lastMonth: "पिछला महीना", nextMonth: "अगला महीना", thisYear: "इस साल", lastYear: "पिछला साल", nextYear: "अगला साल" },

  navigation: { home: "होम", dashboard: "डैशबोर्ड", marketplace: "बाजार", weather: "मौसम", chatbot: "AI सहायक", schemes: "योजनाएं", labor: "श्रमिक", profile: "प्रोफाइल", settings: "सेटिंग्स", help: "सहायता", about: "के बारे में", privacy: "गोपनीयता नीति", terms: "सेवा की शर्तें", contact: "संपर्क करें", feedback: "फीडबैक", support: "सहायता", logout: "लॉग आउट" },

  validation: { required: "यह फ़ील्ड आवश्यक है", invalidEmail: "कृपया एक वैध ईमेल पता दर्ज करें", invalidPhone: "कृपया एक वैध फोन नंबर दर्ज करें", passwordTooShort: "पासवर्ड कम से कम 8 वर्ण का होना चाहिए", passwordsNotMatch: "पासवर्ड मेल नहीं खाते", invalidDate: "कृपया एक वैध दिनांक दर्ज करें", invalidAmount: "कृपया एक वैध राशि दर्ज करें", fieldRequired: "यह फ़ील्ड आवश्यक है", pleaseSelectOption: "कृपया एक विकल्प चुनें", fileTooLarge: "फ़ाइल का आकार बहुत बड़ा है", invalidFileType: "अमान्य फ़ाइल प्रकार", networkError: "नेटवर्क कनेक्शन त्रुटि", serverError: "सर्वर त्रुटि हुई", tryAgainLater: "कृपया बाद में फिर कोशिश करें" },

  status: { connecting: "कनेक्ट हो रहा है...", connected: "कनेक्ट हो गया", disconnected: "कनेक्शन टूट गया", syncing: "सिंक हो रहा है...", synced: "सिंक हो गया", uploading: "अपलोड हो रहा है...", uploaded: "अपलोड हो गया", downloading: "डाउनलोड हो रहा है...", downloaded: "डाउनलोड हो गया", processing: "प्रोसेसिंग...", processed: "प्रोसेस हो गया", completed: "पूर्ण", failed: "असफल", pending: "लंबित", approved: "स्वीकृत", rejected: "अस्वीकृत", cancelled: "रद्द किया गया", expired: "समाप्त", active: "सक्रिय", inactive: "निष्क्रिय" },

  units: { kg: "किग्रा", quintal: "क्विंटल", ton: "टन", gram: "ग्राम", liter: "लीटर", milliliter: "मिली", meter: "मीटर", kilometer: "किमी", centimeter: "सेमी", feet: "फीट", acre: "एकड़", hectare: "हेक्टेयर", celsius: "°C", fahrenheit: "°F", percentage: "%", currency: "₹", per: "प्रति" }
};

// Export comprehensive translations with all languages
const comprehensiveTranslations: Record<string, ComprehensiveTranslations> = {
  en: englishTranslations,
  hi: hindiTranslations,
  // Add more languages as needed
  mr: englishTranslations, // Marathi (using English as placeholder for now)
  gu: englishTranslations, // Gujarati (using English as placeholder for now)
  ta: englishTranslations, // Tamil (using English as placeholder for now)
  bn: englishTranslations, // Bengali (using English as placeholder for now)
};

export default comprehensiveTranslations;
