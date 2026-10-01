export default defineEventHandler(async (event) => {
  const siteUrl = 'https://lung.app'

  // Static pages
  const staticRoutes = [
    { url: '', changefreq: 'daily', priority: 1.0 },
    { url: '/search', changefreq: 'daily', priority: 0.9 },
    { url: '/become-lung', changefreq: 'monthly', priority: 0.7 },
    { url: '/group-booking/join', changefreq: 'daily', priority: 0.6 },
    { url: '/login', changefreq: 'monthly', priority: 0.3 },
    { url: '/register', changefreq: 'monthly', priority: 0.3 },
  ]

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticRoutes.map(route => `
  <url>
    <loc>${siteUrl}${route.url}</loc>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`).join('')}
</urlset>`

  event.node.res.setHeader('Content-Type', 'application/xml')
  return xml
})
