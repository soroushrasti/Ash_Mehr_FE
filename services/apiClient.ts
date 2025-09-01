import { buildApiUrl, getApiHeaders } from '@/constants/Config';
import { Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import type { ApiResponse } from '@/types/api';

export type ApiRequestOptions = {
  endpoint: string; // e.g., '/signup-admin'
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any; // Will be JSON.stringified if not a string/FormData
  headers?: Record<string, string>;
  includeAuth?: boolean; // default true
  // UX options
  successMessage?: string; // Show OK alert with this message on success
  redirectOnSuccessTo?: Href; // e.g., '/'
  showErrorAlert?: boolean; // default true
};

function showOkAlert(message: string, onOk?: () => void) {
  if (Platform.OS === 'web') {
    window.alert(message);
    onOk?.();
  } else {
    Alert.alert('Success', message, [
      { text: 'OK', onPress: () => onOk?.() },
    ]);
  }
}

function showError(message: string) {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert('Error', message);
  }
}

export async function apiRequest<T = any>(opts: ApiRequestOptions): Promise<ApiResponse<T>> {
  const {
    endpoint,
    method = 'POST',
    body,
    headers = {},
    includeAuth = true,
    successMessage,
    redirectOnSuccessTo,
    showErrorAlert = true,
  } = opts;

  // Prepare headers
  const baseHeaders = getApiHeaders(includeAuth);
  const finalHeaders: Record<string, string> = { ...baseHeaders, ...headers };

  // Prepare body (JSON by default)
  let finalBody: BodyInit | undefined;
  if (body instanceof FormData) {
    // Let the browser set proper multipart boundary; remove content-type
    delete finalHeaders['Content-Type'];
    finalBody = body as any;
  } else if (typeof body === 'string') {
    finalBody = body;
  } else if (body !== undefined) {
    finalBody = JSON.stringify(body);
  }

  let response: Response | undefined;
  try {
    response = await fetch(buildApiUrl(endpoint), {
      method,
      headers: finalHeaders,
      body: finalBody,
    });
  } catch (networkErr: any) {
    const message = networkErr?.message || 'Network error';
    if (showErrorAlert) showError(message);
    return { success: false, error: message };
  }

  // Parse response (try JSON first, fallback to text)
  let result: any = null;
  let isJson = false;
  const contentType = response.headers.get('content-type') || '';
  try {
    if (contentType.includes('application/json')) {
      result = await response.json();
      isJson = true;
    } else {
      const text = await response.text();
      try {
        result = JSON.parse(text);
        isJson = true;
      } catch {
        result = text;
      }
    }
  } catch {
    // ignore parse errors
  }

  if (response.ok) {
    const okMsg = successMessage;
    const doRedirect = () => {
      if (redirectOnSuccessTo) {
        router.replace(redirectOnSuccessTo);
      }
    };

    if (okMsg) {
      showOkAlert(okMsg, doRedirect);
    } else if (redirectOnSuccessTo) {
      doRedirect();
    }

    return { success: true, data: result as T, message: (isJson && result?.message) || okMsg };
  }

  // Build error message
  let message = 'Request failed';
  if (isJson) {
    message = result?.message || result?.error || result?.detail || message;
    const detail = Array.isArray(result?.detail) ? result.detail : null;
    if (detail) {
      message = detail.map((d: any) => d.msg || JSON.stringify(d)).join('\n');
    }
  } else if (typeof result === 'string' && result.trim()) {
    message = result;
  } else {
    message = `${message} (HTTP ${response.status})`;
  }

  if (showErrorAlert) showError(message);

  return { success: false, error: message };
}
