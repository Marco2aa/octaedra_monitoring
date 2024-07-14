import { Colors } from "@/constants/Colors";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/components/ThemeContext";

type NotificationProps = {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  expo_token_id: string;
};

const Notification: React.FC<NotificationProps> = ({
  id,
  title,
  body,
  createdAt,
  expo_token_id,
}) => {
  const { theme } = useTheme();

  const backgroundColor =
    theme === "dark" ? Colors.dark.background : Colors.light.background;
  const textColor = theme === "dark" ? Colors.dark.text : Colors.light.text;
  return (
    <View
      style={[styles.container, { backgroundColor: Colors.dark.itemcontainer }]}
    >
      <Text style={styles.title}>ID: {id}</Text>
      <Text style={styles.message}>{title}</Text>
      <Text style={styles.description}>{body}</Text>
      <Text style={styles.timestamp}>Timestamp: {createdAt}</Text>
      <Text style={styles.token}>Expo Token: {expo_token_id}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "orange",
  },
  message: {
    fontSize: 16,
    marginBottom: 5,
    color: "white",
  },
  description: {
    fontSize: 14,
    marginBottom: 5,
    color: "white",
  },
  timestamp: {
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 5,
    color: "white",
  },
  token: {
    fontSize: 12,
    color: "#888",
  },
});

export default Notification;
