import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useI18n } from '../i18n/useI18n';
import {
  ChatMessage,
  QuickQuery,
  quickQueries,
  chatCategories,
  getWelcomeMessage,
  getAIResponse,
} from '../data/chatbot-data';
import { multiAI, ChatContext, ConversationMessage } from '../services/multiAI';
import { PromptContextBuilder, quickResponseTemplates } from '../data/ai-prompts';
import { defaultWeatherData } from '../data/dashboard-data';
import { dataIntegration } from '../services/dataIntegration';

// Define the interface locally to avoid import issues
interface IntegratedFarmData {
  userProfile: {
    name: string;
    location: string;
    farmSize: number;
    primaryCrops: string[];
    farmingType: 'organic' | 'conventional' | 'mixed';
    experience: number;
    language: string;
  };
  currentCrops: {
    cropName: string;
    variety: string;
    area: number;
    sowingDate: Date;
    currentStage: 'sowing' | 'vegetative' | 'flowering' | 'fruiting' | 'harvesting';
    expectedHarvest: Date;
    issues?: string[];
  }[];
  weatherData: {
    current: {
      temperature: number;
      humidity: number;
      condition: string;
      location: string;
    };
    forecast?: any;
  };
  marketData: {
    [cropName: string]: {
      currentPrice: number;
      trend: 'up' | 'down' | 'stable';
      demandLevel: 'high' | 'medium' | 'low';
      lastUpdated: Date;
    };
  };
  schemes: {
    eligible: any[];
    applied: any[];
    recommended: any[];
  };
  laborData: {
    availableWorkers: number;
    dailyWage: number;
    currentTasks: string[];
    upcomingNeeds: string[];
  };
  farmActivities: {
    recent: any[];
    planned: any[];
  };
}

const Chatbot = () => {
  const { t, currentLanguage, changeLanguage } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState('');
  const [userProfile, setUserProfile] = useState<any>({});
  const [weatherData, setWeatherData] = useState<any>(defaultWeatherData);
  const [farmData, setFarmData] = useState<IntegratedFarmData | null>(null);
  const [aiProvider, setAiProvider] = useState<string>('local'); // Track which AI is being used
  const [detectedLanguage, setDetectedLanguage] = useState<string>(currentLanguage || 'en');
  const scrollViewRef = useRef<ScrollView>(null);



  useEffect(() => {
    const initialize = async () => {
      loadFarmData(); // Run in parallel, don't wait
      const hasHistory = await loadConversationHistory();
      // Only initialize chat if no history exists
      if (!hasHistory) {
        initializeChat();
      }
    };
    initialize();
  }, []);

  // Listen to language changes from settings
  useEffect(() => {
    setDetectedLanguage(currentLanguage || 'en');
  }, [currentLanguage]);

  const loadFarmData = async () => {
    try {
      const integrated = await dataIntegration.loadFarmData();
      setFarmData(integrated);
      setUserName(integrated.userProfile.name);
      setUserProfile(integrated.userProfile);
      setWeatherData(integrated.weatherData.current);
      console.log('✅ Farm data loaded:', integrated.userProfile.name);
    } catch (error) {
      console.error('Error loading farm data:', error);
    }
  };

  const loadConversationHistory = async (): Promise<boolean> => {
    // Load persisted conversation from multiAI service
    const history = multiAI.getConversationHistory();
    
    // Convert to ChatMessage format for display
    const chatMessages: ChatMessage[] = history.map((msg, index) => ({
      id: `history-${index}`,
      text: msg.content,
      isUser: msg.role === 'user',
      timestamp: new Date(msg.timestamp),
      category: msg.role === 'user' ? 'User' : 'Response',
    }));

    if (chatMessages.length > 0) {
      setMessages(chatMessages);
      console.log(`📜 Loaded ${chatMessages.length} messages from history`);
      return true; // Has history
    }
    
    return false; // No history
  };

  const initializeChat = () => {
    const language = detectedLanguage || currentLanguage || 'en';
    
    // Generate personalized greeting
    let welcomeText = '';
    const farmerName = userName || farmData?.userProfile.name || 'Friend';
    const location = farmData?.userProfile.location || 'your area';
    const temp = weatherData?.temperature || farmData?.weatherData.current.temperature;
    const humidity = weatherData?.humidity || farmData?.weatherData.current.humidity;
    const condition = weatherData?.condition || farmData?.weatherData.current.condition || 'pleasant';
    
    // Multilingual personalized greetings
    if (language === 'hi') {
      welcomeText = `🙏 नमस्ते ${farmerName} जी!\n\n`;
      welcomeText += `मैं आपका AI कृषि सहायक हूँ। ${location} में आज मौसम ${condition} है `;
      if (temp) welcomeText += `(${temp}°C, ${humidity}% नमी)`;
      welcomeText += `\n\n`;
      
      if (temp && temp > 35) {
        welcomeText += `🌡️ आज बहुत गर्मी है! शाम को ही सिंचाई करें।\n\n`;
      } else if (humidity && humidity > 75) {
        welcomeText += `💧 नमी ज्यादा है! फसलों में फंगल रोग का ध्यान रखें।\n\n`;
      }
      
      welcomeText += `आप कैसे हैं? खेती के बारे में कुछ पूछना चाहते हैं? मैं मदद के लिए हाजिर हूँ! 🌾`;
    } else if (language === 'mr') {
      welcomeText = `🙏 नमस्कार ${farmerName}!\n\n`;
      welcomeText += `मी तुमचा AI शेती सहाय्यक आहे। ${location} मध्ये आज हवामान ${condition} आहे `;
      if (temp) welcomeText += `(${temp}°C, ${humidity}% आर्द्रता)`;
      welcomeText += `\n\n`;
      
      if (temp && temp > 35) {
        welcomeText += `🌡️ आज खूप गरम आहे! संध्याकाळीच सिंचन करा।\n\n`;
      } else if (humidity && humidity > 75) {
        welcomeText += `💧 आर्द्रता जास्त आहे! पिकांमध्ये बुरशीजन्य रोग टाळा।\n\n`;
      }
      
      welcomeText += `तुम्ही कसे आहात? शेतीबद्दल काही विचारायचं आहे का? मी मदतीसाठी उपलब्ध आहे! 🌾`;
    } else {
      welcomeText = `👋 Hello ${farmerName}!\n\n`;
      welcomeText += `I'm your AI Farming Assistant. Today's weather in ${location} is ${condition} `;
      if (temp) welcomeText += `(${temp}°C, ${humidity}% humidity)`;
      welcomeText += `\n\n`;
      
      if (temp && temp > 35) {
        welcomeText += `🌡️ It's very hot today! Water your crops in the evening.\n\n`;
      } else if (humidity && humidity > 75) {
        welcomeText += `💧 High humidity! Watch out for fungal diseases in crops.\n\n`;
      }
      
      welcomeText += `How are you doing? Want to ask anything about farming? I'm here to help! 🌾`;
    }
    
    // Add farm-specific insights if available
    if (farmData) {
      const analysis = dataIntegration.analyzeFarmStatus(farmData);
      if (analysis.urgentIssues.length > 0) {
        welcomeText += `\n\n⚠️ ${language === 'hi' ? 'जरूरी' : language === 'mr' ? 'महत्त्वाचे' : 'Urgent'}: ${analysis.urgentIssues[0]}`;
      }
      if (analysis.opportunities.length > 0) {
        welcomeText += `\n\n💡 ${language === 'hi' ? 'अवसर' : language === 'mr' ? 'संधी' : 'Opportunity'}: ${analysis.opportunities[0]}`;
      }
    }
    
    const welcomeMessage: ChatMessage = {
      id: '1',
      text: welcomeText,
      isUser: false,
      timestamp: new Date(),
      category: 'Welcome',
    };
    
    setMessages([welcomeMessage]);
  };

  const clearChatHistory = async () => {
    const language = detectedLanguage || currentLanguage || 'en';
    const title = language === 'hi' ? 'चैट हिस्ट्री साफ़ करें' : language === 'mr' ? 'चॅट इतिहास साफ करा' : 'Clear Chat History';
    const message = language === 'hi' 
      ? 'क्या आप सभी बातचीत का इतिहास हटाना चाहते हैं? इसे पूर्ववत नहीं किया जा सकता।'
      : language === 'mr'
      ? 'तुम्हाला सर्व संभाषण इतिहास साफ करायचा आहे का? हे पूर्ववत केले जाऊ शकत नाही.'
      : 'Are you sure you want to clear all conversation history? This cannot be undone.';
    const cancelText = language === 'hi' ? 'रद्द करें' : language === 'mr' ? 'रद्द करा' : 'Cancel';
    const clearText = language === 'hi' ? 'साफ़ करें' : language === 'mr' ? 'साफ करा' : 'Clear';
    
    Alert.alert(
      title,
      message,
      [
        { text: cancelText, style: 'cancel' },
        {
          text: clearText,
          style: 'destructive',
          onPress: async () => {
            await multiAI.clearHistory();
            setMessages([]);
            initializeChat();
            console.log('🗑️ Chat history cleared');
          }
        }
      ]
    );
  };



  // Detect language from user input
  const detectLanguage = (text: string): string => {
    // Hindi detection - Devanagari script
    if (/[\u0900-\u097F]/.test(text)) return 'hi';
    // Marathi detection - Devanagari script (same as Hindi, but check for Marathi-specific words)
    if (/[\u0900-\u097F]/.test(text) && /(?:काय|आहे|मला|तुम्ही|आमचे)/i.test(text)) return 'mr';
    // Bengali detection
    if (/[\u0980-\u09FF]/.test(text)) return 'bn';
    // Gujarati detection
    if (/[\u0A80-\u0AFF]/.test(text)) return 'gu';
    // Tamil detection
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
    // Default to current language or English
    return currentLanguage || 'en';
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText.trim();
    if (!textToSend) return;

    // Detect language from user input
    const inputLanguage = detectLanguage(textToSend);
    if (inputLanguage !== detectedLanguage) {
      setDetectedLanguage(inputLanguage);
      console.log(`🌐 Language detected: ${inputLanguage}`);
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date(),
      category: 'User',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Show thinking animation for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Build comprehensive context for AI with detected language
      const context: ChatContext = {
        userProfile: farmData ? {
          name: farmData.userProfile.name,
          location: farmData.userProfile.location,
          language: detectedLanguage, // Use detected language
          farmSize: farmData.userProfile.farmSize,
          primaryCrops: farmData.userProfile.primaryCrops,
        } : {
          language: detectedLanguage, // Use detected language
        },
        weatherData: farmData ? farmData.weatherData.current : weatherData,
        marketData: farmData ? Object.entries(farmData.marketData).reduce((acc, [crop, data]: [string, any]) => {
          acc[crop] = {
            price: data.currentPrice,
            trend: data.trend
          };
          return acc;
        }, {} as { [crop: string]: { price: number; trend: 'up' | 'down' | 'stable' } }) : undefined,
        currentSeason: getCurrentSeason(),
      };

      // Get AI response using multiAI (language instruction is added internally)
      const aiResponse = await multiAI.chat(textToSend, context);
      
      let aiResponseText = '';
      if (aiResponse.success && aiResponse.response) {
        aiResponseText = aiResponse.response;
        setAiProvider(aiResponse.provider || 'local');
        console.log(`✅ Response from: ${aiResponse.provider}`);
      } else {
        // This should never happen as multiAI always returns a response
        aiResponseText = getAIResponse(textToSend);
        setAiProvider('fallback');
      }

      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date(),
        category: 'Response',
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);

    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback response
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: quickResponseTemplates.error[currentLanguage as keyof typeof quickResponseTemplates.error] || 
              quickResponseTemplates.error.en,
        isUser: false,
        timestamp: new Date(),
        category: 'Error',
      };

      setMessages(prev => [...prev, fallbackMessage]);
      setIsTyping(false);
    }
  };

  const getCurrentSeason = (): 'kharif' | 'rabi' | 'summer' => {
    const month = new Date().getMonth() + 1;
    if (month >= 6 && month <= 10) return 'kharif';
    if (month >= 11 || month <= 3) return 'rabi';
    return 'summer';
  };

  const getProviderIcon = () => {
    switch (aiProvider) {
      case 'groq': return '⚡'; // Fast Groq AI
      case 'huggingface': return '🤗'; // Hugging Face
      case 'local': return '🧠'; // Smart Local AI
      default: return '🤖'; // Generic AI
    }
  };

  const getProviderName = () => {
    switch (aiProvider) {
      case 'groq': return 'Groq AI (Ultra Fast)';
      case 'huggingface': return 'Hugging Face AI';
      case 'local': return 'Local Smart AI';
      default: return 'AI Assistant';
    }
  };

  const handleQuickQuery = (query: string) => {
    sendMessage(query);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('modules.aiAssistant')}</Text>
          <Text style={styles.headerSubtitle}>{getProviderIcon()} {getProviderName()}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={clearChatHistory}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>🗑️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Alert.alert(
            'AI Assistant Info',
            `${getProviderIcon()} Currently using: ${getProviderName()}\n\n✅ Multi-AI System:\n• Primary: Groq AI (super fast)\n• Backup: Hugging Face\n• Fallback: Smart Local AI\n\n💬 Conversation History:\n• ${messages.length} messages in current chat\n• Auto-saves every message\n• Persists across app restarts\n\n📱 Works offline with local AI!`
          )}>
            <Text style={styles.helpButton}>{getProviderIcon()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {messages.length === 1 && (
        <View style={styles.quickQueriesContainer}>
          <Text style={styles.quickQueriesTitle}>Popular Questions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {quickQueries.map(query => (
              <TouchableOpacity
                key={query.id}
                style={styles.quickQueryCard}
                onPress={() => handleQuickQuery(query.text)}
              >
                <Text style={styles.quickQueryIcon}>{query.icon}</Text>
                <Text style={styles.quickQueryText}>{query.text}</Text>
                <Text style={styles.quickQueryCategory}>{query.category}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View key={message.id} style={[
            styles.messageContainer,
            message.isUser ? styles.userMessageContainer : styles.aiMessageContainer
          ]}>
            <View style={[
              styles.messageBubble,
              message.isUser ? styles.userMessage : styles.aiMessage
            ]}>
              <Text style={[
                styles.messageText,
                message.isUser ? styles.userMessageText : styles.aiMessageText
              ]}>
                {message.text}
              </Text>
              <Text style={[
                styles.messageTime,
                message.isUser ? styles.userMessageTime : styles.aiMessageTime
              ]}>
                {formatTime(message.timestamp)}
              </Text>
            </View>
          </View>
        ))}
        
        {isTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.typingBubble}>
              <View style={styles.typingContent}>
                <View style={styles.typingDots}>
                  <View style={[styles.dot, styles.dot1]} />
                  <View style={[styles.dot, styles.dot2]} />
                  <View style={[styles.dot, styles.dot3]} />
                </View>
                <Text style={styles.typingText}>{getProviderIcon()} सोच रहा हूँ... / Thinking...</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask about farming, weather, prices..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={() => sendMessage()}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>→</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    padding: 20,
    paddingTop: 50,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 14,
  },
  backButton: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  helpButton: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    lineHeight: 26,
  },
  quickQueriesContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingLeft: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  quickQueriesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  quickQueryCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    padding: 12,
    marginRight: 12,
    width: 160,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  quickQueryIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  quickQueryText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 5,
    lineHeight: 16,
  },
  quickQueryCategory: {
    fontSize: 10,
    color: '#FF9800',
    fontWeight: '600',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messageContainer: {
    marginBottom: 15,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 15,
    padding: 12,
  },
  userMessage: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 5,
  },
  aiMessage: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 5,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 5,
  },
  userMessageTime: {
    color: '#E8F5E8',
    textAlign: 'right',
  },
  aiMessageTime: {
    color: '#999',
  },
  typingContainer: {
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  typingBubble: {
    backgroundColor: '#E0E0E0',
    borderRadius: 15,
    borderBottomLeftRadius: 5,
    padding: 12,
  },
  typingContent: {
    flexDirection: 'column',
    gap: 8,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9800',
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  typingText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: 'white',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#F9F9F9',
  },
  sendButton: {
    backgroundColor: '#FF9800',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Chatbot;
