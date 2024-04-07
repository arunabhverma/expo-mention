import { useTheme } from "@react-navigation/native";
import { Slot, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { Platform, useColorScheme } from "react-native";

export default function AppLayout() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const navigation = useNavigation();

  let headerConfig = Platform.select({
    android: {},
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

  const statusBar = Platform.select({
    android: {
      statusBarColor: theme.colors.card,
      statusBarStyle: colorScheme === "dark" ? "light" : "dark",
    },
    ios: {},
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Comments",
      ...statusBar,
      ...headerConfig,
      contentStyle: {
        backgroundColor:
          colorScheme === "light" ? theme.colors.card : theme.colors.background,
      },
    });
  }, [navigation, colorScheme]);

  return <Slot />;
}
