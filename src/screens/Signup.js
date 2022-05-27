import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  Button,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import {launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
export default function Signup(props) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(null);
  const [showNext, setShowNext] = useState(true);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // alert('Signup called');
  }, []);
  if (loading) {
    return <ActivityIndicator size="large" color="red" />;
  }
  const userSignup = async () => {
    setLoading(true);
    if (!email || !password || !name || !image) {
      alert('Please add all fields');
      return;
    }
    try {
      const result = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      await firestore().collection('users').doc(result.user.uid).set({
        name,
        email: result.user.email,
        uid: result.user.uid,
        pic: image,
        status:"online"
      });
      setLoading(false);
    } catch (error) {
      console.log(error);
      alert('error in saving user', error);
    }
  };
  const pickImageAndUpload = () => {
    launchImageLibrary(
      {
        quality: 0.5,
      },
      fileObj => {
        console.log(JSON.stringify(fileObj));
        const uploadTask = storage()
          .ref()
          .child(`/userprofile/${Date.now()}`)
          .putFile(fileObj.assets[0].uri);

        //

        uploadTask.on(
          'state_changed',
          snapshot => {
            var progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            if (progress === 100) {
              alert('image uploaded');
            }
          },
          error => {
            // Handle unsuccessful uploads
            alert('error in uploading image', error);
          },
          () => {
            uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
              console.log('File available at', downloadURL);
              setImage(downloadURL);
            });
          },
        );

        //
      },
    );
  };
  return (
    <ScrollView style={styles.container}>
      <View style={styles.box1}>
        <Text style={styles.text}>Welcome to Whatsapp 5.0</Text>
        <Image
          style={styles.image}
          source={{
            uri: 'https://www.businessinsider.in/thumb.cms?msid=73228727&width=1200&height=900',
          }}
        />
      </View>
      <View style={styles.inputView}>
        {!showNext && (
          <>
            <TextInput
              label="Email"
              value={email}
              onChangeText={text => setEmail(text)}
              mode="outlined"
              style={styles.inputs}
              placeholder="Enter your email"
              keyboardType="email-address"
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={text => setPassword(text)}
              secureTextEntry
              style={styles.inputs}
              placeholder="Enter your password"
              autoCapitalize="none"
            />
            <Button
              title="Next"
              style={styles.btn}
              onPress={() => {
                setShowNext(true);
              }}
            />
          </>
        )}

        {showNext && (
          <>
            <TextInput
              label="Email"
              value={name}
              onChangeText={text => setName(text)}
              mode="outlined"
              style={styles.inputs}
              placeholder="Enter your Full name"
            />
            <View style={styles.btnView}>
              <Button
                title="Select Profile pic"
                style={styles.btn}
                onPress={() => pickImageAndUpload()}
              />
            </View>

            <Button
              title="Signup"
              disabled={image ? false : true}
              style={styles.btn}
              onPress={() => {
                userSignup();
              }}
            />
            <TouchableOpacity
              onPress={() => props.navigation.navigate('login')}>
              <Text>Already have account</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 22,
    color: 'green',
    margin: 10,
  },
  image: {
    width: 200,
    height: 200,
  },
  box1: {
    alignItems: 'center',
  },
  inputs: {
    borderWidth: 2,
    borderColor: 'green',
    marginBottom: 10,
    borderRadius: 5,
  },
  inputView: {
    marginTop: 30,
    width: 300,
    alignSelf: 'center',
  },
  btn: {
    backgroundColor: 'green',
  },
  btnView: {
    marginBottom: 10,
    borderRadius: 10,
  },
});
