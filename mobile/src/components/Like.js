import React from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Text,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import { Dimensions } from "react-native";
import ReadMore from "react-native-read-more-text";
import { Foundation } from "@expo/vector-icons";

export const Like = ({ like }) => {
  return (
    <TouchableWithoutFeedback style={styles.touch} activeOpacity={0.7}>
      <View style={styles.smallcard}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
            }}
          >
            <Image
              source={{
                uri: like.like_author_profile_image,
              }}
              style={{
                alignSelf: "center",
                width: 40,
                height: 40,
                borderRadius: 50,
                marginLeft: 5,
                marginRight: 5,
              }}
            />

            <Text
              style={{
                fontFamily: "Montserrat_400Regular",
                alignSelf: "center",
                marginTop: 0,
                fontSize: 18,
              }}
            >
              {like.surname} {like.firstname}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "flex-end",
            }}
          >
            <Text
              style={{
                fontFamily: "Montserrat_400Regular",
                fontSize: 16,
                marginRight: 20,
              }}
            >
              {like.weight > 0 ? (
                <Foundation name="like" size={34} color="#2A8BF2" />
              ) : (
                <Foundation name="like" size={34} color="red" />
              )}
            </Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const getLikeColor = () => {
  if (post.likes_сount.charAt(0) == "-") {
    return { color: "red" };
  } else {
    return { color: "green" };
  }
};

const _renderTruncatedFooter = (handlePress) => {
  return (
    <Text
      style={{
        fontFamily: "Montserrat_400Regular",
        color: "blue",
        marginTop: 10,
        fontSize: 18,
      }}
      onPress={handlePress}
    >
      Читать далее...
    </Text>
  );
};

const _renderRevealedFooter = (handlePress) => {
  return (
    <Text
      style={{
        fontFamily: "Montserrat_400Regular",
        color: "blue",
        marginTop: 10,
        fontSize: 18,
      }}
      onPress={handlePress}
    >
      Свернуть
    </Text>
  );
};

const _handleTextReady = () => {
  // ...
};
const win = Dimensions.get("window");
const ratio = win.width / 320;
const styles = StyleSheet.create({
  smallcard: {
    flex: 1,
    marginTop: 15,

    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: "white",
    borderRadius: 10,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,

    elevation: 2,
  },
});
