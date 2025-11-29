const crypto = require('crypto');

const generateShortCode = (length = 6) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    result += chars[randomIndex];
  }
  
  return result;
};

const generateShortUrl = (baseUrl, code) => {
  return `${baseUrl}/${code}`;
};

const isValidCustomAlias = (alias) => {
  // Allow alphanumeric characters, hyphens, and underscores
  const pattern = /^[a-zA-Z0-9_-]+$/;
  return pattern.test(alias) && alias.length >= 3 && alias.length <= 20;
};

module.exports = {
  generateShortCode,
  generateShortUrl,
  isValidCustomAlias
};