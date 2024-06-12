import React from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Text } from "react-native-paper";
import axios from "axios";
import querystring from "querystring";
import { useRouter } from "expo-router";

const Login = ({ onSwitchToRegister = () => {} }) => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const data = {
        username: username,
        password: password,
        grant_type: "",
        scope: "",
        client_id: "",
        client_secret: "",
      };

      const response = await axios.post(
        "http://192.168.1.94:8000/token",
        querystring.stringify(data),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log(response.data);
      router.replace("/");
    } catch (error) {
      console.error("Failed to login:", error);
    }
  };

  return (
    <View>
      <TextInput
        mode="outlined"
        label="Username"
        value={username}
        outlineColor="orange"
        onChangeText={(username) => setUsername(username)}
      />
      <TextInput
        mode="outlined"
        label="Password"
        value={password}
        right={
          <TextInput.Icon
            icon={passwordVisible ? "eye-off" : "eye"}
            onPress={() => setPasswordVisible(!passwordVisible)}
          />
        }
        onChangeText={(password) => setPassword(password)}
        secureTextEntry={!passwordVisible}
      />
      <Button
        loading={true}
        buttonColor="orange"
        mode="contained"
        onPress={handleLogin}
      >
        Se connecter
      </Button>
      <Text>
        <Text onPress={onSwitchToRegister}>Register</Text>
      </Text>
    </View>
  );
};

export default Login;
