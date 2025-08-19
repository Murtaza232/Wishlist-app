import React, { useState, useEffect, useContext } from 'react';
import { Frame, Card, Text, InlineStack, Button, Badge, Box, Modal, TextField } from '@shopify/polaris';
import { AppContext } from '../components';
import { useLanguage } from '../components';
import { useAppBridge } from '@shopify/app-bridge-react';
import { getSessionToken } from '@shopify/app-bridge-utils';
import backinstockimg from '../assets/backinstockimg.webp';

export default function BackInStockAlert() {
	const { apiUrl } = useContext(AppContext);
	const appBridge = useAppBridge();
	const { t } = useLanguage();
	const [active, setActive] = useState(true);
	const [providerName, setProviderName] = useState('SMTP');
	const [showTestModal, setShowTestModal] = useState(false);
	const [testEmail, setTestEmail] = useState('');
	const [isToggling, setIsToggling] = useState(false);

	// Prefill from API
	useEffect(() => {
		(async () => {
			try {
				const token = await getSessionToken(appBridge);
				const res = await fetch(`${apiUrl}subscription-notifications`, { headers: { Authorization: `Bearer ${token}` } });
				if (res.ok) {
					const json = await res.json();
					const list = json?.subscription_notifications || [];
					// Title may vary slightly across locales; match loosely
					const backInStock = list.find(n => (n.title || '').toLowerCase().includes('back in stock'));
					if (backInStock && typeof backInStock.active_status !== 'undefined') setActive(Boolean(backInStock.active_status));
				}
				const provRes = await fetch(`${apiUrl}notification-providers`, { headers: { Authorization: `Bearer ${token}` } });
				if (provRes.ok) {
					const prov = await provRes.json();
					const p = prov?.email_provider || 'smtp';
					setProviderName(p ? p.toUpperCase() : 'SMTP');
				}
			} catch (e) {
				// ignore
			}
		})();
	}, [apiUrl]);

	const handleToggleActive = async () => {
		setIsToggling(true);
		try {
			const token = await getSessionToken(appBridge);
			const res = await fetch(`${apiUrl}subscription-notifications`, { headers: { Authorization: `Bearer ${token}` } });
			const json = await res.json();
			const list = json?.subscription_notifications || [];
			const backInStock = list.find(n => (n.title || '').toLowerCase().includes('back in stock'));
			if (!backInStock) return;
			const id = backInStock.id;
			const next = !active ? 1 : 0;
			await fetch(`${apiUrl}subscription-notification-status-save/${id}?active_status=${next}`, {
				method: 'GET',
				headers: { Authorization: `Bearer ${token}` },
			});
			setActive(!active);
		} catch (e) {
			// ignore
		} finally {
			setIsToggling(false);
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
						<Text variant="headingLg" as="h1" fontWeight="bold">{t('Back in Stock Alert','Marketing')}</Text>
						<Box style={{marginLeft: 10, marginTop:2}}> <Badge tone={active ? 'success' : 'critical'}>{active ? t('Live','Marketing') : t('Off','Marketing')}</Badge></Box>
					</InlineStack>
					<Button tone="critical" variant="secondary" onClick={handleToggleActive} loading={isToggling}>{active ? t('Turn Off Alert','Marketing') : t('Turn On Alert','Marketing')}</Button>
				</div>

				{/* Connection banner */}
				<Card>
					<Box padding="4">
						<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
							<div style={{ width: 28, height: 28, borderRadius: 6, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>🕊️</div>
							<Text>
								<b>{providerName || 'SMTP'}</b>{t('has been connected as your marketing integration for','Marketing')} <b>{t('Email','Marketing')}</b>
							</Text>
						</div>
					</Box>
				</Card>

				{/* Step 1 */}
				<div style={{ marginTop: 16 }}>
					<Card>
						<Box padding="4">
							<Text variant="headingSm" as="h3" fontWeight="bold">{t('Step 1: Setup Configuration','Marketing')}</Text>
							<div style={{ marginTop: 12 }}>
								<Text>
									{t('Send an alert when wishlisted items are back in stock.','Marketing')}
								</Text>
							</div>
						</Box>
					</Card>
				</div>

				{/* Step 2 */}
				<div style={{ marginTop: 16 }}>
					<Card>
						<Box padding="4">
							<Text variant="headingSm" as="h3" fontWeight="bold">{t('Step 2: Review Email Content','Marketing')}</Text>
							<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
								<div style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: 16, background: '#fff', height: 380 }}>
									<img src={backinstockimg} alt="Email Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
								</div>
								<Card>
								<div style={{padding: 100}}>
									<Text>
										{t('Use this pre-designed template','Marketing')}
									</Text>
									<div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
										<Button disabled={!active} onClick={() => setShowTestModal(true)}>{t('Send Test Email','Marketing')}</Button>
										{/* <Button variant="tertiary">Chat with support to customize</Button> */}
									</div>
								</div>
								</Card>
							</div>
						</Box>
					</Card>
				</div>

				{showTestModal && (
					<Modal
						open
						onClose={() => setShowTestModal(false)}
						title={t('Send test email', 'Marketing')}
						primaryAction={{ content: t('Send', 'Marketing'), onAction: async () => {
							try {
								const token = await getSessionToken(appBridge);
								await fetch(`${apiUrl}notifications/test-send`, {
									method: 'POST',
									headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
									body: JSON.stringify({ type: 'back_in_stock_alert', email: testEmail })
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


