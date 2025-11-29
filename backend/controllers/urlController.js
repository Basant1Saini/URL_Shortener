const { validationResult } = require('express-validator');
const Url = require('../models/Url');
const { generateShortCode, generateShortUrl, isValidCustomAlias } = require('../utils/generateShortUrl');

// @desc    Create short URL
// @route   POST /api/urls/shorten
// @access  Private
const shortenUrl = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { originalUrl, customAlias, expiresAt } = req.body;
    const userId = req.user.id;
    const baseUrl = process.env.BASE_URL;

    let urlCode = customAlias;

    // Validate custom alias if provided
    if (customAlias) {
      if (!isValidCustomAlias(customAlias)) {
        return res.status(400).json({ 
          message: 'Custom alias must be 3-20 characters and contain only letters, numbers, hyphens, and underscores' 
        });
      }

      // Check if custom alias already exists
      const existingUrl = await Url.findOne({ 
        $or: [{ urlCode: customAlias }, { customAlias }] 
      });
      
      if (existingUrl) {
        return res.status(400).json({ message: 'Custom alias already exists' });
      }
    } else {
      // Generate unique short code
      let isUnique = false;
      while (!isUnique) {
        urlCode = generateShortCode();
        const existingUrl = await Url.findOne({ urlCode });
        if (!existingUrl) isUnique = true;
      }
    }

    const shortUrl = generateShortUrl(baseUrl, urlCode);

    // Create URL document
    const urlDoc = new Url({
      originalUrl,
      shortUrl,
      urlCode,
      userId,
      customAlias: customAlias || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    await urlDoc.save();

    res.status(201).json({
      message: 'URL shortened successfully',
      url: urlDoc
    });
  } catch (error) {
    console.error('Shorten URL error:', error);
    res.status(500).json({ message: 'Server error creating short URL' });
  }
};

// @desc    Get user's URLs
// @route   GET /api/urls
// @access  Private
const getUserUrls = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const userId = req.user.id;

    const query = { userId };
    if (search) {
      query.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { urlCode: { $regex: search, $options: 'i' } },
        { customAlias: { $regex: search, $options: 'i' } }
      ];
    }

    const urls = await Url.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Url.countDocuments(query);

    res.json({
      urls,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get URLs error:', error);
    res.status(500).json({ message: 'Server error fetching URLs' });
  }
};

// @desc    Get specific URL details
// @route   GET /api/urls/:id
// @access  Private
const getUrlById = async (req, res) => {
  try {
    const url = await Url.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    res.json({ url });
  } catch (error) {
    console.error('Get URL error:', error);
    res.status(500).json({ message: 'Server error fetching URL' });
  }
};

// @desc    Delete URL
// @route   DELETE /api/urls/:id
// @access  Private
const deleteUrl = async (req, res) => {
  try {
    const url = await Url.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    res.json({ message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Delete URL error:', error);
    res.status(500).json({ message: 'Server error deleting URL' });
  }
};

// @desc    Redirect to original URL
// @route   GET /:code
// @access  Public
const redirectUrl = async (req, res) => {
  try {
    const { code } = req.params;
    
    const url = await Url.findOne({ 
      $or: [{ urlCode: code }, { customAlias: code }],
      isActive: true
    });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Check if URL is expired
    if (url.isExpired()) {
      return res.status(410).json({ message: 'URL has expired' });
    }

    // Track click
    const clickData = {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referrer')
    };

    await url.addClick(clickData);

    res.redirect(url.originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).json({ message: 'Server error during redirect' });
  }
};

// @desc    Get URL analytics
// @route   GET /api/urls/:id/analytics
// @access  Private
const getUrlAnalytics = async (req, res) => {
  try {
    const url = await Url.findOne({ 
      _id: req.params.id, 
      userId: req.user.id 
    });

    if (!url) {
      return res.status(404).json({ message: 'URL not found' });
    }

    // Basic analytics
    const analytics = {
      totalClicks: url.clicks,
      clickHistory: url.clickHistory,
      createdAt: url.createdAt,
      lastClicked: url.clickHistory.length > 0 
        ? url.clickHistory[url.clickHistory.length - 1].timestamp 
        : null
    };

    res.json({ analytics });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error fetching analytics' });
  }
};

module.exports = {
  shortenUrl,
  getUserUrls,
  getUrlById,
  deleteUrl,
  redirectUrl,
  getUrlAnalytics
};