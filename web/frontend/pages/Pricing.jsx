import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useAppBridge } from '@shopify/app-bridge-react';
import { getSessionToken } from '@shopify/app-bridge-utils';
import { 
  Frame, 
  Card, 
  Banner, 
  Button, 
  Text, 
  Badge,
  Spinner,
  Box,
  CalloutCard,
  SkeletonDisplayText,
  SkeletonBodyText
} from '@shopify/polaris';
import { useLanguage } from '../components';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../components';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [error, setError] = useState(null);
  const [activePlanName, setActivePlanName] = useState(null);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { apiUrl } = useContext(AppContext);
  const fetch = useAuthenticatedFetch();
  const appBridge = useAppBridge();

  // Subscribe handler: calls backend to start subscription or set free plan
  const handleSubscribe = useCallback(async (plan) => {
    try {
      setLoadingPlanId(plan.id);
      const token = await getSessionToken(appBridge);
      const res = await fetch(`${apiUrl}subscribe-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: plan.id, billing_period: billingPeriod, shopifySession: token }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || data.message || 'Subscription failed');
      if (data.return_url) {
        window.top.location.href = data.return_url;
        return;
      }
      setActivePlanName(plan.name);
    } catch (e) {
      console.error('Subscribe error:', e);
      setError(e.message || 'Subscription failed');
    } finally {
      setLoadingPlanId(null);
    }
  }, [apiUrl, appBridge, billingPeriod]);

  // Fetch pricing plans from API
  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiUrl}pricing-plans-with-discounts`);
        if (!response.ok) {
          throw new Error('Failed to fetch pricing plans');
        }
        const data = await response.json();
        if (data.success) {
          // Ensure plans are ordered Free -> Pro -> Premium using sort_order
          const sorted = Array.isArray(data.data)
            ? [...data.data].sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999))
            : [];
          setPlans(sorted);
        } else {
          throw new Error(data.message || 'Failed to fetch pricing plans');
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching pricing plans:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPricingPlans();
  }, [apiUrl]);

  // Fetch active subscription to mark current plan
  useEffect(() => {
    const fetchActiveSubscription = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const shop = params.get('shop');
        const url = shop ? `${apiUrl}subscription/active?shop=${encodeURIComponent(shop)}` : `${apiUrl}subscription/active`;
        const res = await fetch(url);
        if (!res.ok) return; // silently ignore
        const data = await res.json();
        if (data && data.success && data.data) {
          // Prefer plan_name if available, otherwise map by plan_id after plans load
          if (data.data.plan_name) {
            setActivePlanName(data.data.plan_name);
          } else if (Array.isArray(plans) && plans.length > 0) {
            const match = plans.find(p => String(p.id) === String(data.data.plan_id));
            if (match) setActivePlanName(match.name);
          }
        }
      } catch (e) {
        // no-op
      }
    };
    fetchActiveSubscription();
  }, [apiUrl, plans]);

  const handleBillingToggle = useCallback(() => {
    setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly');
  }, [billingPeriod]);

  // Removed discount badge for annual plan

  // Loading container with per-card skeletons
  if (loading) {
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
            marginTop: 0
          }}
        >
          <div style={{
            fontSize: 20,
            fontWeight: 700,
            margin: 0,
            color: '#222',
            letterSpacing: 0.5,
            width: '100%',
          }}>
            Pricing Plan
            <br />
            <span style={{ fontSize: 13, color: '#555', fontWeight: 400, maxWidth: 700, marginTop: 2, display: 'inline-block' }}>
              Choose the plan that fits your needs. You can switch anytime.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}>
            {[0, 1, 2].map((i) => (
              <Card key={i} sectioned>
                <div style={{ padding: 24 }}>
                  <div style={{ marginBottom: 16 }}>
                    <SkeletonDisplayText size="small" />
                    <div style={{ marginTop: 8 }}>
                      <SkeletonBodyText lines={2} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <SkeletonDisplayText size="medium" />
                    <div style={{ marginTop: 4 }}>
                      <SkeletonBodyText lines={1} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <SkeletonBodyText lines={1} />
                  </div>
                  <div>
                    <SkeletonBodyText lines={1} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Table Skeleton */}
          <div style={{ marginTop: 28 }}>
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E1E3E5', overflow: 'hidden' }}>
              {/* Header Skeleton */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(3, 1fr)', background: '#FFFFFF', borderBottom: '1px solid #E1E3E5', fontSize: 13 }}>
                <div style={{ padding: '12px 14px' }}>
                  <SkeletonDisplayText size="small" />
                  <div style={{ marginTop: 6 }}>
                    <SkeletonBodyText lines={1} />
                  </div>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <SkeletonDisplayText size="small" />
                  <div style={{ marginTop: 6 }}>
                    <SkeletonBodyText lines={1} />
                  </div>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <SkeletonDisplayText size="small" />
                  <div style={{ marginTop: 6 }}>
                    <SkeletonBodyText lines={1} />
                  </div>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <SkeletonDisplayText size="small" />
                  <div style={{ marginTop: 6 }}>
                    <SkeletonBodyText lines={1} />
                  </div>
                </div>
              </div>

              {/* Rows Skeleton */}
              {[0,1,2,3,4].map((r) => (
                <div key={r} style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(3, 1fr)', alignItems: 'center', borderBottom: '1px solid #E1E3E5', backgroundColor: '#FFFFFF' }}>
                  <div style={{ padding: '10px 14px' }}>
                    <SkeletonBodyText lines={1} />
                  </div>
                  <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'center' }}>
                    <SkeletonDisplayText size="extraSmall" />
                  </div>
                  <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'center' }}>
                    <SkeletonDisplayText size="extraSmall" />
                  </div>
                  <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'center' }}>
                    <SkeletonDisplayText size="extraSmall" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Frame>
    );
  }

  // Error container (match Settings page)
  if (error) {
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
            marginTop: 40,
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
            height:'100vh'
          }}
        >
          {/* <Box style={{marginTop:'40px'}}> */}
          <div style={{ marginTop: 24 }}>
          <Banner
            title="Error loading pricing plans"
            tone="critical"
           
          >
            <p>{error}</p>
            <Button onClick={() => window.location.reload()} style={{ marginTop: 8 }}>
              Try Again
            </Button>
          </Banner>
          </div>
          {/* </Box> */}
        </div>
      </Frame>
    );
  }

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
          marginTop: 0
        }}
      >
        <div style={{
          fontSize: 20,
          fontWeight: 700,
          margin: 0,
          color: '#222',
          letterSpacing: 0.5,
          width: '100%'
        }}>
          {t('Pricing Plan','Pricing Plans')}
          <br />
          <span style={{ fontSize: 13, color: '#555', fontWeight: 400, maxWidth: 700, marginTop: 2, display: 'inline-block' }}>
            {t('Pricing Plan subtitle','Pricing Plans')}
          </span>
        </div>

        <div style={{ marginTop: 12 }}>
          <Banner>
              <p>
                  {/* <span style={{ fontWeight: 600 }}>Note:</span>  */}
                  {t('Banner','Pricing Plans')}
              </p>
          </Banner>
        </div>

        {/* Billing Period Toggle */}
        <div style={{ display: 'none'}}>
          <div style={{ display: 'flex', backgroundColor: '#F6F6F7', borderRadius: 24, padding: 4, position: 'relative' }}>
            <button
              onClick={handleBillingToggle}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: billingPeriod === 'monthly' ? '#222' : 'white',
                color: billingPeriod === 'monthly' ? 'white' : '#222',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: 14
              }}
            >
             {t('Monthly','Pricing Plans')}
            </button>
            <button
              onClick={handleBillingToggle}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: 'none',
                backgroundColor: billingPeriod === 'annual' ? '#222' : 'white',
                color: billingPeriod === 'annual' ? 'white' : '#222',
                fontWeight: 600,
                marginLeft: 10,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontSize: 14,
                position: 'relative',
                display: 'flex',

              }}
            >
             {t('Annual','Pricing Plans')}
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div style={{ display: 'grid', marginTop:'20px',gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24, marginBottom: 40 }}>
          {plans.map((plan, index) => (
            <Card key={index} sectioned>
              <div style={{ padding: 24 }}>
                {/* Plan Header */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    {plan.name === 'Free' && (<span style={{ fontSize: 20 }}>🏢</span>)}
                    <Text variant="headingLg" as="h2" fontWeight="bold" style={{ color: '#222' }}>
                      {t(plan.name, 'Pricing Plans')}
                    </Text>
                    {plan.name === activePlanName && (
                      <Badge tone="success" size="small">
                        {t('Current Plan','Pricing Plans')}
                      </Badge>
                    )}
                    {plan.badge && (
                      <Badge tone="info" size="small" style={{ backgroundColor: '#5C6AC4', color: 'white' }}>
                        {t(plan.badge, 'Pricing Plans')}
                      </Badge>
                    )}
                  </div>
                  <Text variant="bodyMd" color="subdued" style={{ lineHeight: '1.5' }}>
                    {t(plan.description, 'Pricing Plans')}
                  </Text>
                </div>

                {/* Price */}
                <div style={{ marginBottom: 20 }}>
                  <Text variant="headingXl" as="h3" fontWeight="bold" style={{ color: '#222' }}>
                    {plan.hasCustomPricing ? t('Custom Pricing','Pricing Plans') : billingPeriod === 'monthly' ? `$${plan.monthly_price}` : `$${plan.annual_price}`}
                  </Text>
                  {!plan.hasCustomPricing && (
                    <Text variant="bodyMd" color="subdued">{plan.currency} / {billingPeriod === 'annual' ? 'year' : 'month'}</Text>
                  )}
                </div>

                {/* Usage Limit */}
                <div style={{ marginBottom: 24 }}>
                  <Badge tone="subdued" size="medium" style={{ backgroundColor: '#F6F6F7', color: '#222' }}>
                    {t(plan.usage_limit, 'Pricing Plans')}
                  </Badge>
                </div>

                {/* Features */}
                <div style={{ marginBottom: 32 }}>
                  <Text variant="bodyMd" fontWeight="semibold" style={{ marginBottom: 16 }}>
                    {plan.name === 'Pro'
                      ? 'Everything in Free, plus:'
                      : plan.name === 'Premium'
                        ? 'Everything in Pro, plus:'
                        : 'Basic Wishlist Features'}
                  </Text>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {Array.isArray(plan.features) && plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 16, color: '#222', minWidth: 20 }}>{feature.icon}</span>
                        <Text variant="bodyMd" color="subdued">{t(feature.text, 'Pricing Plans')}</Text>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  variant={plan.name === activePlanName ? 'primary' : 'secondary'}
                  size="large"
                  fullWidth
                  onClick={() => handleSubscribe(plan)}
                  disabled={loadingPlanId === plan.id}
                  style={{ 
                    backgroundColor: plan.name === activePlanName ? '#F6F6F7' : 'white', 
                    color: '#222', 
                    border: plan.name === activePlanName ? 'none' : '1px solid #222', 
                    fontWeight: 600,
                    opacity: loadingPlanId === plan.id ? 0.7 : 1
                  }}
                >
                  {loadingPlanId === plan.id ? (
                    <Box paddingInlineStart="200">
                      <Spinner size="small" />
                    </Box>
                  ) : (
                    plan.name === activePlanName ? 'Current Plan' : plan.name === 'Enterprise' ? "Let's Chat" : `Start ${plan.name}`
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E1E3E5', overflow: 'hidden' }}>
          {/* Table Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(3, 1fr)', background: '#FFFFFF', borderBottom: '1px solid #E1E3E5', fontSize: 13 }}>
            <div style={{ padding: '8px 14px', color: '#222', display: 'flex', flexDirection: 'column', gap: 6, minHeight: 64}}>
              <div style={{ fontWeight: 700 }}>{t('All Plans','Pricing Plans')}</div>
              <div style={{ color: '#637381', fontSize: 12 }}>{t('View plans and find your best match','Pricing Plans')}</div>
            </div>
            <div style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 64, textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div style={{ fontWeight: 700 }}>{t('Free','Pricing Plans')}</div>
              </div>
              <div style={{ color: '#637381', fontSize: 12 }}>{t('New businesses','Pricing Plans')}</div>
            </div>
            <div style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 64, textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div style={{ fontWeight: 700 }}>{t('Pro','Pricing Plans')}</div>
                <span style={{ background: '#5C6AC4', color: 'white', borderRadius: 8, padding: '2px 8px', fontSize: 12, lineHeight: 1 }}>{t('Best Match','Pricing Plans')}</span>
              </div>
              <div style={{ color: '#637381', fontSize: 12 }}>{t('Mid-to-large stores','Pricing Plans')}</div>
            </div>
            <div style={{ padding: '8px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 64, textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div style={{ fontWeight: 700 }}>{t('Premium','Pricing Plans')}</div>
              </div>
              <div style={{ color: '#637381', fontSize: 12 }}>{t('Large-scale stores','Pricing Plans')}</div>
            </div>
          </div>

          {(() => {
            const check = <span style={{ fontSize: 14, lineHeight: 1, display: 'inline-block' }}>✓</span>;
            const dash = <span style={{ color: '#B0B7C3', fontSize: 14, lineHeight: 1, display: 'inline-block' }}>—</span>;

            const sectionTitle = (title) => (
              <div style={{ background: '#FFFFFF', color: '#2A2E34', fontWeight: 700, padding: '8px 14px', borderTop: '1px solid #E1E3E5', borderBottom: '1px solid #E1E3E5', fontSize: 13 }}>
                {title}
              </div>
            );

            const row = (label, free, pro, premium, opts = {}) => (
              <div
                style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(3, 1fr)', alignItems: 'center', borderBottom: '1px solid #E1E3E5', fontSize: 13, backgroundColor: '#FFFFFF', transition: 'background-color 120ms ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
              >
                <div style={{ padding: '14px 14px', color: '#111827', fontWeight: 400, lineHeight: 1.2 }}>
                  {opts.link ? <a href={opts.link} target="_blank" rel="noreferrer" style={{ color: '#1F6FEB', textDecoration: 'underline', fontWeight: 400 }}>{label}</a> : label}
                </div>
                <div style={{ padding: '14px 14px', lineHeight: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{free ?? dash}</div>
                <div style={{ padding: '14px 14px', lineHeight: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{pro ?? dash}</div>
                <div style={{ padding: '14px 14px', lineHeight: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{premium ?? dash}</div>
              </div>
            );

            return (
              <div>
                {sectionTitle(t('Capture Shopper Intent','Pricing Plans'))}
                {row(t('Add to Wishlist','Pricing Plans'), check, check, check)}
                {row(t('View Customer Wishlists','Pricing Plans'), check, check, check)}
                {row(t('Collections & Quick View Support','Pricing Plans'), check, check, check)}
                {row(t('Email Opt-Ins','Pricing Plans'), dash, check, check)}

                {sectionTitle(t('Nudge Shoppers back to your Store','Pricing Plans'))}
                {row(t('Share Wishlist','Pricing Plans'), check, check, check)}
                {/* {row('3rd Party Integrations', dash, check, check)} */}
                {row(t('Automated Alerts','Pricing Plans'), dash, check, check)}
                {/* {row('Retargeting (Facebook & Instagram)', dash, check, check)} */}

                {sectionTitle(t('Tailoring Shopper Experience','Pricing Plans'))}
                {/* {row('Shopify POS', dash, '$49/mo add-on', '$49/mo add-on')} */}
                {row(t('REST & JavaScript API Customization','Pricing Plans'), dash, dash, check)}

                {sectionTitle(t('Support','Pricing Plans'))}
                {/* {row('24x5 Support', dash, check, check)} */}
                {row(t('Lifetime Wishlist Actions','Pricing Plans'), '500', '50,000', '125,000')}
              </div>
            );
          })()}
        </div>
      </div>
    </Frame>
  );
}

export default Pricing;
