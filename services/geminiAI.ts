// Modern Gemini AI using the new @google/genai SDK
import { GoogleGenAI } from "@google/genai";

interface AIResponse {
  success: boolean;
  response?: string;
  error?: string;
}

interface ChatContext {
  userProfile?: {
    name?: string;
    location?: string;
    language?: string;
    farmSize?: number;
    primaryCrops?: string[];
  };
  weatherData?: {
    temperature: number;
    humidity: number;
    condition: string;
    location: string;
  };
  marketData?: {
    [crop: string]: {
      price: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
  currentSeason?: 'kharif' | 'rabi' | 'summer';
}

class GeminiAIService {
  private ai: GoogleGenAI | null = null;
  private isInitialized: boolean = false;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  constructor() {
    try {
      // Initialize with API key from environment or auto-detect
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      
      if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
        // Initialize with explicit API key
        this.ai = new GoogleGenAI({ apiKey });
        this.isInitialized = true;
        console.log('✅ Gemini AI (using @google/genai) initialized successfully');
      } else {
        // Try auto-detection from environment variable GEMINI_API_KEY
        try {
          this.ai = new GoogleGenAI({});
          this.isInitialized = true;
          console.log('✅ Gemini AI initialized with auto-detected API key');
        } catch (autoError) {
          console.warn('⚠️ Gemini API key not found. Using fallback responses.');
          console.log('💡 Set EXPO_PUBLIC_GEMINI_API_KEY in your .env.local file');
        }
      }
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error);
      this.isInitialized = false;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate farmer persona prompt with context awareness
  private generateFarmerPersona(context?: ChatContext): string {
    const userInfo = context?.userProfile;
    const weatherInfo = context?.weatherData;
    const marketInfo = context?.marketData;
    const userLanguage = userInfo?.language || 'English';
    const userLocation = userInfo?.location || 'India';
    
    let persona = `You are Ram, a friendly 45-year-old experienced farmer from ${userLocation}. You speak like a wise, helpful farmer friend talking to another farmer.

PERSONALITY:
- Warm and encouraging tone
- Share personal farming experiences
- Give practical, actionable advice
- Use simple language farmers understand
- Keep responses 2-3 sentences max
- Add relevant emojis to make it friendly

LANGUAGE STYLE:`;

    // Language-specific persona
    switch (userLanguage.toLowerCase()) {
      case 'hindi':
        persona += `
- Respond in simple Hindi
- Use farmer-friendly words like "भाई", "यार", "अरे"
- Example: "अरे भाई, मैंने भी यह समस्या देखी है। ऐसा करो..."
- Give practical solutions farmers can do today`;
        break;
        
      case 'marathi':
        persona += `
- Respond in simple Marathi
- Use words like "भाऊ", "अरे", "बघ"
- Example: "अरे भाऊ, मला पण हीच समस्या आली होती। असं करा..."
- Give practical solutions farmers can do today`;
        break;
        
      case 'gujarati':
        persona += `
- Respond in simple Gujarati
- Use words like "ભાઈ", "અરે", "જુઓ"
- Example: "અરે ભાઈ, મને પણ આ સમસ્યા આવી હતી। આવું કરો..."
- Give practical solutions farmers can do today`;
        break;
        
      default: // English
        persona += `
- Respond in simple English
- Use words like "friend", "brother", "hey"
- Example: "Hey friend, I also had this problem. Do this..."
- Give practical solutions farmers can do today`;
    }

    // Add current context
    if (weatherInfo || marketInfo) {
      persona += `\n\nCURRENT CONTEXT:`;
      
      if (weatherInfo) {
        persona += `
Weather: ${weatherInfo.temperature}°C, ${weatherInfo.condition}, Humidity: ${weatherInfo.humidity}%
Give weather-specific advice when relevant.`;
      }
      
      if (marketInfo) {
        const prices = Object.entries(marketInfo).slice(0, 3).map(([crop, data]) => 
          `${crop}: ₹${data.price}/quintal (${data.trend === 'up' ? 'Rising ↗️' : data.trend === 'down' ? 'Falling ↘️' : 'Stable →'})`
        ).join(', ');
        persona += `
Market prices: ${prices}
Give market-related advice when asked.`;
      }
    }

    persona += `\n\nREMEMBER: Be like a helpful farmer friend - practical, encouraging, and easy to understand!`;
    
    return persona;
  }

  // Main method to get AI response using new SDK
  async getAIResponse(
    userQuery: string, 
    context?: ChatContext,
    conversationHistory?: Array<{ role: 'user' | 'assistant', content: string }>
  ): Promise<AIResponse> {
    if (!this.isInitialized || !this.ai) {
      return {
        success: false,
        error: 'Gemini AI not initialized',
        response: this.getFallbackResponse(userQuery, context?.userProfile?.language)
      };
    }

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // Build system prompt with farmer persona
        const farmerPersona = this.generateFarmerPersona(context);
        
        // Prepare conversation with history
        let conversation = farmerPersona + '\n\nConversation:\n';
        
        // Add recent conversation history (last 4 messages)
        if (conversationHistory && conversationHistory.length > 0) {
          const recentHistory = conversationHistory.slice(-4);
          recentHistory.forEach(msg => {
            conversation += `${msg.role === 'user' ? 'Farmer Friend' : 'Ram'}: ${msg.content}\n`;
          });
        }
        
        // Add current user query
        conversation += `Farmer Friend: ${userQuery}\nRam: `;

        // Call Gemini API using new SDK
        const response = await this.ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: conversation,
        });

        if (response && response.text) {
          return {
            success: true,
            response: response.text.trim()
          };
        } else {
          throw new Error('No response received from Gemini AI');
        }

      } catch (error: any) {
        console.error(`Gemini AI Error (attempt ${attempt}/${this.maxRetries}):`, error);
        
        // Handle specific error types
        if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
          return {
            success: false,
            error: 'API quota exceeded',
            response: this.getFallbackResponse(userQuery, context?.userProfile?.language)
          };
        }
        
        if (attempt === this.maxRetries) {
          return {
            success: false,
            error: `Failed after ${this.maxRetries} attempts: ${error.message}`,
            response: this.getFallbackResponse(userQuery, context?.userProfile?.language)
          };
        }

        // Wait before retrying
        await this.sleep(this.retryDelay * attempt);
      }
    }

    return {
      success: false,
      error: 'Max retries exceeded',
      response: this.getFallbackResponse(userQuery, context?.userProfile?.language)
    };
  }

  // Enhanced chat function for seamless conversation
  async chat(message: string, context?: ChatContext): Promise<AIResponse> {
    return this.getAIResponse(message, context);
  }

  // Chat with conversation history for better context
  async chatWithHistory(
    userQuery: string, 
    context?: ChatContext,
    conversationHistory?: Array<{ role: 'user' | 'assistant', content: string }>
  ): Promise<AIResponse> {
    return this.getAIResponse(userQuery, context, conversationHistory);
  }

  // Enhanced fallback responses with language support
  private getFallbackResponse(query: string, language?: string): string {
    const lowerQuery = query.toLowerCase();
    
    // Weather related queries
    if (lowerQuery.includes('weather') || lowerQuery.includes('मौसम') || lowerQuery.includes('हवामान')) {
      if (language === 'hindi') {
        return "🌤️ अरे भाई राम यहाँ! मौसम के लिए मैं कहता हूं - बारिश से पहले खेत में पानी निकासी का इंतजाम करो। धूप तेज हो तो शाम को पानी देना! 🌧️☀️";
      }
      if (language === 'marathi') {
        return "🌤️ अरे भाऊ रामराव बोलतो! हवामानासाठी सांगतो - पावसाआधी शेतात पाण्याचा निचरा व्यवस्थित करा। उन्हाळा जास्त असेल तर संध्याकाळी पाणी द्या! 🌧️☀️";
      }
      return "🌤️ Hey friend, Ram here! For weather - arrange drainage before rains. If very hot, water in evening! 🌧️☀️";
    }
    
    // Pest control queries
    if (lowerQuery.includes('pest') || lowerQuery.includes('कीट') || lowerQuery.includes('insects')) {
      if (language === 'hindi') {
        return "🐛 भाई, कीटों के लिए मेरा नुस्खा - नीम का तेल स्प्रे करो सुबह-सुबह। 5ml प्रति लीटर पानी में। हफ्ते में दो बार! 🌿";
      }
      if (language === 'marathi') {
        return "🐛 भाऊ, किड्यांसाठी माझा उपाय - कडुलिंबाचे तेल सकाळी फवारा। 5ml प्रति लिटर पाण्यात। आठवड्यातून दोनदा! 🌿";
      }
      return "🐛 Friend, for pests my remedy - spray neem oil early morning. 5ml per liter water. Twice a week! 🌿";
    }
    
    // Market/price queries
    if (lowerQuery.includes('market') || lowerQuery.includes('price') || lowerQuery.includes('बाजार') || lowerQuery.includes('भाव')) {
      if (language === 'hindi') {
        return "💰 यार, बाजार के लिए राम का सुझाव - 3-4 मंडियों के भाव देखो। त्योहार के समय अच्छे दाम मिलते हैं। स्टोरेज हो तो थोड़ा इंतजार! 📈";
      }
      if (language === 'marathi') {
        return "💰 यार, बाजारासाठी रामरावाचा सल्ला - 3-4 मंडींचे भाव बघा। सणासुदीच्या वेळी चांगले दर मिळतात। स्टोरेज असेल तर थोडी वाट! 📈";
      }
      return "💰 Friend, for market Ram's advice - check 3-4 market prices. Good rates during festivals. If storage available, wait a bit! 📈";
    }
    
    // Default greeting with personality
    if (language === 'hindi') {
      return "🤗 अरे भाई, राम किसान यहाँ! 25 साल का तजुर्बा है। बोलो क्या समस्या है? खेती, मौसम, कीट, बाजार - कुछ भी पूछो! 🌾👨‍🌾";
    }
    if (language === 'marathi') {
      return "� अरे भाऊ, रामराव शेतकरी येथे! 25 वर्षांचा अनुभव आहे। काय अडचण आहे सांगा? शेती, हवामान, किडे, बाजार - काहीही विचारा! 🌾👨‍🌾";
    }
    return "🤗 Hey friend, Ram Farmer here! 25 years experience. What's the problem? Farming, weather, pests, market - ask anything! 🌾👨‍🌾";
  }

  // Quick response for common queries
  getQuickResponse(queryType: string, context?: ChatContext): string {
    const language = context?.userProfile?.language;
    
    switch (queryType) {
      case 'weather_advice':
        return context?.weatherData ? 
          `🌤️ Today: ${context.weatherData.temperature}°C, ${context.weatherData.condition}. ${context.weatherData.temperature > 35 ? 'Too hot - water early morning! 🌅' : context.weatherData.temperature < 10 ? 'Cold - protect crops! 🌙' : 'Good farming weather! 😊'}` :
          "🌤️ Check weather section for today's farming advice.";
          
      case 'market_prices':
        return language === 'hindi' ? 
          "💰 बाजार के भाव चेक करो। अच्छे दाम पर बेचना!" :
          "💰 Check market prices. Sell when rates are good!";
        
      case 'government_schemes':
        return language === 'hindi' ?
          "🏛️ स्कीम सेक्शन देखो। PM-KISAN के लिए अप्लाई करो!" :
          "🏛️ Check schemes section. Apply for PM-KISAN!";
        
      case 'pest_control':
        return language === 'hindi' ?
          "🐛 नीम का तेल स्प्रे करो। 5ml प्रति लीटर। हफ्ते में दो बार!" :
          "🐛 Spray neem oil. 5ml per liter. Twice a week!";
        
      default:
        return language === 'hindi' ?
          "🤖 पूछो यार: फसल, कीट, मौसम, भाव! सब सिखाऊंगा! 🌾" :
          "🤖 Ask me: crops, pests, weather, prices! I'll help! 🌾";
    }
  }

  // Test API connection using new SDK
  async testConnection(): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.ai) {
        console.log('Gemini AI not initialized, using fallback responses');
        return false;
      }

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Say hello",
      });
      
      if (response && response.text) {
        console.log(`✅ Gemini AI connection successful`);
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Gemini AI connection test failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const geminiAI = new GeminiAIService();

// Export types
export type { AIResponse, ChatContext };