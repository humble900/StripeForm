export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            Privacy Policy
          </h1>
          <div className="text-gray-600 space-y-6">
            <p>
              <strong>Last updated:</strong> January 2025
            </p>
            <p>
              We're working on our comprehensive privacy policy. In the meantime, 
              we want you to know that we take your privacy seriously and are committed 
              to protecting your personal information.
            </p>
            <p>
              For any privacy-related questions, please contact us through our 
              support channels.
            </p>
            <div className="mt-8">
              <a 
                href="/builder" 
                className="bg-[#6C5CE7] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transition-all inline-flex items-center justify-center"
              >
                Start Building Forms
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

