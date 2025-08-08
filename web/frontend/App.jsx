import { BrowserRouter } from "react-router-dom";
// import { useTranslation } from "react-i18next";
import { NavigationMenu } from "@shopify/app-bridge-react";
import "./index.css";
import Routes from "./Routes";
import { AppProvider, Frame } from "@shopify/polaris";
import "./assets/css/style.css";
import { useLanguage } from '/components';

import {
    AppBridgeProvider,
    QueryProvider,
    PolarisProvider,
    AppContext,
    LanguageProvider
} from "./components";

export default function App() {
    // Any .tsx or .jsx files in /pages will become a route
    // See documentation for <Routes /> for more info
    const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");
    // Remove: const { t } = useLanguage();

    function NavigationMenuWithLang() {
        const { t } = useLanguage();
        return (
            <NavigationMenu
                navigationLinks={[
                    { label: t('Configuration', 'Sidebar Tabs'), destination: "/Configurations" },
                    { label: t('Dashboard', 'Sidebar Tabs'), destination: "/Dashboard" },
                    { label: t('Customers', 'Sidebar Tabs'), destination: "/Customers" },
                    { label: t('Features', 'Sidebar Tabs'), destination: "/Features" },
                    { label: t('Settings', 'Sidebar Tabs'), destination: "/Settings" },
                ]}
            />
        );
    }

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
