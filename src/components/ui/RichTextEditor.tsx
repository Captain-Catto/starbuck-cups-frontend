"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef } from "react";
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
//
// The editor is the source of truth while the user types. Every HTML string it emits is
// remembered; when the same string comes back through `value` it is an echo of our own
// change (possibly a stale one if the user typed faster than React re-rendered) and must
// NOT be written back into the editor. Only a `value` we never emitted (initial load,
// reload, reset) is loaded into the editor. External loads are tagged "history-merge",
// which OnChangePlugin ignores by default, so no flag/timer is needed to avoid a loop.
const MAX_REMEMBERED_EMITS = 50;

function ValuePlugin({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [editor] = useLexicalComposerContext();
  const emittedRef = useRef<string[]>([]);
  // null = the editor has diverged from the last externally loaded value
  const lastLoadedRef = useRef<string | null>("");

  useEffect(() => {
    if (value === lastLoadedRef.current) return;
    if (emittedRef.current.includes(value)) {
      // Echo of something the editor emitted: if it is the latest one we are caught up.
      if (value === emittedRef.current[emittedRef.current.length - 1]) {
        emittedRef.current = [value];
      }
      return;
    }

    lastLoadedRef.current = value;
    emittedRef.current = [];

    editor.update(
      () => {
        const root = $getRoot();
        root.clear();
        if (value) {
          const dom = new DOMParser().parseFromString(value, "text/html");
          const nodes = $generateNodesFromDOM(editor, dom);
          $insertNodes(nodes);
        }
      },
      { tag: "history-merge" }
    );
  }, [value, editor]);

  return (
    <OnChangePlugin
      onChange={(editorState) => {
        editorState.read(() => {
          const htmlString = $generateHtmlFromNodes(editor, null);
          if (htmlString === emittedRef.current[emittedRef.current.length - 1]) return;
          if (htmlString === lastLoadedRef.current && emittedRef.current.length === 0) return;

          emittedRef.current.push(htmlString);
          if (emittedRef.current.length > MAX_REMEMBERED_EMITS) emittedRef.current.shift();
          lastLoadedRef.current = null;
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
  const contentEditable = useMemo(
    () => (
      <ContentEditable
        className="editor-input"
        aria-placeholder={placeholder}
        placeholder={<div className="editor-placeholder">{placeholder}</div>}
      />
    ),
    [placeholder]
  );


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
              contentEditable={contentEditable}
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
