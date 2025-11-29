const express = require('express');
const { body } = require('express-validator');
const { 
  shortenUrl, 
  getUserUrls, 
  getUrlById, 
  deleteUrl, 
  getUrlAnalytics 
} = require('../controllers/urlController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation rules
const shortenUrlValidation = [
  body('originalUrl')
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Please enter a valid URL starting with http:// or https://'),
  body('customAlias')
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage('Custom alias must be 3-20 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Custom alias can only contain letters, numbers, hyphens, and underscores'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expiration date must be in the future');
      }
      return true;
    })
];

// Routes
router.post('/shorten', auth, shortenUrlValidation, shortenUrl);
router.get('/', auth, getUserUrls);
router.get('/:id', auth, getUrlById);
router.delete('/:id', auth, deleteUrl);
router.get('/:id/analytics', auth, getUrlAnalytics);

module.exports = router;