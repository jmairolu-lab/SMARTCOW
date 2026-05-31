const mongoose = require('mongoose');

const BREEDS = ['Gir', 'HF', 'Jersey', 'Sahiwal', 'Local Indian Breed'];
const HEALTH_STATUSES = ['Healthy', 'Unhealthy'];

const cowSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Cow name is required'],
      trim: true,
      maxlength: 100,
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age cannot be negative'],
      max: [30, 'Age seems too high'],
    },
    breed: {
      type: String,
      required: [true, 'Breed is required'],
      enum: BREEDS,
    },
    vaccinated: {
      type: String,
      enum: ['Yes', 'No'],
      default: 'No',
    },
    healthStatus: {
      type: String,
      enum: HEALTH_STATUSES,
      default: 'Healthy',
    },
  },
  { timestamps: true }
);

cowSchema.statics.BREEDS = BREEDS;
cowSchema.statics.HEALTH_STATUSES = HEALTH_STATUSES;

module.exports = mongoose.model('Cow', cowSchema);
