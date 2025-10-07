import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function FeedScreen() {
  const router = useRouter();
  const { name, token, userId } = useLocalSearchParams();

  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const API_KEY = "042f7bffb5f4cb1bcfda9389abc1506d8c75e35c84e813517759d8cf131fa3b1";

  // ✅ Animation แยกตามโพสต์
  const likeAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;

  const getAnim = (id: string) => {
    if (!likeAnimations[id]) likeAnimations[id] = new Animated.Value(1);
    return likeAnimations[id];
  };

  const bounceLike = (id: string) => {
    const anim = getAnim(id);
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 1.3,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // ✅ โหลดโพสต์ทั้งหมด
  const fetchPosts = async () => {
    try {
      const res = await fetch("https://cis.kku.ac.th/api/classroom/status", {
        headers: {
          Accept: "application/json",
          "x-api-key": API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "โหลดโพสต์ไม่สำเร็จ");
      setPosts(data.data || []);
    } catch (err: any) {
      Alert.alert("เกิดข้อผิดพลาด", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, []);

  // ✅ ไลค์ได้ครั้งเดียวเท่านั้น
  const handleLike = async (id: string, liked: boolean) => {
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
      if (!res.ok) throw new Error(data.message || "ไม่สามารถกดถูกใจได้");

      bounceLike(id);
      fetchPosts();
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  // ✅ โพสต์ใหม่
  const addPost = async () => {
    if (!newPost.trim()) return;
    try {
      const res = await fetch("https://cis.kku.ac.th/api/classroom/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newPost }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "โพสต์ไม่สำเร็จ");

      setNewPost("");
      fetchPosts();
    } catch (err: any) {
      Alert.alert("โพสต์ไม่สำเร็จ", err.message);
    }
  };

  // ✅ ชื่อจากอีเมล
  const formatNameFromEmail = (email?: string) => {
    if (!email) return "ไม่ทราบชื่อ";
    const prefix = email.split("@")[0];
    const parts = prefix.split(".");
    return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
  };

  return (
    <LinearGradient colors={["#1A2980", "#26D0CE"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <Text style={styles.title}>📢 ฟีดนักศึกษา</Text>

        {/* กล่องโพสต์ใหม่ */}
        <View style={styles.newPostContainer}>
          <TextInput
            style={styles.input}
            placeholder="เขียนโพสต์ใหม่..."
            placeholderTextColor="#ddd"
            value={newPost}
            onChangeText={setNewPost}
          />
          <TouchableOpacity style={styles.postButton} onPress={addPost}>
            <Text style={styles.postButtonText}>โพสต์</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#fff"
            style={{ marginTop: 50 }}
          />
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => {
              const liked = item.like?.some((l: any) => l._id === userId);
              const anim = getAnim(item._id);

              return (
                <View style={styles.card}>
                  {/* Header */}
                  <View style={styles.header}>
                    <Image
                      source={{
                        uri: item.createdBy?.image
                          ? `https://cis.kku.ac.th${item.createdBy.image}`
                          : "https://i.pravatar.cc/100?u=" +
                            (item.createdBy?.email || "user"),
                      }}
                      style={styles.avatar}
                    />
                    <View>
                      <Text style={styles.name}>
                        {formatNameFromEmail(item.createdBy?.email)}
                      </Text>
                      <Text style={styles.time}>
                        {new Date(item.createdAt).toLocaleString("th-TH")}
                      </Text>
                    </View>
                  </View>

                  {/* เนื้อหาโพสต์ */}
                  <Text style={styles.postText}>{item.content}</Text>

                  {/* ปุ่ม Action */}
                  <View style={styles.actions}>
                    <TouchableOpacity
                      disabled={liked} // ✅ ปิดการกดซ้ำ
                      onPress={() => handleLike(item._id, liked)}
                    >
                      <Animated.Text
                        style={[
                          styles.like,
                          { transform: [{ scale: anim }] },
                          liked && { opacity: 0.6 }, // ทำให้ดูจางถ้ากดแล้ว
                        ]}
                      >
                        {liked ? "💖 " : "🤍 "}
                        {item.like?.length || 0}
                      </Animated.Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/feed/[id]",
                          params: { id: item._id, token, userId },
                        })
                      }
                    >
                      <Text style={styles.comment}>
                        💬 {item.comment?.length || 0} ความคิดเห็น
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  newPostContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
  },
  postButton: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  postButtonText: {
    color: "#1A2980",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  avatar: { width: 45, height: 45, borderRadius: 25, marginRight: 10 },
  name: { color: "#fff", fontSize: 16, fontWeight: "600" },
  time: { color: "#ccc", fontSize: 12 },
  postText: { color: "#fff", fontSize: 16, marginBottom: 10 },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    paddingTop: 8,
  },
  like: { color: "#ffb3b3", fontSize: 15, fontWeight: "600" },
  comment: { color: "#ccefff", fontSize: 15 },
});
