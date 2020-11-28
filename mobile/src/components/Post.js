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

export const Post = ({ post, onOpen }) => {
  return (
    <TouchableWithoutFeedback
      style={styles.touch}
      activeOpacity={0.7}
      onPress={() => onOpen(post)}
    >
      <View style={styles.post}>
        <Image source={{ uri: post.image }} style={styles.image} />
        <View style={styles.subtitle}>
          <Text
            style={{
              fontFamily: "Montserrat_400Regular",
              color: "grey",
              fontSize: 18,
            }}
          >
            {post.date_create}
          </Text>
          <Text
            style={{
              fontFamily: "Montserrat_400Regular",
              color: "grey",
              fontSize: 18,
            }}
          >
            {post.classificator}
          </Text>
        </View>
        <View style={styles.title}>
          <Text style={{ fontFamily: "Montserrat_700Bold", fontSize: 18 }}>
            {post.project_name}
          </Text>
        </View>
        <View style={styles.text}>
          <ReadMore
            numberOfLines={3}
            renderTruncatedFooter={_renderTruncatedFooter}
            renderRevealedFooter={_renderRevealedFooter}
            onReady={_handleTextReady}
          >
            <Text
              style={{
                fontFamily: "Montserrat_400Regular",
                fontSize: 18,
              }}
            >
              {post.project_describe}
            </Text>
          </ReadMore>
        </View>
        <View style={styles.footer}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "Montserrat_400Regular",
                alignSelf: "center",
                marginRight: 5,
              }}
            >
              <Image
                source={{ uri: post.author_image }}
                style={{
                  alignSelf: "center",
                  width: 40,
                  height: 40,
                  borderRadius: 50,
                }}
              />
            </Text>
            <Text
              style={{
                fontFamily: "Montserrat_400Regular",
                alignSelf: "center",
                marginTop: -5,
                fontSize: 18,
              }}
            >
              {post.author_surname} {post.author_firstname}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <Foundation name="like" size={34} color="#2A8BF2" />
            <Text
              style={{
                fontSize: 18,
                alignSelf: "center",
                marginLeft: 10,
                marginRight: 10,
                fontFamily: "Montserrat_400Regular",
                color: "black",
              }}
            >
              {post.likes_weight}
            </Text>
            <Foundation name="dislike" size={34} color="red" />
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
    marginTop: 10,
  },
  post: {
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
    width: win.width - 20,
    height: 170 * ratio,
    marginBottom: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
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
