import React, { Component, version } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ScrollView,
  Modal,
  Button,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { Post } from "../components/Post";
import { Buttons } from "../components/Buttons";
import { FontAwesome5 } from "@expo/vector-icons";
import { TextInput } from "react-native-paper";

class FeedScreen extends Component {
  //Переменные
  constructor(props) {
    super(props);

    this.state = {
      token: "",
      fetchFeed: "",
      modalUserVisible: false,
      buttons: {},
      selectedClass: "",
      modalCreateVisible: false,
      text1: "",
      height1: 0,
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    this._unsubscribe = navigation.addListener("focus", () => {
      this.fetchLogin();
    });
  }

  fetchLogin = () => {
    fetch("http://168.63.58.52:8081/api/user/login?login=admin&password=admin")
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("token Server can't be reached!");
        }
      })
      .then((response) => {
        this.setState({ token: response.token });
        this.fetchFeed();
        this.fetchButtons();
      })
      .then((error) => {
        this.setState({ error });
      })
      .catch((error) => {
        console.log("token error fetching data");
        console.log(error);
        console.log(error.message);
      });
  };

  fetchFeed = () => {
    fetch("http://168.63.58.52:8081/api/project/getAllProjects", {
      headers: { authorization: this.state.token },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Feed Server can't be reached!");
        }
      })
      .then((response) => {
        this.setState({ fetchFeed: response.projects });
        //console.log(response.projects);
      })
      .then((error) => {
        this.setState({ error });
      })
      .catch((error) => {
        console.log("Feed error fetching data");
        console.log(error);
        console.log(error.message);
      });
  };

  fetchButtons = () => {
    fetch("http://168.63.58.52:8081/api/project/getSortedClassificators", {
      headers: { authorization: this.state.token },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Buttons Server can't be reached!");
        }
      })
      .then((response) => {
        this.setState({ fetchButtons: response.classificators });
        console.log(response);
      })
      .then((error) => {
        this.setState({ error });
      })
      .catch((error) => {
        console.log("Buttons error fetching data");
        console.log(error);
        console.log(error.message);
      });
  };

  fetchClass = () => {
    fetch(
      "http://168.63.58.52:8081/api/project/getProjectsByClassificator?classificatorId=" +
        this.state.selectedClass +
        "",
      {
        headers: { authorization: this.state.token },
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Feed Server can't be reached!");
        }
      })
      .then((response) => {
        this.setState({ fetchFeed: response.projects });
        //console.log(response.projects);
      })
      .then((error) => {
        this.setState({ error });
      })
      .catch((error) => {
        console.log("Feed error fetching data");
        console.log(error);
        console.log(error.message);
      });
  };

  getResponse(selectedClass) {
    console.log(selectedClass);

    this.setState({ selectedClass });
    this.fetchClass();
  }
  render() {
    const openPostHandler = (post) => {
      this.props.navigation.navigate("Feeded", {
        project_id: post.project_id,
      });
    };
    let numOfLinesCompany = 0;
    return (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <View
            style={{
              width: "100%",
              height: 200,
              marginTop: 10,
            }}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              horizontal={true}
            >
              <TouchableWithoutFeedback
                style={{
                  width: 300,
                  height: 200,
                  backgroundColor: "#2A8BF2",
                  borderRadius: 20,
                  flex: 1,
                  marginLeft: 10,
                }}
                onPress={() => this.setState({ modalCreateVisible: true })}
              >
                <View style={{ padding: 15 }}>
                  <View>
                    <Text
                      style={{
                        fontFamily: "Montserrat_700Bold",
                        fontSize: 30,
                        marginBottom: 10,
                        marginLeft: 10,
                        color: "white",
                      }}
                    >
                      Есть идея?
                    </Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontFamily: "Montserrat_400Regular",
                        fontSize: 24,
                        marginBottom: 10,
                        marginLeft: 10,
                        color: "white",
                      }}
                    >
                      Расскажи о ней и помоги компании стать лучше.
                    </Text>
                  </View>
                  <View
                    style={{
                      alignItems: "flex-end",
                    }}
                  >
                    <FontAwesome5 name="plus" size={30} color="white" />
                  </View>
                </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback
                style={{
                  width: 300,
                  height: 200,
                  backgroundColor: "#707C97",
                  borderRadius: 20,
                  flex: 1,
                  marginLeft: 10,
                }}
              ></TouchableWithoutFeedback>
              <TouchableWithoutFeedback
                style={{
                  width: 300,
                  height: 200,
                  backgroundColor: "#707C97",
                  borderRadius: 20,
                  flex: 1,
                  marginLeft: 10,
                }}
              ></TouchableWithoutFeedback>
            </ScrollView>
          </View>
          <View
            style={{
              width: "100%",
              height: 90,
              marginTop: 10,
            }}
          >
            <View
              style={{
                width: "100%",
                height: 40,

                marginLeft: 10,
              }}
            >
              <Text
                style={{
                  fontFamily: "Montserrat_400Regular",
                  fontSize: 30,
                  marginBottom: 10,
                }}
              >
                Идеи
              </Text>
            </View>
            <FlatList
              horizontal={true}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              data={this.state.fetchButtons}
              keyExtractor={(buttons) => buttons.project_class.toString()}
              renderItem={({ item }) => (
                <Buttons
                  style={{ flex: 1, flexDirection: "row" }}
                  buttons={item}
                  onPressCallback={this.getResponse.bind(this)}
                />
              )}
            />
          </View>
          <FlatList
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            data={this.state.fetchFeed}
            keyExtractor={(post) => post.project_id.toString()}
            renderItem={({ item }) => (
              <Post post={item} onOpen={openPostHandler} />
            )}
            style={styles.flat}
          />
        </ScrollView>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalCreateVisible}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
          }}
        >
          <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.3)" }}>
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              alwaysBounceVertical={false}
              bounces={false}
            >
              <KeyboardAvoidingView
                style={{
                  height: 1200,
                  marginTop: 200,
                  backgroundColor: "white",
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                }}
                behavior="padding"
              >
                <View style={{ paddingLeft: 10, paddingRight: 10 }}>
                  <Text
                    style={{
                      fontFamily: "Montserrat_400Regular",
                      fontSize: 26,
                      alignSelf: "center",
                      marginTop: 20,
                      marginBottom: 30,
                    }}
                  >
                    Создать идею
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Montserrat_400Regular",
                      fontSize: 18,
                    }}
                  >
                    Дайте название своей идее
                  </Text>
                  <TextInput
                    selectionColor="#2A8BF2"
                    style={{
                      height: 40,
                      borderColor: "black",
                      borderBottomWidth: 2,
                      backgroundColor: "white",
                      width: "80%",
                      marginBottom: 40,
                    }}
                  ></TextInput>
                  <Text
                    style={{
                      fontFamily: "Montserrat_400Regular",
                      fontSize: 18,
                    }}
                  >
                    К какой категории вы бы отнесли свою идею?
                  </Text>
                  <TextInput
                    selectionColor="#2A8BF2"
                    style={{
                      height: 40,
                      borderColor: "black",
                      borderBottomWidth: 2,
                      backgroundColor: "white",
                      width: "80%",
                      marginBottom: 40,
                    }}
                  ></TextInput>
                  <Text
                    style={{
                      fontFamily: "Montserrat_400Regular",
                      fontSize: 18,
                    }}
                  >
                    Прикрепите изображение
                  </Text>
                  <TextInput
                    selectionColor="#2A8BF2"
                    style={{
                      height: 40,
                      borderColor: "black",
                      borderBottomWidth: 2,
                      backgroundColor: "white",
                      width: "80%",
                      marginBottom: 40,
                    }}
                  ></TextInput>
                  <Text
                    style={{
                      fontFamily: "Montserrat_400Regular",
                      fontSize: 18,
                    }}
                  >
                    Есть ли у Вас прикрепления к своей идее?
                  </Text>
                  <TextInput
                    selectionColor="#2A8BF2"
                    style={{
                      height: 40,
                      borderColor: "black",
                      borderBottomWidth: 2,
                      backgroundColor: "white",
                      width: "80%",
                      marginBottom: 40,
                    }}
                  ></TextInput>
                  <Text
                    style={{
                      fontFamily: "Montserrat_400Regular",
                      fontSize: 18,
                    }}
                  >
                    Опишите предлагаемое Вами решение
                  </Text>
                  <TextInput
                    {...this.props}
                    selectionColor="#2A8BF2"
                    multiline={true}
                    style={{
                      height: 80,
                      borderColor: "black",
                      borderBottomWidth: 2,
                      backgroundColor: "white",
                      width: "80%",
                      marginBottom: 40,
                      textAlignVertical: "top",
                    }}
                  ></TextInput>
                  <Text
                    style={{
                      fontFamily: "Montserrat_400Regular",
                      fontSize: 18,
                    }}
                  >
                    Опишите действительное положение с указанием недостатков
                  </Text>
                  <TextInput
                    selectionColor="#2A8BF2"
                    multiline={true}
                    style={{
                      height: 80,
                      borderColor: "black",
                      borderBottomWidth: 2,
                      backgroundColor: "white",
                      width: "80%",
                      marginBottom: 40,
                    }}
                  ></TextInput>
                  <Text
                    style={{
                      fontFamily: "Montserrat_400Regular",
                      fontSize: 18,
                    }}
                  >
                    Какой ожидаемый положительный эффект от использования Вашего
                    предложения?
                  </Text>
                  <TextInput
                    selectionColor="#2A8BF2"
                    multiline={true}
                    style={{
                      height: 80,
                      borderColor: "black",
                      borderBottomWidth: 2,
                      backgroundColor: "white",
                      width: "80%",
                      marginBottom: 40,
                      textAlignVertical: "top",
                    }}
                  ></TextInput>
                  <View style={{ marginBottom: 30 }}>
                    <Button
                      onPress={() => {
                        this.setState({ modalCreateVisible: false });
                      }}
                      title="Закрыть"
                      color="red"
                    />
                  </View>

                  <Button
                    onPress={() => {
                      this.setState({ modalCreateVisible: false });
                      setTimeout(() => {
                        Alert.alert(
                          "Идея создана!",
                          "Теперь на портале РосИДЕЯ вы сможете продолжить создание своей идеи!", // <- this part is optional, you can pass an empty string
                          [
                            {
                              text: "OK",
                              onPress: () => console.log("OK Pressed"),
                            },
                          ],
                          { cancelable: false }
                        );
                      }, 1000);
                    }}
                    title="Отправить идею"
                    color="#2A8BF2"
                  />
                </View>
              </KeyboardAvoidingView>
            </ScrollView>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f8fb",
  },
  yellowback: {
    height: "100%",
  },
  back: {
    flex: 1,
    backgroundColor: "#fff",
  },
  text: {
    textAlign: "center",
    fontSize: 20,
    paddingLeft: 15,
    paddingRight: 15,
  },
  flat: {
    flex: 1,

    width: "100%",
  },
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FeedScreen;
