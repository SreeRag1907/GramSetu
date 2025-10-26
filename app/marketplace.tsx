import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useI18n } from '../i18n/useI18n';
import {
  createProductListing,
  getActiveListings,
  getSellerListings,
  ProductListing,
  expressInterest,
  incrementViews,
} from '../services/marketplaceService';
import { getLatestScrapedMarketData, agmarknetScraper } from '../services/agmarknetScraper';
import { testFlaskConnection, testEnvironmentVariables, getNetworkInfo } from '../services/networkTest';

const Marketplace = () => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'sell' | 'prices' | 'buy'>('sell');
  const [showListingModal, setShowListingModal] = useState(false);
  const [listings, setListings] = useState<ProductListing[]>([]);
  const [userListings, setUserListings] = useState<ProductListing[]>([]);
  const [scrapedPrices, setScrapedPrices] = useState<any[]>([]);
  const [isScrapingAvailable, setIsScrapingAvailable] = useState(false);
  const [userLocation, setUserLocation] = useState('');
  const [userState, setUserState] = useState('');
  const [userDistrict, setUserDistrict] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');

  const [newListing, setNewListing] = useState({
    crop: '',
    quantity: '',
    pricePerUnit: '',
    unit: 'quintal',
    negotiable: false,
    quality: 'Good' as 'Premium' | 'Good' | 'Average',
    description: '',
  });

  const commonCrops = [
    'Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Maize', 'Bajra', 'Jowar',
    'Barley', 'Gram', 'Tur', 'Mustard', 'Groundnut', 'Soybean', 'Tomato', 'Onion', 'Potato'
  ];

  const units = ['quintal', 'kg', 'ton', 'bag', 'piece'];
  const qualities = ['Premium', 'Good', 'Average'];

  // Utility functions
  const getTrendIcon = (trend: string): string => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'up': return '#4CAF50';
      case 'down': return '#F44336';
      default: return '#FF9800';
    }
  };

  useEffect(() => {
    loadUserData();
    loadMarketData();
  }, []);

  const loadUserData = async () => {
    try {
      const state = await AsyncStorage.getItem('userState');
      const district = await AsyncStorage.getItem('userDistrict');
      const phone = await AsyncStorage.getItem('userPhone');
      const name = await AsyncStorage.getItem('userName');
      
      if (state && district) {
        setUserLocation(`${state}, ${district}`);
        setUserState(state);
        setUserDistrict(district);
      }
      if (phone) setUserPhone(phone);
      if (name) setUserName(name);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadMarketData = async () => {
    setLoading(true);
    try {
      // Debug network information
      console.log('🔍 Starting network diagnostics...');
      testEnvironmentVariables();
      getNetworkInfo();
      
      // Test Flask connection with multiple URLs
      const connectionTest = await testFlaskConnection();
      
      // Check if Flask scraping API is available
      const scrapingHealthy = await agmarknetScraper.checkFlaskAPIHealth();
      setIsScrapingAvailable(scrapingHealthy);
      
      let scrapedData: any[] = [];

      // Load scraped prices if Flask API is available
      if (scrapingHealthy) {
        try {
          console.log('Loading scraped market data...');
          console.log('User State:', userState, 'User District:', userDistrict);
          
          // Use default values if user location is not available
          const targetState = userState || 'Maharashtra';
          const targetDistrict = userDistrict || 'Pune';
          
          console.log('Using State:', targetState, 'District:', targetDistrict);
          
          const scrapedResult = await getLatestScrapedMarketData(targetState, targetDistrict, [
            'Wheat', 'Rice', 'Sugarcane', 'Cotton', 'Maize', 'Tomato', 'Onion', 'Potato'
          ]);
          
          if (scrapedResult.success && scrapedResult.data.length > 0) {
            console.log('Scraped data loaded:', scrapedResult.data.length, 'records');
            
            // Add scraped prices with a special source identifier
            scrapedData = scrapedResult.data.map((price: any) => ({
              ...price,
              source: 'AGMARKNET (Real-time)',
              isRealTime: true,
              scrapedAt: scrapedResult.scrapedAt
            }));
            
            setScrapedPrices(scrapedData);
          } else {
            console.log('No scraped data available');
            setScrapedPrices([]);
          }
        } catch (scrapingError) {
          console.error('Error loading scraped data:', scrapingError);
          setScrapedPrices([]);
        }
      } else {
        console.log('Flask scraping API not available');
        setScrapedPrices([]);
      }

      // Load marketplace listings
      const listingsResult = await getActiveListings({
        state: userState,
        limit: 50
      });
      if (listingsResult.success && listingsResult.data) {
        setListings(listingsResult.data);
      }

      // Load user's own listings
      if (userPhone) {
        const userListingsResult = await getSellerListings(userPhone);
        if (userListingsResult.success && userListingsResult.data) {
          setUserListings(userListingsResult.data);
        }
      }
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMarketData();
    setRefreshing(false);
  };

  const handleListProduce = async () => {
    if (!newListing.crop || !newListing.quantity || !newListing.pricePerUnit) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const listingData: Omit<ProductListing, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'interested'> = {
        sellerId: userPhone,
        sellerName: userName,
        sellerLocation: userLocation,
        sellerState: userState,
        sellerDistrict: userDistrict,
        sellerPhone: userPhone,
        crop: newListing.crop,
        quantity: parseInt(newListing.quantity),
        unit: newListing.unit,
        pricePerUnit: parseInt(newListing.pricePerUnit),
        totalPrice: parseInt(newListing.quantity) * parseInt(newListing.pricePerUnit),
        negotiable: newListing.negotiable,
        description: newListing.description,
        quality: newListing.quality,
        isActive: true,
      };

      const result = await createProductListing(listingData);
      
      if (result.success) {
        setShowListingModal(false);
        setNewListing({
          crop: '',
          quantity: '',
          pricePerUnit: '',
          unit: 'quintal',
          negotiable: false,
          quality: 'Good',
          description: '',
        });
        
        Alert.alert('Success', 'Your produce has been listed successfully!');
        loadMarketData(); // Refresh data
      } else {
        Alert.alert('Error', result.error || 'Failed to list produce');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to list produce. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExpressInterest = async (listingId: string) => {
    try {
      await expressInterest(listingId, userPhone);
      Alert.alert('Interest Expressed', 'The seller will be notified of your interest.');
    } catch (error) {
      Alert.alert('Error', 'Failed to express interest. Please try again.');
    }
  };

  const handleViewListing = async (listingId: string) => {
    try {
      await incrementViews(listingId);
    } catch (error) {
      console.log('Failed to increment views:', error);
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = !searchQuery || 
      listing.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.sellerLocation.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCrop = !selectedCrop || listing.crop === selectedCrop;
    
    return matchesSearch && matchesCrop && listing.sellerId !== userPhone;
  });

  const filteredPrices = scrapedPrices.filter((price: any) => {
    const matchesSearch = !searchQuery || 
      price.crop.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCrop = !selectedCrop || price.crop === selectedCrop;
    
    return matchesSearch && matchesCrop;
  });



  const renderSellTab = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity
        style={styles.listProduceButton}
        onPress={() => setShowListingModal(true)}
      >
        <Text style={styles.listProduceIcon}>📦</Text>
        <View>
          <Text style={styles.listProduceTitle}>List Your Produce</Text>
          <Text style={styles.listProduceSubtitle}>Connect with buyers in your area</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Your Active Listings</Text>
      {userListings.filter(listing => listing.isActive).length > 0 ? (
        userListings.filter(listing => listing.isActive).map((listing) => (
          <View key={listing.id} style={styles.listingCard}>
            <View style={styles.listingHeader}>
              <Text style={styles.cropName}>{listing.crop}</Text>
              <Text style={[styles.priceText, { color: '#4CAF50' }]}>
                ₹{listing.pricePerUnit}/{listing.unit}
              </Text>
            </View>
            <Text style={styles.quantityText}>{listing.quantity} {listing.unit}</Text>
            <Text style={styles.qualityText}>Quality: {listing.quality}</Text>
            <Text style={styles.dateText}>Listed on {new Date(listing.createdAt).toLocaleDateString()}</Text>
            {listing.negotiable && (
              <Text style={styles.negotiableText}>💬 Price negotiable</Text>
            )}
            <Text style={styles.viewsText}>👁️ {listing.views} views</Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No active listings</Text>
          <Text style={styles.emptySubtitle}>Tap "List Your Produce" to start selling</Text>
        </View>
      )}
    </View>
  );

  const renderPricesTab = () => (
    <View style={styles.tabContent}>
      {/* Status indicator for scraping service */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {isScrapingAvailable ? '🟢 Real-time prices from AGMARKNET' : '🔴 Scraping service unavailable'}
        </Text>
        {!isScrapingAvailable && (
          <Text style={styles.statusSubtext}>
            Make sure Flask scraping service is running on port 5000
          </Text>
        )}
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search crops..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, !selectedCrop && styles.selectedFilterChip]}
          onPress={() => setSelectedCrop('')}
        >
          <Text style={[styles.filterChipText, !selectedCrop && styles.selectedFilterChipText]}>
            All Crops
          </Text>
        </TouchableOpacity>
        {commonCrops.map((crop) => (
          <TouchableOpacity
            key={crop}
            style={[styles.filterChip, selectedCrop === crop && styles.selectedFilterChip]}
            onPress={() => setSelectedCrop(crop)}
          >
            <Text style={[styles.filterChipText, selectedCrop === crop && styles.selectedFilterChipText]}>
              {crop}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>
        {isScrapingAvailable ? 'Real-time Market Prices' : 'Market Prices'}
      </Text>
      
      {filteredPrices.length > 0 ? (
        filteredPrices.map((price: any, index: number) => (
          <View key={index} style={styles.priceCard}>
            <View style={styles.priceHeader}>
              <Text style={styles.cropName}>{price.crop}</Text>
              <View style={styles.trendContainer}>
                <Text style={styles.trendIcon}>{getTrendIcon(price.trend)}</Text>
                <Text style={[styles.changeText, { color: getTrendColor(price.trend) }]}>
                  {price.change !== 0 && (price.trend === 'up' ? '+' : '')}₹{price.change}
                </Text>
              </View>
            </View>
            <Text style={styles.marketName}>{price.market}</Text>
            <Text style={styles.currentPrice}>₹{price.price} per {price.unit}</Text>
            {price.source && (
              <Text style={styles.sourceText}>Source: {price.source}</Text>
            )}
            {price.scrapedAt && (
              <Text style={styles.sourceText}>
                Updated: {new Date(price.scrapedAt).toLocaleTimeString()}
              </Text>
            )}
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>
            {isScrapingAvailable ? 'No price data available' : 'Scraping service offline'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {isScrapingAvailable 
              ? 'Try refreshing or check your filters' 
              : 'Start the Flask scraping service to see real-time prices'
            }
          </Text>
        </View>
      )}
    </View>
  );

  const renderBuyTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterChip, !selectedCrop && styles.selectedFilterChip]}
          onPress={() => setSelectedCrop('')}
        >
          <Text style={[styles.filterChipText, !selectedCrop && styles.selectedFilterChipText]}>
            All Crops
          </Text>
        </TouchableOpacity>
        {commonCrops.map((crop) => (
          <TouchableOpacity
            key={crop}
            style={[styles.filterChip, selectedCrop === crop && styles.selectedFilterChip]}
            onPress={() => setSelectedCrop(crop)}
          >
            <Text style={[styles.filterChipText, selectedCrop === crop && styles.selectedFilterChipText]}>
              {crop}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Available Produce</Text>
      {filteredListings.map((listing) => (
        <View key={listing.id} style={styles.buyerListingCard}>
          <View style={styles.listingHeader}>
            <Text style={styles.cropName}>{listing.crop}</Text>
            <Text style={[styles.priceText, { color: '#4CAF50' }]}>
              ₹{listing.pricePerUnit}/{listing.unit}
            </Text>
          </View>
          <Text style={styles.quantityText}>{listing.quantity} {listing.unit} available</Text>
          <Text style={styles.qualityText}>Quality: {listing.quality}</Text>
          {listing.description && (
            <Text style={styles.descriptionText}>{listing.description}</Text>
          )}
          <View style={styles.farmerInfo}>
            <Text style={styles.farmerName}>👨‍🌾 {listing.sellerName}</Text>
            <Text style={styles.locationText}>📍 {listing.sellerLocation}</Text>
          </View>
          {listing.negotiable && (
            <Text style={styles.negotiableText}>💬 Price negotiable</Text>
          )}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => {
                handleViewListing(listing.id!);
                Alert.alert('Contact Farmer', `Call ${listing.sellerName} at ${listing.sellerPhone}`);
              }}
            >
              <Text style={styles.contactButtonText}>📞 Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.interestButton}
              onPress={() => handleExpressInterest(listing.id!)}
            >
              <Text style={styles.interestButtonText}>💝 Interest</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      
      {filteredListings.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>No products found</Text>
          <Text style={styles.emptySubtitle}>Try adjusting your search filters</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('modules.marketplace')}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sell' && styles.activeTab]}
          onPress={() => setActiveTab('sell')}
        >
          <Text style={[styles.tabText, activeTab === 'sell' && styles.activeTabText]}>
            Sell
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'prices' && styles.activeTab]}
          onPress={() => setActiveTab('prices')}
        >
          <Text style={[styles.tabText, activeTab === 'prices' && styles.activeTabText]}>
            Prices
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'buy' && styles.activeTab]}
          onPress={() => setActiveTab('buy')}
        >
          <Text style={[styles.tabText, activeTab === 'buy' && styles.activeTabText]}>
            Buy
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        {activeTab === 'sell' && renderSellTab()}
        {activeTab === 'prices' && renderPricesTab()}
        {activeTab === 'buy' && renderBuyTab()}
      </ScrollView>

      {/* List Produce Modal */}
      <Modal
        visible={showListingModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>List Your Produce</Text>
              <TouchableOpacity onPress={() => setShowListingModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Crop *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {commonCrops.map((crop) => (
                    <TouchableOpacity
                      key={crop}
                      style={[
                        styles.cropChip,
                        newListing.crop === crop && styles.selectedCropChip
                      ]}
                      onPress={() => setNewListing({...newListing, crop})}
                    >
                      <Text style={[
                        styles.cropChipText,
                        newListing.crop === crop && styles.selectedCropChipText
                      ]}>
                        {crop}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quantity *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter quantity"
                  value={newListing.quantity}
                  onChangeText={(text) => setNewListing({...newListing, quantity: text})}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Unit</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {units.map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      style={[
                        styles.unitChip,
                        newListing.unit === unit && styles.selectedUnitChip
                      ]}
                      onPress={() => setNewListing({...newListing, unit})}
                    >
                      <Text style={[
                        styles.unitChipText,
                        newListing.unit === unit && styles.selectedUnitChipText
                      ]}>
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Price per {newListing.unit} (₹) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter price"
                  value={newListing.pricePerUnit}
                  onChangeText={(text) => setNewListing({...newListing, pricePerUnit: text})}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Quality</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {qualities.map((quality) => (
                    <TouchableOpacity
                      key={quality}
                      style={[
                        styles.unitChip,
                        newListing.quality === quality && styles.selectedUnitChip
                      ]}
                      onPress={() => setNewListing({...newListing, quality: quality as any})}
                    >
                      <Text style={[
                        styles.unitChipText,
                        newListing.quality === quality && styles.selectedUnitChipText
                      ]}>
                        {quality}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description (Optional)</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  placeholder="Additional details about your produce..."
                  value={newListing.description}
                  onChangeText={(text) => setNewListing({...newListing, description: text})}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setNewListing({...newListing, negotiable: !newListing.negotiable})}
              >
                <View style={[styles.checkbox, newListing.negotiable && styles.checkedBox]}>
                  {newListing.negotiable && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Price is negotiable</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleListProduce}
              >
                <Text style={styles.submitButtonText}>List Produce</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
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
    backgroundColor: '#4CAF50',
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
  placeholder: {
    width: 24,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#4CAF50',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  listProduceButton: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    elevation: 2,
  },
  listProduceIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  listProduceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  listProduceSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  arrow: {
    fontSize: 20,
    color: '#4CAF50',
    marginLeft: 'auto',
  },
  listingCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
  },
  buyerListingCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  cropName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  negotiableText: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 5,
  },
  farmerInfo: {
    marginVertical: 8,
  },
  farmerName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
  contactButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flex: 1,
    alignItems: 'center',
  },
  contactButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  priceCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  changeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  marketName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  currentPrice: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  cropChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedCropChip: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  cropChipText: {
    color: '#666',
    fontSize: 14,
  },
  selectedCropChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  unitChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedUnitChip: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  unitChipText: {
    color: '#666',
    fontSize: 12,
  },
  selectedUnitChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // New styles for improved marketplace
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  filterContainer: {
    marginBottom: 15,
  },
  filterChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedFilterChip: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterChipText: {
    color: '#666',
    fontSize: 12,
  },
  selectedFilterChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  qualityText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  viewsText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  sourceText: {
    fontSize: 11,
    color: '#888',
    marginTop: 3,
    fontStyle: 'italic',
  },
  descriptionText: {
    fontSize: 13,
    color: '#555',
    marginVertical: 5,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  interestButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flex: 1,
    alignItems: 'center',
  },
  interestButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  statusSubtext: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});

export default Marketplace;
