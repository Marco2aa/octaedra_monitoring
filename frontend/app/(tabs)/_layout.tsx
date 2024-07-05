import React, { useState, useEffect, useRef } from "react";
import { Tabs } from "expo-router";
import { View, Text, Platform, AppState, AppStateStatus } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TouchableOpacity } from "react-native-gesture-handler";
import { BottomSheetModal, useBottomSheetModal } from "@gorhom/bottom-sheet";
import CustomBottomSheetModal from "@/components/CustomBottomSheetModal";
import { Feather } from "@expo/vector-icons";
import { FontAwesome6 } from "@expo/vector-icons";
import { SimpleLineIcons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  NativeStackNavigationProp,
  NativeStackNavigatorProps,
} from "react-native-screens/lib/typescript/native-stack/types";
import { FormProvider } from "@/components/FormProvider";
import { useFormContext } from "@/components/FormProvider";
import axios from "axios";
import { useTimer } from "@/components/TimerContext";

export default function Tablayout() {
  const { formData } = useFormContext();

  const navigation = useNavigation<NativeStackNavigatorProps>();

  const handlePresentModalPress = () => bottomSheetRef.current?.present();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { dismiss } = useBottomSheetModal();
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });

  const fetchTimeUntilNextQuarterHour = async () => {
    try {
      const response = await axios.get(
        "http://35.180.190.115:8000/next-quarter-hour"
      );
      setTimeLeft(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // Fetch the initial time
    fetchTimeUntilNextQuarterHour();

    // Update the time every second
    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime.seconds > 0) {
          return { ...prevTime, seconds: prevTime.seconds - 1 };
        } else if (prevTime.minutes > 0) {
          return { minutes: prevTime.minutes - 1, seconds: 59 };
        } else {
          // When the timer reaches zero, fetch new time
          fetchTimeUntilNextQuarterHour();
          return { minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(timerId);
  }, []);

  const addAllInfoUrl = async () => {
    try {
      const response = await axios.post(
        "http://35.180.190.115:8000/add-all-infourl"
      );
      const data = response.data;
      console.log(data);
    } catch (error) {
      console.error("Error", error);
    }
  };

  const submitFormData = async () => {
    let url_id: number;
    const completeFormData = {
      url: formData.url,
      nom: formData.servername,
      protocole: formData.protocol,
      qualite_signal: formData.qualite,
      mode_connexion: formData.update,
      domain: formData.isSwitchDomainOn,
      verify_ssl: formData.isSwitchSSLOn,
      method: formData.method,
      ipv6: formData.isIPV6,
      timeout: formData.timeout,
    };
    try {
      const response = await axios.post(
        "http://35.180.190.115:8000/add-url",
        completeFormData
      );
      const data = response.data;
      console.log(completeFormData);
      console.log(data);
      url_id = data.id;
      console.log(formData.chips);
      if (formData.chips && formData.chips.length > 0) {
        await Promise.all(
          formData.chips.map(async (chip) => {
            const chipData = {
              num_code: chip.label,
            };
            const responseTwo = await axios.post(
              `http://35.180.190.115:8000/add-codehttp/${url_id}`,
              chipData
            );
            const data = responseTwo.data;
            console.log(data);
          })
        );
        navigation.navigate("index");
      }
    } catch (error) {
      console.error('Erreur lors de la creation de l"url ', error);
    }
  };

  return (
    <>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: "absolute",
            bottom: 0,
            right: 0,
            left: 0,
            height: 72,
            elevation: 0,
            backgroundColor: "#242627",
            borderColor: "#242627",
          },
        }}
      >
        <Tabs.Screen
          name="addserver"
          options={{
            title: "",
            headerShown: true,
            tabBarStyle: {
              display: "none",
            },
            headerTitle: "Ajoutez un serveur",
            headerTitleAlign: "center",
            headerStyle: {
              backgroundColor: "#242627",
            },
            headerTitleStyle: {
              color: "white",
            },
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate("index")}
                style={{ marginLeft: 15 }}
              >
                <FontAwesome6 name="arrow-left" size={24} color="white" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={submitFormData}
                style={{ marginRight: 15 }}
              >
                <AntDesign name="circledowno" size={24} color="white" />
              </TouchableOpacity>
            ),
            tabBarIcon: ({ focused }) => {
              return (
                <View
                  style={{
                    alignItems: "center",
                    paddingTop: 10,
                    borderTopColor: focused ? "white" : "rgba(0, 0, 0, 0)",
                    borderTopWidth: 4,
                  }}
                >
                  <FontAwesome6 name="add" size={25} color="lightgrey" />
                </View>
              );
            },
          }}
        />
        <Tabs.Screen
          name="Settings/settings"
          options={{
            title: "",
            tabBarIcon: ({ focused }) => {
              return (
                <View
                  style={{
                    alignItems: "center",
                    paddingTop: 10,
                    borderTopColor: focused ? "white" : "rgba(0, 0, 0, 0)",
                    borderTopWidth: 4,
                  }}
                >
                  <Feather name="settings" size={25} color="lightgrey" />
                </View>
              );
            },
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: "",
            headerShown: true,
            headerTitle: "Nos serveurs",
            headerTitleAlign: "center",
            headerStyle: {
              backgroundColor: "#242627",
            },
            headerTitleStyle: {
              color: "white",
            },
            headerRight: () => (
              <TouchableOpacity
                onPress={() => {
                  handlePresentModalPress();
                }}
                style={{ marginRight: 15 }}
              >
                <FontAwesome name="sort-amount-desc" size={24} color="white" />
              </TouchableOpacity>
            ),
            tabBarIcon: ({ focused }) => {
              return (
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "orange",
                    width: Platform.OS == "ios" ? 50 : 60,
                    height: Platform.OS == "ios" ? 50 : 60,
                    top: Platform.OS == "ios" ? -10 : -27,
                    borderRadius: Platform.OS == "ios" ? 25 : 30,
                    borderColor: Colors.dark.background,
                    borderStyle: "solid",
                    borderWidth: 4,
                  }}
                >
                  <MaterialCommunityIcons
                    name="home-lightning-bolt-outline"
                    size={25}
                    color="black"
                  />
                  <Text
                    style={{
                      marginTop: 5,
                      fontSize: 20,
                      color: "white",
                      position: "absolute",
                      bottom: -35,
                    }}
                  >
                    {`${timeLeft.minutes
                      .toString()
                      .padStart(2, "0")}:${timeLeft.seconds
                      .toString()
                      .padStart(2, "0")}`}
                  </Text>
                </View>
              );
            },
          }}
        />

        <Tabs.Screen
          name="notification"
          options={{
            title: "",
            tabBarIcon: ({ focused }) => {
              return (
                <View
                  style={{
                    alignItems: "center",
                    paddingTop: 10,
                    borderTopColor: focused ? "white" : "rgba(0, 0, 0, 0)",
                    borderTopWidth: 4,
                  }}
                >
                  <Text>
                    <FontAwesome6 name="bell" size={25} color="lightgrey" />
                  </Text>
                </View>
              );
            },
          }}
        />
        <Tabs.Screen
          name="auth/auth"
          options={{
            title: "",
            tabBarIcon: ({ focused }) => {
              return (
                <View
                  style={{
                    alignItems: "center",
                    paddingTop: 10,
                    borderTopColor: focused ? "white" : "rgba(0, 0, 0, 0)",
                    borderTopWidth: 4,
                  }}
                >
                  <SimpleLineIcons name="login" size={25} color="lightgrey" />
                </View>
              );
            },
          }}
        />
      </Tabs>
      <CustomBottomSheetModal ref={bottomSheetRef}></CustomBottomSheetModal>
    </>
  );
}
