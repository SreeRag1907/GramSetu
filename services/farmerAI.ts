// Modern Farmer AI using Google GenAI SDK 2.5
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

class FarmerAIService {
  private ai: GoogleGenAI | null = null;
  private isInitialized: boolean = false;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  constructor() {
    try {
      // Get API key from environment - you can also set it directly here
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';
      
      if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
        this.ai = new GoogleGenAI({
          apiKey: apiKey
        });
        this.isInitialized = true;
        console.log('✅ Farmer AI (Gemini 2.5) initialized successfully');
      } else {
        console.warn('⚠️ Gemini API key not provided. Using fallback responses.');
        console.log('💡 Set EXPO_PUBLIC_GEMINI_API_KEY in your .env file');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Farmer AI:', error);
      this.isInitialized = false;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate farmer persona prompt for different languages
  private generateFarmerPersona(context?: ChatContext): string {
    const userInfo = context?.userProfile;
    const weatherInfo = context?.weatherData;
    const marketInfo = context?.marketData;
    const userLanguage = userInfo?.language || 'English';
    const userLocation = userInfo?.location || 'India';
    
    let persona = `You are Ram, a 45-year-old experienced farmer from ${userLocation}. You have been farming for 25 years and speak like a friendly, wise farmer talking to another farmer friend.

PERSONALITY:
- Speak in simple, practical language
- Share experiences: "I also faced this problem..."
- Give solutions that can be done at home
- Be warm and encouraging
- Use farming terms farmers understand
- Keep answers short (2-3 sentences)

LANGUAGE STYLE:`;

    // Language-specific persona
    switch (userLanguage.toLowerCase()) {
      case 'hindi':
        persona += `
- Respond in simple Hindi
- Use words like "भाई", "यार", "अरे"
- Example tone: "अरे भाई, मैंने भी यह समस्या देखी है। ऐसा करो..."
- Use farming Hindi terms farmers know
- Add helpful emojis`;
        break;
        
      case 'marathi':
        persona += `
- Respond in simple Marathi
- Use words like "भाऊ", "अरे", "बघ"
- Example tone: "अरे भाऊ, मला पण हीच समस्या आली होती। असं करा..."
- Use farming Marathi terms farmers know
- Add helpful emojis`;
        break;
        
      case 'gujarati':
        persona += `
- Respond in simple Gujarati
- Use words like "ભાઈ", "અરે", "જુઓ"
- Example tone: "અરે ભાઈ, મને પણ આ સમસ્યા આવી હતી। આવું કરો..."
- Use farming Gujarati terms farmers know
- Add helpful emojis`;
        break;
        
      case 'punjabi':
        persona += `
- Respond in simple Punjabi
- Use words like "ਵੀਰ", "ਯਾਰ", "ਅਰੇ"
- Example tone: "ਅਰੇ ਵੀਰ, ਮੈਨੂੰ ਵੀ ਇਹ ਸਮੱਸਿਆ ਆਈ ਸੀ। ਇਹ ਕਰੋ..."
- Use farming Punjabi terms farmers know
- Add helpful emojis`;
        break;
        
      case 'tamil':
        persona += `
- Respond in simple Tamil
- Use words like "தம்பி", "மச்சான்", "அரே"
- Example tone: "அரே தம்பி, எனக்கும் இந்தப் பிரச்சனை வந்தது। இப்படி செய்யுங்கள்..."
- Use farming Tamil terms farmers know
- Add helpful emojis`;
        break;
        
      case 'bengali':
        persona += `
- Respond in simple Bengali
- Use words like "ভাই", "আরে", "দেখো"
- Example tone: "আরে ভাই, আমারও এই সমস্যা হয়েছিল। এভাবে করুন..."
- Use farming Bengali terms farmers know
- Add helpful emojis`;
        break;
        
      default: // English
        persona += `
- Respond in simple English
- Use words like "friend", "brother", "hey"
- Example tone: "Hey friend, I also had this problem. Do this..."
- Use simple farming terms
- Add helpful emojis`;
    }

    persona += `

CURRENT CONTEXT:`;

    // Add weather context
    if (weatherInfo) {
      persona += `
Weather: ${weatherInfo.temperature}°C, ${weatherInfo.condition}, Humidity: ${weatherInfo.humidity}%
Give weather-specific advice if relevant.`;
    }

    // Add market context
    if (marketInfo) {
      const prices = Object.entries(marketInfo).slice(0, 3).map(([crop, data]) => 
        `${crop}: ₹${data.price}/quintal (${data.trend === 'up' ? 'Rising ↗️' : data.trend === 'down' ? 'Falling ↘️' : 'Stable →'})`
      ).join(', ');
      persona += `
Market prices: ${prices}
Give market advice if asked.`;
    }

    persona += `

RESPONSE RULES:
1. Keep answers 2-3 sentences max
2. Give ONE main action step
3. Share personal experience when possible
4. Use emojis to make it friendly
5. Be practical - solutions farmers can do today
6. If you don't know something, admit it and suggest who to ask

TOPICS I HELP WITH:
🌾 Crop problems (diseases, growth issues)
🐛 Pest control (natural and chemical solutions)
🌧️ Weather advice (what to do in rain/sun/cold)
💰 Market prices (when to sell, where to sell)
🏛️ Government schemes (PM-KISAN, insurance, subsidies)
💧 Irrigation (when to water, how much)
🌱 Fertilizers (organic vs chemical, timing)
🚜 Farm equipment (basic maintenance, usage)

Remember: I'm Ram, a farmer friend helping another farmer!`;

    return persona;
  }

  // Main chat function with farmer personality
  async chat(message: string, context?: ChatContext): Promise<AIResponse> {
    if (!this.isInitialized || !this.ai) {
      return {
        success: false,
        error: 'API not initialized',
        response: this.getFallbackResponse(message, context?.userProfile?.language)
      };
    }

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const persona = this.generateFarmerPersona(context);
        
        // Prepare the conversation
        const fullPrompt = `${persona}

User Question: ${message}

Ram's Response:`;

        // Use Gemini 2.5 Flash model
        const response = await this.ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: fullPrompt,
        });

        const aiResponse = response.text;
        
        if (aiResponse) {
          return {
            success: true,
            response: aiResponse.trim()
          };
        } else {
          throw new Error('Empty response from AI');
        }

      } catch (error: any) {
        console.error(`❌ Farmer AI attempt ${attempt} failed:`, error);

        // Check if it's a quota/billing error
        if (error.message?.includes('quota') || error.message?.includes('billing')) {
          return {
            success: false,
            error: 'API quota exceeded',
            response: this.getFallbackResponse(message, context?.userProfile?.language)
          };
        }

        if (attempt === this.maxRetries) {
          return {
            success: false,
            error: `Failed after ${this.maxRetries} attempts: ${error.message}`,
            response: this.getFallbackResponse(message, context?.userProfile?.language)
          };
        }

        // Wait before retrying
        await this.sleep(this.retryDelay * attempt);
      }
    }

    return {
      success: false,
      error: 'Max retries exceeded',
      response: this.getFallbackResponse(message, context?.userProfile?.language)
    };
  }

  // Enhanced chat with conversation history
  async chatWithHistory(
    userQuery: string, 
    context?: ChatContext,
    conversationHistory?: Array<{ role: 'user' | 'assistant', content: string }>
  ): Promise<AIResponse> {
    if (!this.isInitialized || !this.ai) {
      return {
        success: false,
        error: 'API not initialized',
        response: this.getFallbackResponse(userQuery, context?.userProfile?.language)
      };
    }

    try {
      const persona = this.generateFarmerPersona(context);
      
      // Build conversation with history
      let conversation = persona + '\n\nConversation:\n';
      
      // Add recent history (last 4 messages)
      if (conversationHistory && conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-4);
        recentHistory.forEach(msg => {
          conversation += `${msg.role === 'user' ? 'Farmer Friend' : 'Ram'}: ${msg.content}\n`;
        });
      }
      
      conversation += `Farmer Friend: ${userQuery}\nRam: `;

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: conversation,
      });

      const aiResponse = response.text;
      
      if (aiResponse) {
        return {
          success: true,
          response: aiResponse.trim()
        };
      } else {
        throw new Error('Empty response from AI');
      }

    } catch (error: any) {
      console.error('Farmer AI Error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        response: this.getFallbackResponse(userQuery, context?.userProfile?.language)
      };
    }
  }

  // Intelligent fallback responses when AI is not available
  private getFallbackResponse(query: string, language?: string): string {
    const lowerQuery = query.toLowerCase();
    
    // Weather related queries
    if (lowerQuery.includes('weather') || lowerQuery.includes('मौसम') || lowerQuery.includes('हवामान') || 
        lowerQuery.includes('rain') || lowerQuery.includes('बारिश') || lowerQuery.includes('पाऊस')) {
      if (language === 'hindi') {
        return "🌤️ अरे भाई राम यहाँ! मौसम के लिए मैं कहता हूं - बारिश से पहले खेत में पानी निकासी का इंतजाम करो। अगर धूप तेज है तो शाम को पानी देना। मौसम ऐप भी चेक करते रहना! 🌧️🌞";
      }
      if (language === 'marathi') {
        return "🌤️ अरे भाऊ रामराव बोलतो! हवामानासाठी सांगतो - पावसाआधी शेतात पाण्याचा निचरा व्यवस्थित करा. उन्हाळा जास्त असेल तर संध्याकाळी पाणी द्या. वेदर अॅप पण बघत राहा! 🌧️🌞";
      }
      return "🌤️ Hey friend, Ram here! For weather, I say - arrange drainage before rains. If sun is strong, water in evening. Keep checking weather app too! 🌧️🌞";
    }
    
    // Pest control queries
    if (lowerQuery.includes('pest') || lowerQuery.includes('कीट') || lowerQuery.includes('insects') || 
        lowerQuery.includes('bugs') || lowerQuery.includes('किडे')) {
      if (language === 'hindi') {
        return "🐛 भाई, कीटों से बचने के लिए मैं ये करता हूं - नीम का तेल स्प्रे करो, तुलसी और गेंदा फूल लगाओ खेत के किनारे। रोज सुबह खेत देखना जरूरी है! प्राकृतिक नुस्खे सबसे अच्छे! 🌿";
      }
      if (language === 'marathi') {
        return "🐛 भाऊ, किड्यांपासून बचावासाठी मी हे करतो - कडुलिंबाचे तेल फवारा, तुळस आणि झेंडू शेताच्या कडेला लावा। रोज सकाळी शेत बघणे गरजेचे! नैसर्गिक उपाय सर्वोत्तम! 🌿";
      }
      return "🐛 Friend, for pests I do this - spray neem oil, plant tulsi and marigold at field edges. Daily morning field check needed! Natural remedies are best! 🌿";
    }
    
    // Fertilizer/soil queries
    if (lowerQuery.includes('fertilizer') || lowerQuery.includes('खाद') || lowerQuery.includes('soil') || 
        lowerQuery.includes('मिट्टी') || lowerQuery.includes('माती')) {
      if (language === 'hindi') {
        return "🌱 राम का तजुर्बा - केमिकल खाद कम करो, कंपोस्ट और गोबर खाद ज्यादा डालो। मिट्टी की जांच साल में एक बार जरूर कराओ। हरी खाद भी बोना फायदेमंद है! 💚";
      }
      if (language === 'marathi') {
        return "🌱 रामरावाचा अनुभव - रासायनिक खत कमी करा, कंपोस्ट आणि शेणखत जास्त टाका। मातीची तपासणी वर्षातून एकदा नक्की करा। हिरवी खत पण चांगली! 💚";
      }
      return "🌱 Ram's experience - reduce chemical fertilizer, use more compost and cow dung. Test soil once a year. Green manure also good! 💚";
    }
    
    // Market/price queries
    if (lowerQuery.includes('market') || lowerQuery.includes('price') || lowerQuery.includes('बाजार') || 
        lowerQuery.includes('भाव') || lowerQuery.includes('किंमत')) {
      if (language === 'hindi') {
        return "💰 यार, बाजार के लिए मैं कहता हूं - फसल बेचने से पहले 3-4 मंडियों के भाव देख लो। त्योहार के समय अच्छे दाम मिलते हैं। स्टोरेज की सुविधा हो तो थोड़ा इंतजार करना! 📈";
      }
      if (language === 'marathi') {
        return "💰 यार, बाजारासाठी मी सांगतो - पीक विकण्याआधी 3-4 मंडींचे भाव बघा। सणासुदीच्या वेळी चांगले दर मिळतात। स्टोरेज असेल तर थोडी वाट बघा! 📈";
      }
      return "💰 Friend, for market I say - check prices in 3-4 markets before selling. Good rates during festivals. If you have storage, wait a bit! 📈";
    }
    
    // Irrigation queries
    if (lowerQuery.includes('irrigation') || lowerQuery.includes('water') || lowerQuery.includes('सिंचाई') || 
        lowerQuery.includes('पानी') || lowerQuery.includes('सिंचन')) {
      if (language === 'hindi') {
        return "💧 भाई, पानी के लिए मेरा फार्मूला - सुबह या शाम को पानी देना, दोपहर में नहीं। ड्रिप इरिगेशन सबसे अच्छा। मल्चिंग करो पानी बचाने के लिए! 🌾";
      }
      if (language === 'marathi') {
        return "💧 भाऊ, पाण्यासाठी माझे फॉर्म्युला - सकाळी किंवा संध्याकाळी पाणी द्या, दुपारी नको। ड्रिप सिस्टीम सर्वोत्तम। मल्चिंग करा पाणी वाचवण्यासाठी! 🌾";
      }
      return "💧 Brother, for water my formula - water in morning or evening, not afternoon. Drip irrigation is best. Do mulching to save water! 🌾";
    }
    
    // Default greeting/help
    if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('help') || 
        lowerQuery.includes('नमस्ते') || lowerQuery.includes('हैलो') || lowerQuery.includes('सहायता') ||
        lowerQuery.length < 10) {
      if (language === 'hindi') {
        return "🤗 अरे भाई, राम किसान यहाँ! 25 साल का तजुर्बा है मेरा। बोलो क्या समस्या है? खेती-बाड़ी, मौसम, कीट-पतंगे, बाजार भाव, सिंचाई - कुछ भी पूछ सकते हो यार! मैं सब सिखाता हूँ! 🌾👨‍🌾";
      }
      if (language === 'marathi') {
        return "🤗 अरे भाऊ, रामराव शेतकरी येथे! 25 वर्षांचा अनुभव आहे माझा। सांगा काय अडचण आहे? शेती-पिकवाडी, हवामान, किडे-पतंग, बाजार भाव, सिंचन - काहीही विचारू शकता! मी सगळं शिकवतो! 🌾👨‍🌾";
      }
      if (language === 'gujarati') {
        return "🤗 અરે ભાઈ, રામભાઈ ખેડૂત અહીં! 25 વર્ષનો અનુભવ છે મારો। કહો શું સમસ્યા છે? ખેતી-વાડી, હવામાન, કીડા-પતંગ, બજાર ભાવ, સિંચાઈ - કંઈપણ પૂછી શકો! હું બધું શીખવીશ! 🌾👨‍🌾";
      }
      return "🤗 Hey friend! Ram Farmer here! 25 years of experience. Tell me, what's the problem? Farming, weather, pests, market prices, irrigation - ask anything! I'll teach you everything! 🌾👨‍🌾";
    }
    
    return "🌾 Ram here! Ask me about farming problems - crops, pests, weather, prices, irrigation. I'm here to help with simple solutions! 👨‍🌾";
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.ai) {
        console.log('Farmer AI not initialized, using fallback responses');
        return false;
      }

      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Say hello in one word",
      });
      
      if (response.text) {
        console.log(`✅ Farmer AI connection successful`);
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Farmer AI connection test failed:', error);
      return false;
    }
  }

  // Quick responses for common farmer queries
  getQuickResponse(queryType: string, context?: ChatContext): string {
    const language = context?.userProfile?.language;
    
    switch (queryType) {
      case 'weather_advice':
        return context?.weatherData ? 
          `🌤️ Today: ${context.weatherData.temperature}°C, ${context.weatherData.condition}. ${context.weatherData.temperature > 35 ? 'Too hot - water crops early morning! 🌅' : context.weatherData.temperature < 10 ? 'Cold - protect crops at night! 🌙' : 'Good weather for farming! 😊'}` :
          "🌤️ Check weather section for today's conditions and farming advice.";
          
      case 'market_prices':
        return language === 'hindi' ? 
          "💰 बाजार के भाव चेक करो। अच्छे दाम पर बेचना और जरूरत हो तो स्टोर करना!" :
          "💰 Check marketplace section. Sell when prices are good and store if needed!";
        
      case 'government_schemes':
        return language === 'hindi' ?
          "🏛️ स्कीम सेक्शन देखो। PM-KISAN, फसल बीमा, मृदा हेल्थ कार्ड के लिए अप्लाई करो!" :
          "🏛️ Check schemes section. Apply for PM-KISAN, crop insurance, soil health card!";
        
      case 'pest_control':
        return language === 'hindi' ?
          "🐛 सुबह-सुबह नीम का तेल स्प्रे करो। 5ml प्रति लीटर पानी में मिलाकर। हफ्ते में दो बार!" :
          "🐛 Spray neem oil early morning. Mix 5ml per liter water. Twice a week!";
        
      default:
        return language === 'hindi' ?
          "🤖 पूछो यार: फसल, कीट, मौसम, भाव, या सरकारी स्कीम के बारे में! सब सिखाऊंगा! 🌾" :
          "🤖 Ask me friend: crops, pests, weather, prices, or government schemes! I'll teach everything! 🌾";
    }
  }
}

// Singleton instance
export const farmerAI = new FarmerAIService();

// Export types and service
export type { AIResponse, ChatContext };
export default farmerAI;