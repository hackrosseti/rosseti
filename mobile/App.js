import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";
import { AppLoading } from "expo";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View, SafeAreaView } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import FeedScreen from "./src/screens/FeedScreen.js";
import IdeasScreen from "./src/screens/IdeasScreen.js";
import ProfileScreen from "./src/screens/ProfileScreen.js";
import FeededIdeaScreen from "./src/screens/FeededIdeaScreen.js";
import PersonalIdeasScreen from "./src/screens/PersonalIdeasScreen.js";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { FontAwesome5 } from "@expo/vector-icons";

const Stack = createStackNavigator();
const Tab = createMaterialBottomTabNavigator();

function Home() {
  return (
    <Tab.Navigator
      initialRouteName="Feed"
      activeColor="#2A8BF2"
      inactiveColor="#707C97"
      barStyle={{ backgroundColor: "white" }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarLabel: "Главная",
          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              name="newspaper"
              size={24}
              color={focused ? "#2A8BF2" : "#707C97"}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Ideas"
        component={IdeasScreen}
        options={{
          tabBarLabel: "Мои предложения",
          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              name="bookmark"
              size={24}
              color={focused ? "#2A8BF2" : "#707C97"}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Профиль",
          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              name="user"
              size={24}
              color={focused ? "#2A8BF2" : "#707C97"}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  let [fontsLoaded] = useFonts({
    Montserrat_700Bold,
    Montserrat_400Regular,
  });
  if (!fontsLoaded) {
    return <AppLoading />;
  } else {
    return (
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <StatusBar style="dark" />
        <SafeAreaView style={styles.container}>
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Home" component={Home} />
              <Stack.Screen name="Feeded" component={FeededIdeaScreen} />
              <Stack.Screen
                name="PersonalIdeas"
                component={PersonalIdeasScreen}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
