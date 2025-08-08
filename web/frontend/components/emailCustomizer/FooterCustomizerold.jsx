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
// import { ThemeEditMajor } from "@shopify/polaris-icons";

const FooterCustomizer = ({
  customizedata,
  handleChangeValue,
  popoverActiveFooterTextColor,
  togglePopoverActiveFooterTextColor,
  popoverActiveFooterBackgroundColor,
  togglePopoverActiveFooterBackgroundColor,
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
        Footer Settings
      </Text>

      {/* Footer Text */}
      <BlockStack gap="200">
        <Label>Footer Text</Label>
        <TextField
          value={customizedata?.footerText || ""}
          onChange={(value) => handleChangeValue("footerText", value)}
          placeholder="Enter footer text"
          multiline={3}
        />
      </BlockStack>

      {/* Footer Font Size */}
      <BlockStack gap="200">
        <Label>Font Size (px)</Label>
        <TextField
          type="number"
          value={customizedata?.footerFontSize || "12"}
          onChange={(value) => handleChangeValue("footerFontSize", value)}
          min="10"
          max="18"
        />
      </BlockStack>

      {/* Footer Alignment */}
      <BlockStack gap="200">
        <Label>Text Alignment</Label>
        <Select
          options={alignmentOptions}
          value={customizedata?.footerAlignment || "center"}
          onChange={(value) => handleChangeValue("footerAlignment", value)}
        />
      </BlockStack>

      {/* Footer Text Color */}
      <BlockStack gap="200">
        <Label>Text Color</Label>
        <InlineStack gap="200" align="center">
          <Box
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: `#${customizedata?.footerTextColor || "666666"}`,
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <Popover
            active={popoverActiveFooterTextColor}
            activator={
              <Button
                onClick={togglePopoverActiveFooterTextColor}
                // icon={ThemeEditMajor}
                variant="secondary"
              >
                Choose Color
              </Button>
            }
            onClose={togglePopoverActiveFooterTextColor}
          >
            <Popover.Pane>
              <ColorPicker
                onChange={(color) => colorPickerFunc(color, "footerTextColor")}
                color={colorPicker}
              />
            </Popover.Pane>
          </Popover>
        </InlineStack>
      </BlockStack>

      {/* Footer Background Color */}
      <BlockStack gap="200">
        <Label>Background Color</Label>
        <InlineStack gap="200" align="center">
          <Box
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: `#${customizedata?.footerBackgroundColor || "f5f5f5"}`,
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <Popover
            active={popoverActiveFooterBackgroundColor}
            activator={
              <Button
                onClick={togglePopoverActiveFooterBackgroundColor}
                // icon={ThemeEditMajor}
                variant="secondary"
              >
                Choose Color
              </Button>
            }
            onClose={togglePopoverActiveFooterBackgroundColor}
          >
            <Popover.Pane>
              <ColorPicker
                onChange={(color) => colorPickerFunc(color, "footerBackgroundColor")}
                color={colorPicker}
              />
            </Popover.Pane>
          </Popover>
        </InlineStack>
      </BlockStack>

      {/* Footer Padding */}
      <BlockStack gap="200">
        <Label>Padding (px)</Label>
        <TextField
          type="number"
          value={customizedata?.footerPadding || "20"}
          onChange={(value) => handleChangeValue("footerPadding", value)}
          min="10"
          max="50"
        />
      </BlockStack>
    </BlockStack>
  );
};

export default FooterCustomizer; 