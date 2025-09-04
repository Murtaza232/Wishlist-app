import { 
  Layout, 
  Frame, 
  Card, 
  Banner, 
  Button, 
  Text, 
  InlineStack,
  Badge,
  ProgressBar,
  Icon,
  Box,
  Divider,
  Spinner
} from '@shopify/polaris'
import { 
  ExternalIcon,
  CalendarIcon,
  MenuHorizontalIcon
} from '@shopify/polaris-icons'
import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import featureAsset1 from '../assets/featureAsset1.jpg'
import featureAsset2 from '../assets/featureAsset2.jpg'
import featureAsset3 from '../assets/featureAsset3.jpg'
import featureAsset4 from '../assets/featureAsset4.jpg'
import featureAsset5 from '../assets/featureAsset5.jpg'
import featureAsset6 from '../assets/featureAsset6.jpg'
import featureAsset7 from '../assets/featureAsset7.jpg'
import featureAsset8 from '../assets/featureAsset8.jpg'
import featureAsset9 from '../assets/featureAsset9.jpg'
import featureAsset10 from '../assets/featureAsset10.jpg'
import { useAppBridge } from "@shopify/app-bridge-react";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import { AppContext, LanguageSelector } from "../components";
import { useLanguage } from "../components";
import DateRangePicker from '../components/DateRangePicker';

function Index() {
  const [showAlert, setShowAlert] = useState(true)
  const [setupGuideExpanded, setSetupGuideExpanded] = useState(true)
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shop, setShop] = useState("");
  const [handle, setHandle] = useState("");
  const [apikey, setApikey] = useState("");
  const [activeTheme, setActiveTheme] = useState("");
  const [apiLoaded, setApiLoaded] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0); // Start with Capture Intent selected
  const [activeSetupStepIndex, setActiveSetupStepIndex] = useState(-1); // Track which setup step is active
  const [completedSteps, setCompletedSteps] = useState(() => {
    // Load completed steps from sessionStorage on initial load
    const saved = sessionStorage.getItem('wishlistSetupCompletedSteps');
    return saved ? JSON.parse(saved) : [];
  }); // Track completed steps
  const [captureIntentTab, setCaptureIntentTab] = useState(0); // Track which tab is active in Capture Intent (0 = first tab, 1 = second tab) - default to first tab
  const [captureIdentityTab, setCaptureIdentityTab] = useState(0); // Track which tab is active in Capture Identity (0 = first tab, 1 = second tab)
  const [engageConvertTab, setEngageConvertTab] = useState(0); // Track which tab is active in Engage & Convert (0 = first tab, 1 = second tab, 2 = third tab)
  const [retainReengageTab, setRetainReengageTab] = useState(0); // Track which tab is active in Retain & Re-Engage (0 = first tab, 1 = second tab)
  const [showDatePicker, setShowDatePicker] = useState(false); // Track date picker visibility
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  });
  const [selectedRangeLabel, setSelectedRangeLabel] = useState('Last 30 Days');

  const { apiUrl } = useContext(AppContext);
  const { t } = useLanguage();
  const appBridge = useAppBridge();
  const fetch = useAuthenticatedFetch();
  const navigate = useNavigate();
  const [setupGuideHidden, setSetupGuideHidden] = useState(() => {
    return sessionStorage.getItem('setupGuideHidden') === 'true';
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const persistOnboarding = async (payload) => {
    try {
      if (!apiLoaded) return;
      const token = await getSessionToken(appBridge);
      if (!token) return;
      await fetch(`${apiUrl}wishlist-configuration`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      // ignore network errors for UI smoothness
    }
  };

  const fetchThemes = async () => {
    setLoading(true);
    try {
      const token = await getSessionToken(appBridge);
      if (!token) return;
      
      // Ensure default templates are created
      try {
        await fetch(`${apiUrl}ensure-templates`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Failed to ensure templates:', error);
      }
      
      const res = await fetch(`${apiUrl}get-themes`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      if (data && data.success) {
        setThemes(data.themes || []);
        setShop(data.shop || '');
        setHandle(data.handle || '');
        setApikey(data.apikey || '');
        setActiveTheme(data.activeTheme || '');
        setApiLoaded(true);
      }
    } catch (error) {
      console.error('Error fetching themes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchThemes();
  }, [apiUrl]);

  // Fetch initial wishlist statistics when component mounts
  useEffect(() => {
    if (apiLoaded && selectedDateRange.start && selectedDateRange.end) {
      fetchWishlistStats(selectedDateRange.start, selectedDateRange.end);
    }
  }, [apiLoaded]);

  // Ensure default state is set on component mount
  useEffect(() => {
    // Set default active step and tab
    setActiveStepIndex(0);
    setCaptureIntentTab(0);
  }, []);

  // Save completed steps to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('wishlistSetupCompletedSteps', JSON.stringify(completedSteps));
  }, [completedSteps]);

  // Load persisted onboarding state from backend after themes session loaded
  useEffect(() => {
    const loadOnboarding = async () => {
      try {
        const token = await getSessionToken(appBridge);
        if (!token) return;
        const res = await fetch(`${apiUrl}wishlist-configuration/show`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        if (json && json.success && json.data) {
          if (typeof json.data.onboarding_dismissed === 'boolean') {
            setSetupGuideHidden(json.data.onboarding_dismissed);
          }
          if (Array.isArray(json.data.onboarding_completed_steps)) {
            // Map to indices if stored as integers
            const arr = json.data.onboarding_completed_steps.map(Number).filter((n) => !isNaN(n));
            setCompletedSteps(arr);
          }
        }
      } catch (e) {
        // ignore
      }
    };
    if (apiLoaded) {
      loadOnboarding();
    }
  }, [apiLoaded]);

  // Persist setup guide hide/show state
  useEffect(() => {
    sessionStorage.setItem('setupGuideHidden', setupGuideHidden ? 'true' : 'false');
  }, [setupGuideHidden]);


  // Function to reset setup progress (for testing or when needed)
  const resetSetupProgress = () => {
    setCompletedSteps([]);
    setActiveStepIndex(-1);
    sessionStorage.removeItem('wishlistSetupCompletedSteps');
  };

  // Date picker handlers
  const handleDateRangeChange = ({ start, end }) => {
    setSelectedDateRange({ start, end });
    // Fetch wishlist statistics for the new date range
    fetchWishlistStats(start, end);
  };

  // Function to fetch wishlist statistics
  const fetchWishlistStats = async (startDate, endDate) => {
    setMetricsLoading(true);
    try {
      const token = await getSessionToken(appBridge);
      if (!token) {
        setMetricsLoading(false);
        return;
      }

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      const [wishlistRes, customersRes] = await Promise.all([
        fetch(`${apiUrl}wishlist-stats?start_date=${startDateStr}&end_date=${endDateStr}`, {
          headers: { "Authorization": `Bearer ${token}` },
        }),
        fetch(`${apiUrl}customers/stats?start_date=${startDateStr}&end_date=${endDateStr}`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);

      if (!wishlistRes.ok) {
        const errorText = await wishlistRes.text();
        console.error('Wishlist stats error response:', errorText);
        throw new Error('Failed to fetch wishlist statistics');
      }

      // Customers stats may fail independently; default to zero
      let customersTotal = 0;
      if (customersRes && customersRes.ok) {
        const customersData = await customersRes.json();
        if (customersData && customersData.success && customersData.data) {
          customersTotal = customersData.data.total_customers || 0;
        }
      }

      const data = await wishlistRes.json();
      if (data.status && data.data) {
        setReviewMetrics([
          { title: t('Total Wishlist Products'), value: data.data.total_wishlist_products },
          { title: t('Total Lists'), value: data.data.total_lists },
          { title: t('Total Customers'), value: customersTotal },
        ]);
        setMetricsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching wishlist statistics:', error);
      // Keep the current metrics if there's an error
      setMetricsLoading(false);
    }
  };

  const handleRangeSelect = ({ start, end, range }) => {
    setSelectedDateRange({ start, end });
    
    // Update the label based on the selected range
    const rangeLabels = {
      'today': t('Today', 'Dashboard'),
      'yesterday': t('Yesterday', 'Dashboard'),
      'last7days': t('Last 7 Days', 'Dashboard'),
      'last30days': t('Last 30 Days', 'Dashboard'),
      'thisMonth': t('This Month', 'Dashboard'),
      'lastMonth': t('Last Month', 'Dashboard')
    };
    
    setSelectedRangeLabel(rangeLabels[range] || t('Custom Range', 'Dashboard'));
    
    // Fetch wishlist statistics for the new date range
    fetchWishlistStats(start, end);
  };

  const [reviewMetrics, setReviewMetrics] = useState([
    { title: t('Total Wishlist Products'), value: 0 },
    { title: t('Total Lists'), value: 0 },
    { title: t('Total Customers'), value: 0 },
  ]);
  const [metricsLoading, setMetricsLoading] = useState(true);

  const setupSteps = [
    { 
      title: t('Smart Notifications Alerts'), 
      description: t('Set up automated email notifications for new reviews'),
      completed: false,
      buttonText: t('Button Text smart notification alerts')
    },
    { 
      title: t('Widget Personalization'), 
      description: t('Paragraph Widget Personalization','Dashboard'),
      completed: false,
      buttonText: t('Button Text Widget Personalization')
    },
    { 
      title: t('Localize'), 
      description: t('Paragraph Localize','Dashboard'),
      completed: false,
      buttonText: t('Button Text Localize')
    }
  ]

  const completedStepsCount = completedSteps.length

  // Use activeTheme for URLs
  const themeId = activeTheme;

  const appEmbedUrl = (shop && themeId && apikey)
    ? `https://admin.shopify.com/store/${shop}/themes/${themeId}/editor?context=apps&appEmbed=${apikey}/wishlist_configuration`
    : '';

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
              fontSize: 20,
              fontWeight: 700,
              margin: 0,
              color: '#222',
              letterSpacing: 0.5,
              alignItems: 'center',
              width: '100%',
              marginBottom: '24px'
            }}>
              {t('Dashboard')}
            </div>
        <Layout>
        {/* Header and Alert Section */}
        <Layout.Section>
          {showAlert && (
                          <Banner
                title={t('Active Wishlist Widget')}
                tone="warning"
                onDismiss={() => setShowAlert(false)}
                              action={{
                  content: !apiLoaded ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent:'center', gap: '8px',width:'47px' }}>
                      <div style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.2)', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Icon source={ExternalIcon} color="base" />
                      {t('Button text activate wishlist widget')}
                    </div>
                  ),
                  onAction: () => {
                    if (appEmbedUrl && apiLoaded) {
                      window.open(appEmbedUrl, '_blank');
                    }
                  }
                }}
            >
              <p>{t('Text active wishlist widget')}</p>
            </Banner>
          )}
        </Layout.Section>

        {/* Review Highlights Section */}
        <Layout.Section>
          <Card>
            <div style={{ padding: '20px' }}>
              <InlineStack align="space-between" blockAlign="center" gap="4">
                <Text variant="headingMd" as="h2" fontWeight="bold">
                  {t('Wishlist Highlights')}
                </Text>
                <DateRangePicker
                  startDate={selectedDateRange.start}
                  endDate={selectedDateRange.end}
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
                      {selectedRangeLabel}
                    </Button>
                  }
                />
              </InlineStack>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px',
                marginTop: '20px'
              }}>
                {reviewMetrics.map((metric, index) => (
                  <Card key={index} sectioned>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <Text variant="bodyMd" color="subdued">
                        {metric.title}
                      </Text>
                      <div style={{ 
                        width: '100%', 
                        height: '1px', 
                        background: 'repeating-linear-gradient(to right, #c9cccf 0px, #c9cccf 2px, transparent 2px, transparent 4px)',
                        margin: '4px 0'
                      }}></div>
                      {metricsLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                          <Spinner size="small" />
                        </div>
                      ) : (
                        <Text variant="headingLg" as="p" fontWeight="bold">
                          {metric.value}
                        </Text>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </Layout.Section>

        {/* Setup Guide Section (Onboarding) */}
        {!setupGuideHidden && (
            <Layout.Section>
          <Card>
            <div style={{ padding: '20px' }}>
              <InlineStack align="space-between" blockAlign="center" gap="4">
                <InlineStack gap="3" blockAlign="center">
                  <Text variant="headingMd" as="h2" fontWeight="bold">
                    {t('Setup Guide')} 👋
                  </Text>
                  <Text variant="bodySm" color="subdued">
                    {completedStepsCount}/{setupSteps.length} {t('completed')}
                  </Text>
                </InlineStack>
                <InlineStack gap="2">
                  <div style={{ position: 'relative' }}>
                    <Button variant="tertiary" onClick={() => setMenuOpen((prev) => !prev)}>
                      <Icon source={MenuHorizontalIcon} color="base" />
                    </Button>
                    {menuOpen && (
                      <div style={{
                        position: 'absolute',
                        right: 0,
                        top: '100%',
                        zIndex: 10,
                        background: 'white',
                        border: '1px solid #E1E3E5',
                        borderRadius: 8,
                        padding: 8,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                      }}>
                        <Button variant="tertiary" onClick={() => { setSetupGuideHidden(true); setMenuOpen(false); persistOnboarding({ onboarding_dismissed: true }); }}>
                          {t('Dismiss')}
                        </Button>
                      </div>
                    )}
                  </div>
                  <Button variant="tertiary" onClick={() => setSetupGuideExpanded(!setupGuideExpanded)}>
                    {setupGuideExpanded ? '▼' : '▲'}
                  </Button>
                </InlineStack>
              </InlineStack>

              {/* Single progress bar */}
              <div style={{ marginTop: 12 }}>
                <ProgressBar progress={Math.round((completedStepsCount / setupSteps.length) * 100)} tone="primary" size="small" />
              </div>

              {setupGuideExpanded && (
                <div style={{ marginTop: '20px' }}>
                  
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {setupSteps.map((step, index) => (
                      <div 
                        key={index}
                        style={{
                          padding: '16px',
                          backgroundColor: activeSetupStepIndex === index ? '#f6f6f7' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease',
                          borderBottom: index < setupSteps.length - 1 ? '1px solid #E1E3E5' : 'none'
                        }}
                        onClick={() => setActiveSetupStepIndex(index)}
                      >
                        <div 
                          style={{
                            width: '20px',
                            height: '20px',
                            border: completedSteps.includes(index) ? '2px solid #202223' : '2px dotted #c9cccf',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: completedSteps.includes(index) ? '#202223' : 'transparent',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the parent click
                            if (completedSteps.includes(index)) {
                              // Remove this step from completed steps
                              const updated = completedSteps.filter(stepIndex => stepIndex !== index);
                              setCompletedSteps(updated);
                              // persist
                              persistOnboarding({ onboarding_completed_steps: updated });
                            } else {
                              // Add this step to completed steps
                              const updated = [...completedSteps, index];
                              setCompletedSteps(updated);
                              // persist
                              persistOnboarding({ onboarding_completed_steps: updated });
                            }
                          }}
                        >
                          {completedSteps.includes(index) && (
                            <svg width="12" height="12" viewBox="0 0 20 20" fill="white">
                              <path d="M8.5 15.5L3 10L4.41 8.59L8.5 12.67L15.59 5.58L17 7L8.5 15.5Z"/>
                            </svg>
                          )}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <Text variant="bodyMd" as="h3" fontWeight={activeSetupStepIndex === index ? "bold" : "semibold"}>
                            {step.title}
                          </Text>
                          {step.description && (
                            <Text variant="bodySm" color="subdued">
                              {step.description}
                            </Text>
                          )}
                          {activeSetupStepIndex === index && (
                            <div style={{ marginTop: '12px' }}>
                              <Button 
                                variant="primary" 
                                size="slim"
                                icon={!apiLoaded ? undefined : ExternalIcon}
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent triggering the parent click
                                  // Mark this step as completed
                                  if (!completedSteps.includes(index)) {
                                    const updated = [...completedSteps, index];
                                    setCompletedSteps(updated);
                                    persistOnboarding({ onboarding_completed_steps: updated });
                                  }
                                  // Move to next step if available
                                  if (index < setupSteps.length - 1) {
                                    setActiveSetupStepIndex(index + 1);
                                  }
                                  // Route to configurations page for "Customize Widget" button
                                  if (step.title === t('Widget Personalization')) {
                                    navigate('/Configurations');
                                  } else if (step.title === t('Smart Notifications Alerts')) {
                                    navigate('/notification');
                                  } else if (step.title === t('Localize')) {
                                    navigate('/language-setting');
                                  } else if (appEmbedUrl && apiLoaded) {
                                    window.open(appEmbedUrl, '_blank');
                                  }
                                }}
                                disabled={!apiLoaded || !appEmbedUrl}
                              >
                                {!apiLoaded ? (
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent:'center', gap: '8px',width:'47px' }}>
                                    <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                  </div>
                                ) : (
                                  step.buttonText
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </Layout.Section>
        )}

        {/* Wishlist Features Section */}
        <Layout.Section>
          <Card>
            <div style={{ padding: '24px' }}>
              {/* Header */}
              <div style={{ 
                textAlign: 'center', 
                  marginBottom: '20px',
                  paddingBottom: '16px',
                borderBottom: '1px solid #E1E3E5'
              }}>
                <Text 
                  variant="headingLg" 
                  as="h2" 
                  fontWeight="bold" 
                  style={{ 
                    marginBottom: '16px',
                    fontSize: '28px',
                    color: '#202223',
                    lineHeight: '1.2'
                  }}
                >
                  {t('Much more than a Wishlist')}
                </Text>
               <div style={{ marginTop: '20px', marginBottom: '10px' }}>
                <Text 
                  variant="bodyMd" 
                  color="subdued"
                  style={{
                    fontSize: '16px',
                    color: '#6D7175',
                    lineHeight: '1.4',
                    maxWidth: '600px',
                    margin: '0 auto'
                  }}
                >
                  {t('subtitle much more than wishlist')}
                </Text>
                </div>
              </div>

              {/* Process Steps */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                marginBottom: '40px',
                gap: 'clamp(30px, 4vw, 50px)',
                flexWrap: 'wrap',
                padding: '0 16px'
              }}>
                {[
                  { title: t('Capture Intent'), active: activeStepIndex === 0 },
                  { title: t('Capture Identity'), active: activeStepIndex === 1 },
                  { title: t('Engage & Convert'), active: activeStepIndex === 2 },
                  { title: t('Retain & Re-Engage'), active: activeStepIndex === 3 }
                ].map((step, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setActiveStepIndex(index);
                      // Reset tab states when switching between main steps
                      if (index === 0) {
                        setCaptureIntentTab(0);
                      } else if (index === 1) {
                        setCaptureIdentityTab(0);
                      } else if (index === 2) {
                        setEngageConvertTab(0);
                      } else if (index === 3) {
                        setRetainReengageTab(0);
                      }
                    }}
                  >
                    {/* Text Label */}
                    <span 
                      style={{ 
                        marginBottom: '40px',
                        color: step.active ? '#202223' : '#6D7175',
                        fontSize: 'clamp(12px, 2vw, 14px)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        lineHeight: '1.2',
                        whiteSpace: 'nowrap',
                        fontWeight: step.active ? 'bold' : 'normal',
                        display: 'block'
                      }}
                    >
                      {step.title}
                    </span>
                    
                    {/* Horizontal Bars - Skeleton lines */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: '3px',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      justifyContent: 'center'
                    }}>
                      <div 
                        style={{
                          width: step.active ? 'min(50px, 8vw)' : 'min(40px, 6vw)',
                          minWidth: '30px',
                          height: '6px',
                          backgroundColor: step.active && (
                            (index === 0 && captureIntentTab === 0) || 
                            (index === 1 && captureIdentityTab === 0) ||
                            (index === 2 && engageConvertTab === 0) ||
                            (index === 3 && retainReengageTab === 0)
                          ) ? '#202223' : '#E1E3E5',
                          borderRadius: '3px',
                          cursor: step.active ? 'pointer' : 'default',
                          transition: 'background-color 0.2s ease'
                        }}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent click
                          if (step.active) {
                            if (activeStepIndex === 0) {
                              setCaptureIntentTab(0);
                            } else if (activeStepIndex === 1) {
                              setCaptureIdentityTab(0);
                            } else if (activeStepIndex === 2) {
                              setEngageConvertTab(0);
                            } else if (activeStepIndex === 3) {
                              setRetainReengageTab(0);
                            }
                          }
                        }}
                      />
                      <div 
                        style={{
                          width: step.active ? 'min(50px, 8vw)' : 'min(40px, 6vw)',
                          minWidth: '30px',
                          height: '6px',
                          backgroundColor: step.active && (
                            (index === 0 && captureIntentTab === 1) || 
                            (index === 1 && captureIdentityTab === 1) ||
                            (index === 2 && engageConvertTab === 1) ||
                            (index === 3 && retainReengageTab === 1)
                          ) ? '#202223' : '#E1E3E5',
                          borderRadius: '3px',
                          cursor: step.active ? 'pointer' : 'default',
                          transition: 'background-color 0.2s ease'
                        }}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the parent click
                          if (step.active) {
                            if (activeStepIndex === 0) {
                              setCaptureIntentTab(1);
                            } else if (activeStepIndex === 1) {
                              setCaptureIdentityTab(1);
                            } else if (activeStepIndex === 2) {
                              setEngageConvertTab(1);
                            } else if (activeStepIndex === 3) {
                              setRetainReengageTab(1);
                            }
                          }
                        }}
                      />
                      {index === 2 && (
                        <div 
                          style={{
                            width: 'min(50px, 8vw)',
                            minWidth: '30px',
                            height: '6px',
                            backgroundColor: step.active && engageConvertTab === 2 ? '#202223' : '#E1E3E5',
                            borderRadius: '3px',
                            cursor: step.active ? 'pointer' : 'default',
                            transition: 'background-color 0.2s ease'
                          }}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the parent click
                            if (step.active) {
                              setEngageConvertTab(2);
                            }
                          }}
                        />
                      )}
                      {index === 3 && (
                        <div 
                          style={{
                            width: 'min(50px, 8vw)',
                            minWidth: '30px',
                            height: '6px',
                            backgroundColor: step.active && retainReengageTab === 2 ? '#202223' : '#E1E3E5',
                            borderRadius: '3px',
                            cursor: step.active ? 'pointer' : 'default',
                            transition: 'background-color 0.2s ease'
                          }}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the parent click
                            if (step.active) {
                              setRetainReengageTab(2);
                            }
                          }}
                        />
                      )}
                    </div>
                    
                    {/* Dotted Arrow Connector (except for last item) */}
                    {index < 3 && (
                      <div style={{
                        position: 'absolute',
                        right: '-40px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '24px',
                        height: '2px',
                        background: 'repeating-linear-gradient(to right, #E1E3E5 0px, #E1E3E5 1px, transparent 1px, transparent 2px)',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <div style={{
                          width: '0',
                          height: '0',
                          borderLeft: '2px solid #E1E3E5',
                          borderTop: '2px solid transparent',
                          borderBottom: '2px solid transparent',
                          marginLeft: 'auto'
                        }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Divider after tabs */}
             <Box style={{  marginBottom: '70px' }}>
              <Divider/>
             </Box>

              {/* Main Content - Two Columns */}
              <div style={{ display: 'flex', gap: '200px', alignItems: 'flex-start', justifyContent: 'center' }}>
                {/* Left Column - Image Grid */}
                <div style={{ flex: '0 1 400px', maxWidth: '400px', height: '270px' }}>
                  {activeStepIndex === 0 && captureIntentTab === 0 ? (
                    // Feature Asset 1 image for "Add Favorites to Wishlist" tab
                   
                      
                      <img 
                        src={featureAsset1} 
                        alt="Add Favorites to Wishlist Feature"
                        style={{
                          width: '100%',
                          height: '70%',
                          objectFit: 'contain',
                          borderRadius: '8px'
                        }}
                      />
 
                  ) : activeStepIndex === 1 && captureIdentityTab === 0 ? (
                    // Single image placeholder for "Subscribe to Out-of-Stock Items" tab
                  
                      <img 
                        src={featureAsset3} 
                        alt="Add Favorites to Wishlist Feature"
                        style={{
                          width: '100%',
                          height: '70%',
                          objectFit: 'contain',
                          borderRadius: '8px'
                        }}
                      />

                  ) : activeStepIndex === 1 && captureIdentityTab === 1 ? (
                    // Single image placeholder for "Save & Share Wishlist" tab
                  
                      <img 
                        src={featureAsset4} 
                        alt="Save for Later from Cart Feature"
                        style={{
                          width: '100%',
                          height: '70%',
                          objectFit: 'contain',
                          borderRadius: '8px'
                        }}
                      />
              
                  ) : activeStepIndex === 2 && engageConvertTab === 0 ? (
                    // Single image placeholder for "Wishlist Reminder Alerts" tab
                
                      <img 
                        src={featureAsset5} 
                        alt="Save for Later from Cart Feature"
                        style={{
                          width: '100%',
                          height: '70%',
                          objectFit: 'contain',
                          borderRadius: '8px'
                        }}
                      />
                 
                  ) : activeStepIndex === 2 && engageConvertTab === 1 ? (
                    // Single image placeholder for "Price Drop Alerts" tab
           
                      <img 
                        src={featureAsset6} 
                        alt="Save for Later from Cart Feature"
                        style={{
                          width: '100%',
                          height: '70%',
                          objectFit: 'contain',
                          borderRadius: '8px'
                        }}
                      />

                  ) : activeStepIndex === 2 && engageConvertTab === 2 ? (
                    // Single image placeholder for "Low Stock Alerts" tab
                  
                      <img 
                        src={featureAsset7} 
                        alt="Save for Later from Cart Feature"
                        style={{
                          width: '100%',
                          height: '70%',
                          objectFit: 'contain',
                          borderRadius: '8px'
                        }}
                      />
                 
                  ) : activeStepIndex === 3 && retainReengageTab === 0 ? (
                    // Single image placeholder for "Personalized Campaigns" tab
                   
                      <img 
                        src={featureAsset8} 
                        alt="Save for Later from Cart Feature"
                        style={{
                          width: '100%',
                          height: '70%',
                          objectFit: 'contain',
                          borderRadius: '8px'
                        }}
                      />
                    
                  ) : activeStepIndex === 3 && retainReengageTab === 1 ? (
                    // Single image placeholder for "Loyalty Rewards" tab
                  
                      <img 
                        src={featureAsset9} 
                        alt="Save for Later from Cart Feature"
                        style={{
                          width: '100%',
                          height: '70%',
                          objectFit: 'contain',
                          borderRadius: '8px'
                        }}
                      />
                   
                  ) : activeStepIndex === 3 && retainReengageTab === 2 ? (
                    // Single image placeholder for "Omnichannel Experience" tab
                   
                      <img 
                        src={featureAsset10} 
                        alt="Save for Later from Cart Feature"
                        style={{
                          width: '100%',
                          height: '70%',
                          objectFit: 'contain',
                          borderRadius: '8px'
                        }}
                      />
                  
                  ) : activeStepIndex === 0 && captureIntentTab === 1 ? (
                    // Feature Asset 2 image for "Save for Later from Cart" tab
                   
                      <img 
                        src={featureAsset2} 
                        alt="Save for Later from Cart Feature"
                        style={{
                          width: '100%',
                          height: '70%',
                          objectFit: 'contain',
                          borderRadius: '8px'
                        }}
                      />
                   
                  ) : (
                    // Default single image for other steps
                  <div style={{ 
                    backgroundColor: '#f6f6f7', 
                    borderRadius: '8px', 
                    padding: '20px',
                    minHeight: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed #c9cccf'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: '#e1e3e5',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px auto',
                        fontSize: '24px',
                        color: '#666'
                      }}>
                        📷
                      </div>
                      <Text variant="bodyMd" color="subdued">
                        Visual Flow Diagram
                      </Text>
                      <Text variant="bodySm" color="subdued" style={{ marginTop: '4px' }}>
                        Insert image here
                      </Text>
                    </div>
                  </div>
                  )}
                </div>

                {/* Right Column - Textual Explanation */}
                <div style={{ flex: '0 1 400px', maxWidth: '400px', height: '270px' }}>
                  <Text variant="headingMd" as="h3" fontWeight="bold" style={{ marginBottom: '16px' }}>
                    {activeStepIndex === 0 && captureIntentTab === 0 ? t('Capture Intent 1st tab Title') : 
                     activeStepIndex === 0 && captureIntentTab === 1 ? t('Capture Intent 2nd tab Title') :
                     activeStepIndex === 1 && captureIdentityTab === 0 ? t('Capture Identity 1st tab Title') :
                     activeStepIndex === 1 && captureIdentityTab === 1 ? t('Capture Identity 2nd tab Title') :
                     activeStepIndex === 2 && engageConvertTab === 0 ? t('Engage & Convert 1st tab Title') :
                     activeStepIndex === 2 && engageConvertTab === 1 ? t('Engage & Convert 2nd tab Title') :
                     activeStepIndex === 2 && engageConvertTab === 2 ? t('Engage & Convert 3rd tab Title') :
                     activeStepIndex === 3 && retainReengageTab === 0 ? t('Retain & Re-Engage 1st tab Title') :
                     activeStepIndex === 3 && retainReengageTab === 1 ? t('Retain & Re-Engage 2nd tab Title') :
                     activeStepIndex === 3 && retainReengageTab === 2 ? t('Retain & Re-Engage 3rd tab Title') :
                     t('Capture Intent 1st tab Title')}
                  </Text>
                  <Box style={{ marginTop: '20px', marginBottom: '20px' }}>
                  <Divider/>
                  </Box>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        backgroundColor: '#ffa726',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: '#fff',
                        fontWeight: 'bold'
                      }}>
                       
                      </div>
                      <Text variant="bodyMd" fontWeight="semibold">
                        {t('tabs why it matters')}
                      </Text>
                    
                    </div>
                    <Text variant="bodyMd" color="subdued" style={{ lineHeight: '1.5' }}>
                      {activeStepIndex === 0 && captureIntentTab === 0 ? t('Capture Intent 1st tab 1st paragraph') :
                       activeStepIndex === 0 && captureIntentTab === 1 ? t('Capture Intent 2nd tab 1st paragraph') :
                       activeStepIndex === 1 && captureIdentityTab === 0 ? t('Capture Identity 1st tab 1st paragraph') :
                       activeStepIndex === 1 && captureIdentityTab === 1 ? t('Capture Identity 2nd tab 1st paragraph') :
                       activeStepIndex === 2 && engageConvertTab === 0 ? t('Engage & Convert 1st tab 1st paragraph') :
                       activeStepIndex === 2 && engageConvertTab === 1 ? t('Engage & Convert 2nd tab 1st paragraph') :
                       activeStepIndex === 2 && engageConvertTab === 2 ? t('Engage & Convert 3rd tab 1st paragraph') :
                       activeStepIndex === 3 && retainReengageTab === 0 ? t('Retain & Re-Engage 1st tab 1st paragraph') :
                       activeStepIndex === 3 && retainReengageTab === 1 ? t('Retain & Re-Engage 2nd tab 1st paragraph') :
                       activeStepIndex === 3 && retainReengageTab === 2 ? t('Retain & Re-Engage 3rd tab 1st paragraph') :
                       t('Capture Intent 1st tab 1st paragraph')}
                    </Text>
                  </div>
                  <Box style={{ marginTop: '10px', marginBottom: '10px' }}>
                      <Divider/>
                      </Box>
                    <Text variant="bodyMd">
                      {activeStepIndex === 0 && captureIntentTab === 0 ? t('Capture Intent 1st tab 2nd Paragraph') :
                       activeStepIndex === 0 && captureIntentTab === 1 ? t('Capture Intent 2nd tab 2nd paragraph') :
                       activeStepIndex === 1 && captureIdentityTab === 0 ? t('Capture Identity 1st tab 2nd paragraph') :
                       activeStepIndex === 1 && captureIdentityTab === 1 ? t('Capture Identity 2nd tab 2nd paragraph') :
                       activeStepIndex === 2 && engageConvertTab === 0 ? t('Engage & Convert 1st tab 2nd paragraph') :
                       activeStepIndex === 2 && engageConvertTab === 1 ? t('Engage & Convert 2nd tab 2nd paragraph') :
                       activeStepIndex === 2 && engageConvertTab === 2 ? t('Engage & Convert 3rd tab 2nd paragraph') :
                       activeStepIndex === 3 && retainReengageTab === 0 ? t('Retain & Re-Engage 1st tab 2nd paragraph') :
                       activeStepIndex === 3 && retainReengageTab === 1 ? t('Retain & Re-Engage 2nd tab 2nd paragraph') :
                       activeStepIndex === 3 && retainReengageTab === 2 ? t('Retain & Re-Engage 3rd tab 2nd paragraph') :
                       t('Capture Intent 1st tab 2nd Paragraph')}
                    </Text>
                  {/* <a href="https://www.wishlist.com/blog/how-to-use-wishlist-to-increase-sales" target="_blank" rel="noopener noreferrer">
                    <span style={{ cursor: 'pointer', fontWeight: '500', marginTop:100, textDecoration:'none'}}>
                    Learn More
                    </span>
                  </a> */}
                </div>
              </div>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      </div>
    </Frame>
  )
}

export default Index
