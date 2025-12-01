    import React, { useState, useEffect } from 'react';
    import axios from 'axios';
    import './CalendarView.css';

    function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [availableSlots, setAvailableSlots] = useState({});
    const [selectedService, setSelectedService] = useState('');
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);

    // Get current month and year
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Fetch services on component mount
    useEffect(() => {
        fetchServices();
    }, []);

    // Fetch available slots when service or month changes
    useEffect(() => {
        if (selectedService) {
        fetchMonthAvailability();
        }
    }, [selectedService, currentMonth, currentYear]);

    const fetchServices = async () => {
        try {
        const response = await axios.get('/api/services');
        setServices(response.data.data);
        } catch (error) {
        console.error('Failed to load services');
        }
    };

    const fetchMonthAvailability = async () => {
        setLoading(true);
        try {
        // Get first and last day of current month
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        
        // For demo, we'll fetch a sample of dates. In production, you might want to batch requests
        const daysInMonth = lastDay.getDate();
        const sampleDates = [1, 8, 15, 22, daysInMonth]; // Sample dates to check
        
        const slotsData = {};
        
        for (const day of sampleDates) {
            const date = new Date(currentYear, currentMonth, day);
            const dateString = date.toISOString().split('T')[0];
            
            try {
            const response = await axios.get('/api/bookings/available-slots', {
                params: {
                serviceId: selectedService,
                date: dateString
                }
            });
            slotsData[dateString] = response.data.data.availableSlots.length > 0;
            } catch (error) {
            slotsData[dateString] = false;
            }
        }
        
        setAvailableSlots(slotsData);
        } catch (error) {
        console.error('Failed to load availability');
        } finally {
        setLoading(false);
        }
    };

    // Navigation functions
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Generate calendar days
    const generateCalendarDays = () => {
        const days = [];
        
        // First day of the month
        const firstDay = new Date(currentYear, currentMonth, 1);
        // Last day of the month
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        
        // Days from previous month
        const startingDayOfWeek = firstDay.getDay();
        for (let i = 0; i < startingDayOfWeek; i++) {
        const prevDate = new Date(currentYear, currentMonth, -i);
        days.unshift({
            date: prevDate,
            isCurrentMonth: false,
            isAvailable: false
        });
        }
        
        // Current month days
        for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dateString = date.toISOString().split('T')[0];
        const isAvailable = availableSlots[dateString] || false;
        const isToday = isTodayDate(date);
        
        days.push({
            date,
            isCurrentMonth: true,
            isAvailable,
            isToday
        });
        }
        
        // Days from next month to complete the grid
        const totalCells = 42; // 6 weeks * 7 days
        while (days.length < totalCells) {
        const nextDate = new Date(currentYear, currentMonth + 1, days.length - lastDay.getDate() + 1);
        days.push({
            date: nextDate,
            isCurrentMonth: false,
            isAvailable: false
        });
        }
        
        return days;
    };

    const isTodayDate = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const handleDateClick = (date) => {
        if (date < new Date().setHours(0, 0, 0, 0)) {
        return; // Can't select past dates
        }
        
        const dateString = date.toISOString().split('T')[0];
        // In a real app, you might navigate to booking form with pre-selected date
        alert(`Selected date: ${dateString}. Would navigate to booking form.`);
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const calendarDays = generateCalendarDays();

    return (
        <div className="calendar-view">
        <div className="calendar-header">
            <h2>Book by Calendar</h2>
            
            <div className="service-selector">
            <label>Select Service:</label>
            <select 
                value={selectedService} 
                onChange={(e) => setSelectedService(e.target.value)}
            >
                <option value="">Choose a service...</option>
                {services.map(service => (
                <option key={service._id} value={service._id}>
                    {service.name}
                </option>
                ))}
            </select>
            </div>

            <div className="calendar-controls">
            <button onClick={goToPreviousMonth} className="nav-btn">
                ‹ Previous
            </button>
            
            <h3 className="current-month">
                {monthNames[currentMonth]} {currentYear}
            </h3>
            
            <button onClick={goToNextMonth} className="nav-btn">
                Next ›
            </button>
            
            <button onClick={goToToday} className="today-btn">
                Today
            </button>
            </div>
        </div>

        {loading && (
            <div className="calendar-loading">Loading availability...</div>
        )}

        <div className="calendar-grid">
            {/* Day headers */}
            {dayNames.map(day => (
            <div key={day} className="day-header">
                {day}
            </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((day, index) => (
            <div
                key={index}
                className={`calendar-day ${
                !day.isCurrentMonth ? 'other-month' : ''
                } ${day.isToday ? 'today' : ''} ${
                day.isAvailable ? 'available' : 'unavailable'
                } ${day.date < new Date().setHours(0, 0, 0, 0) ? 'past' : ''}`}
                onClick={() => day.isCurrentMonth && handleDateClick(day.date)}
            >
                <span className="day-number">{day.date.getDate()}</span>
                {day.isAvailable && day.isCurrentMonth && (
                <div className="availability-dot"></div>
                )}
            </div>
            ))}
        </div>

        <div className="calendar-legend">
            <div className="legend-item">
            <div className="legend-color available"></div>
            <span>Available</span>
            </div>
            <div className="legend-item">
            <div className="legend-color unavailable"></div>
            <span>Unavailable</span>
            </div>
            <div className="legend-item">
            <div className="legend-color today"></div>
            <span>Today</span>
            </div>
        </div>
        </div>
    );
    }

    export default CalendarView;