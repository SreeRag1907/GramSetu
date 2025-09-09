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

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  category?: string;
}

interface QuickQuery {
  id: string;
  text: string;
  category: string;
  icon: string;
}

const Chatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userName, setUserName] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const quickQueries: QuickQuery[] = [
    { id: '1', text: 'What fertilizer should I use for wheat?', category: 'Fertilizer', icon: '🌾' },
    { id: '2', text: 'How to control pest in tomato plants?', category: 'Pest Control', icon: '🍅' },
    { id: '3', text: 'Best time to sow rice?', category: 'Sowing', icon: '🌱' },
    { id: '4', text: 'Signs of plant diseases in cotton?', category: 'Disease', icon: '🔍' },
    { id: '5', text: 'Organic farming techniques?', category: 'Organic', icon: '🌿' },
    { id: '6', text: 'Soil pH testing methods?', category: 'Soil Health', icon: '🧪' },
    { id: '7', text: 'Water management in drought?', category: 'Irrigation', icon: '💧' },
    { id: '8', text: 'Market price of sugarcane?', category: 'Market', icon: '💰' },
  ];

  useEffect(() => {
    loadUserData();
    initializeChat();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      if (name) setUserName(name);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const initializeChat = () => {
    const welcomeMessage: ChatMessage = {
      id: '1',
      text: `Hello${userName ? `, ${userName}` : ''}! 👋 I'm your AI farming assistant. I can help you with:\n\n🌱 Crop management\n🐛 Pest and disease control\n🌾 Fertilizer recommendations\n💧 Irrigation advice\n📊 Market information\n🌤️ Weather-based farming tips\n\nWhat would you like to know today?`,
      isUser: false,
      timestamp: new Date(),
      category: 'Welcome',
    };
    setMessages([welcomeMessage]);
  };

  const getAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Weather-related queries
    if (lowerQuery.includes('weather') || lowerQuery.includes('rain') || lowerQuery.includes('temperature')) {
      return "🌤️ Based on current weather data:\n\n• Today: 28°C, partly cloudy\n• Tomorrow: Chance of rain (80%)\n• Recommendation: Delay outdoor activities tomorrow\n\nWould you like detailed weather forecast or farming advisories based on weather conditions?";
    }
    
    // Market price queries
    if (lowerQuery.includes('price') || lowerQuery.includes('market') || lowerQuery.includes('sell')) {
      return "💰 Current market prices in your area:\n\n🌾 Wheat: ₹2,450/quintal (↗️ +₹50)\n🌾 Rice: ₹3,200/quintal (↘️ -₹80)\n🍅 Tomato: ₹25/kg (↗️ +₹5)\n🧅 Onion: ₹18/kg (↘️ -₹3)\n\nWould you like to list your produce for sale or get more detailed price trends?";
    }
    
    // Fertilizer queries
    if (lowerQuery.includes('fertilizer') || lowerQuery.includes('nutrients')) {
      return "🌱 Fertilizer recommendations:\n\n🌾 For Wheat:\n• NPK 12:32:16 at sowing\n• Urea top-dressing at 45 days\n• Apply based on soil test results\n\n📊 General guidelines:\n• Test soil pH first (ideal: 6.0-7.5)\n• Apply organic manure before chemical fertilizers\n• Follow 4R principles: Right source, Right rate, Right time, Right place\n\nNeed specific recommendations for your crop and soil type?";
    }
    
    // Pest control queries
    if (lowerQuery.includes('pest') || lowerQuery.includes('insect') || lowerQuery.includes('bug')) {
      return "🐛 Pest management strategies:\n\n🔍 Identification:\n• Upload photos for pest identification\n• Monitor regularly (weekly checks)\n• Look for eggs, larvae, and damage patterns\n\n🛡️ Control methods:\n• Integrated Pest Management (IPM)\n• Biological controls (beneficial insects)\n• Neem-based organic pesticides\n• Chemical control as last resort\n\nWhich specific pest are you dealing with?";
    }
    
    // Disease queries
    if (lowerQuery.includes('disease') || lowerQuery.includes('fungus') || lowerQuery.includes('rot')) {
      return "🦠 Disease management:\n\n🔍 Common symptoms:\n• Leaf spots, wilting, discoloration\n• Stunted growth, rotting\n• Unusual leaf patterns\n\n💊 Treatment approach:\n• Early detection is key\n• Improve air circulation\n• Avoid overhead watering\n• Use disease-resistant varieties\n• Apply fungicides if necessary\n\nDescribe the symptoms you're seeing for specific advice.";
    }
    
    // Irrigation/water management
    if (lowerQuery.includes('water') || lowerQuery.includes('irrigation') || lowerQuery.includes('drought')) {
      return "💧 Water management tips:\n\n⏰ Irrigation scheduling:\n• Early morning (6-8 AM) is best\n• Avoid midday watering\n• Water deeply but less frequently\n\n💡 Water conservation:\n• Mulching reduces evaporation\n• Drip irrigation saves 30-40% water\n• Rainwater harvesting\n• Soil moisture monitoring\n\nCurrent soil moisture looks good. Next irrigation recommended in 2-3 days.";
    }
    
    // Soil health
    if (lowerQuery.includes('soil') || lowerQuery.includes('ph') || lowerQuery.includes('organic')) {
      return "🌱 Soil health management:\n\n🧪 Soil testing:\n• Test pH, N-P-K, organic matter\n• Test every 2-3 years\n• Collect samples from multiple points\n\n🌿 Improving soil health:\n• Add organic matter (compost, FYM)\n• Crop rotation practices\n• Cover cropping in off-season\n• Reduce tillage when possible\n\nWould you like guidance on soil testing or specific soil improvement methods?";
    }
    
    // Sowing/planting
    if (lowerQuery.includes('sow') || lowerQuery.includes('plant') || lowerQuery.includes('seed')) {
      return "🌱 Sowing guidelines:\n\n📅 Optimal timing:\n• Check local weather forecast\n• Ensure soil moisture is adequate\n• Consider variety-specific requirements\n\n🌾 Best practices:\n• Treat seeds before sowing\n• Maintain proper depth and spacing\n• Ensure good seed-soil contact\n• Monitor germination rates\n\nCurrent conditions are favorable for sowing. Which crop are you planning to sow?";
    }
    
    // Government schemes
    if (lowerQuery.includes('scheme') || lowerQuery.includes('government') || lowerQuery.includes('subsidy')) {
      return "🏛️ Available government schemes:\n\n💰 Financial support:\n• PM-KISAN: ₹6,000/year direct benefit\n• Crop insurance schemes\n• Interest subvention on loans\n\n🌾 Agricultural schemes:\n• Soil health card scheme\n• Pradhan Mantri Fasal Bima Yojana\n• National Mission for Sustainable Agriculture\n\nWould you like help applying for any specific scheme?";
    }
    
    // Crop-specific queries
    if (lowerQuery.includes('wheat')) {
      return "🌾 Wheat farming tips:\n\n📅 Current stage advice:\n• Monitor for rust diseases\n• Apply nitrogen if needed\n• Check for aphid infestation\n\n💡 Best practices:\n• Sowing: November-December\n• Varieties: HD-2967, PBW-725\n• Irrigation: 4-5 times during season\n• Harvest: March-April\n\nNeed specific advice for your wheat crop stage?";
    }
    
    if (lowerQuery.includes('rice')) {
      return "🌾 Rice cultivation guidance:\n\n🌱 Current recommendations:\n• Maintain 2-3 cm water level\n• Watch for blast disease\n• Apply potash at panicle initiation\n\n📊 Key practices:\n• Transplanting: 25-30 days after sowing\n• Spacing: 20x15 cm\n• Water management: Continuous flooding\n• Harvest: When 80% grains are golden\n\nWhat specific aspect of rice farming do you need help with?";
    }
    
    if (lowerQuery.includes('cotton')) {
      return "🌿 Cotton farming advice:\n\n🐛 Pest management focus:\n• Monitor for bollworm\n• Check for whitefly infestation\n• Use pheromone traps\n\n💧 Water management:\n• Critical stages: squaring, flowering\n• Avoid water stress during boll formation\n• Maintain proper drainage\n\nCurrent weather is favorable for cotton. Any specific issues you're facing?";
    }
    
    // Default response
    return `🤔 I understand you're asking about "${query}". While I don't have a specific answer for that right now, here are some resources that might help:\n\n📚 General farming tips:\n• Consult your local agricultural officer\n• Check with nearby successful farmers\n• Visit the nearest Krishi Vigyan Kendra (KVK)\n\n📱 You can also try asking about:\n• Specific crop problems\n• Weather and irrigation\n• Pest and disease management\n• Market prices and selling\n\nIs there a more specific farming question I can help you with?`;
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
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = getAIResponse(textToSend);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
        category: 'Response',
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
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
        <Text style={styles.headerTitle}>AI Assistant</Text>
        <TouchableOpacity onPress={() => Alert.alert('Help', 'Ask me anything about farming, weather, market prices, or government schemes. I\'m here to help!')}>
          <Text style={styles.helpButton}>?</Text>
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
});

export default Chatbot;
