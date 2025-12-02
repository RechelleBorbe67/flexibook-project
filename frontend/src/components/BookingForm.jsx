import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BookingForm.css';

function BookingForm() {
  const [services, setServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasDateFromCalendar, setHasDateFromCalendar] = useState(false);
  
  const [formData, setFormData] = useState({
    service: '',
    date: '',
    startTime: '',
    notes: ''
  });

  // Check if user is admin on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'admin') {
      setIsAdmin(true);
      setMessage({ 
        type: 'error', 
        text: 'Administrators cannot book appointments. Please use a customer account.' 
      });
    }
  }, []);

  // Check for selected date from CalendarView - FIXED VERSION
  useEffect(() => {
    const selectedDate = localStorage.getItem('selectedBookingDate');
    console.log('Selected date from localStorage:', selectedDate); // Debug log
    
    if (selectedDate && !isAdmin) {
      // Format the date to YYYY-MM-DD for the input field
      const formattedDate = formatDateForInput(selectedDate);
      console.log('Formatted date for input:', formattedDate); // Debug log
      
      setFormData(prev => ({
        ...prev,
        date: formattedDate
      }));
      setHasDateFromCalendar(true);
      
      // Clear the stored date
      localStorage.removeItem('selectedBookingDate');
    }
  }, [isAdmin]);

  // Helper function to format date for input field (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    try {
      // If it's already in YYYY-MM-DD format, return as-is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // Otherwise, parse and format it
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Fetch services on component mount
  useEffect(() => {
    if (!isAdmin) {
      fetchServices();
    }
  }, [isAdmin]);

  // Fetch available slots when service or date changes
  useEffect(() => {
    if (!isAdmin && formData.service && formData.date) {
      fetchAvailableSlots();
    }
  }, [formData.service, formData.date, isAdmin]);

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/services');
      setServices(response.data.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load services' });
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      console.log('Fetching slots for:', formData.service, formData.date); // Debug log
      
      const response = await axios.get('/api/bookings/available-slots', {
        params: {
          serviceId: formData.service,
          date: formData.date
        }
      });
      console.log('Available slots response:', response.data); // Debug log
      
      setAvailableSlots(response.data.data.availableSlots);
      setMessage({ type: '', text: '' });
    } catch (error) {
      console.error('Error fetching slots:', error); // Debug log
      setMessage({ type: 'error', text: 'Failed to load available time slots' });
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    if (isAdmin) return; // Prevent input changes for admins
    
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (isAdmin) {
      setMessage({ 
        type: 'error', 
        text: 'Administrators cannot book appointments. Please use a customer account.' 
      });
      return false;
    }
    
    if (!formData.service) {
      setMessage({ type: 'error', text: 'Please select a service' });
      return false;
    }
    if (!formData.date) {
      setMessage({ type: 'error', text: 'Please select a date' });
      return false;
    }
    if (!formData.startTime) {
      setMessage({ type: 'error', text: 'Please select a time slot' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isAdmin) {
      setMessage({ 
        type: 'error', 
        text: 'Administrators cannot book appointments. Please use a customer account.' 
      });
      return;
    }
    
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ type: 'error', text: 'Please login to book an appointment' });
        return;
      }

      // Check if user is admin (double check)
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'admin') {
        setMessage({ 
          type: 'error', 
          text: 'Administrators cannot book appointments. Please use a customer account.' 
        });
        setLoading(false);
        return;
      }

      // Calculate end time based on service duration
      const selectedService = services.find(s => s._id === formData.service);
      const startTime = new Date(`2000-01-01T${formData.startTime}`);
      const endTime = new Date(startTime.getTime() + selectedService.duration * 60000);
      const endTimeString = endTime.toTimeString().slice(0, 5);

      const bookingData = {
        service: formData.service,
        date: formData.date,
        startTime: formData.startTime,
        endTime: endTimeString,
        notes: formData.notes
      };

      console.log('Submitting booking data:', bookingData); // Debug log

      const response = await axios.post('/api/bookings', bookingData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setMessage({ 
        type: 'success', 
        text: 'Booking created successfully! We look forward to seeing you.' 
      });
      
      // Reset form
      setFormData({
        service: '',
        date: '',
        startTime: '',
        notes: ''
      });
      setAvailableSlots([]);
      setHasDateFromCalendar(false);

    } catch (error) {
      console.error('Booking error:', error); // Debug log
      if (error.response?.data?.message) {
        setMessage({ type: 'error', text: error.response.data.message });
      } else {
        setMessage({ type: 'error', text: 'Failed to create booking' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get default date - either from calendar or tomorrow
  const getDefaultDate = () => {
    if (hasDateFromCalendar && formData.date) {
      return formData.date;
    }
    // Return tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (isAdmin) {
    return (
      <div className="booking-form-container">
        <h2>Book Your Appointment</h2>
        <div className="message error">
          Administrators cannot book appointments. Please use a customer account.
        </div>
        <div className="admin-message">
          <p>As an administrator, you can:</p>
          <ul>
            <li>Manage services in the Admin Dashboard</li>
            <li>View and manage bookings</li>
            <li>Generate reports</li>
            <li>Manage users</li>
          </ul>
          <p>To book an appointment, please log in with a customer account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-form-container">
      <h2>Book Your Appointment</h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label htmlFor="service">Select Service *</label>
          <select
            id="service"
            name="service"
            value={formData.service}
            onChange={handleInputChange}
            required
            disabled={loading}
          >
            <option value="">Choose a service...</option>
            {services.map(service => (
              <option key={service._id} value={service._id}>
                {service.name} - ₱{service.price} ({service.duration} min)
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="date">Select Date *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date || getDefaultDate()}
            onChange={handleInputChange}
            min={getTodayDate()}
            required
            disabled={loading}
          />
          {hasDateFromCalendar && formData.date && (
            <small className="date-hint">Selected from calendar: {formData.date}</small>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="startTime">Select Time *</label>
          <select
            id="startTime"
            name="startTime"
            value={formData.startTime}
            onChange={handleInputChange}
            disabled={!formData.service || !formData.date || loading}
            required
          >
            <option value="">Choose a time...</option>
            {availableSlots.map(slot => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
          {loading && formData.service && formData.date && (
            <div className="loading-slots">Loading available times...</div>
          )}
          {!loading && formData.service && formData.date && availableSlots.length === 0 && (
            <div className="no-slots">No available time slots for this date</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="notes">Additional Notes (Optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Any special requests or notes..."
            rows="3"
            disabled={loading}
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>
    </div>
  );
}

export default BookingForm;