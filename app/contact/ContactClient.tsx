"use client";

import { useState } from "react";
import {
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  ChatBubbleOvalLeftEllipsisIcon,
} from "@heroicons/react/24/outline";

export default function ContactClient() {
  const [activeTab, setActiveTab] = useState("support");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "general",
    preferredTime: "",
    timezone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/support-tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: formData.email,
          userName: formData.name,
          subject: formData.subject,
          description: formData.message,
          category:
            activeTab === "demo"
              ? "demo_request"
              : formData.inquiryType === "technical"
                ? "technical"
                : formData.inquiryType === "billing"
                  ? "billing"
                  : formData.inquiryType === "feature"
                    ? "feature_request"
                    : "general",
          priority: "medium",
          metadata: {
            company: formData.company,
            phone: formData.phone,
            preferredTime: formData.preferredTime,
            inquiryType: formData.inquiryType,
            formType: activeTab,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          company: "",
          phone: "",
          subject: "",
          message: "",
          inquiryType: "general",
          preferredTime: "",
          timezone: "",
        });
      } else {
        throw new Error(data.message || "Failed to submit form");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const supportOptions = [
    {
      icon: DocumentTextIcon,
      title: "Help Center",
      description: "Browse our comprehensive knowledge base and tutorials",
      action: "Visit Help Center",
      href: "/help",
      color: "bg-blue-500",
    },
    {
      icon: QuestionMarkCircleIcon,
      title: "FAQ",
      description: "Find quick answers to common questions",
      action: "View FAQs",
      href: "/faq",
      color: "bg-green-500",
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: "Live Chat",
      description: "Get instant help from our support team",
      action: "Start Chat",
      href: "#",
      color: "bg-purple-500",
    },
    {
      icon: EnvelopeIcon,
      title: "Email Support",
      description:
        "Send us a detailed message and we'll respond within 24 hours",
      action: "Send Email",
      href: "mailto:support@stripeform.app",
      color: "bg-orange-500",
    },
  ];

  const demoFeatures = [
    "Custom form builder walkthrough",
    "Advanced features demonstration",
    "Integration possibilities",
    "Custom pricing discussion",
    "Q&A session with our experts",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're here to help you succeed with StripeForm. Choose how you'd
              like to connect with our team.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("support")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "support"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <QuestionMarkCircleIcon className="w-5 h-5" />
                <span>Get Support</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("demo")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "demo"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <VideoCameraIcon className="w-5 h-5" />
                <span>Request Demo</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "contact"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <EnvelopeIcon className="w-5 h-5" />
                <span>General Inquiry</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Support Tab */}
        {activeTab === "support" && (
          <div className="space-y-12">
            {/* Support Options */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                How can we help you?
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {supportOptions.map((option, index) => {
                  const Icon = option.icon;
                  return (
                    <a
                      key={index}
                      href={option.href}
                      className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
                    >
                      <div
                        className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {option.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {option.description}
                      </p>
                      <span className="text-purple-600 font-medium text-sm group-hover:text-purple-700">
                        {option.action} →
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Support Hours */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ClockIcon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Support Hours
                  </h3>
                  <div className="space-y-2 text-gray-600">
                    <p>
                      <strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM EST
                    </p>
                    <p>
                      <strong>Saturday:</strong> 10:00 AM - 4:00 PM EST
                    </p>
                    <p>
                      <strong>Sunday:</strong> Closed
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Emergency support available 24/7 for Pro and Enterprise
                      customers
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Contact */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-8 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">
                      Quick WhatsApp Support
                    </h3>
                    <p className="text-green-100 mb-4">
                      Get instant help via WhatsApp. Our team responds within
                      minutes during business hours.
                    </p>
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>Average response time: 5 minutes</span>
                    </div>
                  </div>
                </div>
                <a
                  href="https://wa.me/message/AU6WGM7HEG63M1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"
                >
                  <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Demo Request Tab */}
        {activeTab === "demo" && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Request a Personalized Demo
              </h2>
              <p className="text-xl text-gray-600">
                See StripeForm in action with a custom demonstration tailored to
                your needs
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Demo Features */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                  What's included in your demo:
                </h3>
                <div className="space-y-4">
                  {demoFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircleIcon className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 bg-blue-50 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <UserGroupIcon className="w-6 h-6 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Perfect for Teams
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Invite your team members to join the demo. We'll answer
                        questions from everyone and show how StripeForm can work
                        for your entire organization.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demo Request Form */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="company"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Company
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="preferredTime"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Preferred Demo Time
                    </label>
                    <select
                      id="preferredTime"
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select a time</option>
                      <option value="morning">Morning (9 AM - 12 PM)</option>
                      <option value="afternoon">
                        Afternoon (12 PM - 5 PM)
                      </option>
                      <option value="evening">Evening (5 PM - 8 PM)</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Tell us about your use case *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      placeholder="What type of forms do you need to create? What's your current process? Any specific features you're interested in?"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? "Scheduling Demo..." : "Request Demo"}
                  </button>
                </form>

                {submitStatus === "success" && (
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      <span className="text-green-800 font-medium">
                        Demo request submitted successfully! We'll contact you
                        within 24 hours.
                      </span>
                    </div>
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <XMarkIcon className="w-5 h-5 text-red-600" />
                      <span className="text-red-800 font-medium">
                        Something went wrong. Please try again or contact us
                        directly.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* General Contact Tab */}
        {activeTab === "contact" && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Send us a Message
              </h2>
              <p className="text-xl text-gray-600">
                Have a question, suggestion, or need help? We'd love to hear
                from you.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                    Get in Touch
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <EnvelopeIcon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Email Us
                        </h4>
                        <p className="text-gray-600">support@stripeform.app</p>
                        <p className="text-gray-600">sales@stripeform.app</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          WhatsApp
                        </h4>
                        <p className="text-gray-600">
                          Quick support via WhatsApp
                        </p>
                        <a
                          href="https://wa.me/message/AU6WGM7HEG63M1"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          Start a conversation →
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <ClockIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Response Time
                        </h4>
                        <p className="text-gray-600">
                          We typically respond within 24 hours
                        </p>
                        <p className="text-gray-600">
                          WhatsApp: Within minutes during business hours
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Button */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">
                        Need immediate help?
                      </h4>
                      <p className="text-green-100 text-sm">
                        Chat with us on WhatsApp for instant support
                      </p>
                    </div>
                    <a
                      href="https://wa.me/message/AU6WGM7HEG63M1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                    >
                      Chat Now
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="inquiryType"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Inquiry Type
                    </label>
                    <select
                      id="inquiryType"
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="general">General Question</option>
                      <option value="technical">Technical Support</option>
                      <option value="sales">Sales Inquiry</option>
                      <option value="billing">Billing Question</option>
                      <option value="feature">Feature Request</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      placeholder="Tell us how we can help you..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>

                {submitStatus === "success" && (
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      <span className="text-green-800 font-medium">
                        Message sent successfully! We'll get back to you soon.
                      </span>
                    </div>
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <XMarkIcon className="w-5 h-5 text-red-600" />
                      <span className="text-red-800 font-medium">
                        Something went wrong. Please try again or contact us
                        directly.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
