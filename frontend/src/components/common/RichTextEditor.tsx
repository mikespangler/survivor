'use client';

import { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Box, HStack, IconButton, Tooltip } from '@chakra-ui/react';

interface RichTextEditorProps {
  content: any;
  onChange: (content: any, plainText: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Write your message...',
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-brand-primary underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const text = editor.getText();
      onChange(json, text);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[120px] px-4 py-3',
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <Box
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="lg"
      bg="bg.secondary"
      overflow="hidden"
    >
      {/* Toolbar */}
      <HStack
        px={2}
        py={1}
        borderBottom="1px solid"
        borderColor="border.subtle"
        bg="bg.tertiary"
        gap={1}
      >
        <Tooltip label="Bold">
          <IconButton
            aria-label="Bold"
            size="sm"
            variant={editor.isActive('bold') ? 'solid' : 'ghost'}
            onClick={() => editor.chain().focus().toggleBold().run()}
            color={editor.isActive('bold') ? 'brand.primary' : 'text.secondary'}
          >
            <BoldIcon />
          </IconButton>
        </Tooltip>
        <Tooltip label="Italic">
          <IconButton
            aria-label="Italic"
            size="sm"
            variant={editor.isActive('italic') ? 'solid' : 'ghost'}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            color={editor.isActive('italic') ? 'brand.primary' : 'text.secondary'}
          >
            <ItalicIcon />
          </IconButton>
        </Tooltip>
        <Tooltip label="Bullet List">
          <IconButton
            aria-label="Bullet List"
            size="sm"
            variant={editor.isActive('bulletList') ? 'solid' : 'ghost'}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            color={editor.isActive('bulletList') ? 'brand.primary' : 'text.secondary'}
          >
            <ListIcon />
          </IconButton>
        </Tooltip>
        <Tooltip label="Numbered List">
          <IconButton
            aria-label="Numbered List"
            size="sm"
            variant={editor.isActive('orderedList') ? 'solid' : 'ghost'}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            color={editor.isActive('orderedList') ? 'brand.primary' : 'text.secondary'}
          >
            <OrderedListIcon />
          </IconButton>
        </Tooltip>
        <Tooltip label="Link">
          <IconButton
            aria-label="Link"
            size="sm"
            variant={editor.isActive('link') ? 'solid' : 'ghost'}
            onClick={setLink}
            color={editor.isActive('link') ? 'brand.primary' : 'text.secondary'}
          >
            <LinkIcon />
          </IconButton>
        </Tooltip>
      </HStack>

      {/* Editor Content */}
      <Box
        sx={{
          '.ProseMirror': {
            minHeight: '120px',
            p: 4,
            '&:focus': {
              outline: 'none',
            },
            'p.is-editor-empty:first-of-type::before': {
              color: 'text.tertiary',
              content: 'attr(data-placeholder)',
              float: 'left',
              height: 0,
              pointerEvents: 'none',
            },
            'ul, ol': {
              paddingLeft: '1.5rem',
            },
            'a': {
              color: 'brand.primary',
              textDecoration: 'underline',
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}

// Simple inline SVG icons
function BoldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6V4zm0 8h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6v-8z" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="4" x2="10" y2="4"/>
      <line x1="14" y1="20" x2="5" y2="20"/>
      <line x1="15" y1="4" x2="9" y2="20"/>
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <circle cx="4" cy="6" r="1" fill="currentColor"/>
      <circle cx="4" cy="12" r="1" fill="currentColor"/>
      <circle cx="4" cy="18" r="1" fill="currentColor"/>
    </svg>
  );
}

function OrderedListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="10" y1="6" x2="21" y2="6"/>
      <line x1="10" y1="12" x2="21" y2="12"/>
      <line x1="10" y1="18" x2="21" y2="18"/>
      <text x="3" y="8" fontSize="8" fill="currentColor" fontWeight="bold">1</text>
      <text x="3" y="14" fontSize="8" fill="currentColor" fontWeight="bold">2</text>
      <text x="3" y="20" fontSize="8" fill="currentColor" fontWeight="bold">3</text>
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  );
}
