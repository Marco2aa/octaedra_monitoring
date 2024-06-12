import React, { useEffect, useState } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import {
  TextInput,
  Menu,
  Button,
  Divider,
  Provider as PaperProvider,
  Portal,
  Text,
  Switch,
  Chip,
  Modal,
  HelperText,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { StatusBar, setStatusBarHidden } from "expo-status-bar";
import { Colors } from "../../constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { useFormContext } from "@/components/FormProvider";

const AddServer = () => {
  const [protocolMenuVisible, setProtocolMenuVisible] = useState(false);
  const [methodMenuVisible, setMethodMenuVisible] = useState(false);
  const [qualiteMenuVisible, setQualiteMenuVisible] = useState(false);
  const [majMenuVisible, setMajMenuVisible] = useState(false);
  const [chips, setChips] = useState<ChipData[]>([]);
  const [visibleModal, setVisibleModal] = React.useState(false);
  const [codehttp, setCodehttp] = useState<string>("");
  const [isSSLSwitchDisabled, setIsSSLSwitchDisabled] = useState(false);
  const [isIPV6, setIsIPV6] = useState<boolean>(false);

  const { formData, setFormData } = useFormContext();

  const showModal = () => setVisibleModal(true);
  const hideModal = () => setVisibleModal(false);

  const openProtocolMenu = () => setProtocolMenuVisible(true);
  const closeProtocolMenu = () => setProtocolMenuVisible(false);

  const openMethodMenu = () => setMethodMenuVisible(true);
  const closeMethodMenu = () => setMethodMenuVisible(false);

  const openQualiteMenu = () => setQualiteMenuVisible(true);
  const closeQualiteMenu = () => setQualiteMenuVisible(false);

  const openMajMenu = () => setMajMenuVisible(true);
  const closeMajMenu = () => setMajMenuVisible(false);

  const hasErrors = () => {
    const number = parseInt(codehttp, 10);
    return isNaN(number) || number < 100 || number > 527;
  };

  const containerStyle = {
    backgroundColor: Colors.dark.itemcontainer,
    padding: 10,
  };

  interface ChipData {
    label: string;
    color: string;
  }

  const handleServernameChange = (newServername: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      servername: newServername,
    }));
  };

  const handleProtocolChange = (newProtocol: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      protocol: newProtocol,
    }));
    setIsSSLSwitchDisabled(formData.protocol === "https://");
    closeProtocolMenu();
  };

  const handleUrlChange = (newUrl: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      url: newUrl,
    }));
  };

  const handleSSLSwitchChange = (value: boolean) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      isSwitchSSLOn: value,
    }));
  };

  const handleDomainSwitchChange = (value: boolean) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      isSwitchDomainOn: value,
    }));
  };

  const handleIPVSwitchChange = (value: boolean) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      isIPV6: value,
    }));
  };

  const handleMethodChange = (value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      method: value,
    }));
    closeMethodMenu();
  };

  const handleQualiteChange = (value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      qualite: value,
    }));
    closeQualiteMenu();
  };

  const handleMajChange = (value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      update: value,
    }));
    closeMajMenu();
  };

  const getChipColor = (code: number): string => {
    if (code >= 100 && code < 200) return "blue";
    if (code >= 200 && code < 300) return "green";
    if (code >= 300 && code < 400) return "yellow";
    if (code >= 400 && code < 500) return "orange";
    if (code >= 500 && code <= 527) return "red";
    return "grey";
  };

  const handleAddChip = () => {
    const codeNumber = parseInt(codehttp, 10);
    if (codeNumber >= 100 && codeNumber <= 527) {
      const newChips = [
        ...chips,
        { label: codehttp, color: getChipColor(codeNumber) },
      ];
      setChips(newChips);
      setFormData((prevFormData) => ({
        ...prevFormData,
        chips: newChips,
      }));
      setCodehttp("");
      setVisibleModal(false);
    } else {
      console.log("Invalid code");
    }
  };

  const handleDeleteChip = (indexToRemove: number) => {
    setChips((prevChips) =>
      prevChips.filter((_, index) => index !== indexToRemove)
    );

    setFormData((prevFormData) => ({
      ...prevFormData,
      chips: prevFormData.chips.filter((_, index) => index !== indexToRemove),
    }));
  };

  useEffect(() => {
    setStatusBarHidden;
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "black", padding: 5 }}
      contentContainerStyle={{
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Text style={styles.text}>Affichage</Text>
      <TextInput
        mode="outlined"
        activeOutlineColor="orange"
        label="Nom d'affichage du serveur"
        value={formData.servername}
        onChangeText={handleServernameChange}
        style={[styles.input, { width: "100%" }]}
      />
      <Text style={styles.text}>Configuration</Text>
      <View style={styles.inputcontainer}>
        <TextInput
          mode="outlined"
          label="Protocol"
          value={formData.protocol}
          onChangeText={handleProtocolChange}
          activeOutlineColor="orange"
          editable={false}
          right={
            <TextInput.Icon
              icon={() => (
                <AntDesign
                  name="caretdown"
                  size={20}
                  color="orange"
                  onPress={openProtocolMenu}
                />
              )}
            />
          }
          style={[styles.input, { width: "35%" }]}
        />
        <Portal>
          <Menu
            visible={protocolMenuVisible}
            onDismiss={closeProtocolMenu}
            anchor={{ x: 20, y: 337 }}
            style={{
              width: "31%",
            }}
          >
            <Menu.Item
              onPress={() => handleProtocolChange("http://")}
              title="HTTP://"
            />
            <Divider />
            <Menu.Item
              onPress={() => handleProtocolChange("https://")}
              title="HTTPS://"
            />
          </Menu>
        </Portal>
        <TextInput
          mode="outlined"
          activeOutlineColor="orange"
          label="URL"
          value={formData.url}
          onChangeText={handleUrlChange}
          style={[styles.input, { width: "60%" }]}
        />
      </View>

      <TextInput
        mode="outlined"
        label="Method"
        value={formData.method}
        activeOutlineColor="orange"
        editable={false}
        right={
          <TextInput.Icon
            icon={() => (
              <AntDesign
                name="caretdown"
                size={20}
                color="orange"
                onPress={openMethodMenu}
              />
            )}
          />
        }
        style={[styles.input, { width: "100%" }]}
      />
      <Portal>
        <Menu
          visible={methodMenuVisible}
          onDismiss={closeMethodMenu}
          anchor={{ x: 340, y: 339 }}
          style={styles.menu}
        >
          <Menu.Item onPress={() => handleMethodChange("GET")} title="GET" />
          <Divider />
          <Menu.Item onPress={() => handleMethodChange("POST")} title="POST" />
          <Divider />
          <Menu.Item onPress={() => handleMethodChange("PUT")} title="PUT" />
          <Divider />
          <Menu.Item
            onPress={() => handleMethodChange("PATCH")}
            title="PATCH"
          />
          <Divider />
          <Menu.Item
            onPress={() => handleMethodChange("DELETE")}
            title="DELETE"
          />
        </Menu>
      </Portal>
      <View style={styles.switchwrapper}>
        <View style={styles.switchcontainer}>
          <Text>Vérifier la validité du certificat SSL</Text>
          <Switch
            disabled={isSSLSwitchDisabled}
            value={formData.isSwitchSSLOn}
            onValueChange={handleSSLSwitchChange}
          />
        </View>
        <View style={styles.switchcontainer}>
          <Text>Vérifier la validité du nom de domaine</Text>
          <Switch
            value={formData.isSwitchDomainOn}
            onValueChange={handleDomainSwitchChange}
          />
        </View>
        <View style={styles.switchcontainer}>
          <Text>Utiliser IPV6</Text>
          <Switch
            value={formData.isIPV6}
            onValueChange={handleIPVSwitchChange}
          />
        </View>
      </View>
      <View style={styles.chipcontainer}>
        <Text>Codes HTTP valides :</Text>
        <Chip
          icon={({ color }) => <Ionicons name="add" size={24} color={color} />}
          onPress={showModal}
          elevated={true}
        >
          Ajouter
        </Chip>
        <View style={styles.chipsWrapper}>
          {chips.map((chip, index) => (
            <Chip
              key={index}
              onClose={() => handleDeleteChip(index)}
              onPress={() => console.log("Pressed")}
              style={{
                backgroundColor: chip.color,
              }}
            >
              {chip.label}
            </Chip>
          ))}
        </View>
      </View>
      <Portal>
        <Modal
          style={{
            width: "80%",
            margin: "10%",
            borderRadius: 8,
          }}
          visible={visibleModal}
          onDismiss={hideModal}
          contentContainerStyle={containerStyle}
        >
          <Text style={{ marginBottom: 15 }}>Ajouter un code HTTP</Text>
          <TextInput
            mode="outlined"
            activeOutlineColor={hasErrors() ? "#F77F71" : "orange"}
            label="Code HTTP"
            value={codehttp}
            style={[
              styles.input,
              {
                width: "100%",
                marginTop: 10,
                borderColor: hasErrors() ? "#F77F71" : "transparent",
              },
            ]}
            onChangeText={(codehttp: string) => setCodehttp(codehttp)}
            right={
              hasErrors() ? (
                <TextInput.Icon
                  icon={() => (
                    <MaterialIcons
                      name="error-outline"
                      size={24}
                      color="#F77F71"
                    />
                  )}
                />
              ) : null
            }
          />
          <HelperText
            style={{ color: "#F77F71" }}
            type="error"
            visible={hasErrors()}
          >
            Doit être compris entre 100 et 527
          </HelperText>
          <View style={styles.buttoncontainer}>
            <Button
              style={{
                backgroundColor: Colors.dark.itemcontainer,
                borderRadius: 5,
              }}
              labelStyle={styles.buttonLabel}
              mode="contained"
              onPress={() => setVisibleModal(false)}
            >
              Annuler
            </Button>
            <Button
              disabled={hasErrors() ? true : false}
              onPress={handleAddChip}
              labelStyle={
                hasErrors() ? styles.buttonLabelError : styles.buttonLabel
              }
            >
              Ajouter
            </Button>
          </View>
        </Modal>
      </Portal>
      <Text style={styles.text}>Paramètres</Text>
      <TextInput
        mode="outlined"
        label="Taille des paquets"
        keyboardType="numeric"
        value={formData.packet_size.toString()}
        activeOutlineColor="orange"
        onChangeText={(text) => {
          const packetSize = parseInt(text, 10);
          setFormData({
            ...formData,
            packet_size: isNaN(packetSize) ? 0 : packetSize,
          });
        }}
        right={
          <TextInput.Icon
            style={{ width: 70, marginRight: 25 }}
            icon={() => (
              <Text style={{ fontSize: 17, color: "lightgrey" }}>Octets</Text>
            )}
          />
        }
        style={[styles.input, { width: "100%" }]}
      />
      <TextInput
        mode="outlined"
        label="Qualité du signal reseau minimum requise"
        value={formData.qualite}
        activeOutlineColor="orange"
        editable={false}
        right={
          <TextInput.Icon
            icon={() => (
              <AntDesign
                name="caretdown"
                size={20}
                color="orange"
                onPress={openQualiteMenu}
              />
            )}
          />
        }
        style={[styles.input, { width: "100%" }]}
      />
      <Portal>
        <Menu
          visible={qualiteMenuVisible}
          onDismiss={closeQualiteMenu}
          anchor={{ x: 340, y: 339 }}
          style={styles.menu}
        >
          <Menu.Item
            onPress={() => handleQualiteChange("faible")}
            title="Faible"
          />
          <Divider />
          <Menu.Item
            onPress={() => handleQualiteChange("moyenne")}
            title="Moyenne"
          />
          <Divider />
          <Menu.Item
            onPress={() => handleQualiteChange("bonne")}
            title="Bonne"
          />
          <Divider />
          <Menu.Item
            onPress={() => handleQualiteChange("excellente")}
            title="Excellente"
          />
          <Divider />
        </Menu>
      </Portal>
      <TextInput
        mode="outlined"
        label="Mettre à jour via"
        value={formData.update}
        activeOutlineColor="orange"
        editable={false}
        right={
          <TextInput.Icon
            icon={() => (
              <AntDesign
                name="caretdown"
                size={20}
                color="orange"
                onPress={openMajMenu}
              />
            )}
          />
        }
        style={[styles.input, { width: "100%" }]}
      />
      <Portal>
        <Menu
          visible={majMenuVisible}
          onDismiss={closeMajMenu}
          anchor={{ x: 340, y: 339 }}
          style={styles.menu}
        >
          <Menu.Item
            onPress={() => handleMajChange("best")}
            title="Le meilleur réseau disponible"
          />
          <Divider />
          <Menu.Item
            onPress={() => handleMajChange("mobile")}
            title="Réseau mobile"
          />
          <Divider />
          <Menu.Item onPress={() => handleMajChange("wifi")} title="Wifi" />
        </Menu>
      </Portal>
    </ScrollView>
  );
};

export default AddServer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: 10,
    backgroundColor: "black",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    // marginTop: -10,
  },
  input: {
    marginBottom: 5,
  },
  menu: {
    // marginTop: 30,
    width: "89%",
  },
  button: {
    marginTop: 15,
  },

  text: {
    fontSize: 20,
    color: "orange",
    fontWeight: 600,
    marginBottom: 10,
    marginTop: 10,
  },
  inputcontainer: {
    flexDirection: "row",
    gap: 17,
  },
  switchcontainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
  },
  chipcontainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    gap: 10,
    marginTop: 10,
    alignItems: "center",
  },
  buttoncontainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 7,
  },
  buttonLabel: {
    color: "orange",
  },
  buttonLabelError: {
    color: "grey",
  },
  switchwrapper: {
    flexDirection: "column",
  },
  chipsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    justifyContent: "flex-start",
    gap: 8,
  },
});
