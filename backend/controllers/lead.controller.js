const Lead = require('../models/Lead');

exports.createLead = async (req, res, next) => {
  try {
    const { name, phone, city, homeType, sourcePage, message, meta, productDetails } = req.body;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required'
      });
    }

    // Check for duplicate leads by requestId first (if provided)
    if (meta && meta.requestId) {
      const existingLeadByRequestId = await Lead.findOne({
        'meta.requestId': meta.requestId
      });

      if (existingLeadByRequestId) {
        return res.status(400).json({
          success: false,
          message: 'This request has already been submitted. Please wait a moment before trying again.'
        });
      }
    }

    // Check for duplicate leads (same phone number within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const existingLead = await Lead.findOne({
      phone: phone,
      createdAt: { $gte: fiveMinutesAgo }
    });

    if (existingLead) {
      return res.status(400).json({
        success: false,
        message: 'A lead with this phone number was submitted recently. Please wait a few minutes before submitting again.'
      });
    }

    // Create lead in database
    const lead = await Lead.create({ name, phone, city, homeType, sourcePage, message, meta, productDetails });


    // Email feature removed - leads are only stored in admin panel

    res.status(201).json({
      success: true,
      message: 'Lead submitted successfully',
      lead: lead
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to create lead. Please try again.',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

exports.getLeads = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const leads = await Lead.find(filter).sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) {
    next(err);
  }
};

exports.updateLeadStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['new', 'contacted', 'converted', 'closed'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const lead = await Lead.findByIdAndUpdate(id, { status }, { new: true });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) {
    next(err);
  }
};



