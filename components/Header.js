// components/Header.js
import { useRouter } from 'next/router';
import Link from 'next/link';

function Header() {
  const router = useRouter();

  // 1. Get user data to display name (if logged in)
  // NOTE: In a final app, you'd use useAuth() here for real-time state.
  const userString = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = userString ? JSON.parse(userString) : null;
  
  const handleLogout = () => {
    // 2. Clear the JWT and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user'); 
    
    // 3. Redirect to the login page
    router.push('/login');
  };

  return (
    <header className="bg-indigo-600 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* Logo/App Title */}
        <Link href="/" className="text-xl font-bold text-white hover:text-indigo-100 transition duration-150">
            Family Planner
        </Link>
        
        <nav className="flex items-center space-x-6">
          {user ? (
            // --- Logged In View ---
            <>
              <span className="text-white text-sm font-medium hidden sm:block">
                Welcome, {user.name}
              </span>
              
              <Link href="/" className="text-white hover:text-indigo-200 transition duration-150">
                  Calendar
              </Link>

              <button
                onClick={handleLogout}
                className="py-1 px-3 bg-indigo-700 text-white text-sm rounded-md hover:bg-indigo-800 transition duration-150 shadow-lg"
              >
                Logout
              </button>
            </>
          ) : (
            // --- Logged Out View ---
            <>
              <Link href="/login" className="text-white hover:text-indigo-200 transition duration-150">
                  Login
              </Link>
              <Link href="/register" className="py-1 px-3 bg-indigo-700 text-white text-sm rounded-md hover:bg-indigo-800 transition duration-150 shadow-lg">
                  Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;