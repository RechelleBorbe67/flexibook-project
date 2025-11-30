const express = require('express');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const auth = require('../middleware/auth');
const router = express.Router();

// @desc    Get available time slots for a service and date
// @route   GET /api/bookings/available-slots
// @access  Public
router.get('/available-slots', async (req, res) => {
  try {
    const { serviceId, date } = req.query;
    
    if (!serviceId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Service ID and date are required'
      });
    }

    // Get service details
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Get existing bookings for that service and date
    const targetDate = new Date(date);
    const existingBookings = await Booking.find({
      service: serviceId,
      date: targetDate,
      status: { $in: ['confirmed', 'pending'] }
    });

    // Generate available slots (9 AM to 6 PM, 30-minute intervals)
    const availableSlots = [];
    const startHour = 9; // 9 AM
    const endHour = 18;  // 6 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Check if this time slot is available
        const isBooked = existingBookings.some(booking => booking.startTime === timeString);
        
        if (!isBooked) {
          availableSlots.push(timeString);
        }
      }
    }

    res.json({
      success: true,
      data: {
        service: service.name,
        date: targetDate.toISOString().split('T')[0],
        duration: service.duration,
        availableSlots,
        bookedSlots: existingBookings.map(b => b.startTime)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching available slots',
      error: error.message
    });
  }
});

// @desc    Create booking with validation
// @route   POST /api/bookings
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { service, date, startTime, endTime, notes } = req.body;

    // Validate required fields
    if (!service || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Service, date, startTime, and endTime are required'
      });
    }

    // Check if service exists
    const serviceExists = await Service.findById(service);
    if (!serviceExists) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Check for double booking
    const existingBooking = await Booking.findOne({
      service,
      date: new Date(date),
      startTime,
      status: { $in: ['confirmed', 'pending'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Create booking
    const booking = await Booking.create({
      service,
      date: new Date(date),
      startTime,
      endTime,
      notes,
      customer: req.userId,
      status: 'confirmed'
    });

    // Populate service and customer details
    await booking.populate('service');
    await booking.populate('customer', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.userId })
      .populate('service')
      .sort({ date: -1, startTime: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('service')
      .populate('customer', 'name email phone')
      .sort({ date: -1, startTime: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service')
      .populate('customer', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking or is admin
    if (booking.customer.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// @desc    Get bookings by date
// @route   GET /api/bookings/date/:date
// @access  Private
router.get('/date/:date', auth, async (req, res) => {
  try {
    const targetDate = new Date(req.params.date);
    
    const bookings = await Booking.find({
      date: targetDate,
      status: { $in: ['confirmed', 'pending'] }
    })
    .populate('service', 'name duration price')
    .populate('customer', 'name email phone')
    .sort({ startTime: 1 });

    res.json({
      success: true,
      count: bookings.length,
      date: targetDate.toISOString().split('T')[0],
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings by date',
      error: error.message
    });
  }
});

module.exports = router;