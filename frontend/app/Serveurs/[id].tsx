import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { useTheme } from "@/components/ThemeContext";
import axios from "axios";
import { useDataContext } from "@/components/DataContext";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Bar, CartesianChart, Line, useChartPressState } from "victory-native";
import { Platform } from "react-native";
import { useFont } from "@shopify/react-native-skia";
import { format, set } from "date-fns";
import type { SharedValue } from "react-native-reanimated";
import Animated, { useAnimatedProps } from "react-native-reanimated";
Animated.addWhitelistedNativeProps({ text: true });
import { Circle } from "@shopify/react-native-skia";
import { Button, Divider, Menu, Portal } from "react-native-paper";
import { TextInput as Input } from "react-native-paper";
import MyCustomBars from "@/components/CustomBars";
import MyCustomLine from "@/components/CustomLine";
import { useTimer } from "@/components/TimerContext";

interface DataSets {
  last24Hours: Data[];
  lastWeek: Data[];
  lastMonth: Data[];
}

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

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const ServerDetail: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { state: dataContextState, dispatch } = useDataContext();
  const [data, setData] = useState<Data[]>([]);
  const font = useFont(require("../../assets/fonts/Poppins-Regular.ttf"), 12);
  const [chartType, setChartType] = useState<"Line" | "Bar">("Line");
  const [currentDataset, setCurrentDataset] = useState("last24Hours");
  const [typeVisible, setTypeVisible] = useState(false);
  const [periodVisible, setPeriodVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Week");
  const [timeData, setTimeData] = useState<{
    [key: string]: Data[];
  }>({
    last24Hours: [],
    lastWeek: [],
    lastMonth: [],
  });
  const { timeLeft, resetTimer, onTimerEnd } = useTimer();

  useEffect(() => {
    const handleTimerEnd = () => {
      console.log("Le timer est terminé !");
      addInfoUrl();
    };

    const cleanup = onTimerEnd(handleTimerEnd);
    return cleanup;
  }, [onTimerEnd]);

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

  const openTypeMenu = () => setTypeVisible(true);
  const closeTypeMenu = () => setTypeVisible(false);

  const openPeriodMenu = () => setPeriodVisible(true);
  const closePeriodMenu = () => setPeriodVisible(false);

  const periods = {
    "24h": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "1m": 30 * 24 * 60 * 60 * 1000,
  };

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

  // const getLastItems = async (id: string) => {
  //   try {
  //     const response = await axios.get(
  //       `http://192.168.1.94:8000/get-last-250/${id}`
  //     );
  //     console.log("Last items response:", response.data);
  //     dispatch({ type: "SET_LAST_ITEMS", payload: response.data });

  //     let dataArray = response.data;
  //     if (!Array.isArray(dataArray)) {
  //       dataArray = dataArray.data;
  //     }

  //     if (Array.isArray(dataArray)) {
  //       const formattedData: Data[] = dataArray.map((item) => ({
  //         x: item[20],
  //         y: item[6],
  //       }));

  //       formattedData.sort((a, b) => {
  //         const dateA = new Date(a.x);
  //         const dateB = new Date(b.x);
  //         return dateA.getTime() - dateB.getTime();
  //       });

  //       const currentDate = new Date();

  //       const last24HoursData = formattedData.filter((item) => {
  //         const itemDate = new Date(item.x);
  //         return (
  //           itemDate.getTime() > currentDate.getTime() - 24 * 60 * 60 * 1000
  //         );
  //       });

  //       const lastWeekData = formattedData.filter((item) => {
  //         const itemDate = new Date(item.x);
  //         return (
  //           itemDate.getTime() > currentDate.getTime() - 7 * 24 * 60 * 60 * 1000
  //         );
  //       });

  //       const lastMonthData = formattedData.filter((item) => {
  //         const itemDate = new Date(item.x);
  //         return (
  //           itemDate.getTime() >
  //           currentDate.getTime() - 30 * 24 * 60 * 60 * 1000
  //         );
  //       });

  //       setTimeData({
  //         last24Hours: last24HoursData,
  //         lastWeek: lastWeekData,
  //         lastMonth: lastMonthData,
  //       });

  //       setData(formattedData);

  //       console.log("formattedData", formattedData);
  //       console.log("Last 24 hours data:", last24HoursData);
  //       console.log("Last week data:", lastWeekData);
  //       console.log("Last month data:", lastMonthData);
  //     } else {
  //       console.error("Les données récupérées ne sont pas au format attendu.");
  //     }
  //   } catch (error) {
  //     console.error(
  //       "Erreur lors de la récupération des derniers éléments",
  //       error
  //     );
  //   }
  // };

  const filterDataByHourIntervals = (
    data: Data[],
    interval: number,
    currentDate: Date
  ): Data[] => {
    const filteredData: Data[] = [];
    const intervalInMillis = interval * 60 * 60 * 1000;
    const startTime = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);

    for (let i = 0; i < 24; i += interval) {
      const startDate = new Date(startTime.getTime() + i * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + intervalInMillis);

      const intervalData = data.find((item) => {
        const itemDate = new Date(item.x);
        return itemDate >= startDate && itemDate < endDate;
      });

      if (intervalData) {
        filteredData.push(intervalData);
      }
    }

    return filteredData;
  };

  // Function to filter data by 6-hour intervals over the last week
  const filterDataBySixHourIntervals = (
    data: Data[],
    currentDate: Date
  ): Data[] => {
    const filteredData: Data[] = [];
    const intervalInMillis = 6 * 60 * 60 * 1000;
    const startTime = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (let i = 0; i < 7 * 24; i += 6) {
      const startDate = new Date(startTime.getTime() + i * 60 * 60 * 1000);
      const endDate = new Date(startDate.getTime() + intervalInMillis);

      const intervalData = data.find((item) => {
        const itemDate = new Date(item.x);
        return itemDate >= startDate && itemDate < endDate;
      });

      if (intervalData) {
        filteredData.push(intervalData);
      }
    }

    return filteredData;
  };

  // Function to filter data by day intervals over the last month
  const filterDataByDayIntervals = (
    data: Data[],
    currentDate: Date
  ): Data[] => {
    const filteredData: Data[] = [];
    const dayInMillis = 24 * 60 * 60 * 1000;
    const startTime = new Date(currentDate.getTime() - 30 * dayInMillis);

    for (let i = 0; i < 30; i++) {
      const startDate = new Date(startTime.getTime() + i * dayInMillis);
      const endDate = new Date(startDate.getTime() + dayInMillis);

      const intervalData = data.find((item) => {
        const itemDate = new Date(item.x);
        return itemDate >= startDate && itemDate < endDate;
      });

      if (intervalData) {
        filteredData.push(intervalData);
      }
    }

    return filteredData;
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

        formattedData.sort((a, b) => {
          const dateA = new Date(a.x);
          const dateB = new Date(b.x);
          return dateA.getTime() - dateB.getTime();
        });

        const currentDate = new Date();

        const last24HoursData = filterDataByHourIntervals(
          formattedData,
          1,
          currentDate
        );
        const lastWeekData = filterDataBySixHourIntervals(
          formattedData,
          currentDate
        );
        const lastMonthData = filterDataByDayIntervals(
          formattedData,
          currentDate
        );

        setTimeData({
          last24Hours: last24HoursData,
          lastWeek: lastWeekData,
          lastMonth: lastMonthData,
        });

        setData(formattedData);

        console.log("formattedData", formattedData);
        console.log("Last 24 hours data:", last24HoursData);
        console.log("Last week data:", lastWeekData);
        console.log("Last month data:", lastMonthData);
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
  }, []);

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

  const animatedText = useAnimatedProps(() => {
    return {
      text: `${chartPressState.y.y.value.value} ms`,
      defaultValue: "",
    };
  });

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

  const animatedDateText = useAnimatedProps(() => {
    console.log(
      "chartPressState.x.value.value:",
      chartPressState.x.value.value
    );
    const date = new Date(chartPressState.x.value.value);

    return {
      text: `${date}`,
      defaultValue: "",
    };
  });

  const chartBounds = {
    left: data.length > 0 ? new Date(data[0].x).getTime() : 0,
    bottom: 0,
  };

  const handlePeriodChange = (period: string) => {
    let datasetKey: keyof DataSets;
    switch (period) {
      case "24Hours":
        datasetKey = "last24Hours";
        break;
      case "Week":
        datasetKey = "lastWeek";
        break;
      case "Month":
        datasetKey = "lastMonth";
        break;
      default:
        datasetKey = "lastWeek";
        break;
    }

    setSelectedPeriod(period);
    setCurrentDataset(datasetKey);
    setPeriodVisible(false);
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
          style={{
            width: "90%",
            marginLeft: "5%",
            height: 500,
            marginTop: 30,
            backgroundColor: Colors.dark.itemcontainer,
            padding: 10,
            borderRadius: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Pressable onPress={openTypeMenu}>
              <Input
                mode="outlined"
                label="Chart Type"
                value={chartType}
                activeOutlineColor="orange"
                editable={false}
                right={
                  <Input.Icon
                    icon={() => (
                      <AntDesign name="caretdown" size={20} color="orange" />
                    )}
                  />
                }
              />
            </Pressable>
            <Portal>
              <Menu
                visible={typeVisible}
                onDismiss={closeTypeMenu}
                anchor={{ x: 340, y: 0 }}
                style={{ marginTop: 40 }}
              >
                <Menu.Item onPress={() => setChartType("Line")} title="Line" />
                <Divider />
                <Menu.Item onPress={() => setChartType("Bar")} title="Bar" />
              </Menu>
            </Portal>
            <Pressable onPress={openPeriodMenu}>
              <Input
                mode="outlined"
                label="Time period"
                value={selectedPeriod}
                activeOutlineColor="orange"
                editable={false}
                right={
                  <Input.Icon
                    icon={() => (
                      <AntDesign name="caretdown" size={20} color="orange" />
                    )}
                  />
                }
              />
            </Pressable>
            <Portal>
              <Menu
                visible={periodVisible}
                onDismiss={closePeriodMenu}
                anchor={{ x: 340, y: 0 }}
                style={{ marginTop: 40 }}
              >
                <Menu.Item
                  onPress={() => handlePeriodChange("24Hours")}
                  title="24 Hours"
                />
                <Divider />
                <Menu.Item
                  onPress={() => handlePeriodChange("Week")}
                  title="Week"
                />
                <Divider />
                <Menu.Item
                  onPress={() => handlePeriodChange("Month")}
                  title="Month"
                />
              </Menu>
            </Portal>
          </View>

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
                    {data[data.length - 1].y} ms
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
                  <AnimatedTextInput
                    editable={false}
                    underlineColorAndroid={"transparent"}
                    style={{
                      fontSize: 30,
                      fontWeight: "bold",
                      color: "lightgrey",
                    }}
                    animatedProps={animatedText}
                  ></AnimatedTextInput>
                  <AnimatedTextInput
                    editable={false}
                    underlineColorAndroid={"transparent"}
                    style={{
                      fontSize: 15,
                      fontWeight: "bold",
                      color: "lightgrey",
                    }}
                    animatedProps={animatedDateText}
                  ></AnimatedTextInput>
                </View>
              )}
              {selectedPeriod === "24Hours" && (
                <>
                  {timeData["last24Hours"] &&
                  timeData["last24Hours"].length > 0 ? (
                    <CartesianChart
                      data={timeData["last24Hours"]}
                      xKey="x"
                      yKeys={["y"]}
                      axisOptions={{
                        tickCount: { x: 5, y: 5 },
                        font,
                        formatYLabel: (y) => `${y} ms`,
                        formatXLabel: (x) => formattedAxisDate(x),
                        labelColor: "lightgrey",
                      }}
                      chartPressState={chartPressState}
                      domainPadding={20}
                    >
                      {({ points, chartBounds }) => (
                        <>
                          {chartType === "Line" ? (
                            <MyCustomLine points={points.y} />
                          ) : (
                            <MyCustomBars
                              points={points.y}
                              chartBounds={chartBounds}
                            />
                          )}
                          {isActive && (
                            <ToolTip
                              x={chartPressState.x.position}
                              y={chartPressState.y.y.position}
                            />
                          )}
                        </>
                      )}
                    </CartesianChart>
                  ) : (
                    <Text>
                      Aucune donnée disponible pour les dernières 24 heures.
                    </Text>
                  )}
                </>
              )}
              {selectedPeriod === "Week" && (
                <>
                  {timeData["lastWeek"] && timeData["lastWeek"].length > 0 ? (
                    <CartesianChart
                      data={timeData["lastWeek"]}
                      xKey="x"
                      yKeys={["y"]}
                      axisOptions={{
                        tickCount: { x: 5, y: 5 },
                        font,
                        formatYLabel: (y) => `${y} ms`,
                        formatXLabel: (x) => formattedAxisDate(x),
                        labelColor: "lightgrey",
                      }}
                      chartPressState={chartPressState}
                      domainPadding={20}
                    >
                      {({ points, chartBounds }) => (
                        <>
                          {chartType === "Line" ? (
                            <MyCustomLine points={points.y} />
                          ) : (
                            <MyCustomBars
                              points={points.y}
                              chartBounds={chartBounds}
                            />
                          )}
                          {isActive && (
                            <ToolTip
                              x={chartPressState.x.position}
                              y={chartPressState.y.y.position}
                            />
                          )}
                        </>
                      )}
                    </CartesianChart>
                  ) : (
                    <Text>
                      Aucune donnée disponible pour la semaine dernière.
                    </Text>
                  )}
                </>
              )}
              {selectedPeriod === "Month" && (
                <>
                  {timeData["lastMonth"] && timeData["lastMonth"].length > 0 ? (
                    <CartesianChart
                      data={timeData["lastMonth"]}
                      xKey="x"
                      yKeys={["y"]}
                      axisOptions={{
                        tickCount: { x: 5, y: 5 },
                        font,
                        formatYLabel: (y) => `${y} ms`,
                        formatXLabel: (x) => formattedAxisDate(x),
                        labelColor: "lightgrey",
                      }}
                      chartPressState={chartPressState}
                      domainPadding={20}
                    >
                      {({ points, chartBounds }) => (
                        <>
                          {chartType === "Line" ? (
                            <MyCustomLine points={points.y} />
                          ) : (
                            <MyCustomBars
                              points={points.y}
                              chartBounds={chartBounds}
                            />
                          )}
                          {isActive && (
                            <ToolTip
                              x={chartPressState.x.position}
                              y={chartPressState.y.y.position}
                            />
                          )}
                        </>
                      )}
                    </CartesianChart>
                  ) : (
                    <Text>Aucune donnée disponible pour le mois dernier.</Text>
                  )}
                </>
              )}
            </>
          )}
        </View>
      )}
      {dataContextState.infoUrl && (
        <View
          style={[
            styles.infoContainer,
            { backgroundColor: Colors.dark.itemcontainer },
          ]}
        >
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
    marginTop: 20,
    width: "90%",
    marginLeft: "5%",
    padding: 10,
    borderRadius: 8,
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
    marginTop: 15,
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
