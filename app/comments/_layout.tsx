import { useLayoutEffect } from "react";
import { Slot, useNavigation } from "expo-router";

export default function AppLayout() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "Comments",
    });
  }, [navigation]);

  return <Slot />;
}
