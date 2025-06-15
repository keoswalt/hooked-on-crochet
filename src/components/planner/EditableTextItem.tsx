
import React, { useRef, useEffect, useState } from "react";

interface EditableTextItemProps {
  value: string;
  onChange: (value: string) => void;
  onFinishEdit: () => void;
  autoFocus?: boolean;
  className?: string;
}

export const EditableTextItem: React.FC<EditableTextItemProps> = ({
  value,
  onChange,
  onFinishEdit,
  autoFocus,
  className,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [internalValue, setInternalValue] = useState(value);

  // When value changes from props (e.g., switching element), reset internalValue.
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      textareaRef.current.selectionStart = textareaRef.current.value.length;
      textareaRef.current.selectionEnd = textareaRef.current.value.length;
    }
  }, [autoFocus]);

  // Auto-resize the textarea to fit content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "0px";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [internalValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInternalValue(e.target.value);
    onChange(e.target.value);
  };

  const handleBlur = () => {
    onFinishEdit();
  };

  // Also finish editing on Enter (but allow shift+enter for newline)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      textareaRef.current?.blur();
    }
    if (e.key === "Escape") {
      textareaRef.current?.blur();
    }
  };

  return (
    <textarea
      ref={textareaRef}
      className={`border-2 border-blue-500 rounded bg-white p-2 resize-none leading-snug outline-none focus:ring-2 focus:ring-blue-300 text-base min-w-[120px] min-h-[32px] shadow ${className || ""}`}
      style={{ fontFamily: "inherit", fontSize: "1rem" }}
      value={internalValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      rows={1}
      spellCheck={true}
      autoFocus={autoFocus}
      data-testid="canvas-textarea"
    />
  );
};
