export const getStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "StripeForm",
    description:
      "Design forms people love to fill. Create beautiful, interactive forms that get higher response rates. No coding required.",
    url: "https://stripeform.app",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web Browser",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    offers: [
      {
        "@type": "Offer",
        name: "Free Plan",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        description: "Up to 5 published forms with basic features",
      },
      {
        "@type": "Offer",
        name: "Pro Plan",
        price: "19",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        description: "Unlimited forms with advanced features",
      },
    ],
    author: {
      "@type": "Organization",
      name: "StripeForm",
      url: "https://stripeform.app",
    },
    creator: {
      "@type": "Organization",
      name: "StripeForm",
    },
    publisher: {
      "@type": "Organization",
      name: "StripeForm",
    },
    featureList: [
      "Drag and drop form builder",
      "Interactive form elements",
      "Real-time form preview",
      "Form analytics and insights",
      "Mobile-responsive design",
      "Payment integration",
      "Custom branding",
      "Form templates",
      "Data export",
      "Multi-language support",
      "Conditional logic",
      "API access",
      "Team collaboration",
      "Advanced security",
    ],
    screenshot: "https://stripeform.app/screenshot-wide.png",
    softwareVersion: "1.0.0",
    datePublished: "2024-01-01",
    dateModified: new Date().toISOString().split("T")[0],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
      bestRating: "5",
      worstRating: "1",
    },
    review: [
      {
        "@type": "Review",
        author: {
          "@type": "Person",
          name: "Sarah Johnson",
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
        },
        reviewBody:
          "StripeForm has revolutionized how we collect data. The interface is intuitive and the forms look professional.",
      },
    ],
  };
};

export const getOrganizationData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "StripeForm",
    url: "https://stripeform.app",
    logo: "https://stripeform.app/logo.png",
    description:
      "Create beautiful, interactive forms that get higher response rates.",
    foundingDate: "2024",
    sameAs: [
      "https://twitter.com/stripeform",
      "https://linkedin.com/company/stripeform",
      "https://github.com/stripeform",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "support@stripeform.app",
    },
  };
};

export const getBreadcrumbData = (path: string) => {
  const segments = path.split("/").filter(Boolean);
  const breadcrumbs = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://stripeform.app",
    },
  ];

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    breadcrumbs.push({
      "@type": "ListItem",
      position: index + 2,
      name: segment.charAt(0).toUpperCase() + segment.slice(1),
      item: `https://stripeform.app${currentPath}`,
    });
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs,
  };
};

export const getFAQStructuredData = (faqs: any[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
};

export const getPricingStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "StripeForm Pro",
    description:
      "Professional form builder with unlimited forms and advanced features",
    brand: {
      "@type": "Brand",
      name: "StripeForm",
    },
    offers: [
      {
        "@type": "Offer",
        name: "Free Plan",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        description: "Up to 5 published forms with basic features",
        priceValidUntil: "2025-12-31",
      },
      {
        "@type": "Offer",
        name: "Pro Plan",
        price: "19",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        description: "Unlimited forms with advanced features",
        priceValidUntil: "2025-12-31",
        billingIncrement: "P1M",
      },
    ],
  };
};

export const getContactStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact StripeForm",
    description:
      "Get in touch with our team for support, sales inquiries, or partnership opportunities",
    mainEntity: {
      "@type": "Organization",
      name: "StripeForm",
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer service",
          email: "support@stripeform.app",
          availableLanguage: "English",
          areaServed: "Worldwide",
          hoursAvailable: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            opens: "09:00",
            closes: "18:00",
          },
        },
        {
          "@type": "ContactPoint",
          contactType: "sales",
          email: "sales@stripeform.app",
          availableLanguage: "English",
          areaServed: "Worldwide",
        },
        {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: "+1-555-0123",
          contactOption: "TollFree",
          availableLanguage: "English",
          areaServed: "Worldwide",
        },
      ],
      sameAs: ["https://wa.me/message/AU6WGM7HEG63M1"],
    },
  };
};
