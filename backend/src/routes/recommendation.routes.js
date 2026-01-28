const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendation.controller');

// POST /api/recommendation - Get best card recommendation
router.post('/', recommendationController.getRecommendation);

// POST /api/recommendation/compare - Compare all user cards for an expense
router.post('/compare', recommendationController.compareCards);

// GET /api/recommendation/category/:categoryId - Get all cards for a category
router.get('/category/:categoryId', recommendationController.getCardsForCategory);

// GET /api/recommendation/user/:userId/best-cards - Get best card per category for user
router.get('/user/:userId/best-cards', recommendationController.getBestCardsByCategory);

module.exports = router;
