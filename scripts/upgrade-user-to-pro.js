#!/usr/bin/env node

/**
 * Script to manually upgrade a user to pro status
 * Usage: node scripts/upgrade-user-to-pro.js <email> [reason]
 */

const fetch = require('node-fetch')

async function upgradeUserToPro(email, reason = 'Manual upgrade by admin') {
  try {
    console.log(`🔄 Upgrading user ${email} to pro status...`)
    
    // You would need to get an admin token first
    // For now, this is a template script
    const response = await fetch('https://stripeform.com/api/admin/upgrade-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE' // Replace with actual token
      },
      body: JSON.stringify({
        email: email,
        subscriptionTier: 'pro',
        subscriptionStatus: 'active',
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        reason: reason
      })
    })

    const result = await response.json()
    
    if (result.success) {
      console.log('✅ User upgraded successfully!')
      console.log('📊 User details:', result.data.user)
      console.log('🎯 Upgrade details:', result.data.upgrade)
    } else {
      console.error('❌ Upgrade failed:', result.message)
    }
  } catch (error) {
    console.error('❌ Error upgrading user:', error.message)
  }
}

// Get command line arguments
const email = process.argv[2]
const reason = process.argv[3] || 'Manual upgrade by admin'

if (!email) {
  console.error('❌ Please provide an email address')
  console.log('Usage: node scripts/upgrade-user-to-pro.js <email> [reason]')
  process.exit(1)
}

upgradeUserToPro(email, reason)
