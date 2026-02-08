'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Box } from '@chakra-ui/react';

interface RichTextDisplayProps {
  content: any;
}

export function RichTextDisplay({ content }: RichTextDisplayProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-brand-primary underline',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content,
    editable: false,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none',
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <Box
      sx={{
        '.ProseMirror': {
          'ul, ol': {
            paddingLeft: '1.5rem',
          },
          'a': {
            color: 'brand.primary',
            textDecoration: 'underline',
          },
          'p': {
            marginBottom: '0.5rem',
          },
          'p:last-child': {
            marginBottom: 0,
          },
        },
      }}
    >
      <EditorContent editor={editor} />
    </Box>
  );
}
