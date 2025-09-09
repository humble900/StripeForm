import { Form, FormField } from '@/types'

export interface FormTemplate {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  previewImage?: string
  tags: string[]
  isFeatured: boolean
  usageCount: number
  templateData: Form
  estimatedTime: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export const formTemplates: FormTemplate[] = [
  {
    id: 'contact-form',
    name: 'Contact Form',
    description: 'A simple and effective contact form to collect inquiries from your website visitors.',
    category: 'Business',
    thumbnail: '/templates/contact-form-thumb.jpg',
    previewImage: '/templates/contact-form-preview.jpg',
    tags: ['contact', 'inquiry', 'business', 'simple'],
    isFeatured: true,
    usageCount: 2156,
    estimatedTime: '2-3 min',
    difficulty: 'beginner',
    templateData: {
      id: '',
      title: 'Contact Us',
      description: 'Get in touch with us',
      fields: [
        { id: 'ct-cover-1', type: 'cover_slide', label: 'Contact Us', required: false, settings: { coverTitle: 'Contact Us', coverSubtitle: 'We usually reply within 24 hours', coverMediaUrl: '/templates/covers/contact.jpg' } },
        {
          id: 'name-1',
          type: 'short_text',
          label: 'Full Name',
          required: true,
          placeholder: 'Enter your full name',
          settings: {}
        },
        {
          id: 'email-1',
          type: 'email',
          label: 'Email Address',
          required: true,
          placeholder: 'Enter your email address',
          settings: {}
        },
        {
          id: 'phone-1',
          type: 'phone',
          label: 'Phone Number',
          required: false,
          placeholder: 'Enter your phone number',
          settings: {}
        },
        {
          id: 'dropdown-1',
          type: 'dropdown',
          label: 'Subject',
          required: true,
          options: ['General Inquiry', 'Sales Question', 'Technical Support', 'Partnership', 'Other'],
          settings: {}
        },
        {
          id: 'long-text-1',
          type: 'long_text',
          label: 'Message',
          required: true,
          placeholder: 'Tell us how we can help you...',
          settings: {}
        },
        { id: 'ct-end-1', type: 'end_page', label: 'Message Sent', required: false, settings: { endTitle: 'Thanks for reaching out', endSubtitle: 'We will get back to you shortly', endButtonText: 'Close', endButtonUrl: '' } }
      ],
      settings: {
        allow_multiple_responses: true,
        require_login: false,
        show_progress_bar: false,
        submit_button_text: 'Send Message',
        success_message: 'Message sent successfully!',
        email_notifications: false,
        display_mode: 'single_page',
        layout: 'vertical'
      },
      theme: {
        primary_color: '#5593cc',
        secondary_color: '#64748b',
        background_color: '#ffffff',
        text_color: '#1f2937',
        font_family: 'Inter',
        border_radius: 8,
        custom_css: ''
      },
      brandKit: {
        logo: {
          url: '',
          alt: 'Brand Logo',
          width: 80,
          height: 80
        }
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '',
      isPublished: false,
      publishedUrl: '',
      response_count: 0
    }
  },
  {
    id: 'event-rsvp-cover-end',
    name: 'Event RSVP (Cover & End)',
    description: 'A Typeform-like RSVP with a cover slide and a branded end page.',
    category: 'Events',
    thumbnail: '/templates/event-rsvp-thumb.jpg',
    previewImage: '/templates/event-rsvp-preview.jpg',
    tags: ['events', 'rsvp', 'cover', 'end-page'],
    isFeatured: true,
    usageCount: 2412,
    estimatedTime: '2-3 min',
    difficulty: 'beginner',
    templateData: {
      id: '',
      title: 'RSVP: Company Meetup',
      description: 'Join us for our upcoming meetup!',
      fields: [
        { id: 'cover-1', type: 'cover_slide', label: 'You\'re Invited!', required: false, settings: { coverTitle: 'Company Meetup', coverSubtitle: 'Please RSVP below', coverMediaUrl: '/templates/covers/meetup.jpg' } },
        { id: 'rsvp-name-1', type: 'short_text', label: 'Your Name', required: true, placeholder: 'Full name', settings: {} },
        { id: 'rsvp-email-1', type: 'email', label: 'Email', required: true, placeholder: 'you@example.com', settings: {} },
        { id: 'rsvp-attend-1', type: 'multiple_choice', label: 'Will you attend?', required: true, options: ['Yes', 'No', 'Maybe'], settings: {} },
        { id: 'diet-1', type: 'long_text', label: 'Dietary Requirements (optional)', required: false, placeholder: 'Vegetarian, vegan, allergies...', settings: {} },
        { id: 'end-1', type: 'end_page', label: 'Thanks!', required: false, settings: { endTitle: 'Thanks for RSVPing', endSubtitle: 'We\'ll email details soon', endButtonText: 'Done', endButtonUrl: '' } }
      ],
      settings: { allow_multiple_responses: true, require_login: false, show_progress_bar: true, submit_button_text: 'Submit', success_message: 'Thanks for your RSVP!', email_notifications: false, display_mode: 'single_page', layout: 'vertical' },
      theme: { primary_color: '#5593cc', secondary_color: '#64748b', background_color: '#ffffff', text_color: '#1f2937', font_family: 'Inter', border_radius: 8, custom_css: '' },
      brandKit: { logo: { url: '', alt: 'Brand Logo', width: 80, height: 80 } },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '',
      isPublished: false,
      publishedUrl: '',
      response_count: 0
    }
  },
  {
    id: 'lead-qualifier-logic',
    name: 'Lead Qualifier (Conditional Logic)',
    description: 'Qualify leads with logic that adapts questions based on answers.',
    category: 'Marketing',
    thumbnail: '/templates/lead-qualifier-thumb.jpg',
    previewImage: '/templates/lead-qualifier-preview.jpg',
    tags: ['leads', 'logic', 'qualification'],
    isFeatured: true,
    usageCount: 2220,
    estimatedTime: '3-4 min',
    difficulty: 'intermediate',
    templateData: {
      id: '',
      title: 'Lead Qualification',
      description: 'Answer a few questions and we\'ll tailor next steps.',
      fields: [
        { id: 'lq-name-1', type: 'short_text', label: 'Name', required: true, placeholder: 'Your name', settings: {} },
        { id: 'lq-email-1', type: 'email', label: 'Business Email', required: true, placeholder: 'you@company.com', settings: {} },
        { id: 'lq-size-1', type: 'dropdown', label: 'Company size', required: true, options: ['1-10', '11-50', '51-200', '201-1000', '1000+'], settings: {} },
        { id: 'lq-budget-1', type: 'dropdown', label: 'Budget range', required: true, options: ['< $2k', '$2k - $10k', '$10k - $50k', '$50k+'], settings: {} },
        { id: 'lq-priority-1', type: 'multiple_choice', label: 'Priority features', required: false, options: ['Analytics', 'Automation', 'Integrations', 'Support'], settings: {} },
        { id: 'lq-usecase-1', type: 'long_text', label: 'Describe your use case', required: false, placeholder: 'What are you trying to achieve?', settings: {} }
      ],
      settings: { allow_multiple_responses: true, require_login: false, show_progress_bar: true, submit_button_text: 'Submit', success_message: 'Thanks! We\'ll be in touch.', email_notifications: false, display_mode: 'single_page', layout: 'vertical' },
      theme: { primary_color: '#5593cc', secondary_color: '#64748b', background_color: '#ffffff', text_color: '#1f2937', font_family: 'Inter', border_radius: 8, custom_css: '' },
      brandKit: { logo: { url: '', alt: 'Brand Logo', width: 80, height: 80 } },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '',
      isPublished: false,
      publishedUrl: '',
      response_count: 0
    }
  },
  {
    id: 'job-application-logic-cover-end',
    name: 'Job Application (Cover, Logic, End)',
    description: 'A polished hiring form with a cover page, role-based logic, and an end page.',
    category: 'HR',
    thumbnail: '/templates/job-application-logic-thumb.jpg',
    previewImage: '/templates/job-application-logic-preview.jpg',
    tags: ['hiring', 'logic', 'cover', 'end-page'],
    isFeatured: true,
    usageCount: 1120,
    estimatedTime: '6-8 min',
    difficulty: 'advanced',
    templateData: {
      id: '',
      title: 'Job Application (Enhanced)',
      description: 'Apply to join our team. The questions adapt to your role.',
      fields: [
        { id: 'ja-cover-1', type: 'cover_slide', label: 'Join Our Team', required: false, settings: { coverTitle: 'We\'re Hiring', coverSubtitle: 'Tell us about yourself', coverMediaUrl: '/templates/covers/hiring.jpg' } },
        { id: 'ja-name-1', type: 'short_text', label: 'Full Name', required: true, placeholder: 'Jane Doe', settings: {} },
        { id: 'ja-email-1', type: 'email', label: 'Email', required: true, placeholder: 'jane@example.com', settings: {} },
        { id: 'ja-role-1', type: 'dropdown', label: 'Which role?', required: true, options: ['Engineering', 'Design', 'Product', 'Operations'], settings: {} },
        { id: 'ja-github-1', type: 'short_text', label: 'GitHub (Engineering only)', required: false, placeholder: 'https://github.com/username', settings: {}, conditional: { fieldId: 'ja-role-1', operator: 'equals', value: 'Engineering', action: 'show' } },
        { id: 'ja-figma-1', type: 'short_text', label: 'Portfolio URL (Design only)', required: false, placeholder: 'https://portfolio.com', settings: {}, conditional: { fieldId: 'ja-role-1', operator: 'equals', value: 'Design', action: 'show' } },
        { id: 'ja-case-1', type: 'long_text', label: 'Tell us about a project you led', required: true, placeholder: 'Brief case study', settings: {} },
        { id: 'ja-end-1', type: 'end_page', label: 'Thank you!', required: false, settings: { endTitle: 'Application submitted', endSubtitle: 'We\'ll be in touch soon', endButtonText: 'Close', endButtonUrl: '' } }
      ],
      settings: { allow_multiple_responses: false, require_login: false, show_progress_bar: true, submit_button_text: 'Submit', success_message: 'Application received.', email_notifications: false, display_mode: 'single_page', layout: 'vertical' },
      theme: { primary_color: '#5593cc', secondary_color: '#64748b', background_color: '#ffffff', text_color: '#1f2937', font_family: 'Inter', border_radius: 8, custom_css: '' },
      brandKit: { logo: { url: '', alt: 'Brand Logo', width: 80, height: 80 } },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '',
      isPublished: false,
      publishedUrl: '',
      response_count: 0
    }
  },
  {
    id: 'job-application',
    name: 'Job Application',
    description: 'Collect applicant information, experience, and portfolio links for hiring.',
    category: 'HR',
    thumbnail: '/templates/job-application-thumb.jpg',
    previewImage: '/templates/job-application-preview.jpg',
    tags: ['hiring', 'recruitment', 'resume', 'portfolio'],
    isFeatured: true,
    usageCount: 1843,
    estimatedTime: '5-7 min',
    difficulty: 'intermediate',
    templateData: {
      id: '',
      title: 'Job Application',
      description: 'Apply for the open position by completing the form below.',
      fields: [
        { id: 'ja-basic-cover-1', type: 'cover_slide', label: 'Join Us', required: false, settings: { coverTitle: 'Apply Today', coverSubtitle: 'Tell us about yourself', coverMediaUrl: '/templates/covers/job.jpg' } },
        { id: 'full-name-1', type: 'short_text', label: 'Full Name', required: true, placeholder: 'Jane Doe', settings: {} },
        { id: 'email-2', type: 'email', label: 'Email', required: true, placeholder: 'jane@example.com', settings: {} },
        { id: 'phone-2', type: 'phone', label: 'Phone Number', required: false, placeholder: '+1 555 000 0000', settings: {} },
        { id: 'role-1', type: 'dropdown', label: 'Position Applying For', required: true, options: ['Frontend Engineer', 'Backend Engineer', 'Product Designer', 'Product Manager', 'Other'], settings: {} },
        { id: 'experience-1', type: 'number', label: 'Years of Relevant Experience', required: true, placeholder: 'e.g. 4', settings: {} },
        { id: 'portfolio-1', type: 'short_text', label: 'Portfolio or LinkedIn URL', required: false, placeholder: 'https://...', settings: {} },
        { id: 'cover-letter-1', type: 'long_text', label: 'Cover Letter', required: false, placeholder: 'Briefly tell us why you are a great fit...', settings: {} },
        { id: 'ja-basic-end-1', type: 'end_page', label: 'Thank you!', required: false, settings: { endTitle: 'Application submitted', endSubtitle: 'We\'ll be in touch soon', endButtonText: 'Close', endButtonUrl: '' } }
      ],
      settings: {
        allow_multiple_responses: false,
        require_login: false,
        show_progress_bar: true,
        submit_button_text: 'Submit Application',
        success_message: 'Thanks! Your application has been received.',
        email_notifications: false,
        display_mode: 'single_page',
        layout: 'vertical'
      },
      theme: {
        primary_color: '#5593cc',
        secondary_color: '#64748b',
        background_color: '#ffffff',
        text_color: '#1f2937',
        font_family: 'Inter',
        border_radius: 8,
        custom_css: ''
      },
      brandKit: { logo: { url: '', alt: 'Brand Logo', width: 80, height: 80 } },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '',
      isPublished: false,
      publishedUrl: '',
      response_count: 0
    }
  },
  {
    id: 'event-registration',
    name: 'Event Registration',
    description: 'Register attendees for webinars, workshops, or conferences.',
    category: 'Events',
    thumbnail: '/templates/event-registration-thumb.jpg',
    previewImage: '/templates/event-registration-preview.jpg',
    tags: ['events', 'tickets', 'webinar', 'rsvp'],
    isFeatured: true,
    usageCount: 5297,
    estimatedTime: '3-4 min',
    difficulty: 'beginner',
    templateData: {
      id: '',
      title: 'Event Registration',
      description: 'Secure your spot by completing this quick registration form.',
      fields: [
        { id: 'ev-cover-1', type: 'cover_slide', label: 'Welcome', required: false, settings: { coverTitle: 'Register for the Event', coverSubtitle: 'Secure your spot below', coverMediaUrl: '/templates/covers/event.jpg' } },
        { id: 'attendee-name-1', type: 'short_text', label: 'Full Name', required: true, placeholder: 'Alex Johnson', settings: {} },
        { id: 'attendee-email-1', type: 'email', label: 'Email', required: true, placeholder: 'alex@example.com', settings: {} },
        { id: 'ticket-type-1', type: 'dropdown', label: 'Ticket Type', required: true, options: ['General Admission', 'VIP', 'Student'], settings: {} },
        { id: 'attendance-date-1', type: 'date', label: 'Preferred Date', required: true, settings: {} },
        { id: 'notes-1', type: 'long_text', label: 'Special Requirements', required: false, placeholder: 'Dietary, accessibility, etc.', settings: {} },
        { id: 'ev-end-1', type: 'end_page', label: 'All Set!', required: false, settings: { endTitle: 'You\'re Registered', endSubtitle: 'We\'ll email you details shortly', endButtonText: 'Done', endButtonUrl: '' } }
      ],
      settings: {
        allow_multiple_responses: true,
        require_login: false,
        show_progress_bar: false,
        submit_button_text: 'Register',
        success_message: 'You are registered! Check your email for details.',
        email_notifications: false,
        display_mode: 'single_page',
        layout: 'vertical'
      },
      theme: { primary_color: '#5593cc', secondary_color: '#64748b', background_color: '#ffffff', text_color: '#1f2937', font_family: 'Inter', border_radius: 8, custom_css: '' },
      brandKit: { logo: { url: '', alt: 'Brand Logo', width: 80, height: 80 } },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '',
      isPublished: false,
      publishedUrl: '',
      response_count: 0
    }
  },
  {
    id: 'customer-feedback',
    name: 'Customer Feedback',
    description: 'Gather qualitative feedback from customers to improve your product or service.',
    category: 'Product',
    thumbnail: '/templates/customer-feedback-thumb.jpg',
    previewImage: '/templates/customer-feedback-preview.jpg',
    tags: ['feedback', 'cx', 'product', 'research'],
    isFeatured: false,
    usageCount: 3431,
    estimatedTime: '2-3 min',
    difficulty: 'beginner',
    templateData: {
      id: '',
      title: 'Customer Feedback',
      description: 'We value your feedback. Please share your thoughts below.',
      fields: [
        { id: 'cf-cover-1', type: 'cover_slide', label: 'Your Feedback Matters', required: false, settings: { coverTitle: 'Customer Feedback', coverSubtitle: 'Tell us what you think', coverMediaUrl: '/templates/covers/feedback.jpg' } },
        { id: 'cf-name-1', type: 'short_text', label: 'Name', required: false, placeholder: 'Optional', settings: {} },
        { id: 'cf-email-1', type: 'email', label: 'Email', required: false, placeholder: 'Optional', settings: {} },
        { id: 'satisfaction-1', type: 'dropdown', label: 'Overall Satisfaction', required: true, options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'], settings: {} },
        { id: 'improve-1', type: 'long_text', label: 'What can we improve?', required: false, placeholder: 'Your suggestions...', settings: {} },
        { id: 'feature-ideas-1', type: 'long_text', label: 'Feature ideas or requests', required: false, placeholder: 'Tell us what you would like to see...', settings: {} },
        { id: 'cf-end-1', type: 'end_page', label: 'Thanks!', required: false, settings: { endTitle: 'Thanks for your feedback', endSubtitle: 'We appreciate your time', endButtonText: 'Close', endButtonUrl: '' } }
      ],
      settings: { allow_multiple_responses: true, require_login: false, show_progress_bar: false, submit_button_text: 'Send Feedback', success_message: 'Thank you for your feedback!', email_notifications: false, display_mode: 'single_page', layout: 'vertical' },
      theme: { primary_color: '#5593cc', secondary_color: '#64748b', background_color: '#ffffff', text_color: '#1f2937', font_family: 'Inter', border_radius: 8, custom_css: '' },
      brandKit: { logo: { url: '', alt: 'Brand Logo', width: 80, height: 80 } },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '',
      isPublished: false,
      publishedUrl: '',
      response_count: 0
    }
  },
  {
    id: 'nps-survey',
    name: 'NPS Survey',
    description: 'Measure loyalty by asking how likely customers are to recommend you.',
    category: 'Marketing',
    thumbnail: '/templates/nps-thumb.jpg',
    previewImage: '/templates/nps-preview.jpg',
    tags: ['nps', 'research', 'marketing'],
    isFeatured: true,
    usageCount: 6799,
    estimatedTime: '1-2 min',
    difficulty: 'beginner',
    templateData: {
      id: '',
      title: 'NPS Survey',
      description: 'On a scale of 0-10, how likely are you to recommend us?',
      fields: [
        { id: 'nps-cover-1', type: 'cover_slide', label: 'Quick Survey', required: false, settings: { coverTitle: 'NPS Survey', coverSubtitle: 'It takes less than a minute', coverMediaUrl: '/templates/covers/nps.jpg' } },
        { id: 'nps-email-1', type: 'email', label: 'Email (optional)', required: false, placeholder: 'Optional', settings: {} },
        { id: 'nps-score-1', type: 'number', label: 'NPS Score (0-10)', required: true, placeholder: '0-10', settings: {} },
        { id: 'nps-why-1', type: 'long_text', label: 'What is the primary reason for your score?', required: false, placeholder: 'Your feedback...', settings: {} },
        { id: 'nps-end-1', type: 'end_page', label: 'Thanks!', required: false, settings: { endTitle: 'Thanks for your feedback', endSubtitle: 'We appreciate your time', endButtonText: 'Close', endButtonUrl: '' } }
      ],
      settings: { allow_multiple_responses: true, require_login: false, show_progress_bar: false, submit_button_text: 'Submit', success_message: 'Thanks for the feedback!', email_notifications: false, display_mode: 'single_page', layout: 'vertical' },
      theme: { primary_color: '#5593cc', secondary_color: '#64748b', background_color: '#ffffff', text_color: '#1f2937', font_family: 'Inter', border_radius: 8, custom_css: '' },
      brandKit: { logo: { url: '', alt: 'Brand Logo', width: 80, height: 80 } },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '',
      isPublished: false,
      publishedUrl: '',
      response_count: 0
    }
  },
  {
    id: 'newsletter-signup',
    name: 'Newsletter Signup',
    description: 'Collect subscribers for your email newsletter with consent.',
    category: 'Marketing',
    thumbnail: '/templates/newsletter-thumb.jpg',
    previewImage: '/templates/newsletter-preview.jpg',
    tags: ['newsletter', 'email', 'marketing'],
    isFeatured: false,
    usageCount: 7234,
    estimatedTime: '1 min',
    difficulty: 'beginner',
    templateData: {
      id: '',
      title: 'Newsletter Signup',
      description: 'Join our newsletter to get updates in your inbox.',
      fields: [
        { id: 'nl-cover-1', type: 'cover_slide', label: 'Stay in the loop', required: false, settings: { coverTitle: 'Newsletter Signup', coverSubtitle: 'Get updates in your inbox', coverMediaUrl: '/templates/covers/newsletter.jpg' } },
        { id: 'nl-name-1', type: 'short_text', label: 'Name', required: false, placeholder: 'Optional', settings: {} },
        { id: 'nl-email-1', type: 'email', label: 'Email', required: true, placeholder: 'you@example.com', settings: {} },
        { id: 'nl-topics-1', type: 'dropdown', label: 'Topics of Interest', required: false, options: ['Product updates', 'Blog posts', 'Events', 'Promotions'], settings: {} },
        { id: 'nl-end-1', type: 'end_page', label: 'Welcome!', required: false, settings: { endTitle: 'You\'re subscribed', endSubtitle: 'Check your inbox for a confirmation', endButtonText: 'Close', endButtonUrl: '' } }
      ],
      settings: { allow_multiple_responses: true, require_login: false, show_progress_bar: false, submit_button_text: 'Subscribe', success_message: 'You are subscribed. Welcome!', email_notifications: false, display_mode: 'single_page', layout: 'vertical' },
      theme: { primary_color: '#5593cc', secondary_color: '#64748b', background_color: '#ffffff', text_color: '#1f2937', font_family: 'Inter', border_radius: 8, custom_css: '' },
      brandKit: { logo: { url: '', alt: 'Brand Logo', width: 80, height: 80 } },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '',
      isPublished: false,
      publishedUrl: '',
      response_count: 0
    }
  },
  {
    id: 'product-order',
    name: 'Product Order',
    description: 'Let customers place simple product orders or preorders.',
    category: 'Business',
    thumbnail: '/templates/product-order-thumb.jpg',
    previewImage: '/templates/product-order-preview.jpg',
    tags: ['order', 'purchase', 'preorder'],
    isFeatured: false,
    usageCount: 1987,
    estimatedTime: '3-5 min',
    difficulty: 'intermediate',
    templateData: {
      id: '',
      title: 'Product Order',
      description: 'Place your order by selecting product and quantity.',
      fields: [
        { id: 'po-cover-1', type: 'cover_slide', label: 'Place your order', required: false, settings: { coverTitle: 'Product Order', coverSubtitle: 'Quick and easy checkout', coverMediaUrl: '/templates/covers/order.jpg' } },
        { id: 'po-name-1', type: 'short_text', label: 'Full Name', required: true, placeholder: 'Customer name', settings: {} },
        { id: 'po-email-1', type: 'email', label: 'Email', required: true, placeholder: 'you@example.com', settings: {} },
        { id: 'po-product-1', type: 'dropdown', label: 'Product', required: true, options: ['Basic Plan', 'Pro Plan', 'Enterprise'], settings: {} },
        { id: 'po-quantity-1', type: 'number', label: 'Quantity', required: true, placeholder: '1', settings: {} },
        { id: 'po-notes-1', type: 'long_text', label: 'Order Notes', required: false, placeholder: 'Optional notes or instructions', settings: {} },
        { id: 'po-end-1', type: 'end_page', label: 'Order Received', required: false, settings: { endTitle: 'Thank you for your order', endSubtitle: 'We\'ll contact you shortly', endButtonText: 'Close', endButtonUrl: '' } }
      ],
      settings: { allow_multiple_responses: false, require_login: false, show_progress_bar: true, submit_button_text: 'Place Order', success_message: 'Order received. We will contact you shortly.', email_notifications: false, display_mode: 'single_page', layout: 'vertical' },
      theme: { primary_color: '#5593cc', secondary_color: '#64748b', background_color: '#ffffff', text_color: '#1f2937', font_family: 'Inter', border_radius: 8, custom_css: '' },
      brandKit: { logo: { url: '', alt: 'Brand Logo', width: 80, height: 80 } },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '',
      isPublished: false,
      publishedUrl: '',
      response_count: 0
    }
  },
  {
    id: 'support-ticket',
    name: 'Support Ticket',
    description: 'Collect support requests to triage and respond efficiently.',
    category: 'Business',
    thumbnail: '/templates/support-ticket-thumb.jpg',
    previewImage: '/templates/support-ticket-preview.jpg',
    tags: ['support', 'helpdesk', 'issue'],
    isFeatured: false,
    usageCount: 4120,
    estimatedTime: '2-3 min',
    difficulty: 'beginner',
    templateData: {
      id: '',
      title: 'Support Ticket',
      description: 'Tell us what went wrong and we will help.',
      fields: [
        { id: 'st-cover-1', type: 'cover_slide', label: 'Need Help?', required: false, settings: { coverTitle: 'Submit a Support Ticket', coverSubtitle: 'We\'re here to help', coverMediaUrl: '/templates/covers/support.jpg' } },
        { id: 'st-name-1', type: 'short_text', label: 'Name', required: true, placeholder: 'Your name', settings: {} },
        { id: 'st-email-1', type: 'email', label: 'Email', required: true, placeholder: 'you@example.com', settings: {} },
        { id: 'st-category-1', type: 'dropdown', label: 'Issue Category', required: true, options: ['Billing', 'Technical', 'Account', 'Other'], settings: {} },
        { id: 'st-urgency-1', type: 'dropdown', label: 'Urgency', required: true, options: ['Low', 'Medium', 'High'], settings: {} },
        { id: 'st-desc-1', type: 'long_text', label: 'Description', required: true, placeholder: 'Describe your issue...', settings: {} },
        { id: 'st-end-1', type: 'end_page', label: 'Ticket Received', required: false, settings: { endTitle: 'We\'ve got it', endSubtitle: 'Our team will get back to you soon', endButtonText: 'Close', endButtonUrl: '' } }
      ],
      settings: { allow_multiple_responses: true, require_login: false, show_progress_bar: false, submit_button_text: 'Submit Ticket', success_message: 'We have received your ticket.', email_notifications: false, display_mode: 'single_page', layout: 'vertical' },
      theme: { primary_color: '#5593cc', secondary_color: '#64748b', background_color: '#ffffff', text_color: '#1f2937', font_family: 'Inter', border_radius: 8, custom_css: '' },
      brandKit: { logo: { url: '', alt: 'Brand Logo', width: 80, height: 80 } },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '',
      isPublished: false,
      publishedUrl: '',
      response_count: 0
    }
  },
  {
    id: 'bug-report',
    name: 'Bug Report',
    description: 'Capture software bugs with context to speed up fixes.',
    category: 'Product',
    thumbnail: '/templates/bug-report-thumb.jpg',
    previewImage: '/templates/bug-report-preview.jpg',
    tags: ['qa', 'engineering', 'bug'],
    isFeatured: false,
    usageCount: 1675,
    estimatedTime: '2-4 min',
    difficulty: 'beginner',
    templateData: {
      id: '',
      title: 'Bug Report',
      description: 'Found a bug? Tell us so we can fix it quickly.',
      fields: [
        { id: 'br-cover-1', type: 'cover_slide', label: 'Report a bug', required: false, settings: { coverTitle: 'Bug Report', coverSubtitle: 'Help us fix issues faster', coverMediaUrl: '/templates/covers/bug.jpg' } },
        { id: 'br-email-1', type: 'email', label: 'Email (optional)', required: false, placeholder: 'Optional', settings: {} },
        { id: 'br-env-1', type: 'dropdown', label: 'Environment', required: true, options: ['Production', 'Staging', 'Development', 'Other'], settings: {} },
        { id: 'br-steps-1', type: 'long_text', label: 'Steps to Reproduce', required: true, placeholder: '1) ... 2) ...', settings: {} },
        { id: 'br-expected-1', type: 'long_text', label: 'Expected Behavior', required: true, placeholder: 'What you expected to happen', settings: {} },
        { id: 'br-actual-1', type: 'long_text', label: 'Actual Behavior', required: true, placeholder: 'What actually happened', settings: {} },
        { id: 'br-end-1', type: 'end_page', label: 'Thanks!', required: false, settings: { endTitle: 'Thanks for reporting', endSubtitle: 'We\'ll look into it', endButtonText: 'Close', endButtonUrl: '' } }
      ],
      settings: { allow_multiple_responses: true, require_login: false, show_progress_bar: false, submit_button_text: 'Submit Bug', success_message: 'Thanks! We will investigate.', email_notifications: false, display_mode: 'single_page', layout: 'vertical' },
      theme: { primary_color: '#5593cc', secondary_color: '#64748b', background_color: '#ffffff', text_color: '#1f2937', font_family: 'Inter', border_radius: 8, custom_css: '' },
      brandKit: { logo: { url: '', alt: 'Brand Logo', width: 80, height: 80 } },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '',
      isPublished: false,
      publishedUrl: '',
      response_count: 0
    }
  },
  {
    id: 'appointment-booking',
    name: 'Appointment Booking',
    description: 'Schedule appointments with preferred date and time.',
    category: 'Business',
    thumbnail: '/templates/appointment-thumb.jpg',
    previewImage: '/templates/appointment-preview.jpg',
    tags: ['booking', 'calendar', 'schedule'],
    isFeatured: false,
    usageCount: 2890,
    estimatedTime: '2-3 min',
    difficulty: 'beginner',
    templateData: {
      id: '',
      title: 'Appointment Booking',
      description: 'Book a time that works for you.',
      fields: [
        { id: 'ab-cover-1', type: 'cover_slide', label: 'Book a time', required: false, settings: { coverTitle: 'Appointment Booking', coverSubtitle: 'We\'ll confirm by email', coverMediaUrl: '/templates/covers/appointment.jpg' } },
        { id: 'ab-name-1', type: 'short_text', label: 'Full Name', required: true, placeholder: 'Your name', settings: {} },
        { id: 'ab-email-1', type: 'email', label: 'Email', required: true, placeholder: 'you@example.com', settings: {} },
        { id: 'ab-date-1', type: 'date', label: 'Preferred Date', required: true, settings: {} },
        { id: 'ab-time-1', type: 'time', label: 'Preferred Time', required: true, settings: {} },
        { id: 'ab-notes-1', type: 'long_text', label: 'Notes', required: false, placeholder: 'Anything we should know?', settings: {} },
        { id: 'ab-end-1', type: 'end_page', label: 'Request Sent', required: false, settings: { endTitle: 'Thanks!', endSubtitle: 'We\'ll confirm your appointment shortly', endButtonText: 'Close', endButtonUrl: '' } }
      ],
      settings: { allow_multiple_responses: true, require_login: false, show_progress_bar: false, submit_button_text: 'Book Appointment', success_message: 'Appointment requested! We will confirm by email.', email_notifications: false, display_mode: 'single_page', layout: 'vertical' },
      theme: { primary_color: '#5593cc', secondary_color: '#64748b', background_color: '#ffffff', text_color: '#1f2937', font_family: 'Inter', border_radius: 8, custom_css: '' },
      brandKit: { logo: { url: '', alt: 'Brand Logo', width: 80, height: 80 } },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '',
      isPublished: false,
      publishedUrl: '',
      response_count: 0
    }
  },
  {
    id: 'course-registration',
    name: 'Course Registration',
    description: 'Enroll learners in courses or classes and capture preferences.',
    category: 'Events',
    thumbnail: '/templates/course-registration-thumb.jpg',
    previewImage: '/templates/course-registration-preview.jpg',
    tags: ['education', 'classes', 'training'],
    isFeatured: false,
    usageCount: 1322,
    estimatedTime: '3-5 min',
    difficulty: 'intermediate',
    templateData: {
      id: '',
      title: 'Course Registration',
      description: 'Register for upcoming courses and set your preferences.',
      fields: [
        { id: 'cr-cover-1', type: 'cover_slide', label: 'Enroll now', required: false, settings: { coverTitle: 'Course Registration', coverSubtitle: 'Secure your seat', coverMediaUrl: '/templates/covers/course.jpg' } },
        { id: 'cr-name-1', type: 'short_text', label: 'Full Name', required: true, placeholder: 'Your name', settings: {} },
        { id: 'cr-email-1', type: 'email', label: 'Email', required: true, placeholder: 'you@example.com', settings: {} },
        { id: 'cr-course-1', type: 'dropdown', label: 'Course Selection', required: true, options: ['Beginner Course', 'Intermediate Course', 'Advanced Course'], settings: {} },
        { id: 'cr-start-1', type: 'date', label: 'Preferred Start Date', required: false, settings: {} },
        { id: 'cr-goals-1', type: 'long_text', label: 'Learning Goals', required: false, placeholder: 'What do you want to learn?', settings: {} },
        { id: 'cr-end-1', type: 'end_page', label: 'Enrolled!', required: false, settings: { endTitle: 'Thanks for enrolling', endSubtitle: 'We\'ll email next steps', endButtonText: 'Close', endButtonUrl: '' } }
      ],
      settings: { allow_multiple_responses: true, require_login: false, show_progress_bar: true, submit_button_text: 'Enroll', success_message: 'Enrollment received. We will contact you with next steps.', email_notifications: false, display_mode: 'single_page', layout: 'vertical' },
      theme: { primary_color: '#5593cc', secondary_color: '#64748b', background_color: '#ffffff', text_color: '#1f2937', font_family: 'Inter', border_radius: 8, custom_css: '' },
      brandKit: { logo: { url: '', alt: 'Brand Logo', width: 80, height: 80 } },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '',
      isPublished: false,
      publishedUrl: '',
      response_count: 0
    }
  },
  {
    id: 'market-research',
    name: 'Market Research Survey',
    description: 'Understand your audience with demographics and preferences.',
    category: 'Marketing',
    thumbnail: '/templates/market-research-thumb.jpg',
    previewImage: '/templates/market-research-preview.jpg',
    tags: ['survey', 'research', 'audience'],
    isFeatured: false,
    usageCount: 2560,
    estimatedTime: '4-6 min',
    difficulty: 'intermediate',
    templateData: {
      id: '',
      title: 'Market Research Survey',
      description: 'Help us learn more about you and your preferences.',
      fields: [
        { id: 'mr-cover-1', type: 'cover_slide', label: 'A few questions', required: false, settings: { coverTitle: 'Market Research', coverSubtitle: 'Help us improve', coverMediaUrl: '/templates/covers/research.jpg' } },
        { id: 'mr-age-1', type: 'number', label: 'Age', required: false, placeholder: 'Optional', settings: {} },
        { id: 'mr-country-1', type: 'short_text', label: 'Country', required: false, placeholder: 'Your country', settings: {} },
        { id: 'mr-gender-1', type: 'dropdown', label: 'Gender', required: false, options: ['Female', 'Male', 'Non-binary', 'Prefer not to say'], settings: {} },
        { id: 'mr-product-usage-1', type: 'dropdown', label: 'How often do you use our product?', required: true, options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never'], settings: {} },
        { id: 'mr-comments-1', type: 'long_text', label: 'Additional Comments', required: false, placeholder: 'Anything else to add?', settings: {} },
        { id: 'mr-end-1', type: 'end_page', label: 'Thanks!', required: false, settings: { endTitle: 'Thanks for participating', endSubtitle: 'Your input helps us build better products', endButtonText: 'Close', endButtonUrl: '' } }
      ],
      settings: { allow_multiple_responses: true, require_login: false, show_progress_bar: true, submit_button_text: 'Submit', success_message: 'Thanks for participating!', email_notifications: false, display_mode: 'single_page', layout: 'vertical' },
      theme: { primary_color: '#5593cc', secondary_color: '#64748b', background_color: '#ffffff', text_color: '#1f2937', font_family: 'Inter', border_radius: 8, custom_css: '' },
      brandKit: { logo: { url: '', alt: 'Brand Logo', width: 80, height: 80 } },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '',
      isPublished: false,
      publishedUrl: '',
      response_count: 0
    }
  },
  {
    id: 'request-quote',
    name: 'Request a Quote',
    description: 'Qualify leads by collecting requirements and budget for quotes.',
    category: 'Business',
    thumbnail: '/templates/request-quote-thumb.jpg',
    previewImage: '/templates/request-quote-preview.jpg',
    tags: ['leads', 'sales', 'rfq'],
    isFeatured: false,
    usageCount: 3012,
    estimatedTime: '3-5 min',
    difficulty: 'intermediate',
    templateData: {
      id: '',
      title: 'Request a Quote',
      description: 'Tell us about your project and we will prepare a quote.',
      fields: [
        { id: 'rq-cover-1', type: 'cover_slide', label: 'Tell us about your project', required: false, settings: { coverTitle: 'Request a Quote', coverSubtitle: 'We\'ll respond within 1-2 business days', coverMediaUrl: '/templates/covers/quote.jpg' } },
        { id: 'rq-name-1', type: 'short_text', label: 'Full Name', required: true, placeholder: 'Your name', settings: {} },
        { id: 'rq-email-1', type: 'email', label: 'Email', required: true, placeholder: 'you@example.com', settings: {} },
        { id: 'rq-company-1', type: 'short_text', label: 'Company', required: false, placeholder: 'Optional', settings: {} },
        { id: 'rq-budget-1', type: 'dropdown', label: 'Estimated Budget', required: true, options: ['$1k-$5k', '$5k-$10k', '$10k-$50k', '$50k+'], settings: {} },
        { id: 'rq-details-1', type: 'long_text', label: 'Project Details', required: true, placeholder: 'Describe your requirements...', settings: {} },
        { id: 'rq-end-1', type: 'end_page', label: 'Got it!', required: false, settings: { endTitle: 'Thanks for the request', endSubtitle: 'We\'ll get back to you shortly', endButtonText: 'Close', endButtonUrl: '' } }
      ],
      settings: { allow_multiple_responses: true, require_login: false, show_progress_bar: false, submit_button_text: 'Request Quote', success_message: 'Thanks! We will get back to you shortly.', email_notifications: false, display_mode: 'single_page', layout: 'vertical' },
      theme: { primary_color: '#5593cc', secondary_color: '#64748b', background_color: '#ffffff', text_color: '#1f2937', font_family: 'Inter', border_radius: 8, custom_css: '' },
      brandKit: { logo: { url: '', alt: 'Brand Logo', width: 80, height: 80 } },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: '',
      isPublished: false,
      publishedUrl: '',
      response_count: 0
    }
  }
]

export const templateCategories = [
  { id: 'all', name: 'All Templates', count: formTemplates.length },
  { id: 'Business', name: 'Business', count: formTemplates.filter(t => t.category === 'Business').length },
  { id: 'Events', name: 'Events', count: formTemplates.filter(t => t.category === 'Events').length },
  { id: 'HR', name: 'HR', count: formTemplates.filter(t => t.category === 'HR').length },
  { id: 'Product', name: 'Product', count: formTemplates.filter(t => t.category === 'Product').length },
  { id: 'Marketing', name: 'Marketing', count: formTemplates.filter(t => t.category === 'Marketing').length }
]

export function getTemplateById(id: string): FormTemplate | undefined {
  return formTemplates.find(template => template.id === id)
}

export function getTemplatesByCategory(category: string): FormTemplate[] {
  if (category === 'all') return formTemplates
  return formTemplates.filter(template => template.category === category)
}

export function getFeaturedTemplates(): FormTemplate[] {
  return formTemplates.filter(template => template.isFeatured)
}

export function searchTemplates(query: string): FormTemplate[] {
  const lowercaseQuery = query.toLowerCase()
  return formTemplates.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}


