import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { exportProjectsToCSV } from "../services/exportService";

const ExportScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const result = await exportProjectsToCSV();
      if (result === null) {
        Alert.alert("Нет данных", "Нет проектов для экспорта.");
      } else {
        Alert.alert("Успех", "Файл CSV создан и открыт для шаринга.");
      }
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось экспортировать данные.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Экспорт данных в CSV</Text>
        <Text style={styles.description}>
          Экспортируйте все проекты в CSV-файл, который можно открыть в Excel
          или других табличных редакторах. Файл будет содержать: название
          проекта, клиента, статус, прогресс, дедлайн и количество подзадач.
        </Text>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleExport}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Экспорт..." : "Экспортировать все проекты"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 16,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ExportScreen;
