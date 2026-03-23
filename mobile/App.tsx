import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/store/authStore';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </AuthProvider>
  );
}
