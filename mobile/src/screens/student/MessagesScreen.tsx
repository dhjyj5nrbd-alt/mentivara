import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface Message {
  id: string;
  text: string;
  sent: boolean;
  timestamp: string;
}

interface Conversation {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Message[];
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    initials: 'SC',
    avatarColor: '#7C3AED',
    lastMessage: 'Great progress on the calculus problems!',
    timestamp: '10:42 AM',
    unread: 2,
    messages: [
      { id: 'm1', text: 'Hi Alex! How are you finding the integration exercises?', sent: false, timestamp: '10:15 AM' },
      { id: 'm2', text: 'They are challenging but I think I am getting the hang of substitution', sent: true, timestamp: '10:20 AM' },
      { id: 'm3', text: 'That is wonderful to hear! Substitution is key for the exam.', sent: false, timestamp: '10:25 AM' },
      { id: 'm4', text: 'Should I focus more on partial fractions or trig substitution next?', sent: true, timestamp: '10:30 AM' },
      { id: 'm5', text: 'I would say partial fractions first. Let me send you some practice problems.', sent: false, timestamp: '10:38 AM' },
      { id: 'm6', text: 'Great progress on the calculus problems!', sent: false, timestamp: '10:42 AM' },
    ],
  },
  {
    id: '2',
    name: 'Prof. James Wilson',
    initials: 'JW',
    avatarColor: '#059669',
    lastMessage: 'The essay structure looks much better now',
    timestamp: '9:15 AM',
    unread: 0,
    messages: [
      { id: 'm1', text: 'I have revised the introduction as you suggested', sent: true, timestamp: '8:30 AM' },
      { id: 'm2', text: 'Let me take a look at it.', sent: false, timestamp: '8:45 AM' },
      { id: 'm3', text: 'The thesis statement is much stronger now. Good work!', sent: false, timestamp: '9:00 AM' },
      { id: 'm4', text: 'Thank you! Should I also revise the conclusion?', sent: true, timestamp: '9:05 AM' },
      { id: 'm5', text: 'Yes, try to mirror the thesis in your conclusion. Bring it full circle.', sent: false, timestamp: '9:10 AM' },
      { id: 'm6', text: 'The essay structure looks much better now', sent: false, timestamp: '9:15 AM' },
    ],
  },
  {
    id: '3',
    name: 'Dr. Emily Brooks',
    initials: 'EB',
    avatarColor: '#D97706',
    lastMessage: 'Can we reschedule Thursday to Friday?',
    timestamp: 'Yesterday',
    unread: 1,
    messages: [
      { id: 'm1', text: 'Hi Alex, I wanted to discuss our next physics session.', sent: false, timestamp: 'Yesterday 3:00 PM' },
      { id: 'm2', text: 'Sure, what did you have in mind?', sent: true, timestamp: 'Yesterday 3:15 PM' },
      { id: 'm3', text: 'We should cover electromagnetic induction before your mock exam.', sent: false, timestamp: 'Yesterday 3:20 PM' },
      { id: 'm4', text: 'That sounds perfect. I have been struggling with Faraday law.', sent: true, timestamp: 'Yesterday 3:30 PM' },
      { id: 'm5', text: 'Can we reschedule Thursday to Friday?', sent: false, timestamp: 'Yesterday 4:00 PM' },
    ],
  },
  {
    id: '4',
    name: 'Dr. Mark Thompson',
    initials: 'MT',
    avatarColor: '#E11D48',
    lastMessage: 'Your organic chemistry results are impressive',
    timestamp: 'Mon',
    unread: 0,
    messages: [
      { id: 'm1', text: 'I got 87% on the organic chemistry practice test!', sent: true, timestamp: 'Mon 11:00 AM' },
      { id: 'm2', text: 'That is fantastic! You have improved by 20 points since last month.', sent: false, timestamp: 'Mon 11:15 AM' },
      { id: 'm3', text: 'The reaction mechanisms are finally clicking', sent: true, timestamp: 'Mon 11:20 AM' },
      { id: 'm4', text: 'I can tell. Your approach to nucleophilic substitution was spot on.', sent: false, timestamp: 'Mon 11:30 AM' },
      { id: 'm5', text: 'Your organic chemistry results are impressive', sent: false, timestamp: 'Mon 11:35 AM' },
    ],
  },
];

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const sendMessage = () => {
    if (!inputText.trim() || !activeConversationId) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage: Message = {
      id: `m${Date.now()}`,
      text: inputText.trim(),
      sent: true,
      timestamp: timeStr,
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessage: newMessage.text,
              timestamp: timeStr,
            }
          : conv
      )
    );
    setInputText('');
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const openConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === id ? { ...conv, unread: 0 } : conv
      )
    );
    setActiveConversationId(id);
  };

  // Chat View
  if (activeConversation) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setActiveConversationId(null)}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={[styles.chatAvatar, { backgroundColor: activeConversation.avatarColor }]}>
            <Text style={styles.chatAvatarText}>{activeConversation.initials}</Text>
          </View>
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatHeaderName}>{activeConversation.name}</Text>
            <Text style={styles.chatHeaderStatus}>Online</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* Messages */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: false })
            }
          >
            {activeConversation.messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubbleWrap,
                  msg.sent ? styles.messageSentWrap : styles.messageReceivedWrap,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    msg.sent ? styles.messageSent : styles.messageReceived,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      msg.sent ? styles.messageTextSent : styles.messageTextReceived,
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.messageTime,
                    msg.sent ? styles.messageTimeSent : styles.messageTimeReceived,
                  ]}
                >
                  {msg.timestamp}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* Input Bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={Colors.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              activeOpacity={0.7}
              disabled={!inputText.trim()}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? Colors.white : Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Conversation List
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.listHeader}>
        <Ionicons name="chatbubbles-outline" size={28} color={Colors.primary} />
        <Text style={styles.listHeaderTitle}>Messages</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => openConversation(item.id)}
            activeOpacity={0.6}
          >
            <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
              <Text style={styles.avatarText}>{item.initials}</Text>
            </View>
            <View style={styles.conversationContent}>
              <View style={styles.conversationTop}>
                <Text style={styles.conversationName}>{item.name}</Text>
                <Text style={[
                  styles.conversationTime,
                  item.unread > 0 && styles.conversationTimeUnread,
                ]}>
                  {item.timestamp}
                </Text>
              </View>
              <View style={styles.conversationBottom}>
                <Text style={styles.conversationPreview} numberOfLines={1}>
                  {item.lastMessage}
                </Text>
                {item.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },

  // Conversation List
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  listHeaderTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  conversationContent: {
    flex: 1,
    gap: 4,
  },
  conversationTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  conversationTime: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  conversationTimeUnread: {
    color: Colors.primary,
    fontWeight: '700',
  },
  conversationBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationPreview: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: Colors.primary,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },

  // Chat View
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatAvatarText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  chatHeaderInfo: {
    flex: 1,
    gap: 2,
  },
  chatHeaderName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  chatHeaderStatus: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '500',
  },

  // Messages
  messagesContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubbleWrap: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  messageSentWrap: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  messageReceivedWrap: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  messageSent: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  messageReceived: {
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  messageTextSent: {
    color: Colors.white,
  },
  messageTextReceived: {
    color: Colors.text,
  },
  messageTime: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  messageTimeSent: {
    textAlign: 'right',
  },
  messageTimeReceived: {
    textAlign: 'left',
  },

  // Input Bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.card,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.border,
  },
});
