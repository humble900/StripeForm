import { supabase } from '@/lib/supabase'

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)) }

// Try to upload to Supabase Storage bucket 'uploads'.
// onProgress is best-effort (simulated while upload runs, then completes at 100%).
export async function uploadToSupabase(
  file: File,
  onProgress: (p: number) => void,
  opts?: { folder?: string }
): Promise<string> {
  const folder = opts?.folder ?? 'form'
  // naive progress simulation while upload is pending
  let running = true
  ;(async () => {
    let p = 1
    while (running && p < 95) {
      await sleep(150 + Math.random() * 200)
      p += 5 + Math.random() * 10
      onProgress(Math.min(95, Math.floor(p)))
    }
  })()

  const path = `${folder}/${crypto.randomUUID()}_${file.name}`
  const { data, error } = await supabase.storage.from('uploads').upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  })
  running = false
  if (error) throw new Error(error.message)
  onProgress(100)
  const { data: pub } = supabase.storage.from('uploads').getPublicUrl(data.path)
  return pub.publicUrl
}

// Fallback simulated upload (no backend).
export async function simulatedUpload(file: File, onProgress: (p: number) => void): Promise<string> {
  let p = 0
  while (p < 100) {
    await sleep(180 + Math.random() * 220)
    p += 7 + Math.random() * 9
    onProgress(Math.min(100, p))
  }
  return URL.createObjectURL(file)
}


