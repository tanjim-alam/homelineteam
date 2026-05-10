const Settings = require('../models/Settings');

const DEFAULT_EMAIL = process.env.EMAIL_TO || 'homeline042@gmail.com';

exports.getSettings = async (req, res, next) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = {
                orderNotificationEmail: DEFAULT_EMAIL,
                returnNotificationEmail: DEFAULT_EMAIL,
                leadNotificationEmail: DEFAULT_EMAIL,
            };
        }
        res.json({ success: true, settings });
    } catch (err) {
        next(err);
    }
};

exports.updateSettings = async (req, res, next) => {
    try {
        const { orderNotificationEmail, returnNotificationEmail, leadNotificationEmail } = req.body;
        const settings = await Settings.findOneAndUpdate(
            {},
            { orderNotificationEmail, returnNotificationEmail, leadNotificationEmail },
            { upsert: true, new: true, runValidators: true }
        );
        res.json({ success: true, settings });
    } catch (err) {
        next(err);
    }
};
