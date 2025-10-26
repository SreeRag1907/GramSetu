// Government API Service for Market Prices
// This service integrates with Indian government APIs and web scraping for real-time market data

import { getLatestScrapedMarketData } from './agmarknetScraper';

export interface ApiMarketPrice {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  unit: string;
}

export interface AgmarknetResponse {
  records: ApiMarketPrice[];
}

// Government APIs for market data
const GOVERNMENT_APIS = {
  // AGMARKNET - National Agriculture Market
  agmarknet: 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070',
  
  // NCDEX (National Commodity & Derivatives Exchange)
  ncdex: 'https://api.ncdex.com/api/marketdata',
  
  // Ministry of Agriculture API
  agriculture: 'https://api.data.gov.in/catalog/agriculture',
  
  // APMC (Agricultural Produce Market Committee) APIs
  apmc: 'https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24'
};

// Crop name mapping for API compatibility
const CROP_MAPPING: { [key: string]: string[] } = {
  'Rice': ['Rice', 'Paddy', 'Basmati Rice', 'Common Rice'],
  'Wheat': ['Wheat', 'Wheat Flour', 'Durum Wheat'],
  'Cotton': ['Cotton', 'Cotton Seed', 'Kapas'],
  'Sugarcane': ['Sugarcane', 'Sugar'],
  'Maize': ['Maize', 'Corn', 'Sweet Corn'],
  'Bajra': ['Bajra', 'Pearl Millet'],
  'Jowar': ['Jowar', 'Sorghum'],
  'Barley': ['Barley'],
  'Gram': ['Gram', 'Chana', 'Bengal Gram'],
  'Tur': ['Tur', 'Arhar', 'Pigeon Pea'],
  'Mustard': ['Mustard Seed', 'Rapeseed'],
  'Groundnut': ['Groundnut', 'Peanut'],
  'Soybean': ['Soybean', 'Soya Bean'],
  'Sunflower': ['Sunflower', 'Sunflower Seed'],
  'Tomato': ['Tomato'],
  'Onion': ['Onion', 'Big Onion', 'Small Onion'],
  'Potato': ['Potato'],
  'Chili': ['Chilli', 'Red Chilli', 'Green Chilli']
};

// State code mapping for APIs
const STATE_CODES: { [key: string]: string } = {
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

class GovernmentPriceService {
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_GOV_API_KEY || '';
  }

  // Fetch market prices from AGMARKNET API
  async fetchAgmarknetPrices(state?: string, district?: string, commodity?: string): Promise<ApiMarketPrice[]> {
    try {
      let url = `${GOVERNMENT_APIS.agmarknet}?api-key=${this.apiKey}&format=json&limit=100`;
      
      // Add filters if provided
      if (state) {
        url += `&filters[state]=${encodeURIComponent(state)}`;
      }
      
      if (district) {
        url += `&filters[district]=${encodeURIComponent(district)}`;
      }
      
      if (commodity) {
        // Try to find matching commodity names
        const mappedCommodities = CROP_MAPPING[commodity] || [commodity];
        url += `&filters[commodity]=${encodeURIComponent(mappedCommodities[0])}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: AgmarknetResponse = await response.json();
      return data.records || [];
    } catch (error) {
      console.error('Error fetching AGMARKNET prices:', error);
      return [];
    }
  }

  // Fetch prices from multiple sources including web scraping
  async fetchComprehensiveMarketPrices(
    state?: string, 
    district?: string, 
    crops?: string[]
  ): Promise<{
    success: boolean;
    data: ApiMarketPrice[];
    sources: string[];
    error?: string;
    isRealTime: boolean;
  }> {
    try {
      const allPrices: ApiMarketPrice[] = [];
      const sources: string[] = [];
      let isRealTime = false;

      // Method 1: Try web scraping first (most up-to-date)
      try {
        console.log('Attempting AGMARKNET web scraping...');
        const scrapingResult = await getLatestScrapedMarketData(state, district, crops);
        
        if (scrapingResult.success && scrapingResult.data.length > 0) {
          // Convert scraped data to API format
          const scrapedPrices = scrapingResult.data.map(price => ({
            state: price.state,
            district: price.district,
            market: price.market,
            commodity: price.crop,
            variety: price.variety || '',
            arrival_date: price.date.toISOString().split('T')[0],
            min_price: price.minPrice || price.price - 50,
            max_price: price.maxPrice || price.price + 50,
            modal_price: price.price,
            unit: price.unit
          }));
          
          allPrices.push(...scrapedPrices);
          sources.push('AGMARKNET_SCRAPING');
          isRealTime = true;
          console.log(`Successfully scraped ${scrapedPrices.length} price records`);
        }
      } catch (error) {
        console.warn('Web scraping failed, trying API methods...', error);
      }

      // Method 2: Try AGMARKNET API if scraping didn't provide enough data
      if (allPrices.length < 5) {
        try {
          const agmarknetPrices = await this.fetchAgmarknetPrices(state, district);
          if (agmarknetPrices.length > 0) {
            allPrices.push(...agmarknetPrices);
            sources.push('AGMARKNET_API');
            isRealTime = true;
          }
        } catch (error) {
          console.warn('AGMARKNET API failed:', error);
        }
      }

      // If specific crops requested, filter for those
      if (crops && crops.length > 0) {
        const filteredPrices = allPrices.filter(price => {
          return crops.some(crop => {
            const mappedNames = CROP_MAPPING[crop] || [crop];
            return mappedNames.some(name => 
              price.commodity.toLowerCase().includes(name.toLowerCase())
            );
          });
        });
        
        return {
          success: true,
          data: filteredPrices,
          sources,
          isRealTime
        };
      }

      return {
        success: true,
        data: allPrices,
        sources,
        isRealTime
      };
    } catch (error) {
      console.error('Error fetching comprehensive market prices:', error);
      return {
        success: false,
        data: [],
        sources: [],
        isRealTime: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Convert API data to our internal format
  convertToInternalFormat(apiPrices: ApiMarketPrice[]): any[] {
    return apiPrices.map(price => ({
      crop: this.standardizeCropName(price.commodity),
      variety: price.variety,
      market: price.market,
      state: price.state,
      district: price.district,
      price: price.modal_price,
      minPrice: price.min_price,
      maxPrice: price.max_price,
      unit: this.standardizeUnit(price.unit),
      date: new Date(price.arrival_date),
      source: 'government',
      trend: this.calculateTrend(price.min_price, price.max_price, price.modal_price),
      change: this.calculateChange(price.min_price, price.max_price, price.modal_price)
    }));
  }

  // Helper method to standardize crop names
  private standardizeCropName(apiCropName: string): string {
    for (const [standardName, variants] of Object.entries(CROP_MAPPING)) {
      if (variants.some(variant => 
        apiCropName.toLowerCase().includes(variant.toLowerCase())
      )) {
        return standardName;
      }
    }
    return apiCropName;
  }

  // Helper method to standardize units
  private standardizeUnit(apiUnit: string): string {
    const unitMapping: { [key: string]: string } = {
      'Quintal': 'quintal',
      'Kg': 'kg',
      'Kilogram': 'kg',
      'Tonnes': 'ton',
      'Ton': 'ton',
      'Piece': 'piece',
      'Per Piece': 'piece'
    };

    return unitMapping[apiUnit] || apiUnit.toLowerCase();
  }

  // Calculate trend based on price range
  private calculateTrend(minPrice: number, maxPrice: number, modalPrice: number): 'up' | 'down' | 'stable' {
    const range = maxPrice - minPrice;
    const position = (modalPrice - minPrice) / range;

    if (position > 0.6) return 'up';
    if (position < 0.4) return 'down';
    return 'stable';
  }

  // Calculate change amount
  private calculateChange(minPrice: number, maxPrice: number, modalPrice: number): number {
    const midPoint = (minPrice + maxPrice) / 2;
    return Math.round(modalPrice - midPoint);
  }

  // Get fallback mock data when APIs are unavailable
  getFallbackPrices(state?: string, crops?: string[]): any[] {
    const mockPrices = [
      { crop: 'Wheat', market: 'Local Mandi', price: 2450, unit: 'quintal', trend: 'up', change: 50, state: state || 'Unknown', district: 'Various' },
      { crop: 'Rice', market: 'APMC', price: 3200, unit: 'quintal', trend: 'down', change: -80, state: state || 'Unknown', district: 'Various' },
      { crop: 'Cotton', market: 'Cotton Market', price: 5800, unit: 'quintal', trend: 'stable', change: 0, state: state || 'Unknown', district: 'Various' },
      { crop: 'Sugarcane', market: 'Sugar Mill', price: 350, unit: 'quintal', trend: 'up', change: 15, state: state || 'Unknown', district: 'Various' },
      { crop: 'Tomato', market: 'Vegetable Market', price: 25, unit: 'kg', trend: 'up', change: 5, state: state || 'Unknown', district: 'Various' },
      { crop: 'Onion', market: 'Wholesale Market', price: 18, unit: 'kg', trend: 'down', change: -3, state: state || 'Unknown', district: 'Various' },
      { crop: 'Potato', market: 'Wholesale Market', price: 15, unit: 'kg', trend: 'stable', change: 0, state: state || 'Unknown', district: 'Various' },
      { crop: 'Maize', market: 'Feed Mill', price: 2100, unit: 'quintal', trend: 'up', change: 25, state: state || 'Unknown', district: 'Various' },
    ];

    if (crops && crops.length > 0) {
      return mockPrices.filter(price => crops.includes(price.crop));
    }

    return mockPrices.map(price => ({
      ...price,
      date: new Date(),
      source: 'estimated'
    }));
  }
}

export const governmentPriceService = new GovernmentPriceService();

// Utility function to fetch market prices with fallback
export const fetchMarketPricesWithFallback = async (
  state?: string,
  district?: string,
  crops?: string[]
) => {
  try {
    // First try government APIs and web scraping
    console.log('Fetching market prices with scraping enabled...');
    const result = await governmentPriceService.fetchComprehensiveMarketPrices(state, district, crops);
    
    if (result.success && result.data.length > 0) {
      return {
        success: true,
        data: governmentPriceService.convertToInternalFormat(result.data),
        sources: result.sources,
        isRealTime: result.isRealTime,
        scrapingEnabled: true
      };
    }
    
    // Fallback to mock data if both APIs and scraping fail
    console.warn('Government APIs and scraping unavailable, using fallback data');
    return {
      success: true,
      data: governmentPriceService.getFallbackPrices(state, crops),
      sources: ['Estimated'],
      isRealTime: false,
      scrapingEnabled: false
    };
  } catch (error) {
    console.error('Error in fetchMarketPricesWithFallback:', error);
    
    // Always provide fallback data
    return {
      success: true,
      data: governmentPriceService.getFallbackPrices(state, crops),
      sources: ['Estimated'],
      isRealTime: false,
      scrapingEnabled: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};