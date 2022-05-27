import React, {useEffect, useState} from 'react';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Signup from './src/screens/Signup';
import Login from './src/screens/Login';
import Home from './src/screens/Home';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Chat from './src/screens/Chat';
import Profile from './src/screens/Profile';
import firestore from '@react-native-firebase/firestore';
//
const Stack = createStackNavigator();
const Navigation = props => {
  const [user, setUser] = useState('');
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(userExists => {
      if (userExists) {
        firestore().collection('users').doc(userExists.uid).update({
          status: 'online',
        });
        setUser(userExists);
      } else {
        setUser('');
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);
  return (
    <Stack.Navigator
      initialRouteName="signup"
      screenOptions={{
        headerTintColor: 'green',
      }}>
      {user ? (
        <>
          <Stack.Screen
            name="home"
            component={props => <Home {...props} user={user} />}
            options={{
              headerRight: () => (
                <MaterialIcon
                  name="account-circle"
                  size={34}
                  color="green"
                  style={{marginRight: 10}}
                  onPress={() => {
                    firestore()
                      .collection('users')
                      .doc(user.uid)
                      .update({
                        status: firestore.FieldValue.serverTimestamp(),
                      })
                      .then(() => {
                        auth().signOut();
                      });
                  }}
                />
              ),
              title: 'WhatsApp',
            }}
          />
          <Stack.Screen
            options={({route}) => ({
              title: (
                <View>
                  <Text
                    style={{fontWeight: 'bold', fontSize: 20, color: 'green'}}>
                    {route.params.name}
                  </Text>
                  <Text>{route.params.status}</Text>
                </View>
              ),
            })}
            name="chat"
            component={props => <Chat {...props} user={user} />}
          />
          <Stack.Screen
            options={({route}) => ({title: route.params.name})}
            name="profile"
            component={props => <Profile {...props} user={user} />}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="login"
            component={Login}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="signup"
            component={Signup}
            options={{headerShown: false}}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

//

const App = () => {
  return (
    <NavigationContainer>
      <Navigation />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
