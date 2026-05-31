require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const cowRoutes = require('./routes/cowRoutes');
const diseaseRoutes = require('./routes/diseaseRoutes');
const vetRoutes = require('./routes/vetRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const vaccinationRoutes = require('./routes/vaccinationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SmartCattle Pro API is running', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/cows', cowRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/vets', vetRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/vaccination', vaccinationRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use(errorHandler);

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartcattle';
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Retrying in-memory mode is not available. Please start MongoDB.');
    process.exit(1);
  }
};

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🐄 SmartCattle Pro API running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
  });
});

module.exports = app;
