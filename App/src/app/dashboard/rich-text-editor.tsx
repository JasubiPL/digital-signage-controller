"use client";

import type { MouseEvent, ReactNode } from "react";
import { useRef, useState } from "react";
import { FiBold, FiItalic, FiLink, FiList, FiType } from "react-icons/fi";

import { Field } from "./components";

export const toolbarButtonClass =
  "inline-grid h-9 w-9 place-items-center rounded-md border border-[var(--color-border)] bg-[rgba(2,6,23,0.52)] text-[var(--color-text-muted)] transition hover:border-[var(--color-primary-border)] hover:text-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-50";
export const toolbarSelectClass =
  "h-9 rounded-md border border-[var(--color-border)] bg-[rgba(2,6,23,0.52)] px-2 text-xs font-extrabold text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50";

export function RichTextEditor({
  disabled,
  extraToolbar,
  label,
  name,
  onChange,
  placeholder,
  value,
}: Readonly<{
  disabled: boolean;
  extraToolbar?: ReactNode;
  label: string;
  name: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}>) {
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [html, setHtml] = useState(value);

  const bindEditor = (node: HTMLDivElement | null) => {
    editorRef.current = node;

    if (node && node.dataset.editorReady !== "true") {
      node.innerHTML = html;
      node.dataset.editorReady = "true";
    }
  };

  // Persist the caret/selection so it survives losing focus to a toolbar
  // control (notably the native <select> menus, which cannot keep the editor
  // focused on mousedown).
  const saveSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();

    if (!editor || !selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (editor.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  };

  const restoreSelection = () => {
    const selection = window.getSelection();
    const range = savedRangeRef.current;

    if (!selection || !range) return;

    selection.removeAllRanges();
    selection.addRange(range);
  };

  const syncHtml = () => {
    const nextHtml = editorRef.current?.innerHTML ?? "";
    setHtml(nextHtml);
    onChange(nextHtml);
    saveSelection();
  };

  const runCommand = (command: string, commandValue?: string) => {
    if (!editorRef.current) return;

    editorRef.current.focus();
    restoreSelection();
    document.execCommand(command, false, commandValue);
    syncHtml();
  };

  const addLink = () => {
    if (!editorRef.current) return;

    const rawUrl = window.prompt("URL del enlace");
    if (!rawUrl?.trim()) return;

    const url = normalizeUrl(rawUrl.trim());
    editorRef.current.focus();
    restoreSelection();

    if (window.getSelection()?.toString()) {
      document.execCommand("createLink", false, url);
    } else {
      const linkLabel = window.prompt("Texto del enlace", url)?.trim() || url;
      document.execCommand("insertHTML", false, `<a href="${escapeAttribute(url)}">${escapeText(linkLabel)}</a>`);
    }

    syncHtml();
  };

  return (
    <Field label={label}>
      <div className="overflow-hidden rounded-md border border-[var(--color-border)] bg-[rgba(2,6,23,0.34)]">
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] px-3 py-2">
          <button
            aria-label="Negritas"
            className={toolbarButtonClass}
            disabled={disabled}
            onClick={() => runCommand("bold")}
            onMouseDown={preventFocusSteal}
            title="Negritas"
            type="button"
          >
            <FiBold aria-hidden="true" />
          </button>
          <button
            aria-label="Cursiva"
            className={toolbarButtonClass}
            disabled={disabled}
            onClick={() => runCommand("italic")}
            onMouseDown={preventFocusSteal}
            title="Cursiva"
            type="button"
          >
            <FiItalic aria-hidden="true" />
          </button>
          <button
            aria-label="Agregar enlace"
            className={toolbarButtonClass}
            disabled={disabled}
            onClick={addLink}
            onMouseDown={preventFocusSteal}
            title="Agregar enlace"
            type="button"
          >
            <FiLink aria-hidden="true" />
          </button>
          <button
            aria-label="Lista"
            className={toolbarButtonClass}
            disabled={disabled}
            onClick={() => runCommand("insertUnorderedList")}
            onMouseDown={preventFocusSteal}
            title="Lista"
            type="button"
          >
            <FiList aria-hidden="true" />
          </button>
          <span className="ml-1 hidden text-[var(--color-text-muted)] sm:inline-flex">
            <FiType aria-hidden="true" />
          </span>
          <select
            aria-label="Tipografia"
            className={toolbarSelectClass}
            defaultValue=""
            disabled={disabled}
            onChange={(event) => {
              if (!event.currentTarget.value) return;
              runCommand("fontName", event.currentTarget.value);
              event.currentTarget.value = "";
            }}
          >
            <option value="">Fuente</option>
            <option value="sans">Sans</option>
            <option value="serif">Serif</option>
            <option value="mono">Mono</option>
          </select>
          <select
            aria-label="Tamano de letra"
            className={toolbarSelectClass}
            defaultValue=""
            disabled={disabled}
            onChange={(event) => {
              if (!event.currentTarget.value) return;
              runCommand("fontSize", event.currentTarget.value);
              event.currentTarget.value = "";
            }}
          >
            <option value="">Tamano</option>
            <option value="2">Chico</option>
            <option value="3">Normal</option>
            <option value="5">Grande</option>
          </select>
          {extraToolbar}
        </div>
        <input name={name} type="hidden" value={html} />
        <div
          aria-label={label}
          className="rich-text-editor min-h-32 w-full overflow-auto px-4 py-3 text-sm font-semibold leading-7 text-[var(--color-text-primary)] outline-none empty:before:text-[var(--color-text-muted)] empty:before:content-[attr(data-placeholder)] focus:ring-4 focus:ring-[rgba(34,211,238,0.10)]"
          contentEditable={!disabled}
          data-placeholder={placeholder ?? ""}
          onBlur={saveSelection}
          onInput={(event) => {
            setHtml(event.currentTarget.innerHTML);
            onChange(event.currentTarget.innerHTML);
            saveSelection();
          }}
          onKeyUp={saveSelection}
          onMouseUp={saveSelection}
          ref={bindEditor}
          role="textbox"
          suppressContentEditableWarning
        />
        <textarea
          className="sr-only"
          name={`${name}PlainTextCheck`}
          readOnly
          required
          value={stripHtml(html)}
        />
      </div>
    </Field>
  );
}

function preventFocusSteal(event: MouseEvent) {
  // Keep the editor focused and its selection intact when a toolbar button is
  // pressed, so document.execCommand applies to the highlighted text.
  event.preventDefault();
}

function normalizeUrl(value: string) {
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;

  return `https://${value}`;
}

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function stripHtml(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}
