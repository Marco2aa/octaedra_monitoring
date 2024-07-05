import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { usePushNotification } from "@/components/usePushNotification";
import { Button } from "react-native-paper";
import axios from "axios";

const Notification = () => {
  const { notification, expoPushToken } = usePushNotification();

  const data = JSON.stringify(notification, undefined, 2);

  const sendTokenToBackend = async (token: string | undefined) => {
    try {
      const response = await axios.post(
        "http://35.180.190.115:8000/register-token",
        {
          token: token,
        }
      );
      console.log("Token envoyé au backend avec succès:", response.data);
    } catch (error) {
      console.error("Erreur lors de l'envoi du token au backend:", error);
    }
  };
  const sendNotification = async (token: string | undefined) => {
    try {
      const response = await axios.post(
        "http://35.180.190.115:8000/register-token",
        {
          token: token,
        }
      );
      console.log("Token envoyé au backend avec succès:", response.data);
    } catch (error) {
      console.error("Erreur lors de l'envoi du token au backend:", error);
    }
  };

  const handleNotificationPress = () => {
    sendTokenToBackend(expoPushToken?.data);
  };

  return (
    <View style={styles.container}>
      <Text>Token: {expoPushToken?.data ?? ""}</Text>
      <Text>{data}</Text>
      <Button onPress={handleNotificationPress}>Send notification</Button>
    </View>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
