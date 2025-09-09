import { dbService } from './service'

const typeformStyleFAQs = [
  // General Questions
  {
    question: "What is StripeForm?",
    answer: "StripeForm is a modern form builder that helps you create beautiful, interactive forms that people love to fill. It's designed to get higher response rates with its conversational, step-by-step approach similar to Typeform.",
    category: "general",
    order: 1,
  },
  {
    question: "How is StripeForm different from other form builders?",
    answer: "StripeForm focuses on creating engaging, conversational forms that feel more like a chat than a traditional form. Our forms are designed to be mobile-first, visually appealing, and optimized for higher completion rates. We also offer advanced features like conditional logic, payment integration, and comprehensive analytics.",
    category: "general",
    order: 2,
  },
  {
    question: "Do I need an account to create forms?",
    answer: "No! You can start creating forms immediately without signing up. However, creating an account allows you to save your forms, access analytics, and manage your submissions. Anonymous users can create and save drafts, but to publish forms and access advanced features, you'll need a free account.",
    category: "general",
    order: 3,
  },

  // Features
  {
    question: "What types of questions can I add to my forms?",
    answer: "StripeForm supports a wide variety of question types including: text inputs, multiple choice, dropdowns, rating scales, star ratings, NPS scores, date pickers, file uploads, payment fields, and more. We're constantly adding new question types based on user feedback.",
    category: "features",
    order: 1,
  },
  {
    question: "Can I add conditional logic to my forms?",
    answer: "Yes! StripeForm supports conditional logic, allowing you to show or hide questions based on previous answers. This helps create personalized, relevant experiences for your respondents and can significantly improve completion rates.",
    category: "features",
    order: 2,
  },
  {
    question: "Can I customize the look and feel of my forms?",
    answer: "Absolutely! You can customize colors, fonts, backgrounds, and even add your own branding. Pro users get access to advanced customization options including custom CSS and white-labeling capabilities.",
    category: "features",
    order: 3,
  },
  {
    question: "Does StripeForm support file uploads?",
    answer: "Yes, StripeForm supports various file upload types including images, documents, and videos. You can set file size limits and specify allowed file types. Pro users get higher upload limits and more storage space.",
    category: "features",
    order: 4,
  },

  // Billing & Pricing
  {
    question: "What's included in the free plan?",
    answer: "The free plan includes: up to 5 published forms, unlimited form fields, basic analytics, file uploads (up to 10MB), and access to all question types. You can create unlimited drafts and save them without publishing.",
    category: "billing",
    order: 1,
  },
  {
    question: "What's included in the Pro plan?",
    answer: "The Pro plan includes: unlimited published forms, advanced analytics and reporting, custom branding, priority support, higher file upload limits, white-labeling options, and access to premium integrations.",
    category: "billing",
    order: 2,
  },
  {
    question: "Can I upgrade or downgrade my plan anytime?",
    answer: "Yes, you can change your plan at any time. Upgrades take effect immediately, while downgrades take effect at the end of your current billing period. You'll never lose access to your existing forms.",
    category: "billing",
    order: 3,
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 14-day free trial for Pro plans. If you're not satisfied within the first 14 days, we'll provide a full refund. After the trial period, refunds are handled on a case-by-case basis.",
    category: "billing",
    order: 4,
  },

  // Technical
  {
    question: "How do I embed my form on my website?",
    answer: "You can embed your StripeForm in several ways: as an iframe, using our JavaScript embed code, or by linking directly to your form. We provide responsive embed codes that work perfectly on all devices.",
    category: "technical",
    order: 1,
  },
  {
    question: "Can I export my form responses?",
    answer: "Yes! You can export your responses in multiple formats including CSV, Excel, and JSON. Pro users get access to advanced export options and can set up automated exports.",
    category: "technical",
    order: 2,
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use enterprise-grade security including SSL encryption, secure data centers, and regular security audits. Your data is never shared with third parties without your explicit consent.",
    category: "technical",
    order: 3,
  },
  {
    question: "Do you have an API?",
    answer: "Yes! StripeForm offers a comprehensive REST API that allows you to create forms, manage responses, and integrate with your existing systems. API access is available for Pro users.",
    category: "technical",
    order: 4,
  },
  {
    question: "Can I integrate StripeForm with other tools?",
    answer: "Yes! StripeForm integrates with popular tools like Zapier, Slack, Google Sheets, and many others. We're constantly adding new integrations based on user requests.",
    category: "technical",
    order: 5,
  },

  // Account
  {
    question: "How do I delete my account?",
    answer: "You can delete your account from your profile settings. Please note that this will permanently delete all your forms and data. We recommend exporting your data before deleting your account.",
    category: "account",
    order: 1,
  },
  {
    question: "Can I transfer my forms to another account?",
    answer: "Currently, form transfer between accounts is not available, but it's a feature we're working on. If you need to transfer forms, please contact our support team for assistance.",
    category: "account",
    order: 2,
  },
  {
    question: "How do I change my email address?",
    answer: "You can change your email address from your profile settings. You'll need to verify the new email address before the change takes effect.",
    category: "account",
    order: 3,
  },
]

export async function seedFAQs(adminUserId: string = 'admin@stripeform.com') {
  try {
    console.log('🌱 Seeding FAQs...')
    
    for (const faq of typeformStyleFAQs) {
      await dbService.createFAQ({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        order: faq.order,
        createdBy: adminUserId,
      })
    }
    
    console.log(`✅ Successfully seeded ${typeformStyleFAQs.length} FAQs`)
  } catch (error) {
    console.error('❌ Error seeding FAQs:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  seedFAQs()
    .then(() => {
      console.log('FAQ seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('FAQ seeding failed:', error)
      process.exit(1)
    })
}
