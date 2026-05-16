"use client"

import { useRef, useState } from "react"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  IconAlignCenter as AlignCenterIcon,
  IconAlignLeft as AlignLeftIcon,
  IconAlignRight as AlignRightIcon,
  IconArrowBackUp as Undo2Icon,
  IconArrowForwardUp as Redo2Icon,
  IconBold as BoldIcon,
  IconClearFormatting as RemoveFormattingIcon,
  IconCode as CodeIcon,
  IconH1 as Heading1Icon,
  IconH2 as Heading2Icon,
  IconH3 as Heading3Icon,
  IconH4 as Heading4Icon,
  IconItalic as ItalicIcon,
  IconLink as LinkIcon,
  IconList as ListIcon,
  IconListNumbers as ListOrderedIcon,
  IconPhoto as ImageIcon,
  IconPencil as VisualEditorIcon,
  IconPilcrow as PilcrowIcon,
  IconQuote as QuoteIcon,
  IconUnderline as UnderlineIcon,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type TiptapEditorProps = {
  value: string
  onChange: (value: string) => void
}

function ToolbarButton({
  active,
  children,
  onClick,
  title,
}: {
  active?: boolean
  children: React.ReactNode
  onClick: () => void
  title: string
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="icon-sm"
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      {children}
    </Button>
  )
}

export function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<"visual" | "html">("visual")
  const [uploadError, setUploadError] = useState<string | null>(null)
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg border",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: "tiptap-content min-h-96 px-4 py-3 focus:outline-none",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return null
  }

  const activeEditor = editor

  function showVisualEditor() {
    activeEditor.commands.setContent(value)
    setMode("visual")
  }

  async function uploadImage(file: File) {
    setUploadError(null)
    const altText = window.prompt("Alt text cho anh") ?? ""
    const formData = new FormData()
    formData.append("file", file)
    formData.append("altText", altText)

    const response = await fetch("/api/admin/media/upload", {
      method: "POST",
      body: formData,
    })
    const data = await response.json()

    if (!response.ok) {
      setUploadError(data.error ?? "Khong the tai anh len.")
      return
    }

    activeEditor
      .chain()
      .focus()
      .setImage({ src: data.url, alt: data.altText ?? "" })
      .run()
  }

  function setLink() {
    const previousUrl = activeEditor.getAttributes("link").href as string | undefined
    const url = window.prompt("Nhap URL lien ket", previousUrl ?? "")

    if (url === null) return

    if (url === "") {
      activeEditor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    activeEditor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ""
          if (file) void uploadImage(file)
        }}
      />
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b bg-muted/95 p-2 backdrop-blur">
        <div className="mr-2 flex rounded-md border bg-background p-0.5">
          <Button
            type="button"
            variant={mode === "visual" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2"
            onClick={showVisualEditor}
          >
            <VisualEditorIcon />
            Visual
          </Button>
          <Button
            type="button"
            variant={mode === "html" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2"
            onClick={() => setMode("html")}
          >
            <CodeIcon />
            HTML
          </Button>
        </div>

        {mode === "visual" ? (
          <>
            <ToolbarButton title="Paragraph" active={editor.isActive("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()}>
              <PilcrowIcon />
            </ToolbarButton>
            <ToolbarButton title="H1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
              <Heading1Icon />
            </ToolbarButton>
            <ToolbarButton title="H2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <Heading2Icon />
            </ToolbarButton>
            <ToolbarButton title="H3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
              <Heading3Icon />
            </ToolbarButton>
            <ToolbarButton title="H4" active={editor.isActive("heading", { level: 4 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>
              <Heading4Icon />
            </ToolbarButton>
            <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
              <BoldIcon />
            </ToolbarButton>
            <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
              <ItalicIcon />
            </ToolbarButton>
            <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
              <UnderlineIcon />
            </ToolbarButton>
            <ToolbarButton title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
              <ListIcon />
            </ToolbarButton>
            <ToolbarButton title="Ordered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
              <ListOrderedIcon />
            </ToolbarButton>
            <ToolbarButton title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
              <QuoteIcon />
            </ToolbarButton>
            <ToolbarButton title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
              <CodeIcon />
            </ToolbarButton>
            <ToolbarButton title="Align left" onClick={() => editor.chain().focus().setTextAlign("left").run()}>
              <AlignLeftIcon />
            </ToolbarButton>
            <ToolbarButton title="Align center" onClick={() => editor.chain().focus().setTextAlign("center").run()}>
              <AlignCenterIcon />
            </ToolbarButton>
            <ToolbarButton title="Align right" onClick={() => editor.chain().focus().setTextAlign("right").run()}>
              <AlignRightIcon />
            </ToolbarButton>
            <ToolbarButton title="Link" active={editor.isActive("link")} onClick={setLink}>
              <LinkIcon />
            </ToolbarButton>
            <ToolbarButton title="Remove link" onClick={() => editor.chain().focus().unsetLink().run()}>
              <RemoveFormattingIcon />
            </ToolbarButton>
            <ToolbarButton title="Upload image" onClick={() => inputRef.current?.click()}>
              <ImageIcon />
            </ToolbarButton>
            <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
              <Undo2Icon />
            </ToolbarButton>
            <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
              <Redo2Icon />
            </ToolbarButton>
          </>
        ) : null}
      </div>
      {uploadError ? (
        <div className="border-b bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {uploadError}
        </div>
      ) : null}
      {mode === "visual" ? (
        <>
          <EditorContent
            editor={editor}
            className={cn("max-h-[70vh] overflow-y-auto bg-background")}
          />
          <div className="border-t p-2">
            <Input
              placeholder="Paste image URL and press Enter"
              onKeyDown={(event) => {
                if (event.key !== "Enter") return
                event.preventDefault()
                const value = event.currentTarget.value.trim()
                if (!value) return
                editor.chain().focus().setImage({ src: value }).run()
                event.currentTarget.value = ""
              }}
            />
          </div>
        </>
      ) : (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          className="max-h-[70vh] min-h-96 w-full resize-y overflow-y-auto bg-background px-4 py-3 font-mono text-sm outline-none"
        />
      )}
    </div>
  )
}
