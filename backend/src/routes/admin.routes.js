const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// ==================== BANK ROUTES ====================
router.post('/banks', adminController.createBank);
router.get('/banks', adminController.getAllBanks);
router.put('/banks/:id', adminController.updateBank);

// ==================== CREDIT CARD ROUTES ====================
router.post('/credit-cards', adminController.createCreditCard);
router.get('/credit-cards', adminController.getAllCreditCards);
router.get('/credit-cards/:id', adminController.getCreditCardById);
router.put('/credit-cards/:id', adminController.updateCreditCard);
router.patch('/credit-cards/:id/toggle', adminController.toggleCardStatus);

// ==================== CATEGORY ROUTES ====================
router.post('/categories', adminController.createCategory);
router.get('/categories', adminController.getAllCategories);

// ==================== CASHBACK RULES ROUTES ====================
router.post('/cashback-rules', adminController.createCashbackRule);
router.get('/cashback-rules', adminController.getAllCashbackRules);
router.put('/cashback-rules/:id', adminController.updateCashbackRule);
router.delete('/cashback-rules/:id', adminController.deleteCashbackRule);

// ==================== EXCLUSIONS ROUTES ====================
router.post('/exclusions', adminController.addExclusion);
router.delete('/exclusions/:id', adminController.deleteExclusion);

// ==================== FEE RULES ROUTES ====================
router.post('/fee-rules', adminController.createFeeRule);
router.get('/fee-rules', adminController.getFeeRules);

module.exports = router;
