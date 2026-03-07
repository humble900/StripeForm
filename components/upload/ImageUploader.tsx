import React, { useEffect, useRef, useState } from "react";

export type UploadStatus = "idle" | "uploading" | "done" | "error";
export type ImageItem = {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: UploadStatus;
  error?: string;
  remoteUrl?: string;
};

export type ImageUploaderProps = {
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  value?: ImageItem[];
  onChange?: (items: ImageItem[]) => void;
  uploadHandler?: (
    file: File,
    onProgress: (p: number) => void,
  ) => Promise<string>;
  allowCrop?: boolean;
  title?: string;
  helperText?: string;
  className?: string;
  compact?: boolean;
  layout?: "card" | "inline";
};

export function ImageUploader({
  accept = "image/*",
  maxFiles = 10,
  maxSizeMB = 5,
  value,
  onChange,
  uploadHandler,
  allowCrop = false,
  title = "Upload images",
  helperText = "Drag & drop or click to upload",
  className = "",
  compact = false,
  layout = "card",
}: ImageUploaderProps) {
  const storageKey = `imguploader:${accept}:${maxFiles}:${maxSizeMB}`;
  const [items, setItems] = useState<ImageItem[]>(
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
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) setItems(value);
  }, [value]);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {}
  }, [items, storageKey]);
  const emit = (next: ImageItem[]) => {
    setItems(next);
    onChange?.(next);
  };

  const validate = (file: File) => {
    const errors: string[] = [];
    const ok = matchAccept(file, accept);
    if (!ok) errors.push("Unsupported image type.");
    if (file.size > maxSizeMB * 1024 * 1024)
      errors.push(`Max size ${maxSizeMB}MB.`);
    return errors;
  };

  const addFiles = async (files: FileList | File[]) => {
    const current = [...items];
    const room = Math.max(0, maxFiles - current.length);
    const selected = Array.from(files).slice(0, room);
    if (selected.length === 0) return;
    const prepared: ImageItem[] = selected.map((file) => {
      const errors = validate(file);
      return {
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        progress: 0,
        status: errors.length ? "error" : "idle",
        error: errors[0],
      };
    });
    emit([...current, ...prepared]);
  };

  const remove = (id: string) => emit(items.filter((i) => i.id !== id));
  const controllers = useRef<Record<string, AbortController>>({});

  const startUpload = async (id: string) => {
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const next = [...items];
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
      n[idx] = { ...n[idx], status: "done", progress: 100, remoteUrl: url };
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
    items.forEach((i) => i.status === "idle" && startUpload(i.id));

  if (layout === "inline") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => void addFiles(e.target.files || [])}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-2.5 py-1.5 text-xs rounded-md border hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700"
        >
          Upload
        </button>
        <div className="flex-1">
          <input
            type="url"
            value={items[0]?.remoteUrl || items[0]?.previewUrl || ""}
            onChange={(e) => {
              const url = e.target.value;
              if (!url) {
                emit([]);
                return;
              }
              const it: ImageItem = {
                id: items[0]?.id || crypto.randomUUID(),
                file:
                  (items[0]?.file as any) || new File([new Blob()], "image"),
                previewUrl: url,
                progress: 100,
                status: "done",
                remoteUrl: url,
              };
              emit([it]);
            }}
            className="form-input text-xs w-full"
            placeholder="https://image.url"
          />
        </div>
        {items[0] && (
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded border overflow-hidden bg-gray-50">
              <img
                src={items[0].remoteUrl || items[0].previewUrl}
                alt="preview"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={() => emit([])}
              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 8.586l3.95-3.95a1 1 0 111.414 1.415L11.414 10l3.95 3.95a1 1 0 01-1.414 1.415L10 11.414l-3.95 3.95a1 1 0 01-1.415-1.414L8.586 10l-3.95-3.95A1 1 0 116.05 4.636L10 8.586z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className={`rounded-xl border ${isDragging ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"} shadow-sm hover:shadow transition`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          void addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <div className={`${compact ? "px-3 py-4" : "px-6 py-10"} text-center`}>
          <div
            className={`mx-auto mb-3 flex ${compact ? "h-8 w-8" : "h-12 w-12"} items-center justify-center rounded-lg bg-white ring-1 ring-gray-100 shadow dark:bg-gray-900 dark:ring-gray-700`}
          >
            <svg
              className={`${compact ? "h-4 w-4" : "h-6 w-6"} text-gray-500 dark:text-gray-300`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M3 12l3.2-3.2a2 2 0 012.8 0l2.5 2.5a2 2 0 002.8 0L19 7"
              />
            </svg>
          </div>
          <div
            className={`${compact ? "text-sm" : "text-base"} font-medium text-gray-800 dark:text-gray-100`}
          >
            {title}
          </div>
          <div
            className={`${compact ? "text-xs" : "text-sm"} text-gray-500 dark:text-gray-400`}
          >
            {helperText}
          </div>
          <div
            className={`${compact ? "text-[10px]" : "text-xs"} text-gray-400 dark:text-gray-500`}
          >
            Images • Max {maxFiles} • {maxSizeMB}MB each
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => void addFiles(e.target.files || [])}
        />
      </div>

      {items.some((i) => i.error) && (
        <div className="mt-2 space-y-1">
          {items
            .filter((i) => i.error)
            .map((i) => (
              <div key={i.id} className="text-xs text-red-600">
                {i.error}
              </div>
            ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Selected ({items.length}/{maxFiles})
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={startAll}
                className="px-3 py-1.5 text-xs rounded-md bg-gray-900 text-white shadow hover:shadow-md transition"
              >
                Upload all
              </button>
              <button
                type="button"
                onClick={() =>
                  items
                    .filter((i) => i.status === "error")
                    .forEach((i) => startUpload(i.id))
                }
                className="px-3 py-1.5 text-xs rounded-md border hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700"
              >
                Retry failed
              </button>
              <button
                type="button"
                onClick={() =>
                  items
                    .filter((i) => i.status === "uploading")
                    .forEach((i) => {
                      controllers.current[i.id]?.abort?.();
                    })
                }
                className="px-3 py-1.5 text-xs rounded-md border hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700"
              >
                Cancel all
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {items.map((it) => (
              <div
                key={it.id}
                className="group relative rounded-lg bg-white shadow-sm ring-1 ring-black/5 overflow-hidden dark:bg-gray-900 dark:ring-gray-700"
              >
                <div className="aspect-square bg-gray-50 dark:bg-gray-800">
                  <img
                    src={it.previewUrl}
                    alt={it.file.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className={`${compact ? "px-2 py-1.5" : "px-2.5 py-2"}`}>
                  <div className="truncate text-xs text-gray-800 dark:text-gray-200">
                    {it.file.name}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    {(it.file.size / 1024 / 1024).toFixed(2)} MB •{" "}
                    {it.file.type || "image"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(it.id)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 shadow ring-1 ring-gray-200 transition hover:bg-white dark:bg-gray-800/90 dark:ring-gray-600"
                  aria-label="Remove"
                >
                  <svg
                    className="h-3.5 w-3.5 text-gray-700 dark:text-gray-200"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 8.586l3.95-3.95a1 1 0 111.414 1.415L11.414 10l3.95 3.95a1 1 0 01-1.414 1.415L10 11.414l-3.95 3.95a1 1 0 01-1.415-1.414L8.586 10l-3.95-3.95A1 1 0 116.05 4.636L10 8.586z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {(it.status === "uploading" ||
                  it.status === "done" ||
                  it.status === "error") && (
                  <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gray-100 dark:bg-gray-700">
                    <div
                      className={`h-full transition-all ${it.status === "error" ? "bg-red-500" : it.status === "done" ? "bg-emerald-500" : "bg-blue-600"}`}
                      style={{ width: `${it.progress}%` }}
                    />
                  </div>
                )}
                {it.status !== "done" && (
                  <div
                    className={`absolute inset-0 flex items-end justify-end ${compact ? "p-1.5" : "p-2"}`}
                  >
                    <button
                      type="button"
                      onClick={() => startUpload(it.id)}
                      className="rounded bg-white/90 px-2 py-1 text-[11px] shadow ring-1 ring-gray-200 hover:bg-white transition dark:bg-gray-800/90 dark:ring-gray-600"
                    >
                      {it.status === "error"
                        ? "Retry"
                        : it.status === "uploading"
                          ? "Uploading…"
                          : "Upload"}
                    </button>
                    {it.status === "uploading" && (
                      <button
                        type="button"
                        onClick={() => {
                          controllers.current[it.id]?.abort?.();
                          remove(it.id);
                        }}
                        className="ml-1 rounded bg-white/90 px-2 py-1 text-[11px] shadow ring-1 ring-gray-200 hover:bg-white transition dark:bg-gray-800/90 dark:ring-gray-600"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function defaultSimUpload(file: File, onProgress: (p: number) => void) {
  let p = 0;
  while (p < 100) {
    await sleep(150 + Math.random() * 150);
    p += 8 + Math.random() * 12;
    onProgress(Math.min(100, p));
  }
  return URL.createObjectURL(file);
}

function matchAccept(file: File, accept: string): boolean {
  const parts = accept
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return parts.some((rule) => {
    if (rule === "*/*") return true;
    if (rule.endsWith("/*")) {
      const prefix = rule.slice(0, rule.length - 1);
      return type.startsWith(prefix);
    }
    if (rule.startsWith(".")) {
      return name.endsWith(rule.toLowerCase());
    }
    return type === rule;
  });
}
