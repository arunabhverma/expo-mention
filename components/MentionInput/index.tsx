import {
  Dimensions,
  FlatList,
  Keyboard,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
  useColorScheme,
} from "react-native";
import _ from "lodash";
import React, { useCallback, useMemo, useState } from "react";
import { useTheme } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import Animated, { SlideInDown } from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  generateValueFromPartsAndChangedText,
  generateValueWithAddedSuggestion,
  getMentionPartSuggestionKeywords,
  parseValue,
} from "../../utils/helper";
import { EMOJI_DATA } from "../../mock/emojiData";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const customLayoutAnimation = {
  duration: 500,
  update: {
    type: LayoutAnimation.Types.spring,
    springDamping: 0.8,
  },
  delete: {
    type: LayoutAnimation.Types.linear,
    property: LayoutAnimation.Properties.opacity,
  },
};

const NativeView = (props) => {
  return (
    <BlurView
      intensity={Platform.select({ android: 0, ios: 100 })}
      {...props}
    />
  );
};

const Tag = () => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [state, setState] = useState({
    text: "",
    data: [
      { id: 1, first_name: "John", last_name: "Doe" },
      { id: 2, first_name: "Alice", last_name: "Smith" },
      { id: 3, first_name: "Michael", last_name: "Johnson" },
      { id: 4, first_name: "Emily", last_name: "Brown" },
      { id: 5, first_name: "David", last_name: "Williams" },
      { id: 6, first_name: "Sarah", last_name: "Jones" },
      { id: 7, first_name: "Matthew", last_name: "Martinez" },
      { id: 8, first_name: "Jennifer", last_name: "Taylor" },
      { id: 9, first_name: "Christopher", last_name: "Anderson" },
    ],
    mention: undefined,
  });

  const PART_TYPES = [
    {
      trigger: "@",
      textStyle: { fontWeight: "normal", color: theme.colors.primary },
      isInsertSpaceAfterMention: true,
    },
  ];

  const { plainText, parts } = useMemo(
    () => parseValue(state.text, PART_TYPES),
    [state.text, PART_TYPES]
  );

  const debounceCall = useCallback(
    _.debounce((textParam) => {
      setState((prev) => ({
        ...prev,
        mention: textParam[PART_TYPES[0].trigger],
      }));
      LayoutAnimation.configureNext(customLayoutAnimation);
    }, 100),
    []
  );

  const keywordByTrigger = useMemo(() => {
    let mention = getMentionPartSuggestionKeywords(
      parts,
      plainText,
      selection,
      PART_TYPES
    );
    debounceCall(mention);
    return mention;
  }, [parts, plainText, selection, PART_TYPES]);

  const onChange = (e) => {
    setState((prev) => ({ ...prev, text: e }));
  };

  const onChangeInput = (changedText) => {
    onChange(
      generateValueFromPartsAndChangedText(parts, plainText, changedText)
    );
  };

  const onSend = () => {
    setState((prev) => ({ ...prev, text: "" }));
    Keyboard.dismiss();
  };

  const onSuggestionPress = (mentionType, suggestion) => {
    const newValue = generateValueWithAddedSuggestion(
      parts,
      mentionType,
      plainText,
      selection,
      suggestion
    );

    if (!newValue) {
      return;
    }

    onChange(newValue);
  };

  const onSelectionChange = () => {};

  const handleSelectionChange = (event) => {
    setSelection(event.nativeEvent.selection);

    onSelectionChange && onSelectionChange(event);
  };

  const renderTagItem = ({ item }) => {
    return (
      <View
        style={{
          backgroundColor: Platform.select({
            android: theme.colors.card,
            ios: "rgba(100,100,100,0.1)",
          }),
        }}
      >
        <Pressable
          style={styles.tagButtonStyle}
          onPress={() => onSuggestionPress(PART_TYPES[0], item)}
        >
          <Text style={[styles.tagItemText, { color: theme.colors.text }]}>
            {item.name}
          </Text>
        </Pressable>
      </View>
    );
  };

  const renderEmojiItem = ({ item, index }) => {
    return (
      <View>
        <Pressable
          style={{
            height: 45,
            width: Dimensions.get("screen").width / 8,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() =>
            setState((prev) => ({
              ...prev,
              text: prev.text.concat(`${item.emoji}`),
            }))
          }
        >
          <Text style={{ color: theme.colors.text, fontSize: 25 }}>
            {item.emoji}
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View>
      <View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={EMOJI_DATA}
          style={
            {
              // backgroundColor: "rgba(100, 100, 100, 0.1)",
            }
          }
          renderItem={renderEmojiItem}
          keyExtractor={(a) => a.id.toString()}
        />
      </View>
      <View>
        <View
          style={[
            styles.flexOne,
            {
              justifyContent: "flex-end",
              position: "absolute",
              // zIndex: 100,
              // backgroundColor: "red",
              bottom: 0,
              width: "100%",
              overflow: "hidden",
            },
          ]}
        >
          {state.mention !== undefined && (
            <Animated.View
              style={styles.wrapperOfAnimated}
              exiting={SlideInDown}
            >
              <View
                style={[
                  styles.animatedWrapperOfBlur,
                  {
                    backgroundColor: Platform.select({
                      android: theme.colors.border,
                      ios: "transparent",
                    }),
                  },
                ]}
              >
                <NativeView tint={colorScheme}>
                  <FlatList
                    style={{ maxHeight: 200 }}
                    data={state.data
                      ?.map((item) => {
                        return {
                          id: item._id,
                          name: `${item.first_name} ${item.last_name}`,
                        };
                      })
                      .filter((one) =>
                        one.name
                          .toLocaleLowerCase()
                          .includes(state.mention.toLocaleLowerCase())
                      )}
                    contentContainerStyle={styles.scrollViewGap}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps={"always"}
                    keyExtractor={(_, i) => i.toString()}
                    renderItem={renderTagItem}
                  />
                </NativeView>
              </View>
            </Animated.View>
          )}
        </View>
      </View>
      <View style={styles.inputWrapperBlur}>
        <TextInput
          multiline
          placeholder="Comments..."
          placeholderTextColor={theme.colors.subText}
          onSelectionChange={handleSelectionChange}
          onChangeText={onChangeInput}
          style={[styles.textInputStyle, { color: theme.colors.text }]}
        >
          <Text>
            {parts.map(({ text, partType, data }, index) =>
              partType ? (
                <Text
                  key={`${index}-${data?.trigger ?? "pattern"}`}
                  style={partType.textStyle}
                >
                  {text}
                </Text>
              ) : (
                <Text key={index}>{text}</Text>
              )
            )}
          </Text>
        </TextInput>
        <Pressable onPress={onSend}>
          <MaterialCommunityIcons
            name="send-circle"
            size={45}
            color={theme.colors.primary}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  safeAreaContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  scrollViewGap: {
    gap: Platform.OS === "android" ? 1 : 2,
  },
  tagButtonStyle: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  tagItemText: {
    fontSize: 15,
    fontWeight: "normal",
  },
  wrapperOfAnimated: {
    flex: 1,
    justifyContent: "flex-end",
  },
  animatedWrapperOfBlur: {
    marginLeft: 5,
    marginRight: 50,
    borderRadius: Platform.OS === "android" ? 0 : 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    overflow: "hidden",
    elevation: 24,
  },
  inputWrapperBlur: {
    flexDirection: "row",
    paddingLeft: 5,
    paddingRight: Platform.OS === "android" ? 5 : 0,
    paddingVertical: 5,
    marginHorizontal: 10,
    alignItems: "flex-end",
    gap: 5,
  },
  textInputStyle: {
    backgroundColor: "rgba(100,100,100,0.1)",
    flex: 1,
    textAlignVertical: "center",
    justifyContent: "center",
    alignItems: "center",
    maxHeight: 200,
    fontSize: 18,
    fontWeight: "normal",
    padding: 0,
    paddingVertical: Platform.OS === "android" ? 5 : 8,
    paddingTop: Platform.OS === "android" ? 5 : 8,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: "center",
  },
  sendButton: {
    width: 40,
    aspectRatio: 1,
    borderRadius: 30,
    padding: 10,
    alignSelf: "flex-end",
  },
  sendButtonIcon: {
    marginLeft: 1,
  },
});

export default Tag;
