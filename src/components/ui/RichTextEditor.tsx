"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

// Dynamic imports for better performance
const LexicalComposer = dynamic(
  () => import("@lexical/react/LexicalComposer").then(mod => ({ default: mod.LexicalComposer })),
  { ssr: false, loading: () => <LoadingSpinner /> }
);

const RichTextPlugin = dynamic(
  () => import("@lexical/react/LexicalRichTextPlugin").then(mod => ({ default: mod.RichTextPlugin })),
  { ssr: false }
);

const ContentEditable = dynamic(
  () => import("@lexical/react/LexicalContentEditable").then(mod => ({ default: mod.ContentEditable })),
  { ssr: false }
);

const HistoryPlugin = dynamic(
  () => import("@lexical/react/LexicalHistoryPlugin").then(mod => ({ default: mod.HistoryPlugin })),
  { ssr: false }
);

const OnChangePlugin = dynamic(
  () => import("@lexical/react/LexicalOnChangePlugin").then(mod => ({ default: mod.OnChangePlugin })),
  { ssr: false }
);

const LexicalErrorBoundary = dynamic(
  () => import("@lexical/react/LexicalErrorBoundary").then(mod => ({ default: mod.LexicalErrorBoundary })),
  { ssr: false }
);

// Toolbar Component (import sau để tránh circular dependency)
const ToolbarPlugin = dynamic(() => import("./ToolbarPlugin"), {
  ssr: false,
  loading: () => <div className="h-12 bg-gray-100 animate-pulse rounded" />
});

// Image Plugin
const ImagePlugin = dynamic(() => import("./ImagePlugin"), {
  ssr: false,
});

// Import lexical utilities directly (these are needed for the ValuePlugin)
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $insertNodes } from "lexical";

// Nodes
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ImageNode } from "./ImageNode";

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

  const [editor] = useLexicalComposerContext();
  const isUpdatingFromExternalRef = useRef(false);
  const lastValueRef = useRef("");

  // Set initial value and update when value changes from external source
  useEffect(() => {



    // Avoid infinite loop: only update if value actually changed and not from internal change
    if (value !== lastValueRef.current && !isUpdatingFromExternalRef.current) {

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

        });
      } else {
        // Clear editor if value is empty
        editor.update(() => {
          const root = $getRoot();
          root.clear();

        });
      }

      // Reset flag after update
      setTimeout(() => {
        isUpdatingFromExternalRef.current = false;

      }, 100);
    } else {

    }
  }, [value, editor]); // Include value in dependencies to update when it changes

  return (
    <OnChangePlugin
      onChange={(editorState) => {

        // Skip onChange if we're updating from external source
        if (isUpdatingFromExternalRef.current) {

          return;
        }

        editorState.read(() => {
          const htmlString = $generateHtmlFromNodes(editor, null);

          // Kiểm tra xem có hình ảnh trong HTML không
          const hasImages = htmlString.includes("<img");
          const imageCount = (htmlString.match(/<img/g) || []).length;

          if (hasImages) {

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
