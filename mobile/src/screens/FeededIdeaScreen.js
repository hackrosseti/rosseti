import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Button,
  Image,
  ScrollView,
  Dimensions,
  Modal,
} from "react-native";
import {
  TabView,
  SceneMap,
  TabViewAnimated,
  TabViewPage,
  TabBarTop,
  TabBar,
} from "react-native-tab-view";
import { Foundation } from "@expo/vector-icons";
import { Comment } from "../components/Comment";
import { Like } from "../components/Like";
import {
  TouchableHighlight,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";

const FirstRoute = () => (
  <View style={[styles.container, { backgroundColor: "#ff4081" }]} />
);
const SecondRoute = () => (
  <View style={[styles.container, { backgroundColor: "#673ab7" }]} />
);

class FeededIdeaScreen extends Component {
  //Переменные
  constructor(props) {
    super(props);

    this.state = {
      author: "",
      token: "",
      fetchedFeedProject: {},
      fetchedFeedLikes: [],
      fetchedFeedComments: [],
      index: 0,
      routes: [
        { key: "tab1", title: "ПРЕДЛОЖЕНИЕ" },
        { key: "tab2", title: "КОММЕНТАРИИ" },
        { key: "tab3", title: "РЕЙТИНГ" },
      ],
      modalUserVisible: false,
    };
  }

  //Действия, выполняемые после загрузки рендера
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
          throw new Error("Server can't be reached!");
        }
      })
      .then((response) => {
        this.setState({ token: response.token });
        this.fetchFeed();
      })
      .then((error) => {
        this.setState({ error });
      })
      .catch((error) => {
        console.log("error fetching data");
        console.log(error);
        console.log(error.message);
      });
  };

  fetchFeed = () => {
    fetch(
      "http://168.63.58.52:8081/api/project/getProjectByProjectId?projectId=" +
        this.props.route.params.project_id +
        "",
      {
        headers: {
          authorization: this.state.token,
        },
      }
    )
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Server can't be reached!");
        }
      })
      .then((response) => {
        //console.log(response);
        this.setState({
          fetchedFeedProject: response.project,
          fetchedFeedLikes: response.likes,
          fetchedFeedComments: response.comments,
        });
        console.log("FETCH");
        console.log(this.state.fetchedFeedLikes.data);
      })
      .then((error) => {
        this.setState({ error });
      })
      .catch((error) => {
        console.log("error fetching data");
        console.log(error);
        console.log(error.message);
        this.setState({ newsStatus: "nointernet" });
      });
  };

  handleIndexChange = (index) => {
    this.setState({ index });
  };

  renderScene = ({ route }) => {
    var rating = this.state.fetchedFeedLikes.totalweight;
    switch (route.key) {
      case "tab1":
        return (
          <View style={{ flex: 1 }}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              overScrollMode="never"
            >
              <Text style={styles.bigtitle}>
                {this.state.fetchedFeedProject.project_name}
              </Text>
              <Text style={styles.subtitle}>
                {this.state.fetchedFeedProject.class_name}
              </Text>
              <View style={styles.card}>
                <Image
                  source={{ uri: this.state.fetchedFeedProject.image }}
                  style={styles.image}
                />
                <Text style={styles.text}>
                  {this.state.fetchedFeedProject.project_describe}
                </Text>
                <Text style={styles.text}>
                  {this.state.fetchedFeedProject.project_offer}
                </Text>
                <Text style={styles.text}>
                  {this.state.fetchedFeedProject.project_profit}
                </Text>
                <Text style={styles.titletext}>Авторы</Text>

                <TouchableWithoutFeedback
                  style={styles.footer}
                  onPress={() => {
                    this.setState({
                      modalUserVisible: true,
                    });
                  }}
                >
                  <View style={styles.smallcard}>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        justifyContent: "flex-start",
                        alignItems: "center",
                      }}
                    >
                      <Image
                        source={{
                          uri: this.state.fetchedFeedProject.author_image,
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
                        {this.state.fetchedFeedProject.surname}{" "}
                        {this.state.fetchedFeedProject.firstname}
                      </Text>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </ScrollView>
            <Modal
              animationType="slide"
              transparent={true}
              visible={this.state.modalUserVisible}
              onRequestClose={() => {
                Alert.alert("Modal has been closed.");
              }}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(0,0,0,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    flex: 1,
                    marginTop: 138,
                    width: "95%",
                    borderTopRightRadius: 15,
                    borderTopLeftRadius: 15,
                    backgroundColor: "white",
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 2,
                      height: 3,
                    },
                    shadowOpacity: 0.5,
                    shadowRadius: 10,

                    elevation: 3,
                  }}
                >
                  <View style={styles.profileRow}>
                    <View style={styles.imageColumn}>
                      <Image
                        source={{
                          uri: this.state.fetchedFeedProject.author_image,
                        }}
                        style={{
                          width: 85,
                          height: 85,
                          borderRadius: 100,
                        }}
                      />
                    </View>
                    <View style={styles.infoColumn}>
                      <Text
                        style={{
                          fontFamily: "Montserrat_400Regular",
                          fontSize: 22,
                          marginBottom: 3,
                        }}
                      >
                        {this.state.fetchedFeedProject.surname}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Montserrat_400Regular",
                          fontSize: 22,
                          marginBottom: 3,
                        }}
                      >
                        {this.state.fetchedFeedProject.firstname}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Montserrat_400Regular",
                          fontSize: 22,
                          marginBottom: 3,
                        }}
                      >
                        {this.state.fetchedFeedProject.lastname}
                      </Text>
                    </View>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontFamily: "Montserrat_400Regular",
                        fontSize: 20,
                        marginBottom: 3,
                        marginLeft: 10,
                      }}
                    >
                      Компания
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Montserrat_400Regular",
                        fontSize: 18,
                        marginBottom: 20,
                        marginLeft: 10,
                      }}
                    >
                      {this.state.fetchedFeedProject.company}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Montserrat_400Regular",
                        fontSize: 20,
                        marginBottom: 3,
                        marginLeft: 10,
                      }}
                    >
                      Подразделение
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Montserrat_400Regular",
                        fontSize: 18,
                        marginBottom: 20,
                        marginLeft: 10,
                      }}
                    >
                      {this.state.fetchedFeedProject.department}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Montserrat_400Regular",
                        fontSize: 20,
                        marginBottom: 3,
                        marginLeft: 10,
                      }}
                    >
                      Должность
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Montserrat_400Regular",
                        fontSize: 18,
                        marginBottom: 20,
                        marginLeft: 10,
                      }}
                    >
                      {this.state.fetchedFeedProject.position}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Montserrat_400Regular",
                        fontSize: 20,
                        marginBottom: 3,
                        marginLeft: 10,
                      }}
                    >
                      Город
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Montserrat_400Regular",
                        fontSize: 18,
                        marginBottom: 20,
                        marginLeft: 10,
                      }}
                    >
                      {this.state.fetchedFeedProject.author_region}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Montserrat_400Regular",
                        fontSize: 20,
                        marginBottom: 3,
                        marginLeft: 10,
                      }}
                    >
                      Адрес электронной почты
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Montserrat_400Regular",
                        fontSize: 18,
                        marginBottom: 10,
                        marginLeft: 10,
                      }}
                    >
                      office@kostroma.rosseti.ru
                    </Text>
                  </View>
                  <View>
                    <Button
                      onPress={() => this.setState({ modalUserVisible: false })}
                      title="Закрыть"
                      color="#2A8BF2"
                    />
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        );
      case "tab2":
        return (
          <View style={{ flex: 1 }}>
            <FlatList
              data={this.state.fetchedFeedComments}
              keyExtractor={(comment) => comment.comment_id.toString()}
              renderItem={({ item }) => <Comment comment={item} />}
              style={styles.flatcomments}
            />
          </View>
        );
      case "tab3":
        return (
          <View style={{ flex: 1 }}>
            <View style={styles.smallratingcard}>
              <View
                style={{
                  height: 50,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text>РЕЙТИНГ ЭТОГО ПРЕДЛОЖЕНИЯ</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  height: 90,
                  marginTop: -15,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Foundation name="like" size={100} color="#2A8BF2" />
                </View>
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={
                      rating > 0 ? styles.likePositive : styles.likeNegative
                    }
                  >
                    {rating}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Foundation name="dislike" size={100} color="red" />
                </View>
              </View>
            </View>

            <FlatList
              data={this.state.fetchedFeedLikes.data}
              keyExtractor={(like) => like.like_id.toString()}
              renderItem={({ item }) => <Like like={item} />}
              style={styles.flat}
            />
          </View>
        );
      default:
        return null;
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <TabView
          navigationState={this.state}
          renderScene={this.renderScene}
          renderTabBar={(props) => (
            <TabBar
              {...props}
              style={{
                backgroundColor: "#f3f8fb",
                elevation: 0,
                height: 40,
              }}
              indicatorStyle={{
                backgroundColor: "#2A8BF2",
                height: 3,
                elevation: 3,
              }}
              renderLabel={({ route }) => (
                <View>
                  <Text
                    style={{
                      fontSize: 13,
                      textAlign: "center",
                      marginBottom: 10,
                      color:
                        route.key ===
                        props.navigationState.routes[
                          props.navigationState.index
                        ].key
                          ? "#2A8BF2"
                          : "#0D1C2E",
                    }}
                  >
                    {route.title}
                  </Text>
                </View>
              )}
            />
          )}
          onIndexChange={this.handleIndexChange}
        />
      </View>
    );
  }
}
const win = Dimensions.get("window");
const ratio = win.width / 320;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f8fb",
  },

  card: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: "white",
    borderRadius: 15,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,

    elevation: 3,
  },
  bigtitle: {
    marginBottom: 10,
    marginRight: 10,
    marginLeft: 10,
    marginTop: 20,
    fontSize: 26,
    fontFamily: "Montserrat_400Regular",
  },
  subtitle: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    marginRight: 10,
    marginLeft: 10,
    fontFamily: "Montserrat_400Regular",
    color: "#707C97",
    marginBottom: 20,
  },
  image: {
    width: win.width - 20,
    height: 170 * ratio,
    marginBottom: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  title: {
    marginBottom: 20,
    marginRight: 10,
    marginLeft: 10,
    fontFamily: "Montserrat_400Regular",
  },
  text: {
    marginTop: 10,
    marginBottom: 20,
    marginRight: 10,
    marginLeft: 10,
    fontFamily: "Montserrat_400Regular",
    fontSize: 18,
  },
  titletext: {
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
    marginLeft: 10,
    fontFamily: "Montserrat_400Regular",
    fontSize: 18,
    color: "#2A8BF2",
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
  smallcard: {
    flex: 1,

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
    shadowRadius: 10,

    elevation: 3,
  },
  flat: {
    marginRight: 10,
    marginLeft: 10,
  },
  flatcomments: {
    marginRight: 10,
    marginLeft: 10,
  },
  smallratingcard: {
    height: 150,
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: "white",
    marginLeft: 10,
    marginRight: 10,
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,

    elevation: 3,
  },
  likePositive: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 70,
    color: "#2A8BF2",
  },
  likeNegative: {
    fontFamily: "Montserrat_700Bold",
    fontSize: 70,
    color: "red",
  },
  profileRow: {
    flexDirection: "row",
    marginTop: 10,
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 20,
  },
  imageColumn: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  infoColumn: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    marginLeft: -100,
  },
});

export default FeededIdeaScreen;
