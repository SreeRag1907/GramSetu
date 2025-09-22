// Test file to demonstrate the simplified Gemini AI responses
// This shows how the AI now gives short, simple answers for farmers

import { geminiAI, ChatContext } from '../services/geminiAI';

// Sample farmer context
const testFarmerContext: ChatContext = {
  userProfile: {
    name: 'Ramesh',
    location: 'Punjab',
    language: 'Hindi',
    farmSize: 5,
    primaryCrops: ['Wheat', 'Rice']
  },
  weatherData: {
    temperature: 38,
    humidity: 65,
    condition: 'Hot and Sunny',
    location: 'Punjab'
  },
  marketData: {
    'Wheat': { price: 2200, trend: 'up' },
    'Rice': { price: 3100, trend: 'stable' }
  }
};

// Test function to show simplified responses
export async function testSimplifiedResponses() {
  console.log('🧪 Testing Simplified AI Responses for Farmers\n');
  
  const testQueries = [
    'My wheat crop has yellow leaves, what should I do?',
    'When should I water my crops in this hot weather?',
    'Should I sell my wheat now or wait?',
    'How to control pests on my rice crop?',
    'What government schemes can help small farmers?'
  ];

  for (const query of testQueries) {
    console.log(`❓ Question: "${query}"`);
    
    try {
      const response = await geminiAI.getAIResponse(query, testFarmerContext);
      
      if (response.success && response.response) {
        console.log(`✅ AI Response: ${response.response}`);
      } else {
        console.log(`⚠️  Fallback Response: ${response.response}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error}`);
    }
    
    console.log('---');
  }

  console.log('\n🎯 Quick Response Examples:');
  console.log('Weather Advice:', geminiAI.getQuickResponse('weather_advice', testFarmerContext));
  console.log('Market Prices:', geminiAI.getQuickResponse('market_prices', testFarmerContext));
  console.log('Pest Control:', geminiAI.getQuickResponse('pest_control', testFarmerContext));
  console.log('Government Schemes:', geminiAI.getQuickResponse('government_schemes', testFarmerContext));
}

// Example of what the NEW simplified responses look like:
export const exampleSimplifiedResponses = {
  pestControl: "🐛 Spray neem oil early morning. Mix 5ml per liter water. If severe, contact agriculture officer.",
  weatherAdvice: "🌤️ Today: 38°C, Hot and Sunny. Too hot - water crops early morning.",
  marketAdvice: "💰 Wheat price ₹2200/quintal (↗️). Good time to sell if you need money now.",
  fertilizerAdvice: "🌱 Apply compost first. For chemical fertilizer, use half dose and see results.",
  governmentScheme: "🏛️ Apply for PM-KISAN, crop insurance, soil health card. Keep documents ready."
};

// Before vs After comparison
export const responseComparison = {
  before: {
    pestControl: "To implement an effective integrated pest management strategy for your agricultural crops, you should consider implementing a systematic approach that combines biological, cultural, and chemical control methods. This includes regular monitoring and identification of pest populations, implementing preventive measures such as crop rotation and resistant varieties, utilizing beneficial insects and biological control agents, and when necessary, applying targeted pesticide applications following proper timing, dosage, and safety protocols..."
  },
  after: {
    pestControl: "🐛 Spray neem oil early morning. Mix 5ml per liter water. If severe, contact agriculture officer."
  }
};

console.log('🌾 GramSetu AI - Now gives SHORT, SIMPLE answers for farmers! 🚀');