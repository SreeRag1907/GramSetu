import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEYS = {
  MARKETPLACE_LISTINGS: 'marketplace_listings',
  MARKETPLACE_PRICES: 'marketplace_prices',
  USER_LISTINGS: 'marketplace_user_listings',
  CACHE_TIMESTAMP: 'marketplace_cache_timestamp',
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheData<T> {
  data: T;
  timestamp: number;
}

export const MarketplaceCache = {
  async setListings(data: any[]) {
    try {
      const cacheData: CacheData<any[]> = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_KEYS.MARKETPLACE_LISTINGS, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching listings:', error);
    }
  },

  async getListings(): Promise<any[] | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.MARKETPLACE_LISTINGS);
      if (!cached) return null;

      const cacheData: CacheData<any[]> = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > CACHE_DURATION;

      if (isExpired) {
        await AsyncStorage.removeItem(CACHE_KEYS.MARKETPLACE_LISTINGS);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Error getting cached listings:', error);
      return null;
    }
  },

  async setPrices(data: any[]) {
    try {
      const cacheData: CacheData<any[]> = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_KEYS.MARKETPLACE_PRICES, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching prices:', error);
    }
  },

  async getPrices(): Promise<any[] | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.MARKETPLACE_PRICES);
      if (!cached) return null;

      const cacheData: CacheData<any[]> = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > CACHE_DURATION;

      if (isExpired) {
        await AsyncStorage.removeItem(CACHE_KEYS.MARKETPLACE_PRICES);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Error getting cached prices:', error);
      return null;
    }
  },

  async setUserListings(data: any[]) {
    try {
      const cacheData: CacheData<any[]> = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(CACHE_KEYS.USER_LISTINGS, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching user listings:', error);
    }
  },

  async getUserListings(): Promise<any[] | null> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.USER_LISTINGS);
      if (!cached) return null;

      const cacheData: CacheData<any[]> = JSON.parse(cached);
      const isExpired = Date.now() - cacheData.timestamp > CACHE_DURATION;

      if (isExpired) {
        await AsyncStorage.removeItem(CACHE_KEYS.USER_LISTINGS);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Error getting cached user listings:', error);
      return null;
    }
  },

  async clearAll() {
    try {
      await AsyncStorage.multiRemove([
        CACHE_KEYS.MARKETPLACE_LISTINGS,
        CACHE_KEYS.MARKETPLACE_PRICES,
        CACHE_KEYS.USER_LISTINGS,
        CACHE_KEYS.CACHE_TIMESTAMP,
      ]);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },
};
