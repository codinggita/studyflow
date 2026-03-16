import Task from '../models/Task.js';
import Subject from '../models/Subject.js';

// @desc    Get user study analytics
// @route   GET /api/analytics
// @access  Private
export const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get total counts
    const totalSubjects = await Subject.countDocuments({ user: userId });
    
    // Get task statistics
    const tasks = await Task.find({ user: userId });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    
    // Calculate completion percentage
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;

    // Get tasks by priority (Pending only)
    const pendingByPriority = {
      High: tasks.filter(t => !t.completed && t.priority === 'High').length,
      Medium: tasks.filter(t => !t.completed && t.priority === 'Medium').length,
      Low: tasks.filter(t => !t.completed && t.priority === 'Low').length,
    };

    // Get recently completed tasks
    const recentCompletedQuery = await Task.find({ user: userId, completed: true })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('subject', 'title color')
      .select('title subject priority updatedAt');

    // Get upcoming deadlines
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const upcomingDeadlines = await Task.find({ 
      user: userId, 
      completed: false,
      dueDate: { $gte: today }
    })
      .sort({ dueDate: 1 })
      .limit(5)
      .populate('subject', 'title color')
      .select('title subject priority dueDate');

    res.json({
      success: true,
      data: {
        overview: {
          totalSubjects,
          totalTasks,
          completedTasks,
          pendingTasks,
          completionRate
        },
        pendingByPriority,
        recentCompleted: recentCompletedQuery,
        upcomingDeadlines
      }
    });

  } catch (error) {
    next(error);
  }
};
