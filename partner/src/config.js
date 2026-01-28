export const drawerWidth = 260;

export const twitterColor = '#1DA1F2';
export const facebookColor = '#3b5998';
export const linkedInColor = '#0e76a8';

export const FIREBASE_API = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || ''
};

export const AWS_API = {
  poolId: process.env.REACT_APP_AWS_POOL_ID || '',
  appClientId: process.env.REACT_APP_AWS_APP_CLIENT_ID || ''
};

export const JWT_API = {
  secret: process.env.REACT_APP_JWT_SECRET || '',
  timeout: process.env.REACT_APP_JWT_TIMEOUT || '1 days'
};

export const AUTH0_API = {
  client_id: process.env.REACT_APP_AUTH0_CLIENT_ID || '',
  domain: process.env.REACT_APP_AUTH0_DOMAIN || ''
};

// ==============================|| THEME CONFIG  ||============================== //

const config = {
  defaultPath: '/',//  '/dashboard/analytics',
  fontFamily: `'Public Sans', sans-serif`,
  i18n: 'en',
  miniDrawer: false,
  container: true,
  mode: 'light',
  presetColor: 'theme7', // 'default',
  themeDirection: 'ltr'
};

export default config;
