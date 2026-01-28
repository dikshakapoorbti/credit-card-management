const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// ==================== USER MANAGEMENT ====================
router.post('/', userController.createUser);
router.get('/email/:email', userController.getUserByEmail);
router.get('/firebase/:firebaseUid', userController.getUserByFirebaseUid);

// ==================== USER CARDS ====================
router.post('/cards', userController.addUserCard);
router.get('/:userId/cards', userController.getUserCards);
router.delete('/:userId/cards/:cardId', userController.removeUserCard);
router.patch('/:userId/cards/:cardId/verify', userController.verifyUserCard);

// ==================== USER EXPENSES ====================
router.post('/expenses', userController.addExpense);
router.get('/:userId/expenses', userController.getUserExpenses);
router.get('/:userId/expenses/summary', userController.getExpenseSummary);

module.exports = router;
