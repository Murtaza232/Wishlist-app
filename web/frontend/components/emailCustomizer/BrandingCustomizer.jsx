import {
  BlockStack,
  Box,
  Button,
  ChoiceList,
  ColorPicker,
  Divider,
  DropZone,
  InlineStack,
  LegacyStack,
  Popover,
  RangeSlider,
  Select,
  Text,
  TextField,
  Thumbnail,
} from "@shopify/polaris";
import { ChevronLeftIcon} from "@shopify/polaris-icons";
import React, { useCallback, useState } from "react";
import { useLanguage } from "../../components";

export default function BrandingCustomizer({
  setting,
  handleSetting,
  customizedata,
  file,
  handleChangeValue,
  colorPicker,
  colorPickerFunc,
  handleDropZoneDrop,
  handleRemoveLogo,
}) {
  const [popoverActiveTextColor, setPopoverActiveTextColor] = useState(false);
  const [popoverActiveBackgroundColor, setPopoverActiveBackgroundColor] = useState(false);
  const validImageTypes = ["image/gif", "image/jpeg", "image/png"];
  const { t } = useLanguage();

  const togglePopoverActiveTextColor = useCallback(
    () => setPopoverActiveTextColor((popoverActiveTextColor) => !popoverActiveTextColor),
    [],
  );

  const togglePopoverActiveBackgroundColor = useCallback(
    () => setPopoverActiveBackgroundColor((popoverActiveBackgroundColor) => !popoverActiveBackgroundColor),
    [],
  );

  const fileUpload = !file && (
    <DropZone.FileUpload actionTitle="Add image" actionHint="Accepts .jpg, .png, .gif, .jpeg." />
  );
  const uploadedFile = file && (
    <LegacyStack>
      <Thumbnail
        size="small"
        alt={file.name}
        // source={validImageTypes.includes(file.type) ? window.URL.createObjectURL(file) : NoteMajor}
      />
      <div>
        {file.name}
        <Text variant="bodySm" as="p">
          {file.size} bytes
        </Text>
      </div>
    </LegacyStack>
  );

  return (
    <div className="h-full">
      <Box padding={"400"}>
        <InlineStack blockAlign="center" align="start" gap={"300"}>
          <Button
            onClick={() => handleSetting("Section")}
            size="medium"
            variant="tertiary"
            textAlign="center"
            icon={ChevronLeftIcon}
          />
          <Text as="h1" variant="headingMd">{t(setting, "Notification Details")}</Text>
        </InlineStack>
      </Box>
      <Divider />
      <div
        className="flex flex-col gap-4 p-4 pb-16 overflow-y-auto scroll_custom"
        style={{ maxHeight: "calc(-116px + 100vh)" }}
      >
        <BlockStack gap={"300"}>
          <ChoiceList
            title={t("Branding Type", "Notification Details")}
            choices={[
              { label: t("Store name", "Notification Details"), value: "Store name" },
              { label: t("Image", "Notification Details"), value: "Image" },
            ]}
            selected={customizedata?.brandingType}
            onChange={(selected) => handleChangeValue("brandingType", selected)}
          />
          {customizedata?.brandingType == "Store name" ? (
            <>
              {colorField(
                t("Text Color", "Notification Details"),
                "textColor",
                customizedata?.textColor,
                handleChangeValue,
                popoverActiveTextColor,
                togglePopoverActiveTextColor,
                colorPickerFunc,
                colorPicker,
              )}
            </>
          ) : (
            <>
              {file ? (
                <InlineStack blockAlign="center" align="space-between">
                  {file && typeof file === "string" && file?.startsWith("https") ? (
                    <img src={file} width={80} />
                  ) : (
                    <img
                      src={file instanceof Blob ? window.URL.createObjectURL(file) : ""}
                      alt={file.name}
                      width={80}
                    />
                  )}
                  <Button onClick={handleRemoveLogo} variant="tertiary" size="medium" textAlign="center">
                    {t("Remove", "Notification Details")}
                  </Button>
                </InlineStack>
              ) : (
                <DropZone label={t("Logo", "Notification Details")} allowMultiple={false} onDrop={handleDropZoneDrop}>
                  {uploadedFile}
                  {fileUpload}
                </DropZone>
              )}

              <RangeSlider
                label={t("Image Width (%)", "Notification Details")}
                value={customizedata?.imageWidth}
                onChange={(value) => handleChangeValue("imageWidth", value)}
                output
                min={0}
                max={100}
              />
            </>
          )}

          <Divider />
        </BlockStack>
        {colorField(
          t("Background Color", "Notification Details"),
          "brandingBackgroundColor",
          customizedata?.brandingBackgroundColor,
          handleChangeValue,
          popoverActiveBackgroundColor,
          togglePopoverActiveBackgroundColor,
          colorPickerFunc,
          colorPicker,
        )}
        <TextField
          label={t("Padding Top", "Notification Details")}
          value={customizedata?.paddingTop}
          onChange={(value) => handleChangeValue("paddingTop", value)}
          type="number"
          suffix="px"
          autoComplete="off"
        />
        <TextField
          label={t("Padding Bottom", "Notification Details")}
          value={customizedata?.paddingBottom}
          onChange={(value) => handleChangeValue("paddingBottom", value)}
          type="number"
          suffix="px"
          autoComplete="off"
        />
      </div>
    </div>
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
