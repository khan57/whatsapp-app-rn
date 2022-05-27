import React, {useState, useCallback, useEffect} from 'react';
import {View, Text} from 'react-native';
import firestore from '@react-native-firebase/firestore';

import {GiftedChat, Bubble, InputToolbar} from 'react-native-gifted-chat';
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
        createdAt: docSnap.data().createdAt
          ? docSnap.data().createdAt.toDate()
          : new Date(),
      };
    });
    setMessages(allMessages);
  };

  const renderInputToolbar = props => {
    //Add the extra styles via containerStyle
    return (
      <InputToolbar
        {...props}
        containerStyle={{borderTopWidth: 1.5, borderTopColor: 'green'}}
        textInputStyle={{color: 'black', fontSize: 16}}
      />
    );
  };

  const realTimeChat = async () => {
    const docId = uid > user.uid ? user.uid + '-' + uid : uid + '-' + user.uid;
    const messageRef = firestore()
      .collection('chatrooms')
      .doc(docId)
      .collection('messages')
      .orderBy('createdAt', 'desc');

    messageRef.onSnapshot(querySnap => {
      const allMessages = querySnap.docs.map(docSnap => {
        return {
          ...docSnap.data(),
          createdAt:
            docSnap.data().createdAt !== null
              ? docSnap.data().createdAt.toDate()
              : new Date(),
        };
      });
      setMessages(allMessages);
    });
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
    // getMessages();
    realTimeChat();
  }, []);
  const onSend = useCallback((messageArray = []) => {
    const [msg] = messageArray;
    const myMessage = {
      ...msg,
      sentBy: user.uid,
      sentTo: uid,
      // createdAt: new Date(),
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
    <View style={{flex: 1, backgroundColor: '#f5f5f5'}}>
      <GiftedChat
        renderInputToolbar={renderInputToolbar}
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: user.uid,
        }}
        renderBubble={props => (
          <Bubble
            {...props}
            wrapperStyle={{
              right: {
                backgroundColor: 'green',
              },
            }}
          />
        )}
      />
    </View>
  );
}
