import React, { useState } from 'react';
import { FiSearch, FiFilter, FiDownload, FiMoreVertical, FiRefreshCw, FiPlus, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { BsThreeDotsVertical, BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import { useCustomers } from '../hooks';
import { useLanguage } from '../components';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const { t } = useLanguage();
  
  const {
    customers,
    loading,
    error,
    pagination,
    stats,
    fetchCustomers,
    syncCustomers,
    deleteCustomer,
    setError
  } = useCustomers();

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers(1, searchTerm, statusFilter);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    fetchCustomers(1, searchTerm, status);
  };

  // Handle page change
  const handlePageChange = (page) => {
    fetchCustomers(page, searchTerm, statusFilter);
  };

  // Handle sync from Shopify
  const handleSync = async () => {
    try {
      await syncCustomers();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  // Handle customer deletion
  // const handleDeleteCustomer = async (customerId) => {
  //   if (window.confirm(t('Are you sure you want to delete this customer?', 'Customers'))) {
  //     try {
  //       await deleteCustomer(customerId);
  //     } catch (error) {
  //       console.error(t('Delete failed:', 'Customers'), error);
  //     }
  //   }
  // };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    fetchCustomers(1, '', '');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR',
    }).format(amount || 0);
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return t('Active', 'Customers');
      case 'inactive':
        return t('Inactive', 'Customers');
      case 'disabled':
        return t('Disabled', 'Customers');
      default:
        return status;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'disabled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 style={{ fontWeight: 600, fontSize: 20}}>{t('Customers', 'Sidebar Tabs')}</h1>
            <p className="text-sm text-gray-500">{t('View your store customers', 'Customers')}</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={handleSync}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-lg flex items-center text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? t('Syncing...', 'Customers') : t('Sync from Shopify', 'Customers')}
            </button>
            {/* <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center">
              <FiPlus className="mr-2" />
              Add Customer
            </button> */}
          </div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1,2,3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-200 rounded-lg w-10 h-10" />
                  <div className="ml-4">
                    <div className="h-4 bg-gray-200 rounded w-28 mb-2" />
                    <div className="h-6 bg-gray-300 rounded w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{t('Total Customers', 'Customers')}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total_customers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{t('Active Customers', 'Customers')}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.active_customers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{t('Total Revenue', 'Customers')}</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.total_revenue)}</p>
                </div>
              </div>
            </div>
            
            {/* <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg Order Value</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.avg_order_value)}</p>
                </div>
              </div>
            </div> */}
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={t('Search by name or email', 'Customers')}
              />
            </div>
            <div className="flex space-x-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowStatusFilter(!showStatusFilter)}
                  className="px-4 py-2 border border-gray-300 rounded-lg flex items-center text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FiFilter className="mr-2" />
                  {statusFilter ? `${t('Status', 'Customers')}: ${getStatusText(statusFilter)}` : t('Filter', 'Customers')}
                </button>
                {showStatusFilter && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => handleStatusFilterChange('')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {t('All Statuses', 'Customers')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusFilterChange('active')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {t('Active', 'Customers')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusFilterChange('inactive')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {t('Inactive', 'Customers')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusFilterChange('disabled')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {t('Disabled', 'Customers')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {(searchTerm || statusFilter) && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  {t('Clear', 'Customers')}
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                {t('Search', 'Customers')}
              </button>
            </div>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
                {error.includes('Shop session not found') && (
                  <div className="mt-2 text-sm text-red-700">
                    <p><strong>{t('How to fix this:', 'Customers')}</strong></p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>{t('Make sure you\'re accessing this app from within Shopify', 'Customers')}</li>
                      <li>{t('Ensure your app is properly installed and authenticated', 'Customers')}</li>
                      <li>{t('Try refreshing the page or re-installing the app', 'Customers')}</li>
                      <li>{t('Contact support if the issue persists', 'Customers')}</li>
                    </ul>
                  </div>
                )}
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex text-red-400 hover:text-red-600"
                >
                  <span className="sr-only">{t('Dismiss', 'Customers')}</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Customer', 'Customers')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Location', 'Customers')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Spent', 'Customers')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Orders', 'Customers')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('Status', 'Customers')}
                  </th>
                  {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Added
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">{t('Actions', 'Customers')}</span>
                  </th> */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  [...Array(6)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200" />
                          <div className="ml-4">
                            <div className="h-4 bg-gray-200 rounded w-40 mb-2" />
                            <div className="h-3 bg-gray-100 rounded w-32" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-28" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-20" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-10" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-5 bg-gray-200 rounded-full w-16" />
                      </td>
                    </tr>
                  ))
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      {searchTerm || statusFilter ? t('No customers found matching your criteria.', 'Customers') : t('No customers found. Sync from Shopify to get started.', 'Customers')}
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link to={`/customers/${customer.id}`} className="group flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 font-medium text-sm">
                                {customer.first_name?.[0] || customer.last_name?.[0] || '?'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                                {customer.first_name && customer.last_name 
                                  ? `${customer.first_name} ${customer.last_name}`
                                  : customer.email.split('@')[0]
                                }
                              </div>
                              <FiChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {customer.city && customer.country 
                            ? `${customer.city}, ${customer.country}`
                            : customer.country || t('Unknown', 'Customers')
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(customer.total_spent)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.orders_count || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(customer.status || 'inactive')}`}>
                          {getStatusText(customer.status || 'inactive')}
                        </span>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(customer.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end">
                          <button className="text-gray-400 hover:text-gray-600">
                            <FiMoreVertical className="h-5 w-5" />
                          </button>
                        </div>
                      </td> */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button 
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button 
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    {t('Showing', 'Customers')} <span className="font-medium">{((pagination.current_page - 1) * pagination.per_page) + 1}</span> {t('to', 'Customers')}{' '}
                    <span className="font-medium">
                      {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                    </span> {t('of', 'Customers')}{' '}
                    <span className="font-medium">{pagination.total}</span> {t('results', 'Customers')}
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button 
                      onClick={() => handlePageChange(pagination.current_page - 1)}
                      disabled={pagination.current_page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">{t('Previous', 'Customers')}</span>
                      <BsArrowLeft className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handlePageChange(pagination.current_page + 1)}
                      disabled={pagination.current_page === pagination.last_page}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="sr-only">{t('Next', 'Customers')}</span>
                      <BsArrowRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customers;