// Localization system for GramSetu app

export interface TranslationStrings {
  // Dashboard
  goodMorning: string;
  goodAfternoon: string;
  goodEvening: string;
  farmer: string;
  searchPlaceholder: string;
  todayWeather: string;
  humidity: string;
  quickActions: string;
  mainModules: string;
  recentActivities: string;
  viewAll: string;
  
  // Profile Menu
  profileMenu: string;
  changeLanguage: string;
  logout: string;
  
  // Modules
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
  
  // Quick Actions
  todayWeatherAction: string;
  marketPrices: string;
  quickQuery: string;
  alerts: string;
  
  // Common
  loading: string;
  error: string;
  success: string;
  cancel: string;
  ok: string;
  save: string;
  delete: string;
  edit: string;
  add: string;
  
  // Language Selection
  chooseLanguage: string;
  selectLanguage: string;
  currentLanguage: string;
}

export const translations: { [key: string]: TranslationStrings } = {
  en: {
    // Dashboard
    goodMorning: 'Good Morning',
    goodAfternoon: 'Good Afternoon', 
    goodEvening: 'Good Evening',
    farmer: 'Farmer',
    searchPlaceholder: 'Search here... Ask AI assistant',
    todayWeather: "Today's Weather",
    humidity: 'Humidity',
    quickActions: 'Quick Actions',
    mainModules: 'Main Modules',
    recentActivities: 'Recent Activities',
    viewAll: 'View all',
    
    // Profile Menu
    profileMenu: 'Profile Menu',
    changeLanguage: 'Change Language',
    logout: 'Logout',
    
    // Modules
    marketplace: 'Marketplace',
    marketplaceSubtitle: 'Sell & Buy Produce',
    weather: 'Weather',
    weatherSubtitle: 'Climate Analysis',
    aiAssistant: 'AI Assistant',
    aiAssistantSubtitle: 'Smart Farming Tips',
    schemes: 'Schemes',
    schemesSubtitle: 'Government Benefits',
    labor: 'Labor',
    laborSubtitle: 'Workforce Management',
    
    // Quick Actions
    todayWeatherAction: "Today's Weather",
    marketPrices: 'Market Prices',
    quickQuery: 'Quick Query',
    alerts: 'Alerts',
    
    // Common
    loading: 'Loading GramSetu...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    ok: 'OK',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    
    // Language Selection
    chooseLanguage: 'Choose Your Language',
    selectLanguage: 'Select Language',
    currentLanguage: 'Current Language',
  },
  
  hi: {
    // Dashboard
    goodMorning: 'सुप्रभात',
    goodAfternoon: 'शुभ दोपहर',
    goodEvening: 'शुभ संध्या',
    farmer: 'किसान',
    searchPlaceholder: 'यहाँ खोजें... AI असिस्टेंट से पूछें',
    todayWeather: 'आज का मौसम',
    humidity: 'आर्द्रता',
    quickActions: 'त्वरित कार्य',
    mainModules: 'मुख्य मॉड्यूल',
    recentActivities: 'हाल की गतिविधियाँ',
    viewAll: 'सभी देखें',
    
    // Profile Menu
    profileMenu: 'प्रोफ़ाइल मेनू',
    changeLanguage: 'भाषा बदलें',
    logout: 'लॉग आउट',
    
    // Modules
    marketplace: 'बाज़ार',
    marketplaceSubtitle: 'फसल बेचें और खरीदें',
    weather: 'मौसम',
    weatherSubtitle: 'जलवायु विश्लेषण',
    aiAssistant: 'AI सहायक',
    aiAssistantSubtitle: 'स्मार्ट कृषि सुझाव',
    schemes: 'योजनाएं',
    schemesSubtitle: 'सरकारी लाभ',
    labor: 'मज़दूर',
    laborSubtitle: 'श्रमिक प्रबंधन',
    
    // Quick Actions
    todayWeatherAction: 'आज का मौसम',
    marketPrices: 'बाज़ार दर',
    quickQuery: 'त्वरित प्रश्न',
    alerts: 'अलर्ट',
    
    // Common
    loading: 'ग्रामसेतु लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    cancel: 'रद्द करें',
    ok: 'ठीक है',
    save: 'सहेजें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    add: 'जोड़ें',
    
    // Language Selection
    chooseLanguage: 'अपनी भाषा चुनें',
    selectLanguage: 'भाषा चुनें',
    currentLanguage: 'वर्तमान भाषा',
  },
  
  mr: {
    // Dashboard
    goodMorning: 'सुप्रभात',
    goodAfternoon: 'शुभ दुपार',
    goodEvening: 'शुभ संध्याकाळ',
    farmer: 'शेतकरी',
    searchPlaceholder: 'इथे शोधा... AI सहाय्यकाला विचारा',
    todayWeather: 'आजचे हवामान',
    humidity: 'आर्द्रता',
    quickActions: 'द्रुत कृती',
    mainModules: 'मुख्य मॉड्यूल',
    recentActivities: 'अलीकडील क्रियाकलाप',
    viewAll: 'सर्व पहा',
    
    // Profile Menu
    profileMenu: 'प्रोफाइल मेनू',
    changeLanguage: 'भाषा बदला',
    logout: 'लॉग आउट',
    
    // Modules
    marketplace: 'बाजारपेठ',
    marketplaceSubtitle: 'पीक विका आणि खरेदी करा',
    weather: 'हवामान',
    weatherSubtitle: 'हवामान विश्लेषण',
    aiAssistant: 'AI सहाय्यक',
    aiAssistantSubtitle: 'स्मार्ट शेती टिप्स',
    schemes: 'योजना',
    schemesSubtitle: 'सरकारी लाभ',
    labor: 'मजूर',
    laborSubtitle: 'कामगार व्यवस्थापन',
    
    // Quick Actions
    todayWeatherAction: 'आजचे हवामान',
    marketPrices: 'बाजार दर',
    quickQuery: 'द्रुत प्रश्न',
    alerts: 'इशारे',
    
    // Common
    loading: 'ग्रामसेतू लोड होत आहे...',
    error: 'त्रुटी',
    success: 'यश',
    cancel: 'रद्द करा',
    ok: 'ठीक आहे',
    save: 'जतन करा',
    delete: 'हटवा',
    edit: 'संपादित करा',
    add: 'जोडा',
    
    // Language Selection
    chooseLanguage: 'तुमची भाषा निवडा',
    selectLanguage: 'भाषा निवडा',
    currentLanguage: 'सध्याची भाषा',
  },
  
  gu: {
    // Dashboard
    goodMorning: 'સુપ્રભાત',
    goodAfternoon: 'શુભ બપોર',
    goodEvening: 'શુભ સાંજ',
    farmer: 'ખેડૂત',
    searchPlaceholder: 'અહીં શોધો... AI સહાયકને પૂછો',
    todayWeather: 'આજનું હવામાન',
    humidity: 'ભેજ',
    quickActions: 'ઝડપી ક્રિયાઓ',
    mainModules: 'મુખ્ય મોડ્યુલ',
    recentActivities: 'તાજેતરની પ્રવૃત્તિઓ',
    viewAll: 'બધુ જોવો',
    
    // Profile Menu
    profileMenu: 'પ્રોફાઇલ મેનૂ',
    changeLanguage: 'ભાષા બદલો',
    logout: 'લોગ આઉટ',
    
    // Modules
    marketplace: 'બજાર',
    marketplaceSubtitle: 'પાક વેચો અને ખરીદો',
    weather: 'હવામાન',
    weatherSubtitle: 'આબોહવા વિશ્લેષણ',
    aiAssistant: 'AI સહાયક',
    aiAssistantSubtitle: 'સ્માર્ટ ખેતી ટિપ્સ',
    schemes: 'યોજનાઓ',
    schemesSubtitle: 'સરકારી લાભો',
    labor: 'મજૂર',
    laborSubtitle: 'કામદાર વ્યવસ્થાપન',
    
    // Quick Actions
    todayWeatherAction: 'આજનું હવામાન',
    marketPrices: 'બજાર ભાવ',
    quickQuery: 'ઝડપી પ્રશ્ન',
    alerts: 'ચેતવણીઓ',
    
    // Common
    loading: 'ગ્રામસેતુ લોડ થઈ રહ્યું છે...',
    error: 'ભૂલ',
    success: 'સફળતા',
    cancel: 'રદ કરો',
    ok: 'બરાબર',
    save: 'સેવ કરો',
    delete: 'કાઢી નાખો',
    edit: 'સંપાદિત કરો',
    add: 'ઉમેરો',
    
    // Language Selection
    chooseLanguage: 'તમારી ભાષા પસંદ કરો',
    selectLanguage: 'ભાષા પસંદ કરો',
    currentLanguage: 'વર્તમાન ભાષા',
  },
  
  ta: {
    // Dashboard
    goodMorning: 'காலை வணக்கம்',
    goodAfternoon: 'மதிய வணக்கம்',
    goodEvening: 'மாலை வணக்கம்',
    farmer: 'விவசாயி',
    searchPlaceholder: 'இங்கே தேடுங்கள்... AI உதவியாளரிடம் கேட்கவும்',
    todayWeather: 'இன்றைய வானிலை',
    humidity: 'ஈரப்பதம்',
    quickActions: 'விரைவு செயல்கள்',
    mainModules: 'முக்கிய தொகுதிகள்',
    recentActivities: 'சமீபத்திய செயல்பாடுகள்',
    viewAll: 'அனைத்தும் காண்க',
    
    // Profile Menu
    profileMenu: 'சுயவிவர மெனு',
    changeLanguage: 'மொழியை மாற்று',
    logout: 'வெளியேறு',
    
    // Modules
    marketplace: 'சந்தை',
    marketplaceSubtitle: 'பயிர்கள் விற்று வாங்கவும்',
    weather: 'வானிலை',
    weatherSubtitle: 'காலநிலை பகுப்பாய்வு',
    aiAssistant: 'AI உதவியாளர்',
    aiAssistantSubtitle: 'ஸ்மார்ட் விவசாய குறிப்புகள்',
    schemes: 'திட்டங்கள்',
    schemesSubtitle: 'அரசு நலன்கள்',
    labor: 'தொழிலாளர்',
    laborSubtitle: 'பணியாளர் மேலாண்மை',
    
    // Quick Actions
    todayWeatherAction: 'இன்றைய வானிலை',
    marketPrices: 'சந்தை விலைகள்',
    quickQuery: 'விரைவு கேள்வி',
    alerts: 'எச்சரிக்கைகள்',
    
    // Common
    loading: 'கிராம சேது ஏற்றப்படுகிறது...',
    error: 'பிழை',
    success: 'வெற்றி',
    cancel: 'ரத்து செய்',
    ok: 'சரி',
    save: 'சேமி',
    delete: 'நீக்கு',
    edit: 'திருத்து',
    add: 'சேர்',
    
    // Language Selection
    chooseLanguage: 'உங்கள் மொழியை தேர்ந்தெடுக்கவும்',
    selectLanguage: 'மொழியை தேர்ந்தெடு',
    currentLanguage: 'தற்போதைய மொழி',
  },
  
  bn: {
    // Dashboard
    goodMorning: 'সুপ্রভাত',
    goodAfternoon: 'শুভ অপরাহ্ন',
    goodEvening: 'শুভ সন্ধ্যা',
    farmer: 'কৃষক',
    searchPlaceholder: 'এখানে খোঁজ করুন... AI সহায়কের কাছে জিজ্ঞাসা করুন',
    todayWeather: 'আজকের আবহাওয়া',
    humidity: 'আর্দ্রতা',
    quickActions: 'দ্রুত কার্যক্রম',
    mainModules: 'প্রধান মডিউল',
    recentActivities: 'সাম্প্রতিক কার্যক্রম',
    viewAll: 'সব দেখুন',
    
    // Profile Menu
    profileMenu: 'প্রোফাইল মেনু',
    changeLanguage: 'ভাষা পরিবর্তন করুন',
    logout: 'লগ আউট',
    
    // Modules
    marketplace: 'বাজার',
    marketplaceSubtitle: 'ফসল বিক্রয় ও ক্রয়',
    weather: 'আবহাওয়া',
    weatherSubtitle: 'জলবায়ু বিশ্লেষণ',
    aiAssistant: 'AI সহায়ক',
    aiAssistantSubtitle: 'স্মার্ট কৃষি টিপস',
    schemes: 'প্রকল্প',
    schemesSubtitle: 'সরকারি সুবিধা',
    labor: 'শ্রমিক',
    laborSubtitle: 'কর্মী ব্যবস্থাপনা',
    
    // Quick Actions
    todayWeatherAction: 'আজকের আবহাওয়া',
    marketPrices: 'বাজার দর',
    quickQuery: 'দ্রুত প্রশ্ন',
    alerts: 'সতর্কতা',
    
    // Common
    loading: 'গ্রামসেতু লোড হচ্ছে...',
    error: 'ত্রুটি',
    success: 'সাফল্য',
    cancel: 'বাতিল',
    ok: 'ঠিক আছে',
    save: 'সংরক্ষণ',
    delete: 'মুছুন',
    edit: 'সম্পাদনা',
    add: 'যোগ করুন',
    
    // Language Selection
    chooseLanguage: 'আপনার ভাষা নির্বাচন করুন',
    selectLanguage: 'ভাষা নির্বাচন করুন',
    currentLanguage: 'বর্তমান ভাষা',
  },
};

export default translations;
