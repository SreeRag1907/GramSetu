// Farmer AI Demo - Test the new Gemini-based farmer assistant
import { farmerAI, ChatContext } from '../services/farmerAI';

export class FarmerAIDemo {
  // Test basic farmer AI functionality
  static async testBasicChat() {
    console.log('🧪 Testing Farmer AI Basic Chat...\n');
    
    const testQueries = [
      'Hello, I need help with my wheat crop',
      'My tomatoes have yellow spots on leaves',
      'When should I water my cotton plants?',
      'What is the best fertilizer for rice?',
      'How to control pests naturally?'
    ];

    for (const query of testQueries) {
      try {
        console.log(`👨‍🌾 Question: ${query}`);
        const response = await farmerAI.chat(query);
        
        if (response.success) {
          console.log(`🤖 Ram's Answer: ${response.response}\n`);
        } else {
          console.log(`❌ Error: ${response.error}`);
          console.log(`🔄 Fallback: ${response.response}\n`);
        }
      } catch (error) {
        console.error(`❌ Test failed for query: ${query}`, error);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Test multilingual support
  static async testMultilingualSupport() {
    console.log('🌐 Testing Multilingual Farmer Support...\n');
    
    const multilingualTests = [
      {
        language: 'hindi',
        query: 'मेरी गेहूं की फसल में कीड़े लग गए हैं',
        context: {
          userProfile: {
            name: 'राज',
            location: 'राजस्थान',
            language: 'hindi',
            farmSize: 5,
            primaryCrops: ['गेहूं', 'चना']
          }
        }
      },
      {
        language: 'marathi',
        query: 'माझ्या भात पिकावर पावसाचा परिणाम काय होईल?',
        context: {
          userProfile: {
            name: 'गणेश',
            location: 'महाराष्ट्र',
            language: 'marathi',
            farmSize: 3,
            primaryCrops: ['भात', 'मका']
          }
        }
      },
      {
        language: 'gujarati',
        query: 'કપાસના છોડમાં પીળા પાંદડા છે',
        context: {
          userProfile: {
            name: 'કિશન',
            location: 'ગુજરાત',
            language: 'gujarati',
            farmSize: 10,
            primaryCrops: ['કપાસ', 'મગફળી']
          }
        }
      }
    ];

    for (const test of multilingualTests) {
      try {
        console.log(`🌍 Language: ${test.language}`);
        console.log(`👨‍🌾 Question: ${test.query}`);
        
        const response = await farmerAI.chat(test.query, test.context as ChatContext);
        
        if (response.success) {
          console.log(`🤖 Ram's Answer: ${response.response}\n`);
        } else {
          console.log(`❌ Error: ${response.error}`);
          console.log(`🔄 Fallback: ${response.response}\n`);
        }
      } catch (error) {
        console.error(`❌ Multilingual test failed for ${test.language}:`, error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  // Test context-aware responses
  static async testContextualAdvice() {
    console.log('🌾 Testing Context-Aware Farming Advice...\n');
    
    const contextualTest: ChatContext = {
      userProfile: {
        name: 'Kumar',
        location: 'Punjab',
        language: 'english',
        farmSize: 15,
        primaryCrops: ['wheat', 'rice', 'cotton']
      },
      weatherData: {
        temperature: 38,
        humidity: 65,
        condition: 'sunny',
        location: 'Punjab'
      },
      marketData: {
        wheat: { price: 2200, trend: 'up' },
        rice: { price: 1800, trend: 'stable' },
        cotton: { price: 8500, trend: 'down' }
      },
      currentSeason: 'kharif'
    };

    const contextualQueries = [
      'Should I sell my wheat today?',
      'Is it good weather for irrigation?',
      'What should I plant this season?',
      'How is the market looking for my crops?'
    ];

    for (const query of contextualQueries) {
      try {
        console.log(`👨‍🌾 Contextual Question: ${query}`);
        console.log(`🌡️ Weather: ${contextualTest.weatherData?.temperature}°C, ${contextualTest.weatherData?.condition}`);
        console.log(`📈 Market: Wheat ₹${contextualTest.marketData?.wheat.price} (${contextualTest.marketData?.wheat.trend})`);
        
        const response = await farmerAI.chat(query, contextualTest);
        
        if (response.success) {
          console.log(`🤖 Ram's Advice: ${response.response}\n`);
        } else {
          console.log(`❌ Error: ${response.error}`);
          console.log(`🔄 Fallback: ${response.response}\n`);
        }
      } catch (error) {
        console.error(`❌ Contextual test failed:`, error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Test conversation continuity
  static async testConversationFlow() {
    console.log('💬 Testing Conversation Flow...\n');
    
    const conversationHistory: Array<{ role: 'user' | 'assistant', content: string }> = [];
    
    const conversationSteps = [
      'My tomato plants are wilting',
      'I watered them yesterday',
      'The leaves are turning yellow too',
      'What should I do right now?'
    ];

    for (const step of conversationSteps) {
      try {
        console.log(`👨‍🌾 User: ${step}`);
        
        const response = await farmerAI.chatWithHistory(step, undefined, conversationHistory);
        
        if (response.success && response.response) {
          console.log(`🤖 Ram: ${response.response}\n`);
          
          // Add to conversation history
          conversationHistory.push({ role: 'user', content: step });
          conversationHistory.push({ role: 'assistant', content: response.response });
        } else {
          console.log(`❌ Error: ${response.error}\n`);
        }
      } catch (error) {
        console.error(`❌ Conversation step failed:`, error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  // Test API connection
  static async testConnection() {
    console.log('🔌 Testing Farmer AI Connection...\n');
    
    try {
      const isConnected = await farmerAI.testConnection();
      
      if (isConnected) {
        console.log('✅ Farmer AI is connected and working!');
        console.log('🎉 Ready to help farmers with their questions!\n');
      } else {
        console.log('⚠️ Farmer AI is not connected - using fallback responses');
        console.log('💡 Check your EXPO_PUBLIC_GEMINI_API_KEY in .env.local\n');
      }
    } catch (error) {
      console.error('❌ Connection test failed:', error);
    }
  }

  // Run all tests
  static async runAllTests() {
    console.log('🚀 Starting Farmer AI Comprehensive Demo...\n');
    console.log('=' .repeat(50));
    
    await this.testConnection();
    await this.testBasicChat();
    await this.testMultilingualSupport();
    await this.testContextualAdvice();
    await this.testConversationFlow();
    
    console.log('=' .repeat(50));
    console.log('✅ Farmer AI Demo Completed!');
    console.log('🌾 Your AI farmer assistant is ready to help farmers! 👨‍🌾');
  }

  // Quick test for specific farming topics
  static async testFarmingTopics() {
    console.log('🎯 Testing Specific Farming Topics...\n');
    
    const topicTests = [
      { topic: 'Weather', query: 'What should I do if heavy rain is expected?' },
      { topic: 'Pests', query: 'How to get rid of aphids on my cotton?' },
      { topic: 'Fertilizer', query: 'When to apply nitrogen fertilizer to wheat?' },
      { topic: 'Market', query: 'Is this a good time to sell rice?' },
      { topic: 'Irrigation', query: 'How often should I water potato plants?' },
      { topic: 'Soil', query: 'My soil looks very dry and hard, what to do?' }
    ];

    for (const test of topicTests) {
      try {
        console.log(`📋 Topic: ${test.topic}`);
        console.log(`👨‍🌾 Question: ${test.query}`);
        
        const response = await farmerAI.chat(test.query);
        
        if (response.success) {
          console.log(`🤖 Ram's Expert Advice: ${response.response}\n`);
        } else {
          console.log(`🔄 Fallback Response: ${response.response}\n`);
        }
      } catch (error) {
        console.error(`❌ Topic test failed for ${test.topic}:`, error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 800));
    }
  }
}

// Export for easy testing
export default FarmerAIDemo;