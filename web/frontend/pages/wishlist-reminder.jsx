import React, { useState, useContext, useEffect } from 'react';
import { Frame, Card, Text, InlineStack, Button, Badge, Box, TextField, Checkbox, Select, Modal } from '@shopify/polaris';
import { AppContext } from '../components';
import { useLanguage } from '../components';
import { useAppBridge } from '@shopify/app-bridge-react';
import { getSessionToken } from '@shopify/app-bridge-utils';
import wishlistreminderimg from '../assets/wishlistreminderimg.webp';

export default function WishlistReminder() {
  const { apiUrl } = useContext(AppContext);
  const { t } = useLanguage();
  const appBridge = useAppBridge();
  const [delay, setDelay] = useState('24');
  const [unit, setUnit] = useState('hours');
  const [smartSend, setSmartSend] = useState(true);
  const [active, setActive] = useState(true);
  const [providerName, setProviderName] = useState('SMTP');
  const [providerBadge, setProviderBadge] = useState('SMTP');
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isFreePlan, setIsFreePlan] = useState(false);
  const [planName, setPlanName] = useState('');

  // Fetch current values from subscription notifications
  useEffect(() => {
    (async () => {
      try {
        const token = await getSessionToken(appBridge);
        const res = await fetch(`${apiUrl}subscription-notifications`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const json = await res.json();
        const list = json?.subscription_notifications || [];
        const reminder = list.find(n => (n.title || '').toLowerCase().includes('wishlist reminder'));
        if (reminder) {
          if (reminder.reminder_value) setDelay(String(reminder.reminder_value));
          if (reminder.reminder_time_unit) setUnit(String(reminder.reminder_time_unit));
          if (typeof reminder.active_status !== 'undefined') setActive(Boolean(reminder.active_status));
        }
        // Load provider connection
        const provRes = await fetch(`${apiUrl}notification-providers`, { headers: { Authorization: `Bearer ${token}` } });
        if (provRes.ok) {
          const prov = await provRes.json();
          const p = prov?.email_provider || 'smtp';
          setProviderName(p ? p.toUpperCase() : 'SMTP');
          setProviderBadge(p ? p.toUpperCase() : 'SMTP');
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [apiUrl]);

  // Check active subscription plan
  useEffect(() => {
    (async () => {
      try {
        const token = await getSessionToken(appBridge);
        const planRes = await fetch(`${apiUrl}subscription/active`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (planRes.ok) {
          const data = await planRes.json();
          const name = data?.data?.plan_name || null;
          setPlanName(name || '');
          setIsFreePlan(!name || String(name).toLowerCase() === 'free');
        } else {
          setIsFreePlan(true);
        }
      } catch (e) {
        setIsFreePlan(true);
      }
    })();
  }, [apiUrl]);

  const handleToggleActive = async () => {
    if (isFreePlan) return; // gated on Free plan
    setIsToggling(true);
    try {
      const token = await getSessionToken(appBridge);
      const res = await fetch(`${apiUrl}subscription-notifications`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      const list = json?.subscription_notifications || [];
      const reminder = list.find(n => (n.title || '').toLowerCase().includes('wishlist reminder'));
      if (!reminder) return;
      const id = reminder.id;
      const next = !active ? 1 : 0;
      await fetch(`${apiUrl}subscription-notification-status-save/${id}?active_status=${next}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      setActive(!active);
    } catch (e) {
      // ignore
    } finally {
      setIsToggling(false);
    }
  };

  const handleSaveSettings = async () => {
    if (isFreePlan) return; // gated on Free plan
    setIsSaving(true);
    try {
      const token = await getSessionToken(appBridge);
      const res = await fetch(`${apiUrl}subscription-notifications`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      const list = json?.subscription_notifications || [];
      const reminder = list.find(n => (n.title || '').toLowerCase().includes('wishlist reminder'));
      if (!reminder) return;
      const response = await fetch(`${apiUrl}subscription-notification-save/${reminder.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          reminder_value: parseInt(delay, 10),
          reminder_time_unit: unit,
          active_status: active ? 1 : 0
        })
      });
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
    } catch (e) {
      // ignore
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Frame>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        width: '100%',
        background: '#F3F3F3',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        padding: 24
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <InlineStack gap="3" align="center">
            <Text variant="headingLg" as="h1" fontWeight="bold">{t('Wishlist Reminder', 'Marketing')}</Text>
            <Box style={{marginLeft: 10, marginTop:2}}> <Badge tone={active ? 'success' : 'critical'}>{active ? t('Live','Marketing') : t('Off','Marketing')}</Badge></Box>
            {isFreePlan && (
              <Box style={{marginLeft: 8, marginTop:2}}>
                <Badge tone="attention">{t('Upgrade to access','Pricing Plans')}</Badge>
              </Box>
            )}
          </InlineStack>
          <Button tone="critical" variant="secondary" onClick={handleToggleActive} loading={isToggling} disabled={isFreePlan}>{active ? t('Turn Off Alert','Marketing') : t('Turn On Alert','Marketing')}</Button>
        </div>

        {/* Connection banner */}
        <Card>
          <Box padding="4">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>🕊️</div>
              <Text>
                <b>{providerName || 'SMTP'}</b> {t('has been connected as your marketing integration for', 'Marketing')} <b>{t('Email', 'Marketing')}</b>
              </Text>
            </div>
          </Box>
        </Card>

        {/* Step 1 */}
        <div style={{ marginTop: 16}}>
          <Card>
            <Box padding="4" >
            
              <Text variant="headingSm" as="h3" fontWeight="bold">{t('Step 1: Setup Configuration', 'Marketing')}</Text>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Text>{t('If a shopper adds products to Wishlist, then send reminder', 'Marketing')}</Text>
                <div style={{ width: 140 }}>
                  <TextField value={delay} type="number" onChange={setDelay} autoComplete="off" disabled={isFreePlan || !active} min="1" error={!delay || isNaN(delay) || parseInt(delay, 10) < 1 ? 'Enter a valid number' : ''} />
                </div>
                <div style={{ width: 120 }}>
                  <Select options={[{label:t('Hours','Notifications'), value:'hours'},{label:t('Days','Notifications'), value:'days'}]} value={unit} onChange={setUnit} disabled={isFreePlan || !active} />
                </div>
                
              
                </div>
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 12, color: '#6D7175' }}>{t('Smart Send', 'Marketing')}</p>
              </div>
              <div style={{ width: 140, marginTop: 7 }}>
                  <Button
                    primary
                    onClick={handleSaveSettings}
                    loading={isSaving}
                    disabled={isFreePlan || !active || !delay || isNaN(delay) || parseInt(delay, 10) < 1}
                   
                  >
                    {t('Save Settings', 'Marketing')}
                  </Button>
                </div>
            </Box>
          </Card>
        </div>

        {/* Step 2 */}
        <div style={{ marginTop: 16 }}>
          <Card>
            <Box padding="4">
              <Text variant="headingSm" as="h3" fontWeight="bold">{t('Step 2: Review Email Content', 'Marketing')}</Text>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
                <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: 16, background: '#fff', height: 380 }}>
                  {/* Placeholder for email preview */}
                  <img src={wishlistreminderimg} alt="Email Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <Card>
                <div style={{padding: 100}}>
                  <Text>
                    {t('Use this pre-designed template', 'Marketing')}
                  </Text>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <Button disabled={isFreePlan || !active} onClick={() => setShowTestModal(true)}>{t('Send Test Email', 'Marketing')}</Button>
                    {/* <Button variant="tertiary">Chat with support to customize</Button> */}
                  </div>
                </div>
                </Card>
              </div>
            </Box>
          </Card>
        </div>

        {/* Send Test Email Modal */}
        {showTestModal && (
          <Modal
            open
            onClose={() => setShowTestModal(false)}
            title={t('Send test email', 'Marketing')}
            primaryAction={{ content: t('Send', 'Marketing'), onAction: async () => {
              try {
                const token = await getSessionToken(appBridge);
                // Endpoint to send a wishlist reminder email using saved template to arbitrary email
                await fetch(`${apiUrl}notifications/test-send`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ type: 'wishlist_reminder', email: testEmail })
                });
                setShowTestModal(false);
              } catch (e) {
                setShowTestModal(false);
              }
            }}}
            secondaryActions={[{ content: t('Cancel', 'Marketing'), onAction: () => setShowTestModal(false) }]}
          >
            <Modal.Section>
              <TextField label={t('Recipient email', 'Marketing')} type="email" value={testEmail} onChange={setTestEmail} autoComplete="email" placeholder="name@example.com" />
            </Modal.Section>
          </Modal>
        )}
      </div>
    </Frame>
  );
}



