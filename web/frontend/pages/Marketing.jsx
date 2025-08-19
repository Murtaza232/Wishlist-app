import React, { useState, useEffect, useContext } from 'react';
import {
  Page,
  Frame,
  Layout,
  Card,
  Text,
  Button,
  InlineStack,
  Box,
  Badge,
  Icon,
  Divider,
  LegacyStack,
  Popover,
  ActionList,
  Modal,
  TextField
} from '@shopify/polaris';
import wishlistwin from '../assets/wishlistwin.webp';
import {
  LightbulbIcon,
  CheckIcon,
  HeartIcon,
  CartIcon,
  ArrowRightIcon,ImportIcon,PersonIcon,CalendarIcon
} from '@shopify/polaris-icons';
import { useLanguage } from "../components";
import { useMarketingAnalytics } from '../hooks/useMarketingAnalytics';
import DateRangePicker from '../components/DateRangePicker';
import { AppContext } from "../components";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import { useNavigate } from 'react-router-dom';
import { getSessionToken } from "@shopify/app-bridge-utils";
import Skelton from '../components/Skelton';

export default function Marketing() {
  const { t } = useLanguage();
  const { 
    analytics, 
    loading, 
    error, 
    dateRange, 
    updateDateRange 
  } = useMarketingAnalytics();

  // State for date picker
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Download UI state
  const [activePopover, setActivePopover] = useState(null); // segment key string
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadEmail, setDownloadEmail] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadSegment, setDownloadSegment] = useState(null);
  const { apiUrl } = useContext(AppContext);
  const authFetch = useAuthenticatedFetch();
  const navigate = useNavigate();

  const [activeCampaign, setActiveCampaign] = useState(null);
  const [checkingCampaign, setCheckingCampaign] = useState(false);
  const [subscriptionStatusMap, setSubscriptionStatusMap] = useState({});
  const [campaign, setCampaign] = useState(null);
  const [metrics, setMetrics] = useState({ total_signups: 0, wishlisted_shoppers: 0, wishlist_actions: 0, wishlist_value: 0 });
  useEffect(() => {
    const load = async () => {
      try {
        setCheckingCampaign(true);
        const res = await authFetch(`${apiUrl}campaigns/current`);
        const json = await res.json();
        if (json?.success && json?.data?.campaign) setActiveCampaign(json.data.campaign);
        else setActiveCampaign(null);
      } catch (e) {
        setActiveCampaign(null);
      } finally {
        setCheckingCampaign(false);
      }
    };
    load();
  }, [apiUrl]);

  // Fetch subscription notifications to power status and last-updated columns
  useEffect(() => {
    const loadSubs = async () => {
      try {
        const res = await authFetch(`${apiUrl}subscription-notifications`);
        if (!res?.ok) return;
        const json = await res.json();
        const list = json?.subscription_notifications || [];
        const map = {};
        list.forEach(n => {
          const key = n?.notification_type || (n?.title || '').toLowerCase();
          map[key] = {
            active_status: Number(n?.active_status) === 1 || n?.active_status === true,
            updated_at: n?.updated_at,
            title: n?.title
          };
        });
        setSubscriptionStatusMap(map);
      } catch (_) {}
    };
    loadSubs();
  }, [apiUrl]);
  useEffect(() => {
  const fetchCurrentCampaign = async () => {
    try {
      const res = await authFetch(`${apiUrl}campaigns/current`);
      const json = await res.json();
      if (json?.success && json?.data?.campaign) {
        const c = json.data.campaign;
        setCampaign(c);
        setMetrics(json.data.metrics || metrics);
        // hydrate fields
        if (c.start_date && c.end_date) {
          setDateRange({ start: new Date(c.start_date), end: new Date(c.end_date) });
        }
        if (typeof c.total_winners !== 'undefined' && c.total_winners !== null) setWinners(String(c.total_winners));
        if (typeof c.voucher_amount !== 'undefined' && c.voucher_amount !== null) setVoucher(String(c.voucher_amount));
      } else {
        setCampaign(null);
      }
    } catch (e) {
      // ignore
    } finally {
      setIsLoadingCampaign(false);
    }
  };  }, [apiUrl]);
  // Helper function to get icon component by name
  const getIconComponent = (iconName) => {
    const iconMap = {
      'PersonIcon': PersonIcon,
      'HeartIcon': HeartIcon,
      'CartIcon': CartIcon
    };
    return iconMap[iconName] || PersonIcon;
  };
  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '₱0';
    return '₱' + Number(amount).toLocaleString();
  };

  // Infer a status label for activities when subscription mapping is absent
  const getStatusLabel = (activity) => {
    if (!activity) return 'Off';
    const raw = activity.status ?? activity.active_status ?? activity.is_active ?? activity.enabled ?? activity.state ?? '';
    if (typeof raw === 'boolean') return raw ? 'Live' : 'Off';
    const s = String(raw).toLowerCase();
    if (['live', 'active', 'on', 'enabled', 'running'].includes(s)) return 'Live';
    if (['off', 'inactive', 'disabled', 'paused', 'stopped', 'draft'].includes(s)) return 'Off';

    // Time-based fallback
    const now = new Date();
    const start = activity.start_time || activity.start_at || activity.scheduled_time || activity.scheduled_at;
    const end = activity.end_time || activity.end_at;
    const startDate = start ? new Date(start) : null;
    const endDate = end ? new Date(end) : null;
    if (startDate && startDate <= now && (!endDate || endDate > now)) return 'Live';
    return 'Off';
  };

  // Handle date range change
  const handleDateRangeChange = ({ start, end }) => {
    updateDateRange(start, end);
  };

  // Handle range select
  const handleRangeSelect = ({ start, end, range }) => {
    updateDateRange(start, end);
  };

  const handleViewActivity = (activity) => {
    // Navigate to the relevant configuration page by type
    switch (activity.type) {
      case 'wishlist_reminder':
        navigate('/wishlist-reminder');
        break;
      case 'price_drop_alert':
        navigate('/price-drop-alert');
        break;
      case 'back_in_stock_alert':
        navigate('/back-in-stock-alert');
        break;
      case 'low_stock_alert':
        navigate('/lowStockAlert');
        break;
      case 'saved_for_later_reminder':
        navigate('/savedForLater');
        break;
      default:
        navigate('/notification');
    }
  };

  // Compute label for last 7 months from today or provided end date
  const formatDateShort = (d) => {
    if (!d) return '';
    const day = d.getDate();
    const month = d.toLocaleString('en-US', { month: 'short' });
    return `${day} ${month}`;
  };

  const getSevenMonthRange = () => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth() - 6, end.getDate() + 1);
    return { start, end };
  };

  const sevenMonthLabel = (() => {
    const { start, end } = getSevenMonthRange();
    return `Get data for ${formatDateShort(start)} - ${formatDateShort(end)}, ${end.getFullYear()}`;
  })();

  const handleOpenPopover = (segmentKey) => {
    setActivePopover(segmentKey);
  };

  const handleClosePopover = () => setActivePopover(null);

  const handleInitiateDownload = (segmentKey) => {
    setDownloadSegment(segmentKey);
    setDownloadModalOpen(true);
    setActivePopover(null);
  };

  // Backend call to request export and email
  const handleConfirmDownload = async () => {
    if (!downloadEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(downloadEmail)) {
      alert('Please enter a valid email address');
      return;
    }
    try {
      setDownloadLoading(true);
      const { start, end } = getSevenMonthRange();
      const payload = {
        email: downloadEmail,
        segment: downloadSegment,
        start_date: start.toISOString().slice(0, 10),
        end_date: end.toISOString().slice(0, 10)
      };
      // Use window.fetch directly; backend is mounted under /api
      await authFetch(`${apiUrl}marketing-analytics/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setDownloadModalOpen(false);
      setDownloadEmail('');
    } catch (e) {
      console.error('Export request failed', e);
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <Frame>
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto 0 auto',
          width: '100%',
          background: '#F3F3F3',
          borderTop: 'none',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          padding: 24,
          marginTop: 0,
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px'
        }}>
          <div>
        <div style={{
          fontSize: 20,
          fontWeight: 700,
          margin: 0,
          color: '#222',
          letterSpacing: 0.5,
          marginBottom: '8px'
        }}>
          {t('Marketing and Automations', 'Marketing')}
            </div>
            <span style={{ fontSize: 13, color: '#555', fontWeight: 400, maxWidth: 700 }}>
            {t('Marketing subtitle', 'Marketing')}
          </span>
        </div>

          {/* Date Range Picker */}
          <div style={{ minWidth: '300px' }}>
            {dateRange?.start && dateRange?.end && (
              <DateRangePicker
                startDate={dateRange.start}
                endDate={dateRange.end}
                onDateChange={handleDateRangeChange}
                onRangeSelect={handleRangeSelect}
                open={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                activator={
                  <Button 
                    size="slim" 
                    icon={CalendarIcon}
                    variant="tertiary"
                    onClick={() => setShowDatePicker(true)}
                  >
                    {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
                  </Button>
                }
              />
            )}
          </div>
        </div>

        {/* Loading State - show skeletons per section */}
        {loading && (
          <Layout>
            <Layout.Section>
              <Card>
                <Box padding="4">
                  <Skelton />
                </Box>
              </Card>
            </Layout.Section>
            <Layout.Section>
              <Card>
                <Box padding="4">
                  <Skelton />
                </Box>
              </Card>
            </Layout.Section>
            <Layout.Section>
              <Card>
                <Box padding="4">
                  <Skelton />
                </Box>
              </Card>
            </Layout.Section>
            <Layout.Section>
              <Card>
                <Box padding="4">
                  <Skelton />
                  <Skelton />
                  <Skelton />
                </Box>
              </Card>
            </Layout.Section>
            <Layout.Section>
              <Card>
                <Box padding="4">
                  <Skelton />
                  <Skelton />
                  <Skelton />
                </Box>
              </Card>
            </Layout.Section>
          </Layout>
        )}

        {/* Error State */}
        {error && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <Text variant="bodyMd" as="p" color="critical">
              Error loading marketing analytics: {error}
            </Text>
          </div>
        )}

        {/* Only show content when analytics are loaded */}
        {!loading && analytics && (
        <Layout>
          {/* Integration Status Section */}
          <Layout.Section>
            <Card>
              <Box padding="4">
                <InlineStack align="space-between">
                  <InlineStack gap="3" align="center">
                    {/* {analytics?.integration_status?.is_connected && (
                      <img
                        src={analytics?.integration_status?.provider_logo || 'https://static.swym.it/klaviyo.png'}
                        alt="provider"
                        style={{ width: 20, height: 20, objectFit: 'contain', borderRadius: 4 }}
                      />
                    )} */}
                    <Text variant="bodyMd" as="p">
                      {analytics?.integration_status?.is_connected 
                        ? <span><strong>{analytics.integration_status.provider_name || 'Smtp'}</strong>{` ${t('has been connected as your marketing integration for Email', 'Marketing')}`}</span>
                        : t('No marketing integration connected', 'Marketing')
                      }
                    </Text>
                  </InlineStack>
                  {/* Removed status badge per requirement */}
                </InlineStack>
                {analytics?.integration_status?.last_sync && (
                  <Box paddingBlockStart="2">
                    <Text variant="bodySm" as="p" color="subdued">
                      {t('Last synced', 'Marketing')}: {analytics.integration_status.last_sync}
                    </Text>
                  </Box>
                )}
              </Box>
            </Card>
          </Layout.Section>

          {/* Turn visitors into buyers section */}
          <Layout.Section>
              <Box padding="4">
                <Text variant="headingLg" as="h2" fontWeight="bold">
                  {t('Turn visitors into buyers', 'Marketing')}
                </Text>
                <Box paddingBlockStart="3" style={{ marginTop:10 }}>
                  <Text variant="bodyMd" as="p" color="subdued">
                    {t(`Boost sales with`, 'Marketing')} {analytics.integration_status.provider_name || 'Smtp'} {t(`marketing automations by re-engaging shoppers who show intent but leave without buying, using personalized product recommendations.`, 'Marketing')}
                  </Text>
                </Box>
              </Box>
          </Layout.Section>

          {/* Live campaign banner */}
          {activeCampaign && (
            <Layout.Section>
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: ' 0 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✨</div>
                    <Text variant="bodySm" as="p"><b>{t('Your', 'Marketing')} {activeCampaign?.title || 'Win Your Wishlist'} {t('campaign is now live!', 'Marketing')}</b> {t('You can monitor performance and see more details.', 'Marketing')}</Text>
                  </div>
                  <Button size="slim" onClick={() => navigate('/win-your-wishlist')}>{t('View Performance', 'Marketing')}</Button>
                </div>
            </Card>
          </Layout.Section>
          )}

                     {/* Win Your Wishlist Campaign Card */}
          {!activeCampaign && (
           <Layout.Section>
             <Card>
                  <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  minHeight: '200px'
                }}>
             {/* Left Side - Campaign Details */}
                  <div style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}>
                    {/* Top Banner */}
                    <div style={{
                      backgroundColor: '#E3F2FD',
                      borderRadius: '16px',
                      padding: '8px 12px',
                      marginBottom: '16px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      width: 'fit-content'
                    }}>
                      <Icon source={LightbulbIcon} tone="info" />
                      <Text variant="bodySm" as="span" fontWeight="medium" style={{ fontSize: '12px' }}>
                        {t('Launch a gifting campaign', 'Marketing')}
                      </Text>
                    </div>

                   {/* Campaign Title */}
                    <Text variant="headingLg" as="h2" fontWeight="bold" style={{ 
                      marginBottom: '12px',
                      fontSize: '22px',
                      lineHeight: '1.2'
                    }}>
                     {t('Win Your Wishlist Campaign', 'Marketing')}
                   </Text>

                   {/* Campaign Description */}
                    <Text variant="bodyMd" as="p" color="subdued" style={{ 
                      lineHeight: '1.4',
                      marginBottom: '20px',
                      fontSize: '14px'
                    }}>
                       {t('Gamify engagement', 'Marketing')}
                     </Text>

                   {/* Performance Metrics */}
                     <div style={{
                       backgroundColor: '#F6F6F7',
                       borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '16px'
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '8px'
                      }}>
                         {analytics?.performance_metrics?.map((metric, index) => (
                          <div key={index} style={{ 
                            textAlign: 'center',
                            padding: '8px 4px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Icon source={getIconComponent(metric.icon)} tone="subdued" />
                              <div style={{ marginLeft: 6 }}>
                                <Text variant="bodyMd" as="span" fontWeight="bold" style={{ fontSize: '14px' }}>
                                   {metric.value}
                                 </Text>
                                <div style={{ lineHeight: 1 }}>
                                <Text variant="bodySm" as="span" color="subdued" style={{ fontSize: '12px' }}>
                                    {t(metric.label, 'Marketing')}
                                 </Text>
                               </div>
                           </div>
                            </div>
                          </div>
                         )) || (
                           <div style={{ 
                             textAlign: 'center',
                             padding: '8px 4px',
                             gridColumn: 'span 3'
                           }}>
                             <Text variant="bodySm" as="span" color="subdued">
                               Loading performance metrics...
                             </Text>
                           </div>
                         )}
                      </div>
                     </div>

                   {/* Action Buttons */}
                   <InlineStack gap="2" align="start">
                      <Button 
                        variant="primary" 
                        size="medium"
                        onClick={() => navigate('/win-your-wishlist')}
                     
                        style={{
                          backgroundColor: '#111827',
                          color: '#fff',
                          border: '1px solid #0f172a',
                          fontWeight: 600,
                          padding: '10px 18px',
                          borderRadius: 8,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
                        }}
                      >
                       {t('Setup Campaign', 'Marketing')}
                     </Button>
                      {/* <Button 
                        variant="plain" 
                        size="small"
                        icon={ArrowRightIcon}
                        style={{
                          color: '#222',
                          fontWeight: '500'
                        }}
                      >
                       {t('Learn More', 'Marketing')}
                     </Button> */}
                   </InlineStack>
                  </div>

                 {/* Right Side - Campaign Preview Image */}
                 <div style={{
                   position: 'relative',
                   overflow: 'hidden',
                   borderRadius: '0 8px 8px 0',
                   display: 'flex',
                   justifyContent: 'flex-end',
                   alignItems: 'center'
                 }}>
                   <img 
                     src={wishlistwin} 
                     alt="Win Your Wishlist Campaign Preview"
                     style={{
                       width: '70%',
                       height: '80%',
                       objectFit: 'cover',
                       display: 'block'
                     }}
                   />
                 </div>
               </div>
             </Card>
           </Layout.Section>
          )}
                      {/* Shopper Segments Section */}
                      <Layout.Section>
             <Card>
               <Box padding="4">
                 {/* Header */}
                 <div style={{ marginBottom: '24px' }}>
                   <Text variant="headingLg" as="h2" fontWeight="bold" style={{ marginBottom: '8px' }}>
                     {t('Shopper Segments', 'Marketing')}
                   </Text>
                   <Text variant="bodyMd" as="p" color="subdued">
                     {t('Predesigned shopper segments', 'Marketing')}
                   </Text>
                 </div>

                 {/* Potential Revenue Alert */}
                 {analytics?.potential_revenue && (
                 <div style={{
                   backgroundColor: '#F6F6F7',
                   border: '1px solid #E1E3E5',
                   borderRadius: '8px',
                   padding: '16px',
                   marginBottom: '24px',
                   display: 'flex',
                   alignItems: 'center',
                   gap: '12px'
                 }}>
                   <div style={{
                     width: '24px',
                     height: '24px',
                     borderRadius: '50%',
                     backgroundColor: '#10B981',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     flexShrink: 0
                   }}>
                     <div style={{
                       width: '12px',
                       height: '12px',
                       backgroundColor: 'white',
                       borderRadius: '50%'
                     }} />
                   </div>
                   <div>
                     <Text variant="bodyMd" as="p" fontWeight="bold" style={{ marginBottom: '4px' }}>
                         {formatCurrency(analytics.potential_revenue.total_potential_revenue)} {t('in potential revenue is slipping away', 'Marketing')}
                     </Text>
                     <Text variant="bodyMd" as="p">
                         {t('from', 'Marketing')} {analytics.potential_revenue.products_count} {t('wishlisted products that', 'Marketing')} {analytics.potential_revenue.customers_count} {t('high-intent shoppers haven\'t purchased yet.', 'Marketing')}
                     </Text>
                   </div>
                 </div>
                 )}

                 {/* Shopper Segment Cards Grid */}
                 <div style={{
                   display: 'grid',
                   gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                   gap: '16px'
                 }}>
                   {/* Card 1: Haven't bought yet */}
                   <Card>
                     <div style={{ padding: '16px' }}>
                       <div>
                         <div style={{
                           display: 'flex',
                           justifyContent: 'space-between',
                           alignItems: 'flex-start',
                           marginBottom: '16px'
                         }}>
                           <Text variant="headingMd" as="h3" fontWeight="bold" style={{ 
                             fontSize: '15px',
                             lineHeight: '1.4',
                             flex: 1
                           }}>
                             {t('Shoppers who wishlisted and saved the products but', 'Marketing')}{' '}
                             <span style={{ color: '#111827' }}>{t('haven\'t bought yet', 'Marketing')}</span>
                           </Text>
                           <Popover
                             active={activePopover === 'havent_bought_yet'}
                             onClose={handleClosePopover}
                             activator={
                               <div onClick={() => handleOpenPopover('havent_bought_yet')} style={{
                             width: '32px',
                             height: '32px',
                             borderRadius: '6px',
                             backgroundColor: '#F3F4F6',
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             flexShrink: 0,
                                 marginLeft: '12px',
                                 cursor: 'pointer'
                           }}>
                             <Icon source={ImportIcon} tone="subdued" />
                           </div>
                             }
                           >
                             <ActionList
                               actionRole="menuitem"
                               items={[
                                 {
                                   content: 'Initiate new download',
                                   helpText: sevenMonthLabel,
                                   onAction: () => handleInitiateDownload('havent_bought_yet')
                                 },
                                //  { content: 'See help article', onAction: () => window.open('https://help.shopify.com', '_blank') }
                               ]}
                             />
                           </Popover>
                         </div>
                         <div style={{ marginBottom: '20px' }}>
                           <div style={{ 
                             display: 'flex', 
                             alignItems: 'center', 
                             marginBottom: '12px',
                             gap: '8px'
                           }}>
                             <div style={{
                               width: '24px',
                               height: '24px',
                               borderRadius: '4px',
                               backgroundColor: '#F3F4F6',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               flexShrink: 0
                             }}>
                               <Icon source={PersonIcon} tone="subdued" />
                             </div>
                             <Text variant="bodyMd" as="span" style={{ fontSize: '14px' }}>
                               {analytics?.shopper_segments?.havent_bought_yet?.shoppers_count || 0} {t('shoppers', 'Marketing')}
                             </Text>
                           </div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <div style={{
                               width: '24px',
                               height: '24px',
                               borderRadius: '4px',
                               backgroundColor: '#F3F4F6',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               flexShrink: 0
                             }}>
                               <Icon source={CartIcon} tone="subdued" />
                             </div>
                             <Text variant="bodyMd" as="span" style={{ fontSize: '14px' }}>
                               {formatCurrency(analytics?.shopper_segments?.havent_bought_yet?.wishlisted_value || 0)} {t('wishlisted value', 'Marketing')}
                             </Text>
                           </div>
                         </div>
                         <Button 
                           variant="primary" 
                           size="slim"
                           fullWidth
                           style={{
                             backgroundColor: '#F9FAFB',
                             color: '#111827',
                             border: '1px solid #E5E7EB',
                             fontWeight: '500',
                             borderRadius: '6px',
                             height: '36px',
                             marginTop: '16px'
                           }}
                         >
                           {t('Reach out to us to enable', 'Marketing')}
                         </Button>
                       </div>
                     </div>
                   </Card>

                    {/* Card 2: Currently on sale */}
                   <Card>
                     <div style={{ padding: '16px' }}>
                       <div>
                         <div style={{
                           display: 'flex',
                           justifyContent: 'space-between',
                           alignItems: 'flex-start',
                           marginBottom: '16px'
                         }}>
                           <Text variant="headingMd" as="h3" fontWeight="bold" style={{ 
                             fontSize: '15px',
                             lineHeight: '1.4',
                             flex: 1
                           }}>
                             {t('Shoppers whose wishlisted and saved products are', 'Marketing')}{' '}
                             <span style={{ color: '#111827' }}>{t('currently on sale', 'Marketing')}</span>
                           </Text>
                            <Popover
                              active={activePopover === 'currently_on_sale'}
                              onClose={handleClosePopover}
                              activator={
                                <div onClick={() => handleOpenPopover('currently_on_sale')} style={{
                             width: '32px',
                             height: '32px',
                             borderRadius: '6px',
                             backgroundColor: '#F3F4F6',
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             flexShrink: 0,
                                  marginLeft: '12px',
                                  cursor: 'pointer'
                           }}>
                             <Icon source={ImportIcon} tone="subdued" />
                           </div>
                              }
                            >
                              <ActionList
                                actionRole="menuitem"
                                items={[
                                  {
                                    content: 'Initiate new download',
                                    helpText: sevenMonthLabel,
                                    onAction: () => handleInitiateDownload('currently_on_sale')
                                  },
                                  // { content: 'See help article', onAction: () => window.open('https://help.shopify.com', '_blank') }
                                ]}
                              />
                            </Popover>
                         </div>
                         <div style={{ marginBottom: '20px' }}>
                           <div style={{ 
                             display: 'flex', 
                             alignItems: 'center', 
                             marginBottom: '12px',
                             gap: '8px'
                           }}>
                             <div style={{
                               width: '24px',
                               height: '24px',
                               borderRadius: '4px',
                               backgroundColor: '#F3F4F6',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               flexShrink: 0
                             }}>
                               <Icon source={PersonIcon} tone="subdued" />
                             </div>
                             <Text variant="bodyMd" as="span" style={{ fontSize: '14px' }}>
                               {analytics?.shopper_segments?.currently_on_sale?.shoppers_count || 0} {t('shoppers', 'Marketing')}
                             </Text>
                           </div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <div style={{
                               width: '24px',
                               height: '24px',
                               borderRadius: '4px',
                               border: '1px solid #E5E7EB',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               flexShrink: 0
                             }}>
                               <Icon source={CartIcon} tone="subdued" />
                             </div>
                             <Text variant="bodyMd" as="span" style={{ fontSize: '14px' }}>
                               {formatCurrency(analytics?.shopper_segments?.currently_on_sale?.wishlisted_value || 0)} {t('wishlisted value', 'Marketing')}
                             </Text>
                           </div>
                         </div>
                         <Button 
                           variant="primary" 
                           size="slim"
                           fullWidth
                           style={{
                             backgroundColor: '#F9FAFB',
                             color: '#111827',
                             border: '1px solid #E5E7EB',
                             fontWeight: '500',
                             borderRadius: '6px',
                             height: '36px',
                             marginTop: '16px'
                           }}
                         >
                           {t('Reach out to us to enable', 'Marketing')}
                         </Button>
                       </div>
                     </div>
                   </Card>

                                      {/* Card 3: Selling out fast */}
                   <Card>
                     <div style={{ padding: '16px' }}>
                       <div>
                         <div style={{
                           display: 'flex',
                           justifyContent: 'space-between',
                           alignItems: 'flex-start',
                           marginBottom: '16px'
                         }}>
                           <Text variant="headingMd" as="h3" fontWeight="bold" style={{ 
                             fontSize: '15px',
                             lineHeight: '1.4',
                             flex: 1
                           }}>
                             {t('Shoppers whose wishlisted and saved products are', 'Marketing')}{' '}
                             <span style={{ color: '#111827' }}>{t('selling out fast', 'Marketing')}</span>
                           </Text>
                           <Popover
                             active={activePopover === 'selling_out_fast'}
                             onClose={handleClosePopover}
                             activator={
                               <div onClick={() => handleOpenPopover('selling_out_fast')} style={{
                             width: '32px',
                             height: '32px',
                             borderRadius: '6px',
                             backgroundColor: '#F3F4F6',
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             flexShrink: 0,
                             marginLeft: '12px'
                           }}>
                             <Icon source={ImportIcon} tone="subdued" />
                           </div>
                             }
                           >
                             <ActionList
                               actionRole="menuitem"
                               items={[
                                 {
                                   content: 'Initiate new download',
                                   helpText: sevenMonthLabel,
                                   onAction: () => handleInitiateDownload('selling_out_fast')
                                 },
                                //  { content: 'See help article', onAction: () => window.open('https://help.shopify.com', '_blank') }
                               ]}
                             />
                           </Popover>
                         </div>
                         <div style={{ marginBottom: '20px' }}>
                           <div style={{ 
                             display: 'flex', 
                             alignItems: 'center', 
                             marginBottom: '12px',
                             gap: '8px'
                           }}>
                             <div style={{
                               width: '24px',
                               height: '24px',
                               borderRadius: '4px',
                               backgroundColor: '#F3F4F6',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               flexShrink: 0
                             }}>
                               <Icon source={PersonIcon} tone="subdued" />
                             </div>
                             <Text variant="bodyMd" as="span" style={{ fontSize: '14px' }}>
                                 {analytics?.shopper_segments?.selling_out_fast?.shoppers_count || 0} {t('shoppers', 'Marketing')}
                             </Text>
                           </div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <div style={{
                               width: '24px',
                               height: '24px',
                               borderRadius: '4px',
                               backgroundColor: '#F3F4F6',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               flexShrink: 0
                             }}>
                               <Icon source={CartIcon} tone="subdued" />
                             </div>
                             <Text variant="bodyMd" as="span" style={{ fontSize: '14px' }}>
                                 {formatCurrency(analytics?.shopper_segments?.selling_out_fast?.wishlisted_value || 0)} {t('wishlisted value', 'Marketing')}
                             </Text>
                           </div>
                         </div>
                         <Button 
                           variant="primary" 
                           size="slim"
                           fullWidth
                           style={{
                             backgroundColor: '#F9FAFB',
                             color: '#111827',
                             border: '1px solid #E5E7EB',
                             fontWeight: '500',
                             borderRadius: '6px',
                             height: '36px',
                             marginTop: '16px'
                           }}
                         >
                           {t('Reach out to us to enable', 'Marketing')}
                         </Button>
                       </div>
                     </div>
                   </Card>

                   {/* Card 4: Back in stock */}
                   <Card>
                     <div style={{ padding: '16px' }}>
                       <div>
                         <div style={{
                           display: 'flex',
                           justifyContent: 'space-between',
                           alignItems: 'flex-start',
                           marginBottom: '16px'
                         }}>
                           <Text variant="headingMd" as="h3" fontWeight="bold" style={{ 
                             fontSize: '15px',
                             lineHeight: '1.4',
                             flex: 1
                           }}>
                             {t('Shoppers whose wishlisted and saved products are', 'Marketing')}{' '}
                             <span style={{ color: '#111827' }}>{t('back in stock', 'Marketing')}</span>
                           </Text>
                           <Popover
                             active={activePopover === 'back_in_stock'}
                             onClose={handleClosePopover}
                             activator={
                               <div onClick={() => handleOpenPopover('back_in_stock')} style={{
                             width: '32px',
                             height: '32px',
                             borderRadius: '6px',
                             backgroundColor: '#F3F4F6',
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             flexShrink: 0,
                                 marginLeft: '12px',
                                 cursor: 'pointer'
                           }}>
                             <Icon source={ImportIcon} tone="subdued" />
                           </div>
                             }
                           >
                             <ActionList
                               actionRole="menuitem"
                               items={[
                                 {
                                   content: 'Initiate new download',
                                   helpText: sevenMonthLabel,
                                   onAction: () => handleInitiateDownload('back_in_stock')
                                 },
                                //  { content: 'See help article', onAction: () => window.open('https://help.shopify.com', '_blank') }
                               ]}
                             />
                           </Popover>
                         </div>
                         <div style={{ marginBottom: '20px' }}>
                           <div style={{ 
                             display: 'flex', 
                             alignItems: 'center', 
                             marginBottom: '12px',
                             gap: '8px'
                           }}>
                             <div style={{
                               width: '24px',
                               height: '24px',
                               borderRadius: '4px',
                               backgroundColor: '#F3F4F6',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               flexShrink: 0
                             }}>
                               <Icon source={PersonIcon} tone="subdued" />
                             </div>
                             <Text variant="bodyMd" as="span" style={{ fontSize: '14px' }}>
                               {analytics?.shopper_segments?.back_in_stock?.shoppers_count || 0} {t('shoppers', 'Marketing')}
                             </Text>
                           </div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                             <div style={{
                               width: '24px',
                               height: '24px',
                               borderRadius: '4px',
                               backgroundColor: '#F3F4F6',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               flexShrink: 0
                             }}>
                               <Icon source={CartIcon} tone="subdued" />
                             </div>
                             <Text variant="bodyMd" as="span" style={{ fontSize: '14px' }}>
                               {formatCurrency(analytics?.shopper_segments?.back_in_stock?.wishlisted_value || 0)} {t('wishlisted value', 'Marketing')}
                             </Text>
                           </div>
                         </div>
                         <Button 
                           variant="primary" 
                           size="slim"
                           fullWidth
                           style={{
                             backgroundColor: '#F9FAFB',
                             color: '#111827',
                             border: '1px solid #E5E7EB',
                             fontWeight: '500',
                             borderRadius: '6px',
                             height: '36px',
                             marginTop: '16px'
                           }}
                         >
                           {t('Reach out to us to enable', 'Marketing')}
                         </Button>
                       </div>
                     </div>
                   </Card>

                   {/* Card 5: Frequently wishlisted by others */}
                   <Card>
                     <div style={{ padding: '16px' }}>
                       <div>
                         <div style={{
                           display: 'flex',
                           justifyContent: 'space-between',
                           alignItems: 'flex-start',
                           marginBottom: '16px'
                         }}>
                           <Text variant="headingMd" as="h3" fontWeight="bold" style={{ 
                             fontSize: '15px',
                             lineHeight: '1.4',
                             flex: 1
                           }}>
                             {t('Shoppers whose wishlisted products are', 'Marketing')}{' '}
                             <span style={{ color: '#111827' }}>{t('frequently wishlisted by others', 'Marketing')}</span>
                           </Text>
                         </div>
                         <div style={{ marginBottom: '20px' }}>
                           <div style={{ 
                             display: 'flex', 
                             alignItems: 'flex-start', 
                             gap: '8px',
                             marginBottom: '12px'
                           }}>
                             {/* <div style={{
                               width: '24px',
                               height: '24px',
                               borderRadius: '4px',
                               backgroundColor: '#F3F4F6',
                               display: 'flex',
                               alignItems: 'center',
                               justifyContent: 'center',
                               flexShrink: 0,
                               marginTop: '2px'
                             }}>
                               <Icon source={CartIcon} tone="subdued" />
                             </div> */}
                             <Text variant="bodyMd" as="p" style={{ fontSize: '14px', lineHeight: '1.4' }}>
                               {t('Increase cart additions by promoting trending wishlist items', 'Marketing')}
                             </Text>
                           </div>
                      
                         </div>
                         <Button 
                           variant="primary" 
                           size="slim"
                           fullWidth
                           style={{
                             backgroundColor: '#F9FAFB',
                             color: '#111827',
                             border: '1px solid #E5E7EB',
                             fontWeight: '500',
                             borderRadius: '6px',
                             height: '36px',
                             marginTop: '16px'
                           }}
                         >
                           {t('Reach out to us to enable', 'Marketing')}
                         </Button>
                       </div>
                     </div>
                   </Card>
                 </div>
               </Box>
             </Card>
           </Layout.Section>

           {/* Recent Marketing Activity Section */}
           <Layout.Section>
             <Card>
               <Box padding="4">
                 {/* Header */}
                 <div style={{ marginBottom: '24px' }}>
                   <Text variant="headingLg" as="h2" fontWeight="bold" style={{ marginBottom: '8px' }}>
                     {t('Recent Marketing Activity', 'Marketing')}
                   </Text>
                   <Text variant="bodyMd" as="p" color="subdued">
                     {t('Get a quick review of how your campaigns and automations are performing here.', 'Marketing')}
                   </Text>
                 </div>

                 {/* Marketing Activity Table */}
                 <div style={{
                   backgroundColor: '#F9FAFB',
                   borderRadius: '8px',
                   border: '1px solid #E5E7EB',
                   overflow: 'hidden'
                 }}>
                   {/* Table Header */}
                   <div style={{
                     display: 'grid',
                     gridTemplateColumns: '2fr 1fr 1fr 1fr',
                     padding: '16px',
                     backgroundColor: '#F3F4F6',
                     borderBottom: '1px solid #E5E7EB',
                     fontWeight: '600',
                     fontSize: '14px',
                     color: '#374151'
                   }}>
                     <div>{t('Title', 'Marketing')}</div>
                     <div>{t('Status', 'Marketing')}</div>
                     <div>{t('Schedule Time', 'Marketing')}</div>
                     <div>{t('Last Updated', 'Marketing')}</div>
                     {/* <div>{t('Action', 'Marketing')}</div> */}
                   </div>

                   {/* Table Rows */}
                   {analytics?.marketing_activity?.map((activity, index) => (
                     <div key={index} style={{ 
                       borderBottom: index < analytics.marketing_activity.length - 1 ? '1px solid #E5E7EB' : 'none'
                     }}>
                     <div style={{
                       display: 'grid',
                       gridTemplateColumns: '2fr 1fr 1fr 1fr',
                       padding: '16px',
                       alignItems: 'center',
                       fontSize: '14px'
                     }}>
                       <div style={{ fontWeight: '500', color: '#111827' }}>
                           {activity.title}
                       </div>
                       <div>
                         <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: (() => {
                              const key = activity.type || (activity.title || '').toLowerCase();
                              const sub = subscriptionStatusMap[key];
                              const live = sub ? sub.active_status : getStatusLabel(activity) === 'Live';
                              return live ? '#D1FAE5' : '#F3F4F6';
                            })(),
                            color: (() => {
                              const key = activity.type || (activity.title || '').toLowerCase();
                              const sub = subscriptionStatusMap[key];
                              const live = sub ? sub.active_status : getStatusLabel(activity) === 'Live';
                              return live ? '#065F46' : '#374151';
                            })(),
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            <div style={{
                              width: '8px',
                              height: '8px',
                              backgroundColor: (() => {
                                const key = activity.type || (activity.title || '').toLowerCase();
                                const sub = subscriptionStatusMap[key];
                                const live = sub ? sub.active_status : getStatusLabel(activity) === 'Live';
                                return live ? '#10B981' : '#9CA3AF';
                              })(),
                              borderRadius: '50%'
                            }} />
                              {(() => {
                                const key = activity.type || (activity.title || '').toLowerCase();
                                const sub = subscriptionStatusMap[key];
                                return (sub && sub.active_status) ? 'Live' : 'Off';
                              })()}
                          </div>
                        </div>
                        <div style={{ color: '#6B7280' }}>
                            {(() => {
                              const key = activity.type || (activity.title || '').toLowerCase();
                              const sub = subscriptionStatusMap[key];
                              const raw = sub?.updated_at || activity.last_updated || activity.updated_at;
                              if (!raw) return '—';
                              const d = new Date(raw);
                              return isNaN(d.getTime()) ? String(raw) : d.toLocaleString();
                            })()}
                        </div>
                       <div>
                         <Button variant="tertiary" onClick={() => handleViewActivity(activity)}>
                           {t('View Details', 'Marketing')}
                         </Button>
                       </div>
                     </div>
                   </div>
                   )) || (
                     <div style={{
                       padding: '16px',
                       textAlign: 'center',
                       color: '#6B7280'
                     }}>
                       <Text variant="bodyMd" as="span">
                         Loading marketing activity...
                         </Text>
                       </div>
                   )}
                     </div>
               </Box>
             </Card>
           </Layout.Section>

           {/* Download modal */}
           {downloadModalOpen && (
             <Modal
               open={downloadModalOpen}
               onClose={() => setDownloadModalOpen(false)}
               title="Download Shopper Data"
               primaryAction={{
                 content: downloadLoading ? 'Processing…' : 'Confirm',
                 onAction: handleConfirmDownload,
                 disabled: downloadLoading
               }}
               secondaryActions={[{ content: 'Cancel', onAction: () => setDownloadModalOpen(false) }]}
             >
               <Modal.Section>
                     <div style={{
                   background: '#EEF2FF',
                   border: '1px solid #E5E7EB',
                   padding: 16,
                   borderRadius: 6,
                   marginBottom: 16
                 }}>
                   <Text variant="bodyMd" as="p">
                     This data might take a while to process. We will inform you once the data is ready to be downloaded via email.
                         </Text>
                       </div>
                 <TextField
                   label="Email to Contact"
                   value={downloadEmail}
                   onChange={setDownloadEmail}
                   autoComplete="email"
                   placeholder="Enter your email"
                 />
               </Modal.Section>
             </Modal>
           )}

         </Layout>
        )}
       </div>
     </Frame>
   );
} 