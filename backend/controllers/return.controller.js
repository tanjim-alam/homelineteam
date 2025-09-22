const Return = require('../models/Return');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// Create a new return/exchange request
exports.createReturnRequest = async (req, res, next) => {
    try {
        const { orderId, type, items, exchangeItems, customerNotes, images } = req.body;
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

        // Calculate refund amount
        const refundAmount = items.reduce((total, item) => {
            const orderItem = order.items.find(oi => oi.productId.toString() === item.productId);
            return total + (orderItem.price * item.quantity);
        }, 0);

        // Create return request
        const returnRequest = new Return({
            user: userId,
            order: orderId,
            type,
            items,
            exchangeItems: exchangeItems || [],
            customer: {
                name: order.customer.name,
                email: order.customer.email,
                phone: order.customer.phone,
                address: order.customer.address,
                city: order.customer.city,
                state: order.customer.state,
                zip: order.customer.zip
            },
            refund: {
                amount: refundAmount,
                method: 'original_payment'
            },
            customerNotes,
            images: images || [],
            withinPolicy: true // Will be validated by admin
        });

        await returnRequest.save();

        // Populate the return request with order and user details
        await returnRequest.populate([
            { path: 'order', select: 'orderNumber total status' },
            { path: 'user', select: 'name email' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Return request submitted successfully',
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
        const { status, type } = req.query;

        let filter = { user: userId };
        if (status) filter.status = status;
        if (type) filter.type = type;

        const returns = await Return.find(filter)
            .populate('order', 'orderNumber total status createdAt')
            .populate('user', 'name email')
            .sort({ requestedAt: -1 });

        res.json({
            success: true,
            data: returns
        });

    } catch (error) {
        next(error);
    }
};

// Get single return request
exports.getReturnById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const returnRequest = await Return.findOne({ _id: id, user: userId })
            .populate('order', 'orderNumber total status items createdAt')
            .populate('user', 'name email phone')
            .populate('items.productId', 'name images')
            .populate('exchangeItems.productId', 'name images');

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

// Update return request (customer can only update certain fields)
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

        // Update allowed fields
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

        // Only allow cancellation if status is pending or approved
        if (!['pending', 'approved'].includes(returnRequest.status)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel return request in current status'
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
        const { status, type, page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        let filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;

        const returns = await Return.find(filter)
            .populate('order', 'orderNumber total status createdAt')
            .populate('user', 'name email phone')
            .sort({ requestedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

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

// Admin: Get single return request
exports.getReturnByIdAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;

        const returnRequest = await Return.findById(id)
            .populate('order', 'orderNumber total status items createdAt')
            .populate('user', 'name email phone')
            .populate('items.productId', 'name images')
            .populate('exchangeItems.productId', 'name images');

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
                returnRequest.approvedAt = now;
                break;
            case 'rejected':
                returnRequest.rejectedAt = now;
                break;
            case 'completed':
                returnRequest.completedAt = now;
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

        // Update refund details
        returnRequest.refund.status = 'processing';
        returnRequest.refund.transactionId = transactionId;
        if (method) returnRequest.refund.method = method;

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
                message: 'Refund must be in processing status'
            });
        }

        // Complete refund
        returnRequest.refund.status = 'completed';
        returnRequest.refund.processedAt = new Date();
        returnRequest.status = 'completed';

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

// Get return statistics for admin dashboard
exports.getReturnStats = async (req, res, next) => {
    try {
        const stats = await Return.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$refund.amount' }
                }
            }
        ]);

        const totalReturns = await Return.countDocuments();
        const totalRefundAmount = await Return.aggregate([
            { $group: { _id: null, total: { $sum: '$refund.amount' } } }
        ]);

        res.json({
            success: true,
            data: {
                stats,
                totalReturns,
                totalRefundAmount: totalRefundAmount[0]?.total || 0
            }
        });

    } catch (error) {
        next(error);
    }
};

// Admin: Get all return products with detailed information
exports.getAllReturnProducts = async (req, res, next) => {
    try {
        const { status, type, page = 1, limit = 20, search } = req.query;
        const skip = (page - 1) * limit;

        let filter = {};
        if (status) filter.status = status;
        if (type) filter.type = type;

        // Build search filter
        if (search) {
            filter.$or = [
                { 'customer.name': { $regex: search, $options: 'i' } },
                { 'customer.email': { $regex: search, $options: 'i' } },
                { 'order.orderNumber': { $regex: search, $options: 'i' } },
                { 'items.name': { $regex: search, $options: 'i' } }
            ];
        }

        const returns = await Return.find(filter)
            .populate({
                path: 'order',
                select: 'orderNumber total status createdAt paymentMethod paymentStatus'
            })
            .populate({
                path: 'user',
                select: 'name email phone'
            })
            .populate({
                path: 'items.productId',
                select: 'name images slug categoryId'
            })
            .populate({
                path: 'exchangeItems.productId',
                select: 'name images slug categoryId'
            })
            .sort({ requestedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Return.countDocuments(filter);

        // Get statistics
        const stats = await Return.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$refund.amount' }
                }
            }
        ]);

        const totalReturns = await Return.countDocuments();
        const totalRefundAmount = await Return.aggregate([
            { $group: { _id: null, total: { $sum: '$refund.amount' } } }
        ]);

        res.json({
            success: true,
            data: returns,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total,
                limit: parseInt(limit)
            },
            stats: {
                byStatus: stats,
                totalReturns,
                totalRefundAmount: totalRefundAmount[0]?.total || 0
            }
        });

    } catch (error) {
        next(error);
    }
};
