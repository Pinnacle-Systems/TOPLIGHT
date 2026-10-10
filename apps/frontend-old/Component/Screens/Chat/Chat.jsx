import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions
} from 'react-native';
import { useAddchatMutation, useGetchatQuery } from '../../../redux/service/commonMasters';
import { useSelector } from 'react-redux';
import socket from '../../Utils/Socket';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import tailwind from 'twrnc';
import { screenHeight, screenWidth } from '../../Utils/Screens';

const { width } = Dimensions.get('window');

const ChatScreen = () => {
  const UserSelect = useSelector((state) => state?.UserDetails);
  const { data, isLoading, isError, refetch } = useGetchatQuery({
    DEPARTMENT: UserSelect?.GCOMPCODE + UserSelect?.DEPARTMENT
  });
  const [messages, setMessages] = useState([]);
  const [add_chat, { isLoading: isSending }] = useAddchatMutation();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);


  // Format messages with additional metadata
  const formatMessages = useCallback((messages) => {
    return messages?.map(msg => ({
      ...msg,
      isMe: msg.sender == UserSelect?.UserId,
      time: moment(msg.createAt || new Date()).format('h:mm A'),
      date: moment(msg.createAt || new Date()).format('MMM D, YYYY'),
      isNewDay: false // This will be calculated in the render
    })) || [];
  }, [UserSelect?.UserId]);

  // Group messages by date and mark first message of each day
  const groupMessagesByDate = useCallback((messages) => {
    if (!messages || messages.length === 0) return [];
    
    let lastDate = null;
    return messages.map((msg, index) => {
      const currentDate = msg.date;
      const isNewDay = currentDate !== lastDate;
      lastDate = currentDate;
      
      return {
        ...msg,
        isNewDay
      };
    });
  }, []);

  useEffect(() => {
    if (data?.data) {
      const formatted = formatMessages(data.data);
      const grouped = groupMessagesByDate(formatted);
      setMessages(grouped);
    }
  }, [data?.data, formatMessages, groupMessagesByDate]);

  useEffect(() => {
    const messageListener = (newMessage) => {
      setMessages(prev => {
        const formatted = formatMessages([newMessage?.data]);
        const lastMsg = prev[prev.length - 1];
        const isNewDay = formatted[0].date !== (lastMsg?.date || '');
        
        return [...prev, {
          ...formatted[0],
          isNewDay
        }];
      });
    };

    const typingListener = (isTyping) => {
      setIsTyping(isTyping);
    };


    socket?.on("get_message:" + UserSelect?.GCOMPCODE + UserSelect?.DEPARTMENT + UserSelect?.GCOMPCODE, messageListener);
    socket?.on("typing:" + UserSelect?.GCOMPCODE + UserSelect?.DEPARTMENT + UserSelect?.GCOMPCODE, typingListener);

    return () => {
      socket?.off("get_message:" + UserSelect?.GCOMPCODE + UserSelect?.DEPARTMENT + UserSelect?.GCOMPCODE, messageListener);
      socket?.off("typing:" + UserSelect?.GCOMPCODE + UserSelect?.DEPARTMENT + UserSelect?.GCOMPCODE, typingListener);
    };
  }, [UserSelect, formatMessages]);

  const handleSend = async () => {
    if (inputText.trim()) {
      const newMessage = {
        groupId: UserSelect?.GCOMPCODE + UserSelect?.DEPARTMENT,
        text: inputText,
        sender: UserSelect?.UserId,
        createAt: new Date().toISOString()
      };
      
      try {
        const result_chat = await add_chat(newMessage);
        const data_r = result_chat?.data;
        
        if (data_r?.status == 1 && data_r?.data) {
          setInputText('');
          socket?.emit("message_request", data_r?.data);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to send message");
      }
    }
  };



  const handleInputChange = (text) => {
    setInputText(text);
    
   
    socket?.emit("typing", {
      groupId: UserSelect?.GCOMPCODE + UserSelect?.DEPARTMENT,
      isTyping: text.length > 0
    });
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indication after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit("typing", {
        groupId: UserSelect?.GCOMPCODE + UserSelect?.DEPARTMENT,
        isTyping: false
      });
    }, 2000);
  };


  const renderMessage = ({ item, index }) => {
    const showAvatar = index === 0 || 
                      messages[index - 1].sender !== item.sender || 
                      item.isNewDay;
    
    return (
      <View>


        {item.isNewDay && (
          <View style={styles.dateDivider}>
            <Text style={styles.dateDividerText}>{item.date}</Text>
          </View>
        )}
        
        <View style={[
          styles.messageRow,
          item.isMe ? styles.myMessageRow : styles.otherMessageRow
        ]}>
          {!item.isMe && showAvatar && (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.userdata?.username?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          
          <View style={[
            styles.messageContainer,
            item.isMe ? styles.myMessage : styles.otherMessage
          ]}>

             <Text style={[
              tailwind`mb-0 font-bold`,
              item.isMe ? styles.myMessageText : styles.otherMessageText
            ]}>
              {item?.userdata?.username}
            </Text>
            <Text style={[
              styles.messageText,
              item.isMe ? styles.myMessageText : styles.otherMessageText
            ]}>
              {item?.text}
            </Text>
            <Text style={[
              styles.messageTime,
              item.isMe ? styles.myMessageTime : styles.otherMessageTime
            ]}>
              {item.time}
              {item.isMe && (
                <Icon 
                  name={item.status === 'delivered' ? 'done-all' : 'done'} 
                  size={12} 
                  color={item.status === 'delivered' ? '#4FC3F7' : 'rgba(255,255,255,0.7)'} 
                  style={styles.statusIcon}
                />
              )}
            </Text>
          </View>
          
          {item.isMe && (
            <View style={styles.myMessageSpacer} />
          )}
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (isTyping) {
      return (
        <View style={styles.typingIndicator}>
          <View style={styles.typingBubble}>
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
            <View style={styles.typingDot} />
          </View>
        </View>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load messages</Text>
        <TouchableOpacity onPress={refetch} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles?.header}>

        <View style={styles?.header_body}>
        <Icon
        
         name={'group'} 
                  size={25} 
                  color={"black"} 
                  style={styles.statusIcon_header}
        ></Icon>
         <View>  
          <Text>{UserSelect?.DEPARTMENT}</Text>
          <Text style={tailwind`text-gray-400`}>5 Members</Text>
          </View>
          </View>

          <View style={styles?.header_body}>

          <Icon
         name={'add-call'} 
                  size={25} 
                  color={"black"} 
                  
        ></Icon>
          </View>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => item.id || `message-${index}`}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={renderFooter}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={handleInputChange}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              inputText.trim() === '' && styles.sendButtonDisabled
            ]} 
            onPress={handleSend}
            disabled={inputText.trim() === '' || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Icon name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    marginBottom: 10,
  },
  retryButton: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
    maxWidth: '100%',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
  },header:{
    backgroundColor:"white",
    padding:14,
    flexDirection:"row",
    justifyContent:"space-between"
   

  },header_body:{
     flexDirection:"row",
      gap:20,
      textAlign:"center",
      alignItems:"center"

  },
  myMessage: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: 'black',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  otherMessageTime: {
    color: 'rgba(0,0,0,0.5)',
  },
  statusIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    padding: 8,
    backgroundColor: 'white',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },statusIcon_header:{
    backgroundColor:"#e6f1f2",
    padding:3,
    borderRadius:10

  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  myMessageSpacer: {
    width: 40,
  },
  dateDivider: {
    alignSelf: 'center',
    backgroundColor: '#e1e1e1',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginVertical: 12,
  },
  dateDividerText: {
    fontSize: 12,
    color: '#555',
  },
  typingIndicator: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'flex-start',
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: '#E5E5EA',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#777',
    marginHorizontal: 2,
  },
});

export default ChatScreen;