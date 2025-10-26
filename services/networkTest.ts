// Network Test Utility for GramSetu
// Use this to test Flask API connectivity

export const testFlaskConnection = async () => {
  const testUrls = [
    'http://192.168.1.7:5000/health',
    'http://127.0.0.1:5000/health', 
    'http://localhost:5000/health',
    'http://10.0.2.2:5000/health', // Android emulator
  ];

  console.log('🔍 Testing Flask API connectivity...');
  
  for (const url of testUrls) {
    try {
      console.log(`Testing: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ SUCCESS: ${url} - Status: ${data.status}`);
        return { success: true, url, data };
      } else {
        console.log(`❌ FAILED: ${url} - HTTP ${response.status}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.log(`❌ ERROR: ${url} - ${errorMsg}`);
    }
  }
  
  console.log('🚫 All Flask API tests failed');
  return { success: false, url: null, data: null };
};

// Test environment variables
export const testEnvironmentVariables = () => {
  console.log('🔍 Environment Variables:');
  console.log('EXPO_PUBLIC_FLASK_API_URL:', process.env.EXPO_PUBLIC_FLASK_API_URL);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('EXPO_PUBLIC_DEV_MODE:', process.env.EXPO_PUBLIC_DEV_MODE);
};

// Network debugging information
export const getNetworkInfo = () => {
  const info = {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    platform: typeof navigator !== 'undefined' ? navigator.platform : 'Unknown',
    isExpo: typeof global !== 'undefined' && (global as any).__expo,
    timestamp: new Date().toISOString()
  };
  
  console.log('📱 Network Debug Info:', info);
  return info;
};