import React, { useState, useEffect, useContext } from "react";
import { Popover, RadioButton, LegacyStack, Icon, Checkbox, TextField, Box, Divider, Frame, Card,ContextualSaveBar, Spinner, Icon as PolarisIcon, Page } from "@shopify/polaris";
import { HeartIcon, StarIcon, BillFilledIcon, BookOpenIcon, ArrowLeftIcon, InfoIcon } from "@shopify/polaris-icons";
import { HexColorPicker } from "react-colorful";
import MockPreview from "./MockPreview";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { AppContext } from "../components";
import { useSearchParams, useNavigate } from 'react-router-dom';

const NAV_TABS = [
  { label: "Basics", key: "basics" },
  { label: "Product Page", key: "product" },
  { label: "Collections", key: "collections" },
  { label: "Wishlist Page", key: "wishlist" },
  { label: "Cart", key: "cart" },
];

const ICONS = [
  { label: "Heart", icon: HeartIcon },
  { label: "Star", icon: StarIcon },
  { label: "Bookmark", icon: BillFilledIcon },
];

function ColorPopover({ color, setColor, active, setActive }) {
  const [hex, setHex] = useState(color);
  return (
    <Popover
      active={active}
      activator={
        <div
          style={{ position: 'relative', width: 170 }}
          onClick={() => setActive(!active)}
        >
          <div style={{
            display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #d6d6d6', borderRadius: 6, height: 40, padding: '0 12px', cursor: 'pointer',
          }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: color, border: '1px solid #ccc', display: 'inline-block', marginRight: 8 }} />
            <span style={{ fontFamily: 'monospace', fontSize: 15 }}>{color}</span>
            <span style={{ marginLeft: 'auto', color: '#888' }}>▼</span>
          </div>
        </div>
      }
      onClose={() => setActive(false)}
    >
      <div style={{ width: 220, padding: 12 }}>
        <HexColorPicker color={color} onChange={c => { setColor(c); setHex(c); }} style={{ width: '100%', height: 140, marginBottom: 10 }} />
        <input
          type="text"
          value={hex}
          onChange={e => {
            setHex(e.target.value);
            if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) setColor(e.target.value);
          }}
          maxLength={7}
          style={{ width: '100%', fontSize: 16, border: '1px solid #e3e3e3', borderRadius: 6, padding: 8, textAlign: 'center', fontFamily: 'monospace' }}
        />
      </div>
    </Popover>
  );
}

export default function ManageConfiguration() {
  const navigate = useNavigate();
  const { apiUrl } = useContext(AppContext);
  const appBridge = useAppBridge();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'basics';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#ffffff");
  const [primaryPopoverActive, setPrimaryPopoverActive] = useState(false);
  const [secondaryPopoverActive, setSecondaryPopoverActive] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState("Heart");

  // Product Page tab state
  const [buttonType, setButtonType] = useState("icon-text");
  const [buttonStyle, setButtonStyle] = useState("solid");
  const [buttonTextTab, setButtonTextTab] = useState("before");
  const [buttonLabel, setButtonLabel] = useState("");
  const [smartSave, setSmartSave] = useState(true);
  const [socialProof, setSocialProof] = useState(false);
  const [buttonPositionNear, setButtonPositionNear] = useState("below");
  const [buttonPositionImage, setButtonPositionImage] = useState("top-left");

  // Add state for before/after button text
  const [buttonLabelBefore, setButtonLabelBefore] = useState("");
  const [buttonLabelAfter, setButtonLabelAfter] = useState("");

  // Collections tab state
  const [collectionsEnabled, setCollectionsEnabled] = useState(true);
  const [collectionsButtonPosition, setCollectionsButtonPosition] = useState('top-left');

  // Wishlist Page tab state
  const [wishlistType, setWishlistType] = useState('page');
  const [wishlistPageTitle, setWishlistPageTitle] = useState('My Wishlist');
  const [wishlistLaunchFrom, setWishlistLaunchFrom] = useState('header');
  const [wishlistShareEnabled, setWishlistShareEnabled] = useState(true);

  // Cart tab: Save for later pop-up settings
  const [saveForLaterEnabled, setSaveForLaterEnabled] = useState(true);
  const [saveForLaterTitle, setSaveForLaterTitle] = useState('Do you want to save this product for later?');
  const [saveForLaterPrimary, setSaveForLaterPrimary] = useState('Save For later');
  const [saveForLaterSecondary, setSaveForLaterSecondary] = useState('No, thanks!');
  const [saveForLaterPermission, setSaveForLaterPermission] = useState('always');

  // Add state for floating button options
  const [floatingButtonPosition, setFloatingButtonPosition] = useState('left');
  const [showCount, setShowCount] = useState(true);

  const [activeButtonPositionTab, setActiveButtonPositionTab] = useState("near");

  const fetch = useAuthenticatedFetch();
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedState, setLastSavedState] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch config and set all state and lastSavedState on mount
  useEffect(() => {
    async function fetchConfig() {
      try {
        const token = await getSessionToken(appBridge);
        // console.log(token)
        if (!token) return;
        const res = await fetch(`${apiUrl}wishlist-configuration`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data && data.data) {
          const config = data.data;
          setPrimaryColor(config.primary_color || "#000000");
          setSecondaryColor(config.secondary_color || "#ffffff");
          setSelectedIcon((config.icon_type || "heart").charAt(0).toUpperCase() + (config.icon_type || "heart").slice(1));
          setButtonType(config.btn_type_product_page === 'icon_and_text' ? 'icon-text' : config.btn_type_product_page === 'only_icon' ? 'icon' : 'text');
          setButtonStyle(config.appearance_btn_product_page || 'solid');
          setButtonTextTab(config.btn_text_product_page_toggle === 'after_click' ? 'after' : 'before');
          setButtonLabel(config.btn_text_product_page || "");
          setButtonLabelBefore(config.btn_text_product_page_before || "");
          setButtonLabelAfter(config.btn_text_product_page_after || "");
          setSmartSave(!!config.smart_save);
          setSocialProof(!!config.social_proof);
          setButtonPositionNear(
            config.btn_position_on_product_page === 'above_cart' ? 'above' :
              config.btn_position_on_product_page === 'below_cart' ? 'below' :
                config.btn_position_on_product_page === 'left_of_cart' ? 'left' :
                  config.btn_position_on_product_page === 'right_of_cart' ? 'right' : 'below'
          );
          setButtonPositionImage(
            config.btn_position_on_product_image === 'top_left' ? 'top-left' :
              config.btn_position_on_product_image === 'top_right' ? 'top-right' :
                config.btn_position_on_product_image === 'bottom_left' ? 'bottom-left' :
                  config.btn_position_on_product_image === 'bottom_right' ? 'bottom-right' : 'top-left'
          );
          setCollectionsEnabled(!!config.add_items_wishlist_collections_page);
          setCollectionsButtonPosition((config.btn_group_position_collections_page || 'top_left').replace('_', '-'));
          setWishlistType(config.wishlist_page_appearance === 'side_drawer' ? 'drawer' : config.wishlist_page_appearance === 'pop_up_modal' ? 'modal' : 'page');
          setWishlistPageTitle(config.wishlist_page_title || 'My Wishlist');
          setWishlistLaunchFrom(config.wishlist_btn_launch_position === 'floating_button' ? 'floating' : config.wishlist_btn_launch_position === 'navigation_menu' ? 'menu' : 'header');
          setWishlistShareEnabled(!!config.other_settings_wishlist_page);
          setSaveForLaterEnabled(!!config.permission_to_save_items_cart_page);
          setSaveForLaterTitle(config.pop_up_title_cart_page || 'Do you want to save this product for later?');
          setSaveForLaterPrimary(config.primary_btn_text_cart_page || 'Save For later');
          setSaveForLaterSecondary(config.secondary_btn_text_cart_page || 'No, thanks!');
          setSaveForLaterPermission(config.permission_cart_page || 'always');
          setFloatingButtonPosition(config.floating_btn_position || 'left');
          setShowCount(!!config.show_count_floating_btn);
          setLastSavedState({
            primaryColor: config.primary_color || "#000000",
            secondaryColor: config.secondary_color || "#ffffff",
            selectedIcon: (config.icon_type || "heart").charAt(0).toUpperCase() + (config.icon_type || "heart").slice(1),
            buttonType: config.btn_type_product_page === 'icon_and_text' ? 'icon-text' : config.btn_type_product_page === 'only_icon' ? 'icon' : 'text',
            buttonStyle: config.appearance_btn_product_page || 'solid',
            buttonTextTab: config.btn_text_product_page_toggle === 'after_click' ? 'after' : 'before',
            buttonLabel: config.btn_text_product_page || "",
            buttonLabelBefore: config.btn_text_product_page_before || "",
            buttonLabelAfter: config.btn_text_product_page_after || "",
            smartSave: !!config.smart_save,
            socialProof: !!config.social_proof,
            buttonPositionNear: config.btn_position_on_product_page === 'above_cart' ? 'above' :
              config.btn_position_on_product_page === 'below_cart' ? 'below' :
                config.btn_position_on_product_page === 'left_of_cart' ? 'left' :
                  config.btn_position_on_product_page === 'right_of_cart' ? 'right' : 'below',
            buttonPositionImage: config.btn_position_on_product_image === 'top_left' ? 'top-left' :
              config.btn_position_on_product_image === 'top_right' ? 'top-right' :
                config.btn_position_on_product_image === 'bottom_left' ? 'bottom-left' :
                  config.btn_position_on_product_image === 'bottom_right' ? 'bottom-right' : 'top-left',
            collectionsEnabled: !!config.add_items_wishlist_collections_page,
            collectionsButtonPosition: (config.btn_group_position_collections_page || 'top_left').replace('_', '-'),
            wishlistType: config.wishlist_page_appearance === 'side_drawer' ? 'drawer' : config.wishlist_page_appearance === 'pop_up_modal' ? 'modal' : 'page',
            wishlistPageTitle: config.wishlist_page_title || 'My Wishlist',
            wishlistLaunchFrom: config.wishlist_btn_launch_position === 'floating_button' ? 'floating' : config.wishlist_btn_launch_position === 'navigation_menu' ? 'menu' : 'header',
            wishlistShareEnabled: !!config.other_settings_wishlist_page,
            saveForLaterEnabled: !!config.permission_to_save_items_cart_page,
            saveForLaterTitle: config.pop_up_title_cart_page || 'Do you want to save this product for later?',
            saveForLaterPrimary: config.primary_btn_text_cart_page || 'Save For later',
            saveForLaterSecondary: config.secondary_btn_text_cart_page || 'No, thanks!',
            saveForLaterPermission: config.permission_cart_page || 'always',
            floatingButtonPosition: config.floating_btn_position || 'left',
            showCount: !!config.show_count_floating_btn,
          });
        }
      } catch (e) { /* ignore */ }
      setLoading(false); // <-- add this here
    }
    fetchConfig();
    // eslint-disable-next-line
  }, []);

  // Helper to map frontend state to API payload
  const buildPayload = () => ({
    primary_color: primaryColor,
    secondary_color: secondaryColor,
    icon_type: selectedIcon.toLowerCase(),
    btn_position_on_product_page: buttonPositionNear === 'above' ? 'above_cart' :
      buttonPositionNear === 'below' ? 'below_cart' :
        buttonPositionNear === 'left' ? 'left_of_cart' :
          buttonPositionNear === 'right' ? 'right_of_cart' : null,
    btn_position_on_product_image: buttonPositionImage === 'top-left' ? 'top_left' :
      buttonPositionImage === 'top-right' ? 'top_right' :
        buttonPositionImage === 'bottom-left' ? 'bottom_left' :
          buttonPositionImage === 'bottom-right' ? 'bottom_right' : null,
    btn_type_product_page: buttonType === 'icon-text' ? 'icon_and_text' : buttonType === 'icon' ? 'only_icon' : 'only_text',
    appearance_btn_product_page: buttonStyle,
    btn_text_product_page_toggle: buttonTextTab === 'before' ? 'before_click' : 'after_click',
    btn_text_product_page: buttonLabel,
    btn_text_product_page_before: buttonLabelBefore,
    btn_text_product_page_after: buttonLabelAfter,
    smart_save: smartSave,
    social_proof: socialProof,
    add_items_wishlist_collections_page: collectionsEnabled,
    btn_group_position_collections_page: collectionsButtonPosition.replace('-', '_'),
    wishlist_page_appearance: wishlistType === 'drawer' ? 'side_drawer' : wishlistType === 'page' ? 'separate_page' : 'pop_up_modal',
    wishlist_page_title: wishlistPageTitle,
    wishlist_btn_launch_position: wishlistLaunchFrom === 'header' ? 'header' : wishlistLaunchFrom === 'floating' ? 'floating_button' : 'navigation_menu',
    other_settings_wishlist_page: wishlistShareEnabled,
    permission_to_save_items_cart_page: saveForLaterEnabled,
    pop_up_title_cart_page: saveForLaterTitle,
    primary_btn_text_cart_page: saveForLaterPrimary,
    secondary_btn_text_cart_page: saveForLaterSecondary,
    permission_cart_page: saveForLaterPermission,
    show_count_floating_btn: showCount,
    floating_btn_position: floatingButtonPosition,
    // shop: shop, // REMOVE THIS LINE
  });

  // Helper to reset all fields to last saved state
  const resetToLastSaved = () => {
    setHasUnsavedChanges(false); // Hide the save bar immediately
    if (!lastSavedState || Object.keys(lastSavedState).length === 0) return;
    setPrimaryColor(lastSavedState.primaryColor);
    setSecondaryColor(lastSavedState.secondaryColor);
    setSelectedIcon(lastSavedState.selectedIcon);
    setButtonType(lastSavedState.buttonType);
    setButtonStyle(lastSavedState.buttonStyle);
    setButtonTextTab(lastSavedState.buttonTextTab);
    setButtonLabel(lastSavedState.buttonLabel);
    setButtonLabelBefore(lastSavedState.buttonLabelBefore);
    setButtonLabelAfter(lastSavedState.buttonLabelAfter);
    setSmartSave(lastSavedState.smartSave);
    setSocialProof(lastSavedState.socialProof);
    setButtonPositionNear(lastSavedState.buttonPositionNear);
    setButtonPositionImage(lastSavedState.buttonPositionImage);
    setCollectionsEnabled(lastSavedState.collectionsEnabled);
    setCollectionsButtonPosition(lastSavedState.collectionsButtonPosition);
    setWishlistType(lastSavedState.wishlistType);
    setWishlistPageTitle(lastSavedState.wishlistPageTitle);
    setWishlistLaunchFrom(lastSavedState.wishlistLaunchFrom);
    setWishlistShareEnabled(lastSavedState.wishlistShareEnabled);
    setSaveForLaterEnabled(lastSavedState.saveForLaterEnabled);
    setSaveForLaterTitle(lastSavedState.saveForLaterTitle);
    setSaveForLaterPrimary(lastSavedState.saveForLaterPrimary);
    setSaveForLaterSecondary(lastSavedState.saveForLaterSecondary);
    setSaveForLaterPermission(lastSavedState.saveForLaterPermission);
    setFloatingButtonPosition(lastSavedState.floatingButtonPosition);
    setShowCount(lastSavedState.showCount);
  };

  // Save handler
  const handleSave = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      const token = await getSessionToken(appBridge);
      const payload = buildPayload();
      const res = await fetch(`${apiUrl}wishlist-configuration`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSaveMessage("Saved successfully!");
        setLastSavedState({
          primaryColor,
          secondaryColor,
          selectedIcon,
          buttonType,
          buttonStyle,
          buttonTextTab,
          buttonLabel,
          buttonLabelBefore,
          buttonLabelAfter,
          smartSave,
          socialProof,
          buttonPositionNear,
          buttonPositionImage,
          collectionsEnabled,
          collectionsButtonPosition,
          wishlistType,
          wishlistPageTitle,
          wishlistLaunchFrom,
          wishlistShareEnabled,
          saveForLaterEnabled,
          saveForLaterTitle,
          saveForLaterPrimary,
          saveForLaterSecondary,
          saveForLaterPermission,
          floatingButtonPosition,
          showCount,
        });
        setHasUnsavedChanges(false);
      } else {
        setSaveMessage(data.message || "Save failed.");
      }
    } catch (e) {
      setSaveMessage("Save failed. Network or server error.");
    }
    setSaving(false);
  };

  // Set hasUnsavedChanges to true on any field change
  function markUnsaved() {
    if (!hasUnsavedChanges) setHasUnsavedChanges(true);
  }

  // Add a goBack handler (replace with your navigation logic if needed)
  const goBack = () => {
    navigate('/Features')
  };

  return (
    <Frame
    >
      {/* Top Bar */}
      {/* Show spinner or main content */}
      {loading ? (
        <div style={{
          width: '100%',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Spinner size="large" />
        </div>
      ) : (
        <>
          {hasUnsavedChanges && (
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
                  <span style={{ color: '#222' }}>Unsaved changes</span>
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
          )}
          {/* Top Navigation Bar */}
          {/* <Box style={{marginTop:10,
            border: '1px solid #DFE3E8',
            background:'#FFFFFF',
            marginTop:45
          }}> */}
          {/* <Card sectioned style={{ margin: '0 0 32px 0', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }} > */}
            {/* <div
              style={{
                display: 'flex',
                gap: 24,
                padding: '0',
                background: 'transparent',
                flexWrap: 'wrap',
                marginLeft:10,
                alignItems: 'center',
                minHeight: 60,
              }}
            > */}
              {/* Tabs Card */}
              <div
                style={{
                  display: 'flex',
                  // gap: 0,
                  padding: 0,
                  background: '#fff',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  minHeight: 60,
                  border: '1px solid #DFE3E8',
                  borderRadius:16,
                  margin: '32px 0 0 0', // Only top margin
                  width: '100%',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  
                }}
              >
                {NAV_TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      background: activeTab === tab.key ? '#fff' : 'none',
                      color: activeTab === tab.key ? '#222' : '#222',
                      fontWeight: activeTab === tab.key ? 600 : 400,
                      borderRadius: 8,
                      padding: '5px 12px',
                      fontSize: 14,
                      border: activeTab === tab.key ? 'none' : 'none',
                      boxShadow: activeTab === tab.key ? '0 2px 8px rgba(0,0,0,0.03)' : 'none',
                      outline: activeTab === tab.key ? '2px solid #e3e3e3' : 'none',
                      marginBottom: 8,
                      marginLeft:20
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            {/* </div> */}
          {/* </Card> */}
          {/* </Box> */}
          {/* Main Card */}
         
          <div
            style={{
              maxWidth: 1400,
              margin: '0 auto 0 auto',
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              background: '#F1F1F1',
              border: '1px solid #DFE3E8',
              borderTop: 'none',
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
              padding: 24,
              gap: 24,
              flexDirection: 'row',
              flexWrap: 'wrap',
              minWidth: 0,
            }}
          >
        
            <div
              style={{
                display: 'flex',
                width: '100%',
                background: '#fff',
                borderRadius: 18,
                boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
                padding: 24,
                gap: 24,
                flexDirection: 'row',
                flexWrap: 'wrap',
                minWidth: 0,
              }}
            >
              {/* Left Panel: Tab Content */}
              <div
                style={{
                  flex: 1,
                  minWidth: 320,
                  maxWidth: 600,
                  padding: '16px 24px 24px 24px',
                  minHeight: 0,
                  maxHeight: '500px',
                  overflowY: 'auto',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                {activeTab === "basics" && (
                  <>
                    {/* Colors Section */}
                    <Card>
                    <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 24 }}>Colors</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      {/* Primary Color */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 50 }}>
                        <span style={{ minWidth: 120, fontSize: 13 }}>Primary Color</span>
                        <ColorPopover color={primaryColor} setColor={c => { setPrimaryColor(c); markUnsaved(); }} active={primaryPopoverActive} setActive={setPrimaryPopoverActive} />
                      </div>
                      {/* Secondary Color */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 50 }}>
                        <span style={{ minWidth: 120, fontSize: 13 }}>Secondary Color</span>
                        <ColorPopover color={secondaryColor} setColor={c => { setSecondaryColor(c); markUnsaved(); }} active={secondaryPopoverActive} setActive={setSecondaryPopoverActive} />
                      </div>
                    </div></Card>
                    {/* Divider */}
                    <div style={{ borderBottom: '1px solid #e3e3e3', margin: '32px 0 24px 0' }} />
                    {/* Icons Section */}
                    <Card>
                    <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 18 }}>Icons</div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      {ICONS.map(({ label, icon }) => {
                        const isSelected = selectedIcon === label;
                        return (
                          <div
                            key={label}
                            onClick={() => { setSelectedIcon(label); markUnsaved(); }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              background: isSelected ? '#eaf6ff' : '#f7fbfd',
                              border: isSelected ? '2px solid #b6e0fe' : '1px solid #e3e3e3',
                              borderRadius: 16,
                              boxShadow: isSelected ? '0 2px 8px rgba(80,180,255,0.10)' : '0 1px 4px rgba(0,0,0,0.03)',
                              padding: '8px 18px 8px 12px',
                              cursor: 'pointer',
                              minWidth: 80,
                              transition: 'all 0.15s',
                              fontWeight: 500,
                            }}
                          >
                            <span style={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              border: isSelected ? '6px solid #222' : '2px solid #bbb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 8,
                              background: '#fff',
                              boxSizing: 'border-box',
                              transition: 'border 0.15s',
                            }} />

                            <span style={{ marginLeft: 6 }}>{label}</span>
                            <Icon source={icon} color="base" />
                          </div>
                        );
                      })}
                    </div>
                    </Card>
                  </>
                )}
                {activeTab === "product" && (
                  <>
                    {/* Button Position */}
                    <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                      <span style={{ fontWeight: 600, fontSize: 18, minWidth: 140 }}>Button Position</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button
                          style={{
                            background: activeButtonPositionTab === "near" ? '#f5f5f5' : 'none',
                            color: activeButtonPositionTab === "near" ? '#222' : '#888',
                            fontWeight: activeButtonPositionTab === "near" ? 600 : 500,
                            border: 'none',
                            borderRadius: 16,
                            padding: '6px 20px',
                            fontSize: 12,
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                          }}
                          onClick={() => setActiveButtonPositionTab("near")}
                        >
                          Near cart button
                        </button>
                        <button
                          style={{
                            background: activeButtonPositionTab === "image" ? '#f5f5f5' : 'none',
                            color: activeButtonPositionTab === "image" ? '#222' : '#888',
                            fontWeight: activeButtonPositionTab === "image" ? 600 : 500,
                            border: 'none',
                            borderRadius: 16,
                            padding: '6px 20px',
                            fontSize: 12,
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                          }}
                          onClick={() => setActiveButtonPositionTab("image")}
                        >
                          On product image
                        </button>
                      </div>
                    </div>
                    {activeButtonPositionTab === "near" && (
                      <div>
                        <Box style={{ display: 'flex', gap: 2 }}>
                          <RadioButton label="Above Cart Button" checked={buttonPositionNear === "above"} id="above" name="buttonPositionNear" onChange={() => { setButtonPositionNear("above"); markUnsaved(); }} />
                          <Box style={{ marginLeft: 10 }}>
                            <RadioButton label="Left of Cart Button" checked={buttonPositionNear === "left"} id="left" name="buttonPositionNear" onChange={() => { setButtonPositionNear("left"); markUnsaved(); }} />
                          </Box>
                        </Box>
                        <br />
                        <Box style={{ display: 'flex', gap: 2 }}>
                          <RadioButton label="Below Cart Button" checked={buttonPositionNear === "below"} id="below" name="buttonPositionNear" onChange={() => { setButtonPositionNear("below"); markUnsaved(); }} />
                          <Box style={{ marginLeft: 10 }}>
                            <RadioButton label="Right of Cart Button" checked={buttonPositionNear === "right"} id="right" name="buttonPositionNear" onChange={() => { setButtonPositionNear("right"); markUnsaved(); }} />
                          </Box>
                        </Box>
                      </div>
                    )}
                    {activeButtonPositionTab === "image" && (
                      <div>
                        <Box style={{ display: 'flex', gap: 2 }}>
                          <RadioButton label="Top Left" checked={buttonPositionImage === "top-left"} id="top-left" name="buttonPositionImage" onChange={() => { setButtonPositionImage("top-left"); markUnsaved(); }} />
                          <Box style={{ marginLeft: 10 }}>
                            <RadioButton label="Top Right" checked={buttonPositionImage === "top-right"} id="top-right" name="buttonPositionImage" onChange={() => { setButtonPositionImage("top-right"); markUnsaved(); }} />
                          </Box>
                        </Box>
                        <br />
                        <Box style={{ display: 'flex', gap: 2 }}>
                          <RadioButton label="Bottom Left" checked={buttonPositionImage === "bottom-left"} id="bottom-left" name="buttonPositionImage" onChange={() => { setButtonPositionImage("bottom-left"); markUnsaved(); }} />
                          <Box style={{ marginLeft: 10 }}>
                            <RadioButton label="Bottom Right" checked={buttonPositionImage === "bottom-right"} id="bottom-right" name="buttonPositionImage" onChange={() => { setButtonPositionImage("bottom-right"); markUnsaved(); }} />
                          </Box>
                        </Box>
                      </div>
                    )}
                    </Card>
                    <div style={{ borderBottom: '1px solid #e3e3e3', margin: '24px 0' }} />
                    {/* Button Type */}
                    <Card>
                    <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>Button Type</div>
                    <LegacyStack>
                      <RadioButton label="Icon and Text" checked={buttonType === "icon-text"} id="icon-text" name="buttonType" onChange={() => { setButtonType("icon-text"); markUnsaved(); }} />
                      <RadioButton label="Only Text" checked={buttonType === "text"} id="text" name="buttonType" onChange={() => { setButtonType("text"); markUnsaved(); }} />
                      <RadioButton label="Only Icon" checked={buttonType === "icon"} id="icon" name="buttonType" onChange={() => { setButtonType("icon"); markUnsaved(); }} />
                    </LegacyStack>
                    </Card>
                    <div style={{ borderBottom: '1px solid #e3e3e3', margin: '24px 0' }} />
                    {/* Appearance */}
                    <Card>
                    <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>Appearance</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 18 }}>
                      <span style={{ fontWeight: 600, fontSize: 16, minWidth: 120 }}>Button Style</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <RadioButton label="Solid" checked={buttonStyle === "solid"} id="solid" name="buttonStyle" onChange={() => { setButtonStyle("solid"); markUnsaved(); }} />
                        <RadioButton label="Outline" checked={buttonStyle === "outline"} id="outline" name="buttonStyle" onChange={() => { setButtonStyle("outline"); markUnsaved(); }} />
                        <RadioButton label="Plain" checked={buttonStyle === "plain"} id="plain" name="buttonStyle" onChange={() => { setButtonStyle("plain"); markUnsaved(); }} />
                      </div>
                    </div>
                    </Card>
                    <div style={{ borderBottom: '1px solid #e3e3e3', margin: '24px 0' }} />
                    {/* Button Text */}
                    <Card>
                    <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>Button Text</div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                      <button
                        style={{ background: buttonTextTab === "before" ? '#ececec' : 'none', border: 'none', borderRadius: 8, padding: '4px 16px', fontWeight: 400, cursor: 'pointer' }}
                        onClick={() => { setButtonTextTab("before"); markUnsaved(); }}
                      >
                        Before Click
                      </button>
                      <button
                        style={{ background: buttonTextTab === "after" ? '#ececec' : 'none', border: 'none', borderRadius: 8, padding: '4px 16px', fontWeight: 400, cursor: 'pointer' }}
                        onClick={() => { setButtonTextTab("after"); markUnsaved(); }}
                      >
                        After Click
                      </button>
                    </div>
                    <div style={{ marginBottom: 8 }}>Label</div>
                    {buttonTextTab === "before" ? (
                      <TextField
                        value={buttonLabelBefore}
                        onChange={val => { setButtonLabelBefore(val); markUnsaved(); }}
                        autoComplete="off"
                        placeholder="Add To Wishlist"
                      />
                    ) : (
                      <TextField
                        value={buttonLabelAfter}
                        onChange={val => { setButtonLabelAfter(val); markUnsaved(); }}
                        autoComplete="off"
                        placeholder="Added To Wishlist"
                      />
                    )}
                    </Card>
                    <div style={{ borderBottom: '1px solid #e3e3e3', margin: '24px 0' }} />
                    {/* Other Settings */}
                    <Card>
                    <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12 }}>Other Settings</div>
                    <Checkbox
                      label="Smart-Save: Auto-wishlist products visited thrice or more by the shopper"
                      checked={smartSave}
                      onChange={val => { setSmartSave(val); markUnsaved(); }}
                    />
                    <Checkbox
                      label="Social Proof: Show number of times the product has been added to wishlists by other shoppers"
                      checked={socialProof}
                      onChange={val => { setSocialProof(val); markUnsaved(); }}
                    />
                    </Card>
                  </>
                )}
                {activeTab === "collections" && (
                  <>
                    {/* Enable Wishlist on Collections */}
                    <Card>
                    <div style={{ marginBottom: 24 }}>
                      <Checkbox
                        label="Enable shoppers to add items to wishlist from Collections pages"
                        checked={collectionsEnabled}
                        onChange={val => { setCollectionsEnabled(val); markUnsaved(); }}
                      />
                    </div>
                    </Card>
                   
                    <div style={{ borderBottom: '1px solid #e3e3e3', margin: '24px 0' }} />
                    {/* Button Position */}
                    <Card>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Button Position</div>
                    <div>
                      <Box style={{ display: 'flex', gap: 2 }}>
                        <RadioButton label="Top Left" checked={collectionsButtonPosition === "top-left"} id="collections-top-left" name="collectionsButtonPosition" onChange={() => { setCollectionsButtonPosition("top-left"); markUnsaved(); }} disabled={!collectionsEnabled} />
                        <Box style={{ marginLeft: 10 }}>
                          <RadioButton label="Top Right" checked={collectionsButtonPosition === "top-right"} id="collections-top-right" name="collectionsButtonPosition" onChange={() => { setCollectionsButtonPosition("top-right"); markUnsaved(); }} disabled={!collectionsEnabled} />
                        </Box>
                      </Box>
                      <br />
                      <Box style={{ display: 'flex', gap: 2 }}>
                        <RadioButton label="Bottom Left" checked={collectionsButtonPosition === "bottom-left"} id="collections-bottom-left" name="collectionsButtonPosition" onChange={() => { setCollectionsButtonPosition("bottom-left"); markUnsaved(); }} disabled={!collectionsEnabled} />
                        <Box style={{ marginLeft: 10 }}>
                          <RadioButton label="Bottom Right" checked={collectionsButtonPosition === "bottom-right"} id="collections-bottom-right" name="collectionsButtonPosition" onChange={() => { setCollectionsButtonPosition("bottom-right"); markUnsaved(); }} disabled={!collectionsEnabled} />
                        </Box>
                      </Box>
                    </div>
                    </Card>
                  </>
                )}
                {activeTab === "wishlist" && (
                  <>
                    {/* Appearance Section */}
                    <Card>                    
                    <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 18 }}>Appearance</div>
                    <Divider style={{ margin: '24px 0' }} />
                    <div style={{ marginBottom: 15, marginTop: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 28, marginBottom: 10 }}>
                        <span style={{ fontSize: 15, minWidth: 60 }}>Type</span>
                        <div style={{ display: 'flex', gap: 28 }}>
                          <RadioButton label="Side Drawer" checked={wishlistType === "drawer"} id="wishlist-drawer" name="wishlistType" onChange={() => { setWishlistType("drawer"); markUnsaved(); }} />
                          <RadioButton label="Separate Page" checked={wishlistType === "page"} id="wishlist-page" name="wishlistType" onChange={() => { setWishlistType("page"); markUnsaved(); }} />
                          <RadioButton label="Pop-up Modal" checked={wishlistType === "modal"} id="wishlist-modal" name="wishlistType" onChange={() => { setWishlistType("modal"); markUnsaved(); }} />
                        </div>
                      </div>

                      <Divider style={{ margin: '24px 0' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 15, minWidth: 90 }}>Page Title</span>
                        <div style={{ flex: 1 }}>
                          <TextField value={wishlistPageTitle} onChange={val => { setWishlistPageTitle(val); markUnsaved(); }} autoComplete="off" />
                        </div>
                      </div>
                    </div>
                    </Card>
                    <Box style={{marginTop:10,marginBottom:10}}>
                    <Divider style={{ margin: '24px 0' }} />
                    </Box>
                    {/* Launch From Section */}
                    <Card>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, marginTop: 10 }}>Launch From</div>
                    <div style={{ display: 'flex', gap: 28, marginBottom: 10 }}>
                      <RadioButton label="Header" checked={wishlistLaunchFrom === "header"} id="wishlist-header" name="wishlistLaunchFrom" onChange={() => { setWishlistLaunchFrom("header"); markUnsaved(); }} />
                      <RadioButton label="Floating Button" checked={wishlistLaunchFrom === "floating"} id="wishlist-floating" name="wishlistLaunchFrom" onChange={() => { setWishlistLaunchFrom("floating"); markUnsaved(); }} />
                      <RadioButton label="Navigation Menu" checked={wishlistLaunchFrom === "menu"} id="wishlist-menu" name="wishlistLaunchFrom" onChange={() => { setWishlistLaunchFrom("menu"); markUnsaved(); }} />
                    </div>

                    {wishlistLaunchFrom === 'menu' && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#fff',
                        border: '1px solid #e3e3e3',
                        borderRadius: 10,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        padding: '6px 12px',
                        margin: '14px 0 18px 0',
                        gap: 10,
                        minHeight: 32,
                      }}>
                        <div style={{ background: '#b6e0fe', borderRadius: 6, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                          <PolarisIcon source={InfoIcon} color="base" />
                        </div>
                        <span style={{ flex: 1, fontSize: 15, color: '#222' }}>This needs to be set up manually</span>
                        <button style={{ border: '1px solid #e3e3e3', background: '#f7f7f7', borderRadius: 6, padding: '4px 10px', fontWeight: 500, fontSize: 14, color: '#222', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <PolarisIcon source={BookOpenIcon} color="base" /> Help
                        </button>
                      </div>
                    )}
                    {activeTab === 'wishlist' && wishlistLaunchFrom === 'floating' && (
                      <>
                        <Divider style={{ margin: '24px 0' }} />
                        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, marginTop: 10}}>Floating Button</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'start', gap: 0, marginBottom: 16 }}>
                          <div style={{ color: '#666', fontSize: 14, marginTop: 6 }}>Position</div>
                          <div >
                            <Box style={{display:"flex", gap:2}}>
                            <RadioButton
                              label="Left"
                              checked={floatingButtonPosition === 'left'}
                              name="floatingButtonPosition"
                              id="floatingButtonPositionLeft"
                              onChange={() => { setFloatingButtonPosition('left'); markUnsaved(); }}
                            />
                            <Box style={{marginLeft:10}}>
                            <RadioButton
                              label="Right"
                              checked={floatingButtonPosition === 'right'}
                              name="floatingButtonPosition"
                              id="floatingButtonPositionRight"
                              onChange={() => { setFloatingButtonPosition('right'); markUnsaved(); }}
                            />
                            </Box>
                            </Box>
                            <Box style={{display:"flex", gap:2}}>
                            <RadioButton
                              label="Bottom Left"
                              checked={floatingButtonPosition === 'bottom-left'}
                              name="floatingButtonPosition"
                              id="floatingButtonPositionBottomLeft"
                              onChange={() => { setFloatingButtonPosition('bottom-left'); markUnsaved(); }}
                            />
                            <Box style={{marginLeft:10}}>
                            <RadioButton
                              label="Bottom Right"
                              checked={floatingButtonPosition === 'bottom-right'}
                              name="floatingButtonPosition"
                              id="floatingButtonPositionBottomRight"
                              onChange={() => { setFloatingButtonPosition('bottom-right'); markUnsaved(); }}
                            />
                              </Box>
                              </Box>
                          </div>
                        </div>

                        <br/>
                        <Divider style={{ margin: '24px 0' }} />
                       <br/>
                        <Checkbox
                          label="Show count"
                          checked={showCount}
                          onChange={() => { setShowCount(!showCount); markUnsaved(); }}
                        />
                      </>
                    )}
                                            </Card>
                    <br/>
                    <Divider />
                    {/* Other Settings Section */}
                    <Card>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16, marginTop: 15 }}>Other Settings</div>
                    <Checkbox
                      label="Allow shoppers to Share Wishlist"
                      checked={wishlistShareEnabled}
                      onChange={val => { setWishlistShareEnabled(val); markUnsaved(); }}
                    />
                    </Card>
                  </>
                )}
                {activeTab === 'cart' && (
                  <>
                  <Card>
                    <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 18 }}>Save for later pop-up</div>
                    <Checkbox
                      label="Allow shoppers to save items before removing them from the cart"
                      checked={saveForLaterEnabled}
                      onChange={val => { setSaveForLaterEnabled(val); markUnsaved(); }}
                      style={{ marginBottom: 18 }}
                    />
                    <Divider style={{ margin: '18px 0' }} />
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, maxWidth: 600, marginTop: 10, }}>
                      <div style={{ fontWeight: 500, minWidth: 150, marginRight: 18 }}>Pop-up title</div>
                      <div style={{ flex: 1 }}>
                        <TextField
                          value={saveForLaterTitle}
                          onChange={val => { setSaveForLaterTitle(val); markUnsaved(); }}
                          placeholder="Do you want to save this product for later?"
                          autoComplete="off"
                          style={{ width: '100%' }}
                          disabled={!saveForLaterEnabled}
                        />
                      </div>
                    </div>
                    <Divider style={{ margin: '12px 0' }} />
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, maxWidth: 600, marginTop: 10, }}>
                      <div style={{ fontWeight: 500, minWidth: 150, marginRight: 18 }}>Primary button text</div>
                      <div style={{ flex: 1 }}>
                        <TextField
                          value={saveForLaterPrimary}
                          onChange={val => { setSaveForLaterPrimary(val); markUnsaved(); }}
                          placeholder="Save For later"
                          autoComplete="off"
                          style={{ width: '100%' }}
                          disabled={!saveForLaterEnabled}
                        />
                      </div>
                    </div>
                    <Divider style={{ margin: '12px 0' }} />
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, marginTop: 10, maxWidth: 600 }}>
                      <div style={{ fontWeight: 500, minWidth: 150, marginRight: 18 }}>Secondary button text</div>
                      <div style={{ flex: 1 }}>
                        <TextField
                          value={saveForLaterSecondary}
                          onChange={val => { setSaveForLaterSecondary(val); markUnsaved(); }}
                          placeholder="No, thanks!"
                          autoComplete="off"
                          style={{ width: '100%' }}
                          disabled={!saveForLaterEnabled}
                        />
                      </div>
                    </div>
                    <Divider style={{ margin: '12px 0' }} />
                    <div style={{ fontWeight: 500, marginBottom: 6 }}>Permission</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12, marginTop: 10, }}>
                      <RadioButton
                        label="Ask the shopper if they want to see the pop-up again"
                        checked={saveForLaterPermission === 'ask'}
                        id="saveforlater-permission-ask"
                        name="saveforlater-permission"
                        onChange={() => { setSaveForLaterPermission('ask'); markUnsaved(); }}
                        disabled={!saveForLaterEnabled}
                      />
                      <RadioButton
                        label="Always show the pop-up"
                        checked={saveForLaterPermission === 'always'}
                        id="saveforlater-permission-always"
                        name="saveforlater-permission"
                        onChange={() => { setSaveForLaterPermission('always'); markUnsaved(); }}
                        disabled={!saveForLaterEnabled}
                      />
                    </div>
                    </Card>
                  </>
                )}
              </div>
              {/* Right Panel: Mock Preview (reusable) */}
              <div
                style={{
                  flex: 1,
                  minWidth: 320,
                  maxWidth: 800,
                  width: '100%',
                  minHeight: 0,
                  boxSizing: 'border-box',
                  overflowX: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginTop: 0,
                }}
              >
                <MockPreview
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  selectedIcon={selectedIcon}
                  buttonPosition={activeButtonPositionTab === "near" ? buttonPositionNear : buttonPositionImage}
                  buttonPositionTab={activeButtonPositionTab}
                  buttonType={buttonType}
                  buttonStyle={buttonStyle}
                  buttonLabel={buttonTextTab === "before" ? buttonLabelBefore : buttonLabelAfter}
                  buttonTextTab={buttonTextTab}
                  activeTab={activeTab}
                  gridPreview={activeTab === 'collections'}
                  collectionsEnabled={collectionsEnabled}
                  collectionsButtonPosition={collectionsButtonPosition}
                  wishlistType={wishlistType}
                  wishlistPageTitle={wishlistPageTitle}
                  wishlistShareEnabled={wishlistShareEnabled}
                  wishlistLaunchFrom={wishlistLaunchFrom}
                  saveForLaterEnabled={saveForLaterEnabled}
                  saveForLaterTitle={saveForLaterTitle}
                  saveForLaterPrimary={saveForLaterPrimary}
                  saveForLaterSecondary={saveForLaterSecondary}
                  saveForLaterPermission={saveForLaterPermission}
                  floatingButtonPosition={floatingButtonPosition}
                  showCount={showCount}
                />
              </div>
            </div>
          </div>
          <style>{`
          @media (max-width: 900px) {
          .manage-config-main-card {
            flex-direction: column !important;
            gap: 0 !important;
            padding: 12px !important;
          }
          .manage-config-left-panel, .manage-config-right-panel {
            min-width: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            padding: 12px 8px 12px 8px !important;
            box-sizing: border-box !important;
          }
        }
        @media (max-width: 600px) {
          .manage-config-main-card {
            padding: 4px !important;
          }
          .manage-config-left-panel, .manage-config-right-panel {
            padding: 8px 2px 8px 2px !important;
          }
        }
      `}</style>
      <style>{`
  @media (min-width: 901px) {
    body { overflow: hidden !important; }
  }
`}</style>
        </>
      )}
    </Frame>
  );
}

