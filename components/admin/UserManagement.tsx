'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import LoadingSpinner from '@/components/ui/loading-spinner'
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Shield,
  UserPlus,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: 'user' | 'admin' | 'super_admin'
  status: 'active' | 'inactive' | 'suspended'
  subscriptionTier?: 'free' | 'pro' | 'enterprise'
  subscriptionStatus?: 'active' | 'inactive' | 'canceled' | 'past_due' | 'unpaid'
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

interface UserManagementProps {
  userRole: 'admin' | 'super_admin'
  onViewForms?: (userId: string) => void
}

export function UserManagement({ userRole, onViewForms }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        throw new Error('No admin token found')
      }

      const queryParams = new URLSearchParams()
      queryParams.append('page', currentPage.toString())
      queryParams.append('limit', '20')
      if (roleFilter) queryParams.append('role', roleFilter)

      const response = await fetch(`/api/admin/users?${queryParams.toString()}`, {
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
        setUsers(data.data.users || [])
        setTotalPages(data.data.pagination?.totalPages || 1)
      } else {
        throw new Error(data.message || 'Failed to fetch users')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (userId: string, updates: { role?: string, status?: string, subscriptionTier?: string }) => {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        throw new Error('No admin token found')
      }

      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          ...updates
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // Refresh users list
        fetchUsers()
        setSelectedUser(null)
      } else {
        throw new Error(data.message || 'Failed to update user')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) throw new Error('No admin token found')

      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()

      if (data.success) {
        fetchUsers()
        setSelectedUser(null)
      } else {
        throw new Error(data.message || 'Failed to delete user')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const createUser = async (userData: { email: string; firstName?: string; lastName?: string; role: 'user' | 'admin' }) => {
    try {
      const token = localStorage.getItem('admin_token')
      if (!token) {
        throw new Error('No admin token found')
      }

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // Refresh users list
        fetchUsers()
        setShowCreateModal(false)
      } else {
        throw new Error(data.message || 'Failed to create user')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  useEffect(() => {
    if (userRole === 'super_admin') {
      fetchUsers()
    }
  }, [userRole, currentPage, roleFilter])

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800'
      case 'admin': return 'bg-blue-100 text-blue-800'
      case 'user': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-yellow-100 text-yellow-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSubscriptionColor = (tier?: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-800'
      case 'pro': return 'bg-blue-100 text-blue-800'
      case 'free': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || user.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (userRole !== 'super_admin') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Shield className="w-12 h-12 text-gray-400 mx-auto" />
            <p className="text-gray-600">
              User management requires super admin privileges.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchUsers} disabled={loading} variant="outline" className="w-full">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner
                size="md"
                text="Loading users..."
              />
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.email
                          }
                        </h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role.replace('_', ' ')}
                      </Badge>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                      {user.subscriptionTier && (
                        <Badge className={getSubscriptionColor(user.subscriptionTier)}>
                          {user.subscriptionTier}
                        </Badge>
                      )}
                      {user.emailVerified ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {user.emailVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedUser(user)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No users found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdateUser={updateUser}
          onDeleteUser={deleteUser}
          onViewForms={onViewForms}
        />
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreateUser={createUser}
        />
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-600">{error}</p>
            </div>
            <Button
              onClick={fetchUsers}
              variant="outline"
              className="mt-2"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// User Details Modal Component
function UserDetailsModal({
  user,
  onClose,
  onUpdateUser,
  onDeleteUser,
  onViewForms
}: {
  user: User
  onClose: () => void
  onUpdateUser: (userId: string, updates: { role?: string, status?: string, subscriptionTier?: string }) => void
  onDeleteUser: (userId: string) => void
  onViewForms?: (userId: string) => void
}) {
  const [newRole, setNewRole] = useState<'user' | 'admin' | 'super_admin'>(user.role as any)
  const [newStatus, setNewStatus] = useState<'active' | 'inactive' | 'suspended'>((user.status as any) || 'active')
  const [newTier, setNewTier] = useState<'free' | 'pro' | 'enterprise'>((user.subscriptionTier as any) || 'free')

  const handleUpdateUser = () => {
    const updates: any = {}
    if (newRole !== user.role) updates.role = newRole
    if (newStatus !== user.status) updates.status = newStatus
    if (newTier !== user.subscriptionTier) updates.subscriptionTier = newTier

    if (Object.keys(updates).length > 0) {
      onUpdateUser(user.id, updates)
    }
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone and will delete all their forms.')) {
      onDeleteUser(user.id)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>User Details</CardTitle>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-sm text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <p className="text-sm text-gray-900">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : 'Not provided'
                }
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {user.status}
              </Badge>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Verified</label>
              <Badge className={user.emailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {user.emailVerified ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subscription</label>
              <Badge className={user.subscriptionTier === 'pro' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                {user.subscriptionTier || 'free'}
              </Badge>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
              <p className="text-sm text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            {onViewForms && (
              <div className="md:col-span-2 pt-2">
                <Button
                  onClick={() => {
                    onClose()
                    onViewForms(user.id)
                  }}
                  variant="outline"
                  className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  View User's Forms
                </Button>
              </div>
            )}
          </div>

          {/* User Management Actions */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Manage User</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subscription</label>
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value as any)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <Button
                onClick={handleDelete}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Delete User
              </Button>
              <Button
                onClick={handleUpdateUser}
                disabled={newRole === user.role && newStatus === user.status && newTier === (user.subscriptionTier || 'free')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Create User Modal Component
function CreateUserModal({
  onClose,
  onCreateUser
}: {
  onClose: () => void
  onCreateUser: (userData: { email: string; firstName?: string; lastName?: string; role: 'user' | 'admin' }) => void
}) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState<'user' | 'admin'>('user')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreateUser({
      email,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      role
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Create New User</CardTitle>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                className="w-full p-2 border rounded-md"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create User
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
