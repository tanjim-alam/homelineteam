const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const Return = require('../models/Return');

// Get dashboard analytics
exports.getDashboardAnalytics = async (req, res, next) => {
    try {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const endOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

        // Get all orders for this month
        const thisMonthOrders = await Order.find({
            createdAt: { $gte: startOfMonth }
        });

        // Get all orders for last month
        const lastMonthOrders = await Order.find({
            createdAt: {
                $gte: startOfLastMonth,
                $lte: endOfLastMonth
            }
        });

        // Calculate this month's revenue
        const thisMonthRevenue = thisMonthOrders.reduce((total, order) => total + (order.totalAmount || 0), 0);

        // Calculate last month's revenue
        const lastMonthRevenue = lastMonthOrders.reduce((total, order) => total + (order.totalAmount || 0), 0);

        // Calculate revenue growth percentage
        const revenueGrowth = lastMonthRevenue > 0
            ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
            : 0;

        // Get order count growth
        const orderCountGrowth = lastMonthOrders.length > 0
            ? ((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100
            : 0;

        // Get daily revenue for the last 30 days
        const dailyRevenue = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
        ]);

        // Get orders by status
        const ordersByStatus = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get top selling products
        const topProducts = await Order.aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productId',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $unwind: '$product'
            },
            {
                $project: {
                    productName: '$product.name',
                    productImage: '$product.images.0',
                    totalQuantity: 1,
                    totalRevenue: 1
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
        ]);

        // Get total counts
        const totalProducts = await Product.countDocuments();
        const totalCategories = await Category.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalReturns = await Return.countDocuments();

        // Get recent orders
        const recentOrders = await Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                overview: {
                    totalProducts,
                    totalCategories,
                    totalUsers,
                    totalOrders,
                    totalReturns,
                    thisMonthOrders: thisMonthOrders.length,
                    thisMonthRevenue,
                    lastMonthOrders: lastMonthOrders.length,
                    lastMonthRevenue,
                    revenueGrowth: Math.round(revenueGrowth * 100) / 100,
                    orderCountGrowth: Math.round(orderCountGrowth * 100) / 100
                },
                charts: {
                    dailyRevenue,
                    ordersByStatus,
                    topProducts
                },
                recentOrders
            }
        });

    } catch (error) {
        next(error);
    }
};

// Get route information
exports.getRouteInfo = async (req, res, next) => {
    try {
        const routes = [
            {
                method: 'GET',
                path: '/api/health',
                description: 'Health check endpoint',
                category: 'System'
            },
            {
                method: 'GET',
                path: '/api/categories',
                description: 'Get all categories',
                category: 'Categories'
            },
            {
                method: 'POST',
                path: '/api/categories',
                description: 'Create new category',
                category: 'Categories'
            },
            {
                method: 'GET',
                path: '/api/categories/hierarchical',
                description: 'Get hierarchical categories',
                category: 'Categories'
            },
            {
                method: 'GET',
                path: '/api/main-categories',
                description: 'Get all main categories',
                category: 'Categories'
            },
            {
                method: 'POST',
                path: '/api/main-categories',
                description: 'Create new main category',
                category: 'Categories'
            },
            {
                method: 'GET',
                path: '/api/products',
                description: 'Get all products',
                category: 'Products'
            },
            {
                method: 'POST',
                path: '/api/products',
                description: 'Create new product',
                category: 'Products'
            },
            {
                method: 'GET',
                path: '/api/products/category/:categoryId',
                description: 'Get products by category',
                category: 'Products'
            },
            {
                method: 'GET',
                path: '/api/orders',
                description: 'Get all orders',
                category: 'Orders'
            },
            {
                method: 'POST',
                path: '/api/orders',
                description: 'Create new order',
                category: 'Orders'
            },
            {
                method: 'GET',
                path: '/api/orders/user/:userId',
                description: 'Get user orders',
                category: 'Orders'
            },
            {
                method: 'PATCH',
                path: '/api/orders/:id/status',
                description: 'Update order status',
                category: 'Orders'
            },
            {
                method: 'PATCH',
                path: '/api/orders/:id/payment-status',
                description: 'Update payment status',
                category: 'Orders'
            },
            {
                method: 'POST',
                path: '/api/users/register',
                description: 'User registration',
                category: 'Authentication'
            },
            {
                method: 'POST',
                path: '/api/users/login',
                description: 'User login',
                category: 'Authentication'
            },
            {
                method: 'POST',
                path: '/api/users/verify-email',
                description: 'Verify email with OTP',
                category: 'Authentication'
            },
            {
                method: 'POST',
                path: '/api/users/forgot-password',
                description: 'Request password reset',
                category: 'Authentication'
            },
            {
                method: 'POST',
                path: '/api/users/reset-password',
                description: 'Reset password',
                category: 'Authentication'
            },
            {
                method: 'GET',
                path: '/api/users/profile',
                description: 'Get user profile',
                category: 'Authentication'
            },
            {
                method: 'PUT',
                path: '/api/users/profile',
                description: 'Update user profile',
                category: 'Authentication'
            },
            {
                method: 'GET',
                path: '/api/returns',
                description: 'Get all returns',
                category: 'Returns'
            },
            {
                method: 'POST',
                path: '/api/returns',
                description: 'Create return request',
                category: 'Returns'
            },
            {
                method: 'GET',
                path: '/api/returns/admin/products',
                description: 'Get returns for admin with product details',
                category: 'Returns'
            },
            {
                method: 'PATCH',
                path: '/api/returns/:id/status',
                description: 'Update return status',
                category: 'Returns'
            },
            {
                method: 'GET',
                path: '/api/analytics/dashboard',
                description: 'Get dashboard analytics',
                category: 'Analytics'
            },
            {
                method: 'GET',
                path: '/api/analytics/routes',
                description: 'Get API route information',
                category: 'Analytics'
            }
        ];

        // Group routes by category
        const groupedRoutes = routes.reduce((acc, route) => {
            if (!acc[route.category]) {
                acc[route.category] = [];
            }
            acc[route.category].push(route);
            return acc;
        }, {});

        res.json({
            success: true,
            data: {
                totalRoutes: routes.length,
                categories: Object.keys(groupedRoutes),
                routes: groupedRoutes
            }
        });

    } catch (error) {
        next(error);
    }
};
