import Subject from '../models/Subject.js';
import Task from '../models/Task.js';

// @desc    Get all subjects for a user
// @route   GET /api/subjects
// @access  Private
export const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Private
export const getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Make sure user owns subject
    if (subject.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this subject' });
    }

    res.json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private
export const createSubject = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    const subject = await Subject.create(req.body);

    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private
export const updateSubject = async (req, res, next) => {
  try {
    let subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Make sure user owns subject
    if (subject.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this subject' });
    }

    subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private
export const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Make sure user owns subject
    if (subject.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this subject' });
    }

    await subject.deleteOne();
    
    // Also delete all tasks associated with this subject
    await Task.deleteMany({ subject: req.params.id });

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
