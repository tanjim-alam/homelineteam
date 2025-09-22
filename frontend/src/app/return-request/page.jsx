'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '../../contexts/UserContext';
import apiService from '../../services/api';
import ReturnRequestForm from '../../components/ReturnRequestForm';
import { AlertCircle, ArrowLeft } from 'lucide-react';

function ReturnRequestContent() {
    const { user, isAuthenticated, loading: authLoading } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isAuthenticated, authLoading, router]);

    useEffect(() => {
        if (isAuthenticated && orderId) {
            fetchOrder();
        }
    }, [isAuthenticated, orderId]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch the actual order from the API
            const response = await apiService.getOrderById(orderId);

            if (response.success) {
                setOrder(response.data);
            } else {
                setError(response.message || 'Failed to load order details');
            }
        } catch (err) {
            setError(err.message || 'Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = (returnData) => {
        // Redirect to returns page or show success message
        router.push('/my-returns');
    };

    const handleClose = () => {
        router.back();
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Order</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/my-orders')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
                    <p className="text-gray-600 mb-6">The order you're looking for could not be found.</p>
                    <button
                        onClick={() => router.push('/my-orders')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <ReturnRequestForm
            order={order}
            onClose={handleClose}
            onSuccess={handleSuccess}
        />
    );
}

export default function ReturnRequestPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <ReturnRequestContent />
        </Suspense>
    );
}
