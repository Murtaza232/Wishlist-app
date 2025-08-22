import React from "react";
import { BrowserRouter } from "react-router-dom";
// import { useTranslation } from "react-i18next";
import { NavigationMenu } from "@shopify/app-bridge-react";
import "./index.css";
import Routes from "./Routes";
import { AppProvider, Frame } from "@shopify/polaris";
import "./assets/css/style.css";

import {
    AppBridgeProvider,
    QueryProvider,
    PolarisProvider,
    AppContext,
    LanguageProvider,
    useLanguage
} from "./components";

// Separate component that can use the useLanguage hook
function NavigationMenuWithLang() {
    const { t } = useLanguage();
    const [isFreePlan, setIsFreePlan] = React.useState(true);
    const { apiUrl } = React.useContext(AppContext);

    // Check active subscription plan
    React.useEffect(() => {
        let isMounted = true;
        
        const checkPlan = async () => {
            try {
                const token = await window.shopify?.session?.token || '';
                const planRes = await fetch(`${apiUrl}subscription/active`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                if (!isMounted) return;
                
                if (planRes.ok) {
                    const response = await planRes.json();
                    const planName = response?.data?.plan_name || null;
                    const isFree = !planName || String(planName).toLowerCase() === 'free';
                    console.log('Plan check - isFree:', isFree, 'Plan name:', planName, 'Full response:', response);
                    setIsFreePlan(isFree);
                } else {
                    console.log('Plan check - API error, defaulting to free');
                    setIsFreePlan(true);
                }
            } catch (e) {
                console.error('Error checking plan status:', e);
                if (isMounted) {
                    setIsFreePlan(true);
                }
            }
        };
        
        checkPlan();
        
        return () => {
            isMounted = false;
        };
    }, [apiUrl]);

    const navigationLinks = React.useMemo(() => {
        const links = [
            { label: t('Configuration', 'Sidebar Tabs'), destination: "/Configurations" },
            // { label: t('Dashboard', 'Sidebar Tabs'), destination: "/Dashboard" },
            ...(!isFreePlan ? [{ label: t('Marketing', 'Sidebar Tabs'), destination: "/Marketing" }] : []),
            { label: t('Pricing Plans', 'Sidebar Tabs'), destination: "/Pricing" },
            { label: t('Customers', 'Sidebar Tabs'), destination: "/Customers" },
            // { label: t('Features', 'Sidebar Tabs'), destination: "/Features" },
            { label: t('Settings', 'Sidebar Tabs'), destination: "/Settings" },
        ];
        
        console.log('Navigation Links:', {
            isFreePlan,
            hasMarketingTab: !isFreePlan,
            links: links.map(l => l.destination)
        });
        
        return links;
    }, [isFreePlan, t]);

    return <NavigationMenu navigationLinks={navigationLinks} />;
}

export default function App() {
    // Any .tsx or .jsx files in /pages will become a route
    // See documentation for <Routes /> for more info
    const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");

    // const apiUrl = "https://phpstack-1447206-5423860.cloudwaysapps.com/api/";
    const appUrl = window.location.origin;
    // const apiUrl = `${appUrl}/api/`;
    const apiUrl = 'https://phpstack-362288-5709690.cloudwaysapps.com/api/';
    
    return (
        <PolarisProvider>
            <BrowserRouter>
                <AppBridgeProvider>
                    <QueryProvider>
                        <AppContext.Provider value={{ apiUrl }}>
                            <LanguageProvider>
                                <NavigationMenuWithLang />
                                <Frame>
                                    <Routes pages={pages} />
                                </Frame>
                            </LanguageProvider>
                        </AppContext.Provider>
                    </QueryProvider>
                </AppBridgeProvider>
            </BrowserRouter>
        </PolarisProvider>
    );
}
