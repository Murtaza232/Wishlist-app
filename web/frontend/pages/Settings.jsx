import React, { useState, useContext, useRef } from "react";
import {
    Page,
    Card,
    Text,
    Box,
    Select,
    Checkbox,
    Divider,
    ContextualSaveBar,Grid, LegacyCard, Icon,Spinner
} from "@shopify/polaris";
import { AppContext } from "../components";
import { useAppBridge } from "@shopify/app-bridge-react";
import { ArrowLeftIcon } from '@shopify/polaris-icons';
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import {getSessionToken} from "@shopify/app-bridge-utils";
export default function Settings() {
    const appBridge = useAppBridge();
    const { apiUrl } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    // State for toggles and SmartSave options
    const [multiWishlist, setMultiWishlist] = useState(true);
    const [shareWishlist, setShareWishlist] = useState(true);
    const [smartSave, setSmartSave] = useState(true);
    const [smartSaveCount, setSmartSaveCount] = useState(3);
    const [smartSavePosition, setSmartSavePosition] = useState("Top Left");

    // State for Acknowledgements
    const [ackSignUp, setAckSignUp] = useState(false);
    const [ackItemAdded, setAckItemAdded] = useState(false);
    const [ackShared, setAckShared] = useState(false);
    const fetch = useAuthenticatedFetch();
    // State for Reminders
    const [remWishlist, setRemWishlist] = useState(false);
    const [remWishlistHours, setRemWishlistHours] = useState(0);
    const [remWishlistUnit, setRemWishlistUnit] = useState("hours");
    const [remSaved, setRemSaved] = useState(false);
    const [remSavedHours, setRemSavedHours] = useState(0);
    const [remSavedUnit, setRemSavedUnit] = useState("hours");

    // State for Alerts & Triggers
    const [alertLowStock, setAlertLowStock] = useState(false);
    const [alertLowStockValue, setAlertLowStockValue] = useState(0);
    const [alertPriceDrop, setAlertPriceDrop] = useState(false);
    const [alertPriceDropValue, setAlertPriceDropValue] = useState(0);
    const [alertBackInStock, setAlertBackInStock] = useState(false);

    const positionOptions = [
        { label: "Top Left", value: "Top Left" },
        { label: "Top Right", value: "Top Right" },
        { label: "Bottom Left", value: "Bottom Left" },
        { label: "Bottom Right", value: "Bottom Right" },
    ];
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [saving, setSaving] = useState(false);
    const lastSavedState = useRef({});

    // Wrap all input setters to mark unsaved changes
    const handleInputChange = (setter) => (value) => {
        setter(value);
        setHasUnsavedChanges(true);
    };

    const buildPayload = () => ({
        allow_multiple_items_wishlist: multiWishlist,
        allow_to_share_wishlist: shareWishlist,
        allow_to_smart_save: smartSave,
        smart_save_visit_count: smartSaveCount,
        smart_save_notification_position: smartSavePosition.replace(' ', '_').toLowerCase(),
        // smart_save_visit_count: smartSave ? smartSaveCount : null,
        // smart_save_notification_position: smartSave ? smartSavePosition.replace(' ', '_').toLowerCase() : null,
        sign_up_confirmation: ackSignUp,
        item_added: ackItemAdded,
        wishlist_shared: ackShared,
        wishlist_reminder: remWishlist,
        wishlist_reminder_time: remWishlistHours,
        // wishlist_reminder_time: remWishlist ? remWishlistHours : null,
        wishlist_reminder_unit:  remWishlistUnit,
        saved_for_later_reminder: remSaved,
        saved_for_later_reminder_time: remSavedHours,
        saved_for_later_reminder_unit: remSavedUnit,
        // saved_for_later_reminder_time: remSaved ? remSavedHours : null,
        // saved_for_later_reminder_unit: remSaved ? remSavedUnit : null,
        low_stock_alert: alertLowStock,
        stock_alert_threshold_units: alertLowStockValue,
        // stock_alert_threshold_units: alertLowStock ? alertLowStockValue : null,
        price_drop_alert: alertPriceDrop,
        price_drop_alert_threshold_percent: alertPriceDropValue,
        // price_drop_alert_threshold_percent: alertPriceDrop ? alertPriceDropValue : null,
        back_in_stock_alert: alertBackInStock,
        // Add other fields as needed
    });

    const handleSave = async () => {
        setSaving(true);
        try {
          const token = await getSessionToken(appBridge);
          if (!token) {
            alert("No token");
            return;
          }
          const payload = buildPayload();
          console.log("Payload:", payload);
          const res = await fetch(`${apiUrl}wishlist-features-store`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload),
          });
          const response = await res.json();
          console.log("API response:", response);
          if (response.success) {
            lastSavedState.current = { ...buildPayload() };
            setHasUnsavedChanges(false);
          } else {
            alert(response.message || "Save failed");
          }
        } catch (e) {
          console.error("Save error:", e);
          alert("Save failed. Network or server error.");
        }
        setSaving(false);
      };

    // const handleDiscard = async () => {
    //     setSaving(true);
    //     try {
    //         const res = await fetch(`${apiUrl}wishlist-features-store`);
    //         const data = await res.json();
    //         setMultiWishlist(data.allow_multiple_items_wishlist);
    //         setShareWishlist(data.allow_to_share_wishlist);
    //         setSmartSave(data.allow_to_smart_save);
    //         setSmartSaveCount(data.smart_save_visit_count);
    //         setSmartSavePosition(data.smart_save_notification_position.replace('_', ' '));
    //         setAckSignUp(data.sign_up_confirmation);
    //         setAckItemAdded(data.item_added);
    //         setAckShared(data.wishlist_shared);
    //         setRemWishlist(data.wishlist_reminder);
    //         setRemWishlistHours(data.wishlist_reminder_time);
    //         setRemSaved(data.saved_for_later_reminder);
    //         setRemSavedHours(data.saved_for_later_reminder_time);
    //         setAlertLowStock(data.low_stock_alert);
    //         setAlertLowStockValue(data.stock_alert_threshold_units);
    //         setAlertPriceDrop(data.price_drop_alert);
    //         setAlertPriceDropValue(data.price_drop_alert_threshold_percent);
    //         setAlertBackInStock(data.back_in_stock_alert);
    //         setHasUnsavedChanges(false);
    //     } catch (e) {
    //         // handle error
    //     }
    //     setSaving(false);
    // };

    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 900);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = await getSessionToken(appBridge);
                if (!token) return;
                const res = await fetch(`${apiUrl}wishlist-features-store`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error('Network response was not ok');
                const response = await res.json();
                const data = response.data || {};
                setMultiWishlist(!!data.allow_multiple_items_wishlist);
                setShareWishlist(!!data.allow_to_share_wishlist);
                setSmartSave(!!data.allow_to_smart_save);
                setSmartSaveCount(Number(data.smart_save_visit_count) || 3);
                setSmartSavePosition(data.smart_save_notification_position ? data.smart_save_notification_position.replace('_', ' ') : 'Top Left');
                setAckSignUp(!!data.sign_up_confirmation);
                setAckItemAdded(!!data.item_added);
                setAckShared(!!data.wishlist_shared);
                setRemWishlist(!!data.wishlist_reminder);
                setRemWishlistHours(Number(data.wishlist_reminder_time) || 0);
                setRemWishlistUnit(data.wishlist_reminder_unit || 'hours');
                setRemSaved(!!data.saved_for_later_reminder);
                setRemSavedHours(Number(data.saved_for_later_reminder_time) || 0);
                setRemSavedUnit(data.saved_for_later_reminder_unit || 'hours');
                setAlertLowStock(!!data.low_stock_alert);
                setAlertLowStockValue(Number(data.stock_alert_threshold_units) || 0);
                setAlertPriceDrop(!!data.price_drop_alert);
                setAlertPriceDropValue(Number(data.price_drop_alert_threshold_percent) || 0);
                setAlertBackInStock(!!data.back_in_stock_alert);
                lastSavedState.current = { ...data };
            } catch (error) {
                console.error('Failed to fetch settings data:', error);
            }
            setLoading(false);
        };
        fetchData();
    }, [apiUrl, appBridge]);

    function resetToLastSaved() {
        const data = lastSavedState.current;
        setMultiWishlist(data.allow_multiple_items_wishlist !== undefined ? data.allow_multiple_items_wishlist : true);
        setShareWishlist(data.allow_to_share_wishlist !== undefined ? data.allow_to_share_wishlist : true);
        setSmartSave(data.allow_to_smart_save !== undefined ? data.allow_to_smart_save : true);
        setSmartSaveCount(data.smart_save_visit_count !== undefined ? data.smart_save_visit_count : 3);
        setSmartSavePosition(data.smart_save_notification_position !== undefined ? data.smart_save_notification_position : "Top Left");
        setAckSignUp(data.sign_up_confirmation !== undefined ? data.sign_up_confirmation : false);
        setAckItemAdded(data.item_added !== undefined ? data.item_added : false);
        setAckShared(data.wishlist_shared !== undefined ? data.wishlist_shared : false);
        setRemWishlist(data.wishlist_reminder !== undefined ? data.wishlist_reminder : false);
        setRemWishlistHours(data.wishlist_reminder_time !== undefined ? data.wishlist_reminder_time : 0);
        setRemWishlistUnit(data.wishlist_reminder_unit !== undefined ? data.wishlist_reminder_unit : 'hours');
        setRemSaved(data.saved_for_later_reminder !== undefined ? data.saved_for_later_reminder : false);
        setRemSavedHours(data.saved_for_later_reminder_time !== undefined ? data.saved_for_later_reminder_time : 0);
        setRemSavedUnit(data.saved_for_later_reminder_unit !== undefined ? data.saved_for_later_reminder_unit : 'hours');
        setAlertLowStock(data.low_stock_alert !== undefined ? data.low_stock_alert : false);
        setAlertLowStockValue(data.stock_alert_threshold_units !== undefined ? data.stock_alert_threshold_units : 0);
        setAlertPriceDrop(data.price_drop_alert !== undefined ? data.price_drop_alert : false);
        setAlertPriceDropValue(data.price_drop_alert_threshold_percent !== undefined ? data.price_drop_alert_threshold_percent : 0);
        setAlertBackInStock(data.back_in_stock_alert !== undefined ? data.back_in_stock_alert : false);
        setHasUnsavedChanges(false);
    }

    function CenteredSpinner() {
        return (
          <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#F1F1F1"
          }}>
            <Spinner accessibilityLabel="Loading" size="large" />
          </div>
        );
      }

    if (loading) return <CenteredSpinner />;

    return (
        <>
            {hasUnsavedChanges && (
                <ContextualSaveBar
                    fullWidth
                    alignContentFlush
                    message={<span style={{ color: '#222' }}>Unsaved changes</span>}
                    saveAction={{
                        onAction: handleSave,
                        loading: saving,
                        disabled: saving,
                    }}
                    discardAction={{ onAction: resetToLastSaved }}
                />
            )}

            {/* Back button and title */}
            {/* <Box style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 24,
                marginTop: isMobile ? 40 : 50,
                marginLeft: isMobile ? 16 : 200
            }}>
                <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => navigate('/features')}>
                    <Icon source={ArrowLeftIcon} color="base" />
                </span>
                <Text variant="headingLg" as="h1" fontWeight="bold">Settings</Text>
            </Box> */}

            <Page title="Settings"
             subtitle="Manage your settings"
            >
                <Box style={{
                    display: isMobile ? 'block' : 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'stretch' : 'flex-start',
                    justifyContent: 'flex-start',
                    gap: isMobile ? 0 : 48,
                    maxWidth: isMobile ? '100%' : 1200,
                    margin: isMobile ? '0' : '40px auto 0 auto',
                    width: '100%',
                    marginBottom: 20,
                    padding: isMobile ? '0 8px' : undefined
                }}>
                    {/* Sidebar Section */}
                    <Box style={{ minWidth: isMobile ? 'unset' : 260, maxWidth: isMobile ? 'unset' : 320, flex: isMobile ? 'unset' : '0 0 320px', marginBottom: isMobile ? 24 : 0, width: '100%' }}>
                        <Text variant="headingSm" as="h3" fontWeight="bold" style={{ marginBottom: 8 }}>Features</Text>
                        <Text variant="bodyMd" as="p" color="subdued" style={{ fontSize: 14, marginBottom: 8 }}>
                            Set up personalized alerts for shoppers based on their wishlist items
                        </Text>
                        <Box paddingBlockStart="200">
                            <a href="#" style={{ color: '#005bd3', textDecoration: 'underline', fontSize: 14 }}>Learn More</a>
                        </Box>
                    </Box>
                    {/* Main Content Section */}
                    <Box style={{ flex: 1, minWidth: isMobile ? 'unset' : 340, maxWidth: isMobile ? 'unset' : 600, width: '100%' }}>
                        <Card sectioned style={{ borderRadius: 16, boxShadow: '0 1px 4px rgba(23,24,24,0.04)', border: '1px solid #e1e3e5', background: '#fff', padding: isMobile ? 12 : 24, width: '100%' }}>

                            <Box style={{ marginBottom: 10 }}> <span variant="headingMd" as="h3" style={{ fontWeight: "bold" }}>Features</span>
                            </Box>
                            <Box style={{ marginBlockStart: "400" }}>
                                {/* Feature 1 */}
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    style={{
                                        background: '#fff',
                                        borderRadius: 8,
                                        border: '1px solid #e1e3e5',
                                        // marginBottom: 20,
                                        boxShadow: 'none',
                                        padding: 18,
                                        justifyContent: 'space-between',
                                        gap: 16,
                                    }}
                                >
                                    {/* Left: Checkbox and Main Label */}
                                    <Box display="flex" alignItems="center" style={{ gap: 12 }}>
                                        <Checkbox
                                            label={<span style={{ fontWeight: 'bold' }}>Allow shoppers to wishlist items to multiple wishlist</span>}
                                            checked={multiWishlist}
                                            onChange={() => handleInputChange(setMultiWishlist)(!multiWishlist)}
                                        />
                                    </Box>
                                    {/* Right: Description */}
                                    <Text as="span" color="subdued" style={{ fontSize: 14, lineHeight: '20px', whiteSpace: 'nowrap' }}>
                                        Shoppers can now organise items on multiple wishlists
                                    </Text>
                                </Box>
                                {/* Feature 2 */}
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    style={{
                                        background: '#fff',
                                        borderRadius: 8,
                                        border: '1px solid #e1e3e5',
                                        // marginBottom: 20,
                                        boxShadow: 'none',
                                        padding: 18,
                                        justifyContent: 'space-between',
                                        gap: 16,
                                    }}
                                >
                                    {/* Left: Checkbox and Main Label */}
                                    <Box display="flex" alignItems="center" style={{ gap: 12 }}>
                                        <Checkbox
                                            label={<span style={{ fontWeight: 'bold' }}>Allow shoppers to share their wishlists</span>}
                                            checked={shareWishlist}
                                            onChange={() => handleInputChange(setShareWishlist)(!shareWishlist)}
                                        />
                                    </Box>
                                    {/* Right: Description */}
                                    <Text as="span" color="subdued" style={{ fontSize: 14, lineHeight: '20px', whiteSpace: 'nowrap' }}>
                                        Shoppers can share their wishlist through email or social media
                                    </Text>
                                </Box>
                                {/* Feature 3: SmartSave */}
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    style={{
                                        background: '#fff',
                                        borderRadius: 8,
                                        border: '1px solid #e1e3e5',
                                        marginBottom: 0,
                                        boxShadow: 'none',
                                        padding: 18,
                                        justifyContent: 'space-between',
                                        gap: 16,
                                    }}
                                >
                                    {/* Left: Checkbox and Main Label */}
                                    <Box display="flex" alignItems="center" style={{ gap: 12 }}>
                                        <Checkbox
                                            label={<span style={{ fontWeight: 'bold' }}>SmartSave: Auto-save high-interest products to a shopper's wishlist</span>}
                                            checked={smartSave}
                                            onChange={() => handleInputChange(setSmartSave)(!smartSave)}
                                        />
                                    </Box>
                                    <br />
                                    {/* Right: Description with inline controls */}
                                    <Box display="flex" alignItems="center" style={{ gap: 8, flexWrap: 'nowrap', justifyContent: 'flex-end' }}>
                                        <span color="subdued" style={{ fontSize: 13, lineHeight: '25px' }}>
                                            Add a product to the wishlist if a shopper visits the product page    &nbsp; &nbsp; &nbsp;
                                        </span>

                                        <input
                                            type="number"
                                            value={smartSaveCount}
                                            min={1}
                                            onChange={e => handleInputChange(setSmartSaveCount)(Number(e.target.value))}
                                            style={{ width: 48, height: 32, borderRadius: 6, border: '1px solid #c4cdd5', padding: '2px 6px', fontSize: 15, textAlign: 'center', background: '#fff', margin: '0 4px', verticalAlign: 'middle' }}
                                            disabled={!smartSave}
                                        />
                                        <br />
                                        <br />
                                        <span color="subdued" style={{ fontSize: 13, lineHeight: '25px' }}>
                                            times. Display a notification in the
                                        </span>
                                        <select
                                            value={smartSavePosition}
                                            onChange={e => handleInputChange(setSmartSavePosition)(e.target.value)}
                                            style={{
                                                width: 110,
                                                height: 32,
                                                borderRadius: 6,
                                                border: '1px solid #c4cdd5',
                                                padding: '2px 8px',
                                                fontSize: 15,
                                                background: '#fff',
                                                margin: '0 4px',
                                                verticalAlign: 'middle',
                                                display: 'inline-block'
                                            }}
                                            disabled={!smartSave}
                                        >
                                            {positionOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        <br />
                                        <br />
                                        <span color="subdued" style={{ fontSize: 13, lineHeight: '20px', marginLeft: 4 }}>
                                            position on the site, with an undo option.
                                        </span>

                                    </Box>
                                </Box>
                            </Box>
                        </Card>
                    </Box>
                </Box>
                {/* Responsive styles */}
                <style>{`
                @media (max-width: 900px) {
                    .settings-flex-root {
                        flex-direction: column !important;
                        gap: 0 !important;
                    }
                }
            `}</style>
                {/* New Events & Triggers Settings Card Below Existing Box */}
                <Box style={{marginTop: 16, marginBottom: 16}}><Divider /></Box>
                <Box style={{ display: isMobile ? 'block' : 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'flex-start', justifyContent: 'flex-start', gap: isMobile ? 0 : 48, maxWidth: isMobile ? '100%' : 1200, margin: isMobile ? '0' : '0 auto', width: '100%', marginTop: 20, marginBottom: 20, padding: isMobile ? '0 8px' : undefined }}>
                    {/* Sidebar Section */}
                    <Box style={{ minWidth: isMobile ? 'unset' : 260, maxWidth: isMobile ? 'unset' : 320, flex: isMobile ? 'unset' : '0 0 320px', marginBottom: isMobile ? 24 : 0, width: '100%' }}>
                        <Text variant="headingSm" as="h3" fontWeight="bold" style={{ marginBottom: 8 }}>
                            Events & Triggers Settings
                        </Text>
                        <Text variant="bodyMd" as="p" color="subdued" style={{ fontSize: 14, marginBottom: 8 }}>
                            Set up personalized alerts for shoppers based on their wishlisted items.
                        </Text>
                        <Box paddingBlockStart="200">
                            <a href="#" style={{ color: '#005bd3', textDecoration: 'underline', fontSize: 14 }}>Learn More</a>
                        </Box>
                    </Box>
                    {/* Main Content Section */}
                    <Box style={{ flex: 1, minWidth: isMobile ? 'unset' : 340, maxWidth: isMobile ? 'unset' : 600, width: '100%' }}>
                        <Card sectioned style={{ borderRadius: 16, boxShadow: '0 1px 4px rgba(23,24,24,0.04)', border: '1px solid #e1e3e5', background: '#fff', padding: isMobile ? 12 : 24, width: '100%' }}>
                            <Text variant="headingSm" as="h3" fontWeight="bold" style={{ marginBottom: 20 }}>
                                Acknowledgements
                            </Text>
                            {/* Field 1 */}
                            <Box className="ack-field" style={{ background: '#fff', borderRadius: 8, border: '1px solid #e1e3e5', boxShadow: 'none', padding: 18, display: isMobile ? 'block' : 'flex', alignItems: isMobile ? 'stretch' : 'flex-start', gap: isMobile ? 8 : 12, marginTop: 15 }}>
                                <Checkbox label="" checked={ackSignUp} onChange={() => handleInputChange(setAckSignUp)(!ackSignUp)} />
                                <Box>
                                    <Box display="flex" alignItems="center" style={{ gap: 8 ,marginBottom:10}}>
                                        <Text as="span" variant="headingXs" className="soft-title">Sign up confirmation</Text>
                                        <span style={{ background: '#f4f6f8', color: '#212b36', borderRadius: 6, padding: '2px 8px', fontSize: 13, marginRight: 4 }}>Email</span>
                                        <span style={{ background: '#d0e6fd', color: '#2563eb', borderRadius: 6, padding: '2px 8px', fontSize: 13, fontWeight: 500 }}>Upgrade to Starter</span>
                                    </Box>
                                    <Text as="span" color="subdued" style={{ fontSize: 14 }}>
                                        Send a confirmation when shoppers save their wishlist.
                                    </Text>
                                </Box>
                            </Box>
                            {/* Field 2 */}
                            <Box className="ack-field" style={{ background: '#fff', borderRadius: 8, border: '1px solid #e1e3e5', boxShadow: 'none', padding: 18, display: isMobile ? 'block' : 'flex', alignItems: isMobile ? 'stretch' : 'flex-start', gap: isMobile ? 8 : 12 }}>
                                <Checkbox label="" checked={ackItemAdded} onChange={() => handleInputChange(setAckItemAdded)(!ackItemAdded)} />
                                <Box>
                                    <Box display="flex" alignItems="center" style={{ gap: 8,marginBottom:10 }}>
                                        <Text as="span" variant="headingXs" className="soft-title">Item added to wishlist</Text>
                                        <span style={{ background: '#f4f6f8', color: '#212b36', borderRadius: 6, padding: '2px 8px', fontSize: 13, marginRight: 4 }}>Email</span>
                                        <span style={{ background: '#f4f6f8', color: '#212b36', borderRadius: 6, padding: '2px 8px', fontSize: 13, marginRight: 4 }}>SMS</span>
                                        <span style={{ background: '#d0e6fd', color: '#2563eb', borderRadius: 6, padding: '2px 8px', fontSize: 13, fontWeight: 500 }}>Upgrade to Starter</span>
                                    </Box>
                                    <Text as="span" color="subdued" style={{ fontSize: 14 }}>
                                        Send an alert when shoppers add items to their wishlist.
                                    </Text>
                                </Box>
                            </Box>
                            {/* Field 3 */}
                            <Box className="ack-field" style={{ background: '#fff', borderRadius: 8, border: '1px solid #e1e3e5', marginBottom: 10, boxShadow: 'none', padding: 18, display: isMobile ? 'block' : 'flex', alignItems: isMobile ? 'stretch' : 'flex-start', gap: isMobile ? 8 : 12 }}>
                                <Checkbox label="" checked={ackShared} onChange={() => handleInputChange(setAckShared)(!ackShared)} />
                                <Box>
                                    <Box display="flex" alignItems="center" style={{ gap: 8,marginBottom:10 }}>
                                        <Text as="span" variant="headingXs" className="soft-title">Wishlist Shared</Text>
                                        <span style={{ background: '#f4f6f8', color: '#212b36', borderRadius: 6, padding: '2px 8px', fontSize: 13, marginRight: 4 }}>Email</span>
                                        <span style={{ background: '#d0e6fd', color: '#2563eb', borderRadius: 6, padding: '2px 8px', fontSize: 13, fontWeight: 500 }}>Upgrade to Starter</span>
                                    </Box>
                                    <Text as="span" color="subdued" style={{ fontSize: 14 }}>
                                        Send an alert when shoppers share their wishlist with others.
                                    </Text>
                                </Box>
                            </Box>
                            <Divider />
                            <Box style={{ marginTop: 10 }}>

                                <Text variant="headingSm" as="h3" fontWeight="bold" style={{ marginBottom: 16 }}>
                                    Reminders
                                </Text>
                            </Box>
                            {/* Reminder 1 */}
                            <Box className="ack-field" style={{ background: '#fff', borderRadius: 8, border: '1px solid #e1e3e5', boxShadow: 'none', padding: 18, display: isMobile ? 'block' : 'flex', alignItems: isMobile ? 'stretch' : 'flex-start', gap: isMobile ? 8 : 12, marginTop: 10 }}>
                                <Checkbox label="" checked={remWishlist} onChange={() => handleInputChange(setRemWishlist)(!remWishlist)} />
                                <Box style={{ width: isMobile ? '100%' : undefined }}>
                                    <Box display="flex" alignItems="center" style={{ gap: 8,marginBottom:10 }}>
                                        <Text as="span" variant="headingXs" className="soft-title">Wishlist Reminder</Text>
                                        <span style={{ background: '#f4f6f8', color: '#212b36', borderRadius: 6, padding: '2px 8px', fontSize: 13, marginRight: 4 }}>Email</span>
                                        <span style={{ background: '#f4f6f8', color: '#212b36', borderRadius: 6, padding: '2px 8px', fontSize: 13, marginRight: 4 }}>SMS</span>
                                        <span style={{ background: '#d0e6fd', color: '#2563eb', borderRadius: 6, padding: '2px 8px', fontSize: 13, fontWeight: 500 }}>Upgrade to Starter</span>
                                    </Box>
                                    <Grid>
                                        <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>
                                            <Box>
                                                <Text as="span" color="subdued" style={{ fontSize: 14 }}>
                                                    Send reminders for wishlisted items after
                                                </Text>
                                            </Box>
                                        </Grid.Cell>
                                        <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>
                                            <Box display="flex" alignItems="center" style={{ gap: 8, flexWrap: 'wrap' }}>
                                                <input
                                                    type="number"
                                                    value={remWishlistHours}
                                                    min={0}
                                                    onChange={e => handleInputChange(setRemWishlistHours)(Number(e.target.value))}
                                                    style={{ width: isMobile ? '100%' : '120px', borderRadius: 6, border: '1px solid #e1e3e5', padding: '6px 12px', fontSize: 15, textAlign: 'center', background: '#f4f6f8', margin: '0 4px' }}
                                                    disabled={!remWishlist}
                                                />
                                                <select
                                                    value={remWishlistUnit}
                                                    onChange={e => handleInputChange(setRemWishlistUnit)(e.target.value)}
                                                    style={{ width: isMobile ? '100%' : '90px', borderRadius: 6, border: '1px solid #e1e3e5', padding: '6px 12px', fontSize: 15, background: '#f4f6f8' }}
                                                    disabled={!remWishlist}
                                                >
                                                    <option value="minutes">minutes</option>
                                                    <option value="hours">hours</option>
                                                    <option value="days">days</option>
                                                    <option value="months">months</option>
                                                </select>
                                            </Box>
                                        </Grid.Cell>
                                    </Grid>
                                </Box>
                            </Box>
                            {/* Reminder 2 */}
                            <Box className="ack-field" style={{ background: '#fff', borderRadius: 8, border: '1px solid #e1e3e5', boxShadow: 'none', padding: 18, display: isMobile ? 'block' : 'flex', alignItems: isMobile ? 'stretch' : 'flex-start', gap: isMobile ? 8 : 12, marginBottom: 0 }}>
                                <Checkbox label="" checked={remSaved} onChange={() => handleInputChange(setRemSaved)(!remSaved)} />
                                <Box style={{ width: isMobile ? '100%' : undefined }}>
                                    <Box display="flex" alignItems="center" style={{ gap: 8 , marginBottom:10}}>
                                        <Text as="span" variant="headingXs" className="soft-title">Send reminders on Items Saved for Later</Text>
                                        <span style={{ background: '#f4f6f8', color: '#212b36', borderRadius: 6, padding: '2px 8px', fontSize: 13, marginRight: 4 }}>Email</span>
                                        <span style={{ background: '#f4f6f8', color: '#212b36', borderRadius: 6, padding: '2px 8px', fontSize: 13, marginRight: 4 }}>SMS</span>
                                        <span style={{ background: '#d0e6fd', color: '#2563eb', borderRadius: 6, padding: '2px 8px', fontSize: 13, fontWeight: 500 }}>Upgrade to Starter</span>
                                    </Box>
                                    <Grid>
                                        <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>
                                            <Box>
                                                <Text as="span" color="subdued" style={{ fontSize: 14 }}>
                                                    Send reminders for items saved for later after
                                                </Text>
                                            </Box>
                                        </Grid.Cell>
                                        <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>
                                            <Box display="flex" alignItems="center" style={{ gap: 8, flexWrap: 'wrap' }}>
                                                <input
                                                    type="number"
                                                    value={remSavedHours}
                                                    min={0}
                                                    onChange={e => handleInputChange(setRemSavedHours)(Number(e.target.value))}
                                                    style={{ width: isMobile ? '100%' : '120px', borderRadius: 6, border: '1px solid #e1e3e5', padding: '6px 12px', fontSize: 15, textAlign: 'center', background: '#f4f6f8', margin: '0 4px' }}
                                                    disabled={!remSaved}
                                                />
                                                <select
                                                    value={remSavedUnit}
                                                    onChange={e => handleInputChange(setRemSavedUnit)(e.target.value)}
                                                    style={{ width: isMobile ? '100%' : '90px', borderRadius: 6, border: '1px solid #e1e3e5', padding: '6px 12px', fontSize: 15, background: '#f4f6f8' }}
                                                    disabled={!remSaved}
                                                >
                                                    <option value="minutes">minutes</option>
                                                    <option value="hours">hours</option>
                                                    <option value="days">days</option>
                                                    <option value="months">months</option>
                                                </select>
                                            </Box>
                                        </Grid.Cell>
                                    </Grid>
                                </Box>
                            </Box>
                            {/* End of Reminders Section */}
                            <Box style={{ marginTop: 10 }}>
                                <Divider />
                            </Box>
                            <Box style={{ marginTop: 10 }}>
                                <Text variant="headingSm" as="h3" fontWeight="bold" style={{ marginBottom: 16, marginTop: 32 }}>
                                    Alerts & Triggers on wishlisted items
                                </Text>
                            </Box>

                            {/* Alert 1: Low stock */}
                            <Box className="ack-field" style={{ background: '#fff', borderRadius: 8, border: '1px solid #e1e3e5', boxShadow: 'none', padding: 18, display: isMobile ? 'block' : 'flex', alignItems: isMobile ? 'stretch' : 'flex-start', gap: isMobile ? 8 : 12, marginTop: 10 }}>
                                <Checkbox label="" checked={alertLowStock} onChange={() => handleInputChange(setAlertLowStock)(!alertLowStock)} />
                                <Box style={{ width: isMobile ? '100%' : undefined }}>
                                    <Box display="flex" alignItems="center" style={{ gap: 8, marginBottom:10}}>
                                        <Text as="span" variant="headingXs" className="soft-title">Send low stock Alerts</Text>
                                        <span style={{ background: '#f4f6f8', color: '#212b36', borderRadius: 6, padding: '2px 8px', fontSize: 13, marginRight: 4 }}>Email</span>
                                        <span style={{ background: '#f4f6f8', color: '#212b36', borderRadius: 6, padding: '2px 8px', fontSize: 13, marginRight: 4 }}>SMS</span>
                                        <span style={{ background: '#d0e6fd', color: '#2563eb', borderRadius: 6, padding: '2px 8px', fontSize: 13, fontWeight: 500 }}>Upgrade to Starter</span>
                                    </Box>
                                    <Grid>
                                        <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>
                                            <Box>
                                                <Text as="span" color="subdued" style={{ fontSize: 14 }}>
                                                    Send an alert when the stock drops below
                                                </Text>
                                            </Box>
                                        </Grid.Cell>
                                        <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>
                                            <Box display="flex" alignItems="center" style={{ gap: 8, flexWrap: 'wrap' }}>
                                                <input
                                                    type="number"
                                                    value={alertLowStockValue}
                                                    min={0}
                                                    onChange={e => handleInputChange(setAlertLowStockValue)(Number(e.target.value))}
                                                    style={{ width: isMobile ? '100%' : '120px', borderRadius: 6, border: '1px solid #e1e3e5', padding: '6px 12px', fontSize: 15, textAlign: 'center', background: '#f4f6f8', margin: '0 4px' }}
                                                    disabled={!alertLowStock}
                                                />
                                                <Text as="span" color="subdued" style={{ fontSize: 14 }}>
                                                    units
                                                </Text>
                                            </Box>
                                        </Grid.Cell>
                                    </Grid>
                                </Box>
                            </Box>
                            {/* Alert 2: Price Drop */}
                            <Box className="ack-field" style={{ background: '#fff', borderRadius: 8, border: '1px solid #e1e3e5', boxShadow: 'none', padding: 18, display: isMobile ? 'block' : 'flex', alignItems: isMobile ? 'stretch' : 'flex-start', gap: isMobile ? 8 : 12 }}>
                                <Checkbox label="" checked={alertPriceDrop} onChange={() => handleInputChange(setAlertPriceDrop)(!alertPriceDrop)} />
                                <Box style={{ width: isMobile ? '100%' : undefined }}>
                                    <Box display="flex" alignItems="center" style={{ gap: 8,marginBottom:10 }}>
                                        <Text as="span" variant="headingXs" className="soft-title">Send Price Drop alert</Text>
                                        <span style={{ background: '#f4f6f8', color: '#212b36', borderRadius: 6, padding: '2px 8px', fontSize: 13, marginRight: 4 }}>Email</span>
                                        <span style={{ background: '#f4f6f8', color: '#212b36', borderRadius: 6, padding: '2px 8px', fontSize: 13, marginRight: 4 }}>SMS</span>
                                        <span style={{ background: '#d0e6fd', color: '#2563eb', borderRadius: 6, padding: '2px 8px', fontSize: 13, fontWeight: 500 }}>Upgrade to Starter</span>
                                    </Box>
                                    <Grid>
                                        <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>
                                            <Box>
                                                <Text as="span" color="subdued" style={{ fontSize: 14 }}>
                                                    Send an alert when the price drops by
                                                </Text>
                                            </Box>
                                        </Grid.Cell>
                                        <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>
                                            <Box display="flex" alignItems="center" style={{ gap: 8, flexWrap: 'wrap' }}>
                                                <input
                                                    type="number"
                                                    value={alertPriceDropValue}
                                                    min={0}
                                                    onChange={e => handleInputChange(setAlertPriceDropValue)(Number(e.target.value))}
                                                    style={{ width: isMobile ? '100%' : '120px', borderRadius: 6, border: '1px solid #e1e3e5', padding: '6px 12px', fontSize: 15, textAlign: 'center', background: '#f4f6f8', margin: '0 4px' }}
                                                    disabled={!alertPriceDrop}
                                                />
                                                <Text as="span" color="subdued" style={{ fontSize: 14 }}>
                                                    %
                                                </Text>
                                            </Box>
                                        </Grid.Cell>
                                    </Grid>
                                </Box>
                            </Box>
                            {/* Alert 3: Back in stock */}
                            <Box className="ack-field" style={{ background: '#fff', borderRadius: 8, border: '1px solid #e1e3e5', boxShadow: 'none', padding: 18, display: isMobile ? 'block' : 'flex', alignItems: isMobile ? 'stretch' : 'flex-start', gap: isMobile ? 8 : 12, marginBottom: 0 }}>
                                <Checkbox label="" checked={alertBackInStock} onChange={() => handleInputChange(setAlertBackInStock)(!alertBackInStock)} />
                                <Box style={{ width: isMobile ? '100%' : undefined }}>
                                    <Box display="flex" alignItems="center" style={{ gap: 8 ,marginBottom:10}}>
                                        <Text as="span" variant="headingXs" className="soft-title">Send Back in stock alerts</Text>
                                        <span style={{ background: '#f4f6f8', color: '#212b36', borderRadius: 6, padding: '2px 8px', fontSize: 13, marginRight: 4 }}>Email</span>
                                        <span style={{ background: '#f4f6f8', color: '#212b36', borderRadius: 6, padding: '2px 8px', fontSize: 13, marginRight: 4 }}>SMS</span>
                                        <span style={{ background: '#d0e6fd', color: '#2563eb', borderRadius: 6, padding: '2px 8px', fontSize: 13, fontWeight: 500 }}>Upgrade to Starter</span>
                                    </Box>
                                    <Text as="span" color="subdued" style={{ fontSize: 14 }}>
                                        Send an alert when wishlisted items are back in stock
                                    </Text>
                                </Box>
                            </Box>
                        </Card>
                    </Box>
                </Box>
            </Page>
            </>
    );
}
