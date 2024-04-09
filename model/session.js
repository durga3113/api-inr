const mongoose = require('mongoose');

const PasteSchema = new mongoose.Schema({
  id: String,
  content: String,
});

module.exports = mongoose.model('Paste', PasteSchema);
