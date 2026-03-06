/**
 * Standardized error mapping for Firebase Authentication exceptions.
 * Maps technical error codes to user-friendly messages and targets specific UI fields.
 */

export interface AuthErrorMap {
    field: 'email' | 'password' | 'name' | 'phone' | 'confirmPassword' | 'global'
    message: string
}

export function mapAuthError(error: any, defaultField: 'email' | 'password' | 'global' = 'global'): AuthErrorMap {
    const errorCode = error?.code || error?.message || ''

    switch (errorCode) {
        // --- Email Errors ---
        case 'auth/invalid-email':
            return { field: 'email', message: "This email address isn't formatted correctly. Please check for typos." }
        case 'auth/user-not-found':
            return { field: 'email', message: "We couldn't find an account with that email. Please check for typos or sign up." }
        case 'auth/email-already-in-use':
            return { field: 'email', message: "An account already exists with this email. Please sign in instead." }

        // --- Password Errors ---
        case 'auth/wrong-password':
            return { field: 'password', message: "The password you entered is incorrect. If you forgot your password, you can reset it below." }
        case 'auth/weak-password':
            return { field: 'password', message: "Your password is too weak. Please use at least 8 characters with a mix of letters and numbers." }

        // --- General Credential/Auth Errors ---
        case 'auth/invalid-credential':
        case 'auth/invalid-login-credentials':
            // Firebase occasionally groups email/password mismatches here to prevent email-enumeration attacks
            return { field: 'password', message: "The email or password you entered is incorrect. Please try again." }

        case 'auth/user-disabled':
            return { field: 'email', message: "This account has been disabled. Please contact support." }

        case 'auth/too-many-requests':
            return { field: 'global', message: "For your security, we've temporarily blocked login attempts after too many failures. Please try again later or reset your password." }

        case 'auth/requires-recent-login':
            return { field: 'global', message: "For your security, please log out and log back in to perform this action." }

        case 'auth/popup-closed-by-user':
            return { field: 'global', message: "The sign-in popup was closed before finishing. Please try again." }

        // --- Network / System Errors ---
        case 'auth/network-request-failed':
            return { field: 'global', message: "You seem to be offline. Please check your internet connection and try again." }
        case 'auth/internal-error':
            return { field: 'global', message: "An unexpected system error occurred. Please try again in an hour." }

        // --- Fallback ---
        default:
            console.warn('Unmapped Auth Error:', errorCode, error)
            return {
                field: defaultField,
                message: typeof errorCode === 'string' && errorCode.length > 5 && !errorCode.includes('auth/')
                    ? errorCode // Pass through clean string errors if they aren't raw Firebase codes
                    : "An unexpected error occurred. Please try again."
            }
    }
}
