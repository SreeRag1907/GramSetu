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
import { geminiAI, ChatContext } from '../services/geminiAI';
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
  const { t, currentLanguage } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState('');
  const [userProfile, setUserProfile] = useState<any>({});
  const [weatherData, setWeatherData] = useState<any>(defaultWeatherData);
  const [farmData, setFarmData] = useState<IntegratedFarmData | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
  const [aiEnabled, setAiEnabled] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);



  useEffect(() => {
    loadFarmData();
    testAIConnection();
    initializeChat();
  }, []);

  const loadFarmData = async () => {
    try {
      const integrated = await dataIntegration.loadFarmData();
      setFarmData(integrated);
      setUserName(integrated.userProfile.name);
      setUserProfile(integrated.userProfile);
      setWeatherData(integrated.weatherData.current);
    } catch (error) {
      console.error('Error loading farm data:', error);
    }
  };

  const testAIConnection = async () => {
    try {
      const isConnected = await geminiAI.testConnection();
      setAiEnabled(isConnected);
      
      if (!isConnected) {
        console.warn('Gemini AI not available, using fallback responses');
      }
    } catch (error) {
      console.error('AI connection test failed:', error);
      setAiEnabled(false);
    }
  };

  const initializeChat = () => {
    const language = currentLanguage || 'en';
    let welcomeText = quickResponseTemplates.greeting[language as keyof typeof quickResponseTemplates.greeting] || 
                     quickResponseTemplates.greeting.en;
    
    // Add personalized context if farm data is available
    if (farmData) {
      const analysis = dataIntegration.analyzeFarmStatus(farmData);
      if (analysis.urgentIssues.length > 0) {
        welcomeText += `\n\n⚠️ Urgent: ${analysis.urgentIssues[0]}`;
      }
      if (analysis.opportunities.length > 0) {
        welcomeText += `\n\n💡 Opportunity: ${analysis.opportunities[0]}`;
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



  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputText.trim();
    if (!textToSend) return;

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

    // Update conversation history
    setConversationHistory(prev => [...prev, { role: 'user', content: textToSend }]);

    try {
      let aiResponseText = '';

      if (aiEnabled && farmData) {
        // Build comprehensive context for AI
        const marketDataFormatted = Object.entries(farmData.marketData).reduce((acc, [crop, data]: [string, any]) => {
          acc[crop] = {
            price: data.currentPrice,
            trend: data.trend
          };
          return acc;
        }, {} as { [crop: string]: { price: number; trend: 'up' | 'down' | 'stable' } });

        const context: ChatContext = {
          userProfile: {
            name: farmData.userProfile.name,
            location: farmData.userProfile.location,
            language: farmData.userProfile.language,
            farmSize: farmData.userProfile.farmSize,
            primaryCrops: farmData.userProfile.primaryCrops,
          },
          weatherData: farmData.weatherData.current,
          marketData: marketDataFormatted,
          currentSeason: getCurrentSeason(),
        };

        // Enhanced prompt with farm context
        const contextSummary = dataIntegration.generateContextSummary(farmData);
        const enhancedQuery = `${contextSummary}\n\nFarmer's question: ${textToSend}`;

        // Get AI response with full context
        const aiResponse = await geminiAI.chatWithHistory(enhancedQuery, context, conversationHistory);
        
        if (aiResponse.success && aiResponse.response) {
          aiResponseText = aiResponse.response;
        } else {
          // Fallback to enhanced local responses with farm context
          aiResponseText = getEnhancedLocalResponse(textToSend, farmData);
        }
      } else {
        // Use local AI responses
        aiResponseText = getAIResponse(textToSend);
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
      
      // Update conversation history
      setConversationHistory(prev => [...prev, { role: 'assistant', content: aiResponseText }]);
      
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

  const getEnhancedLocalResponse = (query: string, farmData: IntegratedFarmData): string => {
    const lowerQuery = query.toLowerCase();
    
    // Crop-specific advice
    if (lowerQuery.includes('crop') || lowerQuery.includes('plant')) {
      const currentCrops = farmData.currentCrops.map(c => c.cropName).join(', ');
      return `🌾 Based on your current crops (${currentCrops}), here's what I recommend:\n\n${getAIResponse(query)}\n\nFor personalized advice specific to your ${farmData.userProfile.farmSize} acre farm in ${farmData.userProfile.location}, consider the current ${farmData.weatherData.current.condition} weather conditions.`;
    }
    
    // Weather-based advice
    if (lowerQuery.includes('weather')) {
      const weather = farmData.weatherData.current;
      return `🌤️ Current conditions in ${farmData.userProfile.location}:\n• Temperature: ${weather.temperature}°C\n• Humidity: ${weather.humidity}%\n• Condition: ${weather.condition}\n\n${getAIResponse(query)}`;
    }
    
    // Market advice
    if (lowerQuery.includes('price') || lowerQuery.includes('market')) {
      const marketCrops = Object.keys(farmData.marketData);
      if (marketCrops.length > 0) {
        return `💰 Market information for your crops:\n${Object.entries(farmData.marketData).map(([crop, data]: [string, any]) => 
          `• ${crop}: ₹${data.currentPrice}/quintal (${data.trend === 'up' ? '↗️' : data.trend === 'down' ? '↘️' : '→'} ${data.trend})`
        ).join('\n')}\n\n${getAIResponse(query)}`;
      }
    }
    
    // Scheme advice
    if (lowerQuery.includes('scheme') || lowerQuery.includes('government')) {
      const eligibleSchemes = farmData.schemes.eligible.length;
      return `🏛️ You're eligible for ${eligibleSchemes} government schemes based on your profile (${farmData.userProfile.farmSize} acres, ${farmData.userProfile.primaryCrops.join(', ')}).\n\n${getAIResponse(query)}`;
    }
    
    return getAIResponse(query);
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
        <Text style={styles.headerTitle}>{t('modules.aiAssistant')}</Text>
        <TouchableOpacity onPress={() => Alert.alert(
          t('common.help') || 'Help', 
          aiEnabled 
            ? '🧠 Gemini Pro AI-powered assistant ready! I provide advanced agricultural consulting with deep expertise in crop science, market analysis, and precision farming. Ask me anything!'
            : 'Using offline mode. Ask me about farming, and I\'ll provide helpful guidance based on agricultural best practices.'
        )}>
          <Text style={[styles.helpButton, !aiEnabled && styles.offlineIndicator]}>
            {aiEnabled ? '�' : '📱'}
          </Text>
        </TouchableOpacity>
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
              <Text style={styles.typingText}>🤖 AI is thinking...</Text>
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
    fontSize: 20,
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
  offlineIndicator: {
    backgroundColor: '#FF6B6B',
  },
});

export default Chatbot;
