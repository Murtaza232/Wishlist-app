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
  Checkbox,
} from "@shopify/polaris";
// import { ThemeEditMajor } from "@shopify/polaris-icons";

const LineItemsCustomizer = ({
  customizedata,
  handleChangeValue,
  popoverActiveTitleColor,
  togglePopoverActiveTitleColor,
  popoverActiveProductColor,
  togglePopoverActiveProductColor,
  popoverActiveAmountColor,
  togglePopoverActiveAmountColor,
  colorPickerFunc,
  colorPicker,
}) => {
  const currencyAlignmentOptions = [
    { label: "Left", value: "left" },
    { label: "Center", value: "center" },
    { label: "Right", value: "right" },
  ];

  return (
    <BlockStack gap="400">
      <Text variant="headingMd" as="h3">
        Line Items Settings
      </Text>

      {/* Title Font Size */}
      <BlockStack gap="200">
        <Label>Title Font Size (px)</Label>
        <TextField
          type="number"
          value={customizedata?.lineItemTitleFontSize || "16"}
          onChange={(value) => handleChangeValue("lineItemTitleFontSize", value)}
          min="12"
          max="24"
        />
      </BlockStack>

      {/* Title Color */}
      <BlockStack gap="200">
        <Label>Title Color</Label>
        <InlineStack gap="200" align="center">
          <Box
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: `#${customizedata?.lineItemTitleColor || "000000"}`,
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <Popover
            active={popoverActiveTitleColor}
            activator={
              <Button
                onClick={togglePopoverActiveTitleColor}
                // icon={ThemeEditMajor}
                variant="secondary"
              >
                Choose Color
              </Button>
            }
            onClose={togglePopoverActiveTitleColor}
          >
            <Popover.Pane>
              <ColorPicker
                onChange={(color) => colorPickerFunc(color, "lineItemTitleColor")}
                color={colorPicker}
              />
            </Popover.Pane>
          </Popover>
        </InlineStack>
      </BlockStack>

      {/* Product Font Size */}
      <BlockStack gap="200">
        <Label>Product Font Size (px)</Label>
        <TextField
          type="number"
          value={customizedata?.lineItemProductFontSize || "14"}
          onChange={(value) => handleChangeValue("lineItemProductFontSize", value)}
          min="10"
          max="20"
        />
      </BlockStack>

      {/* Product Color */}
      <BlockStack gap="200">
        <Label>Product Color</Label>
        <InlineStack gap="200" align="center">
          <Box
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: `#${customizedata?.lineItemProductColor || "333333"}`,
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <Popover
            active={popoverActiveProductColor}
            activator={
              <Button
                onClick={togglePopoverActiveProductColor}
                // icon={ThemeEditMajor}
                variant="secondary"
              >
                Choose Color
              </Button>
            }
            onClose={togglePopoverActiveProductColor}
          >
            <Popover.Pane>
              <ColorPicker
                onChange={(color) => colorPickerFunc(color, "lineItemProductColor")}
                color={colorPicker}
              />
            </Popover.Pane>
          </Popover>
        </InlineStack>
      </BlockStack>

      {/* Currency Alignment */}
      <BlockStack gap="200">
        <Label>Currency Alignment</Label>
        <Select
          options={currencyAlignmentOptions}
          value={customizedata?.lineItemCurrencyAlignment || "left"}
          onChange={(value) => handleChangeValue("lineItemCurrencyAlignment", value)}
        />
      </BlockStack>

      {/* Amount Color */}
      <BlockStack gap="200">
        <Label>Amount Color</Label>
        <InlineStack gap="200" align="center">
          <Box
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: `#${customizedata?.lineItemAmountColor || "000000"}`,
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <Popover
            active={popoverActiveAmountColor}
            activator={
              <Button
                onClick={togglePopoverActiveAmountColor}
                // icon={ThemeEditMajor}
                variant="secondary"
              >
                Choose Color
              </Button>
            }
            onClose={togglePopoverActiveAmountColor}
          >
            <Popover.Pane>
              <ColorPicker
                onChange={(color) => colorPickerFunc(color, "lineItemAmountColor")}
                color={colorPicker}
              />
            </Popover.Pane>
          </Popover>
        </InlineStack>
      </BlockStack>

      {/* Hide Product Amount */}
      <BlockStack gap="200">
        <Checkbox
          label="Hide Product Amount"
          checked={customizedata?.lineItemProductAmountHide === "1"}
          onChange={(checked) => 
            handleChangeValue("lineItemProductAmountHide", checked ? "1" : "0")
          }
        />
      </BlockStack>
    </BlockStack>
  );
};

export default LineItemsCustomizer; 