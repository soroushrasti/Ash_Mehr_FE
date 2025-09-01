import Constants from 'expo-constants';

// Get environment variables from expo config or process.env
const getEnvVar = (name: string, defaultValue?: string): string => {
  // Try expo config first (for native builds)
  const expoValue = Constants.expoConfig?.extra?.[name];
  if (expoValue) return expoValue;

  // Try process.env (for web/development)
  // eslint-disable-next-line expo/no-dynamic-env-var
  const processValue = process.env[name];
  if (processValue) return processValue;

  // Return default value or throw error
  if (defaultValue !== undefined) return defaultValue;
  throw new Error(`Environment variable ${name} is not defined`);
};

export const Config = {
  // API Configuration
    /// for DEV http://localhost:8000
    API_BASE_URL: getEnvVar('API_BASE_URL', 'http://localhost:8000'),
    /// for prod https://ashmehr-production.up.railway.app
  // API_BASE_URL: getEnvVar('API_BASE_URL', 'https://ashmehr-production.up.railway.app'),
  API_TOKEN: getEnvVar('API_TOKEN', 'abd5ae82bad3dba4288914aeee0f6215fda2eb66490c72fdb5c1f080bb9dc441'),

  // Google Maps
  GOOGLE_MAPS_API_KEY: getEnvVar('GOOGLE_MAPS_API_KEY', 'AIzaSyCx8-7Y3c7sPHyDfltKMvBitIAmdUwvLFk'),

  // App Settings
  APP_ENV: getEnvVar('APP_ENV', 'development'),
  DEBUG_MODE: getEnvVar('DEBUG_MODE', 'true') === 'true',

  // API Endpoints
  ENDPOINTS: {
    CREATE_NEEDY: '/signup-register',
    CREATE_ADMIN: '/signup-admin',
    FIND_NEEDY: '/find-register',
    EDIT_ADMIN: '/edit-admin',
    LOGIN: '/login',
  }
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string): string => {
  return `${Config.API_BASE_URL}${endpoint}`;
};

// Helper function to get API headers
export const getApiHeaders = (includeAuth: boolean = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (includeAuth && Config.API_TOKEN) {
    headers['Authorization'] = `Bearer ${Config.API_TOKEN}`;
  }

  return headers;
};
