import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomBytes, randomUUID } from 'crypto'
import { db } from '@/lib/db'
import { users, userProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export interface AuthUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: 'user' | 'admin' | 'super_admin'
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  emailVerified: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface PasswordResetData {
  email: string
}

export interface PasswordResetConfirmData {
  token: string
  newPassword: string
}

export class AuthService {
  private readonly JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET
  private readonly JWT_EXPIRES_IN = '7d'
  private readonly PASSWORD_SALT_ROUNDS = 12

  constructor() {
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET or NEXTAUTH_SECRET environment variable is required for authentication')
    }
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<{ user: AuthUser; token: string }> {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, data.email)
    })

    if (existingUser) {
      throw new Error('User with this email already exists')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, this.PASSWORD_SALT_ROUNDS)

    // Generate email verification token
    const emailVerificationToken = randomBytes(32).toString('hex')

    // Create user
    const [user] = await db.insert(users).values({
      id: crypto.randomUUID(), // Generate UUID for new user
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      emailVerificationToken
    }).returning()

    // Create user profile
    await db.insert(userProfiles).values({
      userId: user.id
    })

    // Generate JWT token
    const token = this.generateToken(user)

    return {
      user: this.sanitizeUser(user),
      token
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, credentials.email)
    })

    if (!user) {
      throw new Error('Invalid credentials')
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new Error('Account is not active')
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash || '')
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    // Update last login
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id))

    // Generate JWT token
    const token = this.generateToken(user)

    return {
      user: this.sanitizeUser(user),
      token
    }
  }

  /**
   * Verify JWT token and return user
   */
  async verifyToken(token: string): Promise<AuthUser> {
    try {
      if (!this.JWT_SECRET) {
        throw new Error('JWT secret is not configured')
      }

      const decoded = jwt.verify(token, this.JWT_SECRET) as any

      // Get user from database
      const user = await db.query.users.findFirst({
        where: eq(users.id, decoded.userId)
      })

      if (!user || user.status !== 'active') {
        throw new Error('User not found or inactive')
      }

      return this.sanitizeUser(user)
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(token: string): Promise<{ user: AuthUser; token: string }> {
    const user = await this.verifyToken(token)
    const newToken = this.generateToken({ id: user.id } as any)

    return {
      user,
      token: newToken
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: PasswordResetData): Promise<void> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, data.email)
    })

    if (!user) {
      // Don't reveal if user exists or not
      return
    }

    // Generate reset token
    const passwordResetToken = randomBytes(32).toString('hex')
    const passwordResetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Update user with reset token
    await db.update(users)
      .set({
        passwordResetToken,
        passwordResetExpires
      })
      .where(eq(users.id, user.id))

    // TODO: Send email with reset link containing the token
    // e.g., await sendEmail(user.email, 'Password Reset', `Reset link: ${APP_URL}/reset-password?token=${passwordResetToken}`)
    // For now, the token is stored in the database and can be used via the reset endpoint
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(data: PasswordResetConfirmData): Promise<void> {
    // Find user by reset token
    const user = await db.query.users.findFirst({
      where: eq(users.passwordResetToken, data.token)
    })

    if (!user) {
      throw new Error('Invalid reset token')
    }

    // Check if token is expired
    if (user.passwordResetExpires && new Date() > user.passwordResetExpires) {
      throw new Error('Reset token has expired')
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(data.newPassword, this.PASSWORD_SALT_ROUNDS)

    // Update user password and clear reset token
    await db.update(users)
      .set({
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null
      })
      .where(eq(users.id, user.id))
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    const user = await db.query.users.findFirst({
      where: eq(users.emailVerificationToken, token)
    })

    if (!user) {
      throw new Error('Invalid verification token')
    }

    // Update user as verified
    await db.update(users)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        status: 'active'
      })
      .where(eq(users.id, user.id))
  }

  /**
   * Change password
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash || '')
    if (!isValidPassword) {
      throw new Error('Current password is incorrect')
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, this.PASSWORD_SALT_ROUNDS)

    // Update password
    await db.update(users)
      .set({ passwordHash })
      .where(eq(users.id, userId))
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, profileData: Partial<typeof userProfiles.$inferInsert>): Promise<void> {
    await db.update(userProfiles)
      .set({
        ...profileData,
        updatedAt: new Date()
      })
      .where(eq(userProfiles.userId, userId))
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<AuthUser | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId)
    })

    return user ? this.sanitizeUser(user) : null
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<AuthUser | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    })

    return user ? this.sanitizeUser(user) : null
  }

  /**
   * List users (admin only)
   */
  async listUsers(page: number = 1, limit: number = 20, filters?: any): Promise<{
    users: AuthUser[]
    total: number
    page: number
    totalPages: number
  }> {
    const offset = (page - 1) * limit

    // Build where clause based on filters
    let whereClause = undefined
    if (filters?.status) {
      whereClause = eq(users.status, filters.status)
    }

    // Get users
    const usersList = await db.query.users.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: (users, { desc }) => [desc(users.createdAt)]
    })

    // Get total count
    const totalResult = await db.select({ count: users.id }).from(users)
    const total = totalResult.length

    return {
      users: usersList.map(user => this.sanitizeUser(user)),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    }
  }

  /**
   * Update user status (admin only)
   */
  async updateUserStatus(userId: string, status: string): Promise<void> {
    await db.update(users)
      .set({
        status: status as any,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId))
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: { id: string }): string {
    if (!this.JWT_SECRET) {
      throw new Error('JWT secret is not configured. Please set NEXTAUTH_SECRET or JWT_SECRET environment variable.')
    }

    return jwt.sign(
      { userId: user.id },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    )
  }

  /**
   * Sanitize user data (remove sensitive information)
   */
  private sanitizeUser(user: any): AuthUser {
    const { passwordHash, emailVerificationToken, passwordResetToken, passwordResetExpires, ...sanitizedUser } = user
    return sanitizedUser as AuthUser
  }
}

// Export singleton instance
export const authService = new AuthService()
