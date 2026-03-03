"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getRoot,
} from "lexical";
import {
  $isHeadingNode,
  $createHeadingNode,
  $createQuoteNode,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $createParagraphNode } from "lexical";
import { useCallback, useEffect, useState, useRef } from "react";
import { INSERT_IMAGE_COMMAND } from "./ImagePlugin";
import { uploadAPI } from "@/lib/api/upload";
import { $isImageNode, $createImageNode } from "./ImageNode";

const ToolbarPlugin = () => {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [blockType, setBlockType] = useState("paragraph");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [lineHeight, setLineHeight] = useState("normal");

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));

      // Update block type
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        const type = $isHeadingNode(element)
          ? element.getTag()
          : element.getType();
        setBlockType(type);
      }
    }
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [updateToolbar, editor]);

  const formatParagraph = () => {
    if (blockType !== "paragraph") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      });
    }
  };

  const formatHeading = (headingSize: "h1" | "h2" | "h3") => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createHeadingNode(headingSize));
        }
      });
    }
  };

  const formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      });
    }
  };


  const handleLineHeightChange = (newLineHeight: string) => {

    setLineHeight(newLineHeight);

    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {

        // Tìm tất cả các paragraph node trong selection
        const selectedNodes = selection.getNodes();

        const paragraphNodes = new Set();

        selectedNodes.forEach((node) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let currentNode: any = node;
          while (currentNode) {
            if (currentNode.getType() === 'paragraph') {
              paragraphNodes.add(currentNode);

              break;
            }
            currentNode = currentNode.getParent();
          }
        });

        // Áp dụng style cho từng paragraph
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        paragraphNodes.forEach((paragraphNode: any) => {
          const writableNode = paragraphNode.getWritable();
          const currentStyle = writableNode.getStyle() || '';

          if (newLineHeight === 'normal') {
            // Remove line-height style when "normal" is selected
            const newStyle = currentStyle.replace(/line-height:\s*[^;]+;?/g, '').trim();
            writableNode.setStyle(newStyle);

          } else {
            // Apply specific line-height value
            const styleWithoutLineHeight = currentStyle.replace(/line-height:\s*[^;]+;?/g, '').trim();
            const newStyle = styleWithoutLineHeight ?
              `${styleWithoutLineHeight}; line-height: ${newLineHeight}` :
              `line-height: ${newLineHeight}`;
            writableNode.setStyle(newStyle);

          }
        });

      } else {

      }
    });
  };


  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file && file.type.startsWith('image/')) {
      setIsUploading(true);

      try {
        // Tạo URL tạm thời cho preview ngay lập tức
        const tempSrc = URL.createObjectURL(file);

        // Insert image với URL tạm thời trước

        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
          src: tempSrc,
          altText: `Đang tải lên ${file.name}...`,
        });

        // Upload lên AWS ngay

        const response = await uploadAPI.uploadSingle(file, 'uploads');

        if (response.success) {
          const awsUrl = response.data?.url;

          if (awsUrl) {
            // Đơn giản hóa: Insert image mới với AWS URL

            editor.update(() => {
              // Xóa image cũ với blob URL và insert image mới với AWS URL
              const root = $getRoot();
              const children = root.getChildren();

              // Tìm và xóa image node cũ
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              children.forEach((child: any) => {
                if (child.getType() === 'paragraph') {
                  const paragraphChildren = child.getChildren();
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  paragraphChildren.forEach((grandChild: any) => {
                    if ($isImageNode(grandChild) && grandChild.getSrc() === tempSrc) {

                      grandChild.remove();

                      // Insert image mới với AWS URL
                      const newImageNode = $createImageNode({
                        src: awsUrl,
                        altText: file.name,
                      });
                      child.append(newImageNode);

                    }
                  });
                }
              });
            });

            // Cleanup URL tạm thời sau khi đã thay thế
            setTimeout(() => {
              URL.revokeObjectURL(tempSrc);

            }, 100);

          }
        }
      } catch (error) {

        // Có thể thêm toast notification ở đây
      } finally {
        setIsUploading(false);

      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="toolbar">
      {/* Undo/Redo */}
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

      <div className="divider" />

      {/* Block Format */}
      <select
        className="toolbar-item block-controls"
        value={blockType}
        onChange={(e) => {
          const value = e.target.value;
          if (value === "paragraph") {
            formatParagraph();
          } else if (value === "h1" || value === "h2" || value === "h3") {
            formatHeading(value as "h1" | "h2" | "h3");
          } else if (value === "quote") {
            formatQuote();
          }
        }}
      >
        <option value="paragraph">Đoạn văn</option>
        <option value="h1">Tiêu đề 1</option>
        <option value="h2">Tiêu đề 2</option>
        <option value="h3">Tiêu đề 3</option>
        <option value="quote">Trích dẫn</option>
      </select>

      {/* Line Height */}
      <select
        className="toolbar-item"
        value={lineHeight}
        onChange={(e) => handleLineHeightChange(e.target.value)}
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

      <div className="divider" />

      {/* Text Format */}
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        className={`toolbar-item ${isBold ? "active" : ""}`}
        aria-label="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        className={`toolbar-item ${isItalic ? "active" : ""}`}
        aria-label="Italic"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        className={`toolbar-item ${isUnderline ? "active" : ""}`}
        aria-label="Underline"
      >
        <u>U</u>
      </button>
      <button
        type="button"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
        className={`toolbar-item ${isStrikethrough ? "active" : ""}`}
        aria-label="Strikethrough"
      >
        <s>S</s>
      </button>

      <div className="divider" />

      {/* Image Upload */}
      <button
        type="button"
        onClick={handleImageUpload}
        className={`toolbar-item ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label="Insert Image"
        disabled={isUploading}
      >
        {isUploading ? '⏳' : '🖼️'}
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ToolbarPlugin;
