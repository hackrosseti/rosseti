import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Button,
  Image,
  ScrollView,
} from "react-native";
import { Post } from "../components/Post";

class FeededIdeaScreen extends Component {
  //Переменные
  constructor(props) {
    super(props);

    this.state = {
      news: [],
      regionKey: "044",
      newsStatus: "false",
    };
  }

  //Действия, выполняемые после загрузки рендера
  componentDidMount() {
    const { navigation } = this.props;
    //При фокусе на странице, выполняется функция.
    this._unsubscribe = navigation.addListener("focus", () => {
      this.netData();
    });
  }

  //Чтение новостей по коду региона
  netData = () => {
    fetch("http://79.175.40.24:8050/api/regnews/" + this.state.regionKey)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Server can't be reached!");
        }
      })
      .then((response) => {
        if (response.length === 0) {
          this.setState({
            newsStatus: "nonews",
          });
        } else {
          this.setState({
            news: response,
            newsStatus: "",
          });
        }
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

  //Если интернета нет, то фреймворк рендерит первый случай т.е. nointernet, а если новостей нет, то второй. Если всё в порядке, то третий.
  render() {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} overScrollMode="never">
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
            pointerEvents={"none"}
          >
            <Text>Personal</Text>
          </View>
        </ScrollView>
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
    marginTop: 10,
    width: "100%",
  },
  wrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default FeededIdeaScreen;
