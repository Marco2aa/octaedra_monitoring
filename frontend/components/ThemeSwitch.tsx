import React from 'react';
import { Switch, View, Text, StyleSheet } from 'react-native';
import { useTheme } from './ThemeContext';

const ThemeSwitch = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</Text>
      <Switch
        value={theme === 'dark'}
        onValueChange={toggleTheme}
      />
    </View>
  );
};

export default ThemeSwitch;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    marginRight: 10,
  },
});
