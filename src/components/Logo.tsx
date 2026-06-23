import React from "react";
import { View, Image, StyleSheet } from "react-native";

interface LogoProps {
  size?: number;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 60 }) => {
  const logoSize = size * 0.7;
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={require("../../assets/images/logo.png")}
        style={{
          width: logoSize,
          height: logoSize,
          resizeMode: "contain",
          borderRadius: 16,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    shadowColor: "#2D3440",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    padding: 8,
  },
});

export default Logo;
