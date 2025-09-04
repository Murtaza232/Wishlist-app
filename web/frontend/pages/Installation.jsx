import React, { useState, useEffect, useContext } from 'react';
import enableExtension from '../assets/enableExtension.png';
import addWishlistCart from '../assets/addWishlistCart.png';
import WishlistProductImage from '../assets/WishlistProductImage.png';
import WishlistCollectionsPage from '../assets/WishlistCollectionsPage.png';
import MyWishlistButton from '../assets/MyWishlistButton.png';
import {
  Page,
  Layout,
  Card,
  Tabs,
  Banner,
  Select,
  Button,
  Text,
  InlineStack,
  Box,
  Icon,
  Badge,
  Frame,Divider
} from '@shopify/polaris';
import {
  ExternalIcon,
  RefreshIcon
} from '@shopify/polaris-icons';
import { useAppBridge } from "@shopify/app-bridge-react";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import { AppContext } from "../components";
import { useLanguage } from "../components";

export default function Installation() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState(''); // Remove hardcoded 'dawn' fallback
  const [showBanner, setShowBanner] = useState(true);
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shop, setShop] = useState("");
  const [handle, setHandle] = useState("");
  const [apikey, setApikey] = useState("");
  const [activeTheme, setActiveTheme] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [apiLoaded, setApiLoaded] = useState(false);
  const [extensionStatus, setExtensionStatus] = useState({ enabled: false, loading: true });
  
  const { apiUrl } = useContext(AppContext);
  const appBridge = useAppBridge();
  const fetch = useAuthenticatedFetch();
  const { t } = useLanguage();

  // Move tabs inside component to access t function
  const tabs = [
    {
      id: 'theme-extension',
      content: t('Theme Extension Tab', 'Installation'),
      accessibilityLabel: t('Theme Extension Tab', 'Installation'),
      panelID: 'theme-extension-panel',
    },
    {
      id: 'expert-setup',
      content: t('Expert Setup Tab', 'Installation'),
      accessibilityLabel: t('Expert Setup Tab', 'Installation'),
      panelID: 'expert-setup-panel',
    },
    {
      id: 'manual-install',
      content: t('Manual Install Tab', 'Installation'),
      accessibilityLabel: t('Manual Install Tab', 'Installation'),
      panelID: 'manual-install-panel',
    },
  ];

  const fetchExtensionStatus = async () => {
    try {
      const token = await getSessionToken(appBridge);
      if (!token) return;
      
      const res = await fetch(`${apiUrl}extension-status`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      
      if (data && data.status) {
        setExtensionStatus({ 
          enabled: data.extension_enabled, 
          loading: false 
        });
      }
    } catch (error) {
      console.error('Failed to fetch extension status:', error);
      setExtensionStatus({ enabled: false, loading: false });
    }
  };

  const fetchThemes = async () => {
    setLoading(true);
    try {
      const token = await getSessionToken(appBridge);
      if (!token) return;
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
        // Set selectedTheme to activeTheme if available, otherwise to first available theme
        if (data.activeTheme) {
          setSelectedTheme(data.activeTheme);
        } else if (data.themes && data.themes.length > 0) {
          setSelectedTheme(data.themes[0].theme_id);
        }
        setApiLoaded(true);
      }
    } catch (error) {
      console.error('Failed to fetch themes:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchThemes();
    fetchExtensionStatus();
  }, [apiUrl]);

  const handleRefresh = () => {
    console.log('Refresh button clicked');
    fetchThemes();
  };

  // Use selectedTheme for dropdown, but ensure we have a valid theme selected
  const themeId = selectedTheme || activeTheme;

  const appEmbedUrl = (shop && themeId && apikey)
    ? `https://admin.shopify.com/store/${shop}/themes/${themeId}/editor?context=apps&appEmbed=${apikey}/wishlist_configuration`
    : '';
  const themeEditorUrl = (shop && themeId && handle && apikey)
    ? `https://admin.shopify.com/store/${shop}/themes/${themeId}/editor?previewPath=%2Fproducts%2F${handle}`
    : '';
  const wishlistButtonUrl = (shop && themeId && apikey)
    ? `https://admin.shopify.com/store/${shop}/themes/${themeId}/editor?context=apps&appEmbed=${apikey}%2Fwishlist_configuration`
    : '';
  const wishlistLaunchPointUrl = (shop && themeId && apikey)
    ? `https://admin.shopify.com/store/${shop}/themes/${themeId}/editor?context=apps&appEmbed=${apikey}%2Fwishlist_configuration`
    : '';
  const wishlistPageUrl = (shop && themeId && apikey)
    ? `https://admin.shopify.com/store/${shop}/themes/${themeId}/editor?appEmbed=${apikey}%2Fwishlist_configuration&previewPath=%2Fcollections%2Fall`
    : '';

  const themeOptions = themes.map((theme) => ({
    label: theme.theme_name + (theme.active_theme === 'main' ? ' (Current Theme)' : ''),
    value: theme.theme_id
  }));

  const handleTabChange = (selectedTabIndex) => {
    setSelectedTab(selectedTabIndex);
  };
  const RefreshIcon = ({ size = 16, className = "", ...props }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
    </svg>
  );
  const renderThemeExtensionPanel = () => (
    <div >
      <div style={{ marginBottom: '24px' }}>
        <InlineStack align="start" gap="tight">
          <Text variant="bodyMd" as="p" fontWeight="semibold">
            {t('Current theme app embed status', 'Installation')}:
          </Text>
          {apiLoaded && <Badge tone="critical">{t('Disable', 'Installation')}</Badge>}
        </InlineStack>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <Text variant="bodyMd" as="p" fontWeight="semibold" style={{ marginBottom: '8px' }}>
          {t('Select Theme', 'Installation')}
        </Text>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <Select
              label=""
              labelInline
              options={themeOptions}
              value={selectedTheme}
              onChange={setSelectedTheme}
              disabled={!apiLoaded || loading || themeOptions.length === 0}
            />
          </div>
          <div style={{
            minWidth: '40px',
            height: '32px',
            borderRadius: '8px',
            border: '1px solid #e1e3e5',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: (!apiLoaded || loading) ? 'not-allowed' : 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s ease',
            opacity: (!apiLoaded || loading) ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (apiLoaded && !loading) {
              e.currentTarget.style.backgroundColor = '#f6f6f7';
              e.currentTarget.style.borderColor = '#c9cccf';
            }
          }}
          onMouseLeave={(e) => {
            if (apiLoaded && !loading) {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#e1e3e5';
            }
          }}
          onClick={(!apiLoaded || loading) ? undefined : handleRefresh}
          >
            {(!apiLoaded || loading) ? (
              <div style={{ width: '16px', height: '16px', border: '2px solid #e1e3e5', borderTop: '2px solid #008060', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            ) : (
              <RefreshIcon size={20} />
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Left side - Remaining fields */}
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '24px' }}>
           <span style={{ fontSize: '14px', color: '#303030' }}>
              {t('App embed Status', 'Installation')}: {extensionStatus.loading ? (
                <span style={{ color: '#616161', fontWeight: '700' }}>{t('Loading...', 'Installation')}</span>
              ) : (
                <span style={{ 
                  color: extensionStatus.enabled ? '#008060' : '#d82c0d', 
                  fontWeight: '700' 
                }}>
                  {extensionStatus.enabled ? t('Enable', 'Installation') : t('Disable', 'Installation')}
                </span>
              )}
           </span>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <Text variant="headingMd" as="h3" fontWeight="semibold" style={{ marginBottom: '12px' }}>
              {t('Enable Wishlist app embed', 'Installation')}
            </Text>
            <Text variant="bodyMd" as="p" color="subdued">
              {t('Enable the Wishlist Configurations', 'Installation')}
            </Text>
          </div>

          <Button 
            variant="primary" 
            icon={!apiLoaded ? undefined : ExternalIcon}
            onClick={() => {
              if (appEmbedUrl && apiLoaded && themeId) {
                window.open(appEmbedUrl, '_blank');
              } else {
                console.error('Cannot open theme editor: missing required data', { shop, themeId, apikey, apiLoaded });
              }
            }}
            disabled={!apiLoaded || !appEmbedUrl || !themeId}
          >
            {!apiLoaded ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent:'center', gap: '8px',width:'47px' }}>
                <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
               
              </div>
            ) : !themeId ? (
              t('No Theme Selected', 'Installation') || 'No Theme Selected'
            ) : (
              t('Activate Button', 'Installation')
            )}
          </Button>
        </div>

        {/* Right side - Screenshot */}
        <div style={{ flex: 1 }}>
          <div style={{ 
            border: '1px solid #e1e3e5',
            borderRadius: '8px',
            padding: '12px',
            backgroundColor: '#fafbfc',
            minHeight: '250px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img src={enableExtension} alt="enableExtension" style={{ 
              maxWidth: '100%', 
              height: 'auto', 
              borderRadius: '4px',
              objectFit: 'contain',
              cursor: 'pointer'
            }} 
            onClick={() => {
              setSelectedImage(enableExtension);
              setShowImageModal(true);
            }}
            />
          </div>
        </div>
      </div>


    </div>
  );



  const renderOtherPanels = () => (
    <div>
      <Text variant="bodyMd" as="p" color="subdued">
        {t('Content for', 'Installation')} {tabs[selectedTab].content} {t('will be implemented here.', 'Installation')}
      </Text>
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
              {t('Installation instructions', 'Installation')}
              <br />
              <span style={{ fontSize: 13, color: '#555', fontWeight: 400, maxWidth: 700, marginTop: 2 }}>{t('Follow the steps below to install', 'Installation')}</span>
            </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <Layout>
        <Layout.Section>
          {showBanner && (
            <Banner
              title={t('Contact Us', 'Installation')}
              tone="info"
              onDismiss={() => setShowBanner(false)}
              action={{
                content: t('Contact Support', 'Installation'),
                onAction: () => console.log('Contact support clicked'),
              }}
            >
              <p>{t('Paragraph Contact Us', 'Installation')}</p>
            </Banner>
          )}

          {/* Tabs */}
          <div style={{ 
            display: 'none', 
            flexDirection: 'column', 
            gap: '16px', 
            marginTop: '16px', 
            marginBottom: '16px',
            width: '100%'
          }}>
            {/* <div style={{ 
              display: 'flex', 
              gap: '0px',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              padding: '4px',
              justifyContent: 'flex-start'
            }}> */}
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(index)}
                  style={{
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: selectedTab === index ? '#EBEBEB' : 'transparent',
                    color: '#202223',
                    fontWeight: selectedTab === index ? '500' : '400',
                    fontSize: '12px',
                    cursor: 'pointer',
                    borderRadius: '100px',
                    transition: 'all 0.2s ease',
                    boxShadow: selectedTab === index ? 'none' : 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.content}
                </button>
              ))}
            </div>
          {/* </div> */}

          {/* First Card - Theme Extension Panel */}
          <div style={{ 
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '16px',
            marginTop: '24px'
          }}>
            {selectedTab === 0 ? renderThemeExtensionPanel() : renderOtherPanels()}
          </div>

          {/* Second Card - Add Wishlist Block (only show in Theme Extension tab) */}
          {selectedTab === 0 && (
          <div style={{ 
            marginTop: '24px',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '24px'
          }}>
              {!apiLoaded ? (
                // Skeleton loading state
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  {/* Top Section */}
                  <div style={{
                    width: '200px',
                    height: '20px',
                    backgroundColor: '#e1e3e5',
                    borderRadius: '4px',
                    marginBottom: '12px'
                  }}></div>
                  <div style={{
                    width: '100%',
                    height: '16px',
                    backgroundColor: '#e1e3e5',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}></div>
                  <div style={{
                    width: '70%',
                    height: '16px',
                    backgroundColor: '#e1e3e5',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}></div>
                  <div style={{
                    width: '50%',
                    height: '16px',
                    backgroundColor: '#e1e3e5',
                    borderRadius: '4px',
                    marginBottom: '24px'
                  }}></div>

                  {/* Middle Section */}
                  <div style={{
                    width: '180px',
                    height: '20px',
                    backgroundColor: '#e1e3e5',
                    borderRadius: '4px',
                    marginBottom: '12px'
                  }}></div>
                  <div style={{
                    width: '100%',
                    height: '16px',
                    backgroundColor: '#e1e3e5',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}></div>
                  <div style={{
                    width: '75%',
                    height: '16px',
                    backgroundColor: '#e1e3e5',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}></div>
                  <div style={{
                    width: '45%',
                    height: '16px',
                    backgroundColor: '#e1e3e5',
                    borderRadius: '4px',
                    marginBottom: '24px'
                  }}></div>

                  {/* Bottom Section */}
                  <div style={{
                    width: '160px',
                    height: '20px',
                    backgroundColor: '#e1e3e5',
                    borderRadius: '4px',
                    marginBottom: '12px'
                  }}></div>
                  <div style={{
                    width: '100%',
                    height: '16px',
                    backgroundColor: '#e1e3e5',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}></div>
                  <div style={{
                    width: '80%',
                    height: '16px',
                    backgroundColor: '#e1e3e5',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}></div>
                  <div style={{
                    width: '60%',
                    height: '16px',
                    backgroundColor: '#e1e3e5',
                    borderRadius: '4px'
                  }}></div>
                </div>
              ) : (
                <>
                  <span style={{ 
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#202223',
                    marginBottom: '16px'
                  }}>
                  2. {t('Add Wishlist block', 'Installation')}
                  </span>
                  <span style={{ 
                    display: 'block',
                    fontSize: '14px',
                    color: '#303030',
                    marginBottom: '24px',
                    lineHeight: '1.5'
                  }}>
                 {t('Add app block Text', 'Installation')}
                  </span>

            {/* Product Review Badge Section */}
            <div style={{ marginBottom: '32px' }}>
                <span style={{ 
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#202223',
                  marginBottom: '12px'
                }}>
                {t('Wishlist Widget Near Cart Button', 'Installation')}:
                </span>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                {/* Left side - Text content */}
                <div style={{ flex: 1 }}>
                    <span style={{ 
                      display: 'block',
                      fontSize: '14px',
                      color: '#303030',
                      marginBottom: '16px',
                      lineHeight: '1.5'
                    }}>
                    {t('Add Wishlist Widget Cart Button Text', 'Installation')}
                    </span>
                    <button 
                      style={{
                        backgroundColor: '#E3E3E3',
                        border: '1px solid #e1e3e5',
                        borderRadius: '10px',
                        padding: '4px 8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#303030',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#d1d1d1';
                        e.currentTarget.style.borderColor = '#c9cccf';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#E3E3E3';
                        e.currentTarget.style.borderColor = '#e1e3e5';
                      }}
                      onClick={() => {
                        if (themeEditorUrl) {
                          window.open(themeEditorUrl, '_blank');
                        }
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                      </svg>
                      <span style={{ fontSize: '12px', fontWeight: '500', color: '#303030' }}>{t('Button Text Wishlist Widget Near Cart Button', 'Installation')}</span>
                    </button>
                  </div>
                  
                  {/* Right side - Screenshot */}
                       <div style={{ flex: 1 }}>
                  <div style={{ 
            border: '1px solid #e1e3e5',
            borderRadius: '8px',
            padding: '12px',
            backgroundColor: '#fafbfc',
            minHeight: '250px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img src={addWishlistCart} alt="addWishlistCart" style={{ 
              maxWidth: '100%', 
              height: 'auto', 
              borderRadius: '4px',
              objectFit: 'contain', 
              cursor: 'pointer'
            }} 
            onClick={() => {
              setSelectedImage(addWishlistCart);
              setShowImageModal(true);
            }}
            />
                </div>
        </div>
                    </div>
                  </div>
                <Box style={{
                    marginTop: '10px',
                    marginBottom: '10px',
                }}>
                    <Divider/>
                </Box>
              {/* Product Review Section */}
              <div>
                <span style={{ 
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#202223',
                  marginBottom: '12px'
                }}>
                  {t('Wishlist Widget On Product Image', 'Installation')}:
                </span>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                  {/* Left side - Text content */}
                  <div style={{ flex: 1 }}>
                    <span style={{ 
                      display: 'block',
                      fontSize: '14px',
                      color: '#303030',
                      marginBottom: '16px',
                      lineHeight: '1.5'
                    }}>
                      {t('Text Wishlist Widget product image', 'Installation')}
                    </span>
                    <button 
                      style={{
                        backgroundColor: '#E3E3E3',
                        border: '1px solid #e1e3e5',
                        borderRadius: '10px',
                        padding: '4px 8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#303030',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#d1d1d1';
                        e.currentTarget.style.borderColor = '#c9cccf';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#E3E3E3';
                        e.currentTarget.style.borderColor = '#e1e3e5';
                      }}
                      onClick={() => {
                        if (wishlistButtonUrl) {
                          window.open(themeEditorUrl, '_blank');
                        }
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                      </svg>
                     <span style={{ fontSize: '12px', fontWeight: '500', color: '#303030' }}>{t('Button text Wishlist Widget On Product Image', 'Installation')}</span>
                    </button>
                </div>
                
                {/* Right side - Screenshot */}
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    border: '1px solid #e1e3e5',
                    borderRadius: '8px',
            padding: '12px',
                    backgroundColor: '#fafbfc',
            minHeight: '250px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
            <img src={WishlistProductImage} alt="WishlistProductImage" style={{ 
              maxWidth: '100%', 
              height: 'auto', 
              borderRadius: '4px',
              objectFit: 'contain', 
              cursor: 'pointer'
            }} 
            onClick={() => {
              setSelectedImage(WishlistProductImage);
              setShowImageModal(true);
            }}
            />
                </div>
                  </div>
                </div>
              </div>
              <Box style={{
                marginTop: '10px',
                marginBottom: '10px',
              }}>
                <Divider/>
              </Box>
              {/* Store Average Section */}
            <div>
                <span style={{ 
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#202223',
                  marginBottom: '12px'
                }}>
                 {t('Wishlist Widget Collection page', 'Installation')}:
                </span>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                {/* Left side - Text content */}
                <div style={{ flex: 1 }}>
                    <span style={{ 
                      display: 'block',
                      fontSize: '14px',
                      color: '#303030',
                      marginBottom: '16px',
                      lineHeight: '1.5'
                    }}>
                      {t('Text Wishlist Widget Collection page', 'Installation')}
                    </span>
                    <button 
                      style={{
                        backgroundColor: '#E3E3E3',
                        border: '1px solid #e1e3e5',
                        borderRadius: '10px',
                        padding: '4px 8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#303030',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#d1d1d1';
                        e.currentTarget.style.borderColor = '#c9cccf';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#E3E3E3';
                        e.currentTarget.style.borderColor = '#e1e3e5';
                      }}
                      onClick={() => {
                        if (wishlistPageUrl) {
                          window.open(wishlistPageUrl, '_blank');
                        }
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                      </svg>
                      <span style={{ fontSize: '12px', fontWeight: '500', color: '#303030' }}>{t('Button text Wishlist Widget Collection page', 'Installation')}</span>
                    </button>
                  </div>
                  
                  {/* Right side - Screenshot */}
                  <div style={{ flex: 1 }}>
          <div style={{ 
            border: '1px solid #e1e3e5',
            borderRadius: '8px',
            padding: '12px',
            backgroundColor: '#fafbfc',
            minHeight: '250px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img src={WishlistCollectionsPage} alt="WishlistCollectionsPage" style={{ 
              maxWidth: '100%', 
              height: 'auto', 
              borderRadius: '4px',
              objectFit: 'contain', 
              cursor: 'pointer'
            }} 
            onClick={() => {
                setSelectedImage(WishlistCollectionsPage);
              setShowImageModal(true);
            }}
            />
                </div>
        </div>
                </div>
              </div>

              <Box style={{
                marginTop: '10px',
                marginBottom: '10px',
              }}>
                <Divider/>
              </Box>

              {/* Testimonial Section */}
              <div>
                <span style={{ 
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#202223',
                  marginBottom: '12px'
                }}>
                  {t('My Wishlist Section', 'Installation')}:
                </span>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                  {/* Left side - Text content */}
                  <div style={{ flex: 1 }}>
                    <span style={{ 
                      display: 'block',
                      fontSize: '14px',
                      color: '#303030',
                      marginBottom: '16px',
                      lineHeight: '1.5'
                    }}>
                      {t('Text My Wishlist Section', 'Installation')}
                    </span>
                    <button 
                      style={{
                        backgroundColor: '#E3E3E3',
                        border: '1px solid #e1e3e5',
                        borderRadius: '10px',
                        padding: '4px 8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#303030',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#d1d1d1';
                        e.currentTarget.style.borderColor = '#c9cccf';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#E3E3E3';
                        e.currentTarget.style.borderColor = '#e1e3e5';
                      }}
                      onClick={() => {
                        if (appEmbedUrl) {
                          window.open(appEmbedUrl, '_blank');
                        }
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                      </svg>
                      <span style={{ fontSize: '12px', fontWeight: '500', color: '#303030' }}>{t('Button text My Wishlist Section', 'Installation')}</span>
                    </button>
                </div>
                
                {/* Right side - Screenshot */}
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    border: '1px solid #e1e3e5',
                    borderRadius: '8px',
            padding: '12px',
                    backgroundColor: '#fafbfc',
            minHeight: '250px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
            <img src={MyWishlistButton} alt="MyWishlistButton" style={{ 
              maxWidth: '100%', 
              height: 'auto', 
              borderRadius: '4px',
              objectFit: 'contain', 
              cursor: 'pointer'
            }} 
            onClick={() => {
                setSelectedImage(MyWishlistButton);
              setShowImageModal(true);
            }}
            />
                </div>
                  </div>
                </div>
              </div>
                </>
              )}
            </div>
          )}
        </Layout.Section>
      </Layout>

      {/* Image Modal */}
      {showImageModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(63, 56, 56, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        onClick={() => setShowImageModal(false)}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            maxWidth: '50vw',
            maxHeight: '90vh',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e1e3e5',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f3f3f3'
            }}>
              <span style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#202223'
              }}>
                {t('Image', 'Modals')}
              </span>
              <button
                onClick={() => setShowImageModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {/* Content Area */}
            <div style={{
              padding: '20px',
              flex: 1,
              overflow: 'auto'
            }}>
              <img 
                src={selectedImage} 
                alt="Selected Image" 
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto',
                  borderRadius: '4px'
                }} 
              />
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid #e1e3e5',
              display: 'flex',
              justifyContent: 'flex-end',
              backgroundColor: '#fafbfc'
            }}>
              <button
                onClick={() => setShowImageModal(false)}
                style={{
                  backgroundColor: '#5c5f62',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#4a4d50'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#5c5f62'}
              >
                {t('Close', 'Modals')}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </Frame>
  );
} 