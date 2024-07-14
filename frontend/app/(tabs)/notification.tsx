import React, { useEffect, useState } from "react";
import { FlatList, SafeAreaView, StyleSheet } from "react-native";
import Notification from "@/components/Notification"; // Assurez-vous que le chemin soit correct
import axios from "axios";
import { usePushNotification } from "@/components/usePushNotification";
import { useTheme } from "@/components/ThemeContext";
import { Colors } from "@/constants/Colors";

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const { expoPushToken } = usePushNotification();

  const { theme } = useTheme();

  const backgroundColor =
    theme === "dark" ? Colors.dark.background : Colors.light.background;
  const textColor = theme === "dark" ? Colors.dark.text : Colors.light.text;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (expoPushToken?.data) {
          // Vérifier si expoPushToken et expoPushToken.data sont définis
          const response = await axios.get(
            `http://35.180.190.115:8000/notifications/${expoPushToken.data}`
          );
          setNotifications(response.data);
        } else {
          console.log(
            "expoPushToken or expoPushToken.data is undefined or null."
          );
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des notifications:",
          error
        );
      }
    };

    fetchNotifications();
  }, [expoPushToken]); // Ajouter expoPushToken comme dépendance

  const renderItem = ({ item }: { item: any }) => (
    <Notification
      id={item[0]}
      title={item[1]}
      body={item[2]}
      createdAt={item[3]}
      expo_token_id={item[4]}
    />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors.dark.background }]}
    >
      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={(item) => item[0].toString()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
});

export default NotificationsPage;
