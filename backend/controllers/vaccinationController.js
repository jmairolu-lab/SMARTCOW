const Vaccination = require('../models/Vaccination');
const Cow = require('../models/Cow');

const VACCINE_INTERVALS = {
  FMD: 180,
  Brucellosis: 365,
  Anthrax: 365,
  Blackleg: 365,
  HS: 180,
  BQ: 180,
};

exports.getVaccinations = async (req, res, next) => {
  try {
    const vaccinations = await Vaccination.find({ user: req.user._id })
      .populate('cow', 'name breed healthStatus')
      .sort({ nextDueDate: 1 });

    const now = new Date();
    const alerts = vaccinations
      .filter((v) => new Date(v.nextDueDate) <= new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000))
      .map((v) => ({
        id: v._id,
        cowName: v.cowName,
        vaccineName: v.vaccineName,
        dueDate: v.nextDueDate,
        isOverdue: new Date(v.nextDueDate) < now,
        message: `⚠ Cow ${v.cowName} needs ${v.vaccineName} vaccine`,
      }));

    res.status(200).json({
      success: true,
      count: vaccinations.length,
      vaccinations,
      alerts,
    });
  } catch (error) {
    next(error);
  }
};

exports.createVaccination = async (req, res, next) => {
  try {
    const { cowId, vaccineName, lastVaccinated, notes } = req.body;

    if (!cowId || !vaccineName) {
      return res.status(400).json({ success: false, message: 'Cow and vaccine name are required' });
    }

    const cow = await Cow.findOne({ _id: cowId, user: req.user._id });
    if (!cow) {
      return res.status(404).json({ success: false, message: 'Cow not found' });
    }

    const intervalDays = VACCINE_INTERVALS[vaccineName] || 180;
    const lastDate = lastVaccinated ? new Date(lastVaccinated) : new Date();
    const nextDueDate = new Date(lastDate.getTime() + intervalDays * 24 * 60 * 60 * 1000);

    const vaccination = await Vaccination.create({
      user: req.user._id,
      cow: cow._id,
      cowName: cow.name,
      vaccineName,
      lastVaccinated: lastDate,
      nextDueDate,
      notes: notes || '',
    });

    if (cow.vaccinated === 'No') {
      cow.vaccinated = 'Yes';
      await cow.save();
    }

    res.status(201).json({
      success: true,
      message: 'Vaccination record added',
      vaccination,
    });
  } catch (error) {
    next(error);
  }
};

exports.seedDefaultVaccinations = async (userId, cow) => {
  const vaccines = ['FMD', 'Brucellosis'];
  const now = new Date();

  for (const vaccineName of vaccines) {
    const intervalDays = VACCINE_INTERVALS[vaccineName];
    const nextDueDate = new Date(now.getTime() + (intervalDays - 30) * 24 * 60 * 60 * 1000);

    await Vaccination.create({
      user: userId,
      cow: cow._id,
      cowName: cow.name,
      vaccineName,
      lastVaccinated: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      nextDueDate,
    });
  }
};
