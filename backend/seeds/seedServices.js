const mongoose = require('mongoose');
const Service = require('../models/Service');
require('dotenv').config();

const services = [
  {
    name: "Women's Haircut",
    description: "Professional haircut and styling with wash and blow dry",
    duration: 60,
    price: 35,
    category: "hair",
    available: true
  },
  {
    name: "Men's Haircut",
    description: "Classic men's haircut with clipper work and styling",
    duration: 45,
    price: 25,
    category: "hair",
    available: true
  },
  {
    name: "Hair Coloring",
    description: "Full hair coloring service with conditioning treatment",
    duration: 120,
    price: 80,
    category: "hair",
    available: true
  },
  {
    name: "Classic Manicure",
    description: "Basic manicure with cuticle care and polish",
    duration: 45,
    price: 20,
    category: "nails",
    available: true
  },
  {
    name: "Spa Pedicure",
    description: "Luxurious pedicure with foot massage and exfoliation",
    duration: 60,
    price: 35,
    category: "nails",
    available: true
  },
  {
    name: "Deep Cleansing Facial",
    description: "Professional facial treatment for deep pore cleansing",
    duration: 75,
    price: 65,
    category: "skin",
    available: true
  }
];

const seedServices = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/flexibook');
    console.log('Connected to MongoDB');

    // Clear existing services
    await Service.deleteMany({});
    console.log('Cleared existing services');

    // Insert new services
    await Service.insertMany(services);
    console.log('Services seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding services:', error);
    process.exit(1);
  }
};

seedServices();