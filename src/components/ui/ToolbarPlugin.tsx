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
    console.log("📏 Line height change requested:", newLineHeight);
    setLineHeight(newLineHeight);

    editor.update(() => {
      const selection = $getSelection();
      console.log("📍 Current selection:", selection);

      if ($isRangeSelection(selection)) {
        console.log("✅ Valid range selection found");

        // Tìm tất cả các paragraph node trong selection
        const selectedNodes = selection.getNodes();
        console.log("📋 Selected nodes:", selectedNodes.length, selectedNodes.map(n => n.getType()));

        const paragraphNodes = new Set();

        selectedNodes.forEach((node) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let currentNode: any = node;
          while (currentNode) {
            if (currentNode.getType() === 'paragraph') {
              paragraphNodes.add(currentNode);
              console.log("📝 Found paragraph node:", currentNode.getKey());
              break;
            }
            currentNode = currentNode.getParent();
          }
        });

        console.log("📄 Total paragraph nodes to update:", paragraphNodes.size);

        // Áp dụng style cho từng paragraph
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        paragraphNodes.forEach((paragraphNode: any) => {
          const writableNode = paragraphNode.getWritable();
          const currentStyle = writableNode.getStyle() || '';
          console.log("🎨 Current style before change:", currentStyle);

          if (newLineHeight === 'normal') {
            // Remove line-height style when "normal" is selected
            const newStyle = currentStyle.replace(/line-height:\s*[^;]+;?/g, '').trim();
            writableNode.setStyle(newStyle);
            console.log("🧹 Removed line-height, new style:", newStyle);
          } else {
            // Apply specific line-height value
            const styleWithoutLineHeight = currentStyle.replace(/line-height:\s*[^;]+;?/g, '').trim();
            const newStyle = styleWithoutLineHeight ?
              `${styleWithoutLineHeight}; line-height: ${newLineHeight}` :
              `line-height: ${newLineHeight}`;
            writableNode.setStyle(newStyle);
            console.log("✨ Applied line-height, new style:", newStyle);
          }
        });

        console.log("🎯 Line height change completed successfully!");
      } else {
        console.log("❌ No valid range selection - cannot apply line height");
      }
    });
  };


  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log("📁 File selected:", file?.name, file?.type);

    if (file && file.type.startsWith('image/')) {
      setIsUploading(true);
      console.log("⏳ Starting upload process...");

      try {
        // Tạo URL tạm thời cho preview ngay lập tức
        const tempSrc = URL.createObjectURL(file);
        console.log("🔗 Temporary URL created:", tempSrc);

        // Insert image với URL tạm thời trước
        console.log("➕ Inserting image into editor...");
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
          src: tempSrc,
          altText: `Đang tải lên ${file.name}...`,
        });

        // Upload lên AWS ngay
        console.log("☁️ Uploading to AWS...");
        const response = await uploadAPI.uploadSingle(file, 'uploads');
        console.log("📡 Upload response:", response);

        if (response.success) {
          const awsUrl = response.data?.url;
          console.log("✅ AWS URL received:", awsUrl);

          if (awsUrl) {
            // Đơn giản hóa: Insert image mới với AWS URL
            console.log("🔄 Replacing temp image with AWS URL...");
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
                      console.log("🗑️ Removing temp image node");
                      grandChild.remove();

                      // Insert image mới với AWS URL
                      const newImageNode = $createImageNode({
                        src: awsUrl,
                        altText: file.name,
                      });
                      child.append(newImageNode);
                      console.log("✅ Inserted new image with AWS URL");
                    }
                  });
                }
              });
            });

            // Cleanup URL tạm thời sau khi đã thay thế
            setTimeout(() => {
              URL.revokeObjectURL(tempSrc);
              console.log("🧹 Cleaned up temporary URL");
            }, 100);

            console.log('🎉 Image upload process completed successfully!');
          }
        }
      } catch (error) {
        console.error('❌ Upload failed:', error);
        // Có thể thêm toast notification ở đây
      } finally {
        setIsUploading(false);
        console.log("🏁 Upload process finished");
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
