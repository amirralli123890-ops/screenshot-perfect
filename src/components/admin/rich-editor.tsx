import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  ImagePlus,
  Table2,
  Undo,
  Redo,
  Pilcrow,
  Upload,
} from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { validateImage } from "@/lib/validation";
export async function uploadImage(file: File) {
  validateImage(file);
  const path = `${crypto.randomUUID()}.${file.type === "image/jpeg" ? "jpg" : file.type === "image/webp" ? "webp" : "png"}`;
  const r = await supabase.storage
    .from("article-images")
    .upload(path, file, { contentType: file.type });
  if (r.error) throw new Error("Image upload failed. Editorial access is required.");
  return path;
}
export function RichEditor({
  content,
  onChange,
  onError,
}: {
  content: string;
  onChange: (html: string) => void;
  onError: (s: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });
  if (!editor)
    return (
      <div className="min-h-72 border border-border p-5 text-xs text-muted-foreground">
        Preparing editor…
      </div>
    );
  const tools = [
    { name: "Bold", Icon: Bold, run: () => editor.chain().focus().toggleBold().run() },
    { name: "Italic", Icon: Italic, run: () => editor.chain().focus().toggleItalic().run() },
    {
      name: "Underline",
      Icon: Underline,
      run: () => editor.chain().focus().toggleUnderline().run(),
    },
    { name: "Paragraph", Icon: Pilcrow, run: () => editor.chain().focus().setParagraph().run() },
    {
      name: "Heading 1",
      Icon: Heading1,
      run: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      name: "Heading 2",
      Icon: Heading2,
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      name: "Heading 3",
      Icon: Heading3,
      run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    { name: "Bullet list", Icon: List, run: () => editor.chain().focus().toggleBulletList().run() },
    {
      name: "Numbered list",
      Icon: ListOrdered,
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      name: "Align left",
      Icon: AlignLeft,
      run: () => editor.chain().focus().setTextAlign("left").run(),
    },
    {
      name: "Align center",
      Icon: AlignCenter,
      run: () => editor.chain().focus().setTextAlign("center").run(),
    },
    {
      name: "Align right",
      Icon: AlignRight,
      run: () => editor.chain().focus().setTextAlign("right").run(),
    },
    {
      name: "Insert link",
      Icon: LinkIcon,
      run: () => {
        const url = window.prompt("Link URL (https://)");
        if (url?.startsWith("https://")) editor.chain().focus().setLink({ href: url }).run();
      },
    },
    {
      name: "Insert image URL",
      Icon: ImagePlus,
      run: () => {
        const url = window.prompt("Image URL (https://)");
        if (url?.startsWith("https://")) {
          const alt = window.prompt("Image description") ?? "";
          editor.chain().focus().setImage({ src: url, alt }).run();
        }
      },
    },
    {
      name: "Insert table",
      Icon: Table2,
      run: () =>
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    { name: "Undo", Icon: Undo, run: () => editor.chain().focus().undo().run() },
    { name: "Redo", Icon: Redo, run: () => editor.chain().focus().redo().run() },
  ];
  return (
    <div>
      <div className="editor-toolbar">
        {tools.map((t) => (
          <Button
            type="button"
            key={t.name}
            variant="ghost"
            size="icon"
            title={t.name}
            aria-label={t.name}
            onClick={t.run}
          >
            <t.Icon />
          </Button>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Upload content image"
          aria-label="Upload content image"
          onClick={() => input.current?.click()}
        >
          <Upload />
        </Button>
        <input
          ref={input}
          className="hidden"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              const path = await uploadImage(f);
              const signed = await supabase.storage
                .from("article-images")
                .createSignedUrl(path, 3600);
              const alt = window.prompt("Image description") ?? "";
              editor
                .chain()
                .focus()
                .setImage({ src: `/api/public/image?path=${encodeURIComponent(path)}`, alt })
                .run();
              if (signed.error) onError("Image saved; preview will be visible after publication.");
            } catch (e) {
              onError(e instanceof Error ? e.message : "Upload failed.");
            }
          }}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
