const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-email-password'
  }
});

// Email templates
const emailTemplates = {
  bookingConfirmation: (booking, user, service) => ({
    subject: `Booking Confirmation - ${service.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Booking Confirmed! 🎉</h2>
        <p>Hello ${user.name},</p>
        <p>Your booking has been confirmed. Here are your appointment details:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Appointment Details</h3>
          <p><strong>Service:</strong> ${service.name}</p>
          <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
          <p><strong>Duration:</strong> ${service.duration} minutes</p>
          <p><strong>Price:</strong> $${service.price}</p>
          ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
        </div>
        
        <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>📍 Location:</strong> 123 Salon Street, City, State 12345</p>
          <p><strong>📞 Contact:</strong> (123) 456-7890</p>
          <p><strong>⏰ Please arrive 10 minutes early</strong></p>
        </div>
        
        <p>You can manage your booking by logging into your account.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/bookings" 
             style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View My Bookings
          </a>
        </div>
        
        <p>Thank you for choosing FlexiBook Salon!</p>
        <p><em>If you need to cancel or reschedule, please do so at least 24 hours in advance.</em></p>
      </div>
    `
  }),

  bookingCancellation: (booking, user, service) => ({
    subject: `Booking Cancelled - ${service.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Booking Cancelled</h2>
        <p>Hello ${user.name},</p>
        <p>Your booking has been cancelled. Here are the details:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Cancelled Appointment</h3>
          <p><strong>Service:</strong> ${service.name}</p>
          <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${booking.startTime}</p>
          <p><strong>Status:</strong> Cancelled</p>
        </div>
        
        <p>We hope to serve you again in the future!</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
             style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Book New Appointment
          </a>
        </div>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const email = emailTemplates[template](...data);
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'FlexiBook Salon <noreply@flexibook.com>',
      to,
      subject: email.subject,
      html: email.html
    };

    // In development, log email instead of sending
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email would be sent to:', to);
      console.log('Subject:', email.subject);
      console.log('Email content logged (not sent in development)');
      return { success: true, development: true };
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send booking confirmation
const sendBookingConfirmation = async (booking, user, service) => {
  return sendEmail(user.email, 'bookingConfirmation', [booking, user, service]);
};

// Send booking cancellation
const sendBookingCancellation = async (booking, user, service) => {
  return sendEmail(user.email, 'bookingCancellation', [booking, user, service]);
};

module.exports = {
  sendBookingConfirmation,
  sendBookingCancellation
};