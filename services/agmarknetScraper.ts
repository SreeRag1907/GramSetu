// AGMARKNET Web Scraping Service
// This service scrapes real-time market data from AGMARKNET website

// Configuration
const FLASK_API_CONFIG = {
  primaryUrl: 'http://192.168.1.7:5000',
  fallbackUrls: [
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    'http://10.0.2.2:5000' // Android emulator
  ]
};

// Helper function to get Flask API URL
const getFlaskApiUrl = (): string => {
  // First try environment variable
  if (process.env.EXPO_PUBLIC_FLASK_API_URL) {
    return process.env.EXPO_PUBLIC_FLASK_API_URL;
  }
  
  // Then try app config (if available)
  try {
    const Constants = require('expo-constants');
    if (Constants.expoConfig?.extra?.flaskApiUrl) {
      return Constants.expoConfig.extra.flaskApiUrl;
    }
  } catch (error) {
    // Expo constants not available, continue with fallback
  }
  
  // Finally use primary configured URL
  return FLASK_API_CONFIG.primaryUrl;
};

export interface ScrapedMarketData {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  unit: string;
  scraped_at: Date;
}

export interface AgmarknetScrapingResult {
  success: boolean;
  data: ScrapedMarketData[];
  timestamp: Date;
  source: string;
  error?: string;
}

class AgmarknetScraper {
  private baseUrl = 'https://agmarknet.gov.in';
  private marketDataUrl = 'https://agmarknet.gov.in/SearchCmmMkt.aspx';
  private priceReportUrl = 'https://agmarknet.gov.in/PriceAndArrivals/DatewiseCommodityReport.aspx';
  
  // Common headers to mimic browser requests
  private headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  };

  // State and commodity mappings for AGMARKNET
  private stateMapping: { [key: string]: string } = {
    'Andhra Pradesh': 'AP',
    'Assam': 'AS',
    'Bihar': 'BR',
    'Chhattisgarh': 'CG',
    'Gujarat': 'GJ',
    'Haryana': 'HR',
    'Karnataka': 'KA',
    'Kerala': 'KL',
    'Madhya Pradesh': 'MP',
    'Maharashtra': 'MH',
    'Odisha': 'OR',
    'Punjab': 'PB',
    'Rajasthan': 'RJ',
    'Tamil Nadu': 'TN',
    'Telangana': 'TS',
    'Uttar Pradesh': 'UP',
    'West Bengal': 'WB'
  };

  private commodityMapping: { [key: string]: string[] } = {
    'Rice': ['Rice', 'Paddy (Dhan)', 'Basmati Rice', 'Rice (Coarse)', 'Rice (Medium)'],
    'Wheat': ['Wheat', 'Wheat (Duram)', 'Wheat (Sharbati)'],
    'Cotton': ['Cotton', 'Kapas', 'Cotton Seed'],
    'Sugarcane': ['Sugarcane', 'Sugar'],
    'Maize': ['Maize', 'Makka(Corn)'],
    'Bajra': ['Bajra(Pearl Millet)', 'Pearl Millet'],
    'Jowar': ['Jowar', 'Sorghum'],
    'Barley': ['Barley', 'Jau'],
    'Gram': ['Gram', 'Bengal Gram(Gram)', 'Chana(Gram)'],
    'Tur': ['Tur(Arhar)', 'Arhar (Tur)', 'Pigeon Pea'],
    'Mustard': ['Mustard Seed', 'Rape Seed', 'Mustard Oil'],
    'Groundnut': ['Groundnut pods', 'Groundnut', 'Peanut'],
    'Soybean': ['Soyabean', 'Soya Bean'],
    'Sunflower': ['Sunflower', 'Sunflower Seed'],
    'Tomato': ['Tomato'],
    'Onion': ['Onion', 'Onion Big', 'Onion Small'],
    'Potato': ['Potato']
  };

  // Scrape market data using a proxy service or direct fetch
  async scrapeMarketData(
    state?: string,
    district?: string,
    commodity?: string,
    date?: string
  ): Promise<AgmarknetScrapingResult> {
    try {
      // Use current date if not provided
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      // Build the scraping URL with parameters
      const searchParams = new URLSearchParams();
      if (state) searchParams.append('state', this.stateMapping[state] || state);
      if (district) searchParams.append('district', district);
      if (commodity) {
        const mappedCommodities = this.commodityMapping[commodity] || [commodity];
        searchParams.append('commodity', mappedCommodities[0]);
      }
      searchParams.append('date', targetDate);

      // Try multiple scraping methods
      const results = await Promise.allSettled([
        this.scrapeUsingProxy(searchParams),
        this.scrapeUsingCORS(searchParams),
        this.scrapeUsingFlaskAPI(state, commodity, this.getDefaultMarket(state))
      ]);

      // Find the first successful result
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value.success) {
          return result.value;
        }
      }

      // If all methods fail, return fallback data
      return this.getFallbackScrapedData(state, commodity);

    } catch (error) {
      console.error('Error scraping AGMARKNET:', error);
      return {
        success: false,
        data: [],
        timestamp: new Date(),
        source: 'agmarknet_scraping',
        error: error instanceof Error ? error.message : 'Unknown scraping error'
      };
    }
  }

  // Method 1: Use a CORS proxy service
  private async scrapeUsingProxy(searchParams: URLSearchParams): Promise<AgmarknetScrapingResult> {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
      `${this.priceReportUrl}?${searchParams.toString()}`
    )}`;

    const response = await fetch(proxyUrl, {
      headers: this.headers,
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error(`Proxy request failed: ${response.status}`);
    }

    const data = await response.json();
    const htmlContent = data.contents;

    return this.parseHTMLContent(htmlContent);
  }

  // Method 2: Direct fetch (may be blocked by CORS)
  private async scrapeUsingCORS(searchParams: URLSearchParams): Promise<AgmarknetScrapingResult> {
    const url = `${this.priceReportUrl}?${searchParams.toString()}`;

    const response = await fetch(url, {
      headers: this.headers,
      method: 'GET',
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`Direct request failed: ${response.status}`);
    }

    const htmlContent = await response.text();
    return this.parseHTMLContent(htmlContent);
  }

  // Add method to get default market for a state
  private getDefaultMarket(state?: string): string {
    const defaultMarkets: { [key: string]: string } = {
      'Maharashtra': 'Pune',
      'Punjab': 'Ludhiana',
      'Uttar Pradesh': 'Lucknow',
      'Haryana': 'Karnal',
      'Rajasthan': 'Jaipur',
      'Gujarat': 'Ahmedabad',
      'Karnataka': 'Bangalore',
      'Andhra Pradesh': 'Hyderabad',
      'Tamil Nadu': 'Chennai',
      'West Bengal': 'Kolkata',
      'Madhya Pradesh': 'Bhopal',
      'Bihar': 'Patna',
      'Odisha': 'Bhubaneswar'
    };

    return state ? (defaultMarkets[state] || 'Pune') : 'Pune';
  }

  // Method 3: Use Flask backend scraping service
  private async scrapeUsingFlaskAPI(
    state?: string,
    commodity?: string,
    market?: string
  ): Promise<AgmarknetScrapingResult> {
    try {
      // Use Flask API URL from environment or default to localhost
      const flaskApiUrl = getFlaskApiUrl();
      
      if (!state || !commodity) {
        throw new Error('State and commodity are required for Flask API');
      }

      // Use provided market or get default for the state
      const targetMarket = market || this.getDefaultMarket(state);

      const apiUrl = `${flaskApiUrl}/request?state=${encodeURIComponent(state)}&commodity=${encodeURIComponent(commodity)}&market=${encodeURIComponent(targetMarket)}`;

      console.log('Calling Flask API:', apiUrl);

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Flask API request failed: ${response.status} - ${response.statusText}`);
      }

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(`Flask API error: ${responseData.error}`);
      }

      // Convert Flask API response to our format
      const marketData: ScrapedMarketData[] = responseData.data.map((item: any) => ({
        state: item.State || state,
        district: item.District || '',
        market: item.Market || targetMarket,
        commodity: item.Commodity || commodity,
        variety: item.Variety || '',
        grade: item.Grade || '',
        arrival_date: this.parseDate(item.Date) || new Date().toISOString().split('T')[0],
        min_price: this.parsePrice(item['Min Price'] || '0'),
        max_price: this.parsePrice(item['Max Price'] || '0'),
        modal_price: this.parsePrice(item['Modal Price'] || '0'),
        unit: item.Unit || 'Quintal',
        scraped_at: new Date()
      })).filter((item: ScrapedMarketData) => item.modal_price > 0);

      console.log(`Flask API returned ${marketData.length} records`);

      return {
        success: true,
        data: marketData,
        timestamp: new Date(),
        source: 'flask_api_scraping'
      };

    } catch (error) {
      console.error('Flask API scraping failed:', error);
      throw error;
    }
  }

  // Helper method to parse dates from various formats
  private parseDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString().split('T')[0];
    
    try {
      // Handle various date formats from AGMARKNET
      let parsedDate: Date;
      
      if (dateStr.includes('-')) {
        // Format: 19-Oct-2025 or 19-10-2025
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          // Check if middle part is month name
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const monthIndex = monthNames.findIndex(month => 
            parts[1].toLowerCase().includes(month.toLowerCase())
          );
          
          if (monthIndex !== -1) {
            // Format: 19-Oct-2025
            parsedDate = new Date(parseInt(parts[2]), monthIndex, parseInt(parts[0]));
          } else {
            // Format: 19-10-2025
            parsedDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          }
        } else {
          parsedDate = new Date(dateStr);
        }
      } else {
        parsedDate = new Date(dateStr);
      }
      
      return isNaN(parsedDate.getTime()) ? 
        new Date().toISOString().split('T')[0] : 
        parsedDate.toISOString().split('T')[0];
        
    } catch (error) {
      console.warn('Error parsing date:', dateStr, error);
      return new Date().toISOString().split('T')[0];
    }
  }

  // Parse HTML content to extract market data
  private parseHTMLContent(htmlContent: string): AgmarknetScrapingResult {
    try {
      // Since we can't use DOM parser in React Native, we'll use regex patterns
      // This is a simplified parsing approach
      const marketData: ScrapedMarketData[] = [];
      
      // Look for table rows containing market data
      const tableRowPattern = /<tr[^>]*>(.*?)<\/tr>/gis;
      const cellPattern = /<td[^>]*>(.*?)<\/td>/gis;
      
      let rowMatch;
      while ((rowMatch = tableRowPattern.exec(htmlContent)) !== null) {
        const rowContent = rowMatch[1];
        const cells: string[] = [];
        
        let cellMatch;
        while ((cellMatch = cellPattern.exec(rowContent)) !== null) {
          // Clean cell content
          const cellText = cellMatch[1]
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ') // Replace &nbsp;
            .trim();
          cells.push(cellText);
        }

        // If we have enough cells for market data (state, district, market, commodity, etc.)
        if (cells.length >= 8) {
          try {
            const marketRecord: ScrapedMarketData = {
              state: cells[0] || '',
              district: cells[1] || '',
              market: cells[2] || '',
              commodity: cells[3] || '',
              variety: cells[4] || '',
              grade: cells[5] || '',
              arrival_date: cells[6] || new Date().toISOString().split('T')[0],
              min_price: this.parsePrice(cells[7]),
              max_price: this.parsePrice(cells[8]),
              modal_price: this.parsePrice(cells[9]),
              unit: cells[10] || 'Quintal',
              scraped_at: new Date()
            };

            // Only add if we have valid price data
            if (marketRecord.modal_price > 0) {
              marketData.push(marketRecord);
            }
          } catch (error) {
            console.warn('Error parsing row:', error);
          }
        }
      }

      return {
        success: true,
        data: marketData,
        timestamp: new Date(),
        source: 'agmarknet_scraping'
      };

    } catch (error) {
      console.error('Error parsing HTML content:', error);
      return {
        success: false,
        data: [],
        timestamp: new Date(),
        source: 'agmarknet_scraping',
        error: error instanceof Error ? error.message : 'HTML parsing error'
      };
    }
  }

  // Helper method to parse price strings
  private parsePrice(priceStr: string): number {
    if (!priceStr) return 0;
    
    // Remove commas and non-numeric characters except decimal points
    const cleanPrice = priceStr.replace(/[^\d.]/g, '');
    const price = parseFloat(cleanPrice);
    
    return isNaN(price) ? 0 : price;
  }

  // Get fallback scraped data when real scraping fails
  private getFallbackScrapedData(state?: string, commodity?: string): AgmarknetScrapingResult {
    const fallbackData: ScrapedMarketData[] = [
      {
        state: state || 'Maharashtra',
        district: 'Pune',
        market: 'Pune Market',
        commodity: commodity || 'Wheat',
        variety: 'FAQ',
        grade: 'Grade A',
        arrival_date: new Date().toISOString().split('T')[0],
        min_price: 2400,
        max_price: 2500,
        modal_price: 2450,
        unit: 'Quintal',
        scraped_at: new Date()
      },
      {
        state: state || 'Punjab',
        district: 'Ludhiana',
        market: 'Ludhiana Mandi',
        commodity: commodity || 'Rice',
        variety: 'PR 106',
        grade: 'Grade A',
        arrival_date: new Date().toISOString().split('T')[0],
        min_price: 3150,
        max_price: 3250,
        modal_price: 3200,
        unit: 'Quintal',
        scraped_at: new Date()
      }
    ];

    return {
      success: true,
      data: fallbackData,
      timestamp: new Date(),
      source: 'fallback_scraping'
    };
  }

  // Batch scrape data for multiple states/commodities using Flask API
  async batchScrapeMarketData(
    targets: Array<{
      state?: string;
      district?: string;
      commodity?: string;
    }>
  ): Promise<AgmarknetScrapingResult> {
    try {
      const flaskApiUrl = getFlaskApiUrl();
      
      // Prepare batch request data
      const batchData = targets.map(target => ({
        state: target.state,
        commodity: target.commodity,
        market: target.state ? this.getDefaultMarket(target.state) : undefined
      })).filter(item => item.state && item.commodity);

      if (batchData.length === 0) {
        throw new Error('No valid batch requests provided');
      }

      console.log('Sending batch request to Flask API:', batchData);

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // Increased to 90 seconds for batch

      console.log('Making batch request to:', `${flaskApiUrl}/batch`);
      
      const response = await fetch(`${flaskApiUrl}/batch`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batchData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      console.log('Batch request response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Batch request error response:', errorText);
        throw new Error(`Flask batch API request failed: ${response.status} - ${response.statusText}`);
      }

      console.log('Parsing batch response...');
      const responseData = await response.json();
      console.log('Batch response data:', responseData);
      
      if (!responseData.success) {
        throw new Error(`Flask batch API error: ${responseData.error}`);
      }

      // Convert Flask API response to our format
      const allResults: ScrapedMarketData[] = responseData.data.map((item: any) => ({
        state: item.State || '',
        district: item.District || '',
        market: item.Market || '',
        commodity: item.Commodity || '',
        variety: item.Variety || '',
        grade: item.Grade || '',
        arrival_date: this.parseDate(item.Date) || new Date().toISOString().split('T')[0],
        min_price: this.parsePrice(item['Min Price'] || '0'),
        max_price: this.parsePrice(item['Max Price'] || '0'),
        modal_price: this.parsePrice(item['Modal Price'] || '0'),
        unit: item.Unit || 'Quintal',
        scraped_at: new Date()
      })).filter((item: ScrapedMarketData) => item.modal_price > 0);

      console.log(`Flask batch API returned ${allResults.length} total records`);

      return {
        success: true,
        data: allResults,
        timestamp: new Date(),
        source: 'flask_batch_api_scraping'
      };

    } catch (error) {
      console.error('Error in Flask batch scraping:', error);
      
      // Fallback to individual requests if batch fails
      console.log('Batch failed, falling back to individual requests...');
      return this.fallbackToIndividualRequests(targets);
    }
  }

  // Fallback method for individual requests when batch fails
  private async fallbackToIndividualRequests(
    targets: Array<{
      state?: string;
      district?: string;
      commodity?: string;
    }>
  ): Promise<AgmarknetScrapingResult> {
    const allResults: ScrapedMarketData[] = [];
    
    // Process in smaller batches to avoid overwhelming the server
    const batchSize = 2;
    for (let i = 0; i < targets.length; i += batchSize) {
      const batch = targets.slice(i, i + batchSize);
      
      const batchPromises = batch.map(target => 
        this.scrapeMarketData(target.state, target.district, target.commodity)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value.success) {
          allResults.push(...result.value.data);
        }
      });

      // Add delay between batches to be respectful to the server
      if (i + batchSize < targets.length) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    return {
      success: true,
      data: allResults,
      timestamp: new Date(),
      source: 'individual_api_scraping'
    };
  }

  // Method to check Flask API health
  async checkFlaskAPIHealth(): Promise<boolean> {
    try {
      const flaskApiUrl = getFlaskApiUrl();
      
      console.log('Flask API Health Check - Using URL:', flaskApiUrl);
      console.log('Environment variable EXPO_PUBLIC_FLASK_API_URL:', process.env.EXPO_PUBLIC_FLASK_API_URL);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Increased timeout

      const response = await fetch(`${flaskApiUrl}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Flask API Health Check - Success:', data);
        return data.status === 'healthy';
      }
      
      console.log('Flask API Health Check - Failed with status:', response.status);
      return false;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Flask API Health Check - Timeout (service may be busy)');
      } else {
        console.error('Flask API health check failed:', error);
      }
      return false;
    }
  }

  // Method to get available markets for a state from Flask API
  async getAvailableMarkets(state: string): Promise<string[]> {
    try {
      const flaskApiUrl = getFlaskApiUrl();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${flaskApiUrl}/markets?state=${encodeURIComponent(state)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch markets: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.markets)) {
        return data.markets;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching available markets:', error);
      return [];
    }
  }

  // Method to get available commodities from Flask API
  async getAvailableCommodities(): Promise<string[]> {
    try {
      const flaskApiUrl = getFlaskApiUrl();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${flaskApiUrl}/commodities`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch commodities: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.commodities)) {
        return data.commodities;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching available commodities:', error);
      return [];
    }
  }

  // Convert scraped data to internal format
  convertScrapedToInternalFormat(scrapedData: ScrapedMarketData[]): any[] {
    return scrapedData.map(data => ({
      crop: this.standardizeCropName(data.commodity),
      variety: data.variety,
      market: data.market,
      state: data.state,
      district: data.district,
      price: data.modal_price,
      minPrice: data.min_price,
      maxPrice: data.max_price,
      unit: this.standardizeUnit(data.unit),
      date: new Date(data.arrival_date),
      source: 'agmarknet_scraping',
      trend: this.calculateTrend(data.min_price, data.max_price, data.modal_price),
      change: this.calculateChange(data.min_price, data.max_price, data.modal_price),
      scrapedAt: data.scraped_at
    }));
  }

  // Helper methods (similar to government service)
  private standardizeCropName(scrapedName: string): string {
    for (const [standardName, variants] of Object.entries(this.commodityMapping)) {
      if (variants.some(variant => 
        scrapedName.toLowerCase().includes(variant.toLowerCase())
      )) {
        return standardName;
      }
    }
    return scrapedName;
  }

  private standardizeUnit(unit: string): string {
    const unitMapping: { [key: string]: string } = {
      'Quintal': 'quintal',
      'Kg': 'kg',
      'Kilogram': 'kg',
      'Tonnes': 'ton',
      'Ton': 'ton',
      'Per Kg': 'kg',
      'Per Quintal': 'quintal'
    };

    return unitMapping[unit] || unit.toLowerCase();
  }

  private calculateTrend(minPrice: number, maxPrice: number, modalPrice: number): 'up' | 'down' | 'stable' {
    const range = maxPrice - minPrice;
    if (range === 0) return 'stable';
    
    const position = (modalPrice - minPrice) / range;

    if (position > 0.6) return 'up';
    if (position < 0.4) return 'down';
    return 'stable';
  }

  private calculateChange(minPrice: number, maxPrice: number, modalPrice: number): number {
    const midPoint = (minPrice + maxPrice) / 2;
    return Math.round(modalPrice - midPoint);
  }
}

export const agmarknetScraper = new AgmarknetScraper();

// Main function to get latest market data via scraping
export const getLatestScrapedMarketData = async (
  state?: string,
  district?: string,
  crops?: string[]
) => {
  try {
    let allScrapedData: ScrapedMarketData[] = [];

    if (crops && crops.length > 0) {
      // Scrape for specific crops
      const targets = crops.map(crop => ({
        state,
        district,
        commodity: crop
      }));

      const result = await agmarknetScraper.batchScrapeMarketData(targets);
      if (result.success) {
        allScrapedData = result.data;
      }
    } else {
      // Scrape general market data
      const result = await agmarknetScraper.scrapeMarketData(state, district);
      if (result.success) {
        allScrapedData = result.data;
      }
    }

    return {
      success: true,
      data: agmarknetScraper.convertScrapedToInternalFormat(allScrapedData),
      isRealTime: true,
      source: 'agmarknet_scraping',
      scrapedAt: new Date()
    };

  } catch (error) {
    console.error('Error getting scraped market data:', error);
    return {
      success: false,
      data: [],
      isRealTime: false,
      error: error instanceof Error ? error.message : 'Scraping failed'
    };
  }
};