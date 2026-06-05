const { prisma } = require('../lib/prisma');
const { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, format } = require('date-fns');

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Utilities', 'Education', 'Other'];

const getExpenses = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      search = '',
      category = '',
      startDate = '',
      endDate = '',
      page = '1',
      limit = '10',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where = { userId };

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    if (category && CATEGORIES.includes(category)) {
      where.category = category;
    }

    if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) dateFilter.gte = startOfDay(new Date(startDate));
      if (endDate) dateFilter.lte = endOfDay(new Date(endDate));
      where.date = dateFilter;
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.expense.count({ where }),
    ]);

    res.json({
      expenses,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createExpense = async (req, res) => {
  try {
    const userId = req.userId;
    const { title, amount, category, date, description } = req.body;

    const expense = await prisma.expense.create({
      data: {
        title,
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        description: description || null,
        userId,
      },
    });

    res.status(201).json({ expense });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateExpense = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { title, amount, category, date, description } = req.body;

    const existing = await prisma.expense.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        title,
        amount: parseFloat(amount),
        category,
        date: new Date(date),
        description: description || null,
      },
    });

    res.json({ expense });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const existing = await prisma.expense.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }

    await prisma.expense.delete({ where: { id } });
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getDashboard = async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [allExpenses, monthlyExpenses] = await Promise.all([
      prisma.expense.findMany({ where: { userId } }),
      prisma.expense.findMany({
        where: { userId, date: { gte: monthStart, lte: monthEnd } },
        orderBy: { date: 'desc' },
      }),
    ]);

    const totalAllTime = allExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalThisMonth = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
    const transactionCount = monthlyExpenses.length;
    const hardcodedIncome = 55000;
    const savings = hardcodedIncome - totalThisMonth;

    const recentTransactions = allExpenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const day = subDays(now, 6 - i);
      return {
        date: format(day, 'MMM d'),
        fullDate: format(day, 'yyyy-MM-dd'),
        amount: 0,
        isToday: i === 6,
      };
    });

    for (const expense of allExpenses) {
      const expDate = format(new Date(expense.date), 'yyyy-MM-dd');
      const dayEntry = last7Days.find((d) => d.fullDate === expDate);
      if (dayEntry) dayEntry.amount += expense.amount;
    }

    const monthlyTrend = last7Days.map(({ date, amount, isToday }) => ({ date, amount, isToday }));

    const categoryMap = {};
    for (const expense of monthlyExpenses) {
      categoryMap[expense.category] = (categoryMap[expense.category] || 0) + expense.amount;
    }

    const categoryBreakdown = Object.entries(categoryMap)
      .map(([category, total]) => ({
        category,
        total,
        percentage: totalThisMonth > 0 ? Math.round((total / totalThisMonth) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);

    res.json({
      totalThisMonth,
      totalAllTime,
      transactionCount,
      savings,
      recentTransactions,
      monthlyTrend,
      categoryBreakdown,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense, getDashboard };
