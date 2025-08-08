import React, { useRef, useEffect } from "react";
import { BlockStack, Label, Button, InlineStack } from "@shopify/polaris";

const RichTextEditor = ({
  label,
  value,
  onChange,
  placeholder = "Enter text here...",
  height = "200px",
}) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const toolbarButtons = [
    { label: "B", command: "bold", title: "Bold" },
    { label: "I", command: "italic", title: "Italic" },
    { label: "U", command: "underline", title: "Underline" },
    { label: "S", command: "strikeThrough", title: "Strikethrough" },
    { label: "•", command: "insertUnorderedList", title: "Bullet List" },
    { label: "1.", command: "insertOrderedList", title: "Numbered List" },
    { label: "Quote", command: "formatBlock", value: "blockquote", title: "Quote" },
  ];

  return (
    <BlockStack gap="200">
      {label && <Label>{label}</Label>}
      
      {/* Toolbar */}
      <InlineStack gap="100" wrap={false}>
        {toolbarButtons.map((button, index) => (
          <Button
            key={index}
            size="micro"
            variant="secondary"
            onClick={() => execCommand(button.command, button.value)}
            title={button.title}
          >
            {button.label}
          </Button>
        ))}
      </InlineStack>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        style={{
          border: "1px solid #c9cccf",
          borderRadius: "4px",
          padding: "8px 12px",
          minHeight: height,
          maxHeight: height,
          overflowY: "auto",
          outline: "none",
          fontFamily: "inherit",
          fontSize: "14px",
          lineHeight: "1.5",
        }}
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: value || "" }}
      />
    </BlockStack>
  );
};

export default RichTextEditor; 