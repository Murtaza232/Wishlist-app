import React, { useState, useRef, useContext, useEffect } from 'react';
import { Page, Layout, Card, Text, TextField, InlineGrid, Button, Popover, Box, Icon, Frame, InlineStack, Badge } from '@shopify/polaris';
import DateRangePicker from '../components/DateRangePicker';
import { useLanguage } from '../components';
import { CalendarIcon, ImportIcon } from '@shopify/polaris-icons';
import wishlistwin from '../assets/wishlistwin.webp';
import { AppContext } from '../components';
import { useAppBridge } from "@shopify/app-bridge-react";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import Skelton from '../components/Skelton';

export default function WinYourWishlist() {
  const { t } = useLanguage();
  const { apiUrl } = useContext(AppContext);
  const appBridge = useAppBridge();
  const authFetch = useAuthenticatedFetch();
  const [loadingThemes, setLoadingThemes] = useState(false);
  const [isLoadingCampaign, setIsLoadingCampaign] = useState(true);

  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date(new Date().setDate(new Date().getDate()+7)) });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [winners, setWinners] = useState('5');
  const [voucher, setVoucher] = useState('100');

  const [shop, setShop] = useState('');
  const [apikey, setApikey] = useState('');
  const [themeId, setThemeId] = useState('');

  const [saving, setSaving] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const [metrics, setMetrics] = useState({ total_signups: 0, wishlisted_shoppers: 0, wishlist_actions: 0, wishlist_value: 0 });

  const isLocked = !!campaign;

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
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        start_date: dateRange.start.toISOString().slice(0,10),
        end_date: dateRange.end.toISOString().slice(0,10),
        total_winners: parseInt(winners || '0', 10),
        voucher_amount: parseFloat(voucher || '0'),
        title: t('Win Your Wishlist', 'Marketing')
      };
      const token = await getSessionToken(appBridge);
      const res = await authFetch(`${apiUrl}campaigns/save?shop=${encodeURIComponent(shop || '')}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json?.success) {
        setCampaign(json.data);
        setMetrics({ total_signups: 0, wishlisted_shoppers: 0, wishlist_actions: 0, wishlist_value: 0 });
        // Pull fresh metrics immediately
        await fetchCurrentCampaign();
      } else {
        console.error('Save campaign error', json);
      }
    } catch (e) {
      console.error('Save campaign failed', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadCsv = async () => {
    try {
      const token = await getSessionToken(appBridge);
      const res = await authFetch(`${apiUrl}campaigns/export?shop=${encodeURIComponent(shop || '')}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'campaign_signups.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download CSV failed', e);
    }
  };

  useEffect(() => { fetchCurrentCampaign(); }, [apiUrl]);

  const fetchThemes = async () => {
    setLoadingThemes(true);
    try {
      const token = await getSessionToken(appBridge);
      if (!token) return;

      try {
        await authFetch(`${apiUrl}ensure-templates`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {}

      const res = await authFetch(`${apiUrl}get-themes`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch themes');
      const data = await res.json();
      setShop(data.shop || '');
      setApikey(data.apikey || '');
      setThemeId(data.activeTheme || '');
    } catch (e) {
      console.error('get-themes error', e);
    } finally {
      setLoadingThemes(false);
    }
  };

  useEffect(() => { fetchThemes(); }, [apiUrl]);

  const appEmbedUrl = (shop && themeId && apikey)
    ? `https://admin.shopify.com/store/${shop}/themes/${themeId}/editor?context=apps&appEmbed=${apikey}/wishlist_configuration`
    : '';

  const fieldWrapper = { display: 'flex', flexDirection: 'column', gap: 6 };
  const fieldLabel = { marginBottom: 6 };

  const formatBannerRange = (start, end) => {
    const fmt = (d) => d.toLocaleString('en-US', { month: 'short', day: 'numeric' });
    const year = end.getFullYear();
    return `${fmt(start)} – ${fmt(end)}, ${year}`;
  };

  const rangeLabel = `${dateRange.start.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${dateRange.end.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  const inputLikeActivator = (
    <div
      onClick={() => !isLocked && setPickerOpen(true)}
      role="button"
      tabIndex={0}
      style={{
        width: '100%',
        height: 33,
        border: '1px solid rgb(129, 125, 125)',
        borderRadius: 8,
        padding: '8px 36px 8px 12px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        background: isLocked ? '#F6F6F7' : '#fff',
        boxSizing: 'border-box',
        cursor: isLocked ? 'not-allowed' : 'pointer',
        color: isLocked ? '#6D7175' : undefined,
        pointerEvents: isLocked ? 'none' : 'auto'
      }}
    >
      <span style={{ color: '#111827', fontSize: 14 }}>{rangeLabel}</span>
      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
        <Icon source={CalendarIcon} tone="base" />
      </span>
    </div>
  );

  const isLoading = isLoadingCampaign || loadingThemes;

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
        }}
      >
        <div>
          <div style={{
            fontSize: 20,
            fontWeight: 700,
            margin: 0,
            color: '#222',
            letterSpacing: 0.5,
            marginBottom: 8
          }}>
            {t('Win your wishlist', 'Marketing')}
          </div>
        </div>
        <div>
          {isLoading ? (
            <Card>
              <Box padding="4">
                <Skelton />
                <Skelton />
              </Box>
            </Card>
          ) : (
            <Card>
              <Box padding="4">
                <Text variant="headingMd" as="h2" fontWeight="bold">
                  1. {t('Add basic details', 'Marketing')}
                </Text>
                <div style={{ height: 12 }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, opacity: isLocked ? 0.7 : 1 }}>
                  <div style={fieldWrapper}>
                    <Text variant="bodySm" as="p" color="subdued" style={fieldLabel}>
                      {t('Campaign Duration', 'Marketing')}
                    </Text>
                    <DateRangePicker
                      startDate={dateRange.start}
                      endDate={dateRange.end}
                      onDateChange={({ start, end }) => {
                        setDateRange({ start, end });
                        setPickerOpen(false);
                      }}
                      activator={inputLikeActivator}
                      open={pickerOpen}
                      onClose={() => setPickerOpen(false)}
                    />
                    <Text variant="bodySm" as="p" color="subdued" style={{ marginTop: 8 }}>
                      {t('We recommend running campaign for 1 month', 'Marketing')}
                    </Text>
                  </div>
                  <div style={fieldWrapper}>
                    <Text variant="bodySm" as="p" color="subdued" style={fieldLabel}>
                      {t('Total number of winners', 'Marketing')}
                    </Text>
                    <TextField value={winners} onChange={setWinners} autoComplete="off" disabled={isLocked} />
                  </div>
                  <div style={fieldWrapper}>
                    <Text variant="bodySm" as="p" color="subdued" style={fieldLabel}>
                      {t('Voucher amount for each winner', 'Marketing')}
                    </Text>
                    <TextField value={voucher} onChange={setVoucher} autoComplete="off" disabled={isLocked} />
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <Button variant="primary" disabled={isLocked || saving || !shop} onClick={handleSave}>
                    {saving ? 'Saving…' : t('Save', 'Marketing')}
                  </Button>
                  {isLocked && (
                    <span style={{ marginLeft: 8 }}>
                      <Badge tone="success">Active</Badge>
                    </span>
                  )}
                </div>
              </Box>
            </Card>
          )}
        </div>

        {/* Show these only after campaign is saved */}
        {isLocked && (
          <>
            {/* Campaign Performance */}
            <div style={{ marginTop: 16 }}>
              <Card>
                <Box padding="4">
                  <Text variant="headingMd" as="h2" fontWeight="bold" style={{ marginBottom: 8 }}>
                    {t('Campaign performance', 'Marketing')}
                  </Text>
                  <Text variant="bodySm" as="p" color="subdued" style={{ marginBottom: 16 }}>
                    {t('Only includes data from the period when the campaign is live', 'Marketing')}
                  </Text>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(160px, 1fr))', gap: 16 }}>
                    {[{label:t('Total signups', 'Marketing'), value: metrics.total_signups}, {label:t('Wishlisted shoppers', 'Marketing'), value: metrics.wishlisted_shoppers}, {label:t('Total wishlist actions', 'Marketing'), value: metrics.wishlist_actions}, {label:t('Wishlist value', 'Marketing'), value: metrics.wishlist_value}].map((m, i) => (
                      <div key={i} style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: 16, background: '#fff' }}>
                        <Text variant="bodySm" as="p" color="subdued">{m.label}</Text>
                        <Text variant="headingLg" as="p" fontWeight="bold">{m.value}</Text>
                      </div>
                    ))}
                  </div>
                </Box>
              </Card>
            </div>

            {/* Next Steps */}
            <div style={{ marginTop: 16 }}>
              <Card>
                <Box padding="4">
                  <Text variant="headingMd" as="h2" fontWeight="bold" style={{ marginBottom: 8 }}>
                    {t('Next Step', 'Marketing')}
                  </Text>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #E5E7EB', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                    <div>
                      <Text variant="bodyMd" fontWeight="bold"> {t('Download participant data', 'Marketing')}</Text>
                      <Text variant="bodySm" color="subdued">{t('Get a CSV file with details on participant activity, including wishlist engagement.', 'Marketing')}</Text>
                    </div>
                    <Button icon={ImportIcon} onClick={handleDownloadCsv}>{t('Download CSV', 'Marketing')}</Button>
                  </div>
                  {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #E5E7EB', borderRadius: 8, padding: 12 }}>
                    <div>
                      <Text variant="bodyMd" fontWeight="bold">2. Re-engage participants</Text>
                      <Text variant="bodySm" color="subdued">Explore our playbook for proven strategies to reconnect with both winners and non-winners through effective email campaigns.</Text>
                    </div>
                    <Button onClick={() => window.open('https://example.com/playbook', '_blank')}>View Playbook</Button>
                  </div> */}
                </Box>
              </Card>
            </div>
          </>
        )}

        {/* Hide these cards when saved */}
        {!isLocked && (
          <>
            {/* Enable floating widget card */}
            <div style={{ marginTop: 16 }}>
              <Card>
                <Box padding="4">
                  <Text variant="headingMd" as="h2" fontWeight="bold" style={{ marginBottom: 6 }}>
                    2. {t('Enable floating widget', 'Marketing')}
                  </Text>
                  <div style={{ display: 'grid', marginTop:10, gridTemplateColumns: '340px 1fr', gap: 16, alignItems: 'center' }}>
                    <div style={{ borderRadius: 8, overflow: 'hidden', background: '#F6F6F7' }}>
                      <img src={wishlistwin} alt="Floating widget preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <Text variant="bodySm" as="p" color="subdued" style={{ marginBottom: 14 }}>
                        {t('Boost campaign visibility with a floating widget', 'Marketing')}
                      </Text>
                      <Text variant="bodySm" as="p" color="subdued" style={{ marginBottom: 14 }}>
                        {t('Get more shoppers to sign up and wishlist products by enabling our ready-to-use Win Your Wishlist floating widget. You can control the look and feel on the theme editor.', 'Marketing')}
                      </Text>
                      <div style={{
                        background: '#E6F0FF',
                        border: '1px solid #C7DBFF',
                        color: '#1E40AF',
                        padding: '10px 12px',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 12
                      }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#3B82F6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>i</div>
                        <Text variant="bodySm" as="span">
                          {t('The widget will automatically appear on your store during', 'Marketing')} {formatBannerRange(dateRange.start, dateRange.end)}
                        </Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Button size="medium" variant="primary" onClick={() => { if (appEmbedUrl && !loadingThemes) window.open(appEmbedUrl, '_blank'); }} disabled={!appEmbedUrl || loadingThemes}>
                          {loadingThemes ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                              Loading...
                            </div>
                          ) : (
                            t('Enable on theme editor ↗', 'Marketing')
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Box>
              </Card>
            </div>

            {/* Setup landing page card */}
            <div style={{ marginTop: 16 }}>
              <Card>
                <Box padding="4">
                  <Text variant="headingMd" as="h2" fontWeight="bold" style={{ marginBottom: 6 }}>
                    3. {t('Setup landing page', 'Marketing')}
                  </Text>
                  <div style={{ display: 'grid', marginTop:10, gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'stretch' }}>
                    {/* Left: Text content preview (not an image) */}
                    <div style={{
                      border: '1px solid #E5E7EB',
                      borderRadius: 8,
                      background: '#FFFFFF',
                      padding: 16,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <Text variant="bodySm" as="p" fontWeight="bold" style={{ letterSpacing: 0.3 }}>
                            {t('UP TO','Marketing')} ${voucher} {t('WORTH OF GIFT VOUCHER', 'Marketing')}
                        </Text>
                        <Text variant="bodySm" as="p" color="subdued" style={{ marginTop: 6 }}>
                          {t('Enter our competition to Win your most-loved items. Prizes crowned for you!', 'Marketing')}
                        </Text>
                      </div>
                      <div style={{ textAlign: 'center', marginTop: 10 }}>
                        <Text variant="bodySm" as="p" fontWeight="bold">{t('Follow These Steps','Marketing')}</Text>
                        <div style={{ marginTop: 6, lineHeight: 1.4, fontSize: 12, color: '#374151' }}>
                          <div>{t('Step 1: Login or create account on your store.', 'Marketing')}</div>
                          <div>{t('Step 2: Add to your wishlist by clicking the heart symbol.', 'Marketing')}</div>
                          <div>{t('Step 3: Click on wishlist then see your voucher. Track the locker and draw later.', 'Marketing')}</div>
                          <div>{t('Step 4: Share your list to your friends/family/social media to increase entry in the competition.', 'Marketing')}</div>
                        </div>
                        <div style={{ marginTop: 10, fontSize: 11, color: '#6B7280' }}>
                          <div>{t('T&C apply*', 'Marketing')}</div>
                          <div style={{ marginTop: 4 }}>
                            {t('The competition runs from', 'Marketing')} {formatBannerRange(dateRange.start, dateRange.end)}, {t('offering a chance to win your wishlist up to $500. The winner will be contacted exclusively by the store.', 'Marketing')}
                          </div>
                        </div>
                      </div>
                    </div>
                  
                      <Card>
                      <div style={{padding:100}}>
                      <Text variant="headingSm" as="h3" fontWeight="bold" style={{ marginBottom: 8 }}>
                        {t('Promote your contest effectively with a landing page', 'Marketing')}
                      </Text>
                      <Text variant="bodySm" as="p" color="subdued" style={{ marginBottom: 14 }}>
                        {t('Create a dedicated landing page to share contest details with your shoppers – what the contest is about, how to enter, when it ends, and what they could win.', 'Marketing')}
                      </Text>
                      </div>
                      </Card>
                      </div>

                </Box>
              </Card>
            </div>
          </>
        )}
      </div>
    </Frame>
  );
}


