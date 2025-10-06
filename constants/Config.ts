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
    GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyCx8-7Y3c7sPHyDfltKMvBitIAmdUwvLFk',

    // Environment
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Default map region (Tehran, Iran)
    DEFAULT_MAP_REGION: {
        latitude: 35.6892,
        longitude: 51.3890,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    },
  // API Configuration
    /// for DEV http://localhost:8000
     API_BASE_URL: getEnvVar('API_BASE_URL', 'http://localhost:8080'),
    // / for prod https://ashmehr-production.up.railway.app
//  API_BASE_URL: getEnvVar('API_BASE_URL', 'https://ashmehr-production.up.railway.app'),
  API_TOKEN: getEnvVar('API_TOKEN', 'abd5ae82bad3dba4288914aeee0f6215fda2eb66490c72fdb5c1f080bb9dc441'),

  // App Settings
  APP_ENV: getEnvVar('APP_ENV', 'development'),
  DEBUG_MODE: getEnvVar('DEBUG_MODE', 'true') === 'true',

  // API Endpoints
  ENDPOINTS: {
    CREATE_NEEDY: '/signup-register',
    CREATE_CHILD_NEEDY: '/signup-child-register',
    CREATE_ADMIN: '/signup-admin',
    FIND_NEEDY: '/find-needy',
    FIND_ADMIN: '/find-admin',
    EDIT_ADMIN: '/edit-admin',
    LOGIN: '/login',
    SIGNIN_NEEDY: '/signin-needy',
    INFO_NEEDY: '/info-needy',
    INFO_ADMIN: '/info-admin',
    FIND_NEEDY_GEO: '/find-needy',
    FIND_ADMIN_GEO: '/find-admin',
    GET_NEEDY: '/get-needy',
    GET_ADMIN: '/get-admin',
    EDIT_NEEDY: '/edit-needy',
    DELETE_NEEDY: '/delete-needy',
    DELETE_CHILD_NEEDY: '/delete-child-needy',
    DELETE_ADMIN: '/delete-admin',
    GET_GOODS: '/get-goods',
    EDIT_GOOD: '/edit-good',
    ADD_GOOD: '/add-good',
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
    headers['X-API-Token'] = `${Config.API_TOKEN}`;
  }

  return headers;
};
