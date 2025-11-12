import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useI18n } from '../../i18n/useI18n';

interface PriceCardProps {
  price: any;
  isRealTime: boolean;
}

export const PriceCard: React.FC<PriceCardProps> = ({ price, isRealTime }) => {
  const { t } = useI18n();

  return (
    <View style={styles.priceCard}>
      <View style={styles.priceHeader}>
        <Text style={styles.cropName}>{price.crop}</Text>
      </View>
      <Text style={styles.marketName}>{price.market}</Text>
      <Text style={styles.currentPrice}>
        ₹{price.price} {t('marketplace.perUnit')} {price.unit}
      </Text>
      {price.source && (
        <Text style={styles.sourceText}>{t('marketplace.source')}: {price.source}</Text>
      )}
      {price.scrapedAt && (
        <Text style={styles.sourceText}>
          {t('marketplace.updated')}: {new Date(price.scrapedAt).toLocaleTimeString()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  cropName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
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
  sourceText: {
    fontSize: 11,
    color: '#888',
    marginTop: 3,
    fontStyle: 'italic',
  },
});
