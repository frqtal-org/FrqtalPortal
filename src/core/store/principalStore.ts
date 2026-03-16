import { createMMKV } from 'react-native-mmkv';
export const mmkvStorage = createMMKV({ id: 'frqtalPortal' });
export const mmkvStorageTemporal = createMMKV({ id: 'frqtalPortalTemporal' });

const TWELVE_HOURS_MS = 43200000; 
export const setItemWithExpiry = (key: string, value: boolean) => {
  const item = {
    value: value,
    expiry: Date.now() + TWELVE_HOURS_MS,
  };
  mmkvStorage.set(key, JSON.stringify(item));
};

export const getItemWithExpiry = (key: string): string | null => {
  const itemString = mmkvStorage.getString(key);
  if (!itemString) return null;

  try {
    const item = JSON.parse(itemString);
    const now = Date.now();

    if (now > item.expiry) {
      mmkvStorage.remove(key);
      return null;
    }

    return item.value;
    
  } catch (error) {
    mmkvStorage.remove(key);
    return null;
  }
};