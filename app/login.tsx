import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('กรุณากรอกข้อมูลให้ครบ');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('https://cis.kku.ac.th/api/classroom/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'x-api-key': '042f7bffb5f4cb1bcfda9389abc1506d8c75e35c84e813517759d8cf131fa3b1',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log('✅ Response:', data);

      if (!res.ok) {
        console.log('❌ Login failed:', data);
        throw new Error(data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }

      // ✅ เข้าถึงข้อมูลจริงจาก data.data
      const userData = data.data;
      if (!userData || !userData.token) {
        throw new Error('ข้อมูลตอบกลับจาก API ไม่ถูกต้อง');
      }

      const fullName = `${userData.firstname} ${userData.lastname}`;

      // ✅ ส่งข้อมูลไปหน้า home
      router.push({
        pathname: '/home',
        params: {
          id: userData._id,
          name: fullName,
          email: userData.email,
          token: userData.token,
        },
      });
    } catch (err: any) {
      console.error('🚨 Login Error:', err);
      Alert.alert('เข้าสู่ระบบไม่สำเร็จ', err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1A2980', '#26D0CE']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        <Text style={styles.title}>เข้าสู่ระบบ</Text>
        <Text style={styles.subtitle}>กรุณาเข้าสู่ระบบด้วยอีเมล @kkumail.com</Text>

        <TextInput
          style={styles.input}
          placeholder="อีเมลนักศึกษา"
          placeholderTextColor="#ddd"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="รหัสผ่าน"
          placeholderTextColor="#ddd"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← กลับไปหน้าแรก</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  inner: { padding: 30, alignItems: 'center' },
  title: { fontSize: 28, color: '#fff', fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#E0E0E0', marginBottom: 40 },
  input: {
    width: '90%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 12,
    borderRadius: 12,
    color: '#fff',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 25,
    marginTop: 15,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  buttonText: { color: '#1A2980', fontSize: 18, fontWeight: '600' },
  backText: { color: '#fff', marginTop: 30, fontSize: 14 },
});
