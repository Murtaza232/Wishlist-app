import React, { useState, useEffect, useContext } from 'react';
import { Frame, Card, Text, InlineStack, Button, Badge, Box, TextField, Modal } from '@shopify/polaris';
import { AppContext } from '../components';
import { useLanguage } from '../components';
import Skelton from '../components/Skelton';
import { useAppBridge } from '@shopify/app-bridge-react';
import { getSessionToken } from '@shopify/app-bridge-utils';
import savedforlaterimg from '../assets/savedforlaterimg.webp';

export default function SavedForLater() {
  const { apiUrl } = useContext(AppContext);
  const appBridge = useAppBridge();
  const { t } = useLanguage();
  const [reminderDays, setReminderDays] = useState('3');
  const [active, setActive] = useState(true);
  const [providerName, setProviderName] = useState('SMTP');
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isFreePlan, setIsFreePlan] = useState(false);
  const [planName, setPlanName] = useState('');

  // Prefill from API
  useEffect(() => {
    (async () => {
      try {
        const token = await getSessionToken(appBridge);
        const res = await fetch(`${apiUrl}subscription-notifications`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (res.ok) {
          const json = await res.json();
          const list = json?.subscription_notifications || [];
          const savedForLater = list.find(n => (n.title || '').toLowerCase().includes('saved for later'));
          if (savedForLater) {
            if (savedForLater.reminder_days) setReminderDays(String(savedForLater.reminder_days));
            if (typeof savedForLater.active_status !== 'undefined') setActive(Boolean(savedForLater.active_status));
          }
        }
        const provRes = await fetch(`${apiUrl}notification-providers`, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        if (provRes.ok) {
          const prov = await provRes.json();
          const p = prov?.email_provider || 'smtp';
          setProviderName(p ? p.toUpperCase() : 'SMTP');
        }
      } catch (e) {
        console.error('Error fetching saved for later settings:', e);
      } finally {
        setIsLoading(false);
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
      const res = await fetch(`${apiUrl}subscription-notifications`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const json = await res.json();
      const list = json?.subscription_notifications || [];
      const savedForLater = list.find(n => (n.title || '').toLowerCase().includes('saved for later'));
      if (!savedForLater) return;
      
      const id = savedForLater.id;
      const next = !active ? 1 : 0;
      await fetch(`${apiUrl}subscription-notification-status-save/${id}?active_status=${next}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      setActive(!active);
    } catch (e) {
      console.error('Error toggling saved for later status:', e);
    } finally {
      setIsToggling(false);
    }
  };

  const handleSaveSettings = async () => {
    if (isFreePlan) return; // gated on Free plan
    setIsSaving(true);
    try {
      const token = await getSessionToken(appBridge);
      const res = await fetch(`${apiUrl}subscription-notifications`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const json = await res.json();
      const list = json?.subscription_notifications || [];
      const savedForLater = list.find(n => (n.title || '').toLowerCase().includes('saved for later'));
      if (!savedForLater) return;
      
      const response = await fetch(`${apiUrl}subscription-notification-save/${savedForLater.id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          reminder_days: parseInt(reminderDays, 10),
          active_status: active ? 1 : 0
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      // Show success message or update UI as needed
    } catch (e) {
      console.error('Error saving saved for later settings:', e);
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
          <InlineStack gap="5" align="center">
            <Text variant="headingLg" as="h1" fontWeight="bold">{t('Saved for Later Reminder','Marketing')}</Text>
            <Box style={{marginLeft: 10, marginTop:2}}> 
              <Badge tone={active ? 'success' : 'critical'}>{active ? t('Live','Marketing') : t('Off','Marketing')}</Badge>
            </Box>
            {isFreePlan && (
              <Box style={{marginLeft: 8, marginTop:2}}>
                <Badge tone="attention">{t('Upgrade to access','Pricing Plans')}</Badge>
              </Box>
            )}
          </InlineStack>
          <Button 
            tone="critical" 
            variant="secondary" 
            onClick={handleToggleActive}
            loading={isToggling}
            disabled={isFreePlan}
          >
            {active ? t('Turn Off Reminder','Marketing') : t('Turn On Reminder','Marketing')}
          </Button>
        </div>

        {/* Connection banner */}
        <Card>
          <Box padding="4">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
              <div style={{ 
                width: 28, 
                height: 28, 
                borderRadius: 6, 
                background: '#EEF2FF', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginRight: 8 
              }}>
                ⏰
              </div>
              <Text>
                <b>{providerName || 'SMTP'}</b> {t("has been connected as your marketing integration for",'Marketing')} <b>{t('Email','Marketing')}</b>
              </Text>
            </div>
          </Box>
        </Card>

        {isLoading && (
          <div style={{ marginTop: 16 }}>
            <Card>
              <Box padding="4">
                <Skelton />
                <Skelton />
              </Box>
            </Card>
          </div>
        )}

        {/* Step 1 */}
        {!isLoading && (
        <div style={{ marginTop: 16 }}>
          <Card>
            <Box padding="4">
              <Text variant="headingSm" as="h3" fontWeight="bold">{t('Step 1: Setup Configuration','Marketing')}</Text>
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Text>{t('Send a reminder','Marketing')}</Text>
                <div style={{ width: 80 }}>
                  <TextField
                    value={reminderDays}
                    type="number"
                    onChange={setReminderDays}
                    autoComplete="off"
                    disabled={isFreePlan || !active}
                    min="1"
                    error={!reminderDays || isNaN(reminderDays) || parseInt(reminderDays, 10) < 1 ? 'Please enter a valid number of days' : ''}
                  />
                </div>
                <Text>{t('days after an item is saved for later','Marketing')}</Text>
                <div style={{ width: '100%', marginTop: 12 }}>
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={isFreePlan || !active || !reminderDays || isNaN(reminderDays) || parseInt(reminderDays, 10) < 1}
                    primary
                    loading={isSaving}
                  >
                    {t('Save Settings','Marketing')}
                  </Button>
                </div>
              </div>
            </Box>
          </Card>
        </div>
        )}

        {/* Step 2 */}
        {!isLoading && (
        <div style={{ marginTop: 16 }}>
          <Card>
            <Box padding="4">
              <Text variant="headingSm" as="h3" fontWeight="bold">{t('Step 2: Review Email Content','Marketing')}</Text>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12, alignItems: 'stretch' }}>
                <Card>
                  <div style={{ padding: 16, height: '100%' }}>
                    <img 
                      src={savedforlaterimg} 
                      alt="Saved for Later Email Preview" 
                      style={{ 
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        borderRadius: 4
                      }} 
                    />
                  </div>
                </Card>
                <Card>
                  <div style={{ padding: 100 }}>
                  <Text as="p" variant="bodyMd">
                    {t('Email Description','Marketing')}
                  </Text>
                  <ul style={{ paddingLeft: 20, margin: '12px 0' }}>
                    <li><Text as="span">{t('A friendly reminder about their saved items','Marketing')}</Text></li>
                    <li><Text as="span">{t('Product images and details','Marketing')}</Text></li>
                    <li><Text as="span">{t('Direct links back to their saved items','Marketing')}</Text></li>
                    <li><Text as="span">{t('A clear call-to-action to complete their purchase','Marketing')}</Text></li>
                  </ul>
                  <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
                    <Button 
                      primary 
                      onClick={() => setShowTestModal(true)}
                      disabled={isFreePlan || !active}
                    >
                      {t('Send Test Email','Marketing')}
                    </Button>
                    {/* <Button 
                      onClick={() => window.open('https://help.swymrelay.com/hc/en-us/requests/new', '_blank')}
                    >
                      Request Customization
                    </Button> */}
                  </div>
                </div>
                </Card>
              </div>
            </Box>
          </Card>
        </div>
        )}

        {/* Test Email Modal */}
        {showTestModal && (
          <Modal
            open={showTestModal}
            onClose={() => setShowTestModal(false)}
            title={t('Send test email','Marketing')}
            primaryAction={{
              content: t('Send','Marketing'),
              onAction: async () => {
                try {
                  const token = await getSessionToken(appBridge);
                  await fetch(`${apiUrl}notifications/test-send`, {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json', 
                      Authorization: `Bearer ${token}` 
                    },
                    body: JSON.stringify({ 
                      type: 'saved_for_later_reminder', 
                      email: testEmail 
                    })
                  });
                  setShowTestModal(false);
                } catch (e) {
                  console.error('Error sending test email:', e);
                  setShowTestModal(false);
                }
              }
            }}
            secondaryActions={[
              {
                content: t('Cancel','Marketing'),
                onAction: () => setShowTestModal(false)
              }
            ]}
          >
            <Modal.Section>
              <TextField
                label={t("Email address",'Marketing')}
                value={testEmail}
                onChange={setTestEmail}
                type="email"
                autoComplete="email"
                placeholder="customer@example.com"
              />
              <div style={{ marginTop: 16 }}>
                <Text as="p" variant="bodySm" color="subdued">
                  {t('Test Email Description','Marketing')}
                </Text>
              </div>
            </Modal.Section>
          </Modal>
        )}
      </div>
    </Frame>
  );
}
