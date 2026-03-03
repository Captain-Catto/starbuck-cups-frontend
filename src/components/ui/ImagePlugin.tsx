import React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes, COMMAND_PRIORITY_EDITOR } from 'lexical';
import { createCommand, LexicalCommand } from 'lexical';
import { useEffect } from 'react';
import { $createImageNode, ImagePayload, ImageNode } from './ImageNode';

export const INSERT_IMAGE_COMMAND: LexicalCommand<ImagePayload> = createCommand(
  'INSERT_IMAGE_COMMAND',
);

export default function ImagePlugin(): React.ReactElement | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error('ImagePlugin: ImageNode not registered on editor');
    }

    return editor.registerCommand<ImagePayload>(
      INSERT_IMAGE_COMMAND,
      (payload) => {

        const imageNode = $createImageNode(payload);

        $insertNodes([imageNode]);

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}