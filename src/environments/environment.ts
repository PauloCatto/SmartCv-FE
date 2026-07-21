const isProd = window.location.hostname !== 'localhost';

export const environment = {
  production: isProd,
  apiUrl: isProd ? 'https://api-smart-cv.vercel.app' : 'http://localhost:3000',
  uploadUrl: isProd ? 'https://api-smart-cv.vercel.app' : 'http://localhost:3000',
  geminiApiKey: '',
  googleClientId: '67534728936-13lfj27iblcfj22h9hg4koir6pcfmv09.apps.googleusercontent.com'
};
