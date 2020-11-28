import React from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Text,
  TouchableWithoutFeedback,
  Image,
  Button,
} from "react-native";
import { Dimensions } from "react-native";
import ReadMore from "react-native-read-more-text";
import { Foundation } from "@expo/vector-icons";

export const Buttons = ({ buttons, onPressCallback }) => {
  return (
    <TouchableWithoutFeedback
      activeOpacity={0.7}
      onPress={() => onPressCallback(buttons.project_class)}
    >
      <View
        style={{
          borderRadius: 10,
          borderWidth: 2,
          borderColor: "black",
          marginLeft: 10,
          marginRight: 10,
          padding: 10,
          height: 40,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text>{buttons.class_name}</Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

const _calc = (value) => {
  this.props.callback(value);
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
        color: "#2A8BF2",
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
        color: "#2A8BF2",
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
  touch: {
    flex: 1,
    flexDirection: "column",
  },
  post: {
    width: 300,

    backgroundColor: "white",
    marginTop: 10,
    borderRadius: 15,
    marginBottom: 30,
    marginLeft: 10,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  image: {
    width: win.width - 75,
    height: 180 * ratio,
    flex: 1,
    resizeMode: "contain",
    justifyContent: "center",
    borderRadius: 25,
    marginRight: 30,
  },

  title: {
    marginBottom: 20,
    marginRight: 10,
    marginLeft: 10,
    fontFamily: "Montserrat_400Regular",
  },
  subtitle: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 15,
    marginRight: 10,
    marginLeft: 10,
  },
  text: {
    marginTop: 10,
    marginBottom: 20,
    marginRight: 10,
    marginLeft: 10,
    fontFamily: "Montserrat_400Regular",
  },
  footer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 10,
  },
});
