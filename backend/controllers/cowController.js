const Cow = require('../models/Cow');
const { seedDefaultVaccinations } = require('../controllers/vaccinationController');

exports.getCows = async (req, res, next) => {
  try {
    const { breed, healthStatus } = req.query;
    const filter = { user: req.user._id };

    if (breed) filter.breed = breed;
    if (healthStatus) filter.healthStatus = healthStatus;

    const cows = await Cow.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: cows.length, cows });
  } catch (error) {
    next(error);
  }
};

exports.createCow = async (req, res, next) => {
  try {
    const { name, age, breed, vaccinated, healthStatus } = req.body;

    if (!name || age === undefined || !breed) {
      return res.status(400).json({ success: false, message: 'Name, age, and breed are required' });
    }

    const cow = await Cow.create({
      user: req.user._id,
      name,
      age: Number(age),
      breed,
      vaccinated: vaccinated || 'No',
      healthStatus: healthStatus || 'Healthy',
    });

    try {
      await seedDefaultVaccinations(req.user._id, cow);
    } catch (seedErr) {
      console.warn('Vaccination seed warning:', seedErr.message);
    }

    res.status(201).json({ success: true, message: 'Cow added successfully', cow });
  } catch (error) {
    next(error);
  }
};

exports.updateCow = async (req, res, next) => {
  try {
    let cow = await Cow.findOne({ _id: req.params.id, user: req.user._id });

    if (!cow) {
      return res.status(404).json({ success: false, message: 'Cow not found' });
    }

    const { name, age, breed, vaccinated, healthStatus } = req.body;

    if (name) cow.name = name;
    if (age !== undefined) cow.age = Number(age);
    if (breed) cow.breed = breed;
    if (vaccinated) cow.vaccinated = vaccinated;
    if (healthStatus) cow.healthStatus = healthStatus;

    await cow.save();

    res.status(200).json({ success: true, message: 'Cow updated successfully', cow });
  } catch (error) {
    next(error);
  }
};

exports.deleteCow = async (req, res, next) => {
  try {
    const cow = await Cow.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!cow) {
      return res.status(404).json({ success: false, message: 'Cow not found' });
    }

    res.status(200).json({ success: true, message: 'Cow deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getCowCount = async (req, res, next) => {
  try {
    const count = await Cow.countDocuments({ user: req.user._id });
    res.status(200).json({ success: true, count });
  } catch (error) {
    next(error);
  }
};
