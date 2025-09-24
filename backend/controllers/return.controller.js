const Return = require('../models/Return');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// Create a new return/exchange request
exports.createReturnRequest = async (req, res, next) => {
    try {
        const { orderId, type, items, exchangeItems, customerNotes, images, bankAccount, shippingAddress } = req.body;
        const userId = req.user._id;

        // Validate required fields
        if (!orderId || !type || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order ID, type, and items are required'
            });
        }

        // Check if order exists and belongs to user
        const order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found or does not belong to you'
            });
        }

        // Check if order is eligible for return (delivered status)
        if (order.status !== 'delivered') {
            return res.status(400).json({
                success: false,
                message: 'Order must be delivered before requesting return/exchange'
            });
        }

        // Check if return request already exists for this order
        const existingReturn = await Return.findOne({ order: orderId });
        if (existingReturn) {
            return res.status(400).json({
                success: false,
                message: 'Return request already exists for this order'
            });
        }

        // Validate return items against order items
        const orderItemIds = order.items.map(item => item.productId.toString());
        const returnItemIds = items.map(item => item.productId);

        const invalidItems = returnItemIds.filter(id => !orderItemIds.includes(id));
        if (invalidItems.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Some items are not part of this order'
            });
        }

        // Create return request
        const returnRequest = new Return({
            order: orderId,
            user: userId,
            type,
            items,
            exchangeItems: exchangeItems || [],
            customerNotes,
            images: images || [],
            bankAccount: bankAccount || {},
            shippingAddress: shippingAddress || {}
        });

        await returnRequest.save();

        // Populate the return request with order and user details
        await returnRequest.populate([
            { path: 'order', select: 'orderNumber status totalAmount' },
            { path: 'user', select: 'name email' },
            { path: 'items.productId', select: 'name price images' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Return request created successfully',
            data: returnRequest
        });

    } catch (error) {
        next(error);
    }
};

// Get user's return requests
exports.getUserReturns = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { status, type, page = 1, limit = 10 } = req.query;

        const filter = { user: userId };
        if (status) filter.status = status;
        if (type) filter.type = type;

        const returns = await Return.find(filter)
            .populate([
                { path: 'order', select: 'orderNumber status totalAmount' },
                { path: 'items.productId', select: 'name price images' }
            ])
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Return.countDocuments(filter);

        res.json({
            success: true,
            data: returns,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        next(error);
    }
};

// Get return request by ID
exports.getReturnById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const returnRequest = await Return.findOne({ _id: id, user: userId })
            .populate([
                { path: 'order', select: 'orderNumber status totalAmount items' },
                { path: 'user', select: 'name email' },
                { path: 'items.productId', select: 'name price images' },
                { path: 'exchangeItems.productId', select: 'name price images' }
            ]);

        if (!returnRequest) {
            return res.status(404).json({
                success: false,
                message: 'Return request not found'
            });
        }

        res.json({
            success: true,
            data: returnRequest
        });

    } catch (error) {
        next(error);
    }
};

// Update return request (user)
exports.updateReturnRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { customerNotes, images } = req.body;

        const returnRequest = await Return.findOne({ _id: id, user: userId });
        if (!returnRequest) {
            return res.status(404).json({
                success: false,
                message: 'Return request not found'
            });
        }

        // Only allow updates if status is pending
        if (returnRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update return request after it has been processed'
            });
        }

        if (customerNotes !== undefined) returnRequest.customerNotes = customerNotes;
        if (images !== undefined) returnRequest.images = images;

        await returnRequest.save();

        res.json({
            success: true,
            message: 'Return request updated successfully',
            data: returnRequest
        });

    } catch (error) {
        next(error);
    }
};

// Cancel return request
exports.cancelReturnRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const returnRequest = await Return.findOne({ _id: id, user: userId });
        if (!returnRequest) {
            return res.status(404).json({
                success: false,
                message: 'Return request not found'
            });
        }

        // Only allow cancellation if status is pending
        if (returnRequest.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel return request after it has been processed'
            });
        }

        returnRequest.status = 'cancelled';
        await returnRequest.save();

        res.json({
            success: true,
            message: 'Return request cancelled successfully',
            data: returnRequest
        });

    } catch (error) {
        next(error);
    }
};

// Admin: Get all return requests
exports.getAllReturns = async (req, res, next) => {
    try {
        const { status, type, page = 1, limit = 10, search } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;

        // Add search functionality
        if (search) {
            filter.$or = [
                { 'order.orderNumber': { $regex: search, $options: 'i' } },
                { 'user.name': { $regex: search, $options: 'i' } },
                { 'user.email': { $regex: search, $options: 'i' } }
            ];
        }

        const returns = await Return.find(filter)
            .populate([
                { path: 'order', select: 'orderNumber status totalAmount' },
                { path: 'user', select: 'name email' },
                { path: 'items.productId', select: 'name price images' }
            ])
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Return.countDocuments(filter);

        res.json({
            success: true,
            data: returns,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });

    } catch (error) {
        next(error);
    }
};

// Admin: Get return products for management
exports.getAllReturnProducts = async (req, res, next) => {
    try {
        const { status, type, page = 1, limit = 10, search } = req.query;

        const filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;

        if (search) {
            filter.$or = [
                { 'order.orderNumber': { $regex: search, $options: 'i' } },
                { 'user.name': { $regex: search, $options: 'i' } },
                { 'user.email': { $regex: search, $options: 'i' } }
            ];
        }

        const returns = await Return.find(filter)
            .populate([
                { path: 'order', select: 'orderNumber status totalAmount' },
                { path: 'user', select: 'name email' },
                { path: 'items.productId', select: 'name price images' }
            ])
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Return.countDocuments(filter);

        // Get return statistics
        const stats = await Return.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: returns,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            },
            stats: stats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, {})
        });

    } catch (error) {
        next(error);
    }
};

// Admin: Get return request by ID
exports.getReturnByIdAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;

        const returnRequest = await Return.findById(id)
            .populate([
                { path: 'order', select: 'orderNumber status totalAmount items' },
                { path: 'user', select: 'name email' },
                { path: 'items.productId', select: 'name price images' },
                { path: 'exchangeItems.productId', select: 'name price images' }
            ]);

        if (!returnRequest) {
            return res.status(404).json({
                success: false,
                message: 'Return request not found'
            });
        }

        res.json({
            success: true,
            data: returnRequest
        });

    } catch (error) {
        next(error);
    }
};

// Admin: Update return status
exports.updateReturnStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, adminNotes, refundMethod, trackingNumber } = req.body;

        const returnRequest = await Return.findById(id);
        if (!returnRequest) {
            return res.status(404).json({
                success: false,
                message: 'Return request not found'
            });
        }

        // Validate status transition
        const validTransitions = {
            'pending': ['approved', 'rejected'],
            'approved': ['processing', 'rejected'],
            'processing': ['shipped', 'received', 'completed'],
            'shipped': ['received', 'completed'],
            'received': ['completed'],
            'rejected': ['pending'], // Allow re-review
            'completed': [],
            'cancelled': []
        };

        if (!validTransitions[returnRequest.status]?.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status transition from ${returnRequest.status} to ${status}`
            });
        }

        // Update return request
        returnRequest.status = status;
        if (adminNotes) returnRequest.adminNotes = adminNotes;
        if (refundMethod) returnRequest.refund.method = refundMethod;
        if (trackingNumber) returnRequest.returnShipping.trackingNumber = trackingNumber;

        // Set timestamps based on status
        const now = new Date();
        switch (status) {
            case 'approved':
                returnRequest.timestamps.approvedAt = now;
                break;
            case 'rejected':
                returnRequest.timestamps.rejectedAt = now;
                break;
            case 'completed':
                returnRequest.timestamps.completedAt = now;
                break;
            case 'shipped':
                returnRequest.returnShipping.shippedAt = now;
                break;
            case 'received':
                returnRequest.returnShipping.deliveredAt = now;
                break;
        }

        await returnRequest.save();

        res.json({
            success: true,
            message: 'Return status updated successfully',
            data: returnRequest
        });

    } catch (error) {
        next(error);
    }
};

// Admin: Process refund
exports.processRefund = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { transactionId, method } = req.body;

        const returnRequest = await Return.findById(id);
        if (!returnRequest) {
            return res.status(404).json({
                success: false,
                message: 'Return request not found'
            });
        }

        if (returnRequest.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Return request must be approved before processing refund'
            });
        }

        returnRequest.refund.status = 'processing';
        returnRequest.refund.transactionId = transactionId;
        returnRequest.refund.method = method;
        returnRequest.refund.processedAt = new Date();

        await returnRequest.save();

        res.json({
            success: true,
            message: 'Refund processing initiated',
            data: returnRequest
        });

    } catch (error) {
        next(error);
    }
};

// Admin: Complete refund
exports.completeRefund = async (req, res, next) => {
    try {
        const { id } = req.params;

        const returnRequest = await Return.findById(id);
        if (!returnRequest) {
            return res.status(404).json({
                success: false,
                message: 'Return request not found'
            });
        }

        if (returnRequest.refund.status !== 'processing') {
            return res.status(400).json({
                success: false,
                message: 'Refund must be in processing status to complete'
            });
        }

        returnRequest.refund.status = 'completed';
        returnRequest.refund.completedAt = new Date();

        await returnRequest.save();

        res.json({
            success: true,
            message: 'Refund completed successfully',
            data: returnRequest
        });

    } catch (error) {
        next(error);
    }
};

// Admin: Get return statistics
exports.getReturnStats = async (req, res, next) => {
    try {
        // Get all returns and count by status manually
        const allReturns = await Return.find({});

        // Count by status
        const statusCounts = {};
        allReturns.forEach(returnItem => {
            const status = returnItem.status || 'pending';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        const totalReturns = allReturns.length;
        const totalRefunds = allReturns.filter(r => r.refund && r.refund.status === 'completed').length;

        const result = {
            success: true,
            data: {
                pending: statusCounts.pending || 0,
                approved: statusCounts.approved || 0,
                rejected: statusCounts.rejected || 0,
                processing: statusCounts.processing || 0,
                shipped: statusCounts.shipped || 0,
                received: statusCounts.received || 0,
                completed: statusCounts.completed || 0,
                cancelled: statusCounts.cancelled || 0,
                totalReturns,
                totalRefunds
            }
        };

        res.json(result);

    } catch (error) {
        next(error);
    }
};
