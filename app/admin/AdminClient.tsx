'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAdminAuth } from '@/components/providers/AdminAuthProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import LoadingSpinner from '@/components/ui/loading-spinner'
import {
  Users,
  FileText,
  MessageSquare,
  Bell,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  Plus,
  RefreshCw,
  Shield,
  Settings
} from 'lucide-react'
import { UserManagement } from '@/components/admin/UserManagement'
import { FormManagement } from '@/components/admin/FormManagement'
import { SupportTicketManagement } from '@/components/admin/SupportTicketManagement'
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard'

interface AdminStats {
  period: string
  startDate: string
  endDate: string
  statistics: {
    total: {
      users: number
      forms: number
      submissions: number
      payments: number
      tickets: number
      notifications: number
    }
    newThisPeriod: {
      users: number
      forms: number
      submissions: number
      payments: number
      tickets: number
      notifications: number
    }
  }
  breakdowns: {
    users: Array<{ role: string; count: number }>
    forms: Array<{ status: string; count: number }>
    submissions: Array<{ status: string; count: number }>
    payments: Array<{ status: string; count: number }>
    tickets: Array<{ status: string; count: number }>
    ticketPriorities: Array<{ priority: string; count: number }>
    notifications: Array<{ status: string; count: number }>
    notificationTypes: Array<{ type: string; count: number }>
  }
  topForms: Array<{ formId: string; title: string; submissionCount: number }>
  recentActivity: Array<{
    id: string
    formId: string
    formTitle: string
    submittedAt: string
    status: string
  }>
  recentTickets: Array<{
    id: string
    ticketNumber: string
    subject: string
    userEmail: string
    status: string
    priority: string
    createdAt: string
  }>
  recentNotifications: Array<{
    id: string
    type: string
    title: string
    message: string
    status: string
    createdAt: string
  }>
  revenue: number | null
}

interface SupportTicket {
  id: string
  ticketNumber: string
  userId?: string
  userEmail: string
  userName?: string
  subject: string
  description: string
  category: string
  priority: string
  status: string
  assignedTo?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

interface Notification {
  id: string
  userId?: string
  type: string
  title: string
  message: string
  status: string
  data: any
  readAt?: string
  createdAt: string
}

export default function AdminClient() {
  const { user, isAuthenticated, logout } = useAdminAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [formAdminUserFilter, setFormAdminUserFilter] = useState('')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState('month')

  const fetchAdminStats = async () => {
    if (!isAuthenticated || !user) return

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        throw new Error('No admin token found')
      }

      const response = await fetch(`/api/admin/dashboard?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setStats(data.data)
      } else {
        throw new Error(data.message || 'Failed to fetch admin stats')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }



  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        throw new Error('No admin token found')
      }

      const response = await fetch('/api/admin/notifications?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setNotifications(data.data.notifications)
      } else {
        throw new Error(data.message || 'Failed to fetch notifications')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        throw new Error('No admin token found')
      }

      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        // Refresh notifications
        fetchNotifications()
      }
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      if (activeTab === 'dashboard') {
        fetchAdminStats()
      } else if (activeTab === 'notifications') {
        fetchNotifications()
      }
      // Users and Forms tabs handle their own data fetching
    }
  }, [isAuthenticated, user, period, activeTab])

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Please sign in to access the admin dashboard.
              </p>
              <Button
                onClick={() => window.location.href = '/admin/login'}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to Admin Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <LoadingSpinner
              size="lg"
              text="Loading admin panel..."
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      case 'unread': return 'bg-red-100 text-red-800'
      case 'read': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-[#6C5CE7] flex items-center">
                <span>StripeForm</span>
                <span className="ml-2 bg-[#6C5CE7] text-white text-xs px-2 py-1 rounded-full font-medium">ADMIN</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.firstName || user.email}
              </span>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your platform and users
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8 border-b border-gray-200">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'users', label: 'Users', icon: Users, requiresSuperAdmin: true },
              { id: 'forms', label: 'Forms', icon: FileText },
              { id: 'tickets', label: 'Support Tickets', icon: MessageSquare },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon
              const isDisabled = tab.requiresSuperAdmin && user.role !== 'super_admin'

              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  disabled={isDisabled}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : isDisabled
                      ? 'border-transparent text-gray-300 cursor-not-allowed'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {tab.requiresSuperAdmin && (
                    <Shield className="w-3 h-3 text-gray-400" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Period Selector */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {['day', 'week', 'month', 'year'].map((p) => (
                  <Button
                    key={p}
                    variant={period === p ? 'default' : 'outline'}
                    onClick={() => setPeriod(p)}
                    className="capitalize"
                  >
                    {p}
                  </Button>
                ))}
              </div>
              <Button onClick={fetchAdminStats} disabled={loading} variant="outline">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.statistics.total.users}</div>
                    <p className="text-xs text-muted-foreground">
                      +{stats.statistics.newThisPeriod.users} this {period}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.statistics.total.forms}</div>
                    <p className="text-xs text-muted-foreground">
                      +{stats.statistics.newThisPeriod.forms} this {period}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Submissions</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.statistics.total.submissions}</div>
                    <p className="text-xs text-muted-foreground">
                      +{stats.statistics.newThisPeriod.submissions} this {period}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.statistics.total.tickets}</div>
                    <p className="text-xs text-muted-foreground">
                      +{stats.statistics.newThisPeriod.tickets} this {period}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.statistics.total.notifications}</div>
                    <p className="text-xs text-muted-foreground">
                      +{stats.statistics.newThisPeriod.notifications} this {period}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${stats.revenue ? (stats.revenue / 100).toFixed(2) : '0.00'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total revenue
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Tickets */}
            {stats && stats.recentTickets.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Support Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentTickets.map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{ticket.ticketNumber}</span>
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status}
                            </Badge>
                            <Badge className={getPriorityColor(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{ticket.subject}</p>
                          <p className="text-xs text-gray-500">{ticket.userEmail}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Notifications */}
            {stats && stats.recentNotifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentNotifications.map((notification) => (
                      <div key={notification.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{notification.title}</span>
                            <Badge className={getStatusColor(notification.status)}>
                              {notification.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-500">Type: {notification.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <UserManagement
            userRole={user.role as 'admin' | 'super_admin'}
            onViewForms={(userId: string) => {
              setFormAdminUserFilter(userId)
              setActiveTab('forms')
            }}
          />
        )}

        {/* Forms Tab */}
        {activeTab === 'forms' && (
          <FormManagement
            userRole={user.role as 'admin' | 'super_admin'}
            initialUserFilter={formAdminUserFilter}
          />
        )}

        {/* Support Tickets Tab */}
        {activeTab === 'tickets' && (
          <SupportTicketManagement userRole={user.role as 'admin' | 'super_admin'} />
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Notifications</CardTitle>
                  <Button onClick={fetchNotifications} disabled={loading} variant="outline">
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner
                      size="md"
                      text="Loading notifications..."
                    />
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${notification.status === 'unread' ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{notification.title}</span>
                            <Badge className={getStatusColor(notification.status)}>
                              {notification.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{notification.message}</p>
                          <p className="text-xs text-gray-500">Type: {notification.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                          {notification.status === 'unread' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2"
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              Mark as Read
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No notifications found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard stats={stats} />
        )}
      </div>
    </div>
  )
}
