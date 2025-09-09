'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  ChartBarIcon, 
  UsersIcon, 
  ClockIcon, 
  ArrowTrendingUpIcon,
  EyeIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

interface DashboardStatsProps {
  totalForms: number
  publishedForms: number
  totalResponses: number
  avgCompletionRate: number
  avgResponseTime: string
  recentActivity: Array<{
    id: string
    type: 'form_created' | 'form_published' | 'response_received'
    title: string
    timestamp: string
    metadata?: any
  }>
  onCreateForm?: () => void
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalForms,
  publishedForms,
  totalResponses,
  avgCompletionRate,
  avgResponseTime,
  recentActivity,
  onCreateForm
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [isLoading, setIsLoading] = useState(false)

  // Show beautiful empty state for new users
  if (totalForms === 0) {
    return (
      <div className="text-center py-20">
        <div className="max-w-2xl mx-auto">
          {/* Hero Section */}
          <div className="relative mb-12">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
              <ChartBarIcon className="h-16 w-16 text-white" />
            </div>
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <span className="text-lg">🚀</span>
            </div>
            <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-sm">✨</span>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to Your Dashboard!
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            You're about to embark on an amazing journey of creating forms, 
            collecting responses, and gaining valuable insights.
          </p>
          
          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Collect Responses</h3>
              <p className="text-gray-600 text-sm">Gather feedback, leads, and data from your audience</p>
            </div>
            
            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Performance</h3>
              <p className="text-gray-600 text-sm">Monitor completion rates and response trends</p>
            </div>
            
            <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShareIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Share & Embed</h3>
              <p className="text-gray-600 text-sm">Easily share forms or embed them on your website</p>
            </div>
          </div>
          
          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first form in just a few clicks. Choose from our templates or start from scratch.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {onCreateForm && (
                <Button 
                  onClick={onCreateForm} 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <ChartBarIcon className="mr-3 h-6 w-6" />
                  Create Your First Form
                </Button>
              )}
              
              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-500 mb-2">Popular form types:</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-gray-600">
                  <span className="px-3 py-1 bg-white rounded-full border border-gray-200">📊 Surveys</span>
                  <span className="px-3 py-1 bg-white rounded-full border border-gray-200">📝 Contact Forms</span>
                  <span className="px-3 py-1 bg-white rounded-full border border-gray-200">💼 Applications</span>
                  <span className="px-3 py-1 bg-white rounded-full border border-gray-200">🎯 Lead Capture</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tips Section */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              💡 <strong>Pro Tip:</strong> Start with a simple contact form to get familiar with the builder
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Forms</p>
                <p className="text-3xl font-bold text-blue-900">{totalForms}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {publishedForms} published
                </p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <ChartBarIcon className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Total Responses</p>
                <p className="text-3xl font-bold text-green-900">{totalResponses.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">
                  +12% from last month
                </p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <UsersIcon className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Completion Rate</p>
                <p className="text-3xl font-bold text-purple-900">{avgCompletionRate}%</p>
                <p className="text-xs text-purple-600 mt-1">
                  Industry avg: 78%
                </p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <ArrowTrendingUpIcon className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Avg Response Time</p>
                <p className="text-3xl font-bold text-orange-900">{avgResponseTime}</p>
                <p className="text-xs text-orange-600 mt-1">
                  Faster than 85% of forms
                </p>
              </div>
              <div className="p-3 bg-orange-200 rounded-full">
                <ClockIcon className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Selector and Export */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Time Range:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>
        
        <Button
          onClick={() => setIsLoading(!isLoading)}
          disabled={isLoading}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          <span>{isLoading ? 'Exporting...' : 'Export Data'}</span>
        </Button>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-purple-600" />
            <span>Recent Activity</span>
          </h3>
        </div>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'form_created' ? 'bg-blue-500' :
                  activity.type === 'form_published' ? 'bg-green-500' :
                  'bg-purple-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    {activity.type === 'form_created' && 'Created new form'}
                    {activity.type === 'form_published' && 'Published form'}
                    {activity.type === 'response_received' && 'Received response'}
                  </p>
                  <p className="text-sm text-gray-600 truncate">{activity.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <EyeIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardStats
