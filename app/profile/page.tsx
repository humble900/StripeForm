'use client'
import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { 
  UserIcon, 
  EnvelopeIcon, 
  KeyIcon, 
  ShieldCheckIcon, 
  CreditCardIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilIcon,
  CameraIcon,
  RocketLaunchIcon,
  PaintBrushIcon,
  CubeIcon,
  BeakerIcon,
  BoltIcon,
  StarIcon,
  LockClosedIcon,
  InformationCircleIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { PhoneInput } from '@/components/ui/PhoneInput'

function ProfileContent() {
  const { user, updateUserProfile, updateDisplayName, signOut, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form states
  const [displayName, setDisplayName] = useState('')
  const [company, setCompany] = useState('')
  const [website, setWebsite] = useState('')
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('US')
  const [timezone, setTimezone] = useState('')
  const [language, setLanguage] = useState('en')

  // Advanced settings state
  const [advancedSettings, setAdvancedSettings] = useState({
    performance: {
      cacheStrategy: 'aggressive',
      compressionLevel: 'high',
    },
    customization: {
      enableCustomCSS: false,
      customCSS: '',
      enableCustomJS: false,
      customJS: '',
      enableThemeEngine: true,
      enableAnimationLibrary: true,
      enableIconLibrary: true
    },
    security: {
      enableCSP: true,
      enableHSTS: true,
    },
    integration: {
      enableWebhooks: true,
      enableAPI: true,
    },
    experimental: {
      enableBetaFeatures: false,
      enableAITools: true,
    }
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setDisplayName(user.name || '')
      setCompany(user.company || '')
      setWebsite(user.website || '')
      setPhone(user.phone || '')
      setCountryCode(user.countryCode || 'US')
      setTimezone(user.timezone || '')
      setLanguage(user.language || 'en')
    }
  }, [user])

  // Set active tab from URL parameter
  useEffect(() => {
    if (searchParams) {
      const tab = searchParams.get('tab')
      if (tab && ['profile', 'security', 'subscription', 'preferences', 'advanced', 'brand-kit'].includes(tab)) {
        setActiveTab(tab)
      }
    }
  }, [searchParams])

  // Advanced settings update function
  const updateAdvancedSetting = (category: string, key: string, value: any) => {
    setAdvancedSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }))
  }

  const handleSaveProfile = async () => {
    if (!user) return
    
    setIsLoadingProfile(true)
    setError('')
    setSuccess('')

    try {
      // Update display name in Firebase if changed
      if (displayName !== user.name) {
        await updateDisplayName(displayName)
      }

      // Update profile in database
      await updateUserProfile({
        name: displayName,
        company,
        website,
        phone,
        countryCode,
        timezone,
        language
      })

      setSuccess('Profile updated successfully!')
      setIsEditing(false)
    } catch (error: any) {
      setError(error.message || 'Failed to update profile')
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const handleCancelEdit = () => {
    // Reset form to original values
    if (user) {
      setDisplayName(user.name || '')
      setCompany(user.company || '')
      setWebsite(user.website || '')
      setPhone(user.phone || '')
      setCountryCode(user.countryCode || 'US')
      setTimezone(user.timezone || '')
      setLanguage(user.language || 'en')
    }
    setIsEditing(false)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <Card>
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {[ 
                    { value: 'profile', label: 'Profile', icon: UserIcon },
                    { value: 'security', label: 'Security', icon: ShieldCheckIcon },
                    { value: 'subscription', label: 'Subscription', icon: CreditCardIcon },
                    { value: 'preferences', label: 'Preferences', icon: Cog6ToothIcon },
                    { value: 'advanced', label: 'Advanced', icon: RocketLaunchIcon },
                    { value: 'brand-kit', label: 'Brand Kit', icon: PaintBrushIcon },
                  ].map((item) => (
                    <Button
                      key={item.value}
                      variant={activeTab === item.value ? "secondary" : "ghost"}
                      className="w-full justify-start text-sm py-2 px-3"
                      onClick={() => {
                        setActiveTab(item.value)
                        router.replace(`/profile?tab=${item.value}`)
                      }}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>
            {/* Sign Out Button in Sidebar for better visibility */}
            <div className="mt-4 p-2 text-center">
              <Button variant="outline" onClick={handleSignOut} className="text-sm w-full">
                Sign Out
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:w-3/4">
            {/* Profile Overview Card (moved here for consistency with sidebar) */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </div>
                    <button className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-1 shadow-md hover:shadow-lg transition-shadow">
                      <CameraIcon className="w-3 h-3 text-gray-600" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">{user.name || 'No name set'}</h2>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={user.subscription_status === 'active' ? 'default' : 'secondary'}>
                        {user.subscription_tier} Plan
                      </Badge>
                      <Badge variant={user.subscription_status === 'active' ? 'default' : 'secondary'}>
                        {user.subscription_status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Member since</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conditionally rendered content */}
            {activeTab === 'profile' && (
              <Card className="space-y-4">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <UserIcon className="w-4 h-4 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-600 mr-2" />
                      <AlertDescription className="text-xs">{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {success && (
                    <Alert variant="success">
                      <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                      <AlertDescription className="text-xs">{success}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Display Name
                      </label>
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your display name"
                        disabled={!isEditing}
                        className="text-sm py-1 px-2"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Company
                      </label>
                      <Input
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Enter your company"
                        disabled={!isEditing}
                        className="text-sm py-1 px-2"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <Input
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://yourwebsite.com"
                        disabled={!isEditing}
                        className="text-sm py-1 px-2"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <PhoneInput
                        value={phone}
                        countryCode={countryCode}
                        onChange={(phoneNumber, country) => {
                          setPhone(phoneNumber)
                          setCountryCode(country)
                        }}
                        placeholder="Enter your phone number"
                        disabled={!isEditing}
                        className="text-sm py-1 px-2"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)} size="sm">
                        <PencilIcon className="w-3 h-3 mr-1" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button variant="outline" onClick={handleCancelEdit} size="sm">
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSaveProfile}
                          disabled={isLoadingProfile}
                          size="sm"
                        >
                          {isLoadingProfile ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card className="space-y-4">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <ShieldCheckIcon className="w-4 h-4 mr-2" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-medium text-sm text-gray-900">Password</h3>
                        <p className="text-xs text-gray-600">Last changed 30 days ago</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Change Password
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-medium text-sm text-gray-900">Two-Factor Authentication</h3>
                        <p className="text-xs text-gray-600">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable 2FA
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-medium text-sm text-gray-900">Login Sessions</h3>
                        <p className="text-xs text-gray-600">Manage your active sessions</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Sessions
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'subscription' && (
              <Card className="space-y-4">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <CreditCardIcon className="w-4 h-4 mr-2" />
                    Subscription & Billing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {user.subscription_tier === 'pro' ? 'Pro Plan' : 'Free Plan'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {user.subscription_tier === 'pro' 
                            ? 'Unlimited forms, advanced analytics, and priority support'
                            : 'Basic features with form limits'
                          }
                        </p>
                      </div>
                      <Badge variant={user.subscription_status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {user.subscription_status}
                      </Badge>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Form Limit: {user.form_limit} forms</p>
                      {user.subscription_tier === 'free' && (
                        <Button 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" 
                          size="sm"
                          onClick={() => router.push('/pricing')}
                        >
                          Upgrade to Pro
                          <ArrowRightIcon className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-medium text-sm text-gray-900">Billing History</h3>
                        <p className="text-xs text-gray-600">View your past invoices</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View History
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-medium text-sm text-gray-900">Payment Method</h3>
                        <p className="text-xs text-gray-600">Manage your payment options</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'preferences' && (
              <Card className="space-y-4">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <Cog6ToothIcon className="w-4 h-4 mr-2" />
                    Account Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Timezone
                      </label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="">Select timezone</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Europe/London">London</option>
                        <option value="Europe/Paris">Paris</option>
                        <option value="Asia/Tokyo">Tokyo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Language
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="it">Italian</option>
                        <option value="pt">Portuguese</option>
                        <option value="ja">Japanese</option>
                        <option value="ko">Korean</option>
                        <option value="zh">Chinese</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-sm text-gray-900">Delete Account</h3>
                        <p className="text-xs text-gray-600">Permanently delete your account and all data</p>
                      </div>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'advanced' && (
              <Card className="space-y-4">
                {/* Performance Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-base">
                      <RocketLaunchIcon className="w-4 h-4 mr-2 text-blue-600" />
                      Performance Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Cache Strategy</span>
                          <div className="flex space-x-1">
                            {['conservative', 'balanced', 'aggressive'].map((strategy) => (
                              <Button
                                key={strategy}
                                variant={advancedSettings.performance.cacheStrategy === strategy ? "default" : "outline"}
                                size="xs"
                                onClick={() => updateAdvancedSetting('performance', 'cacheStrategy', strategy)}
                                className={`text-xs ${advancedSettings.performance.cacheStrategy === strategy ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                              >
                                {strategy.charAt(0).toUpperCase() + strategy.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">Choose how aggressively to cache form assets</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Compression Level</span>
                          <div className="flex space-x-1">
                            {['low', 'medium', 'high'].map((level) => (
                              <Button
                                key={level}
                                variant={advancedSettings.performance.compressionLevel === level ? "default" : "outline"}
                                size="xs"
                                onClick={() => updateAdvancedSetting('performance', 'compressionLevel', level)}
                                className={`text-xs ${advancedSettings.performance.compressionLevel === level ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                              >
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600">Balance between compression and processing speed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Customization Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-base">
                      <PaintBrushIcon className="w-4 h-4 mr-2 text-purple-600" />
                      Customization Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Enable Custom CSS</span>
                          <Button
                            variant={advancedSettings.customization.enableCustomCSS ? "default" : "outline"}
                            size="xs"
                            onClick={() => updateAdvancedSetting('customization', 'enableCustomCSS', !advancedSettings.customization.enableCustomCSS)}
                            className={`text-xs ${advancedSettings.customization.enableCustomCSS ? "bg-green-600 hover:bg-green-700" : ""}`}
                          >
                            {advancedSettings.customization.enableCustomCSS ? "Enabled" : "Disabled"}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600">Inject custom CSS for advanced styling</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Enable Custom JavaScript</span>
                          <Button
                            variant={advancedSettings.customization.enableCustomJS ? "default" : "outline"}
                            size="xs"
                            onClick={() => updateAdvancedSetting('customization', 'enableCustomJS', !advancedSettings.customization.enableCustomJS)}
                            className={`text-xs ${advancedSettings.customization.enableCustomJS ? "bg-green-600 hover:bg-green-700" : ""}`}
                          >
                            {advancedSettings.customization.enableCustomJS ? "Enabled" : "Disabled"}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600">Add custom JavaScript functionality</p>
                      </div>
                    </div>

                    {advancedSettings.customization.enableCustomCSS && (
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Custom CSS Code</span>
                        <textarea
                          placeholder="/* Add your custom CSS here */"
                          value={advancedSettings.customization.customCSS}
                          onChange={(e) => updateAdvancedSetting('customization', 'customCSS', e.target.value)}
                          className="w-full border border-gray-300 rounded-md p-2 font-mono text-xs"
                          rows={3}
                        />
                        <p className="text-xs text-gray-600">CSS will be automatically minified and optimized</p>
                      </div>
                    )}

                    {advancedSettings.customization.enableCustomJS && (
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Custom JavaScript Code</span>
                        <textarea
                          placeholder="// Add your custom JavaScript here"
                          value={advancedSettings.customization.customJS}
                          onChange={(e) => updateAdvancedSetting('customization', 'customJS', e.target.value)}
                          className="w-full border border-gray-300 rounded-md p-2 font-mono text-xs"
                          rows={3}
                        />
                        <p className="text-xs text-gray-600">JavaScript will be automatically minified and optimized</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-base">
                      <ShieldCheckIcon className="w-4 h-4 mr-2 text-green-600" />
                      Advanced Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Content Security Policy</span>
                          <Button
                            variant={advancedSettings.security.enableCSP ? "default" : "outline"}
                            size="xs"
                            onClick={() => updateAdvancedSetting('security', 'enableCSP', !advancedSettings.security.enableCSP)}
                            className={`text-xs ${advancedSettings.security.enableCSP ? "bg-green-600 hover:bg-green-700" : ""}`}
                          >
                            {advancedSettings.security.enableCSP ? "Enabled" : "Disabled"}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600">Protect against XSS and injection attacks</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">HTTP Strict Transport Security</span>
                          <Button
                            variant={advancedSettings.security.enableHSTS ? "default" : "outline"}
                            size="xs"
                            onClick={() => updateAdvancedSetting('security', 'enableHSTS', !advancedSettings.security.enableHSTS)}
                            className={`text-xs ${advancedSettings.security.enableHSTS ? "bg-green-600 hover:bg-green-700" : ""}`}
                          >
                            {advancedSettings.security.enableHSTS ? "Enabled" : "Disabled"}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600">Force HTTPS connections</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Integration Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-base">
                      <CubeIcon className="w-4 h-4 mr-2 text-indigo-600" />
                      Integration Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Webhooks</span>
                          <Button
                            variant={advancedSettings.integration.enableWebhooks ? "default" : "outline"}
                            size="xs"
                            onClick={() => updateAdvancedSetting('integration', 'enableWebhooks', !advancedSettings.integration.enableWebhooks)}
                            className={`text-xs ${advancedSettings.integration.enableWebhooks ? "bg-green-600 hover:bg-green-700" : ""}`}
                          >
                            {advancedSettings.integration.enableWebhooks ? "Enabled" : "Disabled"}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600">Real-time data synchronization</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">REST API</span>
                          <Button
                            variant={advancedSettings.integration.enableAPI ? "default" : "outline"}
                            size="xs"
                            onClick={() => updateAdvancedSetting('integration', 'enableAPI', !advancedSettings.integration.enableAPI)}
                            className={`text-xs ${advancedSettings.integration.enableAPI ? "bg-green-600 hover:bg-green-700" : ""}`}
                          >
                            {advancedSettings.integration.enableAPI ? "Enabled" : "Disabled"}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600">Programmatic access to forms</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Experimental Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-base">
                      <BeakerIcon className="w-4 h-4 mr-2 text-orange-600" />
                      Experimental Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <ExclamationTriangleIcon className="h-3 w-3 text-orange-600 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-medium text-orange-800">Experimental Features Warning</h4>
                          <p className="text-[0.65rem] text-orange-700 mt-1">
                            These features are in early development and may be unstable. Use with caution in production environments.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Beta Features</span>
                          <Button
                            variant={advancedSettings.experimental.enableBetaFeatures ? "default" : "outline"}
                            size="xs"
                            onClick={() => updateAdvancedSetting('experimental', 'enableBetaFeatures', !advancedSettings.experimental.enableBetaFeatures)}
                            className={`text-xs ${advancedSettings.experimental.enableBetaFeatures ? "bg-green-600 hover:bg-green-700" : ""}`}
                          >
                            {advancedSettings.experimental.enableBetaFeatures ? "Enabled" : "Disabled"}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600">Access to cutting-edge features</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">AI-Powered Tools</span>
                          <Button
                            variant={advancedSettings.experimental.enableAITools ? "default" : "outline"}
                            size="xs"
                            onClick={() => updateAdvancedSetting('experimental', 'enableAITools', !advancedSettings.experimental.enableAITools)}
                            className={`text-xs ${advancedSettings.experimental.enableAITools ? "bg-green-600 hover:bg-green-700" : ""}`}
                          >
                            {advancedSettings.experimental.enableAITools ? "Enabled" : "Disabled"}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600">Machine learning enhancements</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Card>
            )}

            {activeTab === 'brand-kit' && (
              <Card className="space-y-4">
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <PaintBrushIcon className="w-4 h-4 mr-2" />
                    Brand Kit
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="border rounded-md overflow-hidden">
                    <iframe
                      src="/brand-kit"
                      title="Brand Kit"
                      className="w-full h-[60vh]"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProfileContent />
    </Suspense>
  )
}
