// components/Layout.js
import Header from './Header';

/**
 * A reusable wrapper component for consistent page structure.
 * @param {object} props - Contains children (the page content) and a title.
 */
function Layout({ children, title }) {
  return (
    // Apply Tailwind CSS for minimum height and basic background
    <div className="min-h-screen bg-gray-50">
      {/* Header component for navigation and logout */}
      <Header /> 
      
      <main className="container mx-auto px-4 py-8">
        {/* Optional: Display a page title */}
        {title && (
          <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-2">
            {title}
          </h1>
        )}
        
        {/* Render the content of the page wrapped by this Layout */}
        {children}
      </main>
      
      {/* Optional: Footer component can go here */}
    </div>
  );
}

export default Layout;