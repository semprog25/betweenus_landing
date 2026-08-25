/**
 * Between Us Journal — article ad placement (presentation layer only).
 *
 * Does not mutate article body in the CMS/DB.
 * Emits markup only when ads are fully configured + consent-ready.
 * Never invents publisher or slot IDs.
 */

'use strict'

const SLOT_KEYS = {
  mid1: 'articleMid1',
  mid2: 'articleMid2',
  afterContent: 'articleAfterContent',
}

/**
 * @param {string} html
 * @returns {number}
 */
function estimateWordCount(html) {
  const text = String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!text) return 0
  return text.split(' ').filter(Boolean).length
}

/**
 * How many in-article slots for this length (conservative).
 * @param {number} wordCount
 * @returns {number} 0–3
 */
function maxAdSlotsForLength(wordCount) {
  if (wordCount < 350) return 0
  if (wordCount < 700) return 1
  if (wordCount < 1200) return 2
  return 3
}

/**
 * Split body into top-level blocks (keep tags intact).
 * @param {string} html
 * @returns {string[]}
 */
function splitTopLevelBlocks(html) {
  const source = String(html || '').trim()
  if (!source) return []
  const blocks = []
  const re = /<(p|h[1-6]|ul|ol|blockquote|figure|table|div|section|aside|pre|hr)\b[^>]*>[\s\S]*?<\/\1>|<hr\s*\/?>/gi
  let last = 0
  let match
  while ((match = re.exec(source)) !== null) {
    if (match.index > last) {
      const gap = source.slice(last, match.index).trim()
      if (gap) blocks.push(gap)
    }
    blocks.push(match[0])
    last = match.index + match[0].length
  }
  if (last < source.length) {
    const tail = source.slice(last).trim()
    if (tail) blocks.push(tail)
  }
  return blocks.length ? blocks : [source]
}

/**
 * @param {string} blockHtml
 * @returns {number}
 */
function blockWordCount(blockHtml) {
  return estimateWordCount(blockHtml)
}

/**
 * Pick insertion indices after meaningful blocks (never before first block).
 * @param {{ blocks: string[], wordCount: number, maxSlots: number }} args
 * @returns {number[]} indices meaning "insert AFTER this block index"
 */
function chooseInsertionPoints({ blocks, wordCount, maxSlots }) {
  if (maxSlots <= 0 || blocks.length < 2) return []

  const cumulative = []
  let running = 0
  for (let i = 0; i < blocks.length; i++) {
    running += blockWordCount(blocks[i])
    cumulative.push(running)
  }

  const points = []
  const used = new Set()

  const pickNearFraction = (fraction, minWordsAfter, minWordsBeforeEnd) => {
    const target = Math.floor(wordCount * fraction)
    let best = -1
    let bestDist = Infinity
    for (let i = 0; i < blocks.length - 1; i++) {
      if (used.has(i)) continue
      const before = cumulative[i]
      const after = wordCount - before
      if (before < minWordsAfter) continue
      if (after < minWordsBeforeEnd) continue
      const dist = Math.abs(before - target)
      // Prefer breaks before headings when close
      const next = blocks[i + 1] || ''
      const headingBonus = /^<h[2-3]\b/i.test(next) ? -40 : 0
      const score = dist + headingBonus
      if (score < bestDist) {
        bestDist = score
        best = i
      }
    }
    if (best >= 0) {
      used.add(best)
      points.push(best)
    }
  }

  if (maxSlots >= 1) {
    // First ad after a substantial opening portion (~35–45%)
    pickNearFraction(0.4, 180, 200)
  }
  if (maxSlots >= 2) {
    // Near end, still before final CTA (handled outside body)
    pickNearFraction(0.82, 400, 120)
  }
  if (maxSlots >= 3) {
    pickNearFraction(0.6, 280, 220)
  }

  return points.sort((a, b) => a - b)
}

/**
 * @param {object} config
 * @param {string} config.clientId
 * @param {Record<string, string>} config.slots
 * @param {boolean} config.consentReady
 * @param {boolean} [config.forceDisabled]
 */
function isAdsLive(config) {
  if (config.forceDisabled) return false
  if (!config.consentReady) return false
  if (!/^ca-pub-\d{10,}$/.test(config.clientId || '')) return false
  const filled = Object.values(config.slots || {}).filter((s) => /^\d{5,}$/.test(s || ''))
  return filled.length > 0
}

/**
 * @param {string} placement
 * @param {object} config
 * @param {boolean} live
 */
function renderAdSlotHtml(placement, config, live) {
  if (!live) return ''
  const slotMap = {
    'article-mid-1': config.slots.articleMid1 || '',
    'article-mid-2': config.slots.articleMid2 || '',
    'article-after-content': config.slots.articleAfterContent || '',
  }
  const slotId = slotMap[placement] || ''
  if (!/^\d{5,}$/.test(slotId)) return ''

  return `<aside class="ad-slot ad-slot--live" data-ad-placement="${placement}" aria-label="Advertisement">
  <ins class="adsbygoogle"
    style="display:block;min-height:90px;max-width:100%"
    data-ad-client="${config.clientId}"
    data-ad-slot="${slotId}"
    data-ad-format="auto"
    data-full-width-responsive="true"></ins>
</aside>`
}

/**
 * Inject mid-article ads into body HTML. Returns body only (not after-content slot).
 * @param {string} bodyHtml
 * @param {object} config
 * @returns {{ html: string, wordCount: number, slotCount: number, placements: string[] }}
 */
function injectInContentAds(bodyHtml, config) {
  const wordCount = estimateWordCount(bodyHtml)
  const maxSlots = maxAdSlotsForLength(wordCount)
  const live = isAdsLive(config)

  // short (1): only in-content
  // medium (2): 1 in-content + after-content
  // long (3): 2 in-content + after-content
  let inContentTarget = 0
  let useAfterContent = false
  if (maxSlots === 1) {
    inContentTarget = 1
    useAfterContent = false
  } else if (maxSlots === 2) {
    inContentTarget = 1
    useAfterContent = true
  } else if (maxSlots >= 3) {
    inContentTarget = 2
    useAfterContent = true
  }

  const blocks = splitTopLevelBlocks(bodyHtml)
  const points = chooseInsertionPoints({
    blocks,
    wordCount,
    maxSlots: inContentTarget,
  })

  const plannedPlacements = []
  const emittedPlacements = []
  const midKeys = ['article-mid-1', 'article-mid-2']
  let midIdx = 0
  const parts = []
  for (let i = 0; i < blocks.length; i++) {
    parts.push(blocks[i])
    if (points.includes(i) && midIdx < midKeys.length) {
      const placement = midKeys[midIdx++]
      plannedPlacements.push(placement)
      const markup = renderAdSlotHtml(placement, config, live)
      if (markup) {
        parts.push(markup)
        emittedPlacements.push(placement)
      }
    }
  }

  const afterPlanned = useAfterContent
  const afterEmitted =
    afterPlanned && live && /^\d{5,}$/.test(config.slots.articleAfterContent || '')

  return {
    html: parts.join('\n'),
    wordCount,
    maxSlots,
    plannedPlacements,
    emittedPlacements,
    useAfterContent: afterPlanned,
    emitAfterContent: afterEmitted,
    live,
  }
}

/**
 * Head snippet — only when live. Single script, async.
 * @param {object} config
 */
function adsenseHeadSnippet(config) {
  if (!isAdsLive(config)) return ''
  return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(config.clientId)}" crossorigin="anonymous"></script>
<script>
  window.addEventListener('load', function () {
    try {
      var nodes = document.querySelectorAll('ins.adsbygoogle');
      for (var i = 0; i < nodes.length; i++) {
        if (!nodes[i].getAttribute('data-adsbygoogle-status')) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      }
    } catch (e) {}
  });
</script>`
}

/**
 * CSS for live slots only (disabled ads emit nothing).
 */
function adSlotCss() {
  return `
.ad-slot{margin:1.75rem 0;max-width:100%;overflow:hidden;text-align:center;min-height:0}
.ad-slot--live{min-height:90px;contain:layout}
.ad-slot ins.adsbygoogle{max-width:100%!important}
`
}

function loadAdConfigFromEnv(env = process.env) {
  return {
    clientId: env.BETWEENUS_ADSENSE_CLIENT_ID || '',
    slots: {
      articleMid1: env.BETWEENUS_ADSENSE_SLOT_ARTICLE_MID1 || '',
      articleMid2: env.BETWEENUS_ADSENSE_SLOT_ARTICLE_MID2 || '',
      articleAfterContent: env.BETWEENUS_ADSENSE_SLOT_ARTICLE_AFTER || '',
    },
    // Explicit opt-in after Google-certified CMP + Privacy & Messaging are live
    consentReady: env.BETWEENUS_ADSENSE_CONSENT_READY === 'true',
    // Optional hard kill switch
    forceDisabled: env.BETWEENUS_ADSENSE_FORCE_DISABLED === 'true',
  }
}

module.exports = {
  SLOT_KEYS,
  estimateWordCount,
  maxAdSlotsForLength,
  splitTopLevelBlocks,
  chooseInsertionPoints,
  isAdsLive,
  renderAdSlotHtml,
  injectInContentAds,
  adsenseHeadSnippet,
  adSlotCss,
  loadAdConfigFromEnv,
}
