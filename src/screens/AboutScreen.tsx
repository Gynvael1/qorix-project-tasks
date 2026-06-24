import React from "react";
import { View, Text, StyleSheet, ScrollView, Linking } from "react-native";
import { TouchableOpacity } from "react-native";
import Logo from "../components/Logo";

const AboutScreen: React.FC = () => {
  const openWebsite = () => {
    Linking.openURL("https://qorix.ru").catch(() => {});
  };

  const openPhone = () => {
    Linking.openURL("tel:+78432393784").catch(() => {});
  };

  const openEmail = () => {
    Linking.openURL("mailto:promo@qorix.ru").catch(() => {});
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.logoContainer}>
        <Logo size={80} showText={false} />
        <Text style={styles.appName}>Qorix Project Tasks</Text>
        <Text style={[styles.appName, { color: "grey" }]}>
          Малых С.Н. (4338)
        </Text>
        <Text style={styles.appVersion}>Версия 1.0.0</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>О компании Qorix</Text>
        <Text style={styles.description}>
          Qorix – ведущее IT-агентство в Казани с 10-летним опытом работы. Мы
          специализируемся на разработке веб-сайтов, контекстной рекламе в
          Яндекс.Директ и SEO-продвижении.
        </Text>
        <Text style={styles.description}>
          Наша команда состоит из опытных специалистов, которые разрабатывают
          IT-проекты с нуля или подключаются к существующим. Мы работаем в
          формате аутсорс и аутстафф, выполняя frontend и backend разработку.
        </Text>
        <Text style={styles.description}>
          Наши клиенты – крупные компании Поволжья и ближайших регионов. Мы
          следуем последним тенденциям графического дизайна и помогаем бизнесу
          расти через технологии и эффективные цифровые стратегии.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Услуги</Text>
        <View style={styles.servicesGrid}>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceIcon}>🌐</Text>
            <Text style={styles.serviceText}>Разработка сайтов</Text>
          </View>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceIcon}>⚡</Text>
            <Text style={styles.serviceText}>Frontend-разработка</Text>
          </View>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceIcon}>⚙️</Text>
            <Text style={styles.serviceText}>Backend-разработка</Text>
          </View>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceIcon}>📈</Text>
            <Text style={styles.serviceText}>SEO-продвижение</Text>
          </View>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceIcon}>🎯</Text>
            <Text style={styles.serviceText}>Контекстная реклама</Text>
          </View>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceIcon}>🔧</Text>
            <Text style={styles.serviceText}>Техническая поддержка</Text>
          </View>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceIcon}>📊</Text>
            <Text style={styles.serviceText}>Веб-аналитика</Text>
          </View>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceIcon}>🛒</Text>
            <Text style={styles.serviceText}>Интернет-магазины</Text>
          </View>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceIcon}>🏢</Text>
            <Text style={styles.serviceText}>Корпоративные сайты</Text>
          </View>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceIcon}>🎨</Text>
            <Text style={styles.serviceText}>Разработка брендинга</Text>
          </View>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceIcon}>📱</Text>
            <Text style={styles.serviceText}>Реклама в Авито, 2ГИС</Text>
          </View>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceIcon}>💼</Text>
            <Text style={styles.serviceText}>CRM-системы</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Контакты</Text>
        <TouchableOpacity onPress={openWebsite} activeOpacity={0.7}>
          <Text style={styles.link}>🌐 qorix.ru</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={openPhone} activeOpacity={0.7}>
          <Text style={styles.link}>📞 +7 (843) 239-37-84</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={openEmail} activeOpacity={0.7}>
          <Text style={styles.link}>✉️ promo@qorix.ru</Text>
        </TouchableOpacity>
        <Text style={styles.address}>📍 Казань, ул. Четаева, д. 5А</Text>
        <Text style={styles.workingHours}>⏰ Работаем по всей России</Text>
      </View>

      <Text style={styles.footer}>© 2026 Qorix. Все права защищены.</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F7",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  appName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2D3440",
    marginTop: 12,
  },
  appVersion: {
    fontSize: 14,
    color: "#7B8594",
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#2D3440",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3440",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#7B8594",
    lineHeight: 22,
    marginBottom: 8,
  },
  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  serviceIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  serviceText: {
    fontSize: 14,
    color: "#2D3440",
    flexShrink: 1,
  },
  link: {
    fontSize: 16,
    color: "#8A94A6",
    fontWeight: "500",
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: "#7B8594",
    marginTop: 8,
  },
  workingHours: {
    fontSize: 14,
    color: "#7B8594",
    marginTop: 4,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#7B8594",
    marginTop: 8,
  },
});

export default AboutScreen;
