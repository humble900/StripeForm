'use client'

import Link from 'next/link'
import { ArrowRightIcon, SparklesIcon, DocumentTextIcon, ArrowsPointingOutIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 font-sans">
              <span className="typewriter text-[#6C5CE7] inline-block">
                Design forms people love to fill
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-in-right">
              Create beautiful, interactive forms that get higher response rates. No coding required.
            </p>
            <p className="text-lg text-[#6C5CE7] font-medium mb-8">
              No account needed — start creating forms instantly!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up-delayed-2">
              <Link
                href="/builder"
                prefetch={true}
                className="bg-[#6C5CE7] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-all inline-flex items-center justify-center"
              >
                Create a form - it's free
              </Link>

            </div>
          </div>

          {/* Analytics Dashboard Image */}
          <div className="mt-16 max-w-4xl mx-auto animate-fade-in-up-delayed-3">
            <div className="bg-gray-900 rounded-lg p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">USERS: LAST 7 DAYS USING MEDIAN</h3>
                  <p className="text-2xl font-bold">2.4K</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Bounce Rate (LUX) 40.6%</h3>
                  <p className="text-2xl font-bold">40.6%</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Sessions (LUX) 479K</h3>
                  <p className="text-2xl font-bold">479K</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Session Length (LUX) 17min</h3>
                  <p className="text-2xl font-bold">17min</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Create forms that convert Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Create forms that convert
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our intuitive form builder makes it simple to create engaging forms that people actually want to complete.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Beautiful by default */}
            <div className="text-center">
                          <div className="w-16 h-16 bg-[#6C5CE7] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <SparklesIcon className="w-8 h-8 text-[#6C5CE7]" />
            </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Beautiful by default</h3>
              <p className="text-gray-600">
                Every form looks great out of the box with our carefully crafted design system.
              </p>
            </div>

            {/* One question at a time */}
            <div className="text-center">
                          <div className="w-16 h-16 bg-[#6C5CE7] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="w-8 h-8 text-[#6C5CE7]" />
            </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">One question at a time</h3>
              <p className="text-gray-600">
                Keep users focused and engaged with our step-by-step question flow.
              </p>
            </div>

            {/* Drag & drop builder */}
            <div className="text-center">
                          <div className="w-16 h-16 bg-[#6C5CE7] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowsPointingOutIcon className="w-8 h-8 text-[#6C5CE7]" />
            </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Drag & drop builder</h3>
              <p className="text-gray-600">
                Build forms visually with our intuitive drag-and-drop interface.
              </p>
            </div>
          </div>

          {/* Start instantly block */}
                      <div className="bg-[#6C5CE7] bg-opacity-5 rounded-lg p-8 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#6C5CE7] bg-opacity-10 rounded-full flex items-center justify-center mr-4">
                  <ClipboardDocumentIcon className="w-6 h-6 text-[#6C5CE7]" />
                </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Start instantly, no account needed</h3>
                <p className="text-gray-600">Begin creating your first form in seconds</p>
              </div>
            </div>
                        <Link
              href="/builder"
              prefetch={true}
              className="bg-[#6C5CE7] text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
            >
              Create a form
            </Link>
          </div>
        </div>
      </section>

      {/* Preview your forms Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Preview your forms
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              See exactly how your form will look and behave before publishing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Form Preview */}
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Feedback</h3>
                <p className="text-sm text-gray-500">Question 2 of 5</p>
              </div>
              <div className="mb-6">
                <p className="text-lg text-gray-900 mb-4">How would you rate your experience with our product?</p>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${
                                               num === 4 
                         ? 'bg-[#6C5CE7] text-white' 
                         : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <button className="text-gray-500 hover:text-gray-700">← Back</button>
                                 <button className="bg-[#6C5CE7] text-white px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all">Next →</button>
              </div>
            </div>

            {/* Form Experience Details */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Beautiful form experience</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-600">Typewriter-style text animations capture attention</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-600">Smooth transitions between questions maintain engagement</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-600">Mobile-responsive design works on any device</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Start creating beautiful forms today Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Start creating beautiful forms today
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join thousands of users who are creating forms people love to fill.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/builder"
              prefetch={true}
              className="bg-[#6C5CE7] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-all inline-flex items-center justify-center"
            >
              Create a form - it's free
            </Link>
            <Link
              href="/pricing"
              prefetch={true}
              className="bg-white text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>

                <li><Link href="/integrations" className="hover:text-white transition-colors">Integrations</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/enterprise" className="hover:text-white transition-colors">Enterprise</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/guides" className="hover:text-white transition-colors">Guides</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/webinars" className="hover:text-white transition-colors">Webinars</Link></li>
                <li><Link href="/api" className="hover:text-white transition-colors">API Docs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/press" className="hover:text-white transition-colors">Press</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
                <li><Link href="/gdpr" className="hover:text-white transition-colors">GDPR</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex justify-between items-center">
            <div className="text-gray-400">
              <span className="font-semibold text-white">StripeForm BETA</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">&copy; 2025 StripeForm. All rights reserved.</span>
              <div className="flex space-x-4">
                <a href="https://twitter.com/stripeform" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com/company/stripeform" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="https://pinterest.com/stripeform" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                </a>
                <a href="https://facebook.com/stripeform" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 