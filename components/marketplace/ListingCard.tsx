import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ProductListing } from '../../services/marketplaceService';
import { useI18n } from '../../i18n/useI18n';

interface ListingCardProps {
  listing: ProductListing;
  onEdit?: () => void;
  onDelete?: () => void;
  isOwner: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({ listing, onEdit, onDelete, isOwner }) => {
  const { t } = useI18n();

  return (
    <View style={styles.listingCard}>
      <View style={styles.listingHeader}>
        <Text style={styles.cropName}>{listing.crop}</Text>
        <Text style={[styles.priceText, { color: '#4CAF50' }]}>
          ₹{listing.pricePerUnit}/{listing.unit}
        </Text>
      </View>
      <Text style={styles.quantityText}>{listing.quantity} {listing.unit}</Text>
      <Text style={styles.qualityText}>{t('marketplace.quality')}: {listing.quality}</Text>
      <Text style={styles.dateText}>
        {t('marketplace.listedOn')} {new Date(listing.createdAt).toLocaleDateString()}
      </Text>
      {listing.negotiable && (
        <Text style={styles.negotiableText}>💬 {t('marketplace.priceNegotiable')}</Text>
      )}
      <Text style={styles.viewsText}>👁️ {listing.views} {t('marketplace.views')}</Text>
      
      {isOwner && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={onEdit}>
            <Text style={styles.editButtonText}>✏️ {t('marketplace.edit')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
            <Text style={styles.deleteButtonText}>🗑️ {t('marketplace.delete')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  listingCard: {
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
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  negotiableText: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 5,
  },
  viewsText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
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
});
