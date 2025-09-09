export interface RemoteRegion {
  name: string
  shortCode?: string
}

export interface RemoteCountry {
  countryName: string
  countryShortCode?: string
  regions?: RemoteRegion[]
}

const LS_KEY_DATA = 'region_loader:data'
const LS_KEY_TIME = 'region_loader:time'
const TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

let countryListCache: string[] | null = null
let remoteDataCache: RemoteCountry[] | null = null

function loadFromLocalStorage(): RemoteCountry[] | null {
  try {
    const ts = localStorage.getItem(LS_KEY_TIME)
    if (!ts) return null
    const age = Date.now() - Number(ts)
    if (isNaN(age) || age > TTL_MS) return null
    const raw = localStorage.getItem(LS_KEY_DATA)
    if (!raw) return null
    return JSON.parse(raw) as RemoteCountry[]
  } catch {
    return null
  }
}

function saveToLocalStorage(data: RemoteCountry[]) {
  try {
    localStorage.setItem(LS_KEY_DATA, JSON.stringify(data))
    localStorage.setItem(LS_KEY_TIME, String(Date.now()))
  } catch {}
}

export async function loadAllCountries(): Promise<string[]> {
  if (countryListCache) return countryListCache
  try {
    if (!remoteDataCache) {
      remoteDataCache = loadFromLocalStorage()
    }
    if (!remoteDataCache) {
      const res = await fetch('https://cdn.jsdelivr.net/npm/country-region-data@3.1.0/dist/countryRegionData.min.json')
      const data: RemoteCountry[] = await res.json()
      remoteDataCache = data
      saveToLocalStorage(data)
    }
    countryListCache = (remoteDataCache || []).map(c => c.countryName)
    return countryListCache
  } catch {
    // fallback minimal
    countryListCache = ['United States','Canada','United Kingdom','Australia','India','Nigeria','South Africa']
    return countryListCache
  }
}

export async function loadRegionsForCountry(countryName: string): Promise<RemoteRegion[]> {
  try {
    if (!remoteDataCache) {
      remoteDataCache = loadFromLocalStorage()
    }
    if (!remoteDataCache) {
      const res = await fetch('https://cdn.jsdelivr.net/npm/country-region-data@3.1.0/dist/countryRegionData.min.json')
      const data: RemoteCountry[] = await res.json()
      remoteDataCache = data
      saveToLocalStorage(data)
    }
    const found = (remoteDataCache || []).find(c => c.countryName === countryName)
    return found?.regions || []
  } catch {
    return []
  }
}

export async function loadAllCountriesWithCodes(): Promise<{ name: string; code?: string }[]> {
  try {
    if (!remoteDataCache) {
      remoteDataCache = loadFromLocalStorage()
    }
    if (!remoteDataCache) {
      const res = await fetch('https://cdn.jsdelivr.net/npm/country-region-data@3.1.0/dist/countryRegionData.min.json')
      const data: RemoteCountry[] = await res.json()
      remoteDataCache = data
      saveToLocalStorage(data)
    }
    return (remoteDataCache || []).map(c => ({ name: c.countryName, code: c.countryShortCode }))
  } catch {
    return [
      { name: 'United States', code: 'US' },
      { name: 'Canada', code: 'CA' },
      { name: 'United Kingdom', code: 'GB' },
      { name: 'Australia', code: 'AU' },
    ]
  }
}

export function countryCodeToFlag(code?: string): string {
  if (!code) return ''
  try {
    const cc = code.toUpperCase()
    const A = 127397
    return String.fromCodePoint(...[...cc].map(ch => A + ch.charCodeAt(0)))
  } catch {
    return ''
  }
}

