import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import api from '../api/axios';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) { Alert.alert('Error', 'Please enter your email'); return; }
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>🔑</Text>
      <Text style={s.title}>Reset password</Text>
      <Text style={s.subtitle}>{sent ? 'Check your email for a reset link' : "We'll send you a reset link"}</Text>
      {!sent ? (
        <View style={s.form}>
          <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="#64748b" keyboardType="email-address" autoCapitalize="none" />
          <TouchableOpacity style={s.button} onPress={handleSubmit}>
            <Text style={s.buttonText}>Send reset link</Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 24, alignSelf: 'center' }}>
        <Text style={s.link}>← Back to login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#020617' },
  title: { fontSize: 28, fontWeight: '700', color: '#f1f5f9', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 4, marginBottom: 32 },
  form: { gap: 16 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#f1f5f9', fontSize: 15 },
  button: { backgroundColor: '#6366f1', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { color: '#818cf8', fontWeight: '600', fontSize: 14 },
});
