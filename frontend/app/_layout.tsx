import React from "react";
import { StyleSheet, View } from "react-native";
import { Slot, Stack } from "expo-router";
import { ThemeProvider } from "@/components/ThemeContext";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { PaperProvider } from "react-native-paper";
import { FormProvider } from "@/components/FormProvider";
import { DataProvider } from "@/components/DataContext";
import { RootSiblingParent } from "react-native-root-siblings";
import { TimerProvider } from "@/components/TimerContext";

const RootLayout = () => {
  return (
    <TimerProvider>
      <RootSiblingParent>
        <PaperProvider>
          <DataProvider>
            <FormProvider>
              <GestureHandlerRootView>
                <BottomSheetModalProvider>
                  <ThemeProvider>
                    <StatusBar hidden={false} />
                    <Stack>
                      <Stack.Screen
                        name="(tabs)"
                        options={{
                          headerShown: false,
                        }}
                      ></Stack.Screen>
                    </Stack>
                  </ThemeProvider>
                </BottomSheetModalProvider>
              </GestureHandlerRootView>
            </FormProvider>
          </DataProvider>
        </PaperProvider>
      </RootSiblingParent>
    </TimerProvider>
  );
};

export default RootLayout;
