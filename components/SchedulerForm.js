// components/ScheduleForm.js
import { useState, useEffect } from 'react';

// Flask API Base URL (must match the one in pages/login.js)
const FLASK_BASE_URL = 'http://localhost:5000'; 

/**
 * Handles adding and editing schedule events.
 * @param {object} props - Takes a default event object for editing, and callbacks for success/cancel.
 */
function ScheduleForm({ event = null, onSaveSuccess, onCancel }) {
  const isEditing = !!event; // Boolean flag: true if editing, false if creating
  
  // Initialize state with default event values or empty strings for a new event
  const [formData, setFormData] = useState({
    title: event?.title || '',
    startDateTime: event?.startDateTime ? new Date(event.startDateTime).toISOString().slice(0, 16) : '',
    endDateTime: event?.endDateTime ? new Date(event.endDateTime).toISOString().slice(0, 16) : '',
    category: event?.category || 'Family',
    assignedMembers: event?.assignedMembers.map(m => m._id || m) || [], // Placeholder for member IDs
  });
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  // NOTE: You would typically fetch the list of family members here for the select/checkboxes
  const [familyMembers, setFamilyMembers] = useState([{ _id: 'self', name: 'Me' }]); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberChange = (e) => {
    const { options } = e.target;
    // Simple way to handle multi-select: get all selected options' values
    const selectedMembers = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
      
    // Filter out the 'self' placeholder for the actual request, but keep it if needed
    setFormData(prev => ({ 
      ...prev, 
      assignedMembers: selectedMembers.filter(id => id !== 'self')
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    const token = localStorage.getItem('token');
    if (!token) {
        setError("You must be logged in to save an event.");
        return;
    }

    try {
      const url = isEditing ? `${FLASK_BASE_URL}/api/schedules/${event._id}` : `${FLASK_BASE_URL}/api/schedules`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage(`Event successfully ${isEditing ? 'updated' : 'created'}!`);
        // Call the parent handler to update the calendar display
        onSaveSuccess(result.data); 
      } else {
        setError(result.message || `Failed to ${isEditing ? 'update' : 'create'} event.`);
      }
    } catch (err) {
      setError("Network error saving event.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl border border-gray-100">
      <h3 className="text-2xl font-semibold text-gray-900 mb-6">
        {isEditing ? 'Edit Event' : 'Add New Event'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-600 bg-red-100 p-3 rounded">{error}</p>}
        {message && <p className="text-green-600 bg-green-100 p-3 rounded">{message}</p>}

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        {/* Start Date/Time (using input type="datetime-local") */}
        <div>
          <label htmlFor="startDateTime" className="block text-sm font-medium text-gray-700">Start Time</label>
          <input
            type="datetime-local"
            id="startDateTime"
            name="startDateTime"
            value={formData.startDateTime}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        {/* End Date/Time */}
        <div>
          <label htmlFor="endDateTime" className="block text-sm font-medium text-gray-700">End Time</label>
          <input
            type="datetime-local"
            id="endDateTime"
            name="endDateTime"
            value={formData.endDateTime}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>

        {/* Category Select */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="Family">Family</option>
            <option value="Personal">Personal</option>
            <option value="Birthday">Birthday</option>
            <option value="Holiday">Holiday</option>
          </select>
        </div>

        {/* Assigned Members (Mocked for POC) */}
        <div>
          <label htmlFor="assignedMembers" className="block text-sm font-medium text-gray-700">Assigned Members</label>
          <select
            id="assignedMembers"
            name="assignedMembers"
            multiple={true}
            value={formData.assignedMembers} // Needs to handle array of IDs
            onChange={handleMemberChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-20"
          >
            {/* Hardcoded list for proof of concept */}
            {familyMembers.map(member => (
              <option key={member._id} value={member._id}>
                {member.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple members.</p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-150"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition duration-150 shadow-lg"
          >
            {isEditing ? 'Save Changes' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ScheduleForm;