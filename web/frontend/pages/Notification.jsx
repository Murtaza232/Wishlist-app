import { useAppBridge } from "@shopify/app-bridge-react";
import {
    BlockStack,
    Box,
    Card,
    Divider,
    Icon,
    InlineStack,
    Layout,
    Link,
    Page,
    ResourceItem,
    ResourceList,
    SkeletonBodyText,
    SkeletonDisplayText,
    SkeletonPage,
    Spinner,
    Text,
    Toast,
    TextField,
    Select,
    Frame,
    ContextualSaveBar
} from "@shopify/polaris";
import { ChevronRightIcon } from "@shopify/polaris-icons";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { AppContext } from "../components";
import { useLanguage } from "../components";
import axios from "axios";
import { Knob } from "../components/Knob";

export default function Notification() {
    const navigate = useNavigate();
    const appBridge = useAppBridge();
    const { apiUrl } = useContext(AppContext);
    const { t } = useLanguage();
    const intervalRef = useRef(null);
    // Function to get translated title based on API title
    const getTranslatedTitle = (apiTitle) => {
        // Map API titles to translation keys that match the language system
        const titleMap = {
            "Wishlist Reminder": "Wishlist Reminder",
            "Send reminders on Items Saved for Later": "Send reminders on items saved for later",
            "Send low stock Alerts": "Send low stock alerts", 
            "Send Price Drop alert": "Send Price Drop alert",
            "Sign up confirmation": "Sign up confirmation",
            "Wishlist Shared": "Wishlist Shared",
            "Send Back in stock alerts": "Send back in stock alerts"
        };
        
        const translationKey = titleMap[apiTitle];
        return translationKey ? t(translationKey, 'Notifications') : apiTitle;
    };

    // Function to get notification type based on API title
    const getNotificationType = (apiTitle) => {
        const titleMap = {
            "Wishlist Reminder": "wishlist_reminder",
            "Send reminders on Items Saved for Later": "saved_for_later",
            "Send low stock Alerts": "low_stock",
            "Send Price Drop alert": "price_drop",
            "Sign up confirmation": "sign_up_confirmation",
            "Wishlist Shared": "wishlist_shared",
            "Send Back in stock alerts": "back_in_stock"
        };
        
        return titleMap[apiTitle] || "unknown";
    };

    // Function to get translated description based on notification type
    const getTranslatedDescription = (notificationType) => {
        const descriptionMap = {
            "wishlist_reminder": t('Send reminders for wishlist ', 'Notifications'),
            "saved_for_later": t('Send reminders on items saved for later', 'Notifications'),
            "low_stock": t('Send an alert when stock drops below', 'Notifications'),
            "price_drop": t('Send an alert when price drops by', 'Notifications'),
            "sign_up_confirmation": t('Send a confirmation', 'Notifications'),
            "wishlist_shared": t('Send a alert when shoppers share their wishlist', 'Notifications'),
            "back_in_stock": t('Send an alert when wislisted items are back in stock', 'Notifications')
        };
        
        return descriptionMap[notificationType] || "";
    };

    // State declarations
    const [btnLoading, setBtnLoading] = useState({});
    const [toasts, setToasts] = useState({ error: false, success: false, msg: "" });
    const [toggleLoadData, setToggleLoadData] = useState(true);
    const [loading, setLoading] = useState(true);
    const [customerNotifications, setCustomerNotifications] = useState([]);
    const [reminderValue, setReminderValue] = useState("0");
    const [reminderTimeUnit, setReminderTimeUnit] = useState("hours");
    const [savedForLaterValue, setSavedForLaterValue] = useState("0");
    const [savedForLaterTimeUnit, setSavedForLaterTimeUnit] = useState("hours");
    const [lowStockValue, setLowStockValue] = useState("0");
    const [priceDropValue, setPriceDropValue] = useState("0");

    // Contextual save bar state
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [lastSavedState, setLastSavedState] = useState({
        notifications: {},
        reminderValue: "0",
        reminderTimeUnit: "hours",
        savedForLaterValue: "0",
        savedForLaterTimeUnit: "hours",
        lowStockValue: "0",
        priceDropValue: "0"
    });

    useEffect(() => {
        function enhanceSaveBar() {
          const saveBar = document.querySelector('.Polaris-Frame-ContextualSaveBar');
          if (!saveBar) return;
    
          // Discard Button
          const discardButton = saveBar.querySelector('button.Polaris-Button--variantTertiary');
          const discardSpan = discardButton?.querySelector('span.Polaris-Text--medium');
    
          if (discardButton && discardSpan && discardSpan.textContent !== t("Discard", "Save Bar")) {
            discardSpan.textContent = t("Discard", "Save Bar");
            discardButton.style.backgroundColor = "#f1f2f3";
            discardButton.style.color = "#1c1c1c";
            discardButton.style.border = "1px solid #d1d1d1";
            discardButton.style.borderRadius = "8px";
            discardButton.style.padding = "8px 16px";
            discardButton.style.fontWeight = "500";
          }
    
          // Save Button
          const saveButton = saveBar.querySelector('button.Polaris-Button--variantPrimary');
          const saveSpan = saveButton?.querySelector('span.Polaris-Text--medium');
    
          if (saveSpan && saveSpan.textContent !== t("Save", "Save Bar")) {
            saveSpan.textContent = t("Save", "Save Bar");
          }
        }
    
        intervalRef.current = setInterval(() => {
          const saveBarVisible = document.querySelector('.Polaris-Frame-ContextualSaveBar');
          if (saveBarVisible) {
            enhanceSaveBar();
          }
        }, 300); // Runs every 300ms only when bar is visible
    
        return () => {
          clearInterval(intervalRef.current);
        };
      }, [t]);
    

    // Toast handler
    const toggleToast = useCallback((type, msg = "") => {
        setToasts((prev) => ({ ...prev, [type]: !prev[type], msg }));
    }, []);

    // Data fetching
    const fetchData = async () => {
        try {
            const sessionToken = await getSessionToken(appBridge);
            const response = await axios.get(`${apiUrl}subscription-notifications`, {
                headers: { Authorization: `Bearer ${sessionToken}` },
            });
            const { subscription_notifications } = response?.data;
            const customer_notifications = subscription_notifications?.filter(
                (item) => item?.email_type === "Customer notifications",
            );
            setCustomerNotifications(customer_notifications || []);
            // console.log('Fetched notification titles:', customer_notifications?.map(n => n.title));

            // Extract saved values from notification database columns
            let savedReminderValue = "0";
            let savedReminderTimeUnit = "hours";
            let savedSavedForLaterValue = "0";
            let savedSavedForLaterTimeUnit = "hours";
            let savedLowStockValue = "0";
            let savedPriceDropValue = "0";

            // Read values directly from database columns
            customer_notifications?.forEach(notification => {
                const notificationType = getNotificationType(notification.title);
                
                if (notificationType === "wishlist_reminder") {
                    savedReminderValue = notification.reminder_value || "0";
                    savedReminderTimeUnit = notification.reminder_time_unit || "hours";
                } else if (notificationType === "saved_for_later") {
                    savedSavedForLaterValue = notification.saved_for_later_value || "0";
                    savedSavedForLaterTimeUnit = notification.saved_for_later_time_unit || "hours";
                } else if (notificationType === "low_stock") {
                    savedLowStockValue = notification.low_stock_value || "0";
                } else if (notificationType === "price_drop") {
                    savedPriceDropValue = notification.price_drop_value || "0";
                }
            });

            // Set input field values from saved data
            setReminderValue(savedReminderValue);
            setReminderTimeUnit(savedReminderTimeUnit);
            setSavedForLaterValue(savedSavedForLaterValue);
            setSavedForLaterTimeUnit(savedSavedForLaterTimeUnit);
            setLowStockValue(savedLowStockValue);
            setPriceDropValue(savedPriceDropValue);

            // Set last saved state for notifications and input fields
            const savedNotifications = {};
            customer_notifications?.forEach(notification => {
                savedNotifications[notification.id] = { ...notification };
            });

            const newLastSavedState = {
                notifications: savedNotifications,
                reminderValue: savedReminderValue,
                reminderTimeUnit: savedReminderTimeUnit,
                savedForLaterValue: savedSavedForLaterValue,
                savedForLaterTimeUnit: savedSavedForLaterTimeUnit,
                lowStockValue: savedLowStockValue,
                priceDropValue: savedPriceDropValue
            };

            setLastSavedState(newLastSavedState);

        } catch {
            toggleToast("error", "Failed to load data");
        } finally {
            setToggleLoadData(false);
            setLoading(false);
            setBtnLoading(false);
        }
    };

    useEffect(() => {
        if (toggleLoadData) fetchData();
    }, [toggleLoadData]);

    // Check for unsaved changes whenever any value changes
    useEffect(() => {
        if (lastSavedState.notifications && Object.keys(lastSavedState.notifications).length > 0) {
            markUnsaved();
        }
    }, [customerNotifications, reminderValue, reminderTimeUnit, savedForLaterValue, savedForLaterTimeUnit, lowStockValue, priceDropValue]);

    const handleNavigate = (id) => {
        const target = event.target;
        const isCheckbox = target.tagName === "INPUT" || target.tagName === "LABEL";
        if (!isCheckbox) {
            navigate(`/notification/${id}`);
            event.stopPropagation();
        }
    };

    const handleCheckboxChangeIsActive = async (Id, value) => {
        // Update the local state
        setCustomerNotifications(prev =>
            prev.map(item =>
                item.id === Id
                    ? { ...item, active_status: value === 0 ? 1 : 0 }
                    : item
            )
        );
    };

    // Save handler for contextual save bar
    const handleSave = async () => {
        setSaving(true);
        setSaveMessage("");
        try {
            const sessionToken = await getSessionToken(appBridge);

            // Save all changed notifications
            const changedNotifications = lastSavedState.notifications ? customerNotifications.filter(notification => {
                const original = lastSavedState.notifications[notification.id];
                return original && original.active_status !== notification.active_status;
            }) : [];

            for (const notification of changedNotifications) {
                const enableValue = notification.active_status;
                await axios.get(
                    `${apiUrl}subscription-notification-status-save/${notification.id}?active_status=${enableValue}`,
                    {
                        headers: {
                            Authorization: `Bearer ${sessionToken}`,
                        },
                    }
                );
            }

            // Save input field values to their respective notifications
            const notificationsToUpdate = customerNotifications.filter(notification => {
                const notificationType = getNotificationType(notification.title);
                return ["wishlist_reminder", "saved_for_later", "low_stock", "price_drop"].includes(notificationType);
            });

            for (const notification of notificationsToUpdate) {
                let requestData = {
                    active_status: notification.active_status
                };

                // Add input field values based on notification type
                const notificationType = getNotificationType(notification.title);
                
                if (notificationType === "wishlist_reminder") {
                    requestData.reminder_value = reminderValue;
                    requestData.reminder_time_unit = reminderTimeUnit;
                } else if (notificationType === "saved_for_later") {
                    requestData.saved_for_later_value = savedForLaterValue;
                    requestData.saved_for_later_time_unit = savedForLaterTimeUnit;
                } else if (notificationType === "low_stock") {
                    requestData.low_stock_value = lowStockValue;
                } else if (notificationType === "price_drop") {
                    requestData.price_drop_value = priceDropValue;
                }

                // Save the updated notification data
                await axios.post(
                    `${apiUrl}subscription-notification-save/${notification.id}`,
                    requestData,
                    {
                        headers: {
                            Authorization: `Bearer ${sessionToken}`,
                        },
                    }
                );
            }

            setSaveMessage("Saved successfully!");

            // Update last saved state with all current values
            const savedNotifications = {};
            customerNotifications.forEach(notification => {
                savedNotifications[notification.id] = { ...notification };
            });

            const newSavedState = {
                notifications: savedNotifications,
                reminderValue,
                reminderTimeUnit,
                savedForLaterValue,
                savedForLaterTimeUnit,
                lowStockValue,
                priceDropValue
            };

            console.log('Saving new state:', newSavedState);
            setLastSavedState(newSavedState);
            setHasUnsavedChanges(false);
        } catch (error) {
            console.error('Save error:', error);
            setSaveMessage("Save failed. Please try again.");
        }
        setSaving(false);
    };

    // Reset to last saved state
    const resetToLastSaved = () => {
        console.log('Resetting to last saved state:', lastSavedState);
        setHasUnsavedChanges(false);

        // Reset notification states
        if (lastSavedState.notifications && Object.keys(lastSavedState.notifications).length > 0) {
            setCustomerNotifications(prev =>
                prev.map(item =>
                    lastSavedState.notifications[item.id]
                        ? { ...item, active_status: lastSavedState.notifications[item.id].active_status }
                        : item
                )
            );
        }

        // Reset input field values to last saved state
        setReminderValue(lastSavedState.reminderValue || "0");
        setReminderTimeUnit(lastSavedState.reminderTimeUnit || "hours");
        setSavedForLaterValue(lastSavedState.savedForLaterValue || "0");
        setSavedForLaterTimeUnit(lastSavedState.savedForLaterTimeUnit || "hours");
        setLowStockValue(lastSavedState.lowStockValue || "0");
        setPriceDropValue(lastSavedState.priceDropValue || "0");

        console.log('Reset values:', {
            reminderValue: lastSavedState.reminderValue || "0",
            reminderTimeUnit: lastSavedState.reminderTimeUnit || "hours",
            savedForLaterValue: lastSavedState.savedForLaterValue || "0",
            savedForLaterTimeUnit: lastSavedState.savedForLaterTimeUnit || "hours",
            lowStockValue: lastSavedState.lowStockValue || "0",
            priceDropValue: lastSavedState.priceDropValue || "0"
        });
    };

    // Mark as unsaved when any field changes
    const markUnsaved = () => {
        // Check if there are actual changes compared to last saved state
        const hasNotificationChanges = lastSavedState.notifications ? customerNotifications.some(notification => {
            const original = lastSavedState.notifications[notification.id];
            return original && original.active_status !== notification.active_status;
        }) : false;

        const hasInputChanges =
            reminderValue !== lastSavedState.reminderValue ||
            reminderTimeUnit !== lastSavedState.reminderTimeUnit ||
            savedForLaterValue !== lastSavedState.savedForLaterValue ||
            savedForLaterTimeUnit !== lastSavedState.savedForLaterTimeUnit ||
            lowStockValue !== lastSavedState.lowStockValue ||
            priceDropValue !== lastSavedState.priceDropValue;

        if ((hasNotificationChanges || hasInputChanges) && !hasUnsavedChanges) {
            setHasUnsavedChanges(true);
        } else if (!hasNotificationChanges && !hasInputChanges && hasUnsavedChanges) {
            setHasUnsavedChanges(false);
        }
    };



    return (
        <div>
            {toasts.error && <Toast content={toasts.msg} error onDismiss={() => toggleToast("error")} />}
            {toasts.success && <Toast content={toasts.msg} onDismiss={() => toggleToast("success")} />}

            {hasUnsavedChanges && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    background: '#ffffff',
                    borderBottom: '1px solid #e3e3e3',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}>
                    <ContextualSaveBar
                        fullWidth
                        alignContentFlush
                        message={
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                width: '100%',
                                fontWeight: 600,
                                color: '#222',
                            }}>
                                <span style={{ color: '#222' }}>{t('Unsaved Changes', 'Save Bar')}</span>
                            </div>
                        }
                        saveAction={{
                            onAction: handleSave,
                            loading: saving,
                            disabled: saving,
                        }}
                        discardAction={{
                            onAction: resetToLastSaved,
                        }}
                    />
                </div>
            )}

            {loading ? (
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
                        {/* Header skeleton */}
                        <div style={{
                            width: '100%'
                        }}>
                            <SkeletonDisplayText size="large" />
                            <div style={{ marginTop: 8 }}>
                                <SkeletonBodyText lines={1} />
                            </div>
                        </div>

                        {/* Content skeleton */}
                        <div style={{ width: '100%' }}>
                            <BlockStack gap={"400"}>
                                <Card padding={"0"}>
                                    <Box padding={"400"}>
                                        <SkeletonDisplayText size="medium" />
                                    </Box>
                                    <Divider />
                                    <Box padding={"400"}>
                                        <SkeletonBodyText lines={8} />
                                    </Box>
                                    <Divider />
                                    <Box padding={"400"}>
                                        <SkeletonBodyText lines={8} />
                                    </Box>
                                    <Divider />
                                    <Box padding={"400"}>
                                        <SkeletonBodyText lines={8} />
                                    </Box>
                                    <Divider />
                                    <Box padding={"400"}>
                                        <SkeletonBodyText lines={8} />
                                    </Box>
                                </Card>
                            </BlockStack>
                        </div>
                    </div>
                </Frame>
            ) : (
                // <Page
                //     title="Notification"
                //     subtitle={
                //         <BlockStack>
                //             <Text as={'span'} variant={'bodyMd'}>Notifications are automatically sent out to either the store owner or the customer.</Text>
                //             <BlockStack style={{ justifyContent: 'start' }}>
                //                 <img style={{ width: '10px', marginRight: '4px' }} src={'/web/frontend/assets/userGuid.svg'} /> <Link url={'https://script-and-theory.gitbook.io/all-in-one-commerce-docs/subscription/settings/notifications'} removeUnderline={true} monochrome={'6d7175'} external={'6d7175'} target={'_blank'}> User Guide</Link>
                //             </BlockStack>
                //         </BlockStack>
                //     }
                // >
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
                            {t('Notifications', 'Notifications')}
                            <br />
                            <span style={{ fontSize: 13, color: '#555', fontWeight: 400, maxWidth: 700, marginTop: 2 }}>
                                {t('Notifications Subtitle', 'Notifications')}
                            </span>
                        </div>

                        <div style={{ width: '100%' }}>
                            <BlockStack gap={"400"}>
                                <Card padding={"0"}>
                                    <Box padding={"400"}>
                                        <Text as="h3" variant="headingMd">
                                            {t('Alerts and Notifications', 'Notifications')}
                                        </Text>
                                    </Box>
                                    <Divider />
                                    <ResourceList
                                        resourceName={{ singular: "notification", plural: "notifications" }}
                                        items={customerNotifications}
                                        renderItem={(item, index) => {
                                            const { id, title, description, active_status } = item;
                                            const notificationType = getNotificationType(title);
                                            const translatedTitle = getTranslatedTitle(title);
                                            const translatedDescription = getTranslatedDescription(notificationType);

                                            return (
                                                <ResourceItem
                                                    onClick={() => handleNavigate(id)}
                                                    id={id}
                                                    accessibilityLabel={`View details for ${translatedTitle}`}
                                                >
                                                    <InlineStack align="space-between" blockAlign="center">
                                                        <BlockStack>
                                                            <Text variant="headingSm" as="h6">
                                                                {translatedTitle}
                                                            </Text>
                                                            {notificationType === "wishlist_reminder" ? (
                                                                <InlineStack gap="200" blockAlign="center">
                                                                    <Text variant="bodyMd" tone="subdued">
                                                                        {translatedDescription}
                                                                    </Text>
                                                                    <div
                                                                        style={{ width: "80px" }}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        onMouseDown={(e) => e.stopPropagation()}
                                                                    >
                                                                        <TextField
                                                                            value={reminderValue}
                                                                            onChange={(value) => { setReminderValue(value); markUnsaved(); }}
                                                                            type="number"
                                                                            min="0"
                                                                            autoComplete="off"
                                                                        />
                                                                    </div>
                                                                    <div
                                                                        style={{ width: "120px" }}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        onMouseDown={(e) => e.stopPropagation()}
                                                                    >
                                                                        <Select
                                                                            options={[
                                                                                // { label: "Minutes", value: "minutes" },
                                                                                { label: t('Hours', 'Notifications'), value: "hours" },
                                                                                { label: t('Days', 'Notifications'), value: "days" },
                                                                            ]}
                                                                            value={reminderTimeUnit}
                                                                            onChange={(value) => { setReminderTimeUnit(value); markUnsaved(); }}
                                                                        />
                                                                    </div>
                                                                </InlineStack>
                                                            ) : notificationType === "saved_for_later" ? (
                                                                <InlineStack gap="200" blockAlign="center">
                                                                    <Text variant="bodyMd" tone="subdued">
                                                                        {translatedDescription}
                                                                    </Text>
                                                                    <div
                                                                        style={{ width: "80px" }}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        onMouseDown={(e) => e.stopPropagation()}
                                                                    >
                                                                        <TextField
                                                                            value={savedForLaterValue}
                                                                            onChange={(value) => { setSavedForLaterValue(value); markUnsaved(); }}
                                                                            type="number"
                                                                            min="0"
                                                                            autoComplete="off"
                                                                        />
                                                                    </div>
                                                                    <div
                                                                        style={{ width: "120px" }}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        onMouseDown={(e) => e.stopPropagation()}
                                                                    >
                                                                        <Select
                                                                            options={[
                                                                                // { label: "Minutes", value: "minutes" },
                                                                                { label: t('Hours', 'Notifications'), value: "hours" },
                                                                                { label: t('Days', 'Notifications'), value: "days" },
                                                                            ]}
                                                                            value={savedForLaterTimeUnit}
                                                                            onChange={(value) => { setSavedForLaterTimeUnit(value); markUnsaved(); }}
                                                                        />
                                                                    </div>
                                                                </InlineStack>
                                                            ) : notificationType === "low_stock" ? (
                                                                <InlineStack gap="200" blockAlign="center">
                                                                    <Text variant="bodyMd" tone="subdued">
                                                                        {translatedDescription}
                                                                    </Text>
                                                                    <div
                                                                        style={{ width: "80px" }}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        onMouseDown={(e) => e.stopPropagation()}
                                                                    >
                                                                        <TextField
                                                                            value={lowStockValue}
                                                                            onChange={(value) => { setLowStockValue(value); markUnsaved(); }}
                                                                            type="number"
                                                                            min="0"
                                                                            autoComplete="off"
                                                                        />
                                                                    </div>
                                                                    <Text variant="bodyMd" tone="subdued">
                                                                        {t('units', 'Notifications')}
                                                                    </Text>
                                                                </InlineStack>
                                                            ) : notificationType === "price_drop" ? (
                                                                <InlineStack gap="200" blockAlign="center">
                                                                    <Text variant="bodyMd" tone="subdued">
                                                                        {translatedDescription}
                                                                    </Text>
                                                                    <div
                                                                        style={{ width: "80px" }}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        onMouseDown={(e) => e.stopPropagation()}
                                                                    >
                                                                        <TextField
                                                                            value={priceDropValue}
                                                                            onChange={(value) => { setPriceDropValue(value); markUnsaved(); }}
                                                                            type="number"
                                                                            min="0"
                                                                            autoComplete="off"
                                                                        />
                                                                    </div>
                                                                    <Text variant="bodyMd" tone="subdued">
                                                                        %
                                                                    </Text>
                                                                </InlineStack>
                                                            ) : notificationType === "sign_up_confirmation" ? (
                                                                <Text variant="bodyMd" tone="subdued">
                                                                    {translatedDescription}
                                                                </Text>
                                                            ) : notificationType === "wishlist_shared" ? (
                                                                <Text variant="bodyMd" tone="subdued">
                                                                    {translatedDescription}
                                                                </Text>
                                                            ) : notificationType === "back_in_stock" ? (
                                                                <Text variant="bodyMd" tone="subdued">
                                                                    {translatedDescription}
                                                                </Text>
                                                            ) : (
                                                                <Text variant="bodyMd" tone="subdued">
                                                                    {description}
                                                                </Text>
                                                            )}
                                                        </BlockStack>
                                                        <InlineStack gap={"200"} blockAlign="center">
                                                            {btnLoading[id] ? (
                                                                <span
                                                                    className="toggleSpinner"
                                                                    style={{
                                                                        marginLeft: "0px",
                                                                        marginRight: "5px",
                                                                    }}
                                                                >
                                                                    <Spinner size="small" />
                                                                </span>
                                                            ) : (
                                                                <Knob
                                                                    selected={active_status}
                                                                    ariaLabel="Status"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleCheckboxChangeIsActive(id, active_status);
                                                                    }}
                                                                />
                                                            )}
                                                            <Icon tone="base" source={ChevronRightIcon} />
                                                        </InlineStack>
                                                    </InlineStack>
                                                </ResourceItem>
                                            );
                                        }}
                                    />
                                </Card>
                            </BlockStack>
                        </div>
                    </div>
                </Frame>
            )}
        </div>
    );
} 