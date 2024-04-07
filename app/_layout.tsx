import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router/stack";
import { Platform, useColorScheme } from "react-native";
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
    };
  };
  export function useTheme(): ExtendedTheme;
}

export default function AppLayout() {
  const themes = useColorScheme();
  let dark = {
    ...DarkTheme,
    colors: { ...DarkTheme.colors, subText: "dimgray" },
  };
  let light = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, subText: "dimgray" },
  };
  const theme = themes === "dark" ? dark : light;
  const statusBar = Platform.select({
    android: {
      statusBarColor: theme.colors.card,
      statusBarStyle: themes === "dark" ? "light" : "dark",
    },
    ios: {},
  });
  return (
    <SafeAreaProvider>
      <ThemeProvider value={theme}>
        <Stack
          screenOptions={{
            headerTitle: "Posts",
            navigationBarColor: theme.colors.card,
            ...statusBar,
          }}
        />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
