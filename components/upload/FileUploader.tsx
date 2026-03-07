import React, { useEffect, useRef, useState } from "react";

type UploadStatus = "idle" | "uploading" | "done" | "error";
type FileRow = {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: UploadStatus;
  error?: string;
  remoteUrl?: string;
};

export type FileUploaderProps = {
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  value?: FileRow[];
  onChange?: (rows: FileRow[]) => void;
  uploadHandler?: (
    file: File,
    onProgress: (p: number) => void,
  ) => Promise<string>;
  title?: string;
  helper?: string;
  accent?: string;
  className?: string;
};

export function FileUploader({
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.zip,.rar,.7z,.txt",
  maxSizeMB = 10,
  multiple = true,
  value,
  onChange,
  uploadHandler,
  title = "Upload files",
  helper = "Drag & drop or click to select",
  accent = "bg-blue-600",
  className = "",
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setDragging] = useState(false);
  const storageKey = `fileuploader:${accept}:${maxSizeMB}:${multiple}`;
  const [rows, setRows] = useState<FileRow[]>(
    value ??
      (() => {
        try {
          const raw = localStorage.getItem(storageKey);
          return raw ? JSON.parse(raw) : [];
        } catch {
          return [];
        }
      })(),
  );
  const controllers = useRef<Record<string, AbortController>>({});

  useEffect(() => {
    if (value) setRows(value);
  }, [value]);
  const emit = (next: FileRow[]) => {
    setRows(next);
    onChange?.(next);
  };
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(rows));
    } catch {}
  }, [rows, storageKey]);

  const ext = (name: string) =>
    name.includes(".") ? name.split(".").pop()!.toLowerCase() : "";
  const fmt = (b: number) => (b / 1024 / 1024).toFixed(2) + " MB";

  const icon = (type: string, name: string) => {
    const e = ext(name);
    const base = "w-5 h-5";
    if (e === "pdf")
      return (
        <svg
          className={`${base} text-red-500`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M6 2h7l5 5v15a2 2 0 0 1-2 2H6z" />
        </svg>
      );
    if (["doc", "docx", "txt", "md"].includes(e))
      return (
        <svg
          className={`${base} text-blue-500`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M6 2h7l5 5v15a2 2 0 0 1-2 2H6z" />
        </svg>
      );
    if (["xls", "xlsx", "csv"].includes(e))
      return (
        <svg
          className={`${base} text-emerald-500`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M6 2h7l5 5v15a2 2 0 0 1-2 2H6z" />
        </svg>
      );
    if (["ppt", "pptx"].includes(e))
      return (
        <svg
          className={`${base} text-orange-500`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M6 2h7l5 5v15a2 2 0 0 1-2 2H6z" />
        </svg>
      );
    if (["zip", "rar", "7z"].includes(e))
      return (
        <svg
          className={`${base} text-yellow-500`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M7 2h10a2 2 0 0 1 2 2v16H5V4a2 2 0 0 1 2-2z" />
        </svg>
      );
    return (
      <svg
        className={`${base} text-gray-500`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M6 2h7l5 5v15a2 2 0 0 1-2 2H6z" />
      </svg>
    );
  };

  const validate = (file: File) => {
    const errors: string[] = [];
    const ok = matchAccept(file, accept);
    if (!ok) errors.push("Unsupported file type.");
    if (file.size > maxSizeMB * 1024 * 1024)
      errors.push(`File exceeds ${maxSizeMB}MB.`);
    return errors;
  };

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files);
    const next = [...rows];
    list.forEach((file) => {
      const errors = validate(file);
      const row: FileRow = {
        id: crypto.randomUUID(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: errors.length ? "error" : "idle",
        error: errors[0],
      };
      if (!multiple) next.splice(0, next.length, row);
      else next.push(row);
    });
    emit(next);
  };

  const removeRow = (id: string) => emit(rows.filter((r) => r.id !== id));
  const replaceRow = (id: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const errors = validate(file);
      const idx = rows.findIndex((r) => r.id === id);
      if (idx === -1) return;
      const updated: FileRow = {
        ...rows[idx],
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: errors.length ? "error" : "idle",
        error: errors[0],
      };
      const next = [...rows];
      next[idx] = updated;
      emit(next);
    };
    input.click();
  };

  const startUpload = async (id: string) => {
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) return;
    const next = [...rows];
    next[idx] = {
      ...next[idx],
      status: "uploading",
      progress: 1,
      error: undefined,
    };
    emit(next);

    const ctrl = new AbortController();
    controllers.current[id] = ctrl;
    const onProgress = (p: number) => {
      const n = [...next];
      n[idx] = { ...n[idx], progress: Math.min(99, Math.floor(p)) };
      emit(n);
    };
    try {
      const url = await (uploadHandler ?? defaultSimUpload)(
        next[idx].file,
        onProgress,
      );
      const n = [...next];
      n[idx] = { ...n[idx], progress: 100, status: "done", remoteUrl: url };
      emit(n);
    } catch (e: any) {
      const n = [...next];
      n[idx] = {
        ...n[idx],
        status: "error",
        error: e?.message || "Upload failed",
      };
      emit(n);
    }
  };

  const startAll = () =>
    rows.forEach((r) => r.status === "idle" && startUpload(r.id));

  return (
    <div className={className}>
      <div
        className={`rounded-xl border ${isDragging ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"} shadow-sm hover:shadow transition`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <div className="px-6 py-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-white ring-1 ring-gray-100 shadow dark:bg-gray-900 dark:ring-gray-700">
            <svg
              className="h-6 w-6 text-gray-500 dark:text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 16.5V19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2.5M3 12l3.2-3.2a2 2 0 0 1 2.8 0l2.5 2.5a2 2 0 0 0 2.8 0L19 7"
              />
            </svg>
          </div>
          <div className="text-base font-medium text-gray-800 dark:text-gray-100">
            {title}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {helper}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            Docs • PDFs • Sheets • Slides • Archives • Max {maxSizeMB}MB
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {rows.some((r) => r.error) && (
        <div className="mt-2 space-y-1">
          {rows
            .filter((r) => r.error)
            .map((r) => (
              <div key={r.id} className="text-xs text-red-600">
                {r.error}
              </div>
            ))}
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-4 rounded-xl bg-white ring-1 ring-black/5 shadow-sm dark:bg-gray-900 dark:ring-gray-700">
          <div className="grid grid-cols-12 border-b bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <div className="col-span-6 sm:col-span-7">File</div>
            <div className="hidden sm:block sm:col-span-2">Type</div>
            <div className="col-span-3 sm:col-span-2">Size</div>
            <div className="col-span-3 sm:col-span-1 text-right">Action</div>
          </div>
          <ul className="divide-y dark:divide-gray-800">
            {rows.map((r) => (
              <li
                key={r.id}
                className="grid grid-cols-12 items-center px-3 py-2 text-sm"
              >
                <div className="col-span-6 sm:col-span-7 flex items-center gap-2">
                  {icon(r.type, r.name)}
                  <span className="truncate dark:text-gray-200">{r.name}</span>
                </div>
                <div className="hidden sm:block sm:col-span-2 text-gray-500 dark:text-gray-400">
                  {ext(r.name).toUpperCase() || "—"}
                </div>
                <div className="col-span-3 sm:col-span-2 text-gray-500 dark:text-gray-400">
                  {fmt(r.size)}
                </div>
                <div className="col-span-3 sm:col-span-1 flex items-center justify-end gap-2">
                  {r.status !== "done" && (
                    <button
                      onClick={() => startUpload(r.id)}
                      className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700"
                    >
                      {r.status === "uploading" ? "Uploading…" : "Upload"}
                    </button>
                  )}
                  {r.status === "uploading" && (
                    <button
                      onClick={() => {
                        controllers.current[r.id]?.abort?.();
                        removeRow(r.id);
                      }}
                      className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    onClick={() => replaceRow(r.id)}
                    className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700"
                  >
                    Replace
                  </button>
                  <button
                    onClick={() => removeRow(r.id)}
                    className="rounded border px-2 py-1 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700"
                  >
                    Remove
                  </button>
                </div>
                {(r.status === "uploading" ||
                  r.status === "done" ||
                  r.status === "error") && (
                  <div className="col-span-12 mt-2 h-1.5 overflow-hidden rounded bg-gray-100 dark:bg-gray-700">
                    <div
                      className={`h-full transition-all ${r.status === "error" ? "bg-red-500" : r.status === "done" ? "bg-emerald-500" : "bg-blue-600"}`}
                      style={{ width: `${r.progress}%` }}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-end gap-2 px-3 py-2">
            <button
              onClick={() =>
                rows.forEach((r) => r.status === "idle" && startUpload(r.id))
              }
              className="rounded bg-gray-900 px-3 py-1.5 text-xs text-white hover:opacity-90"
            >
              Upload all
            </button>
            <button
              onClick={() =>
                rows
                  .filter((r) => r.status === "error")
                  .forEach((r) => startUpload(r.id))
              }
              className="rounded border px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700"
            >
              Retry failed
            </button>
            <button
              onClick={() =>
                rows
                  .filter((r) => r.status === "uploading")
                  .forEach((r) => {
                    controllers.current[r.id]?.abort?.();
                  })
              }
              className="rounded border px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700"
            >
              Cancel all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function defaultSimUpload(
  file: File,
  onProgress: (p: number) => void,
): Promise<string> {
  let p = 0;
  while (p < 100) {
    await sleep(180 + Math.random() * 220);
    p += 7 + Math.random() * 9;
    onProgress(Math.min(100, p));
  }
  return URL.createObjectURL(file);
}

function matchAccept(file: File, accept: string): boolean {
  const rules = accept
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (rules.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return rules.some((rule) => {
    if (rule === "*/*") return true;
    if (rule.endsWith("/*")) {
      const prefix = rule.slice(0, rule.length - 1);
      return type.startsWith(prefix);
    }
    if (rule.startsWith(".")) return name.endsWith(rule);
    return type === rule;
  });
}

// Removed stray re-export that caused duplicate export errors
