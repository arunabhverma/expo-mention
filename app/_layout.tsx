import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router/stack";
import { Platform, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

declare module "@react-navigation/native" {
  export type ExtendedTheme = {
    dark: boolean;
    colors: {
      primary: string;
      background: string;
      card: string;
      text: string;
      border: string;
      notification: string;
      subText: string;
      bars: string;
      screen: string;
    };
  };
  export function useTheme(): ExtendedTheme;
}

export default function AppLayout() {
  const colorScheme = useColorScheme();
  let dark = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      subText: "dimgray",
      bars: "#1e1f20",
      screen: "#131314",
      text: "#e3e3e3",
    },
  };
  let light = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      subText: "dimgray",
      bars: Platform.select({ android: "#fff", ios: "white" }),
      screen: Platform.select({ android: "#f3f3f8", ios: "white" }),
      text: "#1f1f1f",
    },
  };
  const theme = colorScheme === "dark" ? dark : light;

  let headerConfig = Platform.select({
    android: {
      headerTintColor: theme.colors.text,
      statusBarColor: theme.colors.bars,
      statusBarStyle: colorScheme === "dark" ? "light" : "dark",
      headerStyle: {
        backgroundColor: theme.colors.bars,
      },
      navigationBarColor: theme.colors.bars,
    },
    ios: {
      headerLargeTitle: true,
      headerShadowVisible: false,
      headerBlurEffect: colorScheme,
      headerTransparent: Platform.select({
        ios: true,
        android: false,
      }),
    },
  });

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={theme}>
          <Stack
            screenOptions={{
              headerShadowVisible: false,
              headerTitle: "Posts",
              contentStyle: {
                backgroundColor: theme.colors.screen,
              },
              ...headerConfig,
            }}
          />
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
