import { GoogleGenerativeAI } from "@google/generative-ai";

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
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private isInitialized: boolean = false;

  constructor() {
    try {
      // Initialize with API key from environment
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';
      
      if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash" // Using Flash model for better quota limits
        });
        this.isInitialized = true;
        console.log('✅ Gemini Flash AI initialized successfully');
      } else {
        console.warn('⚠️ Gemini API key not provided. Using fallback responses.');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error);
      this.isInitialized = false;
    }
  }

  // Generate system prompt for simple, farmer-friendly responses
  private generateSystemPrompt(context?: ChatContext): string {
    const userInfo = context?.userProfile;
    const weatherInfo = context?.weatherData;
    const marketInfo = context?.marketData;
    
    return `You are GramSetu AI, a helpful farming assistant for Indian farmers. Give SHORT, SIMPLE answers that farmers can easily understand and follow.

IMPORTANT GUIDELINES:
- Keep answers under 3-4 sentences
- Use simple Hindi/English words farmers know
- Give ONE main action step
- No technical jargon or complex science
- Be practical and direct
- Use emojis to make it friendly

USER PROFILE:
${userInfo ? `
- Name: ${userInfo.name || 'Farmer'}
- Location: ${userInfo.location || 'India'}
- Language: ${userInfo.language || 'English'}
- Farm size: ${userInfo.farmSize || 'Small'} acres
- Crops: ${userInfo.primaryCrops?.join(', ') || 'Mixed farming'}
` : '- Basic farmer profile'}

CURRENT CONDITIONS:
${weatherInfo ? `
- Weather: ${weatherInfo.temperature}°C, ${weatherInfo.condition}
- Humidity: ${weatherInfo.humidity}%
` : '- Weather data not available'}

${marketInfo ? `
MARKET PRICES:
${Object.entries(marketInfo).slice(0, 3).map(([crop, data]) => `- ${crop}: ₹${data.price}/quintal (${data.trend === 'up' ? '↗️' : data.trend === 'down' ? '↘️' : '→'})`).join('\n')}
` : ''}

RESPONSE STYLE:
✅ GOOD: "🌾 Spray neem oil early morning. Mix 2ml per liter water. Repeat after 7 days."
❌ BAD: "Implement integrated pest management through systematic application of organic neem-based compounds..."

TOPICS I HELP WITH:
🌱 Crop care (what to do, when to do)
🐛 Pest problems (simple solutions)
🌧️ Weather advice (protect crops)
💰 Market prices (when to sell)
🏛️ Government schemes (how to apply)
💧 Irrigation (how much water)

${userInfo?.language && userInfo.language !== 'English' ? `
LANGUAGE: Give answers in ${userInfo.language} using simple words farmers understand.
` : ''}

Remember: Farmers need QUICK, SIMPLE solutions they can do TODAY. No long explanations!`;
  }

  // Main method to get AI response
  async getAIResponse(
    userQuery: string, 
    context?: ChatContext,
    conversationHistory?: Array<{ role: 'user' | 'assistant', content: string }>
  ): Promise<AIResponse> {
    try {
      if (!this.isInitialized || !this.model) {
        throw new Error('Gemini AI not initialized');
      }

      // Build system prompt with context
      const systemPrompt = this.generateSystemPrompt(context);
      
      // Prepare conversation for Gemini
      let fullPrompt = systemPrompt + '\n\n';
      
      // Add conversation history if available (keep it short)
      if (conversationHistory && conversationHistory.length > 0) {
        const recentHistory = conversationHistory.slice(-4); // Only last 2 exchanges
        recentHistory.forEach(msg => {
          fullPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n\n`;
        });
      }
      
      // Add current user query
      fullPrompt += `User: ${userQuery}\n\nAssistant: `;

      // Call Gemini API
      const result = await this.model.generateContent(fullPrompt);
      const response = await result.response;
      const aiResponse = response.text();

      if (!aiResponse) {
        throw new Error('No response received from AI');
      }

      return {
        success: true,
        response: aiResponse
      };

    } catch (error) {
      console.error('Gemini AI Error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        response: this.getFallbackResponse(userQuery)
      };
    }
  }

  // Simple fallback responses when AI fails
  private getFallbackResponse(query: string): string {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('weather')) {
      return "🌤️ Check weather section in app. If hot (>35°C), water crops early morning. If rain coming, avoid fertilizer today.";
    }
    
    if (lowerQuery.includes('price') || lowerQuery.includes('market')) {
      return "💰 Check marketplace section for prices. Sell when price is good and you need money. Store if you can wait.";
    }
    
    if (lowerQuery.includes('scheme') || lowerQuery.includes('government')) {
      return "🏛️ Check schemes section. Apply for PM-KISAN if you have 2 acres or less. Keep documents ready.";
    }
    
    if (lowerQuery.includes('pest') || lowerQuery.includes('insect')) {
      return "🐛 Spray neem oil early morning. Mix 5ml per liter water. If severe, contact agriculture officer.";
    }
    
    if (lowerQuery.includes('fertilizer') || lowerQuery.includes('manure')) {
      return "🌱 Apply compost first. For chemical fertilizer, use half dose and see results. Test soil if possible.";
    }
    
    return "🤖 I'm here to help! Ask simple questions about: crops, pests, weather, prices, or government schemes.";
  }

  // Quick response for common queries
  getQuickResponse(queryType: string, context?: ChatContext): string {
    switch (queryType) {
      case 'weather_advice':
        return context?.weatherData ? 
          `🌤️ Today: ${context.weatherData.temperature}°C, ${context.weatherData.condition}. ${context.weatherData.temperature > 35 ? 'Too hot - water crops early morning.' : context.weatherData.temperature < 10 ? 'Cold - protect crops at night.' : 'Good weather for farming.'}` :
          "🌤️ Check weather section for today's conditions.";
          
      case 'market_prices':
        return "💰 Check marketplace section. Sell when prices are high and you need money.";
        
      case 'government_schemes':
        return "🏛️ Check schemes section. Apply for PM-KISAN, crop insurance, soil health card.";
        
      case 'pest_control':
        return "🐛 Spray neem oil early morning. Mix 5ml per liter water. Repeat after 1 week.";
        
      default:
        return "🤖 Ask me about: crops, pests, weather, prices, or government schemes. Keep questions simple!";
    }
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.model) {
        return false;
      }

      const result = await this.model.generateContent("Say hello in 3 words");
      const response = await result.response;
      
      return !!response.text();
    } catch (error) {
      console.error('Gemini API connection test failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const geminiAI = new GeminiAIService();

// Export types
export type { AIResponse, ChatContext };