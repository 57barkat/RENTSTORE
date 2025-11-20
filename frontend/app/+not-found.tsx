import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '@/contextStore/AuthContext';

export default function NotFoundScreen() {
  const { loading } = useAuth();

  // Show loader instead of 404 page while auth is loading
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  // Once loading is finished, redirect or render fallback
  return null; // Will be handled by redirect in RootLayout
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
