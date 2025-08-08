import React from "react";
import {
  BlockStack,
  Box,
  Button,
  ColorPicker,
  InlineStack,
  Label,
  Popover,
  Select,
  Text,
  TextField,
  Thumbnail,
} from "@shopify/polaris";
// import { SettingsMajor } from "@shopify/polaris-icons";

const BrandingCustomizer = ({
  customizedata,
  handleChangeValue,
  popoverActiveLogoColor,
  togglePopoverActiveLogoColor,
  colorPickerFunc,
  colorPicker,
  logoFile,
  handleLogoChange,
  logoAlignment,
  handleLogoAlignmentChange,
  logoWidth,
  handleLogoWidthChange,
  logoHeight,
  handleLogoHeightChange,
}) => {
  const logoAlignmentOptions = [
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" },
  ];

  return (
    <BlockStack gap="400">
      <Text variant="headingMd" as="h3">
        Branding Settings
      </Text>
      
      {/* Logo Upload */}
      <BlockStack gap="200">
        <Label>Logo</Label>
        <InlineStack gap="200" align="start">
          {logoFile && (
            <Thumbnail
              source={URL.createObjectURL(logoFile)}
              alt="Logo preview"
              size="small"
            />
          )}
          <Button
            variant="secondary"
            onClick={() => document.getElementById("logo-upload").click()}
          >
            Upload Logo
          </Button>
          <input
            id="logo-upload"
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            style={{ display: "none" }}
          />
        </InlineStack>
      </BlockStack>

      {/* Logo Alignment */}
      <BlockStack gap="200">
        <Label>Logo Alignment</Label>
        <Select
          options={logoAlignmentOptions}
          value={logoAlignment}
          onChange={handleLogoAlignmentChange}
        />
      </BlockStack>

      {/* Logo Dimensions */}
      <InlineStack gap="400">
        <BlockStack gap="200" style={{ flex: 1 }}>
          <Label>Logo Width (%)</Label>
          <TextField
            type="number"
            value={logoWidth}
            onChange={handleLogoWidthChange}
            min="10"
            max="100"
          />
        </BlockStack>
        <BlockStack gap="200" style={{ flex: 1 }}>
          <Label>Logo Height (px)</Label>
          <TextField
            type="number"
            value={logoHeight}
            onChange={handleLogoHeightChange}
            min="20"
            max="200"
          />
        </BlockStack>
      </InlineStack>

      {/* Logo Background Color */}
      <BlockStack gap="200">
        <Label>Logo Background Color</Label>
        <InlineStack gap="200" align="center">
          <Box
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: `#${customizedata?.logoBackgroundColor || "ffffff"}`,
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <Popover
            active={popoverActiveLogoColor}
            activator={
              <Button
                onClick={togglePopoverActiveLogoColor}
                // icon={SettingsMajor}
                variant="secondary"
              >
                Choose Color
              </Button>
            }
            onClose={togglePopoverActiveLogoColor}
          >
            <Popover.Pane>
              <ColorPicker
                onChange={(color) => colorPickerFunc(color, "logoBackgroundColor")}
                color={colorPicker}
              />
            </Popover.Pane>
          </Popover>
        </InlineStack>
      </BlockStack>
    </BlockStack>
  );
};

export default BrandingCustomizer; 