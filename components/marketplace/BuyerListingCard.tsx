import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ProductListing } from '../../services/marketplaceService';
import { useI18n } from '../../i18n/useI18n';

interface BuyerListingCardProps {
  listing: ProductListing;
  onContact: () => void;
  onExpressInterest: () => void;
}

export const BuyerListingCard: React.FC<BuyerListingCardProps> = ({ listing, onContact, onExpressInterest }) => {
  const { t } = useI18n();

  return (
    <View style={styles.buyerListingCard}>
      <View style={styles.listingHeader}>
        <Text style={styles.cropName}>{listing.crop}</Text>
        <Text style={[styles.priceText, { color: '#4CAF50' }]}>
          ₹{listing.pricePerUnit}/{listing.unit}
        </Text>
      </View>
      <Text style={styles.quantityText}>
        {listing.quantity} {listing.unit} {t('marketplace.available')}
      </Text>
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
        <TouchableOpacity style={styles.contactButton} onPress={onContact}>
          <Text style={styles.contactButtonText}>📞 {t('marketplace.contact')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.interestButton} onPress={onExpressInterest}>
          <Text style={styles.interestButtonText}>💝 {t('marketplace.interest')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  qualityText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 13,
    color: '#555',
    marginVertical: 5,
    lineHeight: 18,
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
  negotiableText: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
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
});
