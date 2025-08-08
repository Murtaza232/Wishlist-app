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
} from "@shopify/polaris";
// import { SettingsMajor } from "@shopify/polaris-icons";

const TrackingButton = ({
  customizedata,
  handleChangeValue,
  popoverActiveButtonColor,
  togglePopoverActiveButtonColor,
  popoverActiveTextColor,
  togglePopoverActiveTextColor,
  popoverActiveBackgroundColor,
  togglePopoverActiveBackgroundColor,
  colorPickerFunc,
  colorPicker,
}) => {
  const alignmentOptions = [
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" },
  ];

  return (
    <BlockStack gap="400">
      <Text variant="headingMd" as="h3">
        Action Button Settings
      </Text>

      {/* Button Text */}
      <BlockStack gap="200">
        <Label>Button Text</Label>
        <TextField
          value={customizedata?.trackingButtonButtonText || ""}
          onChange={(value) => handleChangeValue("trackingButtonButtonText", value)}
          placeholder="Enter button text"
        />
      </BlockStack>

      {/* Button Link */}
      <BlockStack gap="200">
        <Label>Button Link</Label>
        <TextField
          value={customizedata?.trackingButtonCustomizeLink || ""}
          onChange={(value) => handleChangeValue("trackingButtonCustomizeLink", value)}
          placeholder="Enter button link"
        />
      </BlockStack>

      {/* Button Width */}
      <BlockStack gap="200">
        <Label>Button Width (%)</Label>
        <TextField
          type="number"
          value={customizedata?.trackingButtonButtonWidth || "50"}
          onChange={(value) => handleChangeValue("trackingButtonButtonWidth", value)}
          min="10"
          max="100"
        />
      </BlockStack>

      {/* Font Size */}
      <BlockStack gap="200">
        <Label>Font Size (px)</Label>
        <TextField
          type="number"
          value={customizedata?.trackingButtonFontSize || "14"}
          onChange={(value) => handleChangeValue("trackingButtonFontSize", value)}
          min="10"
          max="24"
        />
      </BlockStack>

      {/* Alignment */}
      <BlockStack gap="200">
        <Label>Alignment</Label>
        <Select
          options={alignmentOptions}
          value={customizedata?.trackingButtonAlignment || "center"}
          onChange={(value) => handleChangeValue("trackingButtonAlignment", value)}
        />
      </BlockStack>

      {/* Button Color */}
      <BlockStack gap="200">
        <Label>Button Color</Label>
        <InlineStack gap="200" align="center">
          <Box
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: `#${customizedata?.trackingButtonButtonColor || "000000"}`,
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <Popover
            active={popoverActiveButtonColor}
            activator={
              <Button
                onClick={togglePopoverActiveButtonColor}
                // icon={SettingsMajor}
                variant="secondary"
              >
                Choose Color
              </Button>
            }
            onClose={togglePopoverActiveButtonColor}
          >
            <Popover.Pane>
              <ColorPicker
                onChange={(color) => colorPickerFunc(color, "trackingButtonButtonColor")}
                color={colorPicker}
              />
            </Popover.Pane>
          </Popover>
        </InlineStack>
      </BlockStack>

      {/* Text Color */}
      <BlockStack gap="200">
        <Label>Text Color</Label>
        <InlineStack gap="200" align="center">
          <Box
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: `#${customizedata?.trackingButtonTextColor || "ffffff"}`,
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <Popover
            active={popoverActiveTextColor}
            activator={
              <Button
                onClick={togglePopoverActiveTextColor}
                // icon={SettingsMajor}
                variant="secondary"
              >
                Choose Color
              </Button>
            }
            onClose={togglePopoverActiveTextColor}
          >
            <Popover.Pane>
              <ColorPicker
                onChange={(color) => colorPickerFunc(color, "trackingButtonTextColor")}
                color={colorPicker}
              />
            </Popover.Pane>
          </Popover>
        </InlineStack>
      </BlockStack>

      {/* Background Color */}
      <BlockStack gap="200">
        <Label>Background Color</Label>
        <InlineStack gap="200" align="center">
          <Box
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: `#${customizedata?.trackingButtonBackgroundColor || "ffffff"}`,
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <Popover
            active={popoverActiveBackgroundColor}
            activator={
              <Button
                onClick={togglePopoverActiveBackgroundColor}
                // icon={SettingsMajor}
                variant="secondary"
              >
                Choose Color
              </Button>
            }
            onClose={togglePopoverActiveBackgroundColor}
          >
            <Popover.Pane>
              <ColorPicker
                onChange={(color) => colorPickerFunc(color, "trackingButtonBackgroundColor")}
                color={colorPicker}
              />
            </Popover.Pane>
          </Popover>
        </InlineStack>
      </BlockStack>
    </BlockStack>
  );
};

export default TrackingButton; 