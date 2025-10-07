import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";

export default function PostDetail() {
  const { id, token, userId } = useLocalSearchParams(); // ✅ เพิ่ม userId ที่ส่งมาจาก feed
  const [post, setPost] = useState<any>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const likeAnim = useRef(new Animated.Value(1)).current;

  const API_KEY = "042f7bffb5f4cb1bcfda9389abc1506d8c75e35c84e813517759d8cf131fa3b1";

  // ✅ ดึงโพสต์ตาม ID
  const fetchPost = async () => {
    try {
      const res = await fetch(
        `https://cis.kku.ac.th/api/classroom/status/${id}`,
        {
          headers: {
            Accept: "application/json",
            "x-api-key": API_KEY,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "โหลดโพสต์ไม่สำเร็จ");
      setPost(data.data);
    } catch (err: any) {
      Alert.alert("เกิดข้อผิดพลาด", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPost();
  }, []);

  // ✅ ไลค์ได้ครั้งเดียวเท่านั้น
  const handleLike = async () => {
    if (!post) return;

    const liked = post.like?.some((l: any) => l._id === userId);
    if (liked) {
      Alert.alert("แจ้งเตือน", "คุณได้กดถูกใจโพสต์นี้ไปแล้ว ❤️");
      return;
    }

    try {
      const res = await fetch("https://cis.kku.ac.th/api/classroom/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ statusId: id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "กดถูกใจไม่สำเร็จ");

      bounceLike();
      fetchPost();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  // ✅ เพิ่มคอมเมนต์
  const addComment = async () => {
    if (!input.trim()) return;
    try {
      const res = await fetch("https://cis.kku.ac.th/api/classroom/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: input, statusId: id }),
      });

      if (!res.ok) throw new Error("เพิ่มคอมเมนต์ไม่สำเร็จ");
      setInput("");
      fetchPost();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  // ✅ ลบคอมเมนต์เฉพาะของตัวเองเท่านั้น
  const deleteComment = async (commentId: string, createdById: string) => {
    if (createdById !== userId) {
      Alert.alert("แจ้งเตือน", "คุณไม่สามารถลบคอมเมนต์ของผู้อื่นได้ ❌");
      return;
    }

    Alert.alert("ยืนยัน", "คุณต้องการลบคอมเมนต์นี้หรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ลบ",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(
              `https://cis.kku.ac.th/api/classroom/comment/${commentId}`,
              {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  "x-api-key": API_KEY,
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ statusId: id }),
              }
            );

            if (!res.ok) throw new Error("ลบคอมเมนต์ไม่สำเร็จ");
            fetchPost();
          } catch (err: any) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  };

  // ✅ แปลงชื่อจากอีเมล
  const formatNameFromEmail = (email?: string) => {
    if (!email) return "ไม่ทราบชื่อ";
    const prefix = email.split("@")[0];
    const parts = prefix.split(".");
    return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
  };

  // ✅ Animation เวลากดไลก์
  const bounceLike = () => {
    Animated.sequence([
      Animated.timing(likeAnim, {
        toValue: 1.3,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (loading)
    return (
      <LinearGradient colors={["#1A2980", "#26D0CE"]} style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#fff"
          style={{ marginTop: 60 }}
        />
      </LinearGradient>
    );

  const liked = post.like?.some((l: any) => l._id === userId);

  return (
    <LinearGradient colors={["#1A2980", "#26D0CE"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <FlatList
          data={post?.comment || []}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <>
              {/* โพสต์หลัก */}
              <View style={styles.postCard}>
                <View style={styles.header}>
                  <Image
                    source={{
                      uri: post.createdBy?.image
                        ? `https://cis.kku.ac.th${post.createdBy.image}`
                        : "https://i.pravatar.cc/100?u=" + post._id,
                    }}
                    style={styles.avatar}
                  />
                  <View>
                    <Text style={styles.name}>
                      {formatNameFromEmail(post.createdBy?.email)}
                    </Text>
                    <Text style={styles.time}>
                      {new Date(post.createdAt).toLocaleString("th-TH")}
                    </Text>
                  </View>
                </View>

                <Text style={styles.postText}>{post.content}</Text>

                <TouchableOpacity
                  disabled={liked} // ✅ ปิดถ้ากดไปแล้ว
                  onPress={handleLike}
                >
                  <Animated.Text
                    style={[
                      styles.like,
                      { transform: [{ scale: likeAnim }] },
                      liked && { opacity: 0.6 },
                    ]}
                  >
                    {liked ? "💖" : "🤍"} {post.like?.length || 0} ถูกใจ
                  </Animated.Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.commentTitle}>💬 ความคิดเห็น</Text>
            </>
          }
          renderItem={({ item }) => (
            <View style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <Image
                  source={{
                    uri: item.createdBy?.image
                      ? `https://cis.kku.ac.th${item.createdBy.image}`
                      : "https://i.pravatar.cc/100?u=" + item.createdBy?.email,
                  }}
                  style={styles.avatarSmall}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.commentName}>
                    {formatNameFromEmail(item.createdBy?.email)}
                  </Text>
                  <Text style={styles.commentContent}>{item.content}</Text>
                  <Text style={styles.time}>
                    {new Date(item.createdAt).toLocaleString("th-TH")}
                  </Text>
                </View>

                {/* ✅ แสดงปุ่มลบเฉพาะคอมเมนต์ของเรา */}
                {item.createdBy?._id === userId && (
                  <TouchableOpacity
                    onPress={() => deleteComment(item._id, item.createdBy._id)}
                  >
                    <Text style={styles.deleteText}>🗑️</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />

        {/* กล่องเขียนคอมเมนต์ */}
        <View style={styles.commentInputRow}>
          <TextInput
            style={styles.commentInput}
            placeholder="เขียนความคิดเห็น..."
            placeholderTextColor="#ddd"
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity onPress={addComment}>
            <Text style={styles.send}>📨</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  postCard: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  name: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  time: { color: "#ccc", fontSize: 12 },
  postText: { color: "#fff", fontSize: 16, marginVertical: 10 },
  like: { color: "#ffb3b3", fontSize: 15, fontWeight: "600" },
  commentTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  commentCard: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  commentHeader: { flexDirection: "row", alignItems: "flex-start" },
  avatarSmall: { width: 35, height: 35, borderRadius: 20, marginRight: 10 },
  commentName: { color: "#fff", fontWeight: "600" },
  commentContent: { color: "#fff", fontSize: 14, marginTop: 3 },
  deleteText: { fontSize: 18, color: "#ff6666", paddingHorizontal: 5 },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    paddingTop: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#fff",
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  send: { fontSize: 22, color: "#fff" },
});
