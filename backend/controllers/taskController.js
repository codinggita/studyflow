import Task from '../models/Task.js';
import Subject from '../models/Subject.js';
import mongoose from 'mongoose';

// @desc    Get all tasks for a user
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res, next) => {
  try {
    const { subject, completed, priority, search, sort, page = 1, limit = 10 } = req.query;

    let query = { user: req.user._id };

    // Filtering
    if (subject) query.subject = subject;
    if (completed !== undefined) query.completed = completed === 'true';
    if (priority) query.priority = priority;

    // Search by title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sorting
    let sortQuery = { dueDate: 1 }; // Default sort by due date ascending
    if (sort) {
      switch (sort) {
        case 'dueDateDesc': sortQuery = { dueDate: -1 }; break;
        case 'priority': sortQuery = { priority: -1 }; break;
        case 'newest': sortQuery = { createdAt: -1 }; break;
      }
    }

    const tasks = await Task.find(query)
      .populate('subject', 'title color')
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      count: tasks.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('subject', 'title color');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this task' });
    }

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    // Verify subject belongs to user
    const subject = await Subject.findById(req.body.subject);
    if (!subject || subject.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, message: 'Subject not found or unauthorized' });
    }

    const task = await Task.create(req.body);

    const populatedTask = await Task.findById(task._id).populate('subject', 'title color');

    res.status(201).json({ success: true, data: populatedTask });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this task' });
    }

    // If updating subject, verify it
    if (req.body.subject) {
      const subject = await Subject.findById(req.body.subject);
      if (!subject || subject.user.toString() !== req.user.id) {
        return res.status(404).json({ success: false, message: 'Subject not found or unauthorized' });
      }
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('subject', 'title color');

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
