import React, { useState } from 'react';
import './App.css';
import ServiceList from './components/ServiceList';
import BookingForm from './components/BookingForm';
import CalendarView from './components/CalendarView';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);

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
              <button onClick={() => setUser(null)}>Logout</button>
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
              <button 
                className="cta-button"
                onClick={() => setCurrentView('booking')}
              >
                Book Now
              </button>
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

        {/* Booking View (replaced with BookingForm component) */}
        {currentView === 'booking' && (
          <div className="booking-view">
            <BookingForm />
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
          <div className="login-view">
            <h2>Login to Your Account</h2>
            <form className="login-form">
              <div className="form-group">
                <input type="email" placeholder="Email address" />
              </div>
              
              <div className="form-group">
                <input type="password" placeholder="Password" />
              </div>
              
              <button type="submit" className="submit-button">
                Login
              </button>
              
              <p className="switch-form">
                Don't have an account?{' '}
                <span onClick={() => setCurrentView('register')}>
                  Register here
                </span>
              </p>
            </form>
          </div>
        )}

        {/* Register View */}
        {currentView === 'register' && (
          <div className="register-view">
            <h2>Create Account</h2>
            <form className="register-form">
              <div className="form-group">
                <input type="text" placeholder="Full Name" />
              </div>
              
              <div className="form-group">
                <input type="email" placeholder="Email address" />
              </div>
              
              <div className="form-group">
                <input type="password" placeholder="Password" />
              </div>
              
              <div className="form-group">
                <input type="tel" placeholder="Phone Number" />
              </div>
              
              <button type="submit" className="submit-button">
                Create Account
              </button>
              
              <p className="switch-form">
                Already have an account?{' '}
                <span onClick={() => setCurrentView('login')}>
                  Login here
                </span>
              </p>
            </form>
          </div>
        )}

        {/* Services View */}
        {currentView === 'services' && (
          <div className="services-view">
            <ServiceList />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;