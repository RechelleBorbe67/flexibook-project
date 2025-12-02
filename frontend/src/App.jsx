import React, { useState, useEffect } from 'react';
import './App.css';
import ServiceList from './components/ServiceList';
import BookingForm from './components/BookingForm';
import CalendarView from './components/CalendarView';
import Login from './components/Login';
import Register from './components/Register';
import MyBookings from './components/MyBookings';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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

  const confirmLogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('login'); // Change this from 'home' to 'login'
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const switchToRegister = () => {
    setCurrentView('register');
  };

  const switchToLogin = () => {
    setCurrentView('login');
  };

  // Function to handle booking from ServiceList
  const handleServiceBookNow = () => {
    if (user && user.role !== 'admin') {
      setCurrentView('booking'); // Go to booking if logged in as customer
    } else {
      setCurrentView('login'); // Go to login if not logged in
    }
  };

  return (
    <div className="App">
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="logout-confirm-modal">
            <div className="modal-header">
              <h3>Confirm Logout</h3>
              <button className="close-modal" onClick={cancelLogout}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to logout?</p>
              <div className="modal-actions">
                <button 
                  className="confirm-btn" 
                  onClick={handleLogout}
                >
                  Yes, Logout
                </button>
                <button 
                  className="cancel-btn" 
                  onClick={cancelLogout}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="app-header">
        <div className="container">
          <h1>💇‍♀️ FlexiBook Salon</h1>
          <nav>
            <button onClick={() => setCurrentView('home')}>Home</button>
            
            {/* Show Services button only for non-admin users */}
            {user?.role !== 'admin' && (
              <button onClick={() => setCurrentView('services')}>Services</button>
            )}
            
            {/* Show Book Now button only for non-admin users */}
            {user?.role !== 'admin' && (
              <button onClick={() => setCurrentView('booking')}>Book Now</button>
            )}
            
            {/* Show Calendar button only for non-admin users */}
            {user?.role !== 'admin' && (
              <button onClick={() => setCurrentView('calendar')}>Calendar</button>
            )}
            
            {/* Show My Bookings button only for non-admin users */}
            {user?.role !== 'admin' && (
              <button onClick={() => setCurrentView('bookings')}>My Bookings</button>
            )}
            
            {user ? (
              <div className="user-menu">
                <span className="welcome">Welcome, {user.name}</span>
                {user.role === 'admin' && (
                  <button onClick={() => setCurrentView('admin')}>Admin</button>
                )}
                <button onClick={confirmLogout}>Logout</button>
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
                user.role !== 'admin' ? (
                  <button 
                    className="cta-button"
                    onClick={() => setCurrentView('booking')}
                  >
                    Book Now
                  </button>
                ) : (
                  <button 
                    className="cta-button"
                    onClick={() => setCurrentView('admin')}
                  >
                    Go to Admin Dashboard
                  </button>
                )
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
              user.role !== 'admin' ? (
                <BookingForm />
              ) : (
                <div className="admin-restriction">
                  <h2>Administrator Access</h2>
                  <div className="message error">
                    Administrators cannot book appointments. Please use a customer account.
                  </div>
                  <div className="admin-options">
                    <p>As an administrator, you can:</p>
                    <ul>
                      <li>Manage services</li>
                      <li>View and manage bookings</li>
                      <li>Generate reports</li>
                      <li>Manage users</li>
                    </ul>
                    <button 
                      onClick={() => setCurrentView('admin')}
                      className="cta-button"
                    >
                      Go to Admin Dashboard
                    </button>
                  </div>
                </div>
              )
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
            {user?.role !== 'admin' ? (
              <CalendarView onNavigate={setCurrentView} />
            ) : (
              <div className="admin-restriction">
                <h2>Administrator Access</h2>
                <div className="message error">
                  Administrators cannot access customer calendar. Please use a customer account.
                </div>
                <div className="admin-options">
                  <p>As an administrator, you can:</p>
                    <ul>
                      <li>Manage services in the Admin Dashboard</li>
                      <li>View and manage all bookings</li>
                      <li>Generate reports</li>
                      <li>Manage users</li>
                    </ul>
                  <button 
                    onClick={() => setCurrentView('admin')}
                    className="cta-button"
                  >
                    Go to Admin Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Services View */}
        {currentView === 'services' && (
          <div className="services-view">
            {user?.role !== 'admin' ? (
              <ServiceList onNavigate={handleServiceBookNow} />
            ) : (
              <div className="admin-restriction">
                <h2>Administrator Access</h2>
                <div className="message error">
                  Administrators manage services in the Admin Dashboard.
                </div>
                <div className="admin-options">
                  <p>As an administrator, you can:</p>
                  <ul>
                    <li>Add, edit, and delete services in Admin Dashboard</li>
                    <li>Set service prices and durations</li>
                    <li>Manage service categories</li>
                    <li>Track service popularity</li>
                  </ul>
                  <button 
                    onClick={() => setCurrentView('admin')}
                    className="cta-button"
                  >
                    Go to Admin Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* My Bookings View */}
        {currentView === 'bookings' && (
          <div className="bookings-view">
            {user ? (
              user.role !== 'admin' ? (
                <MyBookings />
              ) : (
                <div className="admin-restriction">
                  <h2>Administrator Access</h2>
                  <div className="message error">
                    Administrators view all bookings in the Admin Dashboard.
                  </div>
                  <div className="admin-options">
                    <p>As an administrator, you can:</p>
                    <ul>
                      <li>View all customer bookings</li>
                      <li>Manage booking statuses</li>
                      <li>Generate booking reports</li>
                      <li>Track booking trends</li>
                    </ul>
                    <button 
                      onClick={() => setCurrentView('admin')}
                      className="cta-button"
                    >
                      Go to Admin Dashboard
                    </button>
                  </div>
                </div>
              )
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

        {/* Admin View */}
        {currentView === 'admin' && (
          <div className="admin-view">
            {user?.role === 'admin' ? (
              <AdminDashboard />
            ) : (
              <div className="access-denied">
                <h2>Access Denied</h2>
                <p>You must be an administrator to access this page.</p>
                <button 
                  onClick={() => setCurrentView('home')}
                  className="cta-button"
                >
                  Go Home
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