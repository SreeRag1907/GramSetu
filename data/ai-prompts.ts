// import { ChatContext } from '../services/geminiAI';

export interface PromptTemplate {
  id: string;
  category: string;
  template: string;
  variables: string[];
}

export interface AgricultureContext {
  crops: {
    [cropName: string]: {
      currentStage: 'sowing' | 'vegetative' | 'flowering' | 'fruiting' | 'harvesting';
      sowingDate?: Date;
      area: number;
      variety?: string;
      lastActivity?: string;
    };
  };
  farmingPractices: {
    isOrganic: boolean;
    irrigationType: 'flood' | 'drip' | 'sprinkler' | 'rain-fed';
    soilType: 'clay' | 'sandy' | 'loam' | 'black' | 'red' | 'alluvial';
    soilPH?: number;
  };
  resources: {
    laborAvailable: number;
    machineryAccess: string[];
    budgetConstraints: 'low' | 'medium' | 'high';
  };
  challenges: {
    commonPests: string[];
    soilIssues: string[];
    weatherConcerns: string[];
  };
}

// Specialized prompt templates for different farming scenarios
export const agriculturalPrompts: PromptTemplate[] = [
  {
    id: 'crop_management',
    category: 'Crop Management',
    template: `Based on the crop {{cropName}} at {{currentStage}} stage in {{location}} during {{season}} season:

Current conditions:
- Farm size: {{farmSize}} acres
- Soil type: {{soilType}}
- Irrigation: {{irrigationType}}
- Weather: {{weather}}

Please provide specific advice for:
1. Current stage management
2. Next 7-14 days action plan
3. Potential issues to watch for
4. Resource optimization tips
5. Expected timeline for next stage

Consider the farmer's {{budgetConstraints}} budget and {{isOrganic}} farming approach.`,
    variables: ['cropName', 'currentStage', 'location', 'season', 'farmSize', 'soilType', 'irrigationType', 'weather', 'budgetConstraints', 'isOrganic']
  },
  {
    id: 'pest_disease_diagnosis',
    category: 'Pest & Disease',
    template: `Farmer reports symptoms in {{cropName}}:
- Affected area: {{affectedArea}}
- Symptoms: {{symptoms}}
- When noticed: {{timeNoticed}}
- Current stage: {{cropStage}}
- Previous treatments: {{previousTreatments}}

Weather conditions: {{weather}}
Farming method: {{farmingMethod}}

Please provide:
1. Likely diagnosis with confidence level
2. Immediate action steps
3. Treatment options (organic/chemical based on preference)
4. Prevention strategies
5. When to expect recovery
6. Follow-up monitoring plan

Focus on cost-effective, locally available solutions.`,
    variables: ['cropName', 'affectedArea', 'symptoms', 'timeNoticed', 'cropStage', 'previousTreatments', 'weather', 'farmingMethod']
  },
  {
    id: 'weather_advisory',
    category: 'Weather Advisory',
    template: `Weather forecast for {{location}}:
{{weatherForecast}}

Current crops: {{currentCrops}}
Growth stages: {{cropStages}}
Farm infrastructure: {{infrastructure}}

Based on this forecast, provide:
1. Immediate protective measures needed
2. Field activity recommendations
3. Irrigation schedule adjustments
4. Crop protection strategies
5. Labor planning suggestions
6. Equipment preparation needs

Consider the farmer has {{laborCount}} workers and {{budgetConstraints}} budget.`,
    variables: ['location', 'weatherForecast', 'currentCrops', 'cropStages', 'infrastructure', 'laborCount', 'budgetConstraints']
  },
  {
    id: 'market_strategy',
    category: 'Market Strategy',
    template: `Market analysis for {{cropName}}:

Current prices: {{currentPrices}}
Price trends: {{priceTrends}}
Harvest timeline: {{harvestTimeline}}
Quality grade: {{qualityGrade}}
Quantity available: {{quantity}}

Storage facilities: {{storageOptions}}
Transportation: {{transportOptions}}
Local market access: {{marketAccess}}

Provide strategy for:
1. Optimal selling time
2. Price negotiation tips
3. Quality improvement suggestions
4. Storage vs immediate sale analysis
5. Alternative market channels
6. Value addition opportunities

Focus on maximizing farmer income with available resources.`,
    variables: ['cropName', 'currentPrices', 'priceTrends', 'harvestTimeline', 'qualityGrade', 'quantity', 'storageOptions', 'transportOptions', 'marketAccess']
  },
  {
    id: 'government_scheme_guidance',
    category: 'Government Schemes',
    template: `Farmer profile:
- Land size: {{landSize}} acres
- Crops: {{crops}}
- Category: {{farmerCategory}}
- Annual income: {{income}}
- Location: {{location}}
- Documentation status: {{documents}}

Current need: {{specificNeed}}

Available schemes: {{availableSchemes}}

Provide guidance on:
1. Most suitable schemes for this farmer
2. Eligibility assessment
3. Application process step-by-step
4. Required documents
5. Timeline and deadlines
6. Benefits estimation
7. Common pitfalls to avoid

Prioritize schemes with highest success probability and maximum benefit.`,
    variables: ['landSize', 'crops', 'farmerCategory', 'income', 'location', 'documents', 'specificNeed', 'availableSchemes']
  },
  {
    id: 'irrigation_optimization',
    category: 'Water Management',
    template: `Water management situation:
- Irrigation method: {{irrigationMethod}}
- Water source: {{waterSource}}
- Soil type: {{soilType}}
- Crop water requirements: {{cropWaterNeeds}}
- Current stage: {{cropStage}}
- Weather pattern: {{weatherPattern}}
- Water availability: {{waterAvailability}}

Field conditions:
- Slope: {{fieldSlope}}
- Drainage: {{drainageStatus}}
- Soil moisture: {{soilMoisture}}

Optimize for:
1. Water use efficiency
2. Crop stress prevention
3. Cost reduction
4. System improvements
5. Scheduling optimization
6. Technology recommendations

Consider {{budgetConstraints}} budget and {{laborAvailability}} labor availability.`,
    variables: ['irrigationMethod', 'waterSource', 'soilType', 'cropWaterNeeds', 'cropStage', 'weatherPattern', 'waterAvailability', 'fieldSlope', 'drainageStatus', 'soilMoisture', 'budgetConstraints', 'laborAvailability']
  },
  {
    id: 'fertilizer_recommendation',
    category: 'Nutrition Management',
    template: `Soil and crop nutrition analysis:

Soil test results:
- pH: {{soilPH}}
- Organic matter: {{organicMatter}}
- N-P-K levels: {{npkLevels}}
- Micronutrients: {{micronutrients}}

Crop details:
- Crop: {{cropName}}
- Stage: {{cropStage}}
- Expected yield target: {{yieldTarget}}
- Previous fertilizer history: {{fertilizerHistory}}

Farm practices:
- Organic farming: {{isOrganic}}
- Budget range: {{budgetRange}}
- Application method preference: {{applicationMethod}}

Provide recommendations for:
1. Immediate fertilizer needs
2. Application timing and method
3. Organic vs synthetic options
4. Cost-effective combinations
5. Application schedule
6. Soil health improvement plan

Focus on sustainable, cost-effective nutrition management.`,
    variables: ['soilPH', 'organicMatter', 'npkLevels', 'micronutrients', 'cropName', 'cropStage', 'yieldTarget', 'fertilizerHistory', 'isOrganic', 'budgetRange', 'applicationMethod']
  }
];

// Context builders for different scenarios
export class PromptContextBuilder {
  static buildCropManagementContext(
    cropData: any,
    weatherData: any,
    userProfile: any
  ): string {
    const template = agriculturalPrompts.find(p => p.id === 'crop_management')?.template || '';
    
    return this.replaceVariables(template, {
      cropName: cropData.cropName || 'general crop',
      currentStage: cropData.currentStage || 'unknown',
      location: userProfile.location || 'India',
      season: this.getCurrentSeason(),
      farmSize: userProfile.farmSize || 'small',
      soilType: cropData.soilType || 'mixed',
      irrigationType: cropData.irrigationType || 'traditional',
      weather: `${weatherData.temperature}°C, ${weatherData.condition}`,
      budgetConstraints: userProfile.budgetConstraints || 'medium',
      isOrganic: cropData.isOrganic ? 'organic' : 'conventional'
    });
  }

  static buildPestDiagnosisContext(
    symptoms: string,
    cropData: any,
    weatherData: any
  ): string {
    const template = agriculturalPrompts.find(p => p.id === 'pest_disease_diagnosis')?.template || '';
    
    return this.replaceVariables(template, {
      cropName: cropData.cropName || 'crop',
      affectedArea: cropData.affectedArea || 'not specified',
      symptoms: symptoms,
      timeNoticed: 'recently',
      cropStage: cropData.currentStage || 'unknown',
      previousTreatments: cropData.previousTreatments || 'none',
      weather: `${weatherData.temperature}°C, ${weatherData.condition}, ${weatherData.humidity}% humidity`,
      farmingMethod: cropData.isOrganic ? 'organic' : 'conventional'
    });
  }

  static buildWeatherAdvisoryContext(
    weatherForecast: any,
    cropsData: any[],
    userProfile: any
  ): string {
    const template = agriculturalPrompts.find(p => p.id === 'weather_advisory')?.template || '';
    
    return this.replaceVariables(template, {
      location: userProfile.location || 'your area',
      weatherForecast: this.formatWeatherForecast(weatherForecast),
      currentCrops: cropsData.map(c => c.cropName).join(', ') || 'mixed crops',
      cropStages: cropsData.map(c => `${c.cropName}: ${c.currentStage}`).join(', '),
      infrastructure: userProfile.infrastructure || 'basic',
      laborCount: userProfile.laborCount || 'limited',
      budgetConstraints: userProfile.budgetConstraints || 'medium'
    });
  }

  static buildMarketStrategyContext(
    cropName: string,
    marketData: any,
    harvestData: any,
    userProfile: any
  ): string {
    const template = agriculturalPrompts.find(p => p.id === 'market_strategy')?.template || '';
    
    return this.replaceVariables(template, {
      cropName: cropName,
      currentPrices: marketData.currentPrice ? `₹${marketData.currentPrice}/quintal` : 'price data unavailable',
      priceTrends: marketData.trend || 'stable',
      harvestTimeline: harvestData.expectedDate || 'upcoming',
      qualityGrade: harvestData.quality || 'good',
      quantity: harvestData.quantity || 'estimated',
      storageOptions: userProfile.storageOptions || 'limited',
      transportOptions: userProfile.transportOptions || 'local transport',
      marketAccess: userProfile.marketAccess || 'local mandi'
    });
  }

  static buildSchemeGuidanceContext(
    userProfile: any,
    specificNeed: string,
    availableSchemes: any[]
  ): string {
    const template = agriculturalPrompts.find(p => p.id === 'government_scheme_guidance')?.template || '';
    
    return this.replaceVariables(template, {
      landSize: userProfile.farmSize || 'small',
      crops: userProfile.primaryCrops?.join(', ') || 'mixed farming',
      farmerCategory: userProfile.category || 'small farmer',
      income: userProfile.annualIncome || 'not specified',
      location: userProfile.location || 'India',
      documents: userProfile.hasDocuments ? 'available' : 'partial',
      specificNeed: specificNeed,
      availableSchemes: availableSchemes.map(s => s.title).join(', ')
    });
  }

  // Utility methods
  private static replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    });
    return result;
  }

  private static getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 6 && month <= 10) return 'kharif';
    if (month >= 11 || month <= 3) return 'rabi';
    return 'summer';
  }

  private static formatWeatherForecast(forecast: any): string {
    if (!forecast) return 'Forecast unavailable';
    return `Today: ${forecast.temperature}°C, ${forecast.condition}. Tomorrow: Expected ${forecast.tomorrow?.condition || 'similar conditions'}.`;
  }
}

// Quick response templates for common queries
export const quickResponseTemplates = {
  greeting: {
    en: "🧠 Namaste! I'm your Gemini Pro AI farming consultant. I provide advanced agricultural intelligence with deep expertise in crop science, precision farming, and market analysis. How can I help optimize your farming today?",
    hi: "🧠 नमस्ते! मैं आपका Gemini Pro AI कृषि सलाहकार हूं। मैं फसल विज्ञान, सटीक खेती और बाजार विश्लेषण में गहरी विशेषज्ञता के साथ उन्नत कृषि बुद्धिमत्ता प्रदान करता हूं। आज मैं आपकी खेती को कैसे अनुकूलित करने में मदद कर सकता हूं?",
    bn: "🧠 নমস্কার! আমি আপনার Gemini Pro AI কৃষি পরামর্শদাতা। আমি ফসলের বিজ্ঞান, নির্ভুল কৃষি এবং বাজার বিশ্লেষণে গভীর দক্ষতার সাথে উন্নত কৃষি বুদ্ধিমত্তা প্রদান করি। আজ আমি কীভাবে আপনার কৃষিকাজ অপ্টিমাইজ করতে সাহায্য করতে পারি?",
    gu: "🧠 નમસ્તે! હું તમારો Gemini Pro AI કૃષિ સલાહકાર છું। હું પાક વિજ્ઞાન, ચોક્કસ ખેતી અને બજાર વિશ્લેષણમાં ઊંડી નિપુણતા સાથે અદ્યતન કૃષિ બુદ્ધિમત્તા પ્રદાન કરું છું. આજે હું તમારી ખેતીને કેવી રીતે અનુકૂલિત કરવામાં મદદ કરી શકું?",
    ta: "🧠 வணக்கம்! நான் உங்கள் Gemini Pro AI விவசாய ஆலோசகர். பயிர் அறிவியல், துல்லிய விவசாயம் மற்றும் சந்தை பகுப்பாய்வில் ஆழமான நிபுணத்துடன் மேம்பட்ட விவசாய நுண்ணறிவை வழங்குகிறேன். இன்று உங்கள் விவசாயத்தை மேம்படுத்த நான் எப்படி உதவ முடியும்?",
    mr: "🧠 नमस्कार! मी तुमचा Gemini Pro AI शेती सल्लागार आहे. मी पीक विज्ञान, अचूक शेती आणि बाजार विश्लेषणात खोल तज्ञतेसह प्रगत कृषी बुद्धिमत्ता प्रदान करतो. आज मी तुमच्या शेतीला कसे अनुकूल करण्यात मदत करू शकतो?"
  },
  
  capabilities: {
    en: `🧠 I'm your Gemini Pro agricultural intelligence system. I provide:
    
• Advanced Crop Science: Genetics, physiology, precision breeding advice
• Integrated Pest Management: Biological controls, resistance strategies  
• Climate-Smart Agriculture: Adaptation & mitigation strategies
• Precision Irrigation: Water-use efficiency optimization
• Soil Health Analytics: Nutrient cycling, microbiology insights
• Market Intelligence: Price forecasting, value chain optimization
• Government Schemes: Eligibility analysis, application strategies
• Smart Farming: IoT integration, automation recommendations
• Sustainability: Carbon farming, biodiversity enhancement
• Financial Planning: ROI analysis, risk management

What agricultural challenge can I help you solve with data-driven insights?`,
    hi: `🧠 मैं आपका Gemini Pro कृषि बुद्धिमत्ता सिस्टम हूं। मैं प्रदान करता हूं:
    
• उन्नत फसल विज्ञान: आनुवंशिकता, शरीर विज्ञान, सटीक प्रजनन सलाह
• एकीकृत कीट प्रबंधन: जैविक नियंत्रण, प्रतिरोध रणनीतियां
• जलवायु-स्मार्ट कृषि: अनुकूलन और शमन रणनीतियां  
• सटीक सिंचाई: पानी के उपयोग की दक्षता अनुकूलन
• मिट्टी स्वास्थ्य विश्लेषण: पोषक तत्व चक्रण, सूक्ष्म जीव विज्ञान अंतर्दृष्टि
• बाजार बुद्धिमत्ता: मूल्य पूर्वानुमान, मूल्य श्रृंखला अनुकूलन
• सरकारी योजनाएं: पात्रता विश्लेषण, आवेदन रणनीतियां
• स्मार्ट फार्मिंग: IoT एकीकरण, स्वचालन सिफारिशें
• स्थिरता: कार्बन फार्मिंग, जैव विविधता वृद्धि
• वित्तीय योजना: ROI विश्लेषण, जोखिम प्रबंधन

डेटा-संचालित अंतर्दृष्टि के साथ मैं किस कृषि चुनौती को हल करने में आपकी सहायता कर सकता हूं?`
  },
  
  error: {
    en: "🤖 I'm experiencing some technical difficulties. Please try again in a moment, or check other sections of GramSetu for immediate help.",
    hi: "🤖 मुझे कुछ तकनीकी समस्या हो रही है। कृपया थोड़ी देर बाद फिर कोशिश करें, या तत्काल सहायता के लिए ग्रामसेतु के अन्य भागों को देखें।"
  }
};