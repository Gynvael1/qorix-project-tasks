import React, { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";
import Navigation from "./src/navigation";
import { requestPermissions } from "./src/services/notificationService";

const App: React.FC = () => {
  useEffect(() => {
    const init = async () => {
      try {
        await requestPermissions();
      } catch (error) {
        console.warn("Ошибка инициализации уведомлений:", error);
      }
    };
    init();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <Navigation />
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default App;
