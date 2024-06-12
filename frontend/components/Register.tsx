import { View } from "react-native";
import React, { useState } from "react";
import { TextInput, Button, Text } from "react-native-paper";
import axios from "axios";
import querystring from 'querystring'

const Register = ({onSwitchToLogin}:{ onSwitchToLogin: () => void }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    try {
      setLoading(true);
      const data = {
        username: username,
        email: email, 
        password: password,
        disabled: false,
      };
      const response = await axios.post('http://127.0.0.1:8000/register', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(response.data);
      setLoading(false);
      onSwitchToLogin(); 
    } catch (error) {
      console.error('Failed to register:', error);
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput
        mode="outlined"
        label="Username"
        value={username}
        onChangeText={(username) => setUsername(username)}
      />
      <TextInput
        mode="outlined"
        label="Email"
        value={email}
        onChangeText={(email) => setEmail(email)}
      />
      <TextInput
        mode="outlined"
        label="Password"
        value={password}
        onChangeText={(password) => setPassword(password)}
      />
      <Button buttonColor="orange" mode="contained" onPress={handleRegister}>
        S'inscrire
      </Button>
      <Text>
        <Text onPress={onSwitchToLogin}>Login</Text>
      </Text>
    </View>
  );
};

export default Register;
