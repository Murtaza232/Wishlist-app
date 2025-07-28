import React, { useEffect, useState, useContext } from "react";
import { Page,Frame, Layout, Card, Icon, LegacyCard, Text, Badge, Box, Select, Divider, BlockStack, InlineGrid} from "@shopify/polaris";
import { AlertCircleIcon, ExternalSmallIcon, HeartIcon} from '@shopify/polaris-icons';
import teapot from "../assets/teapot.svg";
import Step1 from "../assets/Step1.svg";
import theme from "../assets/theme.svg";
import shop from "../assets/shop.svg";
import alerts from "../assets/alerts.svg";
import mail from "../assets/mail.svg";
import serviceprovider from "../assets/serviceprovider.svg";
import smsservice from "../assets/smsservice.svg";
import { CalloutCard, Button, SkeletonBodyText } from '@shopify/polaris';
import Skelton from "../components/Skelton";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../components";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";

export default function Features() {
    const { apiUrl } = useContext(AppContext);
    const appBridge = useAppBridge();
    const [themes, setThemes] = useState([]);
    const [selectedTheme, setSelectedTheme] = useState("");
    const [shop, setShop] = useState("");
    const [handle, setHandle] = useState("");
    const [apikey, setApikey] = useState("");
    const [activeTheme, setActiveTheme] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const fetch = useAuthenticatedFetch();
    useEffect(() => {
        const fetchData = async () => {
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
                    setSelectedTheme(data.activeTheme || '');
                    setShop(data.shop || '');
                    setHandle(data.handle || '');
                    setApikey(data.apikey || '');
                    setActiveTheme(data.activeTheme || '');
                }
            } catch (error) {
                // Optionally set an error state or show a message
                console.error('Failed to fetch features data:', error);
            }
            setLoading(false);
        };
        fetchData();
    }, [apiUrl]);

    // Use selectedTheme for dropdown, but use activeTheme for URLs
    const themeId = activeTheme || selectedTheme;

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
     ? `https://admin.shopify.com/store/${shop}/themes/${themeId}/editor?context=apps&activateAppId=${apikey}%2Fwishlist_configuration`
      : '';

    const themeOptions = themes.map((theme) => ({
        label: theme.theme_name + (theme.active_theme === 'main' ? ' (Live Theme)' : ''),
        value: theme.theme_id
    }));

    return (
        <div style={{ marginLeft: '32px', marginRight: '32px' }}>
                           
            <Layout>
                <Layout.Section>
                <div style={{
                            fontSize: 20,
                            fontWeight: 700,
                            margin: '20px 0 10px 0', // top right bottom left
                            padding: '0 24px',
                            color: '#222',
                            letterSpacing: 0.5,
                            display: 'flex',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            width: '100%',
                            // marginLeft: 20
                        }}>
                            Features
                        </div>
                    {!loading ? (
                        <Box style={{ marginTop: '20px' }}>
                        <CalloutCard
                            title={
                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                    Enable SmartSave to Make Wishlisting Effortless
                                    <span style={{
                                        background: '#e3f1fc',
                                        color: '#2563eb',
                                        borderRadius: '8px',
                                        padding: '2px 8px',
                                        fontSize: 13,
                                        fontWeight: 400,
                                        marginLeft: 8,
                                        display: 'inline-block',
                                        letterSpacing: 0.5
                                    }}>
                                        NEW
                                    </span>
                                </span>
                            }
                            illustration="../assets/teapot.svg"
                            primaryAction={{
                                content: 'Set up SmartSave',
                                onAction: () => navigate('/Settings'),
                            }}
                            secondaryAction={{
                                content: 'Read help docs',
                                variant: 'plain',
                                url: '#',
                            }}
                        >
                            <p>Spot high shopper interest from browsing behavior and automatically save products to their wishlist if they consent—no clicks needed.</p>
                        </CalloutCard>
                        </Box>
                    ) : (
                        <Skelton />
                    )}
                </Layout.Section>

                <Layout.Section>
                    <Text variant="headingMd" as="h2">
                        Manage your Wishlist Plus
                    </Text>
                </Layout.Section>

                <Layout.Section>
                    {!loading ? (
                        <CalloutCard
                            title="Manage Wishlist Plus Setup"
                            illustration="../assets/Step1.svg"
                            primaryAction={{
                                content: 'Manage Configuration',
                                onAction: () => navigate("/manage-configuration"),
                            }}
                        >
                            <p>Wishlist button, launch point, and page settings</p>
                        </CalloutCard>
                    ) : (
                        <Skelton />
                    )}
                </Layout.Section>
                <Layout.Section>
                    {!loading ? (
                        <Card>
                            <Text variant="headingSm" as="h3">Manage Wishlist Plus on your theme</Text>
                            <br />
                            <Text variant="bodyMd" as="p" color="subdued">
                                Complete set up via the theme editor and publish your store <Button variant="plain">View Store</Button>
                            </Text>
                            <br />
                            <Divider />
                            <Box style={{ marginTop: '20px' }}>
                                <Text variant="headingSm" as="h4" fontWeight="bold">Customize and make it your own!</Text>
                                <br />
                                <Text variant="bodySm" as="p" color="subdued">Select what you'd like to customize</Text>
                                <Box marginBlockStart="200">
                                    <br />
                                    <Text variant="bodyMd" as="p">Your customizations will apply to the selected theme.</Text>
                                    <Box maxWidth="300px" marginBlockStart="100">
                                        <Select
                                            label=""
                                            options={themeOptions}
                                            value={selectedTheme}
                                            onChange={setSelectedTheme}
                                            disabled={themeOptions.length === 0}
                                        />
                                    </Box>
                                    <br />
                                    <Box marginBlockStart="100">
                                        <Button
                                            style={{
                                                marginTop: 12,
                                                background: '#f6f6f7',
                                                // color: '#6d7175', 
                                                border: 'none',
                                                cursor: 'not-allowed',
                                                opacity: 0.8
                                            }}
                                            icon={AlertCircleIcon}
                                            disabled
                                        >
                                            Some of these customizations may not be available on legacy themes
                                        </Button>

                                    </Box>
                                </Box>
                                <br />
                                <Box marginBlockStart="100" style={{ position: "relative" }}>
                                    <Box
                                        style={{
                                            position: "absolute",
                                            top: "-65px",
                                            right: "16px",
                                            zIndex: 2,
                                            pointerEvents: "none"
                                        }}
                                    >
                                        <img
                                            src={theme}
                                            alt="Card illustration"
                                            style={{
                                                width: 100,
                                                borderRadius: 8,
                                                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                                                background: "#fff"
                                            }}
                                        />
                                    </Box>
                                    <Card>
                                        <Box flex="1" minWidth="0">
                                            <Text variant="headingXs" as="h6">Site-Wide Settings</Text>
                                            <br /><br />
                                            <Box marginBlockStart="400">
                                                <Text variant="headingXs" as="h6">Basic Setup (App Embed)</Text>
                                                <Text variant="bodyMd" as="p" color="subdued">
                                                    Required for Wishlist Plus to work properly. Enable the core wishlist features for your store - Wishlist <br /> buttons on product pages and category pages, A dedicated wishlist page where shoppers can view  <br />their wishlist & A wishlist launch button for shoppers to access their Wishlist page <Button variant="plain">Learn More</Button>
                                                </Text>
                                                <br />
                                                <Button onClick={() => window.open(appEmbedUrl)} disabled={!appEmbedUrl}>Configure</Button>
                                            </Box>
                                            <br />
                                            <br />
                                            <Box marginBlockStart="400">
                                                <Text variant="headingXs" as="h6">Advanced Setup (Beta)</Text>
                                                <Text variant="bodyMd" as="p" color="subdued">
                                                    Customize your wishlist even more. Enable enhancements like Different wishlist layouts, Multiple  <br />wishlists & prompts to nudge shoppers to Wishlist <Button variant="plain">Learn More</Button>
                                                </Text>
                                                <br />
                                                <Button onClick={() => window.open(wishlistLaunchPointUrl)} disabled={!wishlistLaunchPointUrl}>Configure</Button>
                                            </Box>
                                            <br />
                                            <Divider />
                                            <br />
                                            <Text variant="headingMd" as="h6">Page-Specific Settings</Text><br /><br />
                                            <Box marginBlockStart="400">
                                                <Text variant="headingXs" as="h6">Wishlist on Product Listing Page (App Embed)</Text>
                                                <Text variant="bodyMd" as="p" color="subdued" >
                                                    Customize how wishlist buttons appear in Collections (product listings). Use this to Change how <br /> wishlist icons look, Adjust the wishlist button position on collections pages & allow shoppers to let <br /> them wishlist product variants, etc. <Button variant="plain">Learn More</Button>
                                                </Text>
                                                <br />
                                                <Button onClick={() => window.open(wishlistPageUrl)} disabled={!wishlistPageUrl}>Configure</Button>
                                            </Box>
                                            <br />
                                            <br />
                                            <Box marginBlockStart="400">
                                                <Text variant="headingXs" as="h6">Wishlist on Product Detail Page (App Block)</Text>
                                                <Text variant="bodyMd" as="p" color="subdued">
                                                    Customize the "Add to Wishlist" button on Product pages (individual product detail pages). Use this to <br /> Change the style of the wishlist button, Adjust where it appears on each Product page. <Button variant="plain">Learn More</Button>
                                                </Text>
                                                <br />
                                                <Button onClick={() => window.open(themeEditorUrl)} disabled={!themeEditorUrl}>Configure</Button>
                                            </Box>
                                            <br />
                                            <Divider />
                                        </Box>
                                    </Card>
                                </Box>
                            </Box>
                        </Card>
                    ) : (<Skelton />)}
                </Layout.Section>
                <Layout.Section>

                    <Text variant="headingMd" as="h2">
                        Capture every Shopper interaction that counts
                    </Text>
                    <Text variant="bodyMd" as="p">
                        Features that make it easy for shoppers to show you which products they love
                    </Text>

                </Layout.Section>
                <Layout.Section>
                    {!loading ? (
                        <CalloutCard
                            title="Save for later"
                            illustration="../assets/shop.svg"
                            primaryAction={{
                                content: 'Configure',
                                onAction: () => navigate('/manage-configuration?tab=cart'),
                                icon: ExternalSmallIcon
                            }}

                        >

                            <p>Enable Shoppers to move items from their cart to a Save for Later list, allowing them to purchase later at their convenience</p>

                        </CalloutCard>
                    ) : (
                        <Skelton />
                        // <SkeletonBodyText lines={3} />
                    )}
                </Layout.Section>
                <Layout.Section>

                    <Text variant="headingMd" as="h2">
                        Nudge shoppers to come back to your store
                    </Text>
                    <Text variant="bodyMd" as="p">
                        Timely, contextual alerts to help them pick up where they left off
                    </Text>

                </Layout.Section>
                <Layout.Section>
                    {!loading ? (
                        <CalloutCard
                            title={
                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                    Trigger alerts for product updatesInfo
                                    <span style={{
                                        background: '#e3f1fc',
                                        color: '#2563eb',
                                        borderRadius: '8px',
                                        padding: '2px 8px',
                                        fontSize: 13,
                                        fontWeight: 400,
                                        marginLeft: 8,
                                        display: 'inline-block',
                                        letterSpacing: 0.5
                                    }}>
                                        Starter plan & above
                                    </span>
                                </span>
                            }
                            illustration="../assets/alerts.svg"
                            primaryAction={{
                                content: 'Upgrade Plan',
                                url: '#',
                            }}

                        >

                            <p>Trigger automated alerts to users when their wishlisted items drop in price, are low in stock, are restocked etc.</p>

                        </CalloutCard>
                    ) : (
                        <Skelton />
                        // <SkeletonBodyText lines={3} />
                    )}
                </Layout.Section>
                <Layout.Section style={{ marginTop: '20px' }}>
                    {!loading ? (
                        <CalloutCard
                            title={
                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                    Send reminder emails
                                    <span style={{
                                        background: '#e3f1fc',
                                        color: '#2563eb',
                                        borderRadius: '8px',
                                        padding: '2px 8px',
                                        fontSize: 13,
                                        fontWeight: 400,
                                        marginLeft: 8,
                                        display: 'inline-block',
                                        letterSpacing: 0.5
                                    }}>
                                        Starter plan & above
                                    </span>
                                </span>
                            }
                            illustration="../assets/mail.svg"
                            primaryAction={{
                                content: 'Upgrade Plan',
                                url: '#',
                            }}

                        >

                            <p>Send automated wishlist reminders via integrations to ensure shoppers return to complete their purchases</p>

                        </CalloutCard>
                    ) : (
                        <Skelton />
                        // <SkeletonBodyText lines={3} />
                    )}
                </Layout.Section>
                <Layout.Section>
                    <Box marginBlockEnd="600" paddingBlockEnd="600">
                        <Text variant="headingMd" as="h2" style={{ marginBottom: 0 }}>
                            Integrate with your tools
                        </Text>
                        <Text variant="bodyMd" as="p" color="subdued" style={{ marginBottom: 24 }}>
                            Seamlessly connect applications you rely on – We are partnered with the best tech in the ecosystem
                        </Text>
                        <br />

                        <InlineGrid columns={['oneHalf', 'oneHalf']} gap="400">

                            {/* Left Card: Email Service Providers */}
                            {!loading ? (
                               <div className="no-padding-card">
                                <Card>
                                    <img
                                        src={serviceprovider}
                                        alt="Email Providers"
                                        style={{
                                            width: '100%',
                                            height: 300,
                                            objectFit: 'cover',
                                            borderTopLeftRadius: '8px',
                                            borderTopRightRadius: '8px'
                                        }}
                                    />
                                    <Box padding="4" style={{marginLeft:20}}>    <br />
                                        <Text variant="headingSm" as="h3" fontWeight="bold">Email service provider</Text>
                                        <br />
                                        <Text variant="bodyMd" as="p" color="subdued">
                                            Integrate Wishlist emails with your ESP to have more control over Wishlist email campaigns
                                        </Text>
                                        <br />

                                        <Button icon={ExternalSmallIcon}>
                                            Go to Integrations
                                        </Button>
                                       <br/>
                                       <br/>
                                    </Box>
                                </Card>
                                </div>
                            ) : (
                                <Skelton />
                                // <SkeletonBodyText lines={3} />
                            )}
                            {/* Right Card: SMS Providers */}
                            {!loading ? (
                                 <div className="no-padding-card">
                                <Card>
                                    <Box>
                                        <img
                                            src={smsservice}
                                            alt="SMS Providers"
                                            style={{
                                                width: '100%',
                                                height: 300,
                                                objectFit: 'cover',
                                                marginRight: '70px',
                                                borderTopLeftRadius: '8px',
                                                borderTopRightRadius: '8px'
                                            }}
                                        />
                                    </Box>
                                    <Box padding="4" style={{marginLeft:20}}>
                                        <br />
                                        <Text variant="headingSm" as="h3" fontWeight="bold">Use SMS to notify Shoppers</Text>
                                        <br />
                                        <Text variant="bodyMd" as="p" color="subdued">
                                            Send reminders, back in stock, price drop and low stock alerts for Wishlisted products through SMS
                                        </Text>
                                        <br />
                                        <Button icon={ExternalSmallIcon}>

                                            Go to Integrations
                                        </Button>
                                        <br/>
                                        <br/>
                                    </Box>
                                </Card>
                                </div>
                            ) : (
                                <Skelton />
                                // <SkeletonBodyText lines={3} />
                            )}
                        </InlineGrid>
                    </Box>
                </Layout.Section>
            </Layout>
        </div>
    );
}

