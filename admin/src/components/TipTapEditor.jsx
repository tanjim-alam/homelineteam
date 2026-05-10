import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import Image from '@tiptap/extension-image'
import { useEffect, useCallback, useRef } from 'react'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Minus,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Link2Off,
  Undo2, Redo2, Highlighter,
  Type, ImageIcon,
} from 'lucide-react'

/* ─── toolbar button ──────────────────────────────────────────── */
function Btn({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      disabled={disabled}
      title={title}
      className={`
        w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all duration-100 flex-shrink-0
        ${active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}
        ${disabled ? 'opacity-30 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
      `}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-0.5 flex-shrink-0" />
}

/* ─── main editor ────────────────────────────────────────────── */
export default function TipTapEditor({ value, onChange, placeholder = 'Start writing…', minHeight = 320 }) {
  const fileInputRef = useRef(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        code: { HTMLAttributes: { class: 'bg-gray-100 rounded px-1.5 py-0.5 font-mono text-sm text-rose-600' } },
        blockquote: { HTMLAttributes: { class: 'border-l-4 border-blue-400 pl-4 italic text-gray-600' } },
        bulletList: { HTMLAttributes: { class: 'list-disc pl-6 space-y-1' } },
        orderedList: { HTMLAttributes: { class: 'list-decimal pl-6 space-y-1' } },
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 underline underline-offset-2 cursor-pointer' },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl max-w-full my-4 shadow-sm border border-gray-200',
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      CharacterCount,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[inherit]',
        style: `min-height: ${minHeight}px`,
      },
    },
  })

  // Sync external value changes (e.g., loading edit data)
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value !== current && value !== undefined) {
      editor.commands.setContent(value || '', false)
    }
  }, [value, editor])

  const setLink = useCallback(() => {
    if (!editor) return
    const prev = editor.getAttributes('link').href
    const url  = window.prompt('URL', prev || 'https://')
    if (url === null) return
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const handleImageFile = useCallback((file) => {
    if (!file || !editor) return
    const reader = new FileReader()
    reader.onload = (e) => {
      editor.chain().focus().setImage({ src: e.target.result }).run()
    }
    reader.readAsDataURL(file)
  }, [editor])

  const triggerImageUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  if (!editor) return null

  const words = editor.storage.characterCount?.words?.() ?? 0
  const chars = editor.storage.characterCount?.characters?.() ?? 0

  return (
    <div className="flex flex-col border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">

      {/* hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { handleImageFile(e.target.files[0]); e.target.value = '' }}
      />

      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2.5 border-b border-gray-100 bg-gray-50/80">

        {/* History */}
        <Btn onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
          <Undo2 className="w-3.5 h-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()} title="Redo (Ctrl+Y)">
          <Redo2 className="w-3.5 h-3.5" />
        </Btn>

        <Divider />

        {/* Headings */}
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })} title="Heading 1">
          <Heading1 className="w-3.5 h-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 className="w-3.5 h-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 className="w-3.5 h-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive('paragraph')} title="Normal text">
          <Type className="w-3.5 h-3.5" />
        </Btn>

        <Divider />

        {/* Inline formatting */}
        <Btn onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')} title="Bold (Ctrl+B)">
          <Bold className="w-3.5 h-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')} title="Italic (Ctrl+I)">
          <Italic className="w-3.5 h-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')} title="Underline (Ctrl+U)">
          <UnderlineIcon className="w-3.5 h-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough className="w-3.5 h-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive('highlight')} title="Highlight">
          <Highlighter className="w-3.5 h-3.5" />
        </Btn>

        <Divider />

        {/* Lists */}
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')} title="Bullet list">
          <List className="w-3.5 h-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')} title="Numbered list">
          <ListOrdered className="w-3.5 h-3.5" />
        </Btn>

        <Divider />

        {/* Blocks */}
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')} title="Blockquote">
          <Quote className="w-3.5 h-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')} title="Inline code">
          <Code className="w-3.5 h-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider line">
          <Minus className="w-3.5 h-3.5" />
        </Btn>

        <Divider />

        {/* Alignment */}
        <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })} title="Align left">
          <AlignLeft className="w-3.5 h-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })} title="Align center">
          <AlignCenter className="w-3.5 h-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })} title="Align right">
          <AlignRight className="w-3.5 h-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          active={editor.isActive({ textAlign: 'justify' })} title="Justify">
          <AlignJustify className="w-3.5 h-3.5" />
        </Btn>

        <Divider />

        {/* Link */}
        <Btn onClick={setLink} active={editor.isActive('link')} title="Insert / edit link">
          <LinkIcon className="w-3.5 h-3.5" />
        </Btn>
        {editor.isActive('link') && (
          <Btn onClick={() => editor.chain().focus().unsetLink().run()} title="Remove link">
            <Link2Off className="w-3.5 h-3.5" />
          </Btn>
        )}

        <Divider />

        {/* Image upload */}
        <Btn onClick={triggerImageUpload} title="Insert image">
          <ImageIcon className="w-3.5 h-3.5" />
        </Btn>
      </div>

      {/* ── Editable area ────────────────────────────────────── */}
      <div
        className="px-6 py-5 flex-1 cursor-text"
        onClick={() => editor.commands.focus()}
      >
        <EditorContent editor={editor} />
      </div>

      {/* ── Footer: word count ───────────────────────────────── */}
      <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span><span className="font-semibold text-gray-600">{words}</span> words</span>
          <span><span className="font-semibold text-gray-600">{chars}</span> characters</span>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
          words < 100
            ? 'bg-amber-50 text-amber-600'
            : words < 300
            ? 'bg-blue-50 text-blue-600'
            : 'bg-emerald-50 text-emerald-600'
        }`}>
          {words < 100 ? 'Too short — aim for 300+ words' : words < 300 ? 'Good start — keep writing' : 'Great length for SEO ✓'}
        </span>
      </div>
    </div>
  )
}
