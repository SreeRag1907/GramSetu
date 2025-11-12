// Multi-AI Service with Groq (Free, Fast) + Fallbacks
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AIResponse {
  success: boolean;
  response?: string;
  error?: string;
  provider?: 'groq' | 'huggingface' | 'local';
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

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const CONVERSATION_STORAGE_KEY = 'farmer_conversation_history';
const MAX_HISTORY_LENGTH = 20; // Keep last 20 messages

class MultiAIService {
  private conversationHistory: ConversationMessage[] = [];
  private isInitialized: boolean = false;

  constructor() {
    this.loadConversationHistory();
  }

  // Load conversation history from storage
  private async loadConversationHistory() {
    try {
      const stored = await AsyncStorage.getItem(CONVERSATION_STORAGE_KEY);
      if (stored) {
        this.conversationHistory = JSON.parse(stored);
        console.log(
          `📜 Loaded ${this.conversationHistory.length} messages from history`
        );
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Error loading conversation history:', error);
      this.conversationHistory = [];
      this.isInitialized = true;
    }
  }

  // Save conversation history to storage
  private async saveConversationHistory() {
    try {
      // Keep only last MAX_HISTORY_LENGTH messages
      const trimmedHistory = this.conversationHistory.slice(
        -MAX_HISTORY_LENGTH
      );
      await AsyncStorage.setItem(
        CONVERSATION_STORAGE_KEY,
        JSON.stringify(trimmedHistory)
      );
      this.conversationHistory = trimmedHistory;
    } catch (error) {
      console.error('Error saving conversation history:', error);
    }
  }

  // Add message to history
  private addToHistory(role: 'user' | 'assistant', content: string) {
    this.conversationHistory.push({
      role,
      content,
      timestamp: Date.now(),
    });
    this.saveConversationHistory();
  }

  // Get conversation history for display
  getConversationHistory(): ConversationMessage[] {
    return this.conversationHistory;
  }

  // Clear conversation history
  async clearHistory() {
    this.conversationHistory = [];
    await AsyncStorage.removeItem(CONVERSATION_STORAGE_KEY);
    console.log('🗑️ Conversation history cleared');
  }

  // Generate farmer persona prompt
  private generateFarmerPersona(context?: ChatContext): string {
    const userInfo = context?.userProfile;
    const weatherInfo = context?.weatherData;
    const userLanguage = userInfo?.language || 'en';
    const userLocation = userInfo?.location || 'India';
    const userName = userInfo?.name || 'Friend';

    // Map language codes to names
    const languageNames: { [key: string]: string } = {
      hi: 'Hindi (हिंदी)',
      mr: 'Marathi (मराठी)',
      en: 'English',
      bn: 'Bengali (বাংলা)',
      gu: 'Gujarati (ગુજરાતી)',
      ta: 'Tamil (தமிழ்)',
    };

    const languageName = languageNames[userLanguage] || languageNames['en'];

    let persona = `You are an AI Farming Assistant helping ${userName}, a farmer from ${userLocation}.

CRITICAL LANGUAGE INSTRUCTION:
- You MUST respond ONLY in ${languageName}
- Use simple, farmer-friendly language that is easy to understand
- Keep responses SHORT (2-3 sentences maximum)
- Be practical and actionable

PERSONALITY:
- Warm and encouraging like a helpful friend
- Share practical, actionable farming advice
- Give solutions farmers can implement TODAY
- Use simple, clear language
- Be respectful and supportive`;


    if (weatherInfo) {
      persona += `\n\nCURRENT WEATHER: ${weatherInfo.temperature}°C, ${weatherInfo.humidity}% humidity, ${weatherInfo.condition}`;
    }

    persona += `\n\nREMEMBER: Respond in ${languageName} ONLY. Be practical, friendly, and give advice farmers can use TODAY!`;

    return persona;
  }

  // Try Groq API (FREE and FAST!)
  private async tryGroq(prompt: string): Promise<AIResponse> {
    try {
      // Groq is free and very fast - using their free API
      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant', // Free, very fast model
            messages: [
              { role: 'system', content: prompt },
              ...this.conversationHistory.slice(-6).map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
            ],
            max_tokens: 150,
            temperature: 0.7,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          response: data.choices[0].message.content,
          provider: 'groq',
        };
      }
    } catch (error) {
      console.log('Groq API not available, trying fallback...');
    }
    return { success: false };
  }

  // Try Hugging Face Inference API (FREE!)
  private async tryHuggingFace(prompt: string): Promise<AIResponse> {
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer hf_your_token_here', // Free API token
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_length: 100,
              temperature: 0.7,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          response: data[0]?.generated_text || data.generated_text,
          provider: 'huggingface',
        };
      }
    } catch (error) {
      console.log('Hugging Face API not available, using local fallback...');
    }
    return { success: false };
  }

  // Enhanced rule-based local AI (smarter fallback)
  private getLocalAI(userQuery: string, context?: ChatContext): AIResponse {
    const lowerQuery = userQuery.toLowerCase();
    const language = context?.userProfile?.language || 'english';
    const weather = context?.weatherData;

    // Weather-based advice
    if (
      lowerQuery.includes('weather') ||
      lowerQuery.includes('मौसम') ||
      lowerQuery.includes('हवामान')
    ) {
      if (weather) {
        const temp = weather.temperature;
        const humidity = weather.humidity;

        if (temp > 35) {
          return {
            success: true,
            response:
              language === 'hindi'
                ? `🌡️ अरे भाई, ${temp}°C बहुत गर्मी है! शाम को ही पानी दो। दोपहर में खेत में मत जाओ। मलचिंग करो मिट्टी में नमी रखने के लिए। 💧`
                : language === 'marathi'
                ? `🌡️ अरे भाऊ, ${temp}°C खूप गरम आहे! संध्याकाळीच पाणी द्या. दुपारी शेतात जाऊ नका. मातीत ओलावा राखण्यासाठी मलचिंग करा. 💧`
                : `🌡️ Friend, ${temp}°C is very hot! Water in evening only. Don't work in midday sun. Use mulch to keep soil moist. 💧`,
            provider: 'local',
          };
        } else if (humidity > 75) {
          return {
            success: true,
            response:
              language === 'hindi'
                ? `💧 ${humidity}% नमी ज्यादा है भाई! फंगल रोग हो सकता है। नीम का स्प्रे करो। ज्यादा पानी मत दो। 🌿`
                : language === 'marathi'
                ? `💧 ${humidity}% आर्द्रता जास्त आहे! बुरशीजन्य रोग होऊ शकतो. कडुलिंबाचा फवारा करा. जास्त पाणी देऊ नका. 🌿`
                : `💧 ${humidity}% humidity is high! Risk of fungal disease. Spray neem oil. Don't over-water. 🌿`,
            provider: 'local',
          };
        }
      }

      return {
        success: true,
        response:
          language === 'hindi'
            ? '🌤️ मौसम के हिसाब से खेती करो यार! गर्मी में शाम को पानी, ठंड में सुबह। बारिश से पहले निकास ठीक करो। 🌧️'
            : language === 'marathi'
            ? '🌤️ हवामानानुसार शेती करा! उन्हाळ्यात संध्याकाळी पाणी, थंडीत सकाळी. पावसाआधी पाण्याचा निचरा ठीक करा. 🌧️'
            : '🌤️ Farm according to weather friend! Hot: water evening. Cold: water morning. Before rain: fix drainage. 🌧️',
        provider: 'local',
      };
    }

    // Pest control
    if (
      lowerQuery.includes('pest') ||
      lowerQuery.includes('insect') ||
      lowerQuery.includes('कीट') ||
      lowerQuery.includes('किडे')
    ) {
      return {
        success: true,
        response:
          language === 'hindi'
            ? '🐛 कीटों के लिए राम का नुस्खा - नीम का तेल 5ml + 1 लीटर पानी। सुबह-सुबह स्प्रे करो। हफ्ते में 2 बार। साबुन की चिप्पी मिला सकते हो। ₹50 में हो जाएगा! 🌿✅'
            : language === 'marathi'
            ? '🐛 किड्यांसाठी रामरावाचा उपाय - कडुलिंबाचे तेल 5ml + 1 लिटर पाणी. सकाळी लवकर फवारा. आठवड्यातून 2 वेळा. साबणाची तुकडी घालू शकता. ₹50 मध्ये होईल! 🌿✅'
            : '🐛 For pests Ram recipe - Neem oil 5ml + 1 liter water. Spray early morning. Twice a week. Can add soap chip. Costs only ₹50! 🌿✅',
        provider: 'local',
      };
    }

    // Market/price
    if (
      lowerQuery.includes('market') ||
      lowerQuery.includes('price') ||
      lowerQuery.includes('sell') ||
      lowerQuery.includes('बाजार') ||
      lowerQuery.includes('भाव') ||
      lowerQuery.includes('बाजारपेठ')
    ) {
      return {
        success: true,
        response:
          language === 'hindi'
            ? '💰 बाजार का राम का सुझाव - 3-4 मंडियों के भाव देखो (AGMARKNET पर)। सुबह 8 बजे तक पहुंचो। त्योहार पर दाम अच्छे मिलते हैं। बीच वाले से बचो। सीधे मंडी जाओ! 📈🚜'
            : language === 'marathi'
            ? '💰 बाजाराचा रामरावाचा सल्ला - 3-4 मंडींचे भाव बघा (AGMARKNET वर). सकाळी 8 वाजेपर्यंत पोहोचा. सणासुदीला चांगले दर मिळतात. मध्यस्थांपासून दूर राहा. थेट मंडीत जा! 📈🚜'
            : '💰 Market advice from Ram - Check 3-4 market rates (on AGMARKNET). Reach by 8 AM. Good prices during festivals. Avoid middlemen. Go direct to mandi! 📈🚜',
        provider: 'local',
      };
    }

    // Fertilizer
    if (
      lowerQuery.includes('fertilizer') ||
      lowerQuery.includes('खाद') ||
      lowerQuery.includes('खत')
    ) {
      return {
        success: true,
        response:
          language === 'hindi'
            ? '🌱 खाद डालने से पहले मिट्टी जांच जरूर करो! NPK के चक्कर में मत पड़ो - गोबर खाद सबसे बढ़िया। वर्मीकंपोस्ट भी बना सकते हो घर पर। बारिश से पहले डालो तो ज्यादा फायदा! 💪'
            : language === 'marathi'
            ? '🌱 खत टाकण्याआधी माती तपासणी अवश्य करा! NPK च्या चक्करात पडू नका - शेणखत सर्वोत्तम. व्हर्मीकंपोस्ट पण घरीच बनवू शकता. पावसाआधी टाकलं तर जास्त फायदा! 💪'
            : '🌱 Test soil before fertilizer! Do not chase NPK - cow dung is best. Can make vermicompost at home. Apply before rain for max benefit! 💪',
        provider: 'local',
      };
    }

    // Irrigation
    if (
      lowerQuery.includes('water') ||
      lowerQuery.includes('irrigation') ||
      lowerQuery.includes('पानी') ||
      lowerQuery.includes('सिंचाई')
    ) {
      return {
        success: true,
        response:
          language === 'hindi'
            ? '💧 पानी देने का सही तरीका - सुबह या शाम, दोपहर में कभी नहीं। मिट्टी हाथ से दबाओ - अगर चिपके तो पानी की जरूरत नहीं। ड्रिप लगा सको तो 50% पानी बचेगा। गर्मी में हर 3 दिन में! 🌾'
            : language === 'marathi'
            ? '💧 पाणी देण्याची योग्य पद्धत - सकाळी किंवा संध्याकाळी, दुपारी कधीच नाही. माती हाताने दाबा - चिकटली तर पाण्याची गरज नाही. ठिबक सिंचन लावलं तर 50% पाणी वाचेल. उन्हाळ्यात दर 3 दिवसांनी! 🌾'
            : '💧 Right way to water - morning or evening, never noon. Press soil with hand - if sticky, no water needed. Drip irrigation saves 50% water. Every 3 days in summer! 🌾',
        provider: 'local',
      };
    }

    // Default friendly greeting
    return {
      success: true,
      response:
        language === 'hindi'
          ? '🤗 नमस्ते! मैं आपका AI कृषि सहायक हूँ। खेती, मौसम, कीट, बाजार, पानी, खाद - कुछ भी पूछें! मदद के लिए तैयार हूँ। 🌾'
          : language === 'marathi'
          ? '🤗 नमस्कार! मी तुमचा AI शेती सहाय्यक आहे. शेती, हवामान, किडे, बाजार, पाणी, खत - काहीही विचारा! मदतीसाठी तयार आहे. 🌾'
          : '🤗 Hello! I am your AI Farming Assistant. Ask about farming, weather, pests, market, water, fertilizer - anything! Ready to help. 🌾',
      provider: 'local',
    };
  }

  // Main chat function with conversation history
  async chat(userMessage: string, context?: ChatContext): Promise<AIResponse> {
    // Wait for initialization
    if (!this.isInitialized) {
      await this.loadConversationHistory();
    }

    // Add user message to history
    this.addToHistory('user', userMessage);

    const persona = this.generateFarmerPersona(context);
    const fullPrompt = `${persona}\n\nUser: ${userMessage}\nRam:`;

    // Try AI providers in order
    let result: AIResponse;

    // 1. Try Groq (fastest, free)
    result = await this.tryGroq(fullPrompt);
    if (result.success) {
      this.addToHistory('assistant', result.response!);
      console.log('✅ Response from Groq AI');
      return result;
    }

    // 2. Try Hugging Face (free)
    result = await this.tryHuggingFace(fullPrompt);
    if (result.success) {
      this.addToHistory('assistant', result.response!);
      console.log('✅ Response from Hugging Face');
      return result;
    }

    // 3. Use smart local fallback
    result = this.getLocalAI(userMessage, context);
    this.addToHistory('assistant', result.response!);
    console.log('✅ Response from Local AI');
    return result;
  }

  // Quick response for common queries (instant, no API call)
  getQuickResponse(queryType: string, context?: ChatContext): string {
    const language = context?.userProfile?.language;
    const weather = context?.weatherData;

    switch (queryType) {
      case 'weather_advice':
        if (weather && weather.temperature > 35) {
          return language === 'hindi'
            ? `🌡️ ${weather.temperature}°C गर्मी! शाम को पानी दो। 💧`
            : `🌡️ ${weather.temperature}°C hot! Water in evening. 💧`;
        }
        return language === 'hindi'
          ? '🌤️ मौसम देखो और खेती करो!'
          : '🌤️ Check weather and farm!';

      default:
        return language === 'hindi'
          ? '🤗 पूछो यार - मदद करूंगा! 🌾'
          : '🤗 Ask friend - I will help! 🌾';
    }
  }
}

// Singleton instance
export const multiAI = new MultiAIService();
export type { AIResponse, ChatContext, ConversationMessage };
