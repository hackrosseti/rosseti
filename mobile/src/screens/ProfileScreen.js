import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  ScrollView,
} from "react-native";

class ProfileScreen extends Component {
  //Переменные
  constructor(props) {
    super(props);

    this.state = {
      fetchProfile: "",
    };
  }
  componentDidMount() {
    const { navigation } = this.props;
    //При фокусе на странице, выполняется функция.
    this._unsubscribe = navigation.addListener("focus", () => {
      this.fetchProfile();
    });
  }

  fetchProfile = () => {
    fetch("http://168.63.58.52:8081/api/user/login?login=admin&password=admin")
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Server can't be reached!");
        }
      })
      .then((response) => {
        console.log(response);
        this.setState({ fetchProfile: response.user });
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

  render() {
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} overScrollMode="never">
          <View style={styles.profileRow}>
            <View style={styles.imageColumn}>
              <Image
                source={{ uri: this.state.fetchProfile.profile_image }}
                style={{
                  width: 100,
                  height: 100,
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
                {this.state.fetchProfile.surname}
              </Text>
              <Text
                style={{
                  fontFamily: "Montserrat_400Regular",
                  fontSize: 22,
                  marginBottom: 3,
                }}
              >
                {this.state.fetchProfile.firstname}
              </Text>
              <Text
                style={{
                  fontFamily: "Montserrat_400Regular",
                  fontSize: 22,
                  marginBottom: 3,
                }}
              >
                {this.state.fetchProfile.lastname}
              </Text>
            </View>
          </View>
          <View style={styles.card}>
            <Text style={styles.title}>Компания</Text>
            <Text style={styles.text}>{this.state.fetchProfile.company}</Text>
            <Text style={styles.title}>Подразделение</Text>
            <Text style={styles.text}>
              {this.state.fetchProfile.department}
            </Text>
            <Text style={styles.title}>Должность</Text>
            <Text style={styles.text}>{this.state.fetchProfile.position}</Text>
            <Text style={styles.title}>Опыт работы</Text>
            <Text style={styles.text}>
              {this.state.fetchProfile.experience} лет
            </Text>
            <Text style={styles.title}>Город</Text>
            <Text style={styles.text}>
              {this.state.fetchProfile.region_name}
            </Text>
            <Text style={styles.title}>Дата рождения</Text>
            <Text style={styles.text}>{this.state.fetchProfile.dob}</Text>
            <Text style={styles.title}>Адрес электронной почты</Text>
            <Text
              style={{
                fontFamily: "Montserrat_400Regular",
                fontSize: 18,
              }}
            >
              {this.state.fetchProfile.email}
            </Text>
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
  profileRow: {
    flex: 1,
    flexDirection: "row",
    marginTop: 30,
    marginLeft: 20,
    marginRight: 20,
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
  card: {
    flex: 1,
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,

    elevation: 3,
  },
  title: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 20,
    marginBottom: 5,
  },
  text: {
    fontFamily: "Montserrat_400Regular",
    fontSize: 16,
    marginBottom: 10,
  },
});

export default ProfileScreen;
