import React, { useState } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";

export default function StudentsByYearScreen() {
  const { token } = useLocalSearchParams();
  const [year, setYear] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_KEY ="042f7bffb5f4cb1bcfda9389abc1506d8c75e35c84e813517759d8cf131fa3b1";

  const fetchByYear = async () => {
    if (!year.trim()) {
      Alert.alert("กรุณากรอกปีการศึกษา");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`https://cis.kku.ac.th/api/classroom/class/${year}`, {
        headers: {
          Accept: "application/json",
          "x-api-key": API_KEY,
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("🎓 Data:", data);

      if (!res.ok) {
        throw new Error(data.message || "โหลดข้อมูลไม่สำเร็จ");
      }

      setStudents(data.data || []);
    } catch (err: any) {
      console.error("Error:", err);
      Alert.alert("เกิดข้อผิดพลาด", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#1A2980", "#26D0CE"]} style={styles.container}>
      <Text style={styles.title}>📚 รายชื่อนักศึกษาตามปีที่เข้าศึกษา</Text>

      <TextInput
        style={styles.input}
        placeholder="เช่น 2565"
        placeholderTextColor="#ddd"
        keyboardType="numeric"
        value={year}
        onChangeText={setYear}
      />

      <TouchableOpacity style={styles.button} onPress={fetchByYear}>
        <Text style={styles.buttonText}>ค้นหา</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item, index) => item._id || index.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>
                {item.firstname} {item.lastname}
              </Text>
              <Text style={styles.email}>📧 {item.email}</Text>
              <Text style={styles.role}>🎓 {item.type}</Text>
            </View>
          )}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  input: {
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  buttonText: { color: "#1A2980", fontWeight: "600" },
  card: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: { color: "#fff", fontSize: 18, fontWeight: "600" },
  email: { color: "#ddd", fontSize: 14 },
  role: { color: "#aee", fontSize: 13, marginTop: 5 },
});
