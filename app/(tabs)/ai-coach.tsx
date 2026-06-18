import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  type NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputKeyPressEventData,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { RotateCcw, Send, Zap } from "lucide-react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { COLORS } from "@/constants/colors";
import { FONTS } from "@/constants/fonts";
import StreamingText from "@/components/chat/StreamingText";
import TypingIndicator from "@/components/chat/TypingIndicator";
import { askCoach } from "@/src/services/coachService";
import {
  loadCoachHistory,
  saveCoachHistory,
} from "@/src/services/coachHistoryService";
import { getQuickQuestions } from "@/src/services/contentService";
import type { ChatMessage, QuickQuestion } from "@/types";
import { useLanguage } from "@/hooks/useLanguage";
const LOGO_MARK = require("@/assets/images/logo-mark.png");
type WebTextInputKeyEvent = TextInputKeyPressEventData & {
  isComposing?: boolean;
  shiftKey?: boolean;
};
const D = {
  bg:       "#F5F6FA",
  card:     "#FFFFFF",
  accent:   COLORS.primary,
  accentDim:COLORS.softGreen,
  text:     "#0A0A0A",
  muted:    "#6B7280",
  light:    "#B0B8C4",
  border:   "#F0F0F0",
};
export default function AICoachTab() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quickQuestions, setQuickQuestions] = useState<QuickQuestion[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const isSendingRef = useRef(false);
  const historyLoadedRef = useRef(false);
  const scrollToEnd = () =>
    flatListRef.current?.scrollToEnd({ animated: true });
  const inputBottomClearance = isWeb ? 96 : Math.max(98, insets.bottom + 72);
  useEffect(() => {
    let mounted = true;
    const loadQuickQuestions = async () => {
      try {
        const items = await getQuickQuestions();
        if (mounted) setQuickQuestions(items);
      } catch {
        if (mounted) setQuickQuestions([]);
      }
    };
    void loadQuickQuestions();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    loadCoachHistory()
      .then((saved) => {
        if (mounted && saved.length) {
          setMessages((current) => (current.length === 0 ? saved : current));
        }
      })
      .finally(() => {
        historyLoadedRef.current = true;
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!historyLoadedRef.current) return;
    void saveCoachHistory(messages);
  }, [messages]);

  const createMessage = (text: string, isUser: boolean): ChatMessage => ({
      id:        `msg-${Date.now()}-${isUser ? "u" : "ai"}`,
      text,
      isUser,
      timestamp: "Just now",
      createdAt: Date.now(),
  });
  const runCoach = async (msg: string, history: ChatMessage[]) => {
    isSendingRef.current = true;
    setIsSending(true);
    setIsTyping(true);
    setErrorText(null);
    setFailedMessage(null);
    setTimeout(scrollToEnd, 60);
    try {
      const reply = await askCoach(msg, history);
      const aiMessage = createMessage(reply, false);
      setIsTyping(false);
      setStreamingId(aiMessage.id);
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setIsTyping(false);
      setErrorText(getCoachErrorMessage(error));
      setFailedMessage(msg);
    } finally {
      isSendingRef.current = false;
      setIsSending(false);
      setTimeout(scrollToEnd, 100);
    }
  };
  const handleSend = (text?: string) => {
    const msg = (text ?? inputText).trim();
    if (!msg || isSendingRef.current) return;
    const history = messages;
    setMessages((prev) => [...prev, createMessage(msg, true)]);
    setInputText("");
    void runCoach(msg, history);
  };
  const handleRetry = () => {
    if (!failedMessage || isSendingRef.current) return;
    void runCoach(failedMessage, messages.slice(0, -1));
  };
  const getCoachErrorMessage = (error: unknown) => {
    const message = error instanceof Error ? error.message : "";
    if (/edge function|failed to send|network request/i.test(message)) {
      return "I couldn't reach the coach right now. Please check your connection and try again.";
    }
    return message || "The coach could not respond right now. Please try again.";
  };
  const handleInputKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>
  ) => {
    if (Platform.OS !== "web") return;
    const nativeEvent = event.nativeEvent as WebTextInputKeyEvent;
    if (nativeEvent.key !== "Enter" || nativeEvent.shiftKey || nativeEvent.isComposing) {
      return;
    }
    event.preventDefault();
    void handleSend();
  };
  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => (
    <Animated.View
      entering={FadeInUp.delay(index < 3 ? 0 : 80).duration(280)}
      style={[styles.msgRow, item.isUser ? styles.msgRowUser : styles.msgRowAI]}
    >
      {!item.isUser && (
        <View style={styles.aiAvatar}>
          <Image resizeMode="contain" source={LOGO_MARK} style={styles.messageLogo} />
        </View>
      )}
      <View style={[styles.bubble, item.isUser ? styles.bubbleUser : styles.bubbleAI]}>
        {!item.isUser && (
          <Text style={styles.aiLabel}>NutriPadi</Text>
        )}
        {!item.isUser && item.id === streamingId ? (
          <StreamingText
            text={item.text}
            style={styles.bubbleText}
            onTick={scrollToEnd}
            onDone={() => setStreamingId((id) => (id === item.id ? null : id))}
          />
        ) : (
          <Text style={[styles.bubbleText, item.isUser && styles.bubbleTextUser]}>
            {item.text}
          </Text>
        )}
        <Text style={[styles.timestamp, item.isUser && styles.timestampUser]}>
          {item.timestamp}
        </Text>
      </View>
    </Animated.View>
  );
  const ListFooter = isTyping ? (
    <Animated.View
      entering={FadeInUp.duration(220)}
      style={[styles.msgRow, styles.msgRowAI]}
    >
      <View style={styles.aiAvatar}>
        <Image resizeMode="contain" source={LOGO_MARK} style={styles.messageLogo} />
      </View>
      <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
        <TypingIndicator color={D.muted} />
      </View>
    </Animated.View>
  ) : null;
  const isEmpty = messages.length === 0;
  const ListHeader = (
    <Animated.View entering={FadeInDown.duration(300)} style={styles.quickSection}>
      {isEmpty && (
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeAvatar}>
            <Image resizeMode="contain" source={LOGO_MARK} style={styles.welcomeLogo} />
          </View>
          <Text style={styles.welcomeTitle}>Hi, I&apos;m NutriPadi</Text>
          <Text style={styles.welcomeSub}>
            Ask me about any African meal, your nutrition goal, or what to cook
            today. Tap a question below to start.
          </Text>
        </View>
      )}
      <View style={styles.quickLabelRow}>
        <Zap color={D.accent} size={13} fill={D.accent} />
        <Text style={styles.quickLabel}>Suggested Questions</Text>
      </View>
      <View style={styles.chipWrap}>
        {quickQuestions.slice(0, 6).map((q) => (
          <Pressable
            key={q.id}
            onPress={() => handleSend(q.text)}
            style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
          >
            <Text style={styles.chipText}>{q.text}</Text>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.contentRail, isWeb && styles.contentRailWeb]}>
          <Animated.View
            entering={FadeInDown.duration(320)}
            style={[styles.header, isWeb && styles.headerWeb]}
          >
            <View style={styles.headerAvatarWrap}>
              <View style={styles.headerAvatar}>
                <Image resizeMode="contain" source={LOGO_MARK} style={styles.headerLogo} />
              </View>
              <View style={styles.statusDot} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.headerTitle}>NutriPadi</Text>
              <Text style={styles.headerSub}>Your personal nutrition coach</Text>
            </View>
            <View style={styles.onlineBadge}>
              <Text style={styles.onlineBadgeText}>Online</Text>
            </View>
          </Animated.View>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={[
              styles.chatContent,
              isWeb && styles.chatContentWeb,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={ListHeader}
            ListFooterComponent={ListFooter}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
          {errorText && (
            <Animated.View
              entering={FadeInUp.duration(220)}
              style={[styles.errorBar, isWeb && styles.errorBarWeb]}
            >
              <Text style={styles.errorText} numberOfLines={2}>
                {errorText}
              </Text>
              {failedMessage && (
                <Pressable onPress={handleRetry} style={styles.retryBtn}>
                  <RotateCcw color={COLORS.error} size={14} />
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
              )}
            </Animated.View>
          )}
          <Animated.View
            entering={FadeInDown.delay(150).duration(320)}
            style={[
              styles.inputBar,
              isWeb && styles.inputBarWeb,
              { paddingBottom: inputBottomClearance },
            ]}
          >
            <View style={[styles.inputWrap, isWeb && styles.inputWrapWeb]}>
              <TextInput
                style={styles.input}
                placeholder={t.askAboutFood}
                placeholderTextColor={D.light}
                value={inputText}
                onChangeText={setInputText}
                onKeyPress={handleInputKeyPress}
                onSubmitEditing={Platform.OS === "web" ? undefined : () => handleSend()}
                returnKeyType="send"
                multiline
                submitBehavior="submit"
              />
              <Pressable
                onPress={() => handleSend()}
                disabled={!inputText.trim() || isSending}
                style={({ pressed }) => [
                  styles.sendBtn,
                  (!inputText.trim() || isSending) && styles.sendBtnOff,
                  pressed && styles.sendBtnPressed,
                ]}
              >
                <Send color="#FFFFFF" size={17} />
              </Pressable>
            </View>
            <Text style={styles.disclaimer}>{t.coachDisclaimer}</Text>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: D.bg },
  flex: { flex: 1 },
  contentRail: {
    flex:  1,
    width: "100%",
  },
  contentRailWeb: {
    alignSelf: "center",
    maxWidth:  740,
    paddingHorizontal: 18,
  },
  header: {
    flexDirection:  "row",
    alignItems:     "center",
    gap:            14,
    paddingHorizontal: 22,
    paddingVertical:   16,
    backgroundColor:   D.card,
    shadowColor:       "#000",
    shadowOpacity:     0.05,
    shadowRadius:      12,
    shadowOffset:      { width: 0, height: 3 },
    elevation:         4,
  },
  headerWeb: {
    borderRadius: 22,
    borderWidth:  1,
    borderColor:  "rgba(15,23,42,0.05)",
    marginTop:    16,
  },
  headerAvatarWrap: {
    position: "relative",
  },
  headerAvatar: {
    width:           46,
    height:          46,
    borderRadius:    15,
    backgroundColor: D.card,
    alignItems:      "center",
    justifyContent:  "center",
    borderWidth:     1,
    borderColor:     D.accentDim,
    shadowColor:     "#000",
    shadowOpacity:   0.1,
    shadowRadius:    10,
    shadowOffset:    { width: 0, height: 4 },
    elevation:       6,
  },
  headerLogo: {
    width: 34,
    height: 34,
  },
  statusDot: {
    position:        "absolute",
    bottom:          0,
    right:           0,
    width:           12,
    height:          12,
    borderRadius:    6,
    backgroundColor: D.accent,
    borderWidth:     2,
    borderColor:     D.card,
  },
  headerTitle: {
    color:      D.text,
    fontSize:   18,
    fontFamily: FONTS.extraBold,
  },
  headerSub: {
    color:      D.muted,
    fontSize:   12,
    fontFamily: FONTS.medium,
    marginTop:  1,
  },
  onlineBadge: {
    backgroundColor:   D.accentDim,
    borderRadius:      999,
    paddingHorizontal: 10,
    paddingVertical:   5,
  },
  onlineBadgeText: {
    color:      D.accent,
    fontSize:   11,
    fontFamily: FONTS.bold,
  },
  chatContent: {
    paddingHorizontal: 18,
    paddingTop:        18,
    paddingBottom:     12,
  },
  chatContentWeb: {
    paddingHorizontal: 0,
    paddingTop:        20,
    paddingBottom:     18,
  },
  welcomeCard: {
    alignItems:      "center",
    backgroundColor: D.card,
    borderRadius:    22,
    paddingHorizontal: 22,
    paddingVertical:   26,
    marginBottom:    22,
    borderWidth:     1,
    borderColor:     D.border,
    shadowColor:     "#000",
    shadowOpacity:   0.05,
    shadowRadius:    14,
    shadowOffset:    { width: 0, height: 4 },
    elevation:       2,
  },
  welcomeAvatar: {
    width:           58,
    height:          58,
    borderRadius:    19,
    backgroundColor: D.accentDim,
    alignItems:      "center",
    justifyContent:  "center",
    marginBottom:    14,
  },
  welcomeLogo: {
    width:  38,
    height: 38,
  },
  welcomeTitle: {
    color:      D.text,
    fontSize:   19,
    fontFamily: FONTS.extraBold,
    marginBottom: 6,
  },
  welcomeSub: {
    color:      D.muted,
    fontSize:   14,
    fontFamily: FONTS.regular,
    lineHeight: 21,
    textAlign:  "center",
  },
  errorBar: {
    flexDirection:   "row",
    alignItems:      "center",
    justifyContent:  "space-between",
    gap:             12,
    marginHorizontal: 18,
    marginBottom:    8,
    paddingHorizontal: 14,
    paddingVertical:   12,
    borderRadius:    14,
    backgroundColor: COLORS.softRed,
    borderWidth:     1,
    borderColor:     "rgba(226,54,54,0.18)",
  },
  errorBarWeb: {
    marginHorizontal: 0,
  },
  errorText: {
    flex:       1,
    color:      COLORS.error,
    fontSize:   13,
    fontFamily: FONTS.medium,
    lineHeight: 18,
  },
  retryBtn: {
    flexDirection:   "row",
    alignItems:      "center",
    gap:             5,
    paddingHorizontal: 12,
    paddingVertical:   7,
    borderRadius:    999,
    backgroundColor: COLORS.white,
    borderWidth:     1,
    borderColor:     "rgba(226,54,54,0.22)",
  },
  retryText: {
    color:      COLORS.error,
    fontSize:   12,
    fontFamily: FONTS.bold,
  },
  quickSection: {
    marginBottom: 22,
  },
  quickLabelRow: {
    flexDirection:  "row",
    alignItems:     "center",
    gap:            5,
    marginBottom:   10,
  },
  quickLabel: {
    color:         D.muted,
    fontSize:      11,
    fontFamily:    FONTS.semiBold,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap:      "wrap",
    gap:           8,
  },
  chip: {
    backgroundColor:   D.accentDim,
    borderRadius:      20,
    paddingHorizontal: 14,
    paddingVertical:   9,
  },
  chipPressed: {
    backgroundColor: D.accent,
  },
  chipText: {
    color:      COLORS.primaryDark,
    fontSize:   13,
    fontFamily: FONTS.semiBold,
  },
  msgRow: {
    flexDirection: "row",
    marginBottom:  14,
    gap:           8,
  },
  msgRowUser: {
    justifyContent: "flex-end",
  },
  msgRowAI: {
    justifyContent: "flex-start",
  },
  aiAvatar: {
    width:           34,
    height:          34,
    borderRadius:    11,
    backgroundColor: D.card,
    borderWidth:     1,
    borderColor:     D.accentDim,
    alignItems:      "center",
    justifyContent:  "center",
    marginTop:       4,
    flexShrink:      0,
  },
  messageLogo: {
    width: 24,
    height: 24,
  },
  bubble: {
    maxWidth:     "76%",
    borderRadius: 18,
    padding:      14,
  },
  bubbleUser: {
    backgroundColor:      D.accent,
    borderBottomRightRadius: 5,
    shadowColor:          D.accent,
    shadowOpacity:        0.25,
    shadowRadius:         10,
    shadowOffset:         { width: 0, height: 4 },
    elevation:            4,
  },
  bubbleAI: {
    backgroundColor:   D.card,
    borderBottomLeftRadius: 5,
    shadowColor:       "#000",
    shadowOpacity:     0.06,
    shadowRadius:      12,
    shadowOffset:      { width: 0, height: 3 },
    elevation:         2,
  },
  typingBubble: {
    paddingVertical:   16,
    paddingHorizontal: 16,
  },
  aiLabel: {
    color:      D.accent,
    fontSize:   10,
    fontFamily: FONTS.extraBold,
    letterSpacing: 0.4,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  bubbleText: {
    color:      D.text,
    fontSize:   14,
    fontFamily: FONTS.regular,
    lineHeight: 21,
  },
  bubbleTextUser: {
    color: "#FFFFFF",
  },
  timestamp: {
    color:      D.light,
    fontSize:   10,
    fontFamily: FONTS.medium,
    marginTop:  6,
  },
  timestampUser: {
    color:     "rgba(255,255,255,0.55)",
    textAlign: "right",
  },
  inputBar: {
    paddingHorizontal: 18,
    paddingTop:        10,
    backgroundColor:   D.bg,
  },
  inputBarWeb: {
    paddingHorizontal: 0,
    backgroundColor:   "transparent",
  },
  inputWrap: {
    flexDirection:   "row",
    alignItems:      "center",
    gap:             10,
    backgroundColor: D.card,
    borderRadius:    28,
    minHeight:       58,
    paddingLeft:     18,
    paddingRight:    6,
    paddingVertical: 6,
    shadowColor:     "#000",
    shadowOpacity:   0.07,
    shadowRadius:    16,
    shadowOffset:    { width: 0, height: 4 },
    elevation:       4,
  },
  inputWrapWeb: {
    borderWidth:   1,
    borderColor:   "rgba(15,23,42,0.06)",
    shadowOpacity: 0.1,
    shadowRadius:  18,
  },
  input: {
    flex:       1,
    fontSize:   15,
    fontFamily: FONTS.regular,
    color:      D.text,
    maxHeight:  96,
    minHeight:  40,
    paddingVertical: 8,
  },
  sendBtn: {
    width:           44,
    height:          44,
    borderRadius:    22,
    backgroundColor: D.accent,
    alignItems:      "center",
    justifyContent:  "center",
    shadowColor:     D.accent,
    shadowOpacity:   0.35,
    shadowRadius:    8,
    shadowOffset:    { width: 0, height: 3 },
    elevation:       4,
    flexShrink:      0,
  },
  sendBtnOff: {
    backgroundColor: D.border,
    shadowOpacity:   0,
    elevation:       0,
  },
  sendBtnPressed: {
    opacity:   0.85,
    transform: [{ scale: 0.95 }],
  },
  disclaimer: {
    color:      D.light,
    fontSize:   10,
    fontFamily: FONTS.medium,
    textAlign:  "center",
    marginTop:  8,
  },
});