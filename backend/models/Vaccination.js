const mongoose = require('mongoose');

const VACCINE_TYPES = ['FMD', 'Brucellosis', 'Anthrax', 'Blackleg', 'HS', 'BQ'];

const vaccinationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    cow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cow',
      required: true,
    },
    cowName: {
      type: String,
      required: true,
    },
    vaccineName: {
      type: String,
      required: [true, 'Vaccine name is required'],
      enum: VACCINE_TYPES,
    },
    lastVaccinated: {
      type: Date,
      default: Date.now,
    },
    nextDueDate: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

vaccinationSchema.statics.VACCINE_TYPES = VACCINE_TYPES;

module.exports = mongoose.model('Vaccination', vaccinationSchema);
