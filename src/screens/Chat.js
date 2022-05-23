import React, {useState, useCallback, useEffect} from 'react';
import {View, Text} from 'react-native';
import firestore from '@react-native-firebase/firestore';

import {GiftedChat} from 'react-native-gifted-chat';
export default function Chat({user, route}) {
  const [messages, setMessages] = useState([]);
  const {uid} = route.params;
  // alert(uid)
  const getMessages = async () => {
    const docId = uid > user.uid ? user.uid + '-' + uid : uid + '-' + user.uid;
    const querySnap = await firestore()
      .collection('chatrooms')
      .doc(docId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .get();
    const allMessages = querySnap.docs.map(docSnap => {
      return {
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt.toDate(),
      };
    });
    setMessages(allMessages);
  };
  useEffect(() => {
    // setMessages([
    //   {
    //     _id: 1,
    //     text: 'Hello developer',
    //     createdAt: new Date(),
    //     user: {
    //       _id: 2,
    //       name: 'React Native',
    //       avatar: 'https://placeimg.com/140/140/any',
    //     },
    //   },
    // ]);
    getMessages()
  }, []);
  const onSend = useCallback((messageArray = []) => {
    const [msg] = messageArray;
    const myMessage = {
      ...msg,
      sentBy: user.uid,
      sentTo: uid,
      createdAt: new Date(),
    };

    console.log({myMessage});
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, myMessage),
    );
    // uid means receiver id
    const docId = uid > user.uid ? user.uid + '-' + uid : uid + '-' + user.uid;
    firestore()
      .collection('chatrooms')
      .doc(docId)
      .collection('messages')
      .add({...myMessage, createdAt: firestore.FieldValue.serverTimestamp()});
  }, []);
  return (
    <GiftedChat
      messages={messages}
      onSend={messages => onSend(messages)}
      user={{
        _id: user.uid,
      }}
    />
  );
}
