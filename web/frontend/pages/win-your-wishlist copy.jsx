import React, { useState, useRef, useContext, useEffect } from 'react';
import { Page, Layout, Card, Text, TextField, InlineGrid, Button, Popover, Box, Icon, Frame } from '@shopify/polaris';
import DateRangePicker from '../components/DateRangePicker';
import { useLanguage } from '../components';
import { CalendarIcon } from '@shopify/polaris-icons';
import wishlistwin from '../assets/wishlistwin.webp';
import { AppContext } from '../components';
import { useAppBridge } from "@shopify/app-bridge-react";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";

export default function WinYourWishlist() {
  const { t } = useLanguage();
  const { apiUrl } = useContext(AppContext);
  const appBridge = useAppBridge();
  const authFetch = useAuthenticatedFetch();
  const [loadingThemes, setLoadingThemes] = useState(false);

  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date(new Date().setDate(new Date().getDate()+7)) });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [winners, setWinners] = useState('5');
  const [voucher, setVoucher] = useState('100');

  const [shop, setShop] = useState('');
  const [apikey, setApikey] = useState('');
  const [themeId, setThemeId] = useState('');

  const fetchThemes = async () => {
    setLoadingThemes(true);
    try {
      const token = await getSessionToken(appBridge);
      if (!token) return;

      try {
        await authFetch(`${apiUrl}ensure-templates`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        // ignore
      }

      const res = await authFetch(`${apiUrl}get-themes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      onClick={() => setPickerOpen(true)}
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
        background: '#fff',
        boxSizing: 'border-box',
        cursor: 'pointer'
      }}
    >
      <span style={{ color: '#111827', fontSize: 14 }}>{rangeLabel}</span>
      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
        <Icon source={CalendarIcon} tone="base" />
      </span>
    </div>
  );

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
          <Card>
            <Box padding="4">
              <Text variant="headingMd" as="h2" fontWeight="bold">
                1. {t('Add basic details', 'Marketing')}
              </Text>
              <div style={{ height: 12 }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
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
                  <TextField value={winners} onChange={setWinners} autoComplete="off" />
                </div>
                <div style={fieldWrapper}>
                  <Text variant="bodySm" as="p" color="subdued" style={fieldLabel}>
                    {t('Voucher amount for each winner', 'Marketing')}
                  </Text>
                  <TextField value={voucher} onChange={setVoucher} autoComplete="off" />
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <Button variant="primary">{t('Save', 'Marketing')}</Button>
              </div>
            </Box>
          </Card>
        </div>

        {/* Enable floating widget card */}
        <div style={{ marginTop: 16 }}>
          <Card>
            <Box padding="4">
              <Text variant="headingMd" as="h2" fontWeight="bold" style={{ marginBottom: 6 }}>
                2. Enable floating widget
              </Text>
              <div style={{ display: 'grid', marginTop:10, gridTemplateColumns: '340px 1fr', gap: 16, alignItems: 'center' }}>
                <div style={{ borderRadius: 8, overflow: 'hidden', background: '#F6F6F7' }}>
                  <img src={wishlistwin} alt="Floating widget preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <Text variant="bodySm" as="p" color="subdued" style={{ marginBottom: 14 }}>
                    Boost campaign visibility with a floating widget
                  </Text>
                  <Text variant="bodySm" as="p" color="subdued" style={{ marginBottom: 14 }}>
                    Get more shoppers to sign up and wishlist products by enabling our ready-to-use Win Your Wishlist floating widget. You can control the look and feel on the theme editor.
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
                      The widget will automatically appear on your store during {formatBannerRange(dateRange.start, dateRange.end)}
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
                        'Enable on theme editor ↗'
                      )}
                    </Button>
                  </div>
                 
                </div>
              </div>
            </Box>
          </Card>
        </div>
      </div>
      
    </Frame>
  );
}


