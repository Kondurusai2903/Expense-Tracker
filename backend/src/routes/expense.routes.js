const { Router } = require('express');
const { body } = require('express-validator');
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getDashboard,
} = require('../controllers/expense.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');

const router = Router();

const VALID_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Health', 'Entertainment', 'Utilities', 'Education', 'Other'];

const expenseValidators = [
  body('title').trim().isLength({ min: 2, max: 100 }).withMessage('Title must be 2-100 characters'),
  body('amount')
    .isFloat({ min: 0.01, max: 1000000 })
    .withMessage('Amount must be a positive number up to 1,000,000'),
  body('category')
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
];

router.use(authMiddleware);

router.get('/dashboard', getDashboard);
router.get('/', getExpenses);
router.post('/', expenseValidators, validate, createExpense);
router.put('/:id', expenseValidators, validate, updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
