// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';

// IMPORTANT: Define the base URL of your Python/Flask backend
const FLASK_BASE_URL = 'http://localhost:5000'; 

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Send credentials to the Flask API
      const response = await fetch(`${FLASK_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 2. SUCCESS: Store the JWT in localStorage
        localStorage.setItem('token', data.token);
        
        // Optionally store user data (e.g., name, familyId)
        localStorage.setItem('user', JSON.stringify(data.user)); 

        // 3. Redirect to the main calendar page
        router.push('/');
      } else {
        // 4. Handle login failure
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    }
  };

  return (
    // Tailwind CSS for simple centering and styling
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-900">Sign in to your account</h2>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-red-600 text-center bg-red-100 p-2 rounded">{error}</p>}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign in
          </button>
        </form>
        
        <div className="text-sm text-center">
            <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Don't have an account? Register
            </a>
          </div>
      </div>
    </div>
  );
}

export default LoginPage;