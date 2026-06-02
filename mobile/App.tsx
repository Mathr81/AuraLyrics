import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSpotifyAuth } from './src/hooks/useSpotifyAuth';
import LoginScreen from './src/screens/LoginScreen';
import LyricsScreen from './src/screens/LyricsScreen';

export default function App() {
  const { isAuthenticated, loading, login, logout, getValidToken } = useSpotifyAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      {isAuthenticated ? (
        <LyricsScreen getValidToken={getValidToken} onLogout={logout} />
      ) : (
        <LoginScreen onLogin={login} />
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  loading: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
});
