import { View, Text } from "react-native";
import React, { useState } from "react";
import Login from "@/components/Login";
import Register from "@/components/Register";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/components/ThemeContext";

const Auth = () => {
  const [showLogin, setShowLogin] = useState(true);
  const { theme } = useTheme();

  const backgroundColor =
    theme === "dark" ? Colors.dark.background : Colors.light.background;
  const textColor = theme === "dark" ? Colors.dark.text : Colors.light.text;

  return (
    <View
      style={{
        backgroundColor: Colors.dark.background,
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {showLogin ? (
        <Login onSwitchToRegister={() => setShowLogin(false)} />
      ) : (
        <Register onSwitchToLogin={() => setShowLogin(true)} />
      )}
    </View>
  );
};

export default Auth;
