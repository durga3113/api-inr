const mongoose = require('mongoose');

const dataweb = mongoose.Schema({
    totalUsers: { 
        type: Number,
        default: 0 
    },
    totalRequests: { 
        type: Number,
        default: 0 
    },
    visitors: { 
        type: Number,
        default: 0 
    },
    RequestToday: { 
        type: Number,
        default: 0 
    }
}, { versionKey: false });
module.exports = mongoose.model('Website Database', dataweb);