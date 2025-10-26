// Mock Maharashtra market data for fallback when scraping fails
export const maharashtraMockData = [
  {
    commodity: 'Jowar',
    variety: 'FAQ',
    grade: 'FAQ',
    min_price: '2800',
    max_price: '3200',
    modal_price: '3000',
    price_date: '26/10/2025',
    market: 'Mumbai',
    state: 'Maharashtra',
    source: 'AGMARKNET (Mock)',
    isRealTime: false
  },
  {
    commodity: 'Bajra',
    variety: 'FAQ',
    grade: 'FAQ',
    min_price: '2500',
    max_price: '2900',
    modal_price: '2700',
    price_date: '26/10/2025',
    market: 'Mumbai',
    state: 'Maharashtra',
    source: 'AGMARKNET (Mock)',
    isRealTime: false
  },
  {
    commodity: 'Maize',
    variety: 'FAQ',
    grade: 'FAQ',
    min_price: '2200',
    max_price: '2600',
    modal_price: '2400',
    price_date: '26/10/2025',
    market: 'Mumbai',
    state: 'Maharashtra',
    source: 'AGMARKNET (Mock)',
    isRealTime: false
  },
  {
    commodity: 'Gram',
    variety: 'FAQ',
    grade: 'FAQ',
    min_price: '4500',
    max_price: '5200',
    modal_price: '4850',
    price_date: '26/10/2025',
    market: 'Mumbai',
    state: 'Maharashtra',
    source: 'AGMARKNET (Mock)',
    isRealTime: false
  },
  {
    commodity: 'Tur (Arhar)',
    variety: 'FAQ',
    grade: 'FAQ',
    min_price: '6200',
    max_price: '7000',
    modal_price: '6600',
    price_date: '26/10/2025',
    market: 'Mumbai',
    state: 'Maharashtra',
    source: 'AGMARKNET (Mock)',
    isRealTime: false
  },
  {
    commodity: 'Cotton',
    variety: 'FAQ',
    grade: 'FAQ',
    min_price: '5800',
    max_price: '6400',
    modal_price: '6100',
    price_date: '26/10/2025',
    market: 'Mumbai',
    state: 'Maharashtra',
    source: 'AGMARKNET (Mock)',
    isRealTime: false
  },
  {
    commodity: 'Onion',
    variety: 'FAQ',
    grade: 'FAQ',
    min_price: '800',
    max_price: '1200',
    modal_price: '1000',
    price_date: '26/10/2025',
    market: 'Mumbai',
    state: 'Maharashtra',
    source: 'AGMARKNET (Mock)',
    isRealTime: false
  },
  {
    commodity: 'Potato',
    variety: 'FAQ',
    grade: 'FAQ',
    min_price: '1200',
    max_price: '1600',
    modal_price: '1400',
    price_date: '26/10/2025',
    market: 'Mumbai',
    state: 'Maharashtra',
    source: 'AGMARKNET (Mock)',
    isRealTime: false
  },
  {
    commodity: 'Groundnut',
    variety: 'FAQ',
    grade: 'FAQ',
    min_price: '5000',
    max_price: '5800',
    modal_price: '5400',
    price_date: '26/10/2025',
    market: 'Nashik',
    state: 'Maharashtra',
    source: 'AGMARKNET (Mock)',
    isRealTime: false
  },
  {
    commodity: 'Soyabean',
    variety: 'FAQ',
    grade: 'FAQ',
    min_price: '4200',
    max_price: '4800',
    modal_price: '4500',
    price_date: '26/10/2025',
    market: 'Nagpur',
    state: 'Maharashtra',
    source: 'AGMARKNET (Mock)',
    isRealTime: false
  }
];

export const getMaharashtraMockData = () => {
  return {
    success: true,
    data: maharashtraMockData,
    scrapedAt: new Date().toISOString(),
    source: 'Mock data (Railway ChromeDriver issue)'
  };
};