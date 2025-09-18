const Order = require('../models/Order');
const DeliveryPartner = require('../models/DeliveryPartner');

// Create order (guest checkout)
exports.createOrder = async (req, res, next) => {
	try {
		const {
			customer,
			items,
			total,
			subtotal,
			shipping,
			tax,
			paymentMethod,
			paymentDetails
		} = req.body;

		if (!customer || !items || !Array.isArray(items) || !items.length) {
			return res.status(400).json({ message: 'Invalid order payload' });
		}

		if (!paymentMethod) {
			return res.status(400).json({ message: 'Payment method is required' });
		}

		// For COD orders, set payment status as pending
		// For other payment methods, simulate payment processing
		let paymentStatus = 'pending';
		let finalPaymentDetails = paymentDetails || {};

		if (paymentMethod === 'cod') {
			paymentStatus = 'pending';
		} else {
			// Simulate successful payment for demo purposes
			paymentStatus = 'paid';
			finalPaymentDetails = {
				transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
				paymentGateway: paymentMethod === 'card' ? 'razorpay' : 'razorpay',
				paidAt: new Date(),
				...paymentDetails
			};
		}

		const orderData = {
			customer,
			items,
			total,
			subtotal: subtotal || total,
			shipping: shipping || 0,
			tax: tax || 0,
			paymentMethod,
			paymentStatus,
			paymentDetails: finalPaymentDetails
		};

		const order = await Order.create(orderData);
		res.status(201).json(order);
	} catch (err) {
		next(err);
	}
};

// Get order by id
exports.getOrderById = async (req, res, next) => {
	try {
		const { id } = req.params;
		const order = await Order.findById(id);
		if (!order) return res.status(404).json({ message: 'Order not found' });
		res.json(order);
	} catch (err) {
		next(err);
	}
};

// List orders (basic; in real admin require auth)
exports.getOrders = async (req, res, next) => {
	try {
		const orders = await Order.find().sort({ createdAt: -1 });
		res.json(orders);
	} catch (err) {
		next(err);
	}
};

// Update order status
exports.updateOrderStatus = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { status } = req.body;

		if (!status) {
			return res.status(400).json({ message: 'Status is required' });
		}

		const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
		if (!validStatuses.includes(status)) {
			return res.status(400).json({ message: 'Invalid status' });
		}

		const order = await Order.findByIdAndUpdate(
			id,
			{ status },
			{ new: true, runValidators: true }
		);

		if (!order) {
			return res.status(404).json({ message: 'Order not found' });
		}

		res.json(order);
	} catch (err) {
		next(err);
	}
};

// Assign order to delivery partner
exports.assignOrderToPartner = async (req, res, next) => {
	try {
		const { orderId } = req.params;
		const { partnerId, deliveryFee, estimatedDelivery, notes } = req.body;
		const assignedBy = req.user?.name || 'Admin';

		// Get the order
		const order = await Order.findById(orderId);
		if (!order) {
			return res.status(404).json({ message: 'Order not found' });
		}

		// Get the delivery partner
		const partner = await DeliveryPartner.findById(partnerId);
		if (!partner) {
			return res.status(404).json({ message: 'Delivery partner not found' });
		}

		// Check if partner is available
		if (!partner.isAvailable || partner.status !== 'active') {
			return res.status(400).json({ message: 'Delivery partner is not available' });
		}

		// Check if partner serves the delivery area
		const customerCity = order.customer.city;
		const customerState = order.customer.state;
		const customerPincode = order.customer.zip;

		const servesArea = partner.serviceAreas.some(area => {
			if (!area.isActive) return false;

			// Check for pan-Indian coverage
			if (area.city === 'All India' || area.state === 'All States') {
				return true;
			}

			// Check for specific city/state match
			return area.city.toLowerCase() === customerCity.toLowerCase() &&
				area.state.toLowerCase() === customerState.toLowerCase() &&
				(area.pincodes.length === 0 || area.pincodes.includes(customerPincode));
		});

		if (!servesArea) {
			return res.status(400).json({ message: 'Delivery partner does not serve this area' });
		}

		// Update order with delivery partner assignment
		order.deliveryPartner = {
			partnerId: partner._id,
			partnerName: partner.name,
			assignedAt: new Date(),
			assignedBy: assignedBy,
			deliveryFee: deliveryFee || 0,
			estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
			trackingNumber: `TRK-${Date.now()}`,
			deliveryStatus: 'assigned',
			deliveryNotes: notes || ''
		};

		// Add to assignment history
		order.assignmentHistory.push({
			partnerId: partner._id,
			partnerName: partner.name,
			assignedAt: new Date(),
			assignedBy: assignedBy,
			status: 'assigned',
			notes: notes || ''
		});

		// Add to timeline
		order.timeline.push({
			status: 'assigned_to_partner',
			timestamp: new Date(),
			updatedBy: 'admin',
			notes: `Order assigned to ${partner.name}`
		});

		// Update order status
		order.status = 'confirmed';

		await order.save();

		res.json({
			message: 'Order assigned to delivery partner successfully',
			order: order,
			partner: {
				name: partner.name,
				phone: partner.phone,
				email: partner.email
			}
		});
	} catch (err) {
		next(err);
	}
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res, next) => {
	try {
		const { orderId } = req.params;
		const { deliveryStatus, notes, deliveryProof } = req.body;
		const updatedBy = req.user?.name || 'System';

		const order = await Order.findById(orderId);
		if (!order) {
			return res.status(404).json({ message: 'Order not found' });
		}

		if (!order.deliveryPartner) {
			return res.status(400).json({ message: 'Order is not assigned to any delivery partner' });
		}

		// Update delivery status
		order.deliveryPartner.deliveryStatus = deliveryStatus;
		if (notes) order.deliveryPartner.deliveryNotes = notes;
		if (deliveryProof) order.deliveryPartner.deliveryProof = deliveryProof;

		// Update actual delivery time if delivered
		if (deliveryStatus === 'delivered') {
			order.deliveryPartner.actualDelivery = new Date();
			order.status = 'delivered';
		}

		// Add to timeline
		order.timeline.push({
			status: deliveryStatus,
			timestamp: new Date(),
			updatedBy: updatedBy,
			notes: notes || ''
		});

		await order.save();

		res.json({
			message: 'Delivery status updated successfully',
			order: order
		});
	} catch (err) {
		next(err);
	}
};

// Get orders by delivery partner
exports.getOrdersByPartner = async (req, res, next) => {
	try {
		const { partnerId } = req.params;
		const { status, limit, skip } = req.query;

		const filter = { 'deliveryPartner.partnerId': partnerId };
		if (status) {
			filter['deliveryPartner.deliveryStatus'] = status;
		}

		const orders = await Order.find(filter)
			.populate('deliveryPartner.partnerId', 'name phone email')
			.sort({ 'deliveryPartner.assignedAt': -1 })
			.limit(parseInt(limit) || 50)
			.skip(parseInt(skip) || 0);

		res.json(orders);
	} catch (err) {
		next(err);
	}
};

// Get available delivery partners for an order
exports.getAvailablePartners = async (req, res, next) => {
	try {
		const { city, state, pincode } = req.query;

		if (!city || !state) {
			return res.status(400).json({ message: 'City and state are required' });
		}

		// For pan-Indian delivery, we'll return all active partners
		// since they now serve "All India"
		const partners = await DeliveryPartner.find({
			status: 'active',
			isAvailable: true,
			'serviceAreas': {
				$elemMatch: {
					isActive: true,
					$or: [
						{ city: 'All India' }, // Pan-Indian coverage
						{ city: new RegExp(city, 'i') }, // Specific city match
						{ city: new RegExp(city.replace(/\s+/g, ''), 'i') }, // City without spaces
						{ city: new RegExp(city.replace(/\s+/g, ' ').trim(), 'i') } // Normalized city
					]
				}
			}
		}).select('name companyName phone email serviceAreas services pricing commission');

		res.json(partners);
	} catch (err) {
		next(err);
	}
};

// Reassign order to different partner
exports.reassignOrder = async (req, res, next) => {
	try {
		const { orderId } = req.params;
		const { newPartnerId, notes } = req.body;
		const reassignedBy = req.user?.name || 'Admin';

		const order = await Order.findById(orderId);
		if (!order) {
			return res.status(404).json({ message: 'Order not found' });
		}

		const newPartner = await DeliveryPartner.findById(newPartnerId);
		if (!newPartner) {
			return res.status(404).json({ message: 'New delivery partner not found' });
		}

		// Add current assignment to history
		if (order.deliveryPartner) {
			order.assignmentHistory.push({
				partnerId: order.deliveryPartner.partnerId,
				partnerName: order.deliveryPartner.partnerName,
				assignedAt: order.deliveryPartner.assignedAt,
				assignedBy: order.deliveryPartner.assignedBy,
				status: 'reassigned',
				notes: notes || 'Order reassigned to different partner'
			});
		}

		// Update with new partner
		order.deliveryPartner = {
			partnerId: newPartner._id,
			partnerName: newPartner.name,
			assignedAt: new Date(),
			assignedBy: reassignedBy,
			deliveryFee: order.deliveryPartner?.deliveryFee || 0,
			estimatedDelivery: order.deliveryPartner?.estimatedDelivery || null,
			trackingNumber: `TRK-${Date.now()}`,
			deliveryStatus: 'assigned',
			deliveryNotes: notes || ''
		};

		// Add to timeline
		order.timeline.push({
			status: 'reassigned',
			timestamp: new Date(),
			updatedBy: 'admin',
			notes: `Order reassigned from ${order.assignmentHistory[order.assignmentHistory.length - 2]?.partnerName || 'Previous Partner'} to ${newPartner.name}`
		});

		await order.save();

		res.json({
			message: 'Order reassigned successfully',
			order: order
		});
	} catch (err) {
		next(err);
	}
};


