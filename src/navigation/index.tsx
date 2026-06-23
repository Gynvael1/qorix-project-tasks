import React from "react";
import { TouchableOpacity, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";

import SplashScreen from "../screens/SplashScreen";
import DashboardScreen from "../screens/DashboardScreen";
import ProjectListScreen from "../screens/ProjectListScreen";
import ProjectFormScreen from "../screens/ProjectFormScreen";
import ProjectDetailsScreen from "../screens/ProjectDetailsScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ExportScreen from "../screens/ExportScreen";
import SettingsScreen from "../screens/SettingsScreen";
import AboutScreen from "../screens/AboutScreen";

export type RootStackParamList = {
  Splash: undefined;
  Dashboard: undefined;
  ProjectList: undefined;
  ProjectForm: { projectId?: string } | undefined;
  ProjectDetails: { projectId: string };
  History: undefined;
  Export: undefined;
  Settings: undefined;
  About: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const Navigation: React.FC = () => {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: {
            backgroundColor: "#FFFFFF",
          },
          headerTintColor: "#2D3440",
          headerTitleStyle: {
            fontWeight: "600",
          },
          cardStyle: {
            backgroundColor: "#F4F5F7",
          },
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: "Обзор" }}
        />

        <Stack.Screen
          name="ProjectList"
          component={ProjectListScreen}
          options={({ navigation }) => ({
            title: "Проекты",
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate("Dashboard")}
                style={{ marginLeft: 16 }}
                activeOpacity={0.7}
              >
                <MaterialIcons name="dashboard" size={24} color="#2D3440" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <View style={{ flexDirection: "row", marginRight: 16 }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("History")}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="history" size={24} color="#2D3440" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Export")}
                  activeOpacity={0.7}
                  style={{ marginLeft: 16 }}
                >
                  <MaterialIcons
                    name="file-download"
                    size={24}
                    color="#2D3440"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Settings")}
                  activeOpacity={0.7}
                  style={{ marginLeft: 16 }}
                >
                  <MaterialIcons name="settings" size={24} color="#2D3440" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate("About")}
                  activeOpacity={0.7}
                  style={{ marginLeft: 16 }}
                >
                  <MaterialIcons name="info" size={24} color="#2D3440" />
                </TouchableOpacity>
              </View>
            ),
          })}
        />

        <Stack.Screen
          name="ProjectForm"
          component={ProjectFormScreen}
          options={({ route }) => ({
            title: route.params?.projectId
              ? "Редактировать проект"
              : "Новый проект",
          })}
        />

        <Stack.Screen
          name="ProjectDetails"
          component={ProjectDetailsScreen}
          options={{ title: "Детали проекта" }}
        />

        <Stack.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: "История изменений" }}
        />

        <Stack.Screen
          name="Export"
          component={ExportScreen}
          options={{ title: "Экспорт данных" }}
        />

        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: "Настройки" }}
        />

        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{ title: "О компании" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
