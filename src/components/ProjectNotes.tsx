"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { useTranslation } from '@/lib/i18n';
import { Bold, Italic, List, ListOrdered, CheckSquare, Heading1, Heading2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProjectNotes({ projectId }: { projectId: string }) {
  const { projects, updateProject, settings } = useStore();
  const t = useTranslation(settings.language);
  const project = projects.find((p) => p.id === projectId);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] }
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: 'Write your ideas here...',
      }),
    ],
    content: project?.notes || '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px]',
      },
    },
    onUpdate: ({ editor }) => {
      setIsSaving(true);
      // Auto-save logic (debounced would be better but direct is fine for small local text)
      updateProject(projectId, { notes: editor.getHTML() });
      setTimeout(() => {
        setIsSaving(false);
        setSaveMessage(t("saved"));
        setTimeout(() => setSaveMessage(""), 2000);
      }, 500);
    },
  });

  if (!editor) {
    return null;
  }

  const MenuBar = () => {
    return (
      <div className="flex flex-wrap items-center gap-1 p-2 mb-4 bg-background border border-card-border rounded-lg sticky top-0 z-10">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn("p-2 rounded-md hover:bg-card transition-colors", editor.isActive('bold') ? 'bg-card text-primary' : 'text-muted-foreground')}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn("p-2 rounded-md hover:bg-card transition-colors", editor.isActive('italic') ? 'bg-card text-primary' : 'text-muted-foreground')}
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-card-border mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn("p-2 rounded-md hover:bg-card transition-colors", editor.isActive('heading', { level: 1 }) ? 'bg-card text-primary' : 'text-muted-foreground')}
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn("p-2 rounded-md hover:bg-card transition-colors", editor.isActive('heading', { level: 2 }) ? 'bg-card text-primary' : 'text-muted-foreground')}
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-card-border mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn("p-2 rounded-md hover:bg-card transition-colors", editor.isActive('bulletList') ? 'bg-card text-primary' : 'text-muted-foreground')}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn("p-2 rounded-md hover:bg-card transition-colors", editor.isActive('orderedList') ? 'bg-card text-primary' : 'text-muted-foreground')}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={cn("p-2 rounded-md hover:bg-card transition-colors", editor.isActive('taskList') ? 'bg-card text-primary' : 'text-muted-foreground')}
        >
          <CheckSquare className="w-4 h-4" />
        </button>

        <div className="ml-auto text-xs text-muted-foreground flex items-center gap-1 px-2">
          {isSaving ? (
            <span className="animate-pulse">Saving...</span>
          ) : saveMessage ? (
            <span className="flex items-center gap-1 text-green-500"><Check className="w-3 h-3"/> {saveMessage}</span>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full relative editor-wrapper">
      <MenuBar />
      <div className="px-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
