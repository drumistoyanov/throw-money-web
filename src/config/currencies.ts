// Currency configuration system

export interface CurrencyConfig {
  code: 'BGN' | 'EUR';
  symbol: string;
  name: string;
  flag: string;
  denominations: number[];
  imageKeys: string[];
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  BGN: {
    code: 'BGN',
    symbol: 'лв',
    name: 'Български лев',
    flag: '🇧🇬',
    denominations: [1, 5, 10, 20, 50, 100],
    imageKeys: [
      'bgn_1',
      'bgn_5',
      'bgn_10',
      'bgn_20',
      'bgn_50',
      'bgn_100'
    ]
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Евро',
    flag: '🇪🇺',
    denominations: [5, 10, 20, 50, 100, 200, 500],
    imageKeys: [
      'eur_5',
      'eur_10',
      'eur_20',
      'eur_50',
      'eur_100',
      'eur_200',
      'eur_500'
    ]
  }
};

export function getCurrencyConfig(code: 'BGN' | 'EUR'): CurrencyConfig {
  const config = CURRENCIES[code];
  if (!config) {
    console.warn(`Невалиден код на валута: ${code}, използва се ЛВ`);
    return CURRENCIES.BGN;
  }
  return config;
}

export function getCurrentCurrency(): 'BGN' | 'EUR' {
  try {
    const settings = localStorage.getItem('gameSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      const currency = parsed.currency;
      // Validate currency
      if (currency === 'BGN' || currency === 'EUR') {
        return currency;
      }
      // If currency is invalid (e.g., old 'RON' or 'USD'), reset to BGN
      console.warn(`Невалидна валута в настройките: ${currency}, нулиране към ЛВ`);
      localStorage.removeItem('gameSettings');
    }
  } catch (e) {
    console.error('Грешка при четене на настройките:', e);
    localStorage.removeItem('gameSettings');
  }
  return 'BGN';
}

export function getCurrentMusicTrack(): 'song1' | 'song2' | 'song3' | 'song4' | 'song5' | 'song6' {
  try {
    const settings = localStorage.getItem('gameSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      const track = parsed.musicTrack;
      if (track === 'song1' || track === 'song2' || track === 'song3' || 
          track === 'song4' || track === 'song5' || track === 'song6') {
        return track;
      }
    }
  } catch (e) {
    console.error('Грешка при четене на музикалните настройки:', e);
  }
  return 'song1';
}
