import React, { useState, useEffect } from 'react';
import './App.css';
import ServiceList from './components/ServiceList';
import BookingForm from './components/BookingForm';
import CalendarView from './components/CalendarView';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');

  // Check if user is logged in on app start
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setCurrentView('home'); // Redirect to home after login
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('home');
  };

  const switchToRegister = () => {
    setCurrentView('register');
  };

  const switchToLogin = () => {
    setCurrentView('login');
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="container">
          <h1>💇‍♀️ FlexiBook Salon</h1>
          <nav>
            <button onClick={() => setCurrentView('home')}>Home</button>
            <button onClick={() => setCurrentView('services')}>Services</button>
            <button onClick={() => setCurrentView('booking')}>Book Now</button>
            <button onClick={() => setCurrentView('calendar')}>Calendar</button>
            <button onClick={() => setCurrentView('bookings')}>My Bookings</button>
            {user ? (
              <div className="user-menu">
                <span className="welcome">Welcome, {user.name}</span>
                <button onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <button onClick={() => setCurrentView('login')}>Login</button>
            )}
          </nav>
        </div>
      </header>

      <main className="container">
        {/* Home View */}
        {currentView === 'home' && (
          <div className="home-view">
            <div className="hero">
              <h2>Welcome to FlexiBook Salon</h2>
              <p>Book your appointments easily online!</p>
              {user ? (
                <button 
                  className="cta-button"
                  onClick={() => setCurrentView('booking')}
                >
                  Book Now
                </button>
              ) : (
                <button 
                  className="cta-button"
                  onClick={() => setCurrentView('login')}
                >
                  Login to Book
                </button>
              )}
            </div>
            
            <div className="features">
              <div className="feature-card">
                <h3>🕒 Easy Scheduling</h3>
                <p>Book appointments 24/7 with real-time availability</p>
              </div>
              <div className="feature-card">
                <h3>📱 Any Device</h3>
                <p>Access from your phone, tablet, or computer</p>
              </div>
              <div className="feature-card">
                <h3>🔔 Reminders</h3>
                <p>Get notifications for your upcoming appointments</p>
              </div>
            </div>
          </div>
        )}

        {/* Booking View */}
        {currentView === 'booking' && (
          <div className="booking-view">
            {user ? (
              <BookingForm />
            ) : (
              <div className="login-prompt">
                <h2>Please Login to Book</h2>
                <p>You need to be logged in to make a booking.</p>
                <button 
                  onClick={() => setCurrentView('login')}
                  className="cta-button"
                >
                  Login Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* Calendar View */}
        {currentView === 'calendar' && (
          <div className="calendar-view-page">
            <CalendarView />
          </div>
        )}

        {/* Login View */}
        {currentView === 'login' && (
          <div className="auth-view">
            <Login 
              onLogin={handleLogin}
              switchToRegister={switchToRegister}
            />
          </div>
        )}

        {/* Register View */}
        {currentView === 'register' && (
          <div className="auth-view">
            <Register 
              onLogin={handleLogin}
              switchToLogin={switchToLogin}
            />
          </div>
        )}

        {/* Services View */}
        {currentView === 'services' && (
          <div className="services-view">
            <ServiceList />
          </div>
        )}

        {/* My Bookings View (placeholder) */}
        {currentView === 'bookings' && (
          <div className="bookings-view">
            {user ? (
              <div className="bookings-content">
                <h2>My Bookings</h2>
                <p>Your booking history will appear here.</p>
                <div className="coming-soon">
                  <p>📋 Booking management coming soon!</p>
                </div>
              </div>
            ) : (
              <div className="login-prompt">
                <h2>Please Login</h2>
                <p>You need to be logged in to view your bookings.</p>
                <button 
                  onClick={() => setCurrentView('login')}
                  className="cta-button"
                >
                  Login Now
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;