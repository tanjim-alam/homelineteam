const Product = require('../models/Product');
const Category = require('../models/Category');
const MainCategory = require('../models/MainCategory');
const KitchenProduct = require('../models/KitchenProduct');
const WardrobeProduct = require('../models/WardrobeProduct');
const OneBHKPackage = require('../models/OneBHKPackage');
const TwoBHKPackage = require('../models/TwoBHKPackage');
const OfferBanner = require('../models/OfferBanner');
const Lead = require('../models/Lead');
const DeliveryPartner = require('../models/DeliveryPartner');
const Admin = require('../models/Admin');
const User = require('../models/User');
const { RECYCLE_BIN_RETENTION_DAYS } = require('../utils/softDelete');

// Every soft-deletable model, keyed by the slug used in the Recycle Bin API/UI.
const REGISTRY = {
	product: { model: Product, label: 'Product', title: (d) => d.name, subtitle: (d) => `₹${d.basePrice ?? 0}`, image: (d) => d.mainImages?.[0] || null },
	category: { model: Category, label: 'Category', title: (d) => d.name, subtitle: (d) => d.slug, image: (d) => d.image || null },
	mainCategory: { model: MainCategory, label: 'Main Category', title: (d) => d.name, subtitle: (d) => d.slug, image: () => null },
	kitchenProduct: { model: KitchenProduct, label: 'Kitchen Product', title: (d) => d.name, subtitle: (d) => `₹${d.basePrice ?? 0}`, image: (d) => d.mainImages?.[0] || null },
	wardrobeProduct: { model: WardrobeProduct, label: 'Wardrobe Product', title: (d) => d.name, subtitle: (d) => `₹${d.basePrice ?? 0}`, image: (d) => d.mainImages?.[0] || null },
	oneBHKPackage: { model: OneBHKPackage, label: '1BHK Package', title: (d) => d.name, subtitle: (d) => `₹${d.basePrice ?? 0}`, image: (d) => d.mainImages?.[0] || null },
	twoBHKPackage: { model: TwoBHKPackage, label: '2BHK Package', title: (d) => d.name, subtitle: (d) => `₹${d.basePrice ?? 0}`, image: (d) => d.mainImages?.[0] || null },
	offerBanner: { model: OfferBanner, label: 'Offer Banner', title: (d) => d.text || 'Banner', subtitle: (d) => d.position || '', image: (d) => d.imageUrl || null },
	lead: { model: Lead, label: 'Lead', title: (d) => d.name, subtitle: (d) => d.phone || '', image: () => null },
	deliveryPartner: { model: DeliveryPartner, label: 'Delivery Partner', title: (d) => d.name, subtitle: (d) => d.companyName || d.phone || '', image: () => null },
	teamMember: { model: Admin, label: 'Team Member', title: (d) => d.name, subtitle: (d) => d.email, image: () => null, select: '-passwordHash' },
	user: { model: User, label: 'Customer', title: (d) => d.name, subtitle: (d) => d.email, image: () => null, select: '-password -emailVerificationToken -emailVerificationExpires -resetPasswordToken -resetPasswordExpires' },
};

function serialize(type, entry, doc) {
	const deletedAt = doc.deletedAt;
	const purgeAt = deletedAt
		? new Date(new Date(deletedAt).getTime() + RECYCLE_BIN_RETENTION_DAYS * 24 * 60 * 60 * 1000)
		: null;
	return {
		type,
		typeLabel: entry.label,
		id: doc._id,
		title: entry.title(doc) || 'Untitled',
		subtitle: entry.subtitle(doc) || '',
		image: entry.image(doc),
		deletedAt,
		purgeAt,
	};
}

// List everything currently in the Recycle Bin, optionally scoped to one type.
exports.listTrash = async (req, res, next) => {
	try {
		const { type } = req.query;
		const types = type && REGISTRY[type] ? [type] : Object.keys(REGISTRY);

		const results = [];
		for (const t of types) {
			const entry = REGISTRY[t];
			const docs = await entry.model
				.find({ deletedAt: { $ne: null } })
				.select(entry.select)
				.sort({ deletedAt: -1 })
				.lean();
			docs.forEach((doc) => results.push(serialize(t, entry, doc)));
		}

		results.sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));

		const counts = {};
		for (const t of Object.keys(REGISTRY)) {
			counts[t] = results.filter((r) => r.type === t).length;
		}

		res.json({ success: true, data: results, counts, retentionDays: RECYCLE_BIN_RETENTION_DAYS });
	} catch (err) {
		next(err);
	}
};

// Restore a single item back to normal use.
exports.restoreItem = async (req, res, next) => {
	try {
		const { type, id } = req.params;
		const entry = REGISTRY[type];
		if (!entry) return res.status(400).json({ message: 'Unknown item type' });

		const doc = await entry.model.findOneAndUpdate(
			{ _id: id, deletedAt: { $ne: null } },
			{ deletedAt: null },
			{ new: true }
		);
		if (!doc) return res.status(404).json({ message: 'Item not found in Recycle Bin' });

		res.json({ success: true, message: `${entry.label} restored` });
	} catch (err) {
		next(err);
	}
};

// Permanently delete a single item — cannot be undone.
exports.permanentlyDeleteItem = async (req, res, next) => {
	try {
		const { type, id } = req.params;
		const entry = REGISTRY[type];
		if (!entry) return res.status(400).json({ message: 'Unknown item type' });

		const doc = await entry.model.findOneAndDelete({ _id: id, deletedAt: { $ne: null } });
		if (!doc) return res.status(404).json({ message: 'Item not found in Recycle Bin' });

		res.json({ success: true, message: `${entry.label} permanently deleted` });
	} catch (err) {
		next(err);
	}
};

// Permanently delete everything in the bin, optionally scoped to one type.
exports.emptyTrash = async (req, res, next) => {
	try {
		const { type } = req.query;
		const types = type && REGISTRY[type] ? [type] : Object.keys(REGISTRY);

		let deletedCount = 0;
		for (const t of types) {
			const entry = REGISTRY[t];
			const result = await entry.model.deleteMany({ deletedAt: { $ne: null } });
			deletedCount += result.deletedCount || 0;
		}

		res.json({ success: true, message: `${deletedCount} item(s) permanently deleted` });
	} catch (err) {
		next(err);
	}
};

// Used by the startup/24h cleanup job — not an HTTP handler.
exports.purgeExpired = async () => {
	const cutoff = new Date(Date.now() - RECYCLE_BIN_RETENTION_DAYS * 24 * 60 * 60 * 1000);
	let totalDeleted = 0;
	for (const entry of Object.values(REGISTRY)) {
		const result = await entry.model.deleteMany({ deletedAt: { $ne: null, $lt: cutoff } });
		totalDeleted += result.deletedCount || 0;
	}
	return totalDeleted;
};
