const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: [true, 'Original URL is required'],
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please enter a valid URL starting with http:// or https://'
    }
  },
  shortUrl: {
    type: String,
    required: true,
    unique: true
  },
  urlCode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  clickHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    ip: String,
    userAgent: String,
    referrer: String
  }],
  expiresAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  customAlias: {
    type: String,
    default: null,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Index for faster queries
urlSchema.index({ userId: 1, createdAt: -1 });
urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Check if URL is expired
urlSchema.methods.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

// Add click tracking
urlSchema.methods.addClick = function(clickData = {}) {
  this.clicks += 1;
  this.clickHistory.push({
    timestamp: new Date(),
    ip: clickData.ip || 'unknown',
    userAgent: clickData.userAgent || 'unknown',
    referrer: clickData.referrer || 'direct'
  });
  return this.save();
};

module.exports = mongoose.model('Url', urlSchema);