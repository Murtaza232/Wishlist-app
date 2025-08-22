import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiCalendar, FiRefreshCw, FiDollarSign, FiPackage } from 'react-icons/fi';
import { useCustomer } from '../../hooks/useCustomer';
import { useWishlist } from '../../hooks/useWishlist';
import { useShop } from '../../hooks/useShop';
import { useLanguage } from '../../components';
import { Frame, Layout } from '@shopify/polaris';

const CustomerDetails = () => {
    const { id } = useParams();
    const { customer, loading: customerLoading, error: customerError, refetch: refetchCustomer } = useCustomer(id);
    const { wishlistItems, loading: wishlistLoading, error: wishlistError, refetch: refetchWishlist } = useWishlist();
    const { shop: shopData, loading: shopLoading } = useShop(customer?.shop_id);
    const [shopifyCustomerId, setShopifyCustomerId] = useState(null);
    const [activeTab, setActiveTab] = useState('orders');
    const [initialLoad, setInitialLoad] = useState(true);
    const { t } = useLanguage();

    // Get the shop domain from shop data or use current domain as fallback
    const shopDomain = useMemo(() => {
        return shopData?.myshopify_domain || window.location.hostname;
    }, [shopData]);

    // Format customer data for display (without wishlistItems)
    const customerData = useMemo(() => {
        if (!customer) return null;
        console.log('Raw customer object:', customer);

        return {
            name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || t('No Name', 'Customer Details'),
            email: customer.email || t('No email', 'Customer Details'),
            phone: customer.phone || t('N/A', 'Customer Details'),
            location: [customer.city, customer.country]
                .filter(Boolean)
                .join(', ') || t('No location', 'Customer Details'),
            // Use the status field from the customer object
            status: (() => {
                const rawStatus = customer.status; // Using the status field directly
                console.log('Raw status from API:', rawStatus, 'type:', typeof rawStatus);

                // Normalize the status
                if (!rawStatus) return 'inactive';
                const lowerStatus = String(rawStatus).toLowerCase().trim();

                if (['enabled', 'active', '1', 'true', 'yes'].includes(lowerStatus)) return 'active';
                if (['disabled', '0', 'false', 'no'].includes(lowerStatus)) return 'disabled';
                return 'inactive'; // Default to inactive if status is not recognized
            })(),
            joinDate: customer.created_at,
            totalSpent: customer.total_spent || 0,
            totalOrders: customer.orders_count || 0,
            shop: customer.shop || ''
        };
    }, [customer]);

    // Debug log to check customer data structure
    useEffect(() => {
        if (customer) {
            console.log('Customer data structure:', customer);
            console.log('Available customer fields:', Object.keys(customer).join(', '));
            if (customer.shop) {
                console.log('Shop field exists:', customer.shop);
            } else {
                console.log('No shop field found in customer data');
            }
        }
    }, [customer]);

    // Fetch wishlist only after customer data is loaded
    useEffect(() => {
        if (customer && initialLoad) {
            // Use the shopify_customer_id for the wishlist API
            const shopifyCustomerId = customer.shopify_customer_id;
            console.log('Shopify Customer ID:', shopifyCustomerId, 'Type:', typeof shopifyCustomerId);

            if (shopifyCustomerId) {
                console.log('Fetching wishlist for customer ID:', shopifyCustomerId);
                setShopifyCustomerId(shopifyCustomerId);
                refetchWishlist(shopifyCustomerId);
                setInitialLoad(false);
            } else {
                console.error('No Shopify customer ID found in customer data');
            }
        }
    }, [customer, initialLoad, refetchWishlist]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PKR',
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (customerLoading) {
        return (
            <Frame>
                <div style={{ background: '#F6F7F9', minHeight: '100vh' }}>
                    <Layout>
                        <Layout.Section>
                            <div className="p-6">
                                <div className="animate-pulse space-y-4">
                                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-64 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        </Layout.Section>
                    </Layout>
                </div>
            </Frame>
        );
    }

    if (customerError) {
        return (
            <Frame>
                <div style={{ background: '#F6F7F9', minHeight: '100vh' }}>
                    <Layout>
                        <Layout.Section>
                            <div className="p-6">
                                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">
                                                {customerError}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Layout.Section>
                    </Layout>
                </div>
            </Frame>
        );
    }

    if (!customerData) {
        return (
            <Frame>
                <div style={{ background: '#F6F7F9', minHeight: '100vh' }}>
                    <Layout>
                        <Layout.Section>
                            <div className="p-6">
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-700">
                                                {t('Customer not found', 'Customer Details')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Layout.Section>
                    </Layout>
                </div>
            </Frame>
        );
    }

    return (
        <Frame>
            <div style={{ minHeight: '100vh' }}>
                <Layout>
                    <Layout.Section>
                        <div className="p-6">
                            {/* Header */}
                            <div className="mb-6">
                                <div className="flex items-center">
                                    {/* <h1 style={{ fontWeight: 600, fontSize: 20 }}>{t('Customer Details', 'Customer Details')}</h1> 
                                    */}
                                    <div style={{
                                        fontSize: 20,
                                        fontWeight: 700,
                                        margin: 0,
                                        color: '#222',
                                        letterSpacing: 0.5,
                                        alignItems: 'center',
                                        width: '100%'
                                    }}>
                                        {t('Customer Details', 'Customer Details')}
                                        <br />
                                        <span style={{ fontSize: 13, color: '#555', fontWeight: 400, maxWidth: 700, marginTop: 2 }}>{t('Customer Details subtitle', 'Customer Details')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                                            <FiDollarSign className="h-6 w-6" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">{t('Total Spent', 'Customer Details')}</p>
                                            <p className="text-2xl font-semibold">{formatCurrency(customerData.totalSpent)}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <div className="p-3 rounded-full bg-green-100 text-green-600">
                                            <FiPackage className="h-6 w-6" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">{t('Total Wishlist Items', 'Customer Details')}</p>
                                            <p className="text-2xl font-semibold">{wishlistItems?.length || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow p-6">
                                    <div className="flex items-center">
                                        <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                                            <FiCalendar className="h-6 w-6" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-500">{t('Member Since', 'Customer Details')}</p>
                                            <p className="text-lg font-semibold">{formatDate(customerData.joinDate)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Wishlist */}
                                <div className="lg:col-span-2">
                                    <div className="bg-white rounded-lg shadow overflow-hidden">
                                        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                                            <h3 className="text-lg font-medium text-gray-900">{t('Wishlist Items', 'Customer Details')}</h3>
                                            <button
                                                onClick={() => shopifyCustomerId && refetchWishlist(shopifyCustomerId)}
                                                disabled={wishlistLoading || !shopifyCustomerId}
                                                className="px-4 py-2 border border-gray-300 rounded-lg flex items-center text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <FiRefreshCw className={`mr-2 ${wishlistLoading ? 'animate-spin' : ''}`} />
                                                {wishlistLoading ? t('Refreshing...', 'Customer Details') : t('Refresh Wishlists', 'Customer Details')}
                                            </button>
                                        </div>
                                        <div className="p-6">
                                            {wishlistLoading ? (
                                                <div className="space-y-4">
                                                    {[1, 2, 3].map((i) => (
                                                        <div key={i} className="flex items-center p-4 border border-gray-100 rounded-lg">
                                                            <div className="animate-pulse flex space-x-4 w-full">
                                                                <div className="rounded-full bg-gray-200 h-16 w-16"></div>
                                                                <div className="flex-1 space-y-2 py-1">
                                                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : wishlistError ? (
                                                <div className="text-center py-8">
                                                    <div className="text-red-500 mb-2">Error loading wishlist: {wishlistError}</div>
                                                    <button
                                                        onClick={refetchWishlist}
                                                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                    >
                                                        Retry
                                                    </button>
                                                </div>
                                            ) : wishlistItems && wishlistItems.length > 0 ? (
                                                <div className="space-y-4">
                                                    {wishlistItems.map((item) => (
                                                        <div key={item.id} className="flex items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                                                            <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-md overflow-hidden">
                                                                <img
                                                                    src={item.image}
                                                                    alt={item.name}
                                                                    className="h-full w-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = 'https://via.placeholder.com/80';
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="ml-4 flex-1">
                                                                <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                                                                <p className="text-sm text-gray-500">{t('Added on', 'Customer Details')} {formatDate(item.addedDate)}</p>
                                                                <p className="mt-1 text-sm font-medium text-gray-900">{formatCurrency(item.price)}</p>
                                                            </div>
                                                            <a
                                                                href={`https://${shopDomain}/products/${item.handle}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="ml-4 text-blue-600 hover:text-blue-800"
                                                                title="View Product"
                                                                onClick={(e) => {
                                                                    if (!item.handle) {
                                                                        e.preventDefault();
                                                                        console.error('Product handle is missing');
                                                                    }
                                                                }}
                                                            >
                                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                </svg>
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8">
                                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                    <h3 className="mt-2 text-sm font-medium text-gray-900">{t('No wishlist items.', 'Customer Details')}</h3>
                                                    <p className="mt-1 text-sm text-gray-500">{t('No Wishlist items desc', 'Customer Details')}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Information */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white rounded-lg shadow overflow-hidden">
                                        <div className="px-6 py-5 border-b border-gray-200">
                                            <h3 className="text-lg font-medium text-gray-900">{t('Customer Information', 'Customer Details')}</h3>
                                        </div>
                                        <div className="px-6 py-5">
                                            <div className="flex items-center mb-6">
                                                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-600">
                                                    {customerData?.name?.charAt(0) || '?'}
                                                </div>
                                                <div className="ml-4">
                                                    <h4 className="text-lg font-semibold">{customerData?.name || t('No Name', 'Customer Details')}</h4>
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customerData?.status === 'active'
                                                                ? 'bg-green-100 text-green-800'
                                                                : customerData?.status === 'disabled'
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                    >
                                                        {customerData?.status ?
                                                            t(customerData.status.charAt(0).toUpperCase() + customerData.status.slice(1), 'Customer Details') :
                                                            t('Unknown', 'Customer Details')}
                                                        {customer?.state && ` (${customer.state})`}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-start">
                                                    <FiMail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">{t('Email', 'Customer Details')}</p>
                                                        <p className="text-sm text-gray-900 break-all">{customerData.email}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start">
                                                    <FiPhone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">{t('Phone', 'Customer Details')}</p>
                                                        <p className="text-sm text-gray-900">{customerData.phone || 'N/A'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start">
                                                    <FiMapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">{t('Location', 'Customer Details')}</p>
                                                        <p className="text-sm text-gray-900">{customerData.location}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start">
                                                    <FiCalendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">{t('Member Since', 'Customer Details')}</p>
                                                        <p className="text-sm text-gray-900">{formatDate(customerData.joinDate)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Layout.Section>
                </Layout>
            </div>
        </Frame>
    );
};

export default CustomerDetails;
