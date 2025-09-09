// Chatbot static data

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  category: string;
}

export interface QuickQuery {
  id: string;
  text: string;
  category: string;
  icon: string;
}

export const quickQueries: QuickQuery[] = [
  { id: '1', text: 'What fertilizer should I use for wheat?', category: 'Fertilizer', icon: '🌾' },
  { id: '2', text: 'How to control pest in tomato plants?', category: 'Pest Control', icon: '🍅' },
  { id: '3', text: 'Best time to sow rice?', category: 'Sowing', icon: '🌱' },
  { id: '4', text: 'Signs of plant diseases in cotton?', category: 'Disease', icon: '🔍' },
  { id: '5', text: 'Organic farming techniques?', category: 'Organic', icon: '🌿' },
  { id: '6', text: 'Soil pH testing methods?', category: 'Soil Health', icon: '🧪' },
  { id: '7', text: 'Water management in drought?', category: 'Irrigation', icon: '💧' },
  { id: '8', text: 'Market price of sugarcane?', category: 'Market', icon: '💰' },
];

export const chatCategories = [
  'Welcome',
  'Weather',
  'Market',
  'Fertilizer',
  'Pest Control',
  'Disease',
  'Irrigation',
  'Soil Health',
  'Sowing',
  'Organic',
  'General'
];

// AI Response templates
export const aiResponses = {
  weather: "🌤️ Based on current weather data:\n\n• Today: 28°C, partly cloudy\n• Tomorrow: Chance of rain (80%)\n• Recommendation: Delay outdoor activities tomorrow\n\nWould you like detailed weather forecast or farming advisories based on weather conditions?",
  
  market: "💰 Current market prices in your area:\n\n🌾 Wheat: ₹2,450/quintal (↗️ +₹50)\n🌾 Rice: ₹3,200/quintal (↘️ -₹80)\n🍅 Tomato: ₹25/kg (↗️ +₹5)\n🧅 Onion: ₹18/kg (↘️ -₹3)\n\nWould you like to list your produce for sale or get more detailed price trends?",
  
  fertilizer: "🌱 Fertilizer recommendations:\n\n🌾 For Wheat:\n• NPK 12:32:16 at sowing\n• Urea top-dressing at 45 days\n• Apply based on soil test results\n\n📊 General guidelines:\n• Test soil pH first (ideal: 6.0-7.5)\n• Apply organic manure before chemical fertilizers\n• Follow 4R principles: Right source, Right rate, Right time, Right place\n\nNeed specific recommendations for your crop and soil type?",
  
  pest: "🐛 Pest management strategies:\n\n🔍 Identification:\n• Upload photos for pest identification\n• Monitor regularly (weekly checks)\n• Look for eggs, larvae, and damage patterns\n\n🛡️ Control methods:\n• Integrated Pest Management (IPM)\n• Biological controls (beneficial insects)\n• Neem-based organic pesticides\n• Chemical control as last resort\n\nWhich specific pest are you dealing with?",
  
  disease: "🦠 Disease management:\n\n🔍 Common symptoms:\n• Leaf spots, wilting, discoloration\n• Stunted growth, rotting\n• Unusual leaf patterns\n\n💊 Treatment approach:\n• Early detection is key\n• Improve air circulation\n• Avoid overhead watering\n• Use disease-resistant varieties\n• Apply fungicides if necessary\n\nDescribe the symptoms you're seeing for specific advice.",
  
  irrigation: "💧 Water management tips:\n\n⏰ Irrigation scheduling:\n• Early morning (6-8 AM) is best\n• Avoid midday watering\n• Water deeply but less frequently\n\n💡 Water conservation:\n• Mulching reduces evaporation\n• Drip irrigation saves 30-40% water\n• Rainwater harvesting\n• Soil moisture monitoring\n\nCurrent soil moisture looks good. Next irrigation recommended in 2-3 days.",
  
  soil: "🌱 Soil health management:\n\n🧪 Soil testing:\n• Test pH, N-P-K, organic matter\n• Test every 2-3 years\n• Collect samples from multiple points\n\n🌿 Improving soil health:\n• Add organic matter (compost, FYM)\n• Crop rotation practices\n• Cover cropping in off-season\n• Reduce tillage when possible\n\nWould you like guidance on soil testing or specific soil improvement methods?",
  
  sowing: "🌱 Sowing guidelines:\n\n📅 Optimal timing:\n• Check local weather forecast\n• Ensure soil moisture is adequate\n• Consider variety-specific requirements\n\n🌾 Best practices:\n• Treat seeds before sowing\n• Maintain proper depth and spacing\n• Ensure good seed-soil contact\n• Monitor germination rates\n\nCurrent conditions are favorable for sowing. Which crop are you planning to sow?",
  
  organic: "🌿 Organic farming practices:\n\n🌱 Key principles:\n• No synthetic chemicals or GMOs\n• Soil health through natural methods\n• Biodiversity and ecosystem balance\n\n📋 Certification process:\n• 3-year conversion period\n• Regular inspections\n• Detailed record keeping\n• Certified input materials only\n\nInterested in transitioning to organic? I can guide you through the process!",
  
  default: "🤖 I'm here to help with your farming questions! I can assist with:\n\n🌱 Crop management and cultivation\n🐛 Pest and disease identification\n💧 Irrigation and water management\n🌾 Fertilizer recommendations\n📊 Market prices and trends\n🌤️ Weather-based farming advice\n\nWhat specific farming challenge can I help you solve today?"
};

// Welcome message generator
export const getWelcomeMessage = (userName?: string): ChatMessage => ({
  id: '1',
  text: `Hello${userName ? `, ${userName}` : ''}! 👋 I'm your AI farming assistant. I can help you with:\n\n🌱 Crop management\n🐛 Pest and disease control\n🌾 Fertilizer recommendations\n💧 Irrigation advice\n📊 Market information\n🌤️ Weather-based farming tips\n\nWhat would you like to know today?`,
  isUser: false,
  timestamp: new Date(),
  category: 'Welcome',
});

// AI Response function
export const getAIResponse = (query: string): string => {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('weather') || lowerQuery.includes('rain') || lowerQuery.includes('temperature')) {
    return aiResponses.weather;
  }
  
  if (lowerQuery.includes('price') || lowerQuery.includes('market') || lowerQuery.includes('sell')) {
    return aiResponses.market;
  }
  
  if (lowerQuery.includes('fertilizer') || lowerQuery.includes('nutrients')) {
    return aiResponses.fertilizer;
  }
  
  if (lowerQuery.includes('pest') || lowerQuery.includes('insect') || lowerQuery.includes('bug')) {
    return aiResponses.pest;
  }
  
  if (lowerQuery.includes('disease') || lowerQuery.includes('fungus') || lowerQuery.includes('rot')) {
    return aiResponses.disease;
  }
  
  if (lowerQuery.includes('water') || lowerQuery.includes('irrigation') || lowerQuery.includes('drought')) {
    return aiResponses.irrigation;
  }
  
  if (lowerQuery.includes('soil') || lowerQuery.includes('ph') || lowerQuery.includes('organic')) {
    return aiResponses.soil;
  }
  
  if (lowerQuery.includes('sow') || lowerQuery.includes('plant') || lowerQuery.includes('seed')) {
    return aiResponses.sowing;
  }
  
  if (lowerQuery.includes('organic') || lowerQuery.includes('natural') || lowerQuery.includes('chemical-free')) {
    return aiResponses.organic;
  }
  
  return aiResponses.default;
};
