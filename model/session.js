const mongoose = require('mongoose');

const PasteSchema = new mongoose.Schema({
  id: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});

PasteSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

module.exports = mongoose.model('Paste', PasteSchema);
