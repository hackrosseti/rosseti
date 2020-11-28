import React, { Component } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import { Post } from "../components/Post";

class IdeasScreen extends Component {
  //Переменные
  constructor(props) {
    super(props);

    this.state = {
      token: "",
      author: "",
      fetchFeed: "",
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
          throw new Error("Server can't be reached!");
        }
      })
      .then((response) => {
        this.setState({ token: response.token, author: response.user.user_id });
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
      "http://168.63.58.52:8081/api/project/getByField?author=" +
        this.state.author +
        "",
      {
        headers: { authorization: this.state.token },
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
        console.log(response);
        this.setState({ fetchFeed: response.projects });
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

  render() {
    const openPostHandler = (post) => {
      this.props.navigation.navigate("Feeded", {
        project_id: post.project_id,
      });
    };

    return (
      <View style={styles.container}>
        <FlatList
          data={this.state.fetchFeed}
          keyExtractor={(post) => post.project_id.toString()}
          renderItem={({ item }) => (
            <Post post={item} onOpen={openPostHandler} />
          )}
          style={styles.flat}
        />
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

export default IdeasScreen;
