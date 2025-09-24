"use client";

import dynamic from "next/dynamic";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $insertNodes } from "lexical";
import { useEffect, useRef } from "react";

// Nodes
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ImageNode } from "./ImageNode";

// Toolbar Component (import sau để tránh circular dependency)
const ToolbarPlugin = dynamic(() => import("./ToolbarPlugin"), {
  ssr: false,
});

// Image Plugin
const ImagePlugin = dynamic(() => import("./ImagePlugin"), {
  ssr: false,
});

// Custom CSS
import "./RichTextEditor.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
}

// Plugin để sync HTML value
function ValuePlugin({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  console.log("ValuePlugin render - value:", value);
  const [editor] = useLexicalComposerContext();
  const isUpdatingFromExternalRef = useRef(false);
  const lastValueRef = useRef("");

  // Set initial value and update when value changes from external source
  useEffect(() => {
    console.log("ValuePlugin useEffect - value:", value);
    console.log("ValuePlugin useEffect - lastValue:", lastValueRef.current);
    console.log(
      "ValuePlugin useEffect - isUpdating:",
      isUpdatingFromExternalRef.current
    );

    // Avoid infinite loop: only update if value actually changed and not from internal change
    if (value !== lastValueRef.current && !isUpdatingFromExternalRef.current) {
      console.log("🔄 Value changed, updating editor...");
      lastValueRef.current = value;
      isUpdatingFromExternalRef.current = true;

      if (value) {
        editor.update(() => {
          const root = $getRoot();

          // Clear current content
          root.clear();

          // Parse and insert new content
          const parser = new DOMParser();
          const dom = parser.parseFromString(value, "text/html");
          const nodes = $generateNodesFromDOM(editor, dom);
          $insertNodes(nodes);

          console.log("✅ Updated editor content with:", value);
        });
      } else {
        // Clear editor if value is empty
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          console.log("🧹 Cleared editor content");
        });
      }

      // Reset flag after update
      setTimeout(() => {
        isUpdatingFromExternalRef.current = false;
        console.log("🏁 Reset isUpdating flag");
      }, 100);
    } else {
      console.log("⏭️ Skipping update - no change or already updating");
    }
  }, [value, editor]); // Include value in dependencies to update when it changes

  return (
    <OnChangePlugin
      onChange={(editorState) => {
        console.log("🔄 OnChangePlugin onChange called");

        // Skip onChange if we're updating from external source
        if (isUpdatingFromExternalRef.current) {
          console.log("⏭️ Skipping onChange - updating from external source");
          return;
        }

        editorState.read(() => {
          const htmlString = $generateHtmlFromNodes(editor, null);
          console.log("📝 Generated HTML:", htmlString);

          // Kiểm tra xem có hình ảnh trong HTML không
          const hasImages = htmlString.includes("<img");
          const imageCount = (htmlString.match(/<img/g) || []).length;
          console.log("🖼️ Has images:", hasImages, "Count:", imageCount);

          if (hasImages) {
            console.log(
              "🔍 Image URLs found:",
              htmlString.match(/src="[^"]*"/g)
            );
          }

          // Update last value ref to prevent unnecessary updates
          lastValueRef.current = htmlString;
          onChange(htmlString);
        });
      }}
    />
  );
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Nhập mô tả sản phẩm...",
  height = 400,
}) => {
  console.log("RichTextEditor render - value:", value);
  console.log("RichTextEditor render - onChange type:", typeof onChange);

  const initialConfig = {
    namespace: "RichTextEditor",
    theme: {
      // Theme styling
      paragraph: "editor-paragraph",
      quote: "editor-quote",
      heading: {
        h1: "editor-heading-h1",
        h2: "editor-heading-h2",
        h3: "editor-heading-h3",
        h4: "editor-heading-h4",
        h5: "editor-heading-h5",
      },
      text: {
        bold: "editor-text-bold",
        italic: "editor-text-italic",
        underline: "editor-text-underline",
        strikethrough: "editor-text-strikethrough",
        code: "editor-text-code",
      },
      code: "editor-code",
      codeHighlight: {
        atrule: "editor-tokenAttr",
        attr: "editor-tokenAttr",
        boolean: "editor-tokenProperty",
        builtin: "editor-tokenSelector",
        cdata: "editor-tokenComment",
        char: "editor-tokenSelector",
        class: "editor-tokenFunction",
        "class-name": "editor-tokenFunction",
        comment: "editor-tokenComment",
        constant: "editor-tokenProperty",
        deleted: "editor-tokenProperty",
        doctype: "editor-tokenComment",
        entity: "editor-tokenOperator",
        function: "editor-tokenFunction",
        important: "editor-tokenVariable",
        inserted: "editor-tokenSelector",
        keyword: "editor-tokenAttr",
        namespace: "editor-tokenVariable",
        number: "editor-tokenProperty",
        operator: "editor-tokenOperator",
        prolog: "editor-tokenComment",
        property: "editor-tokenProperty",
        punctuation: "editor-tokenPunctuation",
        regex: "editor-tokenVariable",
        selector: "editor-tokenSelector",
        string: "editor-tokenSelector",
        symbol: "editor-tokenProperty",
        tag: "editor-tokenProperty",
        url: "editor-tokenOperator",
        variable: "editor-tokenVariable",
      },
    },
    nodes: [
      HeadingNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      LinkNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      ImageNode,
    ],
    onError: (error: Error) => {
      console.error("Lexical Editor Error:", error);
    },
  };

  return (
    <div
      className="rich-text-editor-container"
      style={{ height: `${height}px` }}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <div className="editor-container">
          <ToolbarPlugin />
          <div className="editor-inner" style={{ height: `${height - 60}px` }}>
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="editor-input"
                  aria-placeholder={placeholder}
                  placeholder={
                    <div className="editor-placeholder">{placeholder}</div>
                  }
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <ImagePlugin />
            <ValuePlugin value={value} onChange={onChange} />
          </div>
        </div>
      </LexicalComposer>
    </div>
  );
};

export default RichTextEditor;
