import React, { useState } from 'react';
import './App.css';
import ServiceList from './components/ServiceList';

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

        {/* Booking View */}
        {currentView === 'booking' && (
          <div className="booking-view">
            <h2>Make a Reservation</h2>
            <form className="booking-form">
              <div className="form-group">
                <label>Service:</label>
                <select>
                  <option>Haircut - $25</option>
                  <option>Hair Coloring - $60</option>
                  <option>Manicure - $20</option>
                  <option>Pedicure - $25</option>
                  <option>Facial - $45</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Date:</label>
                <input type="date" />
              </div>
              
              <div className="form-group">
                <label>Time:</label>
                <input type="time" />
              </div>
              
              <div className="form-group">
                <label>Your Name:</label>
                <input type="text" placeholder="Enter your name" />
              </div>
              
              <div className="form-group">
                <label>Phone Number:</label>
                <input type="tel" placeholder="Enter your phone number" />
              </div>
              
              <button type="submit" className="submit-button">
                Book Appointment
              </button>
            </form>
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
            <h2>Our Services</h2>
            <div className="services-grid">
              <div className="service-card">
                <h3>💇‍♀️ Haircut</h3>
                <p>$25 • 45 minutes</p>
                <p>Professional haircut and styling</p>
              </div>
              
              <div className="service-card">
                <h3>🎨 Hair Coloring</h3>
                <p>$60 • 2 hours</p>
                <p>Full hair coloring service</p>
              </div>
              
              <div className="service-card">
                <h3>💅 Manicure</h3>
                <p>$20 • 30 minutes</p>
                <p>Basic manicure with polish</p>
              </div>
              
              <div className="service-card">
                <h3>👣 Pedicure</h3>
                <p>$25 • 45 minutes</p>
                <p>Relaxing pedicure treatment</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;