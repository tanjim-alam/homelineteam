const DeliveryPartner = require('../models/DeliveryPartner');
const { uploadBuffer } = require('../utils/cloudinary');

exports.createDeliveryPartner = async (req, res, next) => {
    try {
        const {
            name, slug, description, companyName, registrationNumber, gstNumber,
            contactPerson, email, phone, alternatePhone, address, serviceAreas,
            services, deliveryCapabilities, pricing, bankDetails, commission,
            tags, notes
        } = req.body;

        // Handle document uploads
        const documents = {};
        if (req.files) {
            const docFields = ['panCard', 'aadharCard', 'drivingLicense', 'vehicleRegistration', 'insurance', 'gstCertificate'];
            for (const field of docFields) {
                if (req.files[field]) {
                    const uploaded = await uploadBuffer(req.files[field].buffer, `delivery-partners/${slug || name}/${field}`);
                    documents[field] = uploaded.secure_url;
                }
            }
        }

        const parseMaybe = (v) => typeof v === 'string' ? JSON.parse(v) : v;

        const partner = await DeliveryPartner.create({
            name,
            slug,
            description,
            companyName,
            registrationNumber,
            gstNumber,
            contactPerson,
            email,
            phone,
            alternatePhone,
            address: parseMaybe(address) || {},
            serviceAreas: parseMaybe(serviceAreas) || [],
            services: parseMaybe(services) || [],
            deliveryCapabilities: parseMaybe(deliveryCapabilities) || {},
            pricing: parseMaybe(pricing) || {},
            bankDetails: parseMaybe(bankDetails) || {},
            commission: parseMaybe(commission) || {},
            documents,
            tags: typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : (tags || []),
            notes
        });

        res.status(201).json(partner);
    } catch (err) {
        next(err);
    }
};

exports.getDeliveryPartners = async (req, res, next) => {
    try {
        const {
            status, isAvailable, city, state, serviceType, search, sort, limit
        } = req.query;

        const filter = {};

        // Status filtering
        if (status) {
            filter.status = status;
        }

        // Availability filtering
        if (isAvailable !== undefined) {
            filter.isAvailable = isAvailable === 'true';
        }

        // Service area filtering
        if (city || state) {
            filter['serviceAreas'] = {};
            if (city) {
                filter['serviceAreas.city'] = new RegExp(city, 'i');
            }
            if (state) {
                filter['serviceAreas.state'] = new RegExp(state, 'i');
            }
        }

        // Service type filtering
        if (serviceType) {
            filter['services.name'] = new RegExp(serviceType, 'i');
        }

        // Search filtering
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { companyName: { $regex: search, $options: 'i' } },
                { contactPerson: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        let query = DeliveryPartner.find(filter);

        // Sorting
        if (sort) {
            const sortMap = {
                'name': { name: 1 },
                'company': { companyName: 1 },
                'rating': { 'performance.customerRating': -1 },
                'deliveries': { 'performance.totalDeliveries': -1 },
                'created': { createdAt: -1 }
            };
            query = query.sort(sortMap[sort] || { createdAt: -1 });
        } else {
            query = query.sort({ createdAt: -1 });
        }

        if (limit && !isNaN(parseInt(limit))) {
            query = query.limit(parseInt(limit));
        }

        const partners = await query.exec();
        res.json(partners);
    } catch (err) {
        next(err);
    }
};

exports.getDeliveryPartnerById = async (req, res, next) => {
    try {
        const partner = await DeliveryPartner.findById(req.params.id);
        if (!partner) {
            return res.status(404).json({ message: 'Delivery partner not found' });
        }
        res.json(partner);
    } catch (err) {
        next(err);
    }
};

exports.getDeliveryPartnerBySlug = async (req, res, next) => {
    try {
        const partner = await DeliveryPartner.findOne({ slug: req.params.slug });
        if (!partner) {
            return res.status(404).json({ message: 'Delivery partner not found' });
        }
        res.json(partner);
    } catch (err) {
        next(err);
    }
};

exports.updateDeliveryPartner = async (req, res, next) => {
    try {
        const updates = { ...req.body };
        const parseMaybe = (v) => typeof v === 'string' ? JSON.parse(v) : v;

        // Parse complex fields
        [
            'address', 'serviceAreas', 'services', 'deliveryCapabilities',
            'pricing', 'bankDetails', 'commission'
        ].forEach(k => {
            if (updates[k] !== undefined) updates[k] = parseMaybe(updates[k]);
        });

        // Handle document uploads
        if (req.files) {
            const documents = {};
            const docFields = ['panCard', 'aadharCard', 'drivingLicense', 'vehicleRegistration', 'insurance', 'gstCertificate'];
            for (const field of docFields) {
                if (req.files[field]) {
                    const uploaded = await uploadBuffer(req.files[field].buffer, `delivery-partners/${updates.slug || req.params.id}/${field}`);
                    documents[field] = uploaded.secure_url;
                }
            }
            if (Object.keys(documents).length > 0) {
                updates.documents = { ...updates.documents, ...documents };
            }
        }

        const partner = await DeliveryPartner.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!partner) {
            return res.status(404).json({ message: 'Delivery partner not found' });
        }

        res.json(partner);
    } catch (err) {
        next(err);
    }
};

exports.deleteDeliveryPartner = async (req, res, next) => {
    try {
        const partner = await DeliveryPartner.findByIdAndDelete(req.params.id);
        if (!partner) {
            return res.status(404).json({ message: 'Delivery partner not found' });
        }
        res.json({ message: 'Delivery partner deleted successfully' });
    } catch (err) {
        next(err);
    }
};

exports.updatePartnerStatus = async (req, res, next) => {
    try {
        const { status, isAvailable } = req.body;

        const partner = await DeliveryPartner.findByIdAndUpdate(
            req.params.id,
            { status, isAvailable },
            { new: true }
        );

        if (!partner) {
            return res.status(404).json({ message: 'Delivery partner not found' });
        }

        res.json(partner);
    } catch (err) {
        next(err);
    }
};

exports.updatePerformance = async (req, res, next) => {
    try {
        const { totalDeliveries, onTimeDeliveries, customerRating } = req.body;

        const partner = await DeliveryPartner.findById(req.params.id);
        if (!partner) {
            return res.status(404).json({ message: 'Delivery partner not found' });
        }

        // Update performance metrics
        if (totalDeliveries !== undefined) {
            partner.performance.totalDeliveries = totalDeliveries;
        }
        if (onTimeDeliveries !== undefined) {
            partner.performance.onTimeDeliveries = onTimeDeliveries;
        }
        if (customerRating !== undefined) {
            partner.performance.customerRating = customerRating;
        }

        // Calculate success rate
        partner.performance.successRate = partner.calculateSuccessRate();

        await partner.save();
        res.json(partner);
    } catch (err) {
        next(err);
    }
};

exports.getPartnersByArea = async (req, res, next) => {
    try {
        const { city, state, pincode } = req.query;

        if (!city || !state) {
            return res.status(400).json({ message: 'City and state are required' });
        }

        const partners = await DeliveryPartner.find({
            status: 'active',
            isAvailable: true,
            'serviceAreas': {
                $elemMatch: {
                    city: new RegExp(city, 'i'),
                    state: new RegExp(state, 'i'),
                    isActive: true,
                    $or: [
                        { pincodes: { $size: 0 } }, // No specific pincode restriction
                        { pincodes: pincode || { $exists: true } }
                    ]
                }
            }
        });

        res.json(partners);
    } catch (err) {
        next(err);
    }
};














