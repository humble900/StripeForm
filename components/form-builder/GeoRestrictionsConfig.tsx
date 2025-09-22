'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Globe, Shield, AlertTriangle } from 'lucide-react'
import { GeoRestrictions } from '@/lib/geo-location'

interface GeoRestrictionsConfigProps {
  restrictions: GeoRestrictions
  onChange: (restrictions: GeoRestrictions) => void
}

// Common countries for easy selection
const COMMON_COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'HU', name: 'Hungary' },
  { code: 'RO', name: 'Romania' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LV', name: 'Latvia' },
  { code: 'EE', name: 'Estonia' },
  { code: 'IE', name: 'Ireland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GR', name: 'Greece' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'MT', name: 'Malta' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PE', name: 'Peru' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'RU', name: 'Russia' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'BY', name: 'Belarus' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'AF', name: 'Afghanistan' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'NP', name: 'Nepal' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'MV', name: 'Maldives' },
  { code: 'TH', name: 'Thailand' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'LA', name: 'Laos' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'BN', name: 'Brunei' },
  { code: 'TL', name: 'East Timor' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'KP', name: 'North Korea' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'MO', name: 'Macau' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'QA', name: 'Qatar' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'OM', name: 'Oman' },
  { code: 'YE', name: 'Yemen' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IR', name: 'Iran' },
  { code: 'TR', name: 'Turkey' },
  { code: 'IL', name: 'Israel' },
  { code: 'PS', name: 'Palestine' },
  { code: 'JO', name: 'Jordan' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'SY', name: 'Syria' },
  { code: 'EG', name: 'Egypt' },
  { code: 'LY', name: 'Libya' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'MA', name: 'Morocco' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'SO', name: 'Somalia' },
  { code: 'KE', name: 'Kenya' },
  { code: 'UG', name: 'Uganda' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'BI', name: 'Burundi' },
  { code: 'MW', name: 'Malawi' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
  { code: 'BW', name: 'Botswana' },
  { code: 'NA', name: 'Namibia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'SZ', name: 'Eswatini' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'KM', name: 'Comoros' },
  { code: 'YT', name: 'Mayotte' },
  { code: 'RE', name: 'Réunion' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'AO', name: 'Angola' },
  { code: 'CD', name: 'Democratic Republic of the Congo' },
  { code: 'CG', name: 'Republic of the Congo' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'GA', name: 'Gabon' },
  { code: 'ST', name: 'São Tomé and Príncipe' },
  { code: 'GH', name: 'Ghana' },
  { code: 'TG', name: 'Togo' },
  { code: 'BJ', name: 'Benin' },
  { code: 'NE', name: 'Niger' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'ML', name: 'Mali' },
  { code: 'SN', name: 'Senegal' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GN', name: 'Guinea' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'LR', name: 'Liberia' },
  { code: 'CI', name: 'Ivory Coast' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'CV', name: 'Cape Verde' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'LY', name: 'Libya' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'MA', name: 'Morocco' }
]

export default function GeoRestrictionsConfig({ restrictions, onChange }: GeoRestrictionsConfigProps) {
  const [newIP, setNewIP] = useState('')
  const [newCountry, setNewCountry] = useState('')

  const updateRestrictions = (updates: Partial<GeoRestrictions>) => {
    onChange({ ...restrictions, ...updates })
  }

  const addIP = (list: 'allowedIPs' | 'blockedIPs') => {
    if (newIP.trim()) {
      const currentList = restrictions[list]
      if (!currentList.includes(newIP.trim())) {
        updateRestrictions({
          [list]: [...currentList, newIP.trim()]
        })
      }
      setNewIP('')
    }
  }

  const removeIP = (list: 'allowedIPs' | 'blockedIPs', ip: string) => {
    updateRestrictions({
      [list]: restrictions[list].filter(item => item !== ip)
    })
  }

  const addCountry = (list: 'allowedCountries' | 'blockedCountries') => {
    if (newCountry) {
      const currentList = restrictions[list]
      if (!currentList.includes(newCountry)) {
        updateRestrictions({
          [list]: [...currentList, newCountry]
        })
      }
      setNewCountry('')
    }
  }

  const removeCountry = (list: 'allowedCountries' | 'blockedCountries', countryCode: string) => {
    updateRestrictions({
      [list]: restrictions[list].filter(code => code !== countryCode)
    })
  }

  const getCountryName = (code: string) => {
    const country = COMMON_COUNTRIES.find(c => c.code === code)
    return country ? country.name : code
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Geo-Political Restrictions
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Control access to your form based on geographic location and IP addresses for compliance with geo-political regulations.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="geo-enabled">Enable Geo-Restrictions</Label>
            <p className="text-sm text-muted-foreground">
              Restrict access based on location and IP address
            </p>
          </div>
          <Switch
            id="geo-enabled"
            checked={restrictions.enabled}
            onCheckedChange={(enabled) => updateRestrictions({ enabled })}
          />
        </div>

        {restrictions.enabled && (
          <>
            {/* Mode Selection */}
            <div className="space-y-2">
              <Label>Restriction Mode</Label>
              <Select
                value={restrictions.mode}
                onValueChange={(mode: string) => updateRestrictions({ mode: mode as 'allowlist' | 'blocklist' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blocklist">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Block List (Block specified countries/IPs)
                    </div>
                  </SelectItem>
                  <SelectItem value="allowlist">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Allow List (Only allow specified countries/IPs)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {restrictions.mode === 'blocklist' 
                  ? 'Users from blocked countries/IPs will be denied access'
                  : 'Only users from allowed countries/IPs will have access'
                }
              </p>
            </div>

            {/* Country Restrictions */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Country Restrictions</Label>
                <div className="flex gap-2">
                  <Select value={newCountry} onValueChange={setNewCountry}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addCountry(restrictions.mode === 'blocklist' ? 'blockedCountries' : 'allowedCountries')}
                    disabled={!newCountry}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Blocked Countries */}
              {restrictions.mode === 'blocklist' && restrictions.blockedCountries.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Blocked Countries</Label>
                  <div className="flex flex-wrap gap-2">
                    {restrictions.blockedCountries.map((countryCode) => (
                      <Badge key={countryCode} variant="destructive" className="flex items-center gap-1">
                        {getCountryName(countryCode)}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeCountry('blockedCountries', countryCode)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Allowed Countries */}
              {restrictions.mode === 'allowlist' && restrictions.allowedCountries.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Allowed Countries</Label>
                  <div className="flex flex-wrap gap-2">
                    {restrictions.allowedCountries.map((countryCode) => (
                      <Badge key={countryCode} variant="default" className="flex items-center gap-1">
                        {getCountryName(countryCode)}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeCountry('allowedCountries', countryCode)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* IP Address Restrictions */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>IP Address Restrictions</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter IP address (e.g., 192.168.1.1)"
                    value={newIP}
                    onChange={(e) => setNewIP(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addIP(restrictions.mode === 'blocklist' ? 'blockedIPs' : 'allowedIPs')}
                    disabled={!newIP.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add specific IP addresses to {restrictions.mode === 'blocklist' ? 'block' : 'allow'}
                </p>
              </div>

              {/* Blocked IPs */}
              {restrictions.mode === 'blocklist' && restrictions.blockedIPs.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Blocked IP Addresses</Label>
                  <div className="flex flex-wrap gap-2">
                    {restrictions.blockedIPs.map((ip) => (
                      <Badge key={ip} variant="destructive" className="flex items-center gap-1">
                        {ip}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeIP('blockedIPs', ip)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Allowed IPs */}
              {restrictions.mode === 'allowlist' && restrictions.allowedIPs.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Allowed IP Addresses</Label>
                  <div className="flex flex-wrap gap-2">
                    {restrictions.allowedIPs.map((ip) => (
                      <Badge key={ip} variant="default" className="flex items-center gap-1">
                        {ip}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeIP('allowedIPs', ip)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Warning for Allow List Mode */}
            {restrictions.mode === 'allowlist' && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-yellow-800">
                      Allow List Mode Active
                    </p>
                    <p className="text-sm text-yellow-700">
                      Only users from the specified countries and IP addresses will be able to access your form. 
                      Make sure to include all necessary locations.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
