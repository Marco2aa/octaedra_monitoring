import { StyleSheet, Text, View, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { Colors } from "../../../constants/Colors";
import { useTheme } from "@/components/ThemeContext";
import ThemeSwitch from "@/components/ThemeSwitch";
import {
  TouchableRipple,
  Modal,
  Portal,
  Button,
  HelperText,
  TextInput,
} from "react-native-paper";
import { useFormContext } from "@/components/FormProvider";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
const DEFAULT_TIMEOUT = 1;

const Servers = () => {
  const { theme } = useTheme();
  const { formData, setFormData } = useFormContext();
  const [visibleModal, setVisibleModal] = useState(false);
  const [timeout, setTimeout] = useState(DEFAULT_TIMEOUT.toString());

  const backgroundColor =
    theme === "dark" ? Colors.dark.background : Colors.light.background;
  const textColor = theme === "dark" ? Colors.dark.text : Colors.light.text;

  const showModal = () => setVisibleModal(true);
  const hideModal = () => setVisibleModal(false);

  const getTimeoutFromStorage = async () => {
    const value = await AsyncStorage.getItem("timeout");
    if (value) {
      setTimeout(value);
    } else {
      setTimeout(DEFAULT_TIMEOUT.toString());
      AsyncStorage.setItem("timeout", DEFAULT_TIMEOUT.toString());
    }
  };

  useEffect(() => {
    getTimeoutFromStorage();
  }, []);

  const handleUpdateTimeout = () => {
    const newTimeout = parseInt(timeout);
    setFormData((prevFormData) => ({
      ...prevFormData,
      timeout: newTimeout,
    }));
    hideModal();
    AsyncStorage.setItem("timeout", newTimeout.toString());
  };

  const hasErrors = () => {
    const value = parseInt(timeout);
    return isNaN(value) || value < 1 || value > 60;
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.text, { color: textColor }]}>Serveurs</Text>
        <ThemeSwitch />
      </View>
      <Text style={styles.maintitle}>Délai de connexion</Text>
      <Text style={[styles.text, { color: textColor }]}>
        Définis le délai de connexion par défaut. Nous considérons le serveur
        inaccessible après cette période.
      </Text>
      <View style={styles.rippleContainer}>
        <TouchableRipple
          style={styles.ripple}
          onPress={showModal}
          rippleColor="rgba(0, 0, 0, .32)"
        >
          <View style={styles.rippleContent}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fullWidthText, { color: textColor }]}>
                Timeout
              </Text>
              <Text style={[styles.fullWidthText, { color: textColor }]}>
                {formData.timeout} sec
              </Text>
            </View>
            <AntDesign name="right" size={24} color="orange" />
          </View>
        </TouchableRipple>
        <Portal>
          <Modal
            style={{
              width: "80%",
              margin: "10%",
              borderRadius: 8,
            }}
            visible={visibleModal}
            onDismiss={hideModal}
            contentContainerStyle={styles.modalContainer}
          >
            <Text style={{ marginBottom: 15 }}>Modifier le Timeout</Text>
            <TextInput
              mode="outlined"
              activeOutlineColor={hasErrors() ? "#F77F71" : "orange"}
              label="Timeout (sec)"
              value={timeout}
              style={[
                styles.input,
                {
                  width: "100%",
                  marginTop: 10,
                  borderColor: hasErrors() ? "#F77F71" : "transparent",
                },
              ]}
              onChangeText={(text) => setTimeout(text)}
            />
            <HelperText
              style={{ color: "#F77F71" }}
              type="error"
              visible={hasErrors()}
            >
              Doit être compris entre 1 et 60 secondes
            </HelperText>
            <View style={styles.buttoncontainer}>
              <Button
                style={{
                  backgroundColor: Colors.dark.itemcontainer,
                  borderRadius: 5,
                }}
                labelStyle={styles.buttonLabel}
                mode="contained"
                onPress={hideModal}
              >
                Annuler
              </Button>
              <Button
                disabled={hasErrors()}
                onPress={handleUpdateTimeout}
                labelStyle={
                  hasErrors() ? styles.buttonLabelError : styles.buttonLabel
                }
              >
                Modifier
              </Button>
            </View>
          </Modal>
        </Portal>
      </View>
    </View>
  );
};

export default Servers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    width: "100%",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  text: {
    fontSize: 18,
  },
  rippleContainer: {
    width: "100%",
    paddingHorizontal: 16,
  },
  ripple: {
    width: "100%",
    borderRadius: 4,
    overflow: "hidden",
  },
  rippleContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
  },
  fullWidthText: {
    width: "100%",
  },
  maintitle: {
    color: "orange",
    fontSize: 24,
    fontWeight: "400",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
  },
  input: {
    width: "100%",
  },
  buttoncontainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  buttonLabel: {
    color: "white",
  },
  buttonLabelError: {
    color: "gray",
  },
});
