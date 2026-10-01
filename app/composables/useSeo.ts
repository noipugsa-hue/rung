export const useSeo = () => {
  const route = useRoute()
  const config = useRuntimeConfig()

  const defaultTitle = 'LUNG — เช่าลุง หาคนไปด้วย บริการหาเพื่อนทำกิจกรรมต่างๆ'
  const defaultDescription = 'แพลตฟอร์มเช่าลุง ลุงเช่า หาคนไปด้วยในกิจกรรมต่างๆ กินข้าว เที่ยว คาเฟ่ คุยเล่น พร้อมคนที่ใช่ บริการหาเพื่อนออกไป ไปเที่ยวด้วยกัน จองได้ง่ายๆ เริ่มต้นที่ 200 บาท'
  const siteUrl = 'https://lung.app'

  interface SeoOptions {
    title?: string
    description?: string
    image?: string
    url?: string
    type?: 'website' | 'article' | 'product'
    keywords?: string[]
    structuredData?: Record<string, any>
  }

  const setSeo = (options: SeoOptions = {}) => {
    const {
      title = defaultTitle,
      description = defaultDescription,
      image = `${siteUrl}/og-image.jpg`,
      url = `${siteUrl}${route.path}`,
      type = 'website',
      keywords = [
        'เช่าลุง',
        'ลุงเช่า',
        'หาคนไปด้วย',
        'หาเพื่อนไปเที่ยว',
        'หาคนกินข้าว',
        'หาคนไปคาเฟ่',
        'บริการหาเพื่อน',
        'คนเช่า',
        'หาเพื่อนคุย',
        'ไปไหนด้วยกัน',
        'lung',
        'ใครสักคนไปด้วย'
      ],
      structuredData
    } = options

    useHead({
      title,
      meta: [
        // Basic meta tags
        { name: 'description', content: description },
        { name: 'keywords', content: keywords.join(', ') },

        // Open Graph
        { property: 'og:site_name', content: 'LUNG' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: type },
        { property: 'og:url', content: url },
        { property: 'og:image', content: image },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:locale', content: 'th_TH' },

        // Twitter Card
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: image },

        // Additional SEO
        { name: 'robots', content: 'index, follow' },
        { name: 'googlebot', content: 'index, follow' },
        { name: 'language', content: 'Thai' },
        { name: 'geo.region', content: 'TH' },
        { name: 'geo.placename', content: 'Thailand' }
      ],
      link: [
        { rel: 'canonical', href: url }
      ]
    })

    // Add structured data if provided
    if (structuredData) {
      useHead({
        script: [
          {
            type: 'application/ld+json',
            innerHTML: JSON.stringify(structuredData)
          }
        ]
      })
    }
  }

  // Structured data generators
  const getOrganizationSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LUNG',
    alternateName: 'ลุง - ใครสักคนไปด้วย',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: 'แพลตฟอร์มเช่าลุง หาคนไปด้วยในกิจกรรมต่างๆ เช่น กินข้าว เที่ยว คาเฟ่ คุยเล่น',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TH'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['th', 'en']
    },
    sameAs: []
  })

  const getWebsiteSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LUNG',
    alternateName: 'ลุง - ใครสักคนไปด้วย',
    url: siteUrl,
    description: 'แพลตฟอร์มเช่าลุง หาคนไปด้วย บริการหาเพื่อนทำกิจกรรม',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  })

  const getServiceSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'บริการหาเพื่อนทำกิจกรรม',
    name: 'บริการเช่าลุง หาคนไปด้วย',
    description: 'บริการเช่าลุง หาคนไปเที่ยว กินข้าว คาเฟ่ คุยเล่น และกิจกรรมอื่นๆ จองได้ง่ายๆ ราคาเริ่มต้น 200 บาท',
    provider: {
      '@type': 'Organization',
      name: 'LUNG'
    },
    areaServed: {
      '@type': 'Country',
      name: 'Thailand'
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'THB',
      lowPrice: '200',
      offerCount: '100+'
    }
  })

  const getPersonSchema = (lung: any) => ({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: lung.displayName,
    image: lung.profileImage,
    description: lung.bio,
    aggregateRating: lung.rating ? {
      '@type': 'AggregateRating',
      ratingValue: lung.rating.toFixed(1),
      reviewCount: lung.reviewCount || 0,
      bestRating: '5',
      worstRating: '1'
    } : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'THB',
      price: lung.pricePerHour / 100, // Convert satang to baht
      availability: 'https://schema.org/InStock'
    }
  })

  const getBreadcrumbSchema = (items: Array<{ name: string; url?: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url && { item: `${siteUrl}${item.url}` })
    }))
  })

  return {
    setSeo,
    getOrganizationSchema,
    getWebsiteSchema,
    getServiceSchema,
    getPersonSchema,
    getBreadcrumbSchema
  }
}
