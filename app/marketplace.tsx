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
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProduceListing {
  id: string;
  crop: string;
  quantity: string;
  price: string;
  unit: string;
  negotiable: boolean;
  farmerName: string;
  location: string;
  phone: string;
  datePosted: string;
  image?: string;
}

interface MarketPrice {
  crop: string;
  market: string;
  price: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: string;
}

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState<'sell' | 'prices' | 'listings'>('sell');
  const [showListingModal, setShowListingModal] = useState(false);
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [userLocation, setUserLocation] = useState('');

  const [newListing, setNewListing] = useState({
    crop: '',
    quantity: '',
    price: '',
    unit: 'quintal',
    negotiable: false,
  });

  const commonCrops = [
    'Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Maize', 'Bajra', 'Jowar',
    'Barley', 'Gram', 'Tur', 'Mustard', 'Groundnut', 'Soybean', 'Tomato', 'Onion', 'Potato'
  ];

  const units = ['kg', 'quintal', 'ton', 'bag', 'piece'];

  useEffect(() => {
    loadUserData();
    loadMarketData();
  }, []);

  const loadUserData = async () => {
    try {
      const village = await AsyncStorage.getItem('userVillage');
      const district = await AsyncStorage.getItem('userDistrict');
      if (village && district) {
        setUserLocation(`${village}, ${district}`);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadMarketData = () => {
    // Mock market prices data
    const mockPrices: MarketPrice[] = [
      { crop: 'Wheat', market: 'Mandi Samiti', price: '2,450', unit: 'quintal', trend: 'up', change: '+50' },
      { crop: 'Rice', market: 'Local Market', price: '3,200', unit: 'quintal', trend: 'down', change: '-80' },
      { crop: 'Cotton', market: 'APMC', price: '5,800', unit: 'quintal', trend: 'stable', change: '0' },
      { crop: 'Sugarcane', market: 'Sugar Mill', price: '350', unit: 'quintal', trend: 'up', change: '+15' },
      { crop: 'Tomato', market: 'Vegetable Market', price: '25', unit: 'kg', trend: 'up', change: '+5' },
      { crop: 'Onion', market: 'Wholesale Market', price: '18', unit: 'kg', trend: 'down', change: '-3' },
    ];

    // Mock listings data
    const mockListings: ProduceListing[] = [
      {
        id: '1',
        crop: 'Wheat',
        quantity: '50',
        price: '2,400',
        unit: 'quintal',
        negotiable: true,
        farmerName: 'Ramesh Kumar',
        location: 'Bharatpur, Rajasthan',
        phone: '9876543210',
        datePosted: '2024-01-15',
      },
      {
        id: '2',
        crop: 'Rice',
        quantity: '100',
        price: '3,150',
        unit: 'quintal',
        negotiable: false,
        farmerName: 'Suresh Patel',
        location: 'Kota, Rajasthan',
        phone: '9876543211',
        datePosted: '2024-01-14',
      },
    ];

    setMarketPrices(mockPrices);
    setListings(mockListings);
  };

  const handleListProduce = async () => {
    if (!newListing.crop || !newListing.quantity || !newListing.price) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      const userName = await AsyncStorage.getItem('userName') || 'Anonymous';
      const userPhone = await AsyncStorage.getItem('userPhone') || '';

      const listing: ProduceListing = {
        id: Date.now().toString(),
        crop: newListing.crop,
        quantity: newListing.quantity,
        price: newListing.price,
        unit: newListing.unit,
        negotiable: newListing.negotiable,
        farmerName: userName,
        location: userLocation,
        phone: userPhone,
        datePosted: new Date().toISOString().split('T')[0],
      };

      setListings([listing, ...listings]);
      setShowListingModal(false);
      setNewListing({ crop: '', quantity: '', price: '', unit: 'quintal', negotiable: false });
      
      Alert.alert('Success', 'Your produce has been listed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to list produce. Please try again.');
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return '#4CAF50';
      case 'down': return '#F44336';
      default: return '#FF9800';
    }
  };

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
      {listings.filter(listing => listing.location === userLocation).length > 0 ? (
        listings.filter(listing => listing.location === userLocation).map((listing) => (
          <View key={listing.id} style={styles.listingCard}>
            <View style={styles.listingHeader}>
              <Text style={styles.cropName}>{listing.crop}</Text>
              <Text style={[styles.priceText, { color: '#4CAF50' }]}>
                ₹{listing.price}/{listing.unit}
              </Text>
            </View>
            <Text style={styles.quantityText}>{listing.quantity} {listing.unit}</Text>
            <Text style={styles.dateText}>Listed on {listing.datePosted}</Text>
            {listing.negotiable && (
              <Text style={styles.negotiableText}>💬 Price negotiable</Text>
            )}
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
      <Text style={styles.sectionTitle}>Today's Market Prices</Text>
      {marketPrices.map((price, index) => (
        <View key={index} style={styles.priceCard}>
          <View style={styles.priceHeader}>
            <Text style={styles.cropName}>{price.crop}</Text>
            <View style={styles.trendContainer}>
              <Text style={styles.trendIcon}>{getTrendIcon(price.trend)}</Text>
              <Text style={[styles.changeText, { color: getTrendColor(price.trend) }]}>
                {price.change !== '0' && (price.trend === 'up' ? '+' : '')}₹{price.change}
              </Text>
            </View>
          </View>
          <Text style={styles.marketName}>{price.market}</Text>
          <Text style={styles.currentPrice}>₹{price.price} per {price.unit}</Text>
        </View>
      ))}
    </View>
  );

  const renderListingsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Available Produce</Text>
      {listings.map((listing) => (
        <View key={listing.id} style={styles.buyerListingCard}>
          <View style={styles.listingHeader}>
            <Text style={styles.cropName}>{listing.crop}</Text>
            <Text style={[styles.priceText, { color: '#4CAF50' }]}>
              ₹{listing.price}/{listing.unit}
            </Text>
          </View>
          <Text style={styles.quantityText}>{listing.quantity} {listing.unit} available</Text>
          <View style={styles.farmerInfo}>
            <Text style={styles.farmerName}>👨‍🌾 {listing.farmerName}</Text>
            <Text style={styles.locationText}>📍 {listing.location}</Text>
          </View>
          {listing.negotiable && (
            <Text style={styles.negotiableText}>💬 Price negotiable</Text>
          )}
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => Alert.alert('Contact Farmer', `Call ${listing.farmerName} at ${listing.phone}`)}
          >
            <Text style={styles.contactButtonText}>📞 Contact Farmer</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Marketplace</Text>
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
          style={[styles.tab, activeTab === 'listings' && styles.activeTab]}
          onPress={() => setActiveTab('listings')}
        >
          <Text style={[styles.tabText, activeTab === 'listings' && styles.activeTabText]}>
            Buy
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'sell' && renderSellTab()}
        {activeTab === 'prices' && renderPricesTab()}
        {activeTab === 'listings' && renderListingsTab()}
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
                  value={newListing.price}
                  onChangeText={(text) => setNewListing({...newListing, price: text})}
                  keyboardType="numeric"
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
    alignItems: 'center',
    marginTop: 10,
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
});

export default Marketplace;
