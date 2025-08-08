import { useAppBridge } from "@shopify/app-bridge-react";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../../components";
import {
  ActionList,
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  ColorPicker,
  Divider,
  FullscreenBar,
  Icon,
  InlineGrid,
  InlineStack,
  Label,
  Modal,
  Popover,
  Scrollable,
  Select,
  SkeletonBodyText,
  SkeletonDisplayText,
  Spinner,
  Text,
  TextField,
  Thumbnail,
  Toast,
} from "@shopify/polaris";
import {
  // CartMajor,
  ChevronLeftIcon,
  ImageIcon,
  EmailIcon,
  ImageMagicIcon,
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  ProductIcon,
  LayoutFooterIcon,
  DesktopIcon,
    MobileIcon,
  SettingsIcon,
} from "@shopify/polaris-icons";
import BrandingCustomizer from "../../components/emailCustomizer/BrandingCustomizer";
import NoneBackground from "../../assets/NoneBackground.jpg";
import TrackingButton from "../../components/emailCustomizer/TrackingButton";
import LineItemsCustomizer from "../../components/emailCustomizer/LineItemsCustomizer";
import FooterCustomizer from "../../components/emailCustomizer/FooterCustomizer";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import "@ckeditor/ckeditor5-basic-styles/theme/code.css";
import "@ckeditor/ckeditor5-editor-classic/theme/classiceditor.css";

import { getSessionToken } from "@shopify/app-bridge-utils";
import axios from "axios";
import tinycolor from "tinycolor2";
import RichTextEditor from "../../components/RichTextEditor";
import { Knob } from "../../components/Knob";
import { useLanguage } from "../../components";

export default function EmailTemplate() {
  const navigate = useNavigate();
  const appBridge = useAppBridge();
  const location = useLocation();
  const notificationId = location?.pathname?.split("/").pop();
  const emailSubjectDivRef = useRef(null);
  const contentDivRef = useRef(null);
  const { apiUrl } = useContext(AppContext);
  const { t } = useLanguage();
  const backBtnTranslated = useRef(false);
  // Function to get translated title based on API title (same as in Notification.jsx)
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

  // Function to get notification type based on API title (same as in Notification.jsx)
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

  // Loading states
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);



  // Toast notifications
  const [errorToast, setErrorToast] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Sidebar list and state tracking
  const initialList = [
    { title: t("Email Subject", "Notification Details"), visible: true },
    { title: t("Branding", "Notification Details"), visible: true },
    { title: t("Text", "Notification Details"), visible: true },
    { title: t("Action button", "Notification Details"), visible: true },
    // { title: "Line items", visible: true },
    { title: t("Footer", "Notification Details"), visible: true },
  ];
  const [sidebarList, setSidebarList] = useState(initialList);

  // Email and notification states
  const [emailData, setEmailData] = useState("");
  const [notificationList, setNotificationList] = useState([]);
  const [activeStatus, setActiveStatus] = useState(0);

  // View and setting states
  const [view, setView] = useState("Desktop");
  const [setting, setSetting] = useState("Section");

  // Popover states
  const [popoverActive, setPopoverActive] = useState(false);
  const [popoverActiveVariable, setPopoverActiveVariable] = useState(false);
  const [popoverActiveStatusDescriptionBackgroundColor, setPopoverActiveStatusDescriptionBackgroundColor] =
    useState(false);
  const [popoverActiveStatusDescriptionTextColor, setPopoverActiveStatusDescriptionTextColor] = useState(false);
  const [popoverActiveThemeSettingPrimaryTextColor, setPopoverActiveThemeSettingPrimaryTextColor] = useState(false);
  const [popoverActiveThemeSettingPrimaryColor, setPopoverActiveThemeSettingPrimaryColor] = useState(false);
  const [popoverActiveThemeSettingBackgroundColor, setPopoverActiveThemeSettingBackgroundColor] = useState(false);

  const customizedataInitialList = {
    emailSubject: "",
    brandingType: ["Store name"],
    textColor: "f7f7f7",
    imageWidth: "100",
    brandingBackgroundColor: "000000",
    paddingTop: "20",
    paddingBottom: "20",
    textDescriptionDetails: "",
    textDescriptionBackgroundColor: "",
    textDescriptionTextColor: "000000",
    textDescriptionAlignment: "Left",
    trackingButtonButtonText: "Track order status",
    trackingButtonLink: ["Tracking Link"],
    trackingButtonCustomizeLink: "",
    trackingButtonButtonWidth: "56",
    trackingButtonFontSize: "14",
    trackingButtonButtonColor: "000000",
    trackingButtonTextColor: "ffffff",
    trackingButtonAlignment: "center",
    trackingButtonBackgroundColor: "",
    lineItemTitleFontSize: "16",
    lineItemMainTitle: "",
    lineItemAmount: "",
    lineItemSubtitle: "",
    lineItemProductAmountHide: "0",
    lineItemCurrency: "",
    lineItemProductFontSize: "14",
    lineItemCurrencyAlignment: "Left",
    lineItemTitleColor: "",
    lineItemItemTextColor: "000000",
    lineItemBackgroundColor: "",
    footerUnsubscribeButton: "1",
    footerUnsubscribe: "Unsubscribe",
    footerUnsubscribeButtonColor: "005BD3",
    footerTextColor: "616161",
    footerBackgroundColor: "ffffff",
    footerDetails: "",
    footerDetailsAlignment: "Left",
    themeSettingFontFamily: "SF Pro Text",
    themeSettingPrimaryTextColor: "000000",
    themeSettingPrimaryColor: "007a5c",
    themeSettingBackgroundColor: "",
  };

  // Customize data state
  const [customizedata, setCustomizeData] = useState(customizedataInitialList);
  const [file, setFile] = useState("");

  // Color picker state
  const [colorPicker, setColorPicker] = useState({
    alpha: 1,
    hue: 120,
    brightness: 1,
    saturation: 1,
  });

  const toggleErrorMsgActive = useCallback(() => setErrorToast((errorToast) => !errorToast), []);
  const toggleSuccessMsgActive = useCallback(() => setSuccessToast((successToast) => !successToast), []);

  const toastErrorMsg = errorToast ? <Toast content={toastMsg} error onDismiss={toggleErrorMsgActive} /> : null;

  const toastSuccessMsg = successToast ? <Toast content={toastMsg} onDismiss={toggleSuccessMsgActive} /> : null;

  // useEffect(() => {
  //   if (selectedApp !== "Smarter_Returns") {
  //     setSelectedApp("Smarter_Returns");
  //   }
  // }, [selectedApp]);

  // Debug loading state changes
  // useEffect(() => {
  //   // console.log('Loading state changed to:', loading);
  // }, [loading]);

  // // Debug customized data changes
  // useEffect(() => {
  //   // console.log('Customized data changed:', customizedata);
  // }, [customizedata]);

  // // Debug sidebar list changes
  // useEffect(() => {
  //   console.log('Sidebar list changed:', sidebarList);
  // }, [sidebarList]);

  const fetchData = async () => {
    try {
      const sessionToken = await getSessionToken(appBridge);
      const response = await axios.get(`${apiUrl}subscription-notification-detail/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
       
      });
      const { subscription_notification_data } = response?.data;
      // console.log('Raw API response:', response?.data);
      // console.log('Subscription notification data:', subscription_notification_data);
      
      let data = {};
      try {
        data = JSON.parse(subscription_notification_data?.data || "{}");
      } catch (parseError) {
        // console.error("Error parsing notification data:", parseError);
        data = {};
      }
      // console.log('Parsed data:', data);
      // console.log('Customized data from API:', data?.customizedata);
      // console.log('Sidebar list from API:', data?.sidebarList);

      setEmailData(subscription_notification_data || "");
      // Fix file path handling - if logo exists, construct proper URL
      if (subscription_notification_data?.logo) {
        // If it's already a full URL, use it as is
        if (subscription_notification_data.logo.startsWith('http')) {
          setFile(subscription_notification_data.logo);
        } else {
          // If it's a relative path, construct the full URL using the app URL
          const appUrl = apiUrl.replace('/api/', '/');
          setFile(`${appUrl}${subscription_notification_data.logo}`);
        }
      } else {
        setFile("");
      }
      
      // Only update if we have data from API, otherwise keep current state
      if (data?.customizedata && Object.keys(data.customizedata).length > 0) {
        // console.log('Setting customized data from API:', data.customizedata);
        setCustomizeData(data.customizedata);
      } else {
        // console.log('No customized data from API, keeping current state');
      }
      
      setActiveStatus(subscription_notification_data?.active_status);
      
      if (data?.sidebarList && data.sidebarList.length > 0) {
        // console.log('Setting sidebar list from API:', data.sidebarList);
      setSidebarList(
          data.sidebarList.map((item) => ({
          ...item,
          visible: item.visible === "true",
          }))
      );
      } else {
        // console.log('No sidebar list from API, keeping current state');
      }

      // Don't call fetchNotificationsList here as it sets loading to false
      // We'll call it separately to maintain proper loading state
    } catch (error) {
      // console.error("Error fetching data:", error);
      setLoading(false); // Set loading to false on error
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchData();
      await fetchNotificationsList();
    };
    loadInitialData();
  }, [notificationId]);

  useEffect(() => {
    const interval = setInterval(() => {
      const backSpan = document.querySelector(
        '.Polaris-FullscreenBar__BackAction .Polaris-Text--bodyLg'
      );

      if (backSpan && !backBtnTranslated.current) {
        backSpan.textContent = t("Back", "Notification Details");
        backBtnTranslated.current = true;
      }

      // Reset if the button is removed (e.g. after discard/cancel)
      if (!backSpan) {
        backBtnTranslated.current = false;
      }
    }, 300);

    return () => clearInterval(interval);
  }, [t]);

  const fetchNotificationsList = async (id) => {
    try {
      // console.log('Fetching notifications list...');
      const sessionToken = await getSessionToken(appBridge);
      // console.log('Session token:', sessionToken);
      // console.log('API URL:', `${apiUrl}subscription-notifications`);
      // console.log('Shop param:', new URLSearchParams(window.location.search).get('shop'));
      
      const response = await axios.get(`${apiUrl}subscription-notifications`, {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
       
      });
      // console.log('Full response:', response);
      const { subscription_notifications } = response?.data;
      // console.log('Fetched notifications:', subscription_notifications);
      // console.log('Notification list length:', subscription_notifications?.length);
      setNotificationList(subscription_notifications || []);
    } catch (error) {
      // console.error("Error fetching notifications list:", error);
      // console.error("Error response:", error.response);
    } finally {
      setLoading(false);
    }
  };

  const handleSetting = useCallback((key) => setSetting(key), []);
  const handleView = useCallback((key) => setView(key), []);

  const handleToggleVisibility = (index) => {
    setSidebarList((prevList) =>
      prevList.map((item, idx) => (idx === index ? { ...item, visible: !item.visible } : item)),
    );
  };

  const colorPickerFunc = (newColor, field) => {
    setColorPicker(newColor);
    const rgbaColor = tinycolor({
      h: newColor.hue,
      s: newColor.saturation,
      v: newColor.brightness,
      a: newColor.alpha,
    }).toRgb();
    const hexColor = tinycolor(rgbaColor).toHex8();
    setCustomizeData((prevState) => ({
      ...prevState,
      [field]: hexColor,
    }));
  };

  const insertVariable = (variable, refName, key) => {
    const textField =
      refName === "emailSubjectDivRef"
        ? emailSubjectDivRef.current.querySelector("textarea")
        : contentDivRef.current.querySelector("textarea");
    if (!textField) return;

    const { selectionStart, selectionEnd, value } = textField;
    const newValue = `${value.substring(0, selectionStart)}${variable}${value.substring(selectionEnd)}`;
    handleChangeValue(key, newValue);
    togglePopoverActiveVariable()
  };

  const handleChangeValue = useCallback((field, value) => {
    const hsbColor = tinycolor(`#${value}`).toHsv();
    const formattedHSB = {
      hue: hsbColor.h,
      saturation: hsbColor.s,
      brightness: hsbColor.v,
      alpha: hsbColor.a,
    };
    setCustomizeData((prevState) => ({
      ...prevState,
      [field]: value,
    }));
    setColorPicker(formattedHSB);
  }, []);

  const handleDropZoneDrop = useCallback((_dropFiles, acceptedFiles, _rejectedFiles) => {
    // console.log('DropZone drop event:', { acceptedFiles, rejectedFiles: _rejectedFiles });
    if (acceptedFiles && acceptedFiles.length > 0) {
      // console.log('Setting file:', acceptedFiles[0]);
      setFile(acceptedFiles[0]);
    }
  }, []);

  const handleRemoveLogo = useCallback(() => {
    setFile("");
  }, []);

  const togglePopover = (popoverStateFunction) => () => popoverStateFunction((active) => !active);

  const togglePopoverActive = useCallback(() => {
    // console.log('Toggle popover clicked, current state:', popoverActive);
    setPopoverActive((popoverActive) => {
      const newState = !popoverActive;
      // console.log('New popover state:', newState);
      return newState;
    });
  }, [popoverActive]);

  const togglePopoverActiveVariable = useCallback(
    () => setPopoverActiveVariable((popoverActiveVariable) => !popoverActiveVariable),
    [],
  );

  const handleCheckboxChangeIsActive = async (currentStatus) => {
    const newStatus = currentStatus == 0 ? 1 : 0;
    setActiveStatus(newStatus);
    
    try {
      const sessionToken = await getSessionToken(appBridge);
      const response = await axios.post(`${apiUrl}subscription-notification-status-save/${notificationId}`, {
        active_status: newStatus
      }, {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
        
      });
      
      if (response?.data?.status === 'success') {
        setSuccessToast(true);
        setToastMsg(response?.data?.message);
      }
    } catch (error) {
      // console.error("Error updating status:", error);
      setErrorToast(true);
      setToastMsg("Error updating notification status");
      // Revert the status if the API call fails
      setActiveStatus(currentStatus);
    }
  };

  const handleSave = async (btnLoading) => {
    setBtnLoading((prev) => {
      let toggleId;
      if (prev[btnLoading]) {
        toggleId = { [btnLoading]: false };
      } else {
        toggleId = { [btnLoading]: true };
      }
      return { ...toggleId };
    });
    try {
      let sessionToken = await getSessionToken(appBridge);
      
      // Create FormData for proper file handling
      const formData = new FormData();
      formData.append('data', JSON.stringify({
          customizedata: customizedata,
          sidebarList: sidebarList,
      }));
      formData.append('active_status', activeStatus);
      
      // Handle file upload
      if (file && file instanceof File) {
        // console.log('Appending new file to FormData:', file.name, file.size, file.type);
        formData.append('logo', file);
      } else if (file && typeof file === 'string' && file.length > 0) {
        // console.log('Appending existing file path to FormData:', file);
        formData.append('old_logo', file);
      }

      // console.log('Saving payload:', formData);
      // console.log('Current customized data being saved:', customizedata);
      // console.log('Current sidebar list being saved:', sidebarList);

      const response = await axios.post(`${apiUrl}subscription-notification-save/${notificationId}`, formData, {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
      });
      
      setBtnLoading(false);
      setSuccessToast(true);
      setToastMsg(response?.data?.message);
      
      // console.log('Save response:', response?.data);
      
      // Refresh the data after successful save
      // console.log('Refreshing data after save...');
      setLoading(true); // Set loading to true before refreshing data
      await fetchData();
      await fetchNotificationsList();
    } catch (error) {
      // console.error("Error saving notification:", error);
      setBtnLoading(false);
      setErrorToast(true);
      setToastMsg("Error saving notification");
    }
  };

  return (
    <>
      <div style={{ minHeight: "80vh" }}>
        <FullscreenBar onAction={() => navigate(`/notification`)}>
          <Box
            paddingBlockStart={"300"}
            paddingBlockEnd={"300"}
            paddingInlineStart={"400"}
            paddingInlineEnd={"400"}
            width="100%"
          >
            <InlineGrid columns="1fr 1fr auto">
              {loading ? (
                <>
                  <InlineStack blockAlign="center" wrap={false} gap={"400"}>
                    <SkeletonBodyText lines={1} />
                  </InlineStack>
                  <InlineStack></InlineStack>
                </>
              ) : (
                <>
                  <InlineStack blockAlign="center" wrap={false} gap={"400"}>
                    <Text variant="headingMd">{getTranslatedTitle(emailData?.title)}</Text>
                  </InlineStack>
                  <InlineStack blockAlign="center" wrap={false} gap={"400"}>
              <Popover
                active={popoverActive}
                activator={
                  <Button
                    onClick={togglePopoverActive}
                    variant="tertiary"
                    size="medium"
                    textAlign="center"
                    disclosure
                  >
                    <Text as="span" variant="bodySm" fontWeight="medium">
                            {getTranslatedTitle(emailData?.title)}
                    </Text>
                  </Button>
                }
                autofocusTarget="first-node"
                onClose={togglePopoverActive}
              >
                  <ActionList
                    actionRole="menuitem"
                    sections={[
                      {
                        title: t("Alerts and Notifications", "Notifications"),
                        items: (() => {
                          const allItems = notificationList || [];
                          const externalItems = notificationList?.filter((item) => item?.email_type === "external") || [];
                          // If no external items, show all items
                          const itemsToShow = externalItems.length > 0 ? externalItems : allItems;
                          // console.log('Items to show:', itemsToShow);
                          
                          return itemsToShow.map((item) => {
                            // console.log('Processing item:', item);
                            return {
                              content: getTranslatedTitle(item?.title) || t('Untitled', 'Notification Details'),
                              active: emailData?.id === item?.id,
                              suffix: emailData?.id === item?.id && (
                                <span className="inline-flex items-center">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                    checked={true}
                                    readOnly
                                  />
                                </span>
                              ),
                            onAction: () => {
                              setLoading(true);
                              navigate(`/notification/${item?.id}`);
                              setPopoverActive((popoverActive) => !popoverActive);
                            },
                            };
                          });
                        })(),
                      },
                      {
                        title: t("Store owner notification", "Notification Details"),
                        items: (() => {
                          const internalItems = notificationList?.filter((item) => item?.email_type === "internal") || [];
                          // console.log('Internal items:', internalItems);
                          
                          // If no internal items, show empty array
                          return internalItems.map((item) => {
                            // console.log('Processing internal item:', item);
                            return {
                              content: getTranslatedTitle(item?.title) || t('Untitled', 'Notification Details'),
                              active: emailData?.id === item?.id,
                              suffix: emailData?.id === item?.id && (
                                <span className="inline-flex items-center">
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                    checked={true}
                                    readOnly
                                  />
                                </span>
                              ),
                            onAction: () => {
                              setLoading(true);
                              navigate(`/notification/${item?.id}`);
                              setPopoverActive((popoverActive) => !popoverActive);
                            },
                            };
                          });
                        })(),
                      },
                    ]}
                  />
              </Popover>
                  </InlineStack>
                </>
              )}
              <InlineStack blockAlign="center" gap={"200"}>
              <ButtonGroup variant="segmented">
                                  <Button
                    size="medium"
                    textAlign="center"
                    pressed={view === "Desktop"}
                    icon={DesktopIcon}
                    onClick={() => handleView("Desktop")}
                  />
                  <Button
                    size="medium"
                    textAlign="center"
                    pressed={view === "Mobile"}
                    icon={MobileIcon}
                    onClick={() => handleView("Mobile")}
                  />
              </ButtonGroup>
              <Knob
                selected={!!activeStatus}
                onClick={() => handleCheckboxChangeIsActive(activeStatus)}
                ariaLabel="Status"
              />

              <Button
                loading={btnLoading["Save"]}
                variant="primary"
                size="medium"
                textAlign="center"
                onClick={() => handleSave("Save")}
              >
                {t("Save", "Notification Details")}
              </Button>
              </InlineStack>
            </InlineGrid>
          </Box>
        </FullscreenBar>
        <div className="relative w-[100%]">
          <div className="flex flex-row justify-center mx-auto">
            {loading ? (
              <div className="border bg-white w-full max-w-[56px] shadow-inner flex flex-col p-3 gap-4">
                <SkeletonDisplayText size="small" />
                <SkeletonDisplayText size="small" />
            </div>
            ) : (
              <div className="border bg-white w-full max-w-[56px] shadow-inner justify-start items-start gap-2 inline-flex">
                <div className="inline-flex flex-col items-center self-stretch justify-start py-4 bg-white bg-opacity-0 grow shrink basis-0 customize-tab">
                  <BlockStack gap={"100"}>
                    <button
                  onClick={() => handleSetting("Section")}
                      className={`Polaris-Button Polaris-Button--pressable Polaris-Button--variantTertiary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter ${setting === "Section" && "active"
                      }`}
                      type="button"
                      aria-checked="true"
                    >
                      <Text as="span" variant="bodySm" fontWeight="medium">
                        <span className="Polaris-Icon Polaris-Icon--toneBase">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M3.5 6.25c0-1.519 1.231-2.75 2.75-2.75.414 0 .75.336.75.75s-.336.75-.75.75c-.69 0-1.25.56-1.25 1.25 0 .414-.336.75-.75.75s-.75-.336-.75-.75Z" />
                            <path
                              fillRule="evenodd"
                              d="M3.5 9.25c0-.966.784-1.75 1.75-1.75h9.5c.966 0 1.75.784 1.75 1.75v1.5c0 .966-.784 1.75-1.75 1.75h-9.5c-.966 0-1.75-.784-1.75-1.75v-1.5Zm1.75-.25c-.138 0-.25.112-.25.25v1.5c0 .138.112.25.25.25h9.5c.138 0 .25-.112.25-.25v-1.5c0-.138-.112-.25-.25-.25h-9.5Z"
                            />
                            <path d="M3.5 13.75c0 1.519 1.231 2.75 2.75 2.75.414 0 .75-.336.75-.75s-.336-.75-.75-.75c-.69 0-1.25-.56-1.25-1.25 0-.414-.336-.75-.75-.75s-.75.336-.75.75Z" />
                            <path d="M13.75 3.5c1.519 0 2.75 1.231 2.75 2.75 0 .414-.336.75-.75.75s-.75-.336-.75-.75c0-.69-.56-1.25-1.25-1.25-.414 0-.75-.336-.75-.75s.336-.75.75-.75Z" />
                            <path d="M13.75 16.5c1.519 0 2.75-1.231 2.75-2.75 0-.414-.336-.75-.75-.75s-.75.336-.75.75c0 .69-.56 1.25-1.25 1.25-.414 0-.75.336-.75.75s.336.75.75.75Z" />
                            <path d="M11.75 4.25c0 .414-.336.75-.75.75h-2c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h2c.414 0 .75.336.75.75Z" />
                            <path d="M11 16.5c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-2c-.414 0-.75.336-.75.75s.336.75.75.75h2Z" />
                          </svg>
                        </span>
                      </Text>
                    </button>
                    <button
                  onClick={() => handleSetting("Theme setting")}
                      className={`Polaris-Button Polaris-Button--pressable Polaris-Button--variantTertiary Polaris-Button--sizeMedium Polaris-Button--textAlignCenter ${setting === "Theme setting" && "active"
                      }`}
                      type="button"
                      aria-checked="true"
                    >
                      <Text as="span" variant="bodySm" fontWeight="medium">
                        <Icon tone="base" source={SettingsIcon} />
                      </Text>
                    </button>
                  </BlockStack>
              </div>
              </div>
            )}
            <div
              className="relative bg-white border scroll_custom overflow-y-auto"
              style={{ width: "100%", maxWidth: "320px", height: "calc(-58px + 100vh)" }}
            >
              {setting == "Section" ? (
                <BlockStack>
                  <Box padding={"400"}>
                    {loading ? (
                      <SkeletonDisplayText size="small" />
                    ) : (
              <Text as="h1" variant="headingMd">
                        {t("Section", "Notification Details")}
              </Text>
                    )}
                  </Box>
                  <Divider />
                  {loading ? (
                    <Box padding={"400"}>
                      <SkeletonBodyText lines={25} />
                    </Box>
                  ) : (
                    sidebarList?.filter(item => item?.title !== "Line items").map((item, index) => (
                      <React.Fragment key={index}>
                        <InlineStack blockAlign="center" wrap={false} gap={"100"}>
                        <div
                          onClick={() => handleSetting(item?.title)}
                          className="!justify-between !px-4 !py-3 !pr-3 !rounded-none Polaris-Button Polaris-Button--pressable Polaris-Button--variantTertiary Polaris-Button--textAlignLeft Polaris-Button--fullWidth"
                        >
                          <div>
                            <InlineStack blockAlign="center" wrap={false} gap={"100"}>
                              {t(item?.title, "Notification Details") === t("Text", "Notification Details") ? (
                                  <span className="Polaris-Icon Polaris-Icon--toneBase">
                                    <svg
                                      viewBox="0 0 20 20"
                                      className="Polaris-Icon__Svg"
                                      focusable="false"
                                      aria-hidden="true"
                                    >
                                      <path d="M7.25 6.5a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5h-5.5Z"></path>
                                      <path d="M6.5 10a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1-.75-.75Z"></path>
                                      <path d="M7.25 12a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z"></path>
                                      <path
                                        fillRule="evenodd"
                                        d="M7.25 3.5a3.75 3.75 0 0 0-3.75 3.75v5.5a3.75 3.75 0 0 0 3.75 3.75h5.5a3.75 3.75 0 0 0 3.75-3.75v-5.5a3.75 3.75 0 0 0-3.75-3.75h-5.5Zm-2.25 3.75a2.25 2.25 0 0 1 2.25-2.25h5.5a2.25 2.25 0 0 1 2.25 2.25v5.5a2.25 2.25 0 0 1-2.25 2.25h-5.5a2.25 2.25 0 0 1-2.25-2.25v-5.5Z"
                                      ></path>
                                    </svg>
                                  </span>
                              ) : t(item?.title, "Notification Details") === t("Email Subject", "Notification Details") ? (
                               
                                  <Icon source={EmailIcon} />
                              ) : t(item?.title, "Notification Details") === t("Branding", "Notification Details") ? (
                                
                                <Icon source={ImageIcon} />
                              ) : t(item?.title, "Notification Details") === t("Action button", "Notification Details") ? (
                               
                                  <Icon source={ImageMagicIcon} />
                              ) : /* item?.title === "Line items" ? (
                                
                                  <Icon source={ProductIcon} />
                              ) : */ t(item?.title, "Notification Details") === t("Footer", "Notification Details") ? (
                                
                                <Icon source={LayoutFooterIcon} />
                              ) : (
                                ""
                              )}
                              <Text as="h3" variant="bodyMd">
                                {t(item?.title, "Notification Details")}
                              </Text>
                            </InlineStack>
                          </div>
                          {t(item?.title, "Notification Details") !== t("Email Subject", "Notification Details") && (
                            <div className="flex items-center">
                              <Button
                                variant="tertiary"
                                size="medium"
                                textAlign="center"
                                // icon={item.visible ? ViewMajor : HideMinor}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleVisibility(index);
                                }}
                                ></Button>
                            </div>
                          )}
                        </div>
                        </InlineStack>
                        <Divider />
                      </React.Fragment>
                    ))
                  )}
                </BlockStack>
              ) : setting == "Theme setting" ? (
                <div className="h-full">
                  <Box padding={"400"}>
                    <Text as="h1" variant="headingMd">
                      {t("Theme settings", "Notification Details")}
                    </Text>
                  </Box>
                  <Divider />
                  <div
                    className="flex flex-col gap-4 p-4 pb-16 overflow-y-auto scroll_custom"
                    style={{ maxHeight: "calc(-116px + 100vh)" }}
                  >
                  <Text fontWeight="medium">{t('Global setting','Notification Details')}</Text>
                  <BlockStack gap={"300"}>
                    <Select
                      label={t("Font Family", "Notification Details")}
                      value={customizedata?.themeSettingFontFamily}
                      onChange={(value) => handleChangeValue("themeSettingFontFamily", value)}
                      options={[
                        { label: t("SF Pro Text", "Notification Details"), value: "SF Pro Text" },
                        { label: t("Arial", "Notification Details"), value: "Arial, Helvetica, sans-serif" },
                        { label: t("Courier New", "Notification Details"), value: "'Courier New', Courier, monospace" },
                        { label: t("Georgia", "Notification Details"), value: "Georgia, serif" },
                        {
                          label: t("Lucida Sans Unicode", "Notification Details"),
                          value: "'Lucida Sans Unicode', 'Lucida Grande', sans-serif",
                        },
                        { label: t("Tahoma", "Notification Details"), value: "Tahoma, Geneva, sans-serif" },
                        { label: t("Times New Roman", "Notification Details"), value: "'Times New Roman', Times, serif" },
                        { label: t("Trebuchet MS", "Notification Details"), value: "'Trebuchet MS', Helvetica, sans-serif" },
                        { label: t("Verdana", "Notification Details"), value: "Verdana, Geneva, sans-serif" },
                      ]}
                    />
                      {/*{colorField(*/}
                      {/*  "Primary text color",*/}
                      {/*  "themeSettingPrimaryTextColor",*/}
                      {/*  customizedata?.themeSettingPrimaryTextColor,*/}
                      {/*  handleChangeValue,*/}
                      {/*  popoverActiveThemeSettingPrimaryTextColor,*/}
                      {/*  togglePopover(setPopoverActiveThemeSettingPrimaryTextColor),*/}
                      {/*  colorPickerFunc,*/}
                      {/*  colorPicker,*/}
                      {/*)}*/}
                      {/*{colorField(*/}
                      {/*  "Primary color",*/}
                      {/*  "themeSettingPrimaryColor",*/}
                      {/*  customizedata?.themeSettingPrimaryColor,*/}
                      {/*  handleChangeValue,*/}
                      {/*  popoverActiveThemeSettingPrimaryColor,*/}
                      {/*  togglePopover(setPopoverActiveThemeSettingPrimaryColor),*/}
                      {/*  colorPickerFunc,*/}
                      {/*  colorPicker,*/}
                      {/*)}*/}
                      {/*{colorField(*/}
                      {/*  "Background color",*/}
                      {/*  "themeSettingBackgroundColor",*/}
                      {/*  customizedata?.themeSettingBackgroundColor,*/}
                      {/*  handleChangeValue,*/}
                      {/*  popoverActiveThemeSettingBackgroundColor,*/}
                      {/*  togglePopover(setPopoverActiveThemeSettingBackgroundColor),*/}
                      {/*  colorPickerFunc,*/}
                      {/*  colorPicker,*/}
                      {/*)}*/}
                  </BlockStack>
                </div>
                </div>
              ) : setting == "Email Subject" ? (
                <div className="h-full">
                  <Box padding={"400"}>
                    <InlineStack blockAlign="center" align="start" gap={"300"}>
                    <Button
                      onClick={() => setSetting("Section")}
                      size="medium"
                      variant="tertiary"
                      textAlign="center"
                        icon={ChevronLeftIcon}
                      />
                      <Text as="h1" variant="headingMd">
                        {setting}
                      </Text>
                    </InlineStack>
                  </Box>
                  <Divider />
                  <div
                    className="flex flex-col gap-4 p-4 pb-16 overflow-y-auto scroll_custom"
                    style={{ maxHeight: "calc(-116px + 100vh)" }}
                  >
                    <div ref={emailSubjectDivRef}>
                      <TextField
                        label={t("Email Subject", "Notification Details")}
                        labelAction={{
                          content: (
                            <Popover
                              active={popoverActiveVariable}
                              activator={
                                <Button
                                  onClick={togglePopoverActiveVariable}
                                  variant="plain"
                                  size="medium"
                                  textAlign="center"
                                  disclosure
                                >
                                  {t("Insert variables", "Notification Details")}
                    </Button>
                              }
                              autofocusTarget="first-node"
                              onClose={togglePopoverActiveVariable}
                            >
                              <Popover.Pane>
                                <ActionList
                                  actionRole="menuitem"
                                  sections={[
                                    // {
                                    //   title: "Order info",
                                    //   items: [
                                    //     {
                                    //       content: "Order number",
                                    //       onAction: () =>
                                    //         insertVariable("{ORDER_NUMBER}", "emailSubjectDivRef", "emailSubject"),
                                    //     },
                                    //   ],
                                    // },
                                    // {
                                    //   title: "Return info",
                                    //   items: [
                                    //     {
                                    //       content: "RMA ID",
                                    //       onAction: () =>
                                    //         insertVariable("{RMA_ID}", "emailSubjectDivRef", "emailSubject"),
                                    //     },
                                    //     // {
                                    //     //   content: "Return instructions",
                                    //     //   onAction: () =>
                                    //     //     insertVariable(
                                    //     //       "{SHIPPING_INSTRUCTIONS}",
                                    //     //       "emailSubjectDivRef",
                                    //     //       "emailSubject",
                                    //     //     ),
                                    //     // },
                                    //     {
                                    //       content: "Rejection reason",
                                    //       onAction: () =>
                                    //         insertVariable("{REJECT_REASON}", "emailSubjectDivRef", "emailSubject"),
                                    //     },
                                    //     {
                                    //       content: "View request",
                                    //       onAction: () =>
                                    //         insertVariable("{VIEW_REQUEST}", "emailSubjectDivRef", "emailSubject"),
                                    //     },
                                    //   ],
                                    // },
                                    {
                                      title: "Store info",
                                      items: [
                                        {
                                          content: "Store name",
                                          onAction: () =>
                                            insertVariable("{STORE_NAME}", "emailSubjectDivRef", "emailSubject"),
                                        },
                                      ],
                                    },
                                  ]}
                                />
                              </Popover.Pane>
                            </Popover>
                          ),
                        }}
                        value={customizedata?.emailSubject || ""}
                        onChange={(value) => handleChangeValue("emailSubject", value)}
                        multiline={4}
                        maxLength={200}
                        showCharacterCount
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </div>
              ) : setting == "Branding" ? (
                <BrandingCustomizer
                  setting={setting}
                  handleSetting={handleSetting}
                  customizedata={customizedata}
                  file={file}
                  handleChangeValue={handleChangeValue}
                  colorPicker={colorPicker}
                  colorPickerFunc={colorPickerFunc}
                  handleDropZoneDrop={handleDropZoneDrop}
                  handleRemoveLogo={handleRemoveLogo}
                />
              ) : setting == "Text" ? (
                <div className="h-full Status_description">
                  <Box padding={"400"}>
                    <InlineStack blockAlign="center" align="start" gap={"300"}>
                      <Button
                        onClick={() => handleSetting("Section")}
                        size="medium"
                        variant="tertiary"
                        textAlign="center"
                        icon={ChevronLeftIcon}
                      />
                    <Text as="h1" variant="headingMd">
                      {setting}
                    </Text>
                    </InlineStack>
                  </Box>
                  <Divider />
                  <div
                    className="flex flex-col gap-4 p-4 pb-16 overflow-y-auto scroll_custom"
                    style={{ maxHeight: "calc(-116px + 100vh)" }}
                  >
                    <BlockStack gap={"300"}>
                      {/* Regular TextField - commented out since we now have RichTextEditor
                      <div ref={contentDivRef}>
                        <TextField
                          label="Content"
                          labelAction={{
                            content: (
                              <Popover
                                active={popoverActiveVariable}
                                activator={
                                  <Button
                                    onClick={togglePopoverActiveVariable}
                                    variant="plain"
                                    size="medium"
                                    textAlign="center"
                                    disclosure
                                  >
                                    Insert variables
                                  </Button>
                                }
                                autofocusTarget="first-node"
                                onClose={togglePopoverActiveVariable}
                              >
                                <Popover.Pane>
                                  <ActionList
                                    actionRole="menuitem"
                                    sections={[
                                      {
                                        title: "Order info",
                                        items: [
                                          {
                                            content: "Order number",
                                            onAction: () =>
                                              insertVariable(
                                                "{ORDER_NUMBER}",
                                                "contentDivRef",
                                                "textDescriptionDetails",
                                              ),
                                          },
                                        ],
                                      },
                                      {
                                        title: "Return info",
                                        items: [
                                          {
                                            content: "Actual refund amount",
                                            onAction: () =>
                                              insertVariable("{ACTUAL_REFUND_AMOUNT}", "contentDivRef", "textDescriptionDetails"),
                                          },
                                          {
                                            content: "RMA ID",
                                            onAction: () =>
                                              insertVariable("{RMA_ID}", "contentDivRef", "textDescriptionDetails"),
                                          },
                                          {
                                            content: "RMA Status",
                                            onAction: () =>
                                              insertVariable("{RMA_STATUS}", "contentDivRef", "textDescriptionDetails"),
                                          },
                                          // {
                                          //   content: "Return instructions",
                                          //   onAction: () =>
                                          //     insertVariable(
                                          //       "{SHIPPING_INSTRUCTIONS}",
                                          //       "contentDivRef",
                                          //       "textDescriptionDetails",
                                          //     ),
                                          // },
                                          {
                                            content: "Rejection reason",
                                            onAction: () =>
                                              insertVariable(
                                                "{REJECT_REASON}",
                                                "contentDivRef",
                                                "textDescriptionDetails",
                                              ),
                                          },
                                          {
                                            content: "Shipping Status",
                                            onAction: () =>
                                              insertVariable(
                                                "{SHIPPING_STATUS}",
                                                "contentDivRef",
                                                "textDescriptionDetails",
                                              ),
                                          },
                                          {
                                            content: "Refund Status",
                                            onAction: () =>
                                              insertVariable(
                                                "{REFUND_STATUS}",
                                                "contentDivRef",
                                                "textDescriptionDetails",
                                              ),
                                          },
                                          // {
                                          //   content: "Edit reason",
                                          //   onAction: () =>
                                          //     insertVariable(
                                          //       "{EDIT_REASON}",
                                          //       "contentDivRef",
                                          //       "textDescriptionDetails",
                                          //     ),
                                          // },
                                          // {
                                          //   content: "Received item list",
                                          //   onAction: () =>
                                          //     insertVariable(
                                          //       "{RECEIVED_ITEM_LIST}",
                                          //       "contentDivRef",
                                          //       "textDescriptionDetails",
                                          //     ),
                                          // },
                                          {
                                            content: "View request",
                                            onAction: () =>
                                              insertVariable(
                                                "{VIEW_REQUEST}",
                                                "contentDivRef",
                                                "textDescriptionDetails",
                                              ),
                                          },
                                          // {
                                          //   content: "Gift return from",
                                          //   onAction: () =>
                                          //     insertVariable(
                                          //       "{GIFT_RETURN_FORM}",
                                          //       "contentDivRef",
                                          //       "textDescriptionDetails",
                                          //     ),
                                          // },
                                        ],
                                      },
                                      {
                                        title: "Store info",
                                        items: [
                                          {
                                            content: "Store name",
                                            onAction: () =>
                                              insertVariable("{STORE_NAME}", "contentDivRef", "textDescriptionDetails"),
                                          },
                                          {
                                            content: "Contact us",
                                            onAction: () =>
                                              insertVariable("{CONTACT_US}", "contentDivRef", "textDescriptionDetails"),
                                          },
                                        ],
                                      },
                                    ]}
                                  />
                                </Popover.Pane>
                              </Popover>
                            ),
                          }}
                          value={customizedata?.textDescriptionDetails || ""}
                          onChange={(value) => handleChangeValue("textDescriptionDetails", value)}
                          multiline={4}
                          autoComplete="off"
                        />
                  </div>
                      */}
                      <BlockStack gap={"100"}>
                        <InlineStack blockAlign="center" align="space-between">
                          <Label>{t("Content", "Notification Details")}</Label>
                          <Popover
                            active={popoverActiveVariable}
                            activator={
                              <Button
                                onClick={togglePopoverActiveVariable}
                                variant="plain"
                                size="medium"
                                textAlign="center"
                                disclosure
                              >
                                {t("Insert variables", "Notification Details")}
                              </Button>
                            }
                            autofocusTarget="first-node"
                            onClose={togglePopoverActiveVariable}
                          >
                            <Popover.Pane>
                              <ActionList
                                actionRole="menuitem"
                                sections={[
                                  {
                                    title: "Customer info",
                                    items: [
                                      {
                                        content: "Customer first name",
                                        onAction: () => {
                                          const variable = "{customer_first_name}";
                                          const currentContent = customizedata?.textDescriptionDetails || "";
                                          handleChangeValue("textDescriptionDetails", currentContent + variable);
                                          togglePopoverActiveVariable();
                                        },
                                      },
                                      {
                                        content: "Customer last name",
                                        onAction: () => {
                                          const variable = "{customer_last_name}";
                                          const currentContent = customizedata?.textDescriptionDetails || "";
                                          handleChangeValue("textDescriptionDetails", currentContent + variable);
                                          togglePopoverActiveVariable();
                                        },
                                      },
                                      {
                                        content: "Customer email",
                                        onAction: () => {
                                          const variable = "{customer_email}";
                                          const currentContent = customizedata?.textDescriptionDetails || "";
                                          handleChangeValue("textDescriptionDetails", currentContent + variable);
                                          togglePopoverActiveVariable();
                                        },
                                      },
                                    ],
                                  },
                                  {
                                    title: "Product info",
                                    items: [
                                      {
                                        content: "Product name",
                                        onAction: () => {
                                          const variable = "{product_name}";
                                          const currentContent = customizedata?.textDescriptionDetails || "";
                                          handleChangeValue("textDescriptionDetails", currentContent + variable);
                                          togglePopoverActiveVariable();
                                        },
                                      },
                                      {
                                        content: "Product price",
                                        onAction: () => {
                                          const variable = "{product_price}";
                                          const currentContent = customizedata?.textDescriptionDetails || "";
                                          handleChangeValue("textDescriptionDetails", currentContent + variable);
                                          togglePopoverActiveVariable();
                                        },
                                      },
                                      {
                                        content: "Product URL",
                                        onAction: () => {
                                          const variable = "{product_url}";
                                          const currentContent = customizedata?.textDescriptionDetails || "";
                                          handleChangeValue("textDescriptionDetails", currentContent + variable);
                                          togglePopoverActiveVariable();
                                        },
                                      },
                                    ],
                                  },
                                  {
                                    title: "Store info",
                                    items: [
                                      {
                                        content: "Store name",
                                        onAction: () => {
                                          const variable = "{shop_name}";
                                          const currentContent = customizedata?.textDescriptionDetails || "";
                                          handleChangeValue("textDescriptionDetails", currentContent + variable);
                                          togglePopoverActiveVariable();
                                        },
                                      },
                                      {
                                        content: "Store URL",
                                        onAction: () => {
                                          const variable = "{shop_url}";
                                          const currentContent = customizedata?.textDescriptionDetails || "";
                                          handleChangeValue("textDescriptionDetails", currentContent + variable);
                                          togglePopoverActiveVariable();
                                        },
                                      },
                                    ],
                                  },
                                  {
                                    title: "Wishlist info",
                                    items: [
                                      {
                                        content: "Wishlist count",
                                        onAction: () => {
                                          const variable = "{wishlist_count}";
                                          const currentContent = customizedata?.textDescriptionDetails || "";
                                          handleChangeValue("textDescriptionDetails", currentContent + variable);
                                          togglePopoverActiveVariable();
                                        },
                                      },
                                      {
                                        content: "Wishlist link",
                                        onAction: () => {
                                          const variable = "{wishlist_link}";
                                          const currentContent = customizedata?.textDescriptionDetails || "";
                                          handleChangeValue("textDescriptionDetails", currentContent + variable);
                                          togglePopoverActiveVariable();
                                        },
                                      },
                                    ],
                                  },
                                ]}
                              />
                            </Popover.Pane>
                          </Popover>
                        </InlineStack>
                        <CKEditor
                          editor={ClassicEditor}
                          config={{
                            toolbar: {
                              items: [
                                "heading",
                                "|",
                                "bold",
                                "italic",
                                "strikethrough",
                                "code",
                                "|",
                                "alignment",
                                "|",
                                "bulletedList",
                                "numberedList",
                                "outdent",
                                "indent",
                              ],
                            },
                            shouldNotGroupWhenFull: true,
                          }}
                          data={customizedata?.textDescriptionDetails || ""}
                          onChange={(event, editor) => {
                            const data = editor.getData();
                            handleChangeValue("textDescriptionDetails", data);
                          }}
                          onReady={(editor) => {
                            // You can store the "editor" and use when it is needed.
                            // console.log("Editor is ready to use!", editor);
                          }}
                          onError={(error, { willEditorRestart }) => {
                            // console.error("Editor error:", error);
                            if (willEditorRestart) {
                              // console.warn("Editor will restart");
                            }
                          }}
                        />
                      </BlockStack>
                      <InlineStack blockAlign="center" align="space-between">
                        <Label>{t("Text Alignment", "Notification Details")}</Label>
                        <ButtonGroup variant="segmented">
                          <Button
                            size="medium"
                            textAlign="center"
                            onClick={() => handleChangeValue("textDescriptionAlignment", "Left")}
                            pressed={customizedata?.textDescriptionAlignment === "Left"}
                            icon={TextAlignLeftIcon}
                          />
                          <Button
                            size="medium"
                            textAlign="center"
                            onClick={() => handleChangeValue("textDescriptionAlignment", "Center")}
                            pressed={customizedata?.textDescriptionAlignment === "Center"}
                            icon={TextAlignCenterIcon}
                          />
                          <Button
                            size="medium"
                            textAlign="center"
                            onClick={() => handleChangeValue("textDescriptionAlignment", "Right")}
                            pressed={customizedata?.textDescriptionAlignment === "Right"}
                            icon={TextAlignRightIcon}
                          />
                        </ButtonGroup>
                      </InlineStack>
                      {colorField(
                        t("Background Color", "Notification Details"),
                        "textDescriptionBackgroundColor",
                        customizedata?.textDescriptionBackgroundColor,
                        handleChangeValue,
                        popoverActiveStatusDescriptionBackgroundColor,
                        togglePopover(setPopoverActiveStatusDescriptionBackgroundColor),
                        colorPickerFunc,
                        colorPicker,
                      )}
                      {colorField(
                        t("Item Text Color", "Notification Details"),
                        "textDescriptionTextColor",
                        customizedata?.textDescriptionTextColor,
                        handleChangeValue,
                        popoverActiveStatusDescriptionTextColor,
                        togglePopover(setPopoverActiveStatusDescriptionTextColor),
                        colorPickerFunc,
                        colorPicker,
                      )}
                    </BlockStack>
                  </div>
                </div>
              ) : setting == "Action button" ? (
                <TrackingButton
                  setting={setting}
                  handleSetting={handleSetting}
                  customizedata={customizedata}
                  handleChangeValue={handleChangeValue}
                  colorPicker={colorPicker}
                  colorPickerFunc={colorPickerFunc}
                />
              ) : /* setting == "Line items" ? (
                <LineItemsCustomizer
                  setting={setting}
                  handleSetting={handleSetting}
                  customizedata={customizedata}
                  handleChangeValue={handleChangeValue}
                  colorPicker={colorPicker}
                  colorPickerFunc={colorPickerFunc}
                />
              ) : */ setting == "Footer" ? (
                <FooterCustomizer
                  setting={setting}
                  handleSetting={handleSetting}
                  customizedata={customizedata}
                  handleChangeValue={handleChangeValue}
                  colorPicker={colorPicker}
                  colorPickerFunc={colorPickerFunc}
                />
              ) : (
                ""
              )}
          </div>

            <div
              className="bg-white overflow-y-scroll email_customizer"
              style={{
              width: "100%",
                background: "rgb(246, 246, 247)",
                height: "calc(-58px + 100vh)",
              }}
            >
              <div className="flex items-stretch justify-center">
                <div
                  className="w-full overflow-hidden"
                    style={{ 
                    maxWidth: view === "Desktop" ? "650px" : "360px",
                  }}
                >
                  <div className="h-full py-4">
                    <div className="h-full shadow-border scroll_custom">
                      <div
                        style={{
                          backgroundColor:
                            customizedata?.themeSettingBackgroundColor !== ""
                              ? `#${customizedata?.themeSettingBackgroundColor}`
                              : "white",
                          color: `#${customizedata?.themeSettingPrimaryTextColor}`,
                          textDecoration: "none",
                          fontFamily: customizedata?.themeSettingFontFamily,
                        }}
                      >
                        {loading ? (
                          <Box padding={"400"}>
                            <BlockStack gap={"400"}>
                              <SkeletonBodyText />
                              <SkeletonBodyText />
                              <SkeletonBodyText />
                              <SkeletonBodyText />
                              <SkeletonBodyText />
                              <SkeletonBodyText />
                              <SkeletonBodyText />
                              <SkeletonBodyText />
                              <SkeletonBodyText lines={2} />
                            </BlockStack>
                          </Box>
                        ) : (
                          <>
                            {/* Always show content for now to debug */}
                            {true && (
                              <div
                                onClick={() => handleSetting("Branding")}
                                className="relative cursor-pointer"
                                style={{
                                  color: `#${customizedata?.themeSettingPrimaryTextColor}`,
                                }}
                              >
                                <div className="section-content section-border">
                                  <div style={{ minHeight: "20px", display: "block" }}>
                                    <div
                                      style={{
                                        paddingTop: `${customizedata?.paddingTop}px`,
                                        paddingBottom: `${customizedata?.paddingBottom}px`,
                                        fontFamily: customizedata?.themeSettingFontFamily,
                                        backgroundColor: `#${customizedata?.brandingBackgroundColor}`,
                                        color: `#${customizedata?.textColor}`,
                                        display: customizedata?.brandingType?.includes("Store name") ? "block" : "none",
                                      }}
                                    >
                                      <h2 style={{ textAlign: "center", fontSize: "1.5em" }}>
                                        <strong>{`{store_name}`}</strong>
                                      </h2>
                  </div>
                                    <div
                                      style={{
                                        paddingTop: `${customizedata?.paddingTop}px`,
                                        paddingBottom: `${customizedata?.paddingBottom}px`,
                                        backgroundColor: `#${customizedata?.brandingBackgroundColor}`,
                                        display: customizedata?.brandingType?.includes("Store name") ? "none" : "block",
                                      }}
                                    >
                                      {file && typeof file === "string" && file.length > 0 ? (
                                        <img
                                          src={file}
                                          alt="brand"
                                          style={{
                                            width: `${customizedata?.imageWidth || 100}%`,
                                            margin: "0px auto",
                                          }}
                                          onError={(e) => {
                                            // console.error('Failed to load image:', file);
                                            e.target.style.display = 'none';
                                          }}
                                        />
                                      ) : file instanceof Blob ? (
                                        <img
                                          src={window.URL.createObjectURL(file)}
                                          alt="brand"
                                          style={{
                                            width: `${customizedata?.imageWidth || 100}%`,
                                            margin: "0px auto",
                                          }}
                                        />
                                      ) : (
                                        <div style={{ 
                                          width: `${customizedata?.imageWidth || 100}%`,
                                          height: '100px',
                                          backgroundColor: '#f0f0f0',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          margin: "0px auto",
                                          border: '1px dashed #ccc'
                                        }}>
                                          <span style={{ color: '#999' }}>{t("No logo uploaded", "Notification Details")}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            {true && (
                              <div
                                onClick={() => handleSetting("Text")}
                                className="relative cursor-pointer"
                    style={{ 
                                  color: `#${customizedata?.themeSettingPrimaryTextColor}`,
                                }}
                              >
                                <div className="section-content section-border">
                                  <div className="block">
                                    <div
                                      style={{
                                        color: `#${customizedata?.textDescriptionTextColor}`,
                                        fontFamily: customizedata?.themeSettingFontFamily,
                                        backgroundColor: `#${customizedata?.textDescriptionBackgroundColor}`,
                                      }}
                                    >
                                      <div className="ql-snow">
                                        <div
                                          className="ql-editor"
                                          style={{
                                            textAlign: customizedata?.textDescriptionAlignment?.toLowerCase() || "left"
                                          }}
                                          dangerouslySetInnerHTML={{ __html: customizedata?.textDescriptionDetails }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                  </div>
                )}
                            {true && (
                  <div 
                                onClick={() => handleSetting("Action button")}
                                className="relative cursor-pointer"
                    style={{ 
                                  color: `#${customizedata?.themeSettingPrimaryTextColor}`,
                                }}
                              >
                                <div className="section-content">
                                  <div
                                    className="px-8 py-4"
                                    style={{
                                      textAlign: customizedata?.trackingButtonAlignment?.toLowerCase(),
                                      display: "block",
                                      backgroundColor: `#${customizedata?.trackingButtonBackgroundColor}`,
                                    }}
                                  >
                                    <button
                                      className="px-10 py-4 rounded-md"
                                      style={{
                                        backgroundColor: `#${customizedata?.trackingButtonButtonColor}`,
                                        color: `#${customizedata?.trackingButtonTextColor}`,
                                        fontFamily: customizedata?.themeSettingFontFamily,
                                        fontSize: `${customizedata?.trackingButtonFontSize}px`,
                                        width: `${customizedata?.trackingButtonButtonWidth}%`,
                                      }}
                                    >
                                      {customizedata?.trackingButtonButtonText}
                                    </button>
                                  </div>
                                </div>
                  </div>
                )}

                                                        {/* Line items section - commented out
                            {true && (
                              <div
                                onClick={() => handleSetting("Line items")}
                                className="relative cursor-pointer"
                                style={{
                                  color: `#${customizedata?.themeSettingPrimaryTextColor}`,
                                }}
                              >
                                <div className="section-content section-border">
                                  <div
                                    className="relative"
                                    style={{
                                      fontFamily: customizedata?.themeSettingFontFamily,
                                      backgroundColor: `#${customizedata?.lineItemBackgroundColor}`,
                                    }}
                                  >
                                    <Divider />
                                    <div className="px-5 py-2.5">
                                      <div
                                        className="flex flex-row justify-between"
                                        style={{
                                          color: `#${customizedata?.lineItemTitleColor}`,
                                          fontSize: `${customizedata?.lineItemTitleFontSize}px`,
                                        }}
                                      >
                                        <div className="font-bold">
                                          {customizedata?.lineItemMainTitle || "What's inside"}
                                        </div>
                                        {customizedata?.lineItemCurrencyAlignment === "Right" ? (
                                          <div className="font-bold">
                                            {customizedata?.lineItemProductAmountHide == 0
                                              ? `${customizedata?.lineItemAmount || "Amount"}(77.8 ${customizedata?.lineItemCurrency || "PKR"
                                              }) . ${customizedata?.lineItemSubtitle || "Items"}(2)`
                                              : `${customizedata?.lineItemSubtitle || "Items"}(2)`}
                                          </div>
                                        ) : (
                                          <div className="font-bold">
                                            {customizedata?.lineItemProductAmountHide == 0
                                              ? `${customizedata?.lineItemAmount || "Amount"}(${customizedata?.lineItemCurrency || "PKR"
                                              } 77.8) . ${customizedata?.lineItemSubtitle || "Items"}(2)`
                                              : `${customizedata?.lineItemSubtitle || "Items"}(2)`}
                                          </div>
                                        )}
                                      </div>
                                      <div
                                        className="grid grid-cols-1 pt-5 pb-2.5"
                                        style={{
                                          fontSize: `${customizedata?.lineItemProductFontSize}px`,
                                        }}
                                      >
                                        <div className="flex flex-row pb-4">
                                          <img
                                            src="https://fe.trackingmore.net/images/bag.png"
                                            alt=""
                                            width="60"
                                            height="60"
                                          />
                                          <div className="flex flex-col pl-4 text-left">
                                            <div
                                              style={{
                                                color: `#${customizedata?.lineItemItemTextColor}`,
                                              }}
                                            >
                                              {t("Product title", "Notification Details")}
                                            </div>
                                            {customizedata?.lineItemProductAmountHide == "0" ? (
                                              <div
                                                style={{
                                                  color: `#${customizedata?.lineItemItemTextColor}`,
                                                }}
                                              >
                                                {customizedata?.lineItemCurrencyAlignment === "Right"
                                                  ? `38.9 ${customizedata?.lineItemCurrency || "PKR"}`
                                                  : `${customizedata?.lineItemCurrency || "PKR"} 77.8`}
                                              </div>
                                            ) : (
                                              <div
                                                style={{
                                                  color: `#${customizedata?.lineItemItemTextColor}`,
                                                }}
                                              >
                                                {t("SKU", "Notification Details")}
                                              </div>
                                            )}
                                            {customizedata?.lineItemProductAmountHide == "0" ? (
                                              <div
                                                style={{
                                                  color: `#${customizedata?.lineItemItemTextColor}`,
                                                }}
                                              >
                                                {customizedata?.lineItemCurrencyAlignment === "Right"
                                                  ? `-5.00 ${customizedata?.lineItemCurrency || "PKR"}`
                                                  : `-${customizedata?.lineItemCurrency || "PKR"} 77.8`}
                                              </div>
                                            ) : (
                                              <div
                                                style={{
                                                  color: `#${customizedata?.lineItemItemTextColor}`,
                                                }}
                                              >
                                                {t("x 1", "Notification Details")}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            */}
                            {true && (
                              <div
                    onClick={() => handleSetting("Footer")}
                                className="relative cursor-pointer"
                                style={{
                                  color: `#${customizedata?.themeSettingPrimaryTextColor}`,
                                }}
                              >
                                <div className="section-content">
                                  <Divider />
                                  <div
                                    className="flex-col items-center p-5"
                                    style={{
                                      color: `#${customizedata?.footerTextColor}`,
                                      backgroundColor: `#${customizedata?.footerBackgroundColor}`,
                                      fontFamily: customizedata?.themeSettingFontFamily,
                                      display: "flex",
                                      lineHeight: "20px",
                                    }}
                                  >
                                    <div className="w-full">
                                      <div
                                        className="py-[11.7px] px-[7.8px]"
                                        style={{
                                          textAlign: customizedata?.footerDetailsAlignment?.toLowerCase(),
                                        }}
                                        dangerouslySetInnerHTML={{ __html: customizedata?.footerDetails }}
                                      />
                  </div>
                                    {/* Unsubscribe button - commented out
                                    {customizedata?.footerUnsubscribeButton == "0" && (
                                      <button className="Polaris-Button Polaris-Button--variantPlain" style={{}}>
                                        {customizedata?.footerUnsubscribe}
                                      </button>
                                    )}
                                    */}
                                  </div>
                                </div>
                              </div>
                            )}


                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toastErrorMsg}
      {toastSuccessMsg}
    </>
  );
}

const colorField = (
  label,
  key,
  value,
  handleChangeValue,
  popoverActiveTextColor,
  togglePopoverActiveTextColor,
  colorPickerFunc,
  colorPicker,
) => {
  return (
    <TextField
      label={label}
      value={value || ""}
      onChange={(value) => handleChangeValue(key, value)}
      autoComplete="off"
      prefix="#"
      connectedLeft={
        <Popover
          active={popoverActiveTextColor}
          activator={
            <button
              onClick={togglePopoverActiveTextColor}
              type="button"
              tabIndex="0"
              aria-controls=":ref:"
              aria-owns=":ref:"
              aria-expanded="false"
              data-state="closed"
              style={{
                borderRadius: "3px",
                border: "0px",
                padding: "0px",
                margin: "0px",
                display: "flex",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <div
                style={{
                  borderRadius: "3px",
                  height: "2rem",
                  width: "2rem",
                  background:
                    "repeating-conic-gradient(rgb(255, 255, 255) 0deg, rgb(255, 255, 255) 25%, rgb(246, 246, 247) 0deg, rgb(246, 246, 247) 50%) 50% center / 0.5rem 0.5rem",
                  boxShadow: "rgba(0, 0, 0, 0.19) 0px 0px 0px 1px inset",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    borderRadius: "inherit",
                    boxShadow: "inherit",
                    height: "100%",
                    width: "100%",
                    background: `#${value}`,
                  }}
                ></div>
              </div>
            </button>
          }
          autofocusTarget="first-node"
          onClose={togglePopoverActiveTextColor}
        >
          <ColorPicker onChange={(newColor) => colorPickerFunc(newColor, key)} color={colorPicker} />
        </Popover>
      }
    />
  );
};
