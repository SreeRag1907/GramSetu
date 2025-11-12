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
  updateProductListing,
  deleteProductListing,
  ProductListing,
  expressInterest,
  incrementViews,
} from '../services/marketplaceService';
import { getLatestScrapedMarketData, agmarknetScraper } from '../services/agmarknetScraper';
import { getMaharashtraMockData } from '../data/maharashtra-mock-data';
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
  const [listingLoading, setListingLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [editingListing, setEditingListing] = useState<ProductListing | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Pagination states
  const [buyListingsPage, setBuyListingsPage] = useState(1);
  const [pricesPage, setPricesPage] = useState(1);
  const [hasMoreBuyListings, setHasMoreBuyListings] = useState(true);
  const [hasMorePrices, setHasMorePrices] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 8;

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
    t('marketplace.crops.jowar'),
    t('marketplace.crops.bajra'),
    t('marketplace.crops.maize'),
    t('marketplace.crops.gram'),
    t('marketplace.crops.tur'),
    t('marketplace.crops.cotton'),
    t('marketplace.crops.groundnut'),
    t('marketplace.crops.soyabean'),
    t('marketplace.crops.onion'),
    t('marketplace.crops.potato'),
    t('marketplace.crops.tomato'),
    t('marketplace.crops.chilli'),
    t('marketplace.crops.turmeric'),
    t('marketplace.crops.coriander'),
    t('marketplace.crops.wheat'),
    t('marketplace.crops.rice')
  ];

  const units = [
    t('marketplace.units.quintal'),
    t('marketplace.units.kg'),
    t('marketplace.units.ton'),
    t('marketplace.units.bag'),
    t('marketplace.units.piece')
  ];
  
  const qualities = [
    t('marketplace.qualityLevels.premium'),
    t('marketplace.qualityLevels.good'),
    t('marketplace.qualityLevels.average')
  ];

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

  // Auto-load data when tab changes
  useEffect(() => {
    if (activeTab === 'buy' && listings.length === 0) {
      loadMarketData();
    } else if (activeTab === 'prices' && scrapedPrices.length === 0) {
      loadMarketData();
    } else if (activeTab === 'sell' && userListings.length === 0) {
      loadMarketData();
    }
  }, [activeTab]);

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
      // Check if Flask scraping API is available
      const scrapingHealthy = await agmarknetScraper.checkFlaskAPIHealth();
      setIsScrapingAvailable(scrapingHealthy);
      
      let scrapedData: any[] = [];

      // Load scraped prices if Flask API is available
      if (scrapingHealthy) {
        try {
          // Use default values if user location is not available
          const targetState = userState || 'Maharashtra';
          const targetDistrict = userDistrict || 'Mumbai';
          
          const scrapedResult = await getLatestScrapedMarketData(targetState, targetDistrict, [
            'Jowar', 'Bajra', 'Maize', 'Gram', 'Tur (Arhar)', 'Cotton', 'Onion', 'Potato'
          ]);
          
          if (scrapedResult.success && scrapedResult.data.length > 0) {
            // Add scraped prices with a special source identifier
            scrapedData = scrapedResult.data.map((price: any) => ({
              ...price,
              source: 'AGMARKNET (Real-time)',
              isRealTime: true,
              scrapedAt: scrapedResult.scrapedAt
            }));
            
            setScrapedPrices(scrapedData);
          } else {
            // Use Maharashtra mock data as fallback
            const mockData = getMaharashtraMockData();
            scrapedData = mockData.data.map((price: any) => ({
              crop: price.commodity,
              price: price.modal_price,
              unit: 'quintal',
              market: price.market,
              trend: 'stable',
              change: 0,
              source: 'AGMARKNET',
              isRealTime: false,
              scrapedAt: mockData.scrapedAt
            }));
            setScrapedPrices(scrapedData);
          }
        } catch (scrapingError) {
          // Use Maharashtra mock data as fallback
          const mockData = getMaharashtraMockData();
          scrapedData = mockData.data.map((price: any) => ({
            crop: price.commodity,
            price: price.modal_price,
            unit: 'quintal',
            market: price.market,
            trend: 'stable',
            change: 0,
            source: 'AGMARKNET (Sample)',
            isRealTime: false,
            scrapedAt: mockData.scrapedAt
          }));
          setScrapedPrices(scrapedData);
        }
      } else {
        // Use Maharashtra mock data as fallback when Flask is not available
        const mockData = getMaharashtraMockData();
        scrapedData = mockData.data.map((price: any) => ({
          crop: price.commodity,
          price: price.modal_price,
          unit: 'quintal',
          market: price.market,
          trend: 'stable',
          change: 0,
          source: 'AGMARKNET (Sample)',
          isRealTime: false,
          scrapedAt: mockData.scrapedAt
        }));
        setScrapedPrices(scrapedData);
      }

      // Load marketplace listings
      const listingsResult = await getActiveListings({
        limit: 50
      });
      if (listingsResult.success && listingsResult.data) {
        setListings(listingsResult.data);
        console.log('Loaded listings:', listingsResult.data.length);
      } else {
        console.log('Failed to load listings:', listingsResult.error);
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
    setBuyListingsPage(1);
    setPricesPage(1);
    setHasMoreBuyListings(true);
    setHasMorePrices(true);
    await loadMarketData();
    setRefreshing(false);
  };

  const loadMoreBuyListings = async () => {
    if (loadingMore || !hasMoreBuyListings) return;
    
    setLoadingMore(true);
    try {
      const nextPage = buyListingsPage + 1;
      const listingsResult = await getActiveListings({
        limit: (nextPage * ITEMS_PER_PAGE)
      });
      
      if (listingsResult.success && listingsResult.data) {
        if (listingsResult.data.length < (nextPage * ITEMS_PER_PAGE)) {
          setHasMoreBuyListings(false);
        }
        setListings(listingsResult.data);
        setBuyListingsPage(nextPage);
      } else {
        setHasMoreBuyListings(false);
      }
    } catch (error) {
      console.error('Error loading more listings:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMorePrices = () => {
    if (loadingMore || !hasMorePrices) return;
    
    setLoadingMore(true);
    const nextPage = pricesPage + 1;
    const totalItems = filteredPrices.length;
    const currentDisplayed = pricesPage * ITEMS_PER_PAGE;
    
    if (currentDisplayed >= totalItems) {
      setHasMorePrices(false);
      setLoadingMore(false);
      return;
    }
    
    setPricesPage(nextPage);
    setLoadingMore(false);
  };

  const handleListProduce = async () => {
    if (!newListing.crop || !newListing.quantity || !newListing.pricePerUnit) {
      Alert.alert(t('marketplace.messages.fillAllFields'), t('marketplace.messages.fillAllFields'));
      return;
    }

    setListingLoading(true);
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
        
        Alert.alert(t('marketplace.messages.listingSuccess'), t('marketplace.messages.listingSuccess'));
        loadMarketData(); // Refresh data
      } else {
        Alert.alert(t('marketplace.messages.listingFailed'), result.error || t('marketplace.messages.listingFailed'));
      }
    } catch (error) {
      Alert.alert(t('marketplace.messages.listingFailed'), t('marketplace.messages.listingFailed'));
    } finally {
      setListingLoading(false);
    }
  };

  const handleExpressInterest = async (listingId: string) => {
    try {
      await expressInterest(listingId, userPhone);
      Alert.alert(t('marketplace.expressedInterest'), t('marketplace.sellerNotified'));
    } catch (error) {
      Alert.alert(t('marketplace.messages.interestFailed'), t('marketplace.messages.interestFailed'));
    }
  };

  const handleViewListing = async (listingId: string) => {
    try {
      await incrementViews(listingId);
    } catch (error) {
      console.error('Failed to increment views:', error);
    }
  };

  const handleEditListing = (listing: ProductListing) => {
    setEditingListing(listing);
    setNewListing({
      crop: listing.crop,
      quantity: listing.quantity.toString(),
      pricePerUnit: listing.pricePerUnit.toString(),
      unit: listing.unit,
      negotiable: listing.negotiable,
      quality: listing.quality,
      description: listing.description || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateListing = async () => {
    if (!editingListing || !editingListing.id) {
      Alert.alert(t('marketplace.messages.updateFailed'), t('marketplace.messages.updateFailed'));
      return;
    }

    if (!newListing.crop || !newListing.quantity || !newListing.pricePerUnit) {
      Alert.alert(t('marketplace.messages.fillAllFields'), t('marketplace.messages.fillAllFields'));
      return;
    }

    setListingLoading(true);
    try {
      const updates = {
        crop: newListing.crop,
        quantity: parseInt(newListing.quantity),
        unit: newListing.unit,
        pricePerUnit: parseInt(newListing.pricePerUnit),
        totalPrice: parseInt(newListing.quantity) * parseInt(newListing.pricePerUnit),
        negotiable: newListing.negotiable,
        description: newListing.description,
        quality: newListing.quality,
      };

      const result = await updateProductListing(editingListing.id, updates);
      
      if (result.success) {
        setShowEditModal(false);
        setEditingListing(null);
        setNewListing({
          crop: '',
          quantity: '',
          pricePerUnit: '',
          unit: 'quintal',
          negotiable: false,
          quality: 'Good',
          description: '',
        });
        
        Alert.alert(t('marketplace.messages.updateSuccess'), t('marketplace.messages.updateSuccess'));
        loadMarketData(); // Refresh data
      } else {
        Alert.alert(t('marketplace.messages.updateFailed'), result.error || t('marketplace.messages.updateFailed'));
      }
    } catch (error) {
      Alert.alert(t('marketplace.messages.updateFailed'), t('marketplace.messages.updateFailed'));
    } finally {
      setListingLoading(false);
    }
  };

  const handleDeleteListing = (listing: ProductListing) => {
    Alert.alert(
      t('marketplace.messages.deleteConfirm'),
      `${t('marketplace.messages.deleteMessage')} ${listing.crop} ${t('marketplace.messages.listing')}`,
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('marketplace.delete'),
          style: 'destructive',
          onPress: async () => {
            if (!listing.id) return;
            
            try {
              const result = await deleteProductListing(listing.id);
              
              if (result.success) {
                Alert.alert(t('marketplace.messages.deleteSuccess'), t('marketplace.messages.deleteSuccess'));
                loadMarketData(); // Refresh data
              } else {
                Alert.alert(t('marketplace.messages.deleteFailed'), result.error || t('marketplace.messages.deleteFailed'));
              }
            } catch (error) {
              Alert.alert(t('marketplace.messages.deleteFailed'), t('marketplace.messages.deleteFailed'));
            }
          },
        },
      ]
    );
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = !searchQuery || 
      listing.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.sellerLocation.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCrop = !selectedCrop || listing.crop === selectedCrop;
    
    return matchesSearch && matchesCrop && listing.sellerId !== userPhone;
  });

  // Paginated listings for buy tab
  const paginatedBuyListings = filteredListings.slice(0, buyListingsPage * ITEMS_PER_PAGE);

  const filteredPrices = scrapedPrices.filter((price: any) => {
    const matchesSearch = !searchQuery || 
      price.crop.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCrop = !selectedCrop || price.crop === selectedCrop;
    
    return matchesSearch && matchesCrop;
  });

  // Paginated prices for prices tab
  const paginatedPrices = filteredPrices.slice(0, pricesPage * ITEMS_PER_PAGE);



  const renderSellTab = () => (
    <View style={styles.tabContent}>
      <TouchableOpacity
        style={styles.listProduceButton}
        onPress={() => setShowListingModal(true)}
      >
        <Text style={styles.listProduceIcon}>📦</Text>
        <View>
          <Text style={styles.listProduceTitle}>{t('marketplace.listYourProduce')}</Text>
          <Text style={styles.listProduceSubtitle}>{t('marketplace.connectWithBuyers')}</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>{t('marketplace.yourActiveListings')}</Text>
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
            <Text style={styles.qualityText}>{t('marketplace.quality')}: {listing.quality}</Text>
            <Text style={styles.dateText}>{t('marketplace.listedOn')} {new Date(listing.createdAt).toLocaleDateString()}</Text>
            {listing.negotiable && (
              <Text style={styles.negotiableText}>💬 {t('marketplace.priceNegotiable')}</Text>
            )}
            <Text style={styles.viewsText}>👁️ {listing.views} {t('marketplace.views')}</Text>
            
            {/* Edit and Delete buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditListing(listing)}
              >
                <Text style={styles.editButtonText}>✏️ {t('marketplace.edit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteListing(listing)}
              >
                <Text style={styles.deleteButtonText}>🗑️ {t('marketplace.delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>{t('marketplace.noActiveListings')}</Text>
          <Text style={styles.emptySubtitle}>{t('marketplace.tapToStartSelling')}</Text>
        </View>
      )}
    </View>
  );

  const renderPricesTab = () => (
    <View style={styles.tabContent}>
      {/* Status indicator for scraping service */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {isScrapingAvailable ? `🟢 ${t('marketplace.realTimePrices')}` : `🔴 ${t('marketplace.scrapingServiceOffline')}`}
        </Text>
        {!isScrapingAvailable && (
          <Text style={styles.statusSubtext}>
            {t('marketplace.startFlaskService')}
          </Text>
        )}
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('marketplace.searchCrops')}
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
            {t('marketplace.allCrops')}
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
        {isScrapingAvailable ? t('marketplace.realTimeMarketPrices') : t('marketplace.marketPrices')}
      </Text>
      
      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>{t('marketplace.messages.loadingData')}</Text>
        </View>
      ) : paginatedPrices.length > 0 ? (
        <>
          {paginatedPrices.map((price: any, index: number) => (
            <View key={index} style={styles.priceCard}>
              <View style={styles.priceHeader}>
                <Text style={styles.cropName}>{price.crop}</Text>
              </View>
              <Text style={styles.marketName}>{price.market}</Text>
              <Text style={styles.currentPrice}>₹{price.price} {t('marketplace.perUnit')} {price.unit}</Text>
              {price.source && (
                <Text style={styles.sourceText}>{t('marketplace.source')}: {price.source}</Text>
              )}
              {price.scrapedAt && (
                <Text style={styles.sourceText}>
                  {t('marketplace.updated')}: {new Date(price.scrapedAt).toLocaleTimeString()}
                </Text>
              )}
            </View>
          ))}
          
          {/* Load More button for prices */}
          {paginatedPrices.length < filteredPrices.length && (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={loadMorePrices}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <ActivityIndicator size="small" color="#4CAF50" />
              ) : (
                <Text style={styles.loadMoreText}>{t('marketplace.messages.loadingMore')}</Text>
              )}
            </TouchableOpacity>
          )}
          
          {paginatedPrices.length >= filteredPrices.length && filteredPrices.length > ITEMS_PER_PAGE && (
            <Text style={styles.noMoreDataText}>{t('marketplace.messages.noMoreData')}</Text>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>
            {isScrapingAvailable ? t('marketplace.noPriceData') : t('marketplace.scrapingServiceOffline')}
          </Text>
          <Text style={styles.emptySubtitle}>
            {isScrapingAvailable 
              ? t('marketplace.tryRefreshing')
              : t('marketplace.startFlaskService')
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
          placeholder={t('marketplace.searchProducts')}
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
            {t('marketplace.allCrops')}
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


      <Text style={styles.sectionTitle}>{t('marketplace.availableProduce')}</Text>
      
      {loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>{t('marketplace.messages.loadingData')}</Text>
        </View>
      ) : paginatedBuyListings.length > 0 ? (
        <>
          {paginatedBuyListings.map((listing) => (
            <View key={listing.id} style={styles.buyerListingCard}>
              <View style={styles.listingHeader}>
                <Text style={styles.cropName}>{listing.crop}</Text>
                <Text style={[styles.priceText, { color: '#4CAF50' }]}>
                  ₹{listing.pricePerUnit}/{listing.unit}
                </Text>
              </View>
              <Text style={styles.quantityText}>{listing.quantity} {listing.unit} {t('marketplace.available')}</Text>
              <Text style={styles.qualityText}>{t('marketplace.quality')}: {listing.quality}</Text>
              {listing.description && (
                <Text style={styles.descriptionText}>{listing.description}</Text>
              )}
              <View style={styles.farmerInfo}>
                <Text style={styles.farmerName}>👨‍🌾 {listing.sellerName}</Text>
                <Text style={styles.locationText}>📍 {listing.sellerLocation}</Text>
              </View>
              {listing.negotiable && (
                <Text style={styles.negotiableText}>💬 {t('marketplace.priceNegotiable')}</Text>
              )}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => {
                    handleViewListing(listing.id!);
                    Alert.alert(t('marketplace.contactFarmer'), `${t('marketplace.callAt')} ${listing.sellerName} ${t('marketplace.at')} ${listing.sellerPhone}`);
                  }}
                >
                  <Text style={styles.contactButtonText}>📞 {t('marketplace.contact')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.interestButton}
                  onPress={() => handleExpressInterest(listing.id!)}
                >
                  <Text style={styles.interestButtonText}>💝 {t('marketplace.interest')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          {/* Load More button */}
          {paginatedBuyListings.length < filteredListings.length && hasMoreBuyListings && (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={loadMoreBuyListings}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <ActivityIndicator size="small" color="#4CAF50" />
              ) : (
                <Text style={styles.loadMoreText}>{t('marketplace.messages.loadingMore')}</Text>
              )}
            </TouchableOpacity>
          )}
          
          {!hasMoreBuyListings && paginatedBuyListings.length > ITEMS_PER_PAGE && (
            <Text style={styles.noMoreDataText}>{t('marketplace.messages.noMoreData')}</Text>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>
            {listings.length === 0 
              ? t('marketplace.noListingsAvailable')
              : filteredListings.length === 0 && listings.length > 0
                ? t('marketplace.noMatchingProducts')
                : t('marketplace.noListingsAvailable')
            }
          </Text>
          <Text style={styles.emptySubtitle}>
            {listings.length === 0 
              ? t('marketplace.beFirstToList')
              : t('marketplace.adjustFilters')
            }
          </Text>
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
        <Text style={styles.headerTitle}>{t('marketplace.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sell' && styles.activeTab]}
          onPress={() => setActiveTab('sell')}
        >
          <Text style={[styles.tabText, activeTab === 'sell' && styles.activeTabText]}>
            {t('marketplace.sell')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'prices' && styles.activeTab]}
          onPress={() => setActiveTab('prices')}
        >
          <Text style={[styles.tabText, activeTab === 'prices' && styles.activeTabText]}>
            {t('marketplace.prices')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'buy' && styles.activeTab]}
          onPress={() => setActiveTab('buy')}
        >
          <Text style={[styles.tabText, activeTab === 'buy' && styles.activeTabText]}>
            {t('marketplace.buy')}
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
              <Text style={styles.modalTitle}>{t('marketplace.listProduceModal.title')}</Text>
              <TouchableOpacity 
                onPress={() => setShowListingModal(false)}
                disabled={listingLoading}
              >
                <Text style={[styles.closeButton, listingLoading && { opacity: 0.5 }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {listingLoading && (
              <View style={styles.modalLoadingOverlay}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>{t('marketplace.listProduceModal.creating')}</Text>
              </View>
            )}

            <ScrollView style={listingLoading && { opacity: 0.3 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('marketplace.listProduceModal.crop')} *</Text>
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
                <Text style={styles.inputLabel}>{t('marketplace.listProduceModal.quantity')} *</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('marketplace.listProduceModal.enterQuantity')}
                  value={newListing.quantity}
                  onChangeText={(text) => setNewListing({...newListing, quantity: text})}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('marketplace.listProduceModal.unit')}</Text>
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
                <Text style={styles.inputLabel}>{t('marketplace.listProduceModal.pricePerUnit').replace('{unit}', newListing.unit)} (₹) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('marketplace.listProduceModal.enterPrice')}
                  value={newListing.pricePerUnit}
                  onChangeText={(text) => setNewListing({...newListing, pricePerUnit: text})}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('marketplace.quality')}</Text>
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
                <Text style={styles.inputLabel}>{t('marketplace.listProduceModal.descriptionOptional')}</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  placeholder={t('marketplace.listProduceModal.descriptionPlaceholder')}
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
                <Text style={styles.checkboxLabel}>{t('marketplace.listProduceModal.negotiablePrice')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, listingLoading && styles.disabledButton]}
                onPress={handleListProduce}
                disabled={listingLoading}
              >
                {listingLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={[styles.submitButtonText, { marginLeft: 10 }]}>{t('marketplace.listProduceModal.listing')}</Text>
                  </View>
                ) : (
                  <Text style={styles.submitButtonText}>{t('marketplace.listProduceModal.listProduce')}</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Produce Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('marketplace.listProduceModal.editTitle')}</Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowEditModal(false);
                  setEditingListing(null);
                }}
                disabled={listingLoading}
              >
                <Text style={[styles.closeButton, listingLoading && { opacity: 0.5 }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {listingLoading && (
              <View style={styles.modalLoadingOverlay}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>{t('marketplace.listProduceModal.updatingMessage')}</Text>
              </View>
            )}

            <ScrollView style={listingLoading && { opacity: 0.3 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('marketplace.listProduceModal.crop')} *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {commonCrops.map((crop) => (
                    <TouchableOpacity
                      key={crop}
                      style={[
                        styles.cropChip,
                        newListing.crop === crop && styles.selectedCropChip
                      ]}
                      onPress={() => setNewListing({...newListing, crop})}
                      disabled={listingLoading}
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
                <Text style={styles.inputLabel}>{t('marketplace.listProduceModal.quantity')} *</Text>
                <TextInput
                  style={[styles.input, listingLoading && { opacity: 0.5 }]}
                  placeholder={t('marketplace.listProduceModal.enterQuantity')}
                  value={newListing.quantity}
                  onChangeText={(text) => setNewListing({...newListing, quantity: text})}
                  keyboardType="numeric"
                  editable={!listingLoading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('marketplace.listProduceModal.unit')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {units.map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      style={[
                        styles.unitChip,
                        newListing.unit === unit && styles.selectedUnitChip
                      ]}
                      onPress={() => setNewListing({...newListing, unit})}
                      disabled={listingLoading}
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
                <Text style={styles.inputLabel}>{t('marketplace.listProduceModal.pricePerUnit').replace('{unit}', newListing.unit)} (₹) *</Text>
                <TextInput
                  style={[styles.input, listingLoading && { opacity: 0.5 }]}
                  placeholder={t('marketplace.listProduceModal.enterPrice')}
                  value={newListing.pricePerUnit}
                  onChangeText={(text) => setNewListing({...newListing, pricePerUnit: text})}
                  keyboardType="numeric"
                  editable={!listingLoading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('marketplace.quality')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {qualities.map((quality) => (
                    <TouchableOpacity
                      key={quality}
                      style={[
                        styles.qualityChip,
                        newListing.quality === quality && styles.selectedQualityChip
                      ]}
                      onPress={() => setNewListing({...newListing, quality: quality as 'Premium' | 'Good' | 'Average'})}
                      disabled={listingLoading}
                    >
                      <Text style={[
                        styles.qualityChipText,
                        newListing.quality === quality && styles.selectedQualityChipText
                      ]}>
                        {quality}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t('marketplace.listProduceModal.descriptionOptional')}</Text>
                <TextInput
                  style={[styles.textArea, listingLoading && { opacity: 0.5 }]}
                  placeholder={t('marketplace.listProduceModal.descriptionPlaceholder')}
                  value={newListing.description}
                  onChangeText={(text) => setNewListing({...newListing, description: text})}
                  multiline
                  numberOfLines={3}
                  editable={!listingLoading}
                />
              </View>

              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setNewListing({...newListing, negotiable: !newListing.negotiable})}
                disabled={listingLoading}
              >
                <View style={[styles.checkbox, newListing.negotiable && styles.checkedBox]}>
                  {newListing.negotiable && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>{t('marketplace.listProduceModal.negotiablePrice')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, listingLoading && styles.disabledButton]}
                onPress={handleUpdateListing}
                disabled={listingLoading}
              >
                {listingLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="white" />
                    <Text style={[styles.submitButtonText, { marginLeft: 10 }]}>{t('marketplace.listProduceModal.updatingButton')}</Text>
                  </View>
                ) : (
                  <Text style={styles.submitButtonText}>{t('marketplace.listProduceModal.update')}</Text>
                )}
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
  qualityChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedQualityChip: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  qualityChipText: {
    color: '#666',
    fontSize: 12,
  },
  selectedQualityChipText: {
    color: 'white',
    fontWeight: 'bold',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'white',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
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
  disabledButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    borderRadius: 15,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
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
  editButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flex: 1,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flex: 1,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
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
  loadMoreButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noMoreDataText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    marginVertical: 15,
    fontStyle: 'italic',
  },
});

export default Marketplace;
