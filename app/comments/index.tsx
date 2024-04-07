import React, { useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import moment from "moment";
import { AntDesign } from "@expo/vector-icons";
import { getRandomDate } from "../../utils/randomDate";
import { COMMENT_DATA } from "../../mock/commentData";
import MentionInput from "../../components/MentionInput";
import { useTheme } from "@react-navigation/native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedKeyboard,
  useAnimatedStyle,
} from "react-native-reanimated";

const NativeView = (props) => {
  const colorScheme = useColorScheme();
  return (
    <BlurView
      tint={colorScheme}
      intensity={Platform.select({ android: 0, ios: 100 })}
      {...props}
    />
  );
};

const PROFILE_SIZE = 40;

const CommentSection = () => {
  const { height } = useAnimatedKeyboard();
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();
  console.log(`bottom::${Platform.OS}`, bottom);
  const [state, setState] = useState({
    commentData: COMMENT_DATA,
    likedIndex: [],
  });

  const renderItem = ({ item, index }) => {
    let postDate = getRandomDate();
    return (
      <View style={styles.cardWrapper}>
        <Image
          source={{
            uri: `https://randomuser.me/api/portraits/thumb/men/${index}.jpg`,
          }}
          style={styles.profile}
        />
        <View style={styles.commentSection}>
          <View style={styles.commentHeader}>
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {item.email?.split("@")?.[0]}
            </Text>
            <Text style={[styles.date, { color: theme.colors.subText }]}>
              {moment(postDate).fromNow()}
            </Text>
          </View>
          <View style={styles.commentBody}>
            <View style={{ flex: 1, gap: 15 }}>
              <Text style={[styles.comment, { color: theme.colors.text }]}>
                {item.body}
              </Text>
              <View style={styles.commentFooter}>
                <Pressable>
                  <Text
                    style={[styles.commentButton, { color: theme.colors.text }]}
                  >
                    Reply
                  </Text>
                </Pressable>
                <Pressable>
                  <Text
                    style={[styles.commentButton, { color: theme.colors.text }]}
                  >
                    See Translation
                  </Text>
                </Pressable>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 1.2 : 1 }],
                },
                ,
              ]}
              onPress={() =>
                setState((prev) => ({
                  ...prev,
                  likedIndex: prev.likedIndex.includes(index)
                    ? prev.likedIndex.filter((val) => val !== index)
                    : [...prev.likedIndex, index],
                }))
              }
            >
              {({ pressed }) => (
                <AntDesign
                  name={
                    pressed
                      ? "heart"
                      : state.likedIndex.includes(index)
                      ? "heart"
                      : "hearto"
                  }
                  size={15}
                  color={
                    pressed
                      ? theme.colors.notification
                      : state.likedIndex.includes(index)
                      ? theme.colors.notification
                      : theme.colors.subText
                  }
                />
              )}
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  const animatedStyle = useAnimatedStyle(() => {
    let nativeBottom = Platform.OS === "android" ? 0 : bottom;
    let paddingBottom = interpolate(
      height.value,
      [0, nativeBottom],
      [0, -nativeBottom],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateY: -height.value }],
      bottom: paddingBottom,
    };
  }, [bottom, height.value]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={state.commentData}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.containerStyle,
          { paddingBottom: bottom },
        ]}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
      <Animated.View
        style={[
          animatedStyle,
          {
            backgroundColor: Platform.select({
              android: theme.colors.card,
              ios: "transparent",
            }),
            position: "absolute",
            bottom: 0,
            width: "100%",
          },
        ]}
      >
        <NativeView
          style={{
            paddingBottom: bottom,
          }}
        >
          <MentionInput />
        </NativeView>
      </Animated.View>
    </View>
  );
};

export default CommentSection;

const styles = StyleSheet.create({
  containerStyle: {
    gap: 30,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  cardWrapper: {
    flexDirection: "row",
    flex: 1,
    gap: 10,
  },
  profile: {
    width: PROFILE_SIZE,
    aspectRatio: 1,
    borderRadius: PROFILE_SIZE / 2,
  },
  userName: {
    fontWeight: "600",
    fontSize: 13,
    color: "black",
  },
  date: {
    fontWeight: "400",
    fontSize: 13,
    color: "dimgrey",
  },
  comment: {
    fontWeight: "400",
    fontSize: 15,
    color: "black",
  },
  commentButton: {
    fontWeight: "600",
    fontSize: 13,
  },
  commentSection: {
    flex: 1,
    gap: 5,
  },
  commentHeader: {
    flexDirection: "row",
    gap: 5,
  },
  commentBody: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  commentFooter: {
    flexDirection: "row",
    gap: 20,
  },
});
