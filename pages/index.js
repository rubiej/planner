// pages/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Calendar, { momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);
const FLASK_BASE_URL = 'http://localhost:5000'; 

function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchSchedules = async () => {
    // 1. Retrieve the JWT from localStorage
    const token = localStorage.getItem('token'); 

    if (!token) {
        // If no token, redirect to login (Unauthenticated access attempt)
        router.push('/login');
        return;
    }

    try {
      // 2. Send the token in the Authorization header to the Flask API
      const response = await fetch(`${FLASK_BASE_URL}/api/schedules`, {
        headers: {
          'Authorization': `Bearer ${token}`, // Key for Flask @token_required
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401 || response.status === 403) {
        // Token invalid/expired/unauthorized -> force relogin
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }
      
      const result = await response.json();

      if (response.ok && result.success) {
        // 3. Format the MongoDB data for react-big-calendar
        const formattedEvents = result.data.map(event => ({
          ...event,
          title: event.title,
          start: new Date(event.startDateTime), // Convert Python/MongoDB Date strings to Date objects
          end: new Date(event.endDateTime),
        }));
        setEvents(formattedEvents);
      } else {
        console.error("Failed to fetch schedules:", result.message);
      }
    } catch (error) {
      console.error("Network error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []); 

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-xl text-indigo-600">Loading your family schedule...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Header /> component would go here for navigation */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-2">🗓️ Family Calendar</h1>
        
        <div className="bg-white p-6 rounded-xl shadow-2xl h-[85vh]">
          {/* Calendar View */}
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            // Set height explicitly in style for the calendar component
            style={{ height: '100%' }} 
            className="text-sm"
          />
        </div>
      </main>
    </div>
  );
}

export default CalendarPage;