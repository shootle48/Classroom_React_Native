import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const router = useRouter();
  const { id, name, email, token } = useLocalSearchParams();

  return (
    <LinearGradient colors={["#1A2980", "#26D0CE"]} style={styles.container}>
      <Text style={styles.welcome}>ยินดีต้อนรับ 🎉</Text>
      <Text style={styles.username}>{name}</Text>
      <Text style={styles.subtext}>📧 {email}</Text>

      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/student",
            params: { token },
          })
        }
      >
        <Text style={styles.link}>📚 ดูรายชื่อนักศึกษา</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/feed",
            params: { name, token, userId: id }, // ✅ เพิ่ม userId มาด้วย
          })
        }
      >
        <Text style={styles.link}>📝 ไปยังหน้าโพสต์</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/")}
      >
        <Text style={styles.buttonText}>ออกจากระบบ</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  welcome: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
  },
  username: { fontSize: 22, color: "#fff", marginBottom: 5 },
  subtext: { fontSize: 16, color: "#eee", marginBottom: 40 },
  link: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 25,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginTop: 40,
  },
  buttonText: { color: "#1A2980", fontSize: 16, fontWeight: "bold" },
});
