import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavigationMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";
import { AppProvider, Frame } from "@shopify/polaris";
import "./assets/css/style.css";

import {
    AppBridgeProvider,
    QueryProvider,
    PolarisProvider,
    AppContext
} from "./components";

export default function App() {
    // Any .tsx or .jsx files in /pages will become a route
    // See documentation for <Routes /> for more info
    const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");
    const { t } = useTranslation();

    // const apiUrl = "https://phpstack-1447206-5423860.cloudwaysapps.com/api/";
    const appUrl = window.location.origin;
    // const apiUrl = `${appUrl}/api/`;
    const apiUrl = 'https://phpstack-362288-5709690.cloudwaysapps.com/api/';
    return (
        <PolarisProvider>
            <BrowserRouter>
                <AppBridgeProvider>
                    <QueryProvider>
                        <NavigationMenu
                            navigationLinks={[

                                {
                                    label: 'Configurations',
                                    destination: "/Configurations",
                                },
                                {
                                    label: 'Dashboard',
                                    destination: "/Dashboard",
                                },
                                {
                                    label: 'Customers',
                                    destination: "/Customers",
                                },
                                {
                                    label: 'Features',
                                    destination: "/Features",
                                },
                                {
                                    label: 'Settings',
                                    destination: "/Settings",
                                },

                            ]}
                        />


                        <AppContext.Provider
                            value={{
                                apiUrl,
                            }}
                        >
                            <Frame>
                                <Routes pages={pages} />
                            </Frame>
                        </AppContext.Provider>
                    </QueryProvider>
                </AppBridgeProvider>
            </BrowserRouter>
        </PolarisProvider>
    );
}
