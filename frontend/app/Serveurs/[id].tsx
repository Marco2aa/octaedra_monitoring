import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { useTheme } from "@/components/ThemeContext";
import axios from "axios";
import { useDataContext } from "@/components/DataContext";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CartesianChart, Line, useChartPressState } from "victory-native";
import { Platform } from "react-native";
import { useFont } from "@shopify/react-native-skia";
import { format } from "date-fns";
import type { SharedValue } from "react-native-reanimated";
import { Circle } from "@shopify/react-native-skia";

type Port = {
  id_port: string;
  port: string;
  service: string;
  status: string;
  latency: number;
  updatedAt: string;
};

type Data = {
  x: string;
  y: number;
};
const DATA = Array.from({ length: 31 }, (_, i) => ({
  day: i,
  highTmp: 40 + 30 * Math.random(),
}));

const ServerDetail: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { state: dataContextState, dispatch } = useDataContext();
  const [data, setData] = useState<Data[]>([]);
  const font = useFont(require("../../assets/fonts/Poppins-Regular.ttf"), 12);

  const { state: chartPressState, isActive } = useChartPressState({
    x: "",
    y: { y: 0 },
  });

  function ToolTip({
    x,
    y,
  }: {
    x: SharedValue<number>;
    y: SharedValue<number>;
  }) {
    return <Circle cx={x} cy={y} r={8} color="black" />;
  }

  const getPortsByServer = async (id: string) => {
    try {
      const response = await axios.get<Port[]>(
        `http://192.168.1.94:8000/ports/${id}`
      );
      console.log("Ports response:", response.data);
      const fetchedPorts = response.data;
      const completePorts = await Promise.all(
        fetchedPorts.map(async (port) => {
          try {
            const responseTwo = await axios.get(
              `http://192.168.1.94:8000/get/info-port/${port.id_port}`
            );
            const infoPortArray = responseTwo.data;
            if (infoPortArray.length > 0) {
              const { service, status, latency, updatedAt } = infoPortArray[0];
              console.log(
                `InfoPort for port ${port.id_port}:`,
                infoPortArray[0]
              );
              const completePort = {
                ...port,
                service,
                status,
                latency,
                updatedAt,
              };
              console.log("Complete port:", completePort);
              return completePort;
            } else {
              console.log(`No additional info found for port ${port.id_port}`);
              return port;
            }
          } catch (error) {
            console.error(
              `Erreur lors de la récupération des informations du port ${port.id_port}`,
              error
            );
            return port;
          }
        })
      );
      dispatch({ type: "SET_PORTS", payload: completePorts });
    } catch (error) {
      console.error(
        "Erreur lors de la recuperation des ports du serveur",
        error
      );
    }
  };

  const getInfoByUrl = async (id: string) => {
    try {
      const response = await axios.get(
        `http://192.168.1.94:8000/get/info-url/${id}`
      );
      console.log("Info URL response:", response.data);
      dispatch({ type: "SET_INFO_URL", payload: response.data });
      dispatch({
        type: "SET_SERVER_IP",
        payload: { serverId: id, ipAddress: response.data.ip_address },
      });
      console.log(id, response.data.ip_adress);
      console.log(dataContextState.serversIPs[id]);
    } catch (error) {
      console.error("Erreur lors de la récuperation des infos serveurs", error);
    }
  };

  const addInfoUrl = async () => {
    try {
      const response = await axios.post(
        `http://192.168.1.94:8000/add-infourl/${id}`
      );
      console.log(response.data);
    } catch (error) {
      console.error("Erreur lors de la récuperation des infos serveurs", error);
    }
  };

  const getLastItems = async (id: string) => {
    try {
      const response = await axios.get(
        `http://192.168.1.94:8000/get-last-250/${id}`
      );
      console.log("Last items response:", response.data);
      dispatch({ type: "SET_LAST_ITEMS", payload: response.data });

      let dataArray = response.data;
      if (!Array.isArray(dataArray)) {
        dataArray = dataArray.data;
      }

      if (Array.isArray(dataArray)) {
        const formattedData: Data[] = dataArray.map((item) => ({
          x: item[20],
          y: item[6],
        }));
        setData(formattedData);
        console.log("formattedData", formattedData);
      } else {
        console.error("Les données récupérées ne sont pas au format attendu.");
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des derniers éléments",
        error
      );
    }
  };

  useEffect(() => {
    if (id !== undefined) {
      getPortsByServer(id);
      getInfoByUrl(id);
      getLastItems(id);
    }
  }, [id]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: `Server Details - ${id}`,
      headerStyle: {
        backgroundColor: "orange",
      },
      headerTintColor: "black",
      headerTitleStyle: {
        fontWeight: "bold",
      },
      headerRight: () => <MaterialIcons name="radar" size={34} color="black" />,
    });
  }, [navigation, id]);

  const { theme } = useTheme();

  const backgroundColor =
    theme === "dark" ? Colors.dark.background : Colors.light.background;
  const textColor = theme === "dark" ? Colors.dark.text : Colors.light.text;

  const formattedDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  };
  const formattedAxisDate = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  const renderPortItem = ({ item }: { item: Port }) => (
    <View
      style={[
        styles.containerItem,
        {
          backgroundColor:
            item.status === "open"
              ? "green"
              : item.status === "filtered"
              ? "orange"
              : "red",
        },
      ]}
    >
      <Pressable>
        <View>
          <View style={styles.icon}>
            {item.status === "open" ? (
              <Ionicons name="cloud-done-outline" size={30} color="white" />
            ) : item.status === "filtered" ? (
              <MaterialCommunityIcons
                name="cloud-lock-outline"
                size={30}
                color="white"
              />
            ) : (
              <Ionicons name="cloud-offline-outline" size={30} color="white" />
            )}
          </View>

          <Text style={[styles.text, { color: textColor }]}>
            Numéro du Port: {item.port}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Service utilisé: {item.service}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Latence :{item.latency} ms
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Dernière mise à jour : {formattedDate(item.updatedAt)}
          </Text>
        </View>
      </Pressable>
    </View>
  );

  return (
    <ScrollView style={[styles.mainContainer, { backgroundColor }]}>
      {Platform.OS !== "web" && (
        <View
          style={{ width: "90%", marginLeft: "5%", height: 500, marginTop: 30 }}
        >
          {data.length > 0 && (
            <>
              {!isActive && (
                <View>
                  <Text
                    style={{
                      fontSize: 30,
                      fontWeight: "bold",
                      color: "lightgrey",
                    }}
                  >
                    Today
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "bold",
                      color: "lightgrey",
                    }}
                  >
                    {formattedAxisDate(data[data.length - 1].x)}
                  </Text>
                </View>
              )}
              {isActive && (
                <View>
                  <Text
                    style={{
                      fontSize: 30,
                      fontWeight: "bold",
                      color: "lightgrey",
                    }}
                  >
                    Today
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "bold",
                      color: "lightgrey",
                    }}
                  >
                    {formattedAxisDate(data[data.length - 1].x)}
                  </Text>
                </View>
              )}
              <CartesianChart
                data={data}
                xKey="x"
                yKeys={["y"]}
                axisOptions={{
                  font,
                  formatYLabel: (y) => `${y} ms`,
                  formatXLabel: (x) => formattedAxisDate(x),
                  labelColor: "lightgrey",
                }}
                chartPressState={chartPressState}
              >
                {({ points }) => (
                  <>
                    <Line points={points.y} color="red" strokeWidth={3} />
                    {isActive && (
                      <ToolTip
                        x={chartPressState.x.position}
                        y={chartPressState.y.y.position}
                      />
                    )}
                  </>
                )}
              </CartesianChart>
            </>
          )}
        </View>
      )}
      {dataContextState.infoUrl && (
        <View style={styles.infoContainer}>
          <Text style={[styles.text, { color: textColor }]}>
            IP Address: {dataContextState.infoUrl.ip_address}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Server Version: {dataContextState.infoUrl.server_version}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Packets Sent: {dataContextState.infoUrl.packets_sent}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Packets Received: {dataContextState.infoUrl.packets_received}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Packets Lost: {dataContextState.infoUrl.packets_lost}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Average Latency: {dataContextState.infoUrl.avg_latency}
          </Text>

          <Text style={[styles.text, { color: textColor }]}>
            Min Latency: {dataContextState.infoUrl.min_latency}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Max Latency: {dataContextState.infoUrl.max_latency}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Packet Sizes: {dataContextState.infoUrl.packet_sizes}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            ICMP Version: {dataContextState.infoUrl.icmp_version}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            DNS Resolution Time: {dataContextState.infoUrl.dns_resolution_time}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            SSL Issuer: {dataContextState.infoUrl.ssl_issuer}
          </Text>
          {dataContextState.infoUrl.ssl_issued_on !== null && (
            <Text style={[styles.text, { color: textColor }]}>
              Emetteur SSL: {dataContextState.infoUrl.ssl_issued_on}
            </Text>
          )}
          <Text style={[styles.text, { color: textColor }]}>
            Domain Creation Date:{" "}
            {formattedDate(dataContextState.infoUrl.domain_creation_date)}
          </Text>
          <Text style={[styles.text, { color: textColor }]}>
            Domain Expiration Date:{" "}
            {formattedDate(dataContextState.infoUrl.domain_expiration_date)}
          </Text>
        </View>
      )}
      <View>
        <FlatList
          data={dataContextState.ports}
          keyExtractor={(item) => item.id_port}
          renderItem={renderPortItem}
          contentContainerStyle={styles.list}
          horizontal={true}
        />
      </View>
    </ScrollView>
  );
};

export default ServerDetail;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  infoContainer: {
    margin: 10,
  },
  infoItem: {
    marginBottom: 5,
  },
  containerItem: {
    borderRadius: 8,
    margin: 10,
    padding: 10,
    width: 250,
    height: 150,
    justifyContent: "center",
  },
  itemContent: {
    flex: 1,
    justifyContent: "space-around",
  },
  text: {
    fontSize: 18,
  },
  list: {
    paddingBottom: 30,
    marginBottom: 80,
  },
  icon: {
    position: "absolute",
    right: 0,
    marginRight: 10,
  },
  chartContainer: {
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
  },
});
