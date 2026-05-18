import { useState, useRef } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Send, Sparkles, MessageCircle } from "lucide-react-native";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";

import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import {
  QUICK_QUESTIONS,
  AI_RESPONSES,
  INITIAL_MESSAGES,
} from "@/data/coach";
import type { ChatMessage } from "@/types";
import { useLanguage } from "@/hooks/useLanguage";

export default function AICoachTab() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${isUser ? "u" : "ai"}`,
      text,
      isUser,
      timestamp: "Just now",
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const getAIResponse = (question: string): string => {
    // Check if it matches a quick question
    const matched = QUICK_QUESTIONS.find(
      (q) => q.text.toLowerCase() === question.toLowerCase()
    );
    if (matched && AI_RESPONSES[matched.id]) {
      return AI_RESPONSES[matched.id];
    }
    return AI_RESPONSES.default;
  };

  const handleSend = (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    addMessage(messageText, true);
    setInputText("");

    // Simulate AI thinking delay
    setTimeout(() => {
      const response = getAIResponse(messageText);
      addMessage(response, false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 800);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.messageBubble,
        item.isUser ? styles.userBubble : styles.aiBubble,
      ]}
    >
      {!item.isUser && (
        <View style={styles.aiAvatar}>
          <Sparkles color={COLORS.primary} size={14} />
        </View>
      )}
      <View
        style={[
          styles.bubbleContent,
          item.isUser ? styles.userContent : styles.aiContent,
        ]}
      >
        {!item.isUser && (
          <Text style={styles.aiLabel}>{t.aiNutritionist}</Text>
        )}
        <Text
          style={[
            styles.messageText,
            item.isUser ? styles.userText : styles.aiText,
          ]}
        >
          {item.text}
        </Text>
        <Text
          style={[
            styles.timestamp,
            item.isUser && styles.userTimestamp,
          ]}
        >
          {item.timestamp}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <MessageCircle color={COLORS.primary} size={22} />
        </View>
        <View>
          <Text style={styles.headerTitle}>{t.aiCoachTitle}</Text>
          <Text style={styles.headerSub}>{t.aiCoachSub}</Text>
        </View>
      </View>

      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Animated.View entering={FadeInUp.duration(400)}>
            {/* Quick Questions */}
            <Text style={styles.quickLabel}>{t.quickQuestions}</Text>
            <View style={styles.quickGrid}>
              {QUICK_QUESTIONS.slice(0, 6).map((q) => (
                <Pressable
                  key={q.id}
                  onPress={() => handleSend(q.text)}
                  style={({ pressed }) => [
                    styles.quickChip,
                    pressed && styles.quickChipPressed,
                  ]}
                >
                  <Text style={styles.quickText}>{q.text}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        }
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      {/* Input Bar */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(400)}
        style={styles.inputBar}
      >
        <TextInput
          style={styles.input}
          placeholder={t.askAboutFood}
          placeholderTextColor={COLORS.textLight}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
        />
        <Pressable
          onPress={() => handleSend()}
          style={({ pressed }) => [
            styles.sendButton,
            pressed && styles.sendPressed,
            !inputText.trim() && styles.sendDisabled,
          ]}
          disabled={!inputText.trim()}
        >
          <Send color={COLORS.white} size={18} />
        </Pressable>
      </Animated.View>

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        {t.coachDisclaimer}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 22,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.softGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontFamily: FONTS.extraBold,
  },
  headerSub: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginTop: 1,
  },
  chatList: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 8,
  },
  quickLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  quickChip: {
    backgroundColor: COLORS.softGreen,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(6, 193, 103, 0.15)",
  },
  quickChipPressed: {
    backgroundColor: COLORS.primary,
  },
  quickText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  // Messages
  messageBubble: {
    flexDirection: "row",
    marginBottom: 14,
    gap: 8,
  },
  userBubble: {
    justifyContent: "flex-end",
  },
  aiBubble: {
    justifyContent: "flex-start",
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.softGreen,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  bubbleContent: {
    maxWidth: "78%",
    borderRadius: 18,
    padding: 14,
  },
  userContent: {
    backgroundColor: COLORS.secondary,
    borderBottomRightRadius: 4,
    marginLeft: "auto",
  },
  aiContent: {
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  aiLabel: {
    color: COLORS.primary,
    fontSize: 11,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 21,
  },
  userText: {
    color: COLORS.white,
  },
  aiText: {
    color: COLORS.text,
  },
  timestamp: {
    color: COLORS.textLight,
    fontSize: 10,
    fontFamily: FONTS.medium,
    marginTop: 6,
  },
  userTimestamp: {
    color: "rgba(255,255,255,0.6)",
    textAlign: "right",
  },
  // Input
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  sendDisabled: {
    backgroundColor: COLORS.border,
  },
  disclaimer: {
    color: COLORS.textLight,
    fontSize: 10,
    fontFamily: FONTS.medium,
    textAlign: "center",
    paddingHorizontal: 22,
    paddingBottom: 8,
  },
});
