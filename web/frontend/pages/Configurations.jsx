import React, { useState, useEffect, useContext,useRef } from "react";
import { Popover, RadioButton, LegacyStack, Icon, Checkbox, TextField, Box, Divider, Frame, Card, ContextualSaveBar, Spinner, Icon as PolarisIcon, Page, LegacyCard, RangeSlider } from "@shopify/polaris";
import { HeartIcon, StarIcon, BillFilledIcon, BookOpenIcon, ArrowLeftIcon, InfoIcon } from "@shopify/polaris-icons";
import { HexColorPicker } from "react-colorful";
import MockPreview from "./MockPreview";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getSessionToken } from "@shopify/app-bridge-utils";
import { AppContext } from "../components";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from "../components";



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
            <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{color}</span>
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
  // Button size state
  const [buttonSize, setButtonSize] = useState(40); // default size in px
  // Add state for icon thickness
  const [iconThickness, setIconThickness] = useState(2); // default thickness

  // Add state for before/after button text


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



  // Add state for floating button corner radius
  const [floatingButtonCornerRadius, setFloatingButtonCornerRadius] = useState(24); // default 24px

  // Add state for drawer alignment
  const [drawerAlignment, setDrawerAlignment] = useState("right"); // default to right

  // Add state for text color
  const [textColor, setTextColor] = useState("#222222");
  const [textColorPopoverActive, setTextColorPopoverActive] = useState(false);

  const fetch = useAuthenticatedFetch();
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedState, setLastSavedState] = useState({});
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const intervalRef = useRef(null);
  const [buttonLabelBefore, setButtonLabelBefore] = useState(t('Add To Wishlist', 'Configurations'));
  const [buttonLabelAfter, setButtonLabelAfter] = useState(t('Added To Wishlist', 'Configurations'));
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

  // Move NAV_TABS inside the component where t is available
  const NAV_TABS = [
    { label: t('Basics', 'Configurations'), key: "basics" },
    { label: t('Product page', 'Configurations'), key: "product" },
    { label: t('Collections', 'Configurations'), key: "collections" },
    { label: t('Wishlist Page', 'Configurations'), key: "wishlist" },
    { label: t('Cart', 'Configurations'), key: "cart" },
  ];
  const ICONS = [
    { value: 'Heart',label: t('Heart', 'Configurations'), icon: HeartIcon },
    { value: 'Star',label: t('Star', 'Configurations'), icon: StarIcon },
    { value: 'Bookmark',label: t('Bookmark', 'Configurations'), icon: BillFilledIcon },
  ];
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
          setButtonLabelBefore(config.btn_text_product_page_before || t("Add To Wishlist",'Configurations'));
          setButtonLabelAfter(config.btn_text_product_page_after || t("Added To Wishlist",'Configurations'));
          setSmartSave(!!config.smart_save);
          setSocialProof(!!config.social_proof);
          // Set button position based on the stored tab and position value
          if (config.button_position_tab === 'near_cart' || (!config.button_position_tab && config.btn_position_on_product_page && ['above_cart', 'below_cart', 'left_of_cart', 'right_of_cart'].includes(config.btn_position_on_product_page))) {
            setActiveButtonPositionTab("near");
            setButtonPositionNear(
              config.btn_position_on_product_page === 'above_cart' ? 'above' :
                config.btn_position_on_product_page === 'below_cart' ? 'below' :
                  config.btn_position_on_product_page === 'left_of_cart' ? 'left' :
                    config.btn_position_on_product_page === 'right_of_cart' ? 'right' : 'below'
            );
          } else if (config.button_position_tab === 'product_image' || (!config.button_position_tab && config.btn_position_on_product_page && ['top_left', 'top_right', 'bottom_left', 'bottom_right'].includes(config.btn_position_on_product_page))) {
            setActiveButtonPositionTab("image");
            setButtonPositionImage(
              config.btn_position_on_product_page === 'top_left' ? 'top-left' :
                config.btn_position_on_product_page === 'top_right' ? 'top-right' :
                  config.btn_position_on_product_page === 'bottom_left' ? 'bottom-left' :
                    config.btn_position_on_product_page === 'bottom_right' ? 'bottom-right' : 'top-left'
            );
          } else {
            setActiveButtonPositionTab("near"); // Default
            setButtonPositionNear('below'); // Default
          }
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
          setButtonSize(config.button_size_product_page || 40);
          setIconThickness(config.icon_thickness_product_page || 2);

          setFloatingButtonCornerRadius(config.floating_btn_corner_radius || 24);
          setDrawerAlignment(config.wishlist_drawer_appearance || "right"); // Use the correct field name
          setTextColor(config.text_color || "#222222"); // Add this line
          setLastSavedState({
            primaryColor: config.primary_color || "#000000",
            secondaryColor: config.secondary_color || "#ffffff",
            selectedIcon: (config.icon_type || "heart").charAt(0).toUpperCase() + (config.icon_type || "heart").slice(1),
            buttonType: config.btn_type_product_page === 'icon_and_text' ? 'icon-text' : config.btn_type_product_page === 'only_icon' ? 'icon' : 'text',
            buttonStyle: config.appearance_btn_product_page || 'solid',
            buttonTextTab: config.btn_text_product_page_toggle === 'after_click' ? 'after' : 'before',
            buttonLabel: config.btn_text_product_page || "",
            buttonLabelBefore: config.btn_text_product_page_before || t("Add to Wishlist",'Configurations'),
            buttonLabelAfter: config.btn_text_product_page_after || t("Added to Wishlist",'Configurations'),
            smartSave: !!config.smart_save,
            socialProof: !!config.social_proof,
            buttonPositionNear: config.btn_position_on_product_page === 'above_cart' ? 'above' :
              config.btn_position_on_product_page === 'below_cart' ? 'below' :
                config.btn_position_on_product_page === 'left_of_cart' ? 'left' :
                  config.btn_position_on_product_page === 'right_of_cart' ? 'right' : 'below',
            buttonPositionImage: config.btn_position_on_product_page === 'top_left' ? 'top-left' :
              config.btn_position_on_product_page === 'top_right' ? 'top-right' :
                config.btn_position_on_product_page === 'bottom_left' ? 'bottom-left' :
                  config.btn_position_on_product_page === 'bottom_right' ? 'bottom-right' : 'top-left',
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
            buttonSize: config.button_size_product_page || 40,
            iconThickness: config.icon_thickness_product_page || 2,

            floatingButtonCornerRadius: config.floating_btn_corner_radius || 24,
            drawerAlignment: config.wishlist_drawer_appearance || "right", // Use the correct field name
            textColor: config.text_color || "#222222", // Add this line
            activeButtonPositionTab: config.button_position_tab === 'near_cart' ? "near" : config.button_position_tab === 'product_image' ? "image" : "near",
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
    btn_position_on_product_page: activeButtonPositionTab === "near" ? (buttonPositionNear === 'above' ? 'above_cart' :
      buttonPositionNear === 'below' ? 'below_cart' :
        buttonPositionNear === 'left' ? 'left_of_cart' :
          buttonPositionNear === 'right' ? 'right_of_cart' : null) : (buttonPositionImage === 'top-left' ? 'top_left' :
            buttonPositionImage === 'top-right' ? 'top_right' :
              buttonPositionImage === 'bottom-left' ? 'bottom_left' :
                buttonPositionImage === 'bottom-right' ? 'bottom_right' : null),
    button_position_tab: activeButtonPositionTab === "near" ? "near_cart" : "product_image",
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
    button_size_product_page: buttonSize,
    icon_thickness_product_page: iconThickness,

    floating_btn_corner_radius: floatingButtonCornerRadius,
    wishlist_drawer_appearance: drawerAlignment || "right", // Use the correct field name with fallback
    text_color: textColor, // Add this line
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
    setButtonSize(lastSavedState.buttonSize);
    setIconThickness(lastSavedState.iconThickness);

    setFloatingButtonCornerRadius(lastSavedState.floatingButtonCornerRadius || 24);
    setDrawerAlignment(lastSavedState.drawerAlignment || "right"); // Use the correct field name
    setTextColor(lastSavedState.textColor || "#222222"); // Add this line
    setActiveButtonPositionTab(lastSavedState.activeButtonPositionTab || "near");
  };

  // Save handler
  const handleSave = async () => {
    setSaving(true);
    setSaveMessage("");
    try {
      const token = await getSessionToken(appBridge);
      const payload = buildPayload();
      console.log('Sending payload:', payload); // Debug log
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
          buttonSize,
          iconThickness,

          floatingButtonCornerRadius,
          drawerAlignment: drawerAlignment, // This maps to wishlist_drawer_appearance
          textColor: textColor, // Add this line
          activeButtonPositionTab,
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
    <Frame>
      {/* Custom Page Heading */}

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

          <div
            style={{
              maxWidth: 1400,
              margin: '0 auto 0 auto',
              display: 'flex',
              justifyContent: 'flex-start', // <-- align left
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
              {t('Configurations', 'Configurations')}
              <br />
              <span style={{ fontSize: 13, color: '#555', fontWeight: 400, maxWidth: 700, marginTop: 2 }}>{t('Subtitle Configurations', 'Configurations')}</span>
            </div>
            {/* <div
              style={{
                display: 'flex',
                // gap: 0,
                padding: 0,
                background: '#fff',
                flexWrap: 'wrap',
                alignItems: 'center',
                minHeight: 60,
                borderRadius: 16,
                margin: '0', // Remove top margin to close gap
                width: '100%',

              }}
            > */}
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
                  marginBottom: 0,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
            {/* </div> */}

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
                minHeight: '600px',
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
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                {activeTab === "basics" && (
                  <>
                    {/* Colors Section */}
                    <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 24 }}>{t('Colors', 'Configurations')}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                      {/* Primary Color */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 50 }}>
                        <span style={{ minWidth: 120, fontSize: 13 }}>{t('Primary color', 'Configurations')}</span>
                        <ColorPopover color={primaryColor} setColor={c => { setPrimaryColor(c); markUnsaved(); }} active={primaryPopoverActive} setActive={setPrimaryPopoverActive} />
                      </div>
                      <Divider />
                      {/* Secondary Color */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 50 }}>
                        <span style={{ minWidth: 120, fontSize: 13 }}>{t('Secondary color', 'Configurations')}</span>
                        <ColorPopover color={secondaryColor} setColor={c => { setSecondaryColor(c); markUnsaved(); }} active={secondaryPopoverActive} setActive={setSecondaryPopoverActive} />
                      </div>
                    </div>
                    {/* Divider */}
                    <div style={{ borderBottom: '1px solid #e3e3e3', margin: '32px 0 24px 0' }} />
                    {/* Icons Section */}
                    <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 18 }}>{t('Icons', 'Configurations')}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {ICONS.map(({ label, icon,value }) => {
                        const isSelected = selectedIcon === value;
                        return (
                          <div
                            key={value}
                            onClick={() => { setSelectedIcon(value); markUnsaved(); }}
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
                              width: 170,
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
                    {/* Divider */}
                    <div style={{ borderBottom: '1px solid #e3e3e3', margin: '32px 0 24px 0' }} />
                    {/* Button Size Section */}
                    <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 18 }}>{t('Button size', 'Configurations')}</div>
                    <Box sectioned title={t('Button size', 'Configurations')}>
                      <RangeSlider
                        label={t('Button size', 'Configurations')}
                        min={24}
                        max={70}
                        step={1}
                        value={buttonSize}
                        onChange={val => { setButtonSize(val); markUnsaved(); }}
                        output
                      />
                    </Box>
                    {/* Divider */}
                    <div style={{ borderBottom: '1px solid #e3e3e3', margin: '32px 0 24px 0' }} />
                    {/* Icon Thickness Section */}
                    <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 18 }}>{t('Icon thickness', 'Configurations')}</div>
                    <Box sectioned title={t('Icon thickness', 'Configurations')}>
                      <RangeSlider
                        min={1}
                        max={8}
                        step={1}
                        value={iconThickness}
                        onChange={val => { setIconThickness(val); markUnsaved(); }}
                        output
                        // helpText={t('Applies when button type is \'Only Icon\' or \'Icon and Text\'', 'Configurations')}
                      />
                    </Box>
                  </>
                )}
                {activeTab === "product" && (
                  <>
                    {/* Button Position */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>{t('Button Position', 'Configurations')}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                        <button
                          style={{
                            background: activeButtonPositionTab === "near" ? '#f5f5f5' : 'none',
                            color: activeButtonPositionTab === "near" ? '#222' : '#888',
                            fontWeight: activeButtonPositionTab === "near" ? 600 : 500,
                            border: 'none',
                            borderRadius: 5,
                            padding: '6px 20px',
                            fontSize: 12,
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                          }}
                          onClick={() => setActiveButtonPositionTab("near")}
                        >
                          {t('Near cart button', 'Configurations')}
                        </button>
                        <button
                          style={{
                            background: activeButtonPositionTab === "image" ? '#f5f5f5' : 'none',
                            color: activeButtonPositionTab === "image" ? '#222' : '#888',
                            fontWeight: activeButtonPositionTab === "image" ? 600 : 500,
                            border: 'none',
                            borderRadius: 5,
                            padding: '6px 20px',
                            fontSize: 12,
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                          }}
                          onClick={() => setActiveButtonPositionTab("image")}
                        >
                          {t('On product image', 'Configurations')}
                        </button>
                      </div>
                    </div>
                    {activeButtonPositionTab === "near" && (
                      <div>
                        {/* <Box style={{ display: 'flex', gap: 2 }}> */}
                        <RadioButton label={t('Above Cart Button', 'Configurations')} checked={buttonPositionNear === "above"} id="above" name="buttonPositionNear" onChange={() => { setButtonPositionNear("above"); markUnsaved(); }} />
                        <Box style={{}}>
                          <RadioButton label={t('Left of Cart Button', 'Configurations')} checked={buttonPositionNear === "left"} id="left" name="buttonPositionNear" onChange={() => { setButtonPositionNear("left"); markUnsaved(); }} />
                        </Box>
                        {/* </Box> */}
                        {/* <br /> */}
                        {/* <Box style={{ display: 'flex', gap: 2 }}> */}
                        <RadioButton label={t('Below Cart Button', 'Configurations')} checked={buttonPositionNear === "below"} id="below" name="buttonPositionNear" onChange={() => { setButtonPositionNear("below"); markUnsaved(); }} />
                        <Box style={{}}>
                          <RadioButton label={t('Right of Cart Button', 'Configurations')} checked={buttonPositionNear === "right"} id="right" name="buttonPositionNear" onChange={() => { setButtonPositionNear("right"); markUnsaved(); }} />
                        </Box>
                        {/* </Box> */}
                      </div>
                    )}
                    {activeButtonPositionTab === "image" && (
                      <div>
                        {/* <Box style={{ display: 'flex', gap: 2 }}> */}
                        <RadioButton label={t('Top Left', 'Configurations')} checked={buttonPositionImage === "top-left"} id="top-left" name="buttonPositionImage" onChange={() => { setButtonPositionImage("top-left"); markUnsaved(); }} />
                        <Box style={{}}>
                          <RadioButton label={t('Top Right', 'Configurations')} checked={buttonPositionImage === "top-right"} id="top-right" name="buttonPositionImage" onChange={() => { setButtonPositionImage("top-right"); markUnsaved(); }} />
                        </Box>
                        {/* </Box> */}
                        {/* <br />
                        <Box style={{ display: 'flex', gap: 2 }}> */}
                        <RadioButton label={t('Bottom Left', 'Configurations')} checked={buttonPositionImage === "bottom-left"} id="bottom-left" name="buttonPositionImage" onChange={() => { setButtonPositionImage("bottom-left"); markUnsaved(); }} />
                        <Box style={{}}>
                          <RadioButton label={t('Bottom Right', 'Configurations')} checked={buttonPositionImage === "bottom-right"} id="bottom-right" name="buttonPositionImage" onChange={() => { setButtonPositionImage("bottom-right"); markUnsaved(); }} />
                        </Box>
                        {/* </Box> */}
                      </div>
                    )}
                    <Box style={{ marginTop: 20, marginBottom: 20 }}>
                      <Divider />
                    </Box>
                    {/* Button Type */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>{t('Button Type', 'Configurations')}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <RadioButton label={t('Icon and Text', 'Configurations')} checked={buttonType === "icon-text"} id="icon-text" name="buttonType" onChange={() => { setButtonType("icon-text"); markUnsaved(); }} />
                        <RadioButton label={t('Only Text', 'Configurations')} checked={buttonType === "text"} id="text" name="buttonType" onChange={() => { setButtonType("text"); markUnsaved(); }} />
                        <RadioButton label={t('Only Icon', 'Configurations')} checked={buttonType === "icon"} id="icon" name="buttonType" onChange={() => { setButtonType("icon"); markUnsaved(); }} />
                      </div>
                    </div>
                    <div style={{ borderBottom: '1px solid #e3e3e3', margin: '24px 0' }} />
                    {/* Appearance */}
                    {/* <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Appearance</div> */}
                    <div style={{ marginBottom: 18 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>{t('Button Style', 'Configurations')}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <RadioButton label={t('Solid', 'Configurations')} checked={buttonStyle === "solid"} id="solid" name="buttonStyle" onChange={() => { setButtonStyle("solid"); markUnsaved(); }} />
                        <RadioButton label={t('Outline', 'Configurations')} checked={buttonStyle === "outline"} id="outline" name="buttonStyle" onChange={() => { setButtonStyle("outline"); markUnsaved(); }} />
                        <RadioButton label={t('Plain', 'Configurations')} checked={buttonStyle === "plain"} id="plain" name="buttonStyle" onChange={() => { setButtonStyle("plain"); markUnsaved(); }} />
                      </div>
                    </div>
                    <div style={{ borderBottom: '1px solid #e3e3e3', margin: '24px 0' }} />
                    {/* Button Text */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>{t('Button text', 'Configurations')}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button
                          style={{
                            background: buttonTextTab === "before" ? '#ececec' : 'none',
                            border: 'none',
                            borderRadius: 8,
                            padding: '4px 16px',
                            fontWeight: 400,
                            cursor: 'pointer',
                            fontSize: 12,
                            color: '#222',
                            marginRight: 0,
                            outline: 'none',
                            transition: 'background 0.15s',
                          }}
                          onClick={() => { setButtonTextTab("before"); markUnsaved(); }}
                        >
                          {t('Before Click', 'Configurations')}
                        </button>
                        <button
                          style={{
                            background: buttonTextTab === "after" ? '#ececec' : 'none',
                            border: 'none',
                            borderRadius: 8,
                            padding: '4px 16px',
                            fontWeight: 400,
                            cursor: 'pointer',
                            fontSize: 12,
                            color: '#222',
                            marginRight: 0,
                            outline: 'none',
                            transition: 'background 0.15s',
                          }}
                          onClick={() => { setButtonTextTab("after"); markUnsaved(); }}
                        >
                          {t('After Click', 'Configurations')}
                        </button>
                      </div>
                    </div>
                    <div style={{ marginBottom: 8 }}>{t('Label', 'Configurations')}</div>
                    {buttonTextTab === "before" ? (
                      <TextField
                        value={buttonLabelBefore}
                        onChange={val => { setButtonLabelBefore(val); markUnsaved(); }}
                        autoComplete="off"
                        placeholder={t('Add To Wishlist', 'Configurations')}
                      />
                    ) : (
                      <TextField
                        value={buttonLabelAfter}
                        onChange={val => { setButtonLabelAfter(val); markUnsaved(); }}
                        autoComplete="off"
                        placeholder={t('Added To Wishlist', 'Configurations')}
                      />
                    )}
                    <div style={{ borderBottom: '1px solid #e3e3e3', margin: '24px 0' }} />
                    {/* Other Settings */}
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>{t('Other Settings', 'Configurations')}</div>
                    <Checkbox
                      label={t('Smart Save', 'Configurations')}
                      checked={smartSave}
                      onChange={val => { setSmartSave(val); markUnsaved(); }}
                    />
                    <Checkbox
                      label={t('Social Proof', 'Configurations')}
                      checked={socialProof}
                      onChange={val => { setSocialProof(val); markUnsaved(); }}
                    />
                    <div style={{ margin: '24px 0' }} />
                  </>
                )}
                {activeTab === "collections" && (
                  <>
                    {/* Enable Wishlist on Collections */}

                    <div style={{ marginBottom: 24 }}>
                      <Checkbox
                        label={t('Add item to wishlist from collection page', 'Configurations')}
                        checked={collectionsEnabled}
                        onChange={val => { setCollectionsEnabled(val); markUnsaved(); }}
                      />
                    </div>

                    <div style={{ borderBottom: '1px solid #e3e3e3', margin: '24px 0' }} />
                    {/* Button Position */}
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>{t('Button Position', 'Configurations')}</div>
                    <div>
                      {/* <Box style={{ display: 'flex', gap: 2 }}> */}
                      <RadioButton label={t('Top Left', 'Configurations')} checked={collectionsButtonPosition === "top-left"} id="collections-top-left" name="collectionsButtonPosition" onChange={() => { setCollectionsButtonPosition("top-left"); markUnsaved(); }} disabled={!collectionsEnabled} />
                      <Box style={{}}>
                        <RadioButton label={t('Top Right', 'Configurations')} checked={collectionsButtonPosition === "top-right"} id="collections-top-right" name="collectionsButtonPosition" onChange={() => { setCollectionsButtonPosition("top-right"); markUnsaved(); }} disabled={!collectionsEnabled} />
                      </Box>
                      {/* </Box> */}
                      {/* <br /> */}
                      {/* <Box style={{ display: 'flex', gap: 2 }}> */}
                      <RadioButton label={t('Bottom Left', 'Configurations')} checked={collectionsButtonPosition === "bottom-left"} id="collections-bottom-left" name="collectionsButtonPosition" onChange={() => { setCollectionsButtonPosition("bottom-left"); markUnsaved(); }} disabled={!collectionsEnabled} />
                      <Box style={{}}>
                        <RadioButton label={t('Bottom Right', 'Configurations')} checked={collectionsButtonPosition === "bottom-right"} id="collections-bottom-right" name="collectionsButtonPosition" onChange={() => { setCollectionsButtonPosition("bottom-right"); markUnsaved(); }} disabled={!collectionsEnabled} />
                      </Box>
                      {/* </Box> */}
                    </div>
                  </>
                )}
                {activeTab === "wishlist" && (
                  <>
                    {/* Appearance Section */}

                    <div style={{ marginBottom: 16, marginTop: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>{t('Page Title', 'Configurations')}</div>
                      <TextField
                        value={wishlistPageTitle}
                        onChange={val => { setWishlistPageTitle(val); markUnsaved(); }}
                        autoComplete="off"
                        placeholder={t('My Wishlist')}
                        style={{
                          width: '100%',
                          borderRadius: 12,
                          border: '1.5px solid #bfc5c9',
                          boxShadow: 'none',
                          fontSize: 16,
                          padding: '8px 14px',
                          background: '#fff',
                        }}
                      />
                    </div>
                    <Box style={{ marginTop: 10, marginBottom: 10 }}>
                      <Divider />
                    </Box>
                    {/* Text Color */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 55, marginTop: 0, marginBottom: 0 }}>
                      <span style={{ minWidth: 120, fontSize: 13 }}>{t('Text Color', 'Configurations')}</span>
                      <ColorPopover color={textColor} setColor={c => { setTextColor(c); markUnsaved(); }} active={textColorPopoverActive} setActive={setTextColorPopoverActive} />
                    </div>
                    <Box style={{ marginTop: 10, marginBottom: 10 }}>
                      <Divider />
                    </Box>
                    <div style={{ marginBottom: 15, marginTop: 10 }}>
                      <div style={{ marginBottom: 10 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, minWidth: 60 }}>{t('Type', 'Configurations')}</span>
                        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <RadioButton label={t('Side Drawer', 'Configurations')} checked={wishlistType === "drawer"} id="wishlist-drawer" name="wishlistType" onChange={() => { setWishlistType("drawer"); markUnsaved(); }} />
                          <RadioButton label={t('Separate Page', 'Configurations')} checked={wishlistType === "page"} id="wishlist-page" name="wishlistType" onChange={() => { setWishlistType("page"); markUnsaved(); }} />
                          <RadioButton label={t('Pop-up Modal', 'Configurations')} checked={wishlistType === "modal"} id="wishlist-modal" name="wishlistType" onChange={() => { setWishlistType("modal"); markUnsaved(); }} />
                        </div>
                      </div>
                      <Box style={{ marginTop: 10, marginBottom: 10 }}>
                        <Divider />
                      </Box>
                      {wishlistType === "drawer" && (
                        <div style={{ alignItems: 'center', marginTop: 12, marginBottom: 12, display: 'block' }}>
                          {/* <div style={{ fontWeight: 600, fontSize: 15, minWidth: 110 }}>Side Drawer Alignment</div> */}

                          <div style={{ marginTop: 10 }}>
                            <RadioButton
                              label={t('Left')}
                              checked={drawerAlignment === "left"}
                              name="drawerAlignment"
                              id="drawerAlignmentLeft"
                              onChange={() => { setDrawerAlignment("left"); markUnsaved(); }}
                            />
                            <br />
                            <RadioButton
                              label={t('Right')}
                              checked={drawerAlignment === "right"}
                              name="drawerAlignment"
                              id="drawerAlignmentRight"
                              onChange={() => { setDrawerAlignment("right"); markUnsaved(); }}
                            />
                          </div>
                          <Box style={{ marginTop: 10, marginBottom: 10 }}>
                            <Divider />
                          </Box>
                        </div>

                      )}



                    </div>

                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, marginTop: 10 }}>{t('Launch From', 'Configurations')}</div>
                    <div style={{ marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <RadioButton label={t('Header', 'Configurations')} checked={wishlistLaunchFrom === "header"} id="wishlist-header" name="wishlistLaunchFrom" onChange={() => { setWishlistLaunchFrom("header"); markUnsaved(); }} />
                      <RadioButton label={t('Floating Button', 'Configurations')} checked={wishlistLaunchFrom === "floating"} id="wishlist-floating" name="wishlistLaunchFrom" onChange={() => { setWishlistLaunchFrom("floating"); markUnsaved(); }} />
                      <RadioButton label={t('Navigation Menu', 'Configurations')} checked={wishlistLaunchFrom === "menu"} id="wishlist-menu" name="wishlistLaunchFrom" onChange={() => { setWishlistLaunchFrom("menu"); markUnsaved(); }} />
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
                        <span style={{ flex: 1, fontSize: 15, color: '#222' }}>{t('This needs to be set up manually', 'Configurations')}</span>
                        <button style={{ border: '1px solid #e3e3e3', background: '#f7f7f7', borderRadius: 6, padding: '4px 10px', fontWeight: 500, fontSize: 14, color: '#222', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <PolarisIcon source={BookOpenIcon} color="base" /> {t('Help', 'Configurations')}
                        </button>
                      </div>
                    )}
                    {activeTab === 'wishlist' && wishlistLaunchFrom === 'floating' && (
                      <>
                        <Box style={{ marginTop: 20, marginBottom: 20 }}>
                          <Divider />
                        </Box>

                        <div style={{ marginBottom: 18 }}>
                          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>{t('Position', 'Configurations')}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <RadioButton
                              label={t('Left', 'Configurations')}
                              checked={floatingButtonPosition === 'left'}
                              name="floatingButtonPosition"
                              id="floatingButtonPositionLeft"
                              onChange={() => { setFloatingButtonPosition('left'); markUnsaved(); }}
                            />
                            <RadioButton
                              label={t('Right', 'Configurations')}
                              checked={floatingButtonPosition === 'right'}
                              name="floatingButtonPosition"
                              id="floatingButtonPositionRight"
                              onChange={() => { setFloatingButtonPosition('right'); markUnsaved(); }}
                            />
                            <RadioButton
                              label={t('Bottom Left', 'Configurations')}
                              checked={floatingButtonPosition === 'bottom-left'}
                              name="floatingButtonPosition"
                              id="floatingButtonPositionBottomLeft"
                              onChange={() => { setFloatingButtonPosition('bottom-left'); markUnsaved(); }}
                            />
                            <RadioButton
                              label={t('Bottom Right', 'Configurations')}
                              checked={floatingButtonPosition === 'bottom-right'}
                              name="floatingButtonPosition"
                              id="floatingButtonPositionBottomRight"
                              onChange={() => { setFloatingButtonPosition('bottom-right'); markUnsaved(); }}
                            />
                          </div>
                        </div>
                        <Box style={{ marginTop: 10, marginBottom: 10 }}>
                          <Divider />
                        </Box>

                        {/* Floating Button Corner Radius Field */}
                        <div style={{ marginBottom: 16 }}>
                          <span style={{ minWidth: 120, fontSize: 13, display: 'block', marginBottom: 8 }}>{t('Corner Radius', 'Configurations')}</span>
                          <RangeSlider
                            min={0}
                            max={24}
                            step={1}
                            value={floatingButtonCornerRadius}
                            onChange={val => { setFloatingButtonCornerRadius(val); markUnsaved(); }}
                            output
                          />
                        </div>
                        <Box style={{ marginTop: 10, marginBottom: 10 }}>
                          <Divider />
                        </Box>


                        <Checkbox
                          label={t('Show Count', 'Configurations')}
                          checked={showCount}
                          onChange={() => { setShowCount(!showCount); markUnsaved(); }}
                        />


                      </>
                    )}
                    <br />
                    <Box style={{ marginTop: 10, marginBottom: 10 }}>
                      <Divider />
                    </Box>
                    {/* Other Settings Section */}

                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, marginTop: 15 }}>{t('Other Settings', 'Configurations')}</div>
                    <Checkbox
                      label={t('Allow shoppers to Share Wishlist', 'Configurations')}
                      checked={wishlistShareEnabled}
                      onChange={val => { setWishlistShareEnabled(val); markUnsaved(); }}
                    />

                  </>
                )}
                {activeTab === 'cart' && (
                  <>

                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 18 }}>{t('Save for later pop-up', 'Configurations')}</div>
                    <Checkbox
                      label={t('Allow shoppers to save items', 'Configurations')}
                      checked={saveForLaterEnabled}
                      onChange={val => { setSaveForLaterEnabled(val); markUnsaved(); }}
                      style={{ marginBottom: 18 }}
                    />
                    <Box style={{ marginTop: 20, marginBottom: 20 }}>
                      <Divider />
                    </Box>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, maxWidth: 600, marginTop: 10, }}>
                      <div style={{ fontWeight: 500, minWidth: 150, marginRight: 18 }}>{t('Pop-up title', 'Configurations')}</div>
                      <div style={{ flex: 1 }}>
                        <TextField
                          value={saveForLaterTitle}
                          onChange={val => { setSaveForLaterTitle(val); markUnsaved(); }}
                          placeholder={t('Do you want to save this product for later?', 'Configurations')}
                          autoComplete="off"
                          style={{ width: '100%' }}
                          disabled={!saveForLaterEnabled}
                        />
                      </div>
                    </div>
                    <Box style={{ marginTop: 20, marginBottom: 20 }}>
                      <Divider />
                    </Box>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, maxWidth: 600, marginTop: 10, }}>
                      <div style={{ fontWeight: 500, minWidth: 150, marginRight: 18 }}>{t('Primary button text', 'Configurations')}</div>
                      <div style={{ flex: 1 }}>
                        <TextField
                          value={saveForLaterPrimary}
                          onChange={val => { setSaveForLaterPrimary(val); markUnsaved(); }}
                          placeholder={t('Save For later', 'Configurations')}
                          autoComplete="off"
                          style={{ width: '100%' }}
                          disabled={!saveForLaterEnabled}
                        />
                      </div>
                    </div>
                    <Box style={{ marginTop: 20, marginBottom: 20 }}>
                      <Divider />
                    </Box>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, marginTop: 10, maxWidth: 600 }}>
                      <div style={{ fontWeight: 500, minWidth: 150, marginRight: 18 }}>{t('Secondary button text', 'Configurations')}</div>
                      <div style={{ flex: 1 }}>
                        <TextField
                          value={saveForLaterSecondary}
                          onChange={val => { setSaveForLaterSecondary(val); markUnsaved(); }}
                          placeholder={t('No, thanks!', 'Configurations')}
                          autoComplete="off"
                          style={{ width: '100%' }}
                          disabled={!saveForLaterEnabled}
                        />
                      </div>
                    </div>
                    <Box style={{ marginTop: 20, marginBottom: 20 }}>
                      <Divider />
                    </Box>
                    <div style={{ fontWeight: 500, marginBottom: 6, fontSize: 15 }}>{t('Permission', 'Configurations')}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12, marginTop: 10, }}>
                      <RadioButton
                        label={t('Ask the shopper if they want to see the pop-up again', 'Configurations')}
                        checked={saveForLaterPermission === 'ask'}
                        id="saveforlater-permission-ask"
                        name="saveforlater-permission"
                        onChange={() => { setSaveForLaterPermission('ask'); markUnsaved(); }}
                        disabled={!saveForLaterEnabled}
                      />
                      <RadioButton
                        label={t('Always show the pop-up','Configurations')}
                        checked={saveForLaterPermission === 'always'}
                        id="saveforlater-permission-always"
                        name="saveforlater-permission"
                        onChange={() => { setSaveForLaterPermission('always'); markUnsaved(); }}
                        disabled={!saveForLaterEnabled}
                      />
                    </div>

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
                  buttonSize={buttonSize}
                  iconThickness={buttonType === 'icon' || buttonType === 'icon-text' ? iconThickness : undefined}
                  previewWidth={activeTab === 'wishlist' ? 610 : undefined}
                  drawerAlignment={drawerAlignment}
                  floatingButtonCornerRadius={floatingButtonCornerRadius}
                  textColor={textColor}
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
    body { overflow: auto !important; }
  }
`}</style>
        </>
      )}
    </Frame>
  );
}

