import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  ScrollView,
  Animated,
  PanResponder
} from 'react-native';
import { router } from 'expo-router';
import { onboardingData, OnboardingItem } from '../data/onboarding-data';

const { width: screenWidth } = Dimensions.get('window');

const GetStartedScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 20;
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx > 50 && currentIndex > 0) {
        // Swipe right - go to previous
        goToSlide(currentIndex - 1);
      } else if (gestureState.dx < -50 && currentIndex < onboardingData.length - 1) {
        // Swipe left - go to next
        goToSlide(currentIndex + 1);
      } else if (gestureState.dx < -50 && currentIndex === onboardingData.length - 1) {
        // Last slide - navigate to language selection
        handleGetStarted();
      }
    },
  });

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    scrollViewRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true,
    });
  };

  const handleGetStarted = () => {
    router.push('/onboarding/language');
  };

  const handleSkip = () => {
    router.push('/onboarding/language');
  };

  const renderSlide = (item: OnboardingItem, index: number) => {
    if (index === 0) {
      return (
        <View key={item.id} style={styles.slide}>
          <View style={styles.tractorImageContainer}>
            {/* Simulated tractor image with gradient overlay */}
            <View style={styles.tractorBackground}>
              <View style={styles.tractorOverlay} />
              <View style={styles.tractorSilhouette}>
                <Text style={styles.tractorEmoji}>🚜</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.contentContainer}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Text style={styles.leafIcon}>🌱</Text>
              </View>
              <Text style={styles.appTitle}>{item.title}</Text>
              <Text style={styles.appSubtitle}>{item.subtitle}</Text>
            </View>
            
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </View>
      );
    }

    return (
      <View key={item.id} style={styles.slide}>
        <View style={styles.featureImageContainer}>
          <Text style={styles.featureEmoji}>
            {index === 1 ? '🤖' : '🤝'}
          </Text>
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.featureTitle}>{item.title}</Text>
          <Text style={styles.featureSubtitle}>{item.subtitle}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
          setCurrentIndex(index);
        }}
      >
        {onboardingData.map((item, index) => renderSlide(item, index))}
      </ScrollView>

      {/* Bottom section */}
      <View style={styles.bottomContainer}>
        {/* Dots indicator */}
        <View style={styles.dotsContainer}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>

        {/* Get Started / Next button */}
        <TouchableOpacity 
          style={styles.getStartedButton} 
          onPress={currentIndex === onboardingData.length - 1 ? handleGetStarted : () => goToSlide(currentIndex + 1)}
        >
          <Text style={styles.getStartedText}>
            {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>

        {/* Swipe indicator */}
        <Text style={styles.swipeText}>
          {currentIndex === onboardingData.length - 1 
            ? 'Tap or swipe left to continue' 
            : 'Swipe to explore features'
          }
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  skipText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  slide: {
    width: screenWidth,
    flex: 1,
    paddingHorizontal: 20,
  },
  tractorImageContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tractorBackground: {
    width: screenWidth,
    height: '100%',
    backgroundColor: '#4CAF50',
    position: 'relative',
    overflow: 'hidden',
  },
  tractorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  tractorSilhouette: {
    position: 'absolute',
    bottom: '20%',
    left: '50%',
    transform: [{ translateX: -50 }],
    alignItems: 'center',
  },
  tractorEmoji: {
    fontSize: 120,
    opacity: 0.8,
  },
  featureImageContainer: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
  },
  featureEmoji: {
    fontSize: 100,
    color: 'white',
  },
  contentContainer: {
    flex: 0.4,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoIcon: {
    width: 60,
    height: 60,
    backgroundColor: 'white',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leafIcon: {
    fontSize: 30,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  appSubtitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#4CAF50',
    textAlign: 'center',
  },
  featureTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  featureSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#4CAF50',
    width: 20,
  },
  getStartedButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    minWidth: 200,
    justifyContent: 'center',
  },
  getStartedText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  arrowIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  swipeText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default GetStartedScreen;
