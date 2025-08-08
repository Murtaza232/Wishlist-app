import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
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
import {
  ChevronLeftIcon,
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
} from "@shopify/polaris-icons";
import React, { useState } from "react";
import { useLanguage } from "../../components";
export default function FooterCustomizer({
  setting,
  handleSetting,
  customizedata,
  handleChangeValue,
  colorPicker,
  colorPickerFunc,
}) {
  const [popoverActiveTitleColor, setPopoverActiveTitleColor] = useState(false);
  const [popoverActiveTextColor, setPopoverActiveTextColor] = useState(false);
  const [popoverActiveBackgroundColor, setPopoverActiveBackgroundColor] = useState(false);

  const togglePopover = (popoverStateFunction) => () => popoverStateFunction((active) => !active);

  const { t } = useLanguage();

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
          <BlockStack gap={"100"}>
            <Label>{t("Text", "Notification Details")}</Label>
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
              data={customizedata?.footerDetails}
              onChange={(event, editor) => {
                const data = editor.getData();
                handleChangeValue("footerDetails", data);
              }}
              onReady={(editor) => {
                // You can store the "editor" and use when it is needed.
                console.log("Editor is ready to use!", editor);
              }}
              onError={(error, { willEditorRestart }) => {
                console.error("Editor error:", error);
                if (willEditorRestart) {
                  console.warn("Editor will restart");
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
                onClick={() => handleChangeValue("footerDetailsAlignment", "Left")}
                pressed={customizedata?.footerDetailsAlignment === "Left" ? true : false}
                icon={TextAlignLeftIcon}
              />
              <Button
                size="medium"
                textAlign="center"
                onClick={() => handleChangeValue("footerDetailsAlignment", "Center")}
                pressed={customizedata?.footerDetailsAlignment === "Center"}
                icon={TextAlignCenterIcon}
              />
              <Button
                size="medium"
                textAlign="center"
                onClick={() => handleChangeValue("footerDetailsAlignment", "Right")}
                pressed={customizedata?.footerDetailsAlignment === "Right"}
                icon={TextAlignRightIcon}
              />
            </ButtonGroup>
          </InlineStack>
          {/* <InlineStack align="space-between" blockAlign="center">
            <Label>Unsubscribe button</Label>
            {customizedata?.footerUnsubscribeButton == "0" ? (
              <Button
                size="medium"
                variant="tertiary"
                textAlign="center"
                icon={ViewMajor}
                onClick={() => handleChangeValue("footerUnsubscribeButton", "1")}
              ></Button>
            ) : (
              <Button
                size="medium"
                variant="tertiary"
                textAlign="center"
                icon={HideMinor}
                onClick={() => handleChangeValue("footerUnsubscribeButton", "0")}
              ></Button>
            )}
          </InlineStack>
          <TextField
            label="Unsubscribe"
            type="text"
            value={customizedata?.footerUnsubscribe}
            onChange={(value) => handleChangeValue("footerUnsubscribe", value)}
            autoComplete="off"
            placeholder="Unsubscribe"
          />
          <Divider />
          {colorField(
            "Unsubscribe button color",
            "footerUnsubscribeButtonColor",
            customizedata?.footerUnsubscribeButtonColor,
            handleChangeValue,
            popoverActiveTitleColor,
            togglePopover(setPopoverActiveTitleColor),
            colorPickerFunc,
            colorPicker,
          )} */}
          {colorField(
            t("Text color", "Notification Details"),
            "footerTextColor",
            customizedata?.footerTextColor,
            handleChangeValue,
            popoverActiveTextColor,
            togglePopover(setPopoverActiveTextColor),
            colorPickerFunc,
            colorPicker,
          )}
          {colorField(
            t("Background Color", "Notification Details"),
            "footerBackgroundColor",
            customizedata?.footerBackgroundColor,
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
