# GramSetu Gemini Pro AI Chatbot Integration Guide

## Overview
This guide walks you through integrating Google's **Gemini Pro** AI into your GramSetu agricultural app, providing advanced agricultural intelligence with superior reasoning capabilities for complex farming scenarios.

## Features Implemented

### � Advanced AI Capabilities (Gemini Pro)
- **Advanced Crop Science**: Deep knowledge of genetics, physiology, and precision breeding
- **Complex Problem Solving**: Multi-factor agricultural analysis with confidence levels
- **Integrated Pest Management**: Biological controls and resistance management strategies
- **Climate-Smart Agriculture**: Adaptation and mitigation strategies for changing conditions
- **Precision Agriculture**: Data-driven recommendations for optimal resource use
- **Market Intelligence**: Advanced price forecasting and value chain optimization
- **Research Integration**: Latest agricultural research and technological innovations
- **Risk Assessment**: Comprehensive risk-benefit analysis for farming decisions

### 📊 Data Integration
- User profile and farming history
- Real-time weather conditions
- Market prices and trends
- Government scheme eligibility
- Labor management data
- Farm activity tracking

## Installation Steps

### 1. Install Dependencies

```bash
cd your-project-directory
npm install @google/genai
```

### 2. Get Gemini Pro API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key **with Gemini Pro access**
4. Copy the API key for configuration

**Note**: Ensure your API key has access to Gemini Pro models for advanced capabilities.

### 3. Environment Configuration

Create/update your `.env` file:

```bash
# Gemini AI Configuration (IMPORTANT: Use EXPO_PUBLIC_ prefix for React Native)
EXPO_PUBLIC_GEMINI_API_KEY=your_actual_gemini_api_key_here

# Other configurations...
EXPO_NO_TELEMETRY=1
```

**Important**: 
- Replace `your_actual_gemini_api_key_here` with your real API key
- Use the `EXPO_PUBLIC_` prefix for environment variables in React Native/Expo
- Never commit your API keys to version control

### 4. Update Environment Loading

For React Native/Expo projects, you might need to install additional packages:

```bash
npm install react-native-dotenv
# or
npm install @react-native-async-storage/async-storage react-native-config
```

### 5. Configure API Key Access

Update `services/geminiAI.ts` constructor:

```typescript
constructor() {
  // For React Native/Expo, use EXPO_PUBLIC_ prefix
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  
  this.genAI = new GoogleGenerativeAI(apiKey);
  // ... rest of configuration
}
```

**Note**: The API key should now be automatically loaded from your environment file.

## Usage Examples

### Basic Chat
```typescript
// The chatbot will automatically use context
await geminiAI.getAIResponse("What fertilizer should I use for wheat?", context);
```

### With Farm Context
```typescript
// Load farm data
const farmData = await dataIntegration.loadFarmData();

// AI responds with personalized advice based on:
// - User's location and farm size
// - Current crops and their stages
// - Weather conditions
// - Market prices
// - Available government schemes
```

### Multilingual Responses
```typescript
// User's language preference from profile automatically used
// Supports: English, Hindi, Bengali, Gujarati, Tamil, Marathi
const context = {
  userProfile: {
    language: 'hi' // Hindi responses
  }
};
```

## Key Features for Your App

### 🧠 Gemini Pro Advantages
- **Superior Reasoning**: Better understanding of complex agricultural scenarios
- **Advanced Analysis**: Multi-factor problem solving with confidence assessments
- **Research Integration**: Access to latest agricultural research and innovations
- **Precision Recommendations**: More accurate, context-specific advice
- **Risk Assessment**: Comprehensive evaluation of farming decisions
- **Technical Depth**: Advanced crop science, soil chemistry, and biotechnology insights

### 🌾 Agricultural Expertise
- **Crop-specific advice**: Tailored recommendations based on growth stage
- **Pest identification**: Upload photos for AI analysis (future feature)
- **Disease diagnosis**: Symptom-based treatment suggestions
- **Soil health**: pH analysis and improvement recommendations

### 🌤️ Weather Intelligence
- **Risk alerts**: Extreme weather warnings for crop protection
- **Activity planning**: Optimal timing for farming operations
- **Irrigation guidance**: Water management based on weather forecasts

### 💰 Market Intelligence
- **Price alerts**: Notifications when prices favor selling
- **Trend analysis**: Historical and predicted price movements
- **Strategy recommendations**: When to hold vs. sell crops

### 🏛️ Government Scheme Assistance
- **Eligibility assessment**: Automatic checking based on farmer profile
- **Application guidance**: Step-by-step process assistance
- **Document preparation**: Required paperwork checklists

## Cost Optimization

### 1. Thinking Budget Control
```typescript
model: "gemini-2.5-flash",
config: {
  thinkingConfig: {
    thinkingBudget: 0, // Disables thinking for faster, cheaper responses
  },
}
```

### 2. Smart Fallbacks
- Local responses for common queries
- Context-aware fallbacks when AI is unavailable
- Offline mode with cached responses

### 3. Query Optimization
- Pre-process queries to include relevant context
- Batch related questions when possible
- Use quick responses for simple queries

## Testing

### 1. Test AI Connection
```typescript
const isConnected = await geminiAI.testConnection();
console.log('AI Available:', isConnected);
```

### 2. Test with Sample Queries
```typescript
// Test different types of queries
const queries = [
  "What's the best time to sow rice?",
  "Current market price of wheat?",
  "How to control aphids in cotton?",
  "Which government schemes am I eligible for?"
];
```

### 3. Test Multilingual Support
```typescript
// Test in different languages
const context = { userProfile: { language: 'hi' } };
const response = await geminiAI.getAIResponse("धान की खेती कैसे करें?", context);
```

## Error Handling

The system includes comprehensive error handling:

1. **API Failures**: Falls back to local responses
2. **Network Issues**: Provides offline guidance
3. **Invalid Queries**: Guides users to ask better questions
4. **Rate Limiting**: Queues requests and provides feedback

## Performance Optimization

### 1. Response Caching
- Cache common responses locally
- Store user context for session reuse
- Minimize API calls for repeated queries

### 2. Context Management
- Load user data once per session
- Update context only when necessary
- Batch context updates

### 3. Background Processing
- Pre-load user context on app start
- Background refresh of weather and market data
- Async processing of long-running queries

## Security Considerations

1. **API Key Protection**: Never expose in client code
2. **User Data Privacy**: Encrypt stored farm data
3. **Query Filtering**: Validate inputs before sending to AI
4. **Rate Limiting**: Implement usage limits per user

## Monitoring and Analytics

Track these metrics:
- AI response accuracy and user satisfaction
- Query types and frequency
- Response times and error rates
- Cost per query and monthly usage
- User engagement with AI features

## Next Steps

1. **Test thoroughly** with your API key
2. **Monitor usage costs** on Google AI Studio
3. **Gather user feedback** on response quality
4. **Iterate on prompts** based on user needs
5. **Expand features** like image analysis for pest detection

## Troubleshooting

### Common Issues

1. **"API Key not found"**
   - Ensure `.env` file is in project root
   - Check API key is valid and active
   - Verify environment loading configuration

2. **"Network error"**
   - Check internet connectivity
   - Verify firewall settings
   - Test with fallback responses

3. **"Response not helpful"**
   - Review prompt templates in `data/ai-prompts.ts`
   - Add more context to user queries
   - Adjust system prompts for better results

4. **"High API costs"**
   - Enable thinking budget limit (set to 0)
   - Implement response caching
   - Use fallback responses for common queries

## Support

For technical issues:
1. Check Google AI Studio documentation
2. Review Gemini API status page
3. Test with minimal examples first
4. Monitor API usage in Google Cloud Console

The integration is now complete and ready for testing with your Gemini API key!