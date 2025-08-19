import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Page,
  Layout,
  Card,
  Text,
  Icon,
  Badge,
  Button,
  Box,
  Frame,
  TextField,
  Modal,
  Thumbnail,
  Banner,
  BlockStack,
} from '@shopify/polaris';
import iterable from '../assets/iterable.svg';
import klaviyo from '../assets/klaviyo.svg';
import yotpo from '../assets/yotpo.svg';
import attentive from '../assets/attentive.svg';
import sendlane from '../assets/sendlane.svg';
import omnisend from '../assets/omnisend.svg';
import pushowl from '../assets/pushowl.jpeg';
import postscript from '../assets/postscript.svg';  
import klaviyoimg from '../assets/klaviyoimg.svg';
import {
    ArrowRightIcon,
  CheckCircleIcon,
  InfoIcon,
  DnsSettingsIcon,
} from '@shopify/polaris-icons';
import { useLanguage } from "../components";
// import { useContext, useEffect } from 'react';
import axios from 'axios';
import { AppContext } from '../components/providers/ContextProvider.jsx';

const iconContainerStyle = {
  width: '64px',
  height: '64px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '10px',
  flexShrink: 0,
  overflow: 'hidden',
  backgroundColor: 'transparent'
};

const cardStyle = {
  padding: '24px',
  borderRadius: '8px',
  border: '1px solid #e1e3e5',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.2s ease',
  backgroundColor: '#ffffff',
  boxSizing: 'border-box',
  margin: 0,
  ':hover': {
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transform: 'translateY(-2px)'
  }
};

const cardHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '16px'
};

const cardTitleStyle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#202223',
  margin: '0 0 4px 0',
  lineHeight: '24px'
};

const cardPurposeStyle = {
  fontSize: '14px',
  color: '#6d7175',
  margin: '0 0 8px 0',
  lineHeight: '20px'
};

const cardDescriptionStyle = {
  fontSize: '14px',
  color: '#6d7175',
  margin: '0 0 16px 0',
  lineHeight: '20px',
  flexGrow: 1
};

const connectButtonStyle = {
  width: '100%',
  justifyContent: 'center',
  backgroundColor: '#008060',
  ':hover': {
    backgroundColor: '#006e52'
  }
};

const KlaviyoModal = ({ open, onClose, onSave, apiKey, setApiKey, loading }) => {
  const [showHelp, setShowHelp] = useState(false);
  const [helpHover, setHelpHover] = useState(false);
  const [apiBtnHover, setApiBtnHover] = useState(false);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img src={klaviyo} alt="Klaviyo" style={{ width: 28, height: 28 }} />
          <span>Connect Klaviyo</span>
        </div>
      }
      primaryAction={{
        content: 'Save',
        onAction: onSave,
        loading,
      }}
      secondaryActions={[
        {
          content: 'Cancel',
          onAction: onClose,
        },
      ]}
    >
      <Modal.Section>
        
        <BlockStack gap={"400"}>
          <BlockStack gap={"100"}>
            <Text variant="bodyMd" as="p" color="subdued">
              Enter your Klaviyo Private API Key to connect your account. It will be stored securely and used only for sending emails.
            </Text>
            <TextField
              label="Klaviyo Private API Key"
              value={apiKey}
              onChange={setApiKey}
              autoComplete="off"
              placeholder="pk_xxxxxxxxxxxxxxxxxxxxxxxxx"
            />
            <div>
              <Button
                variant="tertiary"
                onClick={() => setShowHelp((v) => !v)}
                onMouseEnter={() => setHelpHover(true)}
                onMouseLeave={() => setHelpHover(false)}
                style={{
                  backgroundColor: helpHover ? '#F6F6F7' : 'transparent',
                  border: helpHover ? '1px solid #E1E3E5' : '1px solid transparent',
                }}
              >
                {showHelp ? 'Hide article' : 'How to find your Klaviyo private key'}
              </Button>
            </div>
            {showHelp && (
              <Card>
                <div style={{ padding: 16 }}>
                  <Text as="h3" variant="headingSm">Find your Klaviyo Private API Key</Text>
                  <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 18, lineHeight: 1.6 }}>
                    <li>Log in to your Klaviyo account.</li>
                    <li>Go to Account → Settings → API Keys.</li>
                    <li>Create a new Private API Key or copy an existing one.</li>
                    <li>Paste the key into the field above and click Save.</li>
                  </ul>
                  <div style={{ marginTop: 12 }}>
                    <Button
                      size="medium"
                      variant="primary"
                      onClick={() => window.open('https://www.klaviyo.com/account#api-keys-tab', '_blank')}
                      onMouseEnter={() => setApiBtnHover(true)}
                      onMouseLeave={() => setApiBtnHover(false)}
                      style={{
                        backgroundColor: apiBtnHover ? '#0b1220' : '#111827',
                        color: '#ffffff',
                        border: '1px solid #0f172a'
                      }}
                    >
                      Open Klaviyo API Keys
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </BlockStack>

          <Box paddingBlockStart="400">
            <Banner title="Where to find your key?" status="info">
              <p>You can find your private API key in your Klaviyo account under Account → API Keys.</p>
            </Banner>
          </Box>

        </BlockStack>
      </Modal.Section>
    </Modal>
  );
};

export default function Integrations() {
  const { shop, apiKey } = useContext(AppContext);
  const [klaviyoModalOpen, setKlaviyoModalOpen] = useState(false);
  
  const handleKlaviyoConnect = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setKlaviyoModalOpen(true);
  };
  
  const handleKlaviyoSave = async () => {
    try {
      setSaving(true);
      const payload = {
        email_provider: 'klaviyo',
        sms_provider: 'klaviyo',
        provider_settings: { klaviyo_api_key: klaviyoKey },
      };
      await axios.post(`${apiUrl}notification-providers`, payload);
      setProviders({ email_provider: 'klaviyo', sms_provider: 'klaviyo' });
      setProviderSettings(payload.provider_settings);
      setKlaviyoModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const { t } = useLanguage();
  const navigate = useNavigate();
  const { apiUrl } = useContext(AppContext);
  
  const [providers, setProviders] = useState({ email_provider: null, sms_provider: null });
  const [providerSettings, setProviderSettings] = useState({});
  const [klaviyoKey, setKlaviyoKey] = useState('');
  const [saving, setSaving] = useState(false);
  
  const [integrations, setIntegrations] = useState([
    {
      id: 'klaviyo',
      name: 'Klaviyo',
      purpose: 'Email & SMS Marketing',
      description: 'Connect to Klaviyo to personalize your email and SMS marketing campaigns.',
      icon: <img src={klaviyo} alt="Klaviyo" style={{ width: '48px', height: '48px' }} />,
    },
    {
      id: 'iterable',
      name: 'Iterable',
      purpose: 'Email Marketing',
      description: 'Run effective email marketing campaigns with Iterable.',
      icon: <img src={iterable} alt="Iterable" style={{ width: '48px', height: '48px' }} />,
    },
    {
      id: 'yotpo',
      name: 'Yotpo SMS & Email',
      purpose: 'Email & SMS Marketing',
      description: 'Use Yotpo to power your email and SMS campaigns, driving engagement with wishlist insights.',
      icon: <img src={yotpo} alt="Yotpo" style={{ width: '48px', height: '48px' }} />,
    },
    {
      id: 'attentive',
      name: 'Attentive',
      purpose: 'Email & SMS Marketing',
      description: 'Integrate with Attentive to send wishlist alerts via email and SMS, boosting retention.',
      icon: <img src={attentive} alt="Attentive" style={{ width: '48px', height: '48px' }} />,
    },
    {
      id: 'sendlane',
      name: 'Sendlane',
      purpose: 'Email Marketing',
      description: 'Go Further than Just Email Marketing.',
      icon: <img src={sendlane} alt="Sendlane" style={{ width: '48px', height: '48px' }} />,
    },
    {
        id: 'omnisend',
        name: 'Omnisend',
        purpose: 'Email Marketing',
        description: 'Go Further than Just Email Marketing.',
        icon: <img src={omnisend} alt="Omnisend" style={{ width: '48px', height: '48px' }} />,
      },
    {
      id: 'pushowl',
      name: 'PushOwl (by Brevo)',
      purpose: 'Email & SMS Marketing',
      description: 'Connect to PushOwl (by Brevo) to create high-impact, timely, personalized shopper journeys.',
      icon: <img src={pushowl} alt="PushOwl" style={{ width: '48px', height: '48px', borderRadius: '4px' }} />,
    },
    {
      id: 'postscript',
      name: 'Postscript',
      purpose: 'Sell more with SMS',
      description: 'SMS marketing and sales that drive real revenue for ecommerce merchants.',
      icon: <img src={postscript} alt="Postscript" style={{ width: '48px', height: '48px' }} />,
    },
  ]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await axios.get(`${apiUrl}notification-providers`);
        if (res && res.data) {
          setProviders({
            email_provider: res.data.email_provider || null,
            sms_provider: res.data.sms_provider || null,
          });
          const settings = res.data.provider_settings || {};
          setProviderSettings(settings);
          if (settings.klaviyo_api_key) setKlaviyoKey(settings.klaviyo_api_key);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchProviders();
  }, [apiUrl]);

  const saveSettings = async (next = {}) => {
    const minimalSettings = next || {};
    setProviderSettings(minimalSettings);
    try {
      setSaving(true);
      await axios.post(`${apiUrl}notification-providers`, {
        email_provider: providers.email_provider,
        sms_provider: providers.sms_provider,
        provider_settings: minimalSettings,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleConnect = async (id) => {
    try {
      setSaving(true);
      const payload = {
        email_provider: id,
        sms_provider: id,
        provider_settings: id === 'klaviyo' && klaviyoKey ? { klaviyo_api_key: klaviyoKey } : {},
      };
      await axios.post(`${apiUrl}notification-providers`, payload);
      setProviders({ email_provider: id, sms_provider: id });
      setProviderSettings(payload.provider_settings || {});
    } catch (e) {
      // ignore for now
    } finally {
      setSaving(false);
    }
  };

  const isConnected = (id) => {
    return providers.email_provider === id || providers.sms_provider === id;
  };

  return (
    <Frame>
      <div style={pageContainerStyle}>
        <div style={headerStyle}>
          {/* <h1 style={titleStyle}>Integrations</h1> */}
          <h1 style={titleStyle}>Integrations</h1>
          <p style={subtitleStyle}>
          Choose your preferred integration to set up and send Wishlist reminders and shopper alerts effortlessly, boosting engagement and sales.
          </p>
        </div>

        <div style={gridStyle}>
          {integrations.map((integration) => (
            <div key={integration.id} style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={iconContainerStyle}>{integration.icon}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={cardTitleStyle}>{integration.name}</h3>
                  <p style={cardPurposeStyle}>{integration.purpose || 'Integration'}</p>
                </div>
                {isConnected(integration.id) && (
                  <span style={{
                    backgroundColor: '#D1FAE5',
                    color: '#065F46',
                    padding: '4px 10px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                  }}>
                    Connected
                  </span>
                )}
              </div>
              
              <p style={cardDescriptionStyle}>
                {integration.description}
              </p>


              
              <Button
                primary
                size="large"
                fullWidth
                onClick={(e) => {
                  if (integration.id === 'klaviyo') {
                    handleKlaviyoConnect(e);
                  } else {
                    handleConnect(integration.id);
                  }
                }}
                icon={isConnected(integration.id) ? CheckCircleIcon : undefined}
                iconPosition={isConnected(integration.id) ? 'left' : 'right'}
                disabled={saving}
                style={{
                  ...connectButtonStyle,
                  backgroundColor: isConnected(integration.id) ? '#008060' : '#5c6ac4',
                  ':hover': {
                    backgroundColor: isConnected(integration.id) ? '#006e52' : '#3f4dae'
                  }
                }}
              >
                {isConnected(integration.id) ? 'Manage' : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    Connect <Icon source={ArrowRightIcon} color="base" />
                  </div>
                )}
              
              </Button>
            </div>
          ))}
        </div>
      </div>
      
      <KlaviyoModal
        open={klaviyoModalOpen}
        onClose={() => setKlaviyoModalOpen(false)}
        onSave={handleKlaviyoSave}
        apiKey={klaviyoKey}
        setApiKey={setKlaviyoKey}
        loading={saving}
      />
    </Frame>
  );
}

const pageContainerStyle = {
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '24px',
  backgroundColor: '#F3F3F3',
  minHeight: 'calc(100vh - 64px)',
  borderBottomLeftRadius: '16px',
  borderBottomRightRadius: '16px',
  width: '100%',
  boxSizing: 'border-box'
};

const headerStyle = {
  width: '100%',
  marginBottom: '24px',
  padding: 0
};

const titleStyle = {
  fontSize: '20px',
  fontWeight: '700',
  margin: '0',
  color: '#222'
};

const subtitleStyle = {
    fontSize: 13, color: '#555', fontWeight: 400, marginTop: 2
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '24px',
  width: '100%',
  margin: 0,
  padding: 0,
};
