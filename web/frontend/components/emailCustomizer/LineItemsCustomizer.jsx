import {
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  ColorPicker,
  Divider,
  InlineStack,
  Label,
  Popover,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";
// import { ChevronLeftIcon, HideMinor, SidebarLeftMajor, SidebarRightMajor, ViewMajor } from "@shopify/polaris-icons";
import React, { useState } from "react";

export default function LineItemsCustomizer({
  setting,
  handleSetting,
  customizedata,
  handleChangeValue,
  colorPicker,
  colorPickerFunc,
}) {
  const [popoverActiveBackgroundColor, setPopoverActiveBackgroundColor] = useState(false);
  const [popoverActiveTextColor, setPopoverActiveTextColor] = useState(false);
  const [popoverActiveTitleColor, setPopoverActiveTitleColor] = useState(false);

  const togglePopover = (popoverStateFunction) => () => popoverStateFunction((active) => !active);

  return (
    <div className="h-full">
      <Box padding={"400"}>
        <InlineStack blockAlign="center" align="start" gap={"300"}>
          <Button
            onClick={() => handleSetting("Section")}
            size="medium"
            variant="tertiary"
            textAlign="center"
            // icon={ChevronLeftIcon}
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
          <TextField
            label="Title font size"
            type="number"
            value={customizedata?.lineItemTitleFontSize}
            onChange={(value) => handleChangeValue("lineItemTitleFontSize", value)}
            autoComplete="off"
          />
          <TextField
            label="Main Title"
            type="text"
            value={customizedata?.lineItemMainTitle}
            onChange={(value) => handleChangeValue("lineItemMainTitle", value)}
            autoComplete="off"
            placeholder="What's inside"
          />
          <TextField
            label="Amount"
            type="text"
            value={customizedata?.lineItemAmount}
            onChange={(value) => handleChangeValue("lineItemAmount", value)}
            autoComplete="off"
            placeholder="Amount"
          />
          <TextField
            label="Subtitle"
            type="text"
            value={customizedata?.lineItemSubtitle}
            onChange={(value) => handleChangeValue("lineItemSubtitle", value)}
            autoComplete="off"
            placeholder="Item"
          />
          <Divider />
          <InlineStack align="space-between" blockAlign="center">
            <Label>Product amount</Label>
            {customizedata?.lineItemProductAmountHide == "0" ? (
              <Button
                size="medium"
                variant="tertiary"
                textAlign="center"
                // icon={ViewMajor}
                onClick={() => handleChangeValue("lineItemProductAmountHide", "1")}
              ></Button>
            ) : (
              <Button
                size="medium"
                variant="tertiary"
                textAlign="center"
                // icon={HideMinor}
                onClick={() => handleChangeValue("lineItemProductAmountHide", "0")}
              ></Button>
            )}
          </InlineStack>
          <TextField
            label="Currency"
            type="text"
            value={customizedata?.lineItemCurrency}
            onChange={(value) => handleChangeValue("lineItemCurrency", value)}
            autoComplete="off"
            placeholder="PKR"
          />
          <TextField
            label="Product font size"
            type="number"
            value={customizedata?.lineItemProductFontSize}
            onChange={(value) => handleChangeValue("lineItemProductFontSize", value)}
            autoComplete="off"
          />
          <InlineStack blockAlign="center" align="space-between">
            <Label>Currency alignment</Label>
            <ButtonGroup variant="segmented">
              <Button
                size="medium"
                textAlign="center"
                onClick={() => handleChangeValue("lineItemCurrencyAlignment", "Left")}
                pressed={customizedata?.lineItemCurrencyAlignment == "Left"}
                // icon={SidebarLeftMajor}
              />
              <Button
                size="medium"
                textAlign="center"
                onClick={() => handleChangeValue("lineItemCurrencyAlignment", "Right")}
                pressed={customizedata?.lineItemCurrencyAlignment == "Right"}
                // icon={SidebarRightMajor}
              />
            </ButtonGroup>
          </InlineStack>
          <Divider />
          {colorField(
            "Title Color",
            "lineItemTitleColor",
            customizedata?.lineItemTitleColor,
            handleChangeValue,
            popoverActiveTitleColor,
            togglePopover(setPopoverActiveTitleColor),
            colorPickerFunc,
            colorPicker,
          )}
          {colorField(
            "Item Text Color",
            "lineItemItemTextColor",
            customizedata?.lineItemItemTextColor,
            handleChangeValue,
            popoverActiveTextColor,
            togglePopover(setPopoverActiveTextColor),
            colorPickerFunc,
            colorPicker,
          )}
          {colorField(
            "Background Color",
            "lineItemBackgroundColor",
            customizedata?.lineItemBackgroundColor,
            handleChangeValue,
            popoverActiveBackgroundColor,
            togglePopover(setPopoverActiveBackgroundColor),
            colorPickerFunc,
            colorPicker,
          )}
        </BlockStack>
      </div>
    </div>
  );
}

const colorField = (
  label,
  key,
  value,
  handleChangeValue,
  popoverActive,
  togglePopoverActive,
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
          active={popoverActive}
          activator={
            <button
              onClick={togglePopoverActive}
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
          onClose={togglePopoverActive}
        >
          <ColorPicker onChange={(newColor) => colorPickerFunc(newColor, key)} color={colorPicker} />
        </Popover>
      }
    />
  );
};
