import React from 'react';
import {
  DecoratorNode,
  NodeKey,
  LexicalNode,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import OptimizedImage from '@/components/OptimizedImage';

export interface ImagePayload {
  altText: string;
  height?: number;
  key?: NodeKey;
  src: string;
  width?: number;
}

export type SerializedImageNode = Spread<{
  altText: string;
  height?: number;
  src: string;
  width?: number;
}, SerializedLexicalNode>;

export class ImageNode extends DecoratorNode<React.ReactElement> {
  __src: string;
  __altText: string;
  __width: 'inherit' | number;
  __height: 'inherit' | number;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__key,
    );
  }

  constructor(
    src: string,
    altText: string,
    width?: 'inherit' | number,
    height?: 'inherit' | number,
    key?: NodeKey,
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width || 'inherit';
    this.__height = height || 'inherit';
  }

  exportJSON(): SerializedImageNode {
    const json = {
      altText: this.getAltText(),
      height: this.__height === 'inherit' ? 0 : this.__height,
      src: this.getSrc(),
      type: 'image',
      version: 1,
      width: this.__width === 'inherit' ? 0 : this.__width,
    };

    return json;
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { altText, height, width, src } = serializedNode;
    const node = $createImageNode({
      altText,
      height,
      src,
      width,
    });
    return node;
  }

  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }

  setAltText(altText: string): void {
    const writable = this.getWritable();
    writable.__altText = altText;
  }

  setWidthAndHeight(
    width: 'inherit' | number,
    height: 'inherit' | number,
  ): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  createDOM(): HTMLElement {
    const span = document.createElement('span');
    span.className = 'image-node';
    return span;
  }

  exportDOM(): { element: HTMLElement } {
    const img = document.createElement('img');
    img.setAttribute('src', this.__src);
    img.setAttribute('alt', this.__altText);
    if (this.__width !== 'inherit') {
      img.setAttribute('width', this.__width.toString());
    }
    if (this.__height !== 'inherit') {
      img.setAttribute('height', this.__height.toString());
    }
    img.style.maxWidth = '100%';

    return { element: img };
  }

  static importDOM() {
    return {
      img: () => ({
        conversion: (element: HTMLImageElement) => {
          const src = element.getAttribute('src');
          const alt = element.getAttribute('alt');
          const width = element.getAttribute('width');
          const height = element.getAttribute('height');

          if (!src) return null;

          return {
            node: $createImageNode({
              src,
              altText: alt || '',
              width: width ? parseInt(width) : undefined,
              height: height ? parseInt(height) : undefined,
            }),
          };
        },
        priority: 1 as const,
      }),
    };
  }

  updateDOM(): false {
    return false;
  }

  decorate(): React.ReactElement {
    return (
      <OptimizedImage
        src={this.__src}
        alt={this.__altText}
        width={this.__width === 'inherit' ? 400 : (this.__width || 400)}
        height={this.__height === 'inherit' ? 300 : (this.__height || 300)}
        style={{
          height: this.__height === 'inherit' ? 'inherit' : this.__height,
          width: this.__width === 'inherit' ? 'inherit' : this.__width,
          maxWidth: '100%',
          cursor: 'default',
        }}
      />
    );
  }
}

export function $createImageNode({
  altText,
  height,
  src,
  width,
  key,
}: ImagePayload): ImageNode {
  return new ImageNode(src, altText, width, height, key);
}

export function $isImageNode(
  node: LexicalNode | null | undefined,
): node is ImageNode {
  return node instanceof ImageNode;
}
