import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  requestPermissions,
  cancelAllNotifications,
} from "../services/notificationService";

const NOTIFICATIONS_ENABLED_KEY = "@qorix_notifications_enabled";

const SettingsScreen: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const value = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
      if (value !== null) {
        setNotificationsEnabled(value === "true");
      } else {
        // По умолчанию включены
        setNotificationsEnabled(true);
        await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, "true");
      }
    } catch (error) {
      console.error("Ошибка загрузки настроек:", error);
    }
  };

  const toggleNotifications = async (value: boolean) => {
    try {
      if (value) {
        // Включаем уведомления – запрашиваем разрешение
        const granted = await requestPermissions();
        if (!granted) {
          Alert.alert(
            "Разрешение отклонено",
            "Для работы уведомлений необходимо разрешение.",
          );
          // Возвращаем переключатель в исходное состояние
          setNotificationsEnabled(false);
          await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, "false");
          return;
        }
        setNotificationsEnabled(true);
        await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, "true");
        Alert.alert(
          "Уведомления включены",
          "Уведомления о дедлайнах будут планироваться.",
        );
      } else {
        // Отключаем – отменяем все запланированные уведомления
        await cancelAllNotifications();
        setNotificationsEnabled(false);
        await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, "false");
        Alert.alert(
          "Уведомления отключены",
          "Все запланированные уведомления отменены.",
        );
      }
    } catch (error) {
      console.error("Ошибка настройки уведомлений:", error);
      Alert.alert("Ошибка", "Не удалось изменить настройки уведомлений.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.settingItem}>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>Уведомления о дедлайнах</Text>
            <Text style={styles.settingDescription}>
              Получать напоминания за 24 часа и за 1 час до дедлайна проекта
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: "#E2E8F0", true: "#60A5FA" }}
            thumbColor={notificationsEnabled ? "#2563EB" : "#64748B"}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingText: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1E293B",
  },
  settingDescription: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
});

export default SettingsScreen;
