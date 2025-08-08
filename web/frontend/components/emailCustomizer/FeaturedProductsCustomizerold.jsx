import {
  BlockStack,
  Box,
  Button,
  ButtonGroup,
  ColorPicker,
  Divider,
  InlineGrid,
  InlineStack,
  Label,
  LegacyStack,
  Popover,
  Select,
  Text,
  TextField,
  Thumbnail,
} from "@shopify/polaris";
import { ChevronLeftMinor } from "@shopify/polaris-icons";
import React, { useState } from "react";

export default function FeaturedProductsCustomizer({
  setting,
  handleSetting,
  customizedata,
  handleChangeValue,
  colorPicker,
  colorPickerFunc,
  selectedProducts,
  handleOpenProductModal,
  handleRemoveProduct,
}) {
  const [popoverActiveTitleColor, setPopoverActiveTitleColor] = useState(false);
  const [popoverActiveTextColor, setPopoverActiveTextColor] = useState(false);
  const [popoverActiveBackgroundColor, setPopoverActiveBackgroundColor] = useState(false);

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
            icon={ChevronLeftMinor}
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
          <BlockStack gap={"100"}>
            <Label>Products</Label>
            <BlockStack gap={"200"}>
              {selectedProducts?.map((product, index) => (
                <InlineGrid key={index} columns="auto 1fr auto" alignItems="center" gap={"200"}>
                  <Thumbnail size="small" source={product?.image} />
                  <Text truncate>{product?.title}</Text>
                  <Button
                    onClick={() => handleRemoveProduct(product?.shopify_product_id)}
                    size="medium"
                    textAlign="center"
                    variant="tertiary"
                    // icon={XCircleIcon}
                  ></Button>
                </InlineGrid>
              ))}
            </BlockStack>
          </BlockStack>
          <Button
            disabled={selectedProducts?.length == 4}
            onClick={handleOpenProductModal}
            variant="primary"
            fullWidth
            size="medium"
            textAlign="center"
          >
            Add product
          </Button>
          <TextField
            label="Main Title"
            type="text"
            value={customizedata?.featuredProductsMainTitle}
            onChange={(value) => handleChangeValue("featuredProductsMainTitle", value)}
            autoComplete="off"
            placeholder="Your may also like..."
          />
          <Divider />
          {colorField(
            "Title Color",
            "featuredProductsTitleColor",
            customizedata?.featuredProductsTitleColor,
            handleChangeValue,
            popoverActiveTitleColor,
            togglePopover(setPopoverActiveTitleColor),
            colorPickerFunc,
            colorPicker,
          )}
          {colorField(
            "Item Text Color",
            "featuredProductsItemTextColor",
            customizedata?.featuredProductsItemTextColor,
            handleChangeValue,
            popoverActiveTextColor,
            togglePopover(setPopoverActiveTextColor),
            colorPickerFunc,
            colorPicker,
          )}
          <Divider />
          {colorField(
            "Background Color",
            "featuredProductsBackgroundColor",
            customizedata?.featuredProductsBackgroundColor,
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
