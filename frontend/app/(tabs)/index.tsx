import {
  Alert,
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Dimensions,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Colors } from "../../constants/Colors";
import { useTheme } from "@/components/ThemeContext";
import axios from "axios";
import { router } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetModal,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { Swipeable } from "react-native-gesture-handler";
import { ProgressBar, MD3Colors, Chip } from "react-native-paper";
import { useDataContext } from "@/components/DataContext";
import { useTimer } from "@/components/TimerContext";

const Index = () => {
  type Server = {
    id: number;
    url: string;
    nom: string;
    protocole: string;
    qualite_signal: string;
    mode_connexion: string;
    domain: boolean;
    verify_ssl: boolean;
    method: string;
    ipv6: boolean;
  };

  const [servers, setServers] = useState<Server[]>([]);
  const snapPoints = useMemo(() => ["25%", "50%", "75%"], []);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [portsMap, setPortsMap] = useState<{ [key: string]: number }>({});
  const [refreshing, setRefreshing] = React.useState(false);
  const [loadingMap, setLoadingMap] = useState<{ [key: number]: boolean }>({});
  const [serverDataMap, setServerDataMap] = useState<{
    [key: string]: {
      ip: string;
      version: string;
      packetLoss: number;
      avg_latency: number;
    };
  }>({});
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

  const addAllInfoUrl = async () => {
    try {
    } catch (error) {
      console.error(error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      getServers();
      setRefreshing(false);
    }, 2000);
  }, []);

  const getServers = async () => {
    try {
      const response = await axios.get<Server[]>(
        "http://35.180.190.115:8000/urls"
      );
      const fetchedServers = response.data;

      const portPromises = fetchedServers.map(async (server) => {
        try {
          const response = await axios.get(
            `http://35.180.190.115:8000/number-of-ports/${server.id}`
          );
          const numberOfPorts = response.data;
          return { id: server.id, numberOfPorts };
        } catch (error) {
          console.error(
            "Erreur lors de la récupération du nombre de ports pour le serveur",
            server.id,
            error
          );
          return null;
        }
      });

      const dataPromises = fetchedServers.map(async (server) => {
        try {
          const response = await axios.get(
            `http://35.180.190.115:8000/get/info-url/${server.id}`
          );
          const { ip_address, server_version, packets_loss, avg_latency } =
            response.data;
          return {
            id: server.id,
            ip_address,
            server_version,
            packets_loss,
            avg_latency,
          };
        } catch (error) {
          console.error(
            "Erreur lors de la récupération des données pour le serveur",
            server.id,
            error
          );
          return null;
        }
      });

      const resolvedPorts = await Promise.all(portPromises);
      const validPorts = resolvedPorts.filter(
        (port): port is { id: number; numberOfPorts: number } => port !== null
      );
      const portsMap = validPorts.reduce<{ [key: string]: number }>(
        (acc, port) => {
          acc[port.id] = port.numberOfPorts;
          return acc;
        },
        {}
      );

      const resolvedData = await Promise.all(dataPromises);
      const validData = resolvedData.filter(
        (
          data
        ): data is {
          id: number;
          ip_address: string;
          server_version: string;
          packets_loss: number;
          avg_latency: number;
        } => data !== null
      );
      const serverDataMap = validData.reduce<{
        [key: string]: {
          ip: string;
          version: string;
          packetLoss: number;
          avg_latency: number;
        };
      }>((acc, data) => {
        acc[data.id] = {
          ip: data.ip_address,
          version: data.server_version,
          packetLoss: data.packets_loss,
          avg_latency: data.avg_latency,
        };
        return acc;
      }, {});

      setServers(fetchedServers);
      setPortsMap(portsMap);
      setServerDataMap(serverDataMap);
      console.log(serverDataMap);
    } catch (error) {
      console.error("Erreur lors de la récupération des serveurs", error);
    }
  };

  const deleteServerById = async (id: number) => {
    try {
      const response = await axios.delete(
        `http://35.180.190.115:8000/delete-url/${id}`,
        {
          headers: {
            accept: "application/json",
          },
        }
      );
      console.log(response.data);
    } catch (error) {
      console.error("Erreur lors de la suppresion de l'élément", error);
    }
  };

  useEffect(() => {
    getServers();
    console.log(serverDataMap);
  }, []);

  const { theme } = useTheme();

  const backgroundColor =
    theme === "dark" ? Colors.dark.background : Colors.light.background;
  const textColor = theme === "dark" ? Colors.dark.text : Colors.light.text;

  const handleRightSwipe = (id: number) => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer cet élément ?",
      [
        {
          text: "Annuler",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Supprimer",
          onPress: () => deleteServerById(id),
        },
      ],
      { cancelable: false }
    );
  };

  const handleLongPress = async (id: number) => {
    try {
      setLoadingMap((prev) => ({ ...prev, [id]: true }));
      const response = await axios.post(
        `http://35.180.190.115:8000/scan-ports/${id}`
      );
      if (response.status === 200) {
        Alert.alert("Succès", "Scan des ports terminé et ports insérés");
      } else {
        Alert.alert("Erreur", "Erreur lors du scan des ports");
      }
      setLoadingMap((prev) => ({ ...prev, [id]: false }));
    } catch (error) {
      console.error("Erreur lors du scan des ports", error);
      Alert.alert("Erreur", "Erreur lors du scan des ports");
      setLoadingMap((prev) => ({ ...prev, [id]: false }));
    }
  };

  useEffect(() => {
    fetchTimeUntilNextQuarterHour();

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime.seconds > 0) {
          return { ...prevTime, seconds: prevTime.seconds - 1 };
        } else if (prevTime.minutes > 0) {
          return { minutes: prevTime.minutes - 1, seconds: 59 };
        } else {
          fetchTimeUntilNextQuarterHour();
          return { minutes: 0, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const renderRightActions = (id: number) => (
    <View style={styles.rightActions}>
      <TouchableOpacity
        onPress={() => handleRightSwipe(id)}
        style={styles.deleteButton}
      >
        <Text style={styles.actionText}>Supprimer</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() =>
          router.push({ pathname: "/Serveurs/[id]", params: { id } })
        }
        style={styles.editButton}
      >
        <Text style={styles.actionText}>Modifier</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView
      style={[styles.mainContainer, { backgroundColor }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {servers.map((item) => (
        <Swipeable
          key={item.id}
          renderRightActions={() => renderRightActions(item.id)}
        >
          <Pressable
            key={item.id}
            onLongPress={() => handleLongPress(item.id)}
            onPress={() =>
              router.push({
                pathname: "/Serveurs/[id]",
                params: { id: item.id },
              })
            }
          >
            <View
              style={[
                styles.containerItem,
                {
                  backgroundColor:
                    theme === "dark"
                      ? Colors.dark.itemcontainer
                      : Colors.light.itemcontainer,
                },
              ]}
            >
              <View style={styles.iconcontainer}>
                <AntDesign name="earth" size={24} color="black" />
              </View>
              <View style={styles.itemContent}>
                <View
                  style={{
                    flexDirection: "row",
                    gap: 13,
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    position: "relative",
                  }}
                >
                  <Text
                    style={[
                      styles.text,
                      { color: "orange", fontSize: 26, fontWeight: "600" },
                    ]}
                  >
                    {item.nom}
                  </Text>
                  <View style={{ position: "absolute", right: 40 }}>
                    {serverDataMap[item.id]?.packetLoss === 0 ? (
                      <Chip
                        mode="outlined"
                        style={{ backgroundColor: "green" }}
                      >
                        Online
                      </Chip>
                    ) : (
                      <View
                        style={{ position: "absolute", right: -50, top: -21 }}
                      >
                        <Chip
                          mode="outlined"
                          style={{ backgroundColor: "red" }}
                        >
                          Offline
                        </Chip>
                      </View>
                    )}
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row-reverse",
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flexDirection: "column" }}>
                    <View
                      style={{
                        flexDirection: "row-reverse",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Text
                        style={[
                          styles.text,
                          {
                            color: "white",
                          },
                        ]}
                      >
                        {item.url}
                      </Text>
                      <Text
                        style={[
                          styles.text,
                          {
                            color: "white",
                          },
                        ]}
                      >
                        {item.protocole}
                      </Text>
                    </View>
                    <Text style={[styles.text, { color: textColor }]}>
                      {serverDataMap[item.id]?.ip ?? "Chargement..."}
                    </Text>
                    <Text style={[styles.text, { color: textColor }]}>
                      Serveur:{" "}
                      {serverDataMap[item.id]?.version ?? "Chargement..."}
                    </Text>
                    <Text
                      style={[
                        styles.text,
                        {
                          color: textColor,
                          flexWrap: "wrap",
                          fontSize: 15,
                          width: "80%",
                        },
                      ]}
                    >
                      {serverDataMap[item.id]?.packetLoss === 0
                        ? `0% de paquets perdus avec ${
                            serverDataMap[item.id]?.avg_latency ??
                            "Chargement..."
                          }ms de latence moyenne`
                        : `${
                            serverDataMap[item.id]?.packetLoss ??
                            "Chargement..."
                          }%`}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.text, { color: textColor }]}>
                  {portsMap[item.id] === 0
                    ? "Appui long pour scanner"
                    : `Nombre de ports scannés : ${portsMap[item.id]}`}
                </Text>
                {loadingMap[item.id] && (
                  <ProgressBar
                    indeterminate
                    color={MD3Colors.error50}
                    style={{ marginTop: 5, width: "90%" }}
                  />
                )}
              </View>
            </View>
          </Pressable>
        </Swipeable>
      ))}
    </ScrollView>
  );
};

export default Index;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    marginBottom: 65,
  },
  containerItem: {
    borderRadius: 8,
    padding: 10,
    paddingLeft: 12,
    marginTop: 5,
    marginHorizontal: 10,
    flexDirection: "row",
    gap: 10,
    marginBottom: 30,
    overflow: "hidden",
  },
  itemContent: {},
  text: {
    fontSize: 18,
    fontWeight: "300",
  },
  list: {
    paddingBottom: 30,
    marginBottom: 80,
  },
  iconcontainer: {
    backgroundColor: "orange",
    borderRadius: 8,
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "blue",
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    color: "white",
    fontSize: 16,
  },
  rightActions: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
});
