import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Page,
  Layout,
  Card,
  Grid,
  Text,
  Icon,
  Badge,
  InlineStack,
  Button,
  Divider,
  Box,Frame
} from '@shopify/polaris';
import {
    NotificationIcon, LanguageIcon,ImportIcon,DnsSettingsIcon
  } from '@shopify/polaris-icons';
import { useLanguage } from "../components";

export default function Settings() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const settingsItems = [
    {
      id: 'notifications',
      icon: NotificationIcon,
      title: t('Notifications', 'Settings'),
      description: t('Notifications subtitle', 'Settings'),
      isPremium: false,
      action: () => navigate("/notification")
    },
    {
      id: 'language-setting',
      icon: LanguageIcon,
      title: t('Language Settings', 'Settings'),
      description: t('Language Settings subtitle', 'Settings'),
      isPremium: false,
      action: () => navigate("/language-setting")
    },
    {
      id: 'integrations',
      title: t('Integerations', 'Settings'),
      icon: DnsSettingsIcon,
      description: t('Integrations subtitle', 'Settings'),
      isPremium: false,
      action: () => console.log('Integrations clicked')
    },
    {
      id: 'installation',
      title: t('Installtions', 'Settings'),
      icon: ImportIcon,
      description: t('installation subtitle', 'Settings'),
      isPremium: false,
      action: () => navigate("/Installation"),
    },
  ];

  const SettingCard = ({ item }) => {
    const IconComponent = item.icon;
    
    return (
      <div 
        style={{ 
          padding: '28px 24px', 
          cursor: 'pointer',
          backgroundColor: 'white',
          minHeight: '160px',
          height: '100%',
          boxSizing: 'border-box',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          ':hover': {
            backgroundColor: '#f9f9f9',
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }
        }}
        onClick={item.action}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '12px'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              marginTop: '4px',
              transform: 'scale(1.5)',
              color: '#6d7175'
            }}>
              <Icon source={IconComponent} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#6d7175',
                lineHeight: '1.2'
              }}>
                {item.title}
              </span>
              <span style={{ 
                fontSize: '14px', 
                color: '#6d7175',
                lineHeight: '1.4'
              }}>
                {item.description}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Frame>
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto 0 auto',
          display: 'flex',
          justifyContent: 'flex-start',
          width: '100%',
          background: '#F3F3F3',
          borderTop: 'none',
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          padding: 24,
          gap: 24,
          flexDirection: 'row',
          flexWrap: 'wrap',
          minWidth: 0,
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
          width: '100%'
        }}>
          {t('Settings', 'Settings')}
          <br />
          <span style={{ fontSize: 13, color: '#555', fontWeight: 400, maxWidth: 700, marginTop: 2 }}>{t('Settings subtitle', 'Settings')}</span>
        </div>
        <div style={{ width: '100%' }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            {settingsItems.map((item) => (
              <div key={item.id} style={{ width: '100%' }}>
                <SettingCard item={item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}
