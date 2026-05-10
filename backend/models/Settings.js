const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    orderNotificationEmail: { type: String, default: '' },
    returnNotificationEmail: { type: String, default: '' },
    leadNotificationEmail: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
