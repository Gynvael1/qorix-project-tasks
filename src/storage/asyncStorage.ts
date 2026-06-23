import AsyncStorage from "@react-native-async-storage/async-storage";

export const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const json = await AsyncStorage.getItem(key);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error("Error reading from AsyncStorage:", error);
    return null;
  }
};

export const setData = async <T>(key: string, value: T): Promise<void> => {
  try {
    const json = JSON.stringify(value);
    await AsyncStorage.setItem(key, json);
  } catch (error) {
    console.error("Error writing to AsyncStorage:", error);
  }
};

export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing from AsyncStorage:", error);
  }
};
