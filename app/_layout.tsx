import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { AuthProvider } from '@/components/AuthContext';
// import { useFonts } from 'expo-font';
import { useFonts, Vazirmatn_300Light, Vazirmatn_400Regular, Vazirmatn_500Medium, Vazirmatn_700Bold } from '@expo-google-fonts/vazirmatn';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useEffect } from 'react';
import { Config } from '@/constants/Config';

function setupFetchLogger() {
  if (!Config.DEBUG_MODE) return;
  const g: any = globalThis as any;
  if (g.__fetchLoggerInstalled) return;
  const originalFetch = g.fetch?.bind(g) as typeof fetch;
  if (!originalFetch) return;

  g.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const method = (init?.method || 'GET').toUpperCase();
    const url = typeof input === 'string' ? input : (input as URL).toString();
    const start = Date.now();

    // Redact auth header
    const redactedHeaders: Record<string, string> = {};
    try {
      const h = new Headers(init?.headers as any);
      h.forEach((v, k) => {
        redactedHeaders[k] = k.toLowerCase() === 'authorization' ? '***' : v;
      });
    } catch {
      // ignore
    }

    let bodyPreview: string | undefined;
    try {
      if (typeof init?.body === 'string') bodyPreview = init.body.slice(0, 1000);
      else if (init?.body) bodyPreview = '[non-string body]';
    } catch {
      // ignore
    }

    try {
      // Request log
      console.log('[HTTP ▶]', method, url, { headers: redactedHeaders, body: bodyPreview });
      const resp = await originalFetch(input as any, init as any);
      const clone = resp.clone();
      let text = '';
      try { text = await clone.text(); } catch {}
      const ms = Date.now() - start;
      console.log('[HTTP ◀]', method, url, resp.status, `${ms}ms`, text?.slice(0, 1000));
      return resp;
    } catch (err) {
      const ms = Date.now() - start;
      console.log('[HTTP ✖]', method, url, `${ms}ms`, err);
      throw err;
    }
  };

  g.__fetchLoggerInstalled = true;
}

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    Vazirmatn_300Light,
    Vazirmatn_400Regular,
    Vazirmatn_500Medium,
    Vazirmatn_700Bold,
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    setupFetchLogger();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutNav />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
