import React, { useEffect, useRef, useState } from "react";

type UploadStatus = "idle" | "uploading" | "done" | "error";
type VideoItem = {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  thumbUrl: string;
  duration?: number;
  progress: number;
  status: UploadStatus;
  error?: string;
  remoteUrl?: string;
};

export type VideoUploaderProps = {
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  value?: VideoItem[];
  onChange?: (items: VideoItem[]) => void;
  uploadHandler?: (
    file: File,
    onProgress: (p: number) => void,
  ) => Promise<string>;
  className?: string;
};

export function VideoUploader({
  accept = "video/*",
  maxSizeMB = 10,
  multiple = true,
  value,
  onChange,
  uploadHandler,
  className = "",
}: VideoUploaderProps) {
  const storageKey = `videouploader:${accept}:${maxSizeMB}:${multiple}`;
  const [items, setItems] = useState<VideoItem[]>(
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const controllers = useRef<Record<string, AbortController>>({});

  useEffect(() => {
    if (value) setItems(value);
  }, [value]);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {}
  }, [items, storageKey]);
  const emit = (next: VideoItem[]) => {
    setItems(next);
    onChange?.(next);
  };

  const validate = (file: File) => {
    const errs: string[] = [];
    if (!file.type.startsWith("video/")) errs.push("Only videos allowed.");
    if (file.size > maxSizeMB * 1024 * 1024)
      errs.push(`Max size ${maxSizeMB}MB.`);
    return errs;
  };

  const prepareThumb = async (file: File) => {
    return URL.createObjectURL(file);
  };

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files);
    const prepared: VideoItem[] = await Promise.all(
      list.map(async (file) => {
        const errors = validate(file);
        const thumbUrl = await prepareThumb(file);
        return {
          id: crypto.randomUUID(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          thumbUrl,
          progress: 0,
          status: errors.length ? "error" : "idle",
          error: errors[0],
        };
      }),
    );
    emit(multiple ? [...items, ...prepared] : [prepared[0]]);
  };

  const remove = (id: string) => emit(items.filter((i) => i.id !== id));
  const startUpload = async (id: string) => {
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const base = [...items];
    base[idx] = {
      ...base[idx],
      status: "uploading",
      progress: 1,
      error: undefined,
    };
    emit(base);
    const ctrl = new AbortController();
    controllers.current[id] = ctrl;
    const onProgress = (p: number) => {
      const n = [...base];
      n[idx] = { ...n[idx], progress: Math.min(99, Math.floor(p)) };
      emit(n);
    };
    try {
      const url = await (uploadHandler ?? defaultSimUpload)(
        base[idx].file,
        onProgress,
      );
      const n = [...base];
      n[idx] = { ...n[idx], status: "done", progress: 100, remoteUrl: url };
      emit(n);
    } catch (e: any) {
      const n = [...base];
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

  return (
    <div className={className}>
      <div
        className={`rounded-xl border ${drag ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"} shadow-sm hover:shadow transition`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          void addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <div className="px-6 py-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-white ring-1 ring-gray-100 shadow dark:bg-gray-900 dark:ring-gray-700">
            <svg
              className="h-6 w-6 text-gray-500 dark:text-gray-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 6h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z"
              />
            </svg>
          </div>
          <div className="text-base font-medium text-gray-800 dark:text-gray-100">
            Upload video
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Drag & drop or click to upload
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            Videos • Max {maxSizeMB}MB
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={(e) => void addFiles(e.target.files)}
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
              Selected ({items.length})
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {items.map((it) => (
              <div
                key={it.id}
                className="group relative overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-black/5 dark:bg-gray-900 dark:ring-gray-700"
              >
                <div className="aspect-video bg-black/5 dark:bg-gray-800">
                  <img
                    src={it.thumbUrl}
                    alt={it.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="px-2.5 py-2">
                  <div className="truncate text-xs text-gray-800 dark:text-gray-200">
                    {it.name}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    {(it.size / 1024 / 1024).toFixed(2)} MB •{" "}
                    {it.type || "video"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(it.id)}
                  className="absolute right-1.5 top-1.5 hidden rounded-full bg-white/90 p-1 shadow ring-1 ring-gray-200 transition group-hover:block hover:bg-white dark:bg-gray-800/90 dark:ring-gray-600"
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
                  <div className="absolute inset-0 flex items-end justify-end p-2">
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
    await sleep(180 + Math.random() * 220);
    p += 7 + Math.random() * 9;
    onProgress(Math.min(100, p));
  }
  return URL.createObjectURL(file);
}
