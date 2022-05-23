import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
export default function Home(props) {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    getUsers();
  }, []);
  const getUsers = async () => {
    const querySnapShot = await firestore()
      .collection('users')
      .where('uid', '!=', props.user.uid)
      .get();
    const allUsers = querySnapShot.docs.map(docSnap => docSnap.data());
    setUsers(allUsers);
    console.log(allUsers);
  };
  const RenderCard = ({item}) => {
    console.log('================================================', item);
    return (
      <TouchableOpacity
        style={styles.myCard}
        onPress={() =>
          props.navigation.navigate('chat', {name: item.name, uid: item.uid})
        }>
        <Image source={{uri: item.pic}} style={styles.image} />
        <View>
          <Text style={styles.text}>{item.name}</Text>
          <Text style={styles.text}>{item.email}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View>
      <FlatList
        data={users}
        renderItem={({item, index}) => {
          return <RenderCard item={item} />;
        }}
        keyExtractor={item => item.uid}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'green',
  },
  text: {
    fontSize: 18,
    marginLeft: 15,
  },
  myCard: {
    flexDirection: 'row',
    margin: 3,
    padding: 4,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
  },
});
