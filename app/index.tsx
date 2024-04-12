import { Button, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { Link, useNavigation, useRouter } from "expo-router";

const Main = () => {
  const router = useRouter();
  useEffect(() => {
    if (router.navigate) {
      setTimeout(() => {
        router.navigate("/comments");
      }, 500);
    }
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="Comments" onPress={() => router.navigate("/comments")} />
    </View>
  );
};

export default Main;

const styles = StyleSheet.create({});
