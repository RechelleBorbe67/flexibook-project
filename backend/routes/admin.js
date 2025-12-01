const express = require('express');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const router = express.Router();

// All routes require admin authentication
router.use(auth, adminAuth);

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalServices = await Service.countDocuments();
    
    // Get today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayBookings = await Booking.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: 'confirmed'
    });

    // Get revenue data (last 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const recentBookings = await Booking.find({
      date: { $gte: last7Days },
      status: 'confirmed'
    }).populate('service');

    const revenue = recentBookings.reduce((total, booking) => {
      return total + (booking.service?.price || 0);
    }, 0);

    // Get booking status distribution
    const bookingStatus = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get popular services
    const popularServices = await Booking.aggregate([
      {
        $group: {
          _id: '$service',
          bookingCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: '_id',
          as: 'serviceInfo'
        }
      },
      {
        $unwind: '$serviceInfo'
      },
      {
        $project: {
          serviceName: '$serviceInfo.name',
          bookingCount: 1,
          price: '$serviceInfo.price'
        }
      },
      {
        $sort: { bookingCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalBookings,
          totalServices,
          todayBookings,
          revenue
        },
        bookingStatus,
        popularServices
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
});

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(totalUsers / limit),
          total: totalUsers
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's bookings
    const userBookings = await Booking.find({ customer: req.params.id })
      .populate('service')
      .sort({ date: -1 });

    res.json({
      success: true,
      data: {
        user,
        bookings: userBookings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// @desc    Generate reports
// @route   GET /api/admin/reports
// @access  Private/Admin
router.get('/reports', async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;

    let start = new Date(startDate);
    let end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    let reportData = {};

    switch (type) {
      case 'bookings':
        const bookingsReport = await Booking.find({
          date: { $gte: start, $lte: end }
        })
        .populate('service')
        .populate('customer', 'name email')
        .sort({ date: 1 });

        const bookingStats = await Booking.aggregate([
          {
            $match: {
              date: { $gte: start, $lte: end }
            }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              revenue: { $sum: '$service.price' }
            }
          }
        ]);

        reportData = {
          bookings: bookingsReport,
          stats: bookingStats,
          total: bookingsReport.length
        };
        break;

      case 'revenue':
        const revenueData = await Booking.aggregate([
          {
            $match: {
              date: { $gte: start, $lte: end },
              status: 'confirmed'
            }
          },
          {
            $lookup: {
              from: 'services',
              localField: 'service',
              foreignField: '_id',
              as: 'serviceInfo'
            }
          },
          {
            $unwind: '$serviceInfo'
          },
          {
            $group: {
              _id: {
                year: { $year: '$date' },
                month: { $month: '$date' },
                day: { $dayOfMonth: '$date' }
              },
              dailyRevenue: { $sum: '$serviceInfo.price' },
              bookingCount: { $sum: 1 }
            }
          },
          {
            $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
          }
        ]);

        reportData = {
          revenueData,
          totalRevenue: revenueData.reduce((sum, day) => sum + day.dailyRevenue, 0),
          totalBookings: revenueData.reduce((sum, day) => sum + day.bookingCount, 0)
        };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid report type. Use "bookings" or "revenue"'
        });
    }

    res.json({
      success: true,
      data: {
        type,
        period: { startDate, endDate },
        generatedAt: new Date(),
        ...reportData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error.message
    });
  }
});

module.exports = router;