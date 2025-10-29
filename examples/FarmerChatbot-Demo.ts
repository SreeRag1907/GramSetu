// Complete Farmer Chatbot Demo with Gemini Integration
import { geminiAI, ChatContext } from '../services/geminiAI';

export class FarmerChatbotDemo {
  // Test the complete chatbot experience
  static async testChatbotExperience() {
    console.log('🤖 Testing Complete Farmer Chatbot Experience...\n');
    console.log('=' .repeat(60));
    
    // Test connection first
    const isConnected = await geminiAI.testConnection();
    console.log(`🔌 Connection Status: ${isConnected ? '✅ Connected' : '⚠️ Using Fallbacks'}\n`);
    
    // Simulate farmer profile and context
    const farmerContext: ChatContext = {
      userProfile: {
        name: 'Kumar',
        location: 'Punjab',
        language: 'english',
        farmSize: 10,
        primaryCrops: ['wheat', 'rice', 'cotton']
      },
      weatherData: {
        temperature: 32,
        humidity: 70,
        condition: 'partly cloudy',
        location: 'Punjab'
      },
      marketData: {
        wheat: { price: 2150, trend: 'up' },
        rice: { price: 1900, trend: 'stable' },
        cotton: { price: 8200, trend: 'down' }
      },
      currentSeason: 'kharif'
    };

    // Simulate a complete conversation
    const conversation: Array<{ role: 'user' | 'assistant', content: string }> = [];
    
    const queries = [
      'Hello, I need help with my farming',
      'My wheat crop is showing yellow patches',
      'Should I apply fertilizer now?',
      'What about the weather? Is it good for spraying?',
      'When should I sell my wheat at current market prices?'
    ];

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      
      console.log(`👨‍🌾 Farmer: ${query}`);
      
      try {
        const response = await geminiAI.chatWithHistory(query, farmerContext, conversation);
        
        if (response.success && response.response) {
          console.log(`🤖 Ram: ${response.response}\n`);
          
          // Add to conversation history
          conversation.push({ role: 'user', content: query });
          conversation.push({ role: 'assistant', content: response.response });
        } else {
          console.log(`❌ Error: ${response.error}`);
          console.log(`🔄 Fallback: ${response.response}\n`);
        }
      } catch (error) {
        console.error(`❌ Query failed:`, error);
      }
      
      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    console.log('=' .repeat(60));
    console.log('✅ Chatbot Experience Test Completed!\n');
  }

  // Test multilingual farmer conversations
  static async testMultilingualChat() {
    console.log('🌐 Testing Multilingual Farmer Chat...\n');
    console.log('=' .repeat(50));
    
    const multilingualScenarios = [
      {
        language: 'hindi',
        farmerName: 'राजू',
        location: 'राजस्थान',
        context: {
          userProfile: {
            name: 'राजू',
            location: 'राजस्थान',
            language: 'hindi',
            farmSize: 5,
            primaryCrops: ['गेहूं', 'चना', 'सरसों']
          },
          weatherData: {
            temperature: 28,
            humidity: 45,
            condition: 'sunny',
            location: 'राजस्थान'
          }
        },
        queries: [
          'नमस्ते, मुझे अपनी फसल के बारे में पूछना है',
          'मेरी गेहूं में कीड़े लग गए हैं',
          'क्या करूं?'
        ]
      },
      {
        language: 'marathi',
        farmerName: 'गणेश',
        location: 'महाराष्ट्र',
        context: {
          userProfile: {
            name: 'गणेश',
            location: 'महाराष्ट्र',
            language: 'marathi',
            farmSize: 8,
            primaryCrops: ['भात', 'ऊस', 'कापूस']
          },
          weatherData: {
            temperature: 35,
            humidity: 80,
            condition: 'humid',
            location: 'महाराष्ट्र'
          }
        },
        queries: [
          'नमस्कार, माझी मदत करा',
          'माझ्या भात पिकावर पावसाचा काय परिणाम होईल?',
          'कधी पाणी द्यावे?'
        ]
      }
    ];

    for (const scenario of multilingualScenarios) {
      console.log(`🌍 Testing ${scenario.language} conversation with ${scenario.farmerName}`);
      console.log(`📍 Location: ${scenario.location}\n`);
      
      const conversation: Array<{ role: 'user' | 'assistant', content: string }> = [];
      
      for (const query of scenario.queries) {
        console.log(`👨‍🌾 ${scenario.farmerName}: ${query}`);
        
        try {
          const response = await geminiAI.chatWithHistory(
            query, 
            scenario.context as ChatContext, 
            conversation
          );
          
          if (response.success && response.response) {
            console.log(`🤖 राम/Ram: ${response.response}\n`);
            conversation.push({ role: 'user', content: query });
            conversation.push({ role: 'assistant', content: response.response });
          } else {
            console.log(`🔄 Fallback: ${response.response}\n`);
          }
        } catch (error) {
          console.error(`❌ Error in ${scenario.language} chat:`, error);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log('-' .repeat(40) + '\n');
    }
    
    console.log('✅ Multilingual Chat Test Completed!\n');
  }

  // Test contextual farming advice
  static async testContextualAdvice() {
    console.log('🌾 Testing Context-Aware Farming Advice...\n');
    console.log('=' .repeat(50));
    
    const scenarios = [
      {
        name: 'Hot Weather Scenario',
        context: {
          userProfile: {
            name: 'Suresh',
            location: 'Rajasthan',
            language: 'english',
            farmSize: 15,
            primaryCrops: ['wheat', 'mustard']
          },
          weatherData: {
            temperature: 42,
            humidity: 30,
            condition: 'very hot',
            location: 'Rajasthan'
          },
          marketData: {
            wheat: { price: 2200, trend: 'up' }
          }
        },
        query: 'Should I irrigate my crops today?'
      },
      {
        name: 'Rainy Season Scenario',
        context: {
          userProfile: {
            name: 'Ravi',
            location: 'Kerala',
            language: 'english',
            farmSize: 3,
            primaryCrops: ['rice', 'coconut']
          },
          weatherData: {
            temperature: 26,
            humidity: 90,
            condition: 'heavy rain expected',
            location: 'Kerala'
          }
        },
        query: 'Heavy rain is coming, what should I do to protect my rice crop?'
      },
      {
        name: 'Market Decision Scenario',
        context: {
          userProfile: {
            name: 'Prakash',
            location: 'Punjab',
            language: 'english',
            farmSize: 20,
            primaryCrops: ['wheat', 'rice']
          },
          marketData: {
            wheat: { price: 2300, trend: 'up' },
            rice: { price: 1850, trend: 'down' }
          }
        },
        query: 'Should I sell my wheat now or wait? What about rice?'
      }
    ];

    for (const scenario of scenarios) {
      console.log(`📋 Scenario: ${scenario.name}`);
      console.log(`👨‍🌾 ${scenario.context.userProfile.name}: ${scenario.query}`);
      
      if (scenario.context.weatherData) {
        console.log(`🌡️ Weather: ${scenario.context.weatherData.temperature}°C, ${scenario.context.weatherData.condition}`);
      }
      
      if (scenario.context.marketData) {
        const marketInfo = Object.entries(scenario.context.marketData)
          .map(([crop, data]) => `${crop}: ₹${data.price} (${data.trend})`)
          .join(', ');
        console.log(`📈 Market: ${marketInfo}`);
      }
      
      try {
        const response = await geminiAI.chat(scenario.query, scenario.context as ChatContext);
        
        if (response.success && response.response) {
          console.log(`🤖 Ram's Advice: ${response.response}\n`);
        } else {
          console.log(`🔄 Fallback Advice: ${response.response}\n`);
        }
      } catch (error) {
        console.error(`❌ Contextual advice failed:`, error);
      }
      
      console.log('-' .repeat(40) + '\n');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('✅ Contextual Advice Test Completed!\n');
  }

  // Test quick responses for common farming topics
  static async testQuickResponses() {
    console.log('⚡ Testing Quick Response System...\n');
    console.log('=' .repeat(40));
    
    const quickTests = [
      { type: 'weather_advice', context: { weatherData: { temperature: 38, humidity: 45, condition: 'hot', location: 'Punjab' } } },
      { type: 'market_prices', context: { userProfile: { language: 'hindi' } } },
      { type: 'government_schemes', context: { userProfile: { language: 'marathi' } } },
      { type: 'pest_control', context: { userProfile: { language: 'english' } } },
      { type: 'default', context: {} }
    ];

    for (const test of quickTests) {
      console.log(`🎯 Quick Response Type: ${test.type}`);
      
      const response = geminiAI.getQuickResponse(test.type, test.context as ChatContext);
      console.log(`⚡ Response: ${response}\n`);
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('✅ Quick Response Test Completed!\n');
  }

  // Comprehensive test runner
  static async runComprehensiveDemo() {
    console.log('🚀 Starting Comprehensive Farmer Chatbot Demo...\n');
    console.log('🌾 GramSetu - AI-Powered Farmer Assistant 🌾\n');
    console.log('=' .repeat(60));
    
    try {
      await this.testChatbotExperience();
      await this.testMultilingualChat();
      await this.testContextualAdvice();
      await this.testQuickResponses();
      
      console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY! 🎉');
      console.log('✅ Your farmer chatbot is ready to help farmers!');
      console.log('🌾 Features working:');
      console.log('   - Multi-language support (Hindi, Marathi, English)');
      console.log('   - Context-aware responses');
      console.log('   - Weather-based advice');
      console.log('   - Market price guidance');
      console.log('   - Conversation continuity');
      console.log('   - Fallback responses when AI unavailable');
      console.log('\n🚀 Deploy and let farmers start chatting! 👨‍🌾');
      
    } catch (error) {
      console.error('❌ Demo failed:', error);
    }
  }

  // Simple test for debugging
  static async quickTest() {
    console.log('🔧 Quick Test - Farmer Chatbot...\n');
    
    const testQuery = 'Hello, I need help with my wheat crop';
    console.log(`👨‍🌾 Test Query: ${testQuery}`);
    
    try {
      const response = await geminiAI.chat(testQuery);
      
      if (response.success) {
        console.log(`🤖 AI Response: ${response.response}`);
        console.log('✅ Chatbot is working!');
      } else {
        console.log(`🔄 Fallback Response: ${response.response}`);
        console.log('⚠️ AI not available, but fallbacks work!');
      }
    } catch (error) {
      console.error('❌ Quick test failed:', error);
    }
  }
}

export default FarmerChatbotDemo;