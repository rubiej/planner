// pages/_app.js
import '../styles/globals.css'; // 1. Import your global Tailwind CSS file
import { AuthProvider } from '../contexts/AuthContext'; // 2. Import the AuthProvider (Will be created later)

/**
 * Custom App component to initialize pages.
 * @param {object} Component The active page component (e.g., index.js, login.js)
 * @param {object} pageProps Initial props for the page, often from Next.js data fetching
 */
function MyApp({ Component, pageProps }) {
  
  // By wrapping the Component with AuthProvider, the entire application 
  // will have access to authentication state (logged in user, token status).
  return (
    <AuthProvider>
      {/* The Component prop is the page component currently being rendered 
        (e.g., LoginPage, CalendarPage).
      */}
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;