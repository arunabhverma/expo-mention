import { Button, View } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

const Main = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Comments" onPress={() => router.navigate("/comments")} />
    </View>
  );
};

export default Main;
