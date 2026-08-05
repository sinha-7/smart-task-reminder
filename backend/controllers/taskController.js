const Task = require('../models/Task');

/**
 * @desc    Get all tasks for the authenticated user with filters/search/sort/pagination
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = async (req, res, next) => {
  try {
    const {
      search,
      category,
      priority,
      completed,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter query
    const filter = { userId: req.user.id };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }

    // Build sort
    const allowedSortFields = ['createdAt', 'dueDate', 'priority', 'title'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;

    // Priority needs custom sort order (high > medium > low)
    let sort;
    if (sortField === 'priority') {
      // Will sort by priority value mapped to number in aggregation
      sort = { priorityOrder: sortOrder, createdAt: -1 };
    } else {
      sort = { [sortField]: sortOrder };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    let tasks;
    if (sortField === 'priority') {
      // Use aggregation for custom priority sort
      tasks = await Task.aggregate([
        { $match: filter },
        {
          $addFields: {
            priorityOrder: {
              $switch: {
                branches: [
                  { case: { $eq: ['$priority', 'high'] }, then: 3 },
                  { case: { $eq: ['$priority', 'medium'] }, then: 2 },
                  { case: { $eq: ['$priority', 'low'] }, then: 1 },
                ],
                default: 0,
              },
            },
          },
        },
        { $sort: sort },
        { $skip: skip },
        { $limit: limitNum },
        { $project: { priorityOrder: 0 } },
      ]);
    } else {
      tasks = await Task.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean();
    }

    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, category, reminderAt } = req.body;

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      category,
      reminderAt,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    res.json({
      success: true,
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'title',
      'description',
      'dueDate',
      'priority',
      'category',
      'completed',
      'reminderAt',
    ];
    const updates = {};

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // If reminderAt is updated, reset reminderSent
    if (updates.reminderAt) {
      updates.reminderSent = false;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    res.json({
      success: true,
      message: 'Task updated successfully.',
      data: { task },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found.',
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get task stats for the dashboard
 * @route   GET /api/tasks/stats
 * @access  Private
 */
const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const now = new Date();

    const [pending, completed, overdue, upcomingReminders, byCategory, byPriority] =
      await Promise.all([
        Task.countDocuments({ userId, completed: false }),
        Task.countDocuments({ userId, completed: true }),
        Task.countDocuments({
          userId,
          completed: false,
          dueDate: { $lt: now },
        }),
        Task.countDocuments({
          userId,
          completed: false,
          reminderAt: { $gte: now },
          reminderSent: false,
        }),
        Task.aggregate([
          { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Task.aggregate([
          {
            $match: {
              userId: require('mongoose').Types.ObjectId.createFromHexString(userId),
              completed: false,
            },
          },
          { $group: { _id: '$priority', count: { $sum: 1 } } },
        ]),
      ]);

    res.json({
      success: true,
      data: {
        pending,
        completed,
        overdue,
        upcomingReminders,
        total: pending + completed,
        byCategory,
        byPriority,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  getStats,
};
