#!/usr/bin/env node
/**
 * Between Us Journal static site generator.
 *
 * Reads published editorial articles from Supabase (service role — build env only)
 * and writes SEO-friendly HTML into public/journal/ (copied to betweenus_landing via deploy).
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... node scripts/generateJournal.js
 *
 * Never emits service-role / GitHub secrets into HTML or client JS.
 */
const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const ROOT = path.resolve(__dirname, '..')
const OUT_DIR = process.env.JOURNAL_OUT_DIR
  ? path.resolve(process.env.JOURNAL_OUT_DIR)
  : path.join(ROOT, 'public', 'journal')
const SITEMAP_PATH = process.env.JOURNAL_SITEMAP_PATH
  ? path.resolve(process.env.JOURNAL_SITEMAP_PATH)
  : path.join(ROOT, 'public', 'sitemap.xml')
const SITE = 'https://betweenus.fun'
const PROJECT_URL = process.env.SUPABASE_URL || 'https://qoqbdiixztolvtcjdnle.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.betweenus.app'
const HAS_APP_STORE_LISTING = process.env.HAS_APP_STORE_LISTING === 'true'

const {
  injectInContentAds,
  adsenseHeadSnippet,
  adSlotCss,
  loadAdConfigFromEnv,
  renderAdSlotHtml,
  isAdsLive,
} = require('./journal-ad-placement.cjs')

/** Ads stay off until real ca-pub + slot IDs + BETWEENUS_ADSENSE_CONSENT_READY=true */
const AD_CONFIG = loadAdConfigFromEnv(process.env)
const ADS_LIVE = isAdsLive(AD_CONFIG)

const THEMES = ['rose', 'violet', 'sunset', 'ocean']

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function publicImageUrl(ref) {
  if (!ref) return ''
  if (/^https?:\/\//i.test(ref) || ref.startsWith('/')) return ref
  return `${PROJECT_URL}/storage/v1/object/public/journal-images/${ref.replace(/^\//, '')}`
}

function isLiveArticle(row, now = Date.now()) {
  if (row.status === 'published') return true
  if (row.status === 'scheduled' && row.published_at) {
    return new Date(row.published_at).getTime() <= now
  }
  return false
}

function articleUrl(article) {
  if (article.locale && article.locale !== 'en') {
    return `${SITE}/${article.locale}/journal/${article.slug}`
  }
  return `${SITE}/journal/${article.slug}`
}

function articlePath(article) {
  if (article.locale && article.locale !== 'en') {
    return path.join(ROOT, 'public', article.locale, 'journal', article.slug, 'index.html')
  }
  return path.join(OUT_DIR, article.slug, 'index.html')
}

function sharedCss() {
  return `
:root{--bg:#05040a;--text:#f4f4f5;--muted:#a1a1aa;--accent:#d946ef;--max:42rem}
*{box-sizing:border-box}
body{margin:0;font-family:Outfit,system-ui,sans-serif;background:linear-gradient(180deg,#000 0%,#0a0118 48%,#000 100%);color:var(--text);line-height:1.65}
a{color:#e879f9;text-decoration:none}
a:hover{text-decoration:underline}
.shell{max-width:72rem;margin:0 auto;padding:1rem}
header.bu-j-header{display:flex;justify-content:space-between;align-items:center;padding:1rem 0;border-bottom:1px solid rgba(255,255,255,.08)}
.logo{font-weight:700;color:#fff;font-size:1.1rem}
nav a{margin-left:1rem;color:var(--muted);font-size:.9rem}
.eyebrow{color:var(--accent);font-size:.8rem;letter-spacing:.04em;text-transform:uppercase;margin:0 0 .5rem}
.breadcrumb{color:var(--muted);font-size:.85rem;margin:1.25rem 0}
.article{max-width:var(--max);margin:0 auto;padding:0 1rem 3rem}
.article h1{font-size:clamp(1.75rem,4vw,2.5rem);line-height:1.15;margin:.25rem 0 .75rem}
.meta{color:var(--muted);font-size:.9rem;margin-bottom:1.25rem}
.hero-img{width:100%;height:auto;border-radius:16px;margin:1rem 0 1.5rem;display:block}
.article-body{font-size:1.0625rem}
.article-body h1,.article-body h2,.article-body h3{margin-top:2rem;font-size:1.35rem}
.article-body h1{font-size:1.55rem}
.article-body table{width:100%;border-collapse:collapse;margin:1rem 0;font-size:.95rem}
.article-body th,.article-body td{border:1px solid rgba(255,255,255,.12);padding:.5rem .6rem;text-align:left}
.article-body blockquote{margin:1rem 0;padding:.75rem 1rem;border-left:3px solid var(--accent);background:rgba(255,255,255,.04);border-radius:0 12px 12px 0}
.article-body img{max-width:100%;height:auto;border-radius:12px}
.article-body a{word-break:break-word}
.filters{display:flex;flex-wrap:wrap;gap:.45rem;margin:1.25rem 0 1rem}
.filter-chip{appearance:none;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.04);color:var(--muted);border-radius:999px;padding:.4rem .8rem;font:inherit;font-size:.82rem;font-weight:600;cursor:pointer}
.filter-chip.active,.filter-chip:hover{color:#fff;border-color:rgba(217,70,239,.55);background:rgba(217,70,239,.16)}
.tag-chip{display:inline-block;margin:.15rem .25rem 0 0;font-size:.72rem;color:#6ee7b7}
.journal-card[hidden]{display:none!important}
.cta{margin:2rem 0;padding:1.25rem;border:1px solid rgba(255,255,255,.12);border-radius:16px;background:rgba(217,70,239,.08)}
.cta h2{margin:0 0 .5rem;font-size:1.15rem}
.cta p{margin:0 0 1rem;color:var(--muted)}
.btn{display:inline-block;padding:.7rem 1.1rem;border-radius:999px;background:linear-gradient(90deg,#d946ef,#f97316);color:#fff!important;font-weight:600;text-decoration:none!important}
.related{margin:2.5rem 0}
.related-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem}
.related a.card{display:block;padding:1rem;border:1px solid rgba(255,255,255,.1);border-radius:14px;color:inherit;background:rgba(255,255,255,.03)}
.related a.card:hover{border-color:rgba(217,70,239,.45);text-decoration:none}
footer{border-top:1px solid rgba(255,255,255,.08);padding:2rem 0;color:var(--muted);font-size:.85rem;margin-top:2rem}
${adSlotCss()}
.journal-index h1{font-size:clamp(1.8rem,4vw,2.6rem)}
.featured{display:grid;gap:1rem;margin:1.5rem 0 2rem}
@media(min-width:800px){.featured{grid-template-columns:1.2fr .8fr;align-items:center}}
.featured img{width:100%;border-radius:16px;aspect-ratio:16/9;object-fit:cover}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem}
.card-img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:12px;margin-bottom:.75rem}
.empty{padding:2rem;border:1px dashed rgba(255,255,255,.15);border-radius:16px;color:var(--muted);text-align:center}
`
}

function storeButtonsHtml() {
  const play = `<a class="btn" href="${PLAY_STORE_URL}" rel="noopener noreferrer" target="_blank">Get it on Google Play</a>`
  const apple = HAS_APP_STORE_LISTING
    ? `<a class="btn" href="#" style="margin-left:.5rem">Download on the App Store</a>`
    : `<span class="btn" style="opacity:.55;margin-left:.5rem;cursor:default" aria-label="App Store listing coming soon">App Store — coming soon</span>`
  return `${play}${apple}`
}

function headerHtml() {
  return `<header class="bu-j-header shell">
  <a class="logo" href="${SITE}/">Between Us</a>
  <nav aria-label="Primary">
    <a href="${SITE}/stories">Stories</a>
    <a href="${SITE}/journal/">Journal</a>
    <a href="${SITE}/download">Download</a>
  </nav>
</header>`
}

function footerHtml() {
  return `<footer class="shell"><p>© ${new Date().getFullYear()} Between Us · <a href="${SITE}/privacy">Privacy</a> · <a href="${SITE}/terms">Terms</a></p>
<p>Editorial content is separate from anonymous community stories in the app.</p></footer>`
}

function ctaHtml(kind) {
  if (kind === 'mid') {
    return `<aside class="cta" aria-label="Share your story">
  <h2>Have your own story?</h2>
  <p>Share it anonymously on Between Us — no public identity attached.</p>
  <a class="btn" href="${SITE}/?utm_source=journal&utm_medium=article&utm_campaign=mid_cta">Join Between Us</a>
</aside>`
  }
  return `<aside class="cta" aria-label="Download Between Us">
  <h2>Join the conversation</h2>
  <p>Get Between Us on iOS and Android — spill, react, and stay in the conversation.</p>
  ${storeButtonsHtml()}
</aside>`
}

function relatedHtml(article, allLive) {
  const relatedIds = Array.isArray(article.related_article_ids) ? article.related_article_ids : []
  let related = allLive.filter((a) => relatedIds.includes(a.id) && a.id !== article.id)
  if (related.length < 3) {
    const more = allLive
      .filter((a) => a.id !== article.id && a.category === article.category && !related.some((r) => r.id === a.id))
      .slice(0, 3 - related.length)
    related = related.concat(more)
  }
  if (related.length < 3) {
    const more = allLive
      .filter((a) => a.id !== article.id && !related.some((r) => r.id === a.id))
      .slice(0, 3 - related.length)
    related = related.concat(more)
  }
  if (!related.length) return ''
  return `<section class="related" aria-label="Related articles">
  <h2>Related articles</h2>
  <div class="related-grid">
    ${related.map((r) => `<a class="card" href="${escapeHtml(articleUrl(r))}"><strong>${escapeHtml(r.title)}</strong><br /><span style="color:var(--muted);font-size:.85rem">${escapeHtml(r.excerpt || '').slice(0, 120)}</span></a>`).join('')}
  </div>
</section>`
}

function renderArticle(article, allLive) {
  const url = articleUrl(article)
  const title = article.seo_title || `${article.title} | Between Us Journal`
  const description = article.seo_description || article.excerpt || ''
  const image = publicImageUrl(article.social_image || article.featured_image) || `${SITE}/assets/betweenus-logo.png`
  const published = article.published_at || article.updated_at
  const modified = article.updated_at || published
  const canonical = article.canonical_url || url
  const robots = article.noindex ? 'noindex,follow' : 'index,follow'
  // Ads are presentation-only — article.body from CMS stays content-only
  const injected = injectInContentAds(article.body || '', AD_CONFIG)
  const afterAd = injected.useAfterContent
    ? renderAdSlotHtml('article-after-content', AD_CONFIG, injected.emitAfterContent)
    : ''
  const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description,
    image: [image],
    datePublished: published,
    dateModified: modified,
    author: { '@type': 'Person', name: article.author || 'Between Us Editorial' },
    publisher: {
      '@type': 'Organization',
      name: 'Between Us',
      logo: { '@type': 'ImageObject', url: `${SITE}/assets/betweenus-logo.png` },
    },
    mainEntityOfPage: canonical,
  }
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Journal', item: SITE + '/journal/' },
      { '@type': 'ListItem', position: 3, name: article.title, item: url },
    ],
  }

  return `<!DOCTYPE html>
<html lang="${escapeHtml(article.locale || 'en')}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="${robots}" />
  <link rel="canonical" href="${escapeHtml(canonical)}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Between Us" />
  <meta property="og:title" content="${escapeHtml(article.seo_title || article.title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(url)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(article.seo_title || article.title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>${sharedCss()}</style>
  ${adsenseHeadSnippet(AD_CONFIG)}
  <script type="application/ld+json">${JSON.stringify(jsonLdArticle)}</script>
  <script type="application/ld+json">${JSON.stringify(jsonLdBreadcrumb)}</script>
</head>
<body>
  ${headerHtml()}
  <main class="article">
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="${SITE}/">Home</a> · <a href="${SITE}/journal/">Journal</a> · ${escapeHtml(article.category || 'Editorial')}</nav>
    <p class="eyebrow">Between Us Journal · Editorial</p>
    <p class="muted" style="color:var(--muted);margin:0">${escapeHtml(article.category || '')}</p>
    <h1>${escapeHtml(article.title)}</h1>
    ${article.subtitle ? `<p style="font-size:1.15rem;color:var(--muted)">${escapeHtml(article.subtitle)}</p>` : ''}
    <p class="meta">By ${escapeHtml(article.author || 'Between Us Editorial')} · ${escapeHtml(new Date(published).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))}${article.reading_time_minutes ? ` · ${article.reading_time_minutes} min read` : ''}</p>
    ${article.featured_image ? `<img class="hero-img" src="${escapeHtml(publicImageUrl(article.featured_image))}" alt="${escapeHtml(article.featured_image_alt || article.title)}" width="1200" height="675" fetchpriority="high" />` : ''}
    <div class="article-body">${injected.html}</div>
    ${ctaHtml('mid')}
    ${afterAd}
    ${relatedHtml(article, allLive)}
    ${ctaHtml('bottom')}
  </main>
  ${footerHtml()}
</body>
</html>`
}

function cardImage(article) {
  return publicImageUrl(article.thumbnail_image || article.featured_image)
}

function renderIndex(live) {
  const featured = live.find((a) => a.featured) || live[0] || null
  const latest = live.filter((a) => !featured || a.id !== featured.id)
  const preferredCats = [
    'Confessions', 'Dating', 'Friend Drama', 'Work Drama', 'Family Drama',
    'Celebrity', 'Funny Stories', 'Advice', 'Hot Takes', 'Social Media',
  ]
  const liveCats = [...new Set(live.map((a) => a.category).filter(Boolean))]
  const categories = [
    ...preferredCats.filter((c) => liveCats.includes(c)),
    ...liveCats.filter((c) => !preferredCats.includes(c)),
  ]
  const tags = [...new Set(live.flatMap((a) => Array.isArray(a.tags) ? a.tags : []).filter(Boolean))]
    .sort()
    .slice(0, 40)

  const featuredImg = featured ? cardImage(featured) : null
  const featuredBlock = featured
    ? `<section class="featured" aria-label="Featured article" data-category="${escapeHtml(featured.category || '')}" data-tags="${escapeHtml((featured.tags || []).join(','))}">
  <div>
    <p class="eyebrow">Featured</p>
    <h2 style="margin:.25rem 0 .75rem;font-size:1.75rem"><a href="${escapeHtml(articleUrl(featured))}" style="color:inherit">${escapeHtml(featured.title)}</a></h2>
    <p style="color:var(--muted)">${escapeHtml(featured.excerpt || '')}</p>
    <p><a class="btn" href="${escapeHtml(articleUrl(featured))}">Read article</a></p>
  </div>
  ${featuredImg ? `<img src="${escapeHtml(featuredImg)}" alt="${escapeHtml(featured.featured_image_alt || featured.title)}" width="800" height="450" />` : ''}
</section>`
    : `<div class="empty"><p>No Journal articles published yet.</p><p>Editorial stories will appear here once the team publishes the first piece.</p></div>`

  const cards = latest.map((a) => {
    const img = cardImage(a)
    const tagAttr = (a.tags || []).join(',')
    const tagHtml = (a.tags || []).slice(0, 4).map((t) => `<span class="tag-chip">#${escapeHtml(t)}</span>`).join('')
    return `<article class="journal-card" data-category="${escapeHtml(a.category || '')}" data-tags="${escapeHtml(tagAttr)}">
  <a href="${escapeHtml(articleUrl(a))}" style="color:inherit;text-decoration:none">
    ${img ? `<img class="card-img" src="${escapeHtml(img)}" alt="${escapeHtml(a.featured_image_alt || a.title)}" loading="lazy" width="640" height="360" />` : ''}
    <p class="eyebrow">${escapeHtml(a.category || '')}</p>
    <h3 style="margin:.25rem 0">${escapeHtml(a.title)}</h3>
    <p style="color:var(--muted);font-size:.92rem">${escapeHtml(a.excerpt || '')}</p>
    ${tagHtml ? `<p style="margin:.35rem 0 0">${tagHtml}</p>` : ''}
  </a>
</article>`
  }).join('\n')

  const catFilters = [
    `<button type="button" class="filter-chip active" data-filter-type="category" data-filter-value="all" aria-pressed="true">All</button>`,
    ...categories.map((c) => `<button type="button" class="filter-chip" data-filter-type="category" data-filter-value="${escapeHtml(c)}" aria-pressed="false">${escapeHtml(c)}</button>`),
  ].join('')
  const tagFilters = tags.map((t) => `<button type="button" class="filter-chip" data-filter-type="tag" data-filter-value="${escapeHtml(t)}" aria-pressed="false">#${escapeHtml(t)}</button>`).join('')

  const filterScript = `<script>
(function(){
  var cat='all', tag='';
  var chips=document.querySelectorAll('.filter-chip');
  var cards=document.querySelectorAll('.journal-card');
  function apply(){
    cards.forEach(function(card){
      var c=(card.getAttribute('data-category')||'');
      var tags=(card.getAttribute('data-tags')||'').split(',').filter(Boolean);
      var okCat=cat==='all'||c===cat;
      var okTag=!tag||tags.indexOf(tag)>=0;
      card.hidden=!(okCat&&okTag);
    });
  }
  chips.forEach(function(chip){
    chip.addEventListener('click',function(){
      var type=chip.getAttribute('data-filter-type');
      var value=chip.getAttribute('data-filter-value')||'';
      if(type==='category'){
        cat=value;
        chips.forEach(function(c){ if(c.getAttribute('data-filter-type')==='category'){ c.classList.toggle('active',c===chip); c.setAttribute('aria-pressed',c===chip?'true':'false'); }});
      } else {
        tag = (tag===value) ? '' : value;
        chips.forEach(function(c){ if(c.getAttribute('data-filter-type')==='tag'){ var on=c.getAttribute('data-filter-value')===tag; c.classList.toggle('active',on); c.setAttribute('aria-pressed',on?'true':'false'); }});
      }
      apply();
    });
  });
})();
</script>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Journal | Between Us</title>
  <meta name="description" content="Editorial stories and reflections from Between Us — relationships, friendship, secrets, and the things worth talking about." />
  <meta name="robots" content="index,follow" />
  <link rel="canonical" href="${SITE}/journal/" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="Between Us Journal" />
  <meta property="og:description" content="Editorial stories and reflections from Between Us." />
  <meta property="og:url" content="${SITE}/journal/" />
  <meta property="og:image" content="${SITE}/assets/betweenus-logo.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>${sharedCss()}</style>
</head>
<body>
  ${headerHtml()}
  <main class="shell journal-index">
    <p class="eyebrow">Between Us Journal</p>
    <h1>Editorial stories &amp; reflections</h1>
    <p style="color:var(--muted);max-width:40rem">Confessions, dating drama, advice, and the messy middle of relationships. Separate from the anonymous community Stories feed.</p>
    ${featuredBlock}
    <section aria-label="Filter Journal">
      <div class="filters" role="toolbar" aria-label="Category filters">${catFilters}</div>
      ${tagFilters ? `<div class="filters" role="toolbar" aria-label="Tag filters">${tagFilters}</div>` : ''}
    </section>
    <section aria-label="Latest articles">
      <h2>Latest</h2>
      ${latest.length ? `<div class="grid">${cards}</div>` : (featured ? '<p class="muted">More stories coming soon.</p>' : '')}
    </section>
    ${ctaHtml('bottom')}
  </main>
  ${footerHtml()}
  ${filterScript}
</body>
</html>`
}

function writeHomeCards(live) {
  const cards = live.slice(0, 4).map((a, i) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    copy: a.excerpt || '',
    theme: THEMES[i % THEMES.length],
    imageUrl: publicImageUrl(a.thumbnail_image || a.featured_image) || '/assets/journal/healing-breakup.jpg',
    imageAlt: a.featured_image_alt || a.title,
    href: `/journal/${a.slug}/`,
  }))
  const payload = {
    generatedAt: new Date().toISOString(),
    articles: cards,
  }
  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(path.join(OUT_DIR, 'home-cards.json'), JSON.stringify(payload, null, 2))
  fs.writeFileSync(path.join(OUT_DIR, 'articles.json'), JSON.stringify({
    generatedAt: payload.generatedAt,
    articles: live.map((a) => ({
      id: a.id,
      slug: a.slug,
      locale: a.locale,
      title: a.title,
      excerpt: a.excerpt,
      category: a.category,
      tags: a.tags || [],
      author: a.author,
      featured: a.featured,
      publishedAt: a.published_at,
      href: articleUrl(a).replace(SITE, ''),
      imageUrl: publicImageUrl(a.thumbnail_image || a.featured_image),
    })),
  }, null, 2))
}

function updateSitemap(live) {
  const sitemapPath = SITEMAP_PATH
  const urls = [
    { loc: `${SITE}/`, changefreq: 'hourly', priority: '1.0' },
    { loc: `${SITE}/journal/`, changefreq: 'weekly', priority: '0.9' },
    { loc: `${SITE}/stories`, changefreq: 'hourly', priority: '0.8' },
    { loc: `${SITE}/privacy`, changefreq: 'monthly', priority: '0.4' },
    { loc: `${SITE}/terms`, changefreq: 'monthly', priority: '0.4' },
    { loc: `${SITE}/support`, changefreq: 'monthly', priority: '0.4' },
  ]
  for (const a of live) {
    if (a.noindex) continue
    urls.push({
      loc: articleUrl(a),
      lastmod: (a.updated_at || a.published_at || '').slice(0, 10),
      changefreq: 'monthly',
      priority: '0.7',
    })
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`
  fs.writeFileSync(sitemapPath, xml)
}

async function fetchArticles() {
  if (!SERVICE_KEY && !ANON_KEY) {
    throw new Error('Set SUPABASE_SERVICE_ROLE_KEY (preferred) or SUPABASE_ANON_KEY for generateJournal')
  }
  const key = SERVICE_KEY || ANON_KEY
  if (!SERVICE_KEY) {
    console.warn('[generateJournal] Using anon key — RLS blocks public reads; prefer SUPABASE_SERVICE_ROLE_KEY')
  }
  const supabase = createClient(PROJECT_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await supabase
    .from('journal_articles')
    .select('*')
    .in('status', ['published', 'scheduled'])
    .order('published_at', { ascending: false })
  if (error) throw error
  return data || []
}

function cleanGeneratedDirs(live) {
  // Remove stale English article dirs not in live set (keep index + json)
  if (!fs.existsSync(OUT_DIR)) return
  const keep = new Set(['index.html', 'home-cards.json', 'articles.json', 'feed.xml'])
  live.filter((a) => !a.locale || a.locale === 'en').forEach((a) => keep.add(a.slug))
  for (const name of fs.readdirSync(OUT_DIR)) {
    if (keep.has(name)) continue
    const full = path.join(OUT_DIR, name)
    if (fs.statSync(full).isDirectory()) {
      fs.rmSync(full, { recursive: true, force: true })
      console.log('[generateJournal] removed stale', name)
    }
  }
}

async function main() {
  console.log('[generateJournal] fetching editorial articles…')
  const rows = await fetchArticles()
  const now = Date.now()
  const live = rows
    .filter((r) => isLiveArticle(r, now))
    .filter((r) => (r.locale || 'en') === 'en') // Phase 3: English first
    .sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0))

  fs.mkdirSync(OUT_DIR, { recursive: true })
  cleanGeneratedDirs(live)

  for (const article of live) {
    const out = articlePath(article)
    fs.mkdirSync(path.dirname(out), { recursive: true })
    fs.writeFileSync(out, renderArticle(article, live))
    console.log('[generateJournal] wrote', path.relative(ROOT, out))
  }

  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), renderIndex(live))
  writeHomeCards(live)
  updateSitemap(live)
  console.log(`[generateJournal] done — ${live.length} live English article(s)`)
  if (ADS_LIVE) {
    console.log('[generateJournal] AdSense LIVE on article templates (consent + IDs configured)')
  } else {
    console.log('[generateJournal] AdSense OFF — article templates ready; set ca-pub, slot IDs, and BETWEENUS_ADSENSE_CONSENT_READY=true after CMP')
  }
}

main().catch((err) => {
  console.error('[generateJournal] failed:', err.message || err)
  process.exit(1)
})
