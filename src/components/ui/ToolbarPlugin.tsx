"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getRoot,
  type LexicalEditor,
} from "lexical";
import {
  $isHeadingNode,
  $createHeadingNode,
  $createQuoteNode,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $createParagraphNode } from "lexical";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { INSERT_IMAGE_COMMAND } from "./ImageCommands";
import { uploadAPI } from "@/lib/api/upload";
import { $isImageNode, $createImageNode } from "./ImageNode";

type ToolbarState = {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  blockType: string;
  isUploading: boolean;
  lineHeight: string;
};

type ToolbarAction =
  | {
      type: "selection";
      payload: Pick<
        ToolbarState,
        "isBold" | "isItalic" | "isUnderline" | "isStrikethrough" | "blockType"
      >;
    }
  | { type: "lineHeight"; payload: string }
  | { type: "uploading"; payload: boolean };

const initialToolbarState: ToolbarState = {
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrikethrough: false,
  blockType: "paragraph",
  isUploading: false,
  lineHeight: "normal",
};

function toolbarReducer(
  state: ToolbarState,
  action: ToolbarAction
): ToolbarState {
  switch (action.type) {
    case "selection":
      return { ...state, ...action.payload };
    case "lineHeight":
      return { ...state, lineHeight: action.payload };
    case "uploading":
      return { ...state, isUploading: action.payload };
    default:
      return state;
  }
}

const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [state, dispatch] = useReducer(toolbarReducer, initialToolbarState);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return;
    }

    const anchorNode = selection.anchor.getNode();
    const element =
      anchorNode.getKey() === "root"
        ? anchorNode
        : anchorNode.getTopLevelElementOrThrow();
    const elementKey = element.getKey();
    const elementDOM = editor.getElementByKey(elementKey);

    if (elementDOM === null) {
      return;
    }

    dispatch({
      type: "selection",
      payload: {
        isBold: selection.hasFormat("bold"),
        isItalic: selection.hasFormat("italic"),
        isUnderline: selection.hasFormat("underline"),
        isStrikethrough: selection.hasFormat("strikethrough"),
        blockType: $isHeadingNode(element) ? element.getTag() : element.getType(),
      },
    });
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [updateToolbar, editor]);

  const handleBlockTypeChange = (value: string) => {
    if (value === "paragraph") {
      formatParagraph(editor, state.blockType);
      return;
    }

    if (value === "h1" || value === "h2" || value === "h3") {
      formatHeading(editor, state.blockType, value);
      return;
    }

    if (value === "quote") {
      formatQuote(editor, state.blockType);
    }
  };

  const handleLineHeightChange = (lineHeight: string) => {
    dispatch({ type: "lineHeight", payload: lineHeight });
    applyLineHeight(editor, lineHeight);
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    dispatch({ type: "uploading", payload: true });
    try {
      await uploadImageFile(editor, file);
    } finally {
      dispatch({ type: "uploading", payload: false });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="toolbar">
      <HistoryControls editor={editor} />
      <div className="divider" />
      <BlockFormatSelect
        blockType={state.blockType}
        onChange={handleBlockTypeChange}
      />
      <LineHeightSelect
        lineHeight={state.lineHeight}
        onChange={handleLineHeightChange}
      />
      <div className="divider" />
      <TextFormatControls editor={editor} state={state} />
      <div className="divider" />
      <ImageUploadControl
        fileInputRef={fileInputRef}
        isUploading={state.isUploading}
        onFileChange={handleFileChange}
      />
    </div>
  );
};

function HistoryControls({ editor }: { editor: LexicalEditor }) {
  return (
    <>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className="toolbar-item"
        aria-label="Undo"
      >
        ↶
      </button>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className="toolbar-item"
        aria-label="Redo"
      >
        ↷
      </button>
    </>
  );
}

function BlockFormatSelect({
  blockType,
  onChange,
}: {
  blockType: string;
  onChange: (value: string) => void;
}) {
  return (
    <select
      aria-label="Select option"
      className="toolbar-item block-controls"
      value={blockType}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="paragraph">Đoạn văn</option>
      <option value="h1">Tiêu đề 1</option>
      <option value="h2">Tiêu đề 2</option>
      <option value="h3">Tiêu đề 3</option>
      <option value="quote">Trích dẫn</option>
    </select>
  );
}

function LineHeightSelect({
  lineHeight,
  onChange,
}: {
  lineHeight: string;
  onChange: (value: string) => void;
}) {
  return (
    <select
      className="toolbar-item"
      value={lineHeight}
      onChange={(event) => onChange(event.target.value)}
      title="Giãn dòng"
    >
      <option value="normal">Giãn dòng</option>
      <option value="1">1.0x</option>
      <option value="1.15">1.15x</option>
      <option value="1.5">1.5x</option>
      <option value="2">2.0x</option>
      <option value="2.5">2.5x</option>
      <option value="3">3.0x</option>
    </select>
  );
}

function TextFormatControls({
  editor,
  state,
}: {
  editor: LexicalEditor;
  state: ToolbarState;
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        className={`toolbar-item ${state.isBold ? "active" : ""}`}
        aria-label="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        className={`toolbar-item ${state.isItalic ? "active" : ""}`}
        aria-label="Italic"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        className={`toolbar-item ${state.isUnderline ? "active" : ""}`}
        aria-label="Underline"
      >
        <u>U</u>
      </button>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
        className={`toolbar-item ${state.isStrikethrough ? "active" : ""}`}
        aria-label="Strikethrough"
      >
        <s>S</s>
      </button>
    </>
  );
}

function ImageUploadControl({
  fileInputRef,
  isUploading,
  onFileChange,
}: {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={`toolbar-item ${
          isUploading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        aria-label="Insert Image"
        disabled={isUploading}
      >
        {isUploading ? "⏳" : "🖼️"}
      </button>
      <input
        aria-label="file"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        style={{ display: "none" }}
      />
    </>
  );
}

function formatParagraph(editor: LexicalEditor, blockType: string) {
  if (blockType === "paragraph") {
    return;
  }

  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $setBlocksType(selection, () => $createParagraphNode());
    }
  });
}

function formatHeading(
  editor: LexicalEditor,
  blockType: string,
  headingSize: "h1" | "h2" | "h3"
) {
  if (blockType === headingSize) {
    return;
  }

  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $setBlocksType(selection, () => $createHeadingNode(headingSize));
    }
  });
}

function formatQuote(editor: LexicalEditor, blockType: string) {
  if (blockType === "quote") {
    return;
  }

  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $setBlocksType(selection, () => $createQuoteNode());
    }
  });
}

function applyLineHeight(editor: LexicalEditor, newLineHeight: string) {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) {
      return;
    }

    const paragraphNodes = new Set<any>();
    selection.getNodes().forEach((node) => {
      let currentNode: any = node;
      while (currentNode) {
        if (currentNode.getType() === "paragraph") {
          paragraphNodes.add(currentNode);
          break;
        }
        currentNode = currentNode.getParent();
      }
    });

    paragraphNodes.forEach((paragraphNode) => {
      const writableNode = paragraphNode.getWritable();
      const currentStyle = writableNode.getStyle() || "";
      const styleWithoutLineHeight = currentStyle
        .replace(/line-height:\s*[^;]+;?/g, "")
        .trim();

      writableNode.setStyle(
        newLineHeight === "normal"
          ? styleWithoutLineHeight
          : styleWithoutLineHeight
            ? `${styleWithoutLineHeight}; line-height: ${newLineHeight}`
            : `line-height: ${newLineHeight}`
      );
    });
  });
}

async function uploadImageFile(editor: LexicalEditor, file: File) {
  const tempSrc = URL.createObjectURL(file);

  editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
    src: tempSrc,
    altText: `Đang tải lên ${file.name}...`,
  });

  try {
    const response = await uploadAPI.uploadSingle(file, "uploads");
    const awsUrl = response.success ? response.data?.url : null;

    if (awsUrl) {
      replaceTemporaryImage(editor, tempSrc, awsUrl, file.name);
    }
  } finally {
    setTimeout(() => {
      URL.revokeObjectURL(tempSrc);
    }, 100);
  }
}

function replaceTemporaryImage(
  editor: LexicalEditor,
  tempSrc: string,
  awsUrl: string,
  fileName: string
) {
  editor.update(() => {
    const root = $getRoot();
    const children = root.getChildren();

    children.forEach((child: any) => {
      if (child.getType() !== "paragraph") {
        return;
      }

      child.getChildren().forEach((grandChild: any) => {
        if (!$isImageNode(grandChild) || grandChild.getSrc() !== tempSrc) {
          return;
        }

        grandChild.remove();
        child.append(
          $createImageNode({
            src: awsUrl,
            altText: fileName,
          })
        );
      });
    });
  });
}

export default ToolbarPlugin;
