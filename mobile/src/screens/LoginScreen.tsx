import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface Props {
  onLogin: () => void;
}

export default function LoginScreen({ onLogin }: Props) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>AuraLyrics</Text>
      <Text style={styles.subtitle}>Paroles synchronisées pour Spotify</Text>
      <TouchableOpacity style={styles.button} onPress={onLogin} activeOpacity={0.8}>
        <Text style={styles.buttonText}>Connexion avec Spotify</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 48,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 50,
  },
  buttonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
});
