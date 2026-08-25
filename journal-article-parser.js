/**
 * Between Us Journal — structured article paste parser.
 * Tolerant of ChatGPT-style Title:/SECTION/Block:/Content: documents.
 * Browser: window.BetweenUsJournalPaste
 * Node: module.exports
 */
(function (root, factory) {
  var api = factory()
  if (typeof module === 'object' && module.exports) module.exports = api
  root.BetweenUsJournalPaste = api
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var FIELD_ALIASES = {
    title: ['title'],
    slug: ['slug'],
    excerpt: ['excerpt', 'summary', 'description'],
    category: ['category'],
    tags: ['tags', 'tag'],
    seoTitle: ['seo title', 'seo_title', 'seotitle', 'meta title'],
    seoDescription: ['seo description', 'seo_description', 'seodescription', 'meta description'],
    seoKeywords: ['seo keywords', 'seo_keywords', 'seokeywords', 'keywords', 'focus keywords'],
  }

  var BLOCK_ALIASES = {
    paragraph: ['paragraph', 'p', 'text', 'body'],
    image: ['image', 'img', 'photo', 'picture'],
    quote: ['quote', 'blockquote', 'pullquote'],
    callout: ['callout', 'note', 'aside'],
    tip: ['tip', 'hint'],
    checklist: ['checklist', 'check list', 'todo', 'to-do', 'list'],
    table: ['table'],
  }

  var CATEGORIES = [
    'Confessions', 'Dating', 'Friend Drama', 'Work Drama', 'Family Drama', 'Celebrity',
    'Neighbours', 'School & College', 'Social Media', 'Advice', 'Funny Stories', 'Hot Takes',
    'Relationships', 'Friendship', 'Secrets', 'Breakups', 'Boundaries',
  ]

  function normalizeKey(s) {
    return String(s || '').toLowerCase().replace(/[_:]+$/g, '').replace(/\s+/g, ' ').trim()
  }

  function matchField(line) {
    var m = String(line || '').match(/^([A-Za-z][A-Za-z0-9 _-]{0,40})\s*:\s*(.*)$/)
    if (!m) return null
    var key = normalizeKey(m[1])
    var rest = m[2] == null ? '' : m[2]
    for (var canon in FIELD_ALIASES) {
      if (FIELD_ALIASES[canon].indexOf(key) >= 0) return { field: canon, value: rest }
    }
    if (key === 'heading' || key === 'block' || key === 'content' || key === 'alt' || key === 'caption' || key === 'url' || key === 'src') {
      return { field: key, value: rest }
    }
    return null
  }

  function isSectionsMarker(line) {
    return /^sections?\s*:?\s*$/i.test(String(line || '').trim())
  }

  function isSectionHeader(line) {
    return /^section\s*0*\d+\s*:?\s*$/i.test(String(line || '').trim())
  }

  function normalizeBlockType(raw) {
    var key = normalizeKey(raw)
    for (var canon in BLOCK_ALIASES) {
      if (BLOCK_ALIASES[canon].indexOf(key) >= 0) return canon
    }
    return 'paragraph'
  }

  function normalizeTag(t) {
    return String(t || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '').slice(0, 40)
  }

  function parseTags(raw) {
    var text = String(raw || '').trim()
    if (!text) return []
    var parts = text.split(/[,;\n]+/)
    var out = []
    parts.forEach(function (p) {
      var t = normalizeTag(p)
      if (t && out.indexOf(t) < 0) out.push(t)
    })
    return out
  }

  function slugify(title) {
    return String(title || '').toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 120)
  }

  function uid() {
    return 'id_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
  }

  function emptyBlock(type) {
    if (type === 'image') return { id: uid(), type: 'image', url: '', path: '', alt: '', caption: '' }
    if (type === 'quote') return { id: uid(), type: 'quote', content: '' }
    if (type === 'callout') return { id: uid(), type: 'callout', content: '' }
    if (type === 'tip') return { id: uid(), type: 'tip', content: '' }
    if (type === 'checklist') return { id: uid(), type: 'checklist', items: [''] }
    if (type === 'table') return { id: uid(), type: 'table', rows: [['', ''], ['', '']] }
    return { id: uid(), type: 'paragraph', content: '' }
  }

  function finalizeBlock(block, contentBuf) {
    var text = contentBuf.join('\n').replace(/^\n+|\n+$/g, '')
    if (block.type === 'checklist') {
      var items = text.split(/\n+/).map(function (l) {
        return l.replace(/^\s*[-*☐☑]\s*/, '').trim()
      }).filter(Boolean)
      block.items = items.length ? items : ['']
    } else if (block.type === 'table') {
      var rows = text.split(/\n+/).map(function (l) {
        if (l.indexOf('|') >= 0) {
          return l.split('|').map(function (c) { return c.trim() }).filter(function (c, i, arr) {
            return !(i === 0 && c === '') && !(i === arr.length - 1 && c === '')
          })
        }
        return [l.trim()]
      }).filter(function (r) { return r.some(Boolean) })
      block.rows = rows.length ? rows : [['', ''], ['', '']]
    } else if (block.type === 'image') {
      if (!block.alt && text) block.alt = text.split('\n')[0].slice(0, 160)
      if (!block.caption && text.indexOf('\n') >= 0) block.caption = text.split('\n').slice(1).join(' ').trim()
      var urlLine = text.match(/https?:\/\/\S+/i)
      if (urlLine) block.url = urlLine[0]
    } else {
      block.content = text
    }
    return block
  }

  function parseArticle(rawText) {
    var warnings = []
    var lines = String(rawText || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
    var meta = {
      title: '', slug: '', excerpt: '', category: '', tags: [],
      seoTitle: '', seoDescription: '', seoKeywords: '',
    }
    var sections = []
    var mode = 'meta'
    var currentField = null
    var fieldBuf = []
    var currentSection = null
    var currentBlock = null
    var contentBuf = []
    var collectingContent = false

    function flushField() {
      if (!currentField) return
      var value = fieldBuf.join('\n').trim()
      if (currentField === 'tags') meta.tags = parseTags(value)
      else if (currentField === 'seoKeywords') meta.seoKeywords = value
      else meta[currentField] = value
      currentField = null
      fieldBuf = []
    }

    function flushBlock() {
      if (!currentBlock || !currentSection) return
      finalizeBlock(currentBlock, contentBuf)
      var has =
        (currentBlock.type === 'checklist' && currentBlock.items.some(Boolean)) ||
        (currentBlock.type === 'table' && currentBlock.rows.some(function (r) { return r.some(Boolean) })) ||
        (currentBlock.type === 'image' && (currentBlock.url || currentBlock.alt || currentBlock.path)) ||
        (currentBlock.content && String(currentBlock.content).trim())
      if (has || currentBlock.type === 'paragraph') currentSection.blocks.push(currentBlock)
      currentBlock = null
      contentBuf = []
      collectingContent = false
    }

    function flushSection() {
      flushBlock()
      if (currentSection) {
        if (!currentSection.blocks.length) currentSection.blocks.push(emptyBlock('paragraph'))
        sections.push(currentSection)
      }
      currentSection = null
    }

    function startSection() {
      flushSection()
      currentSection = { id: uid(), heading: '', headingLevel: 'h2', blocks: [] }
      mode = 'section'
    }

    function startBlock(typeRaw) {
      flushBlock()
      if (!currentSection) startSection()
      currentBlock = emptyBlock(normalizeBlockType(typeRaw))
      contentBuf = []
      collectingContent = false
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i]
      var trimmed = line.trim()

      if (mode === 'meta' && isSectionsMarker(trimmed)) {
        flushField()
        mode = 'sections'
        continue
      }

      if (isSectionHeader(trimmed)) {
        flushField()
        startSection()
        continue
      }

      var matched = matchField(line)

      if (mode === 'meta') {
        if (matched && FIELD_ALIASES[matched.field]) {
          flushField()
          currentField = matched.field
          fieldBuf = matched.value ? [matched.value] : []
          continue
        }
        if (currentField) {
          if (matched && (matched.field === 'heading' || matched.field === 'block' || matched.field === 'content')) {
            flushField()
            warnings.push('Unexpected ' + matched.field + ' before Sections:')
          } else {
            fieldBuf.push(line)
          }
        }
        continue
      }

      // sections / section body
      if (matched && matched.field === 'heading') {
        flushBlock()
        if (!currentSection) startSection()
        if (matched.value.trim()) {
          currentSection.heading = matched.value.trim()
        } else {
          currentField = '_heading'
          fieldBuf = []
        }
        continue
      }
      if (currentField === '_heading') {
        if (matched || isSectionHeader(trimmed) || !trimmed) {
          if (trimmed && !matched && !isSectionHeader(trimmed)) {
            fieldBuf.push(line)
            currentSection.heading = fieldBuf.join('\n').trim()
            currentField = null
            fieldBuf = []
            continue
          }
          currentSection.heading = fieldBuf.join('\n').trim()
          currentField = null
          fieldBuf = []
          if (matched || isSectionHeader(trimmed)) i--
          continue
        }
        fieldBuf.push(line)
        continue
      }

      if (matched && matched.field === 'block') {
        if (matched.value.trim()) {
          startBlock(matched.value)
        } else {
          // Block type on following line(s), e.g. "Block:\nCallout"
          currentField = '_blockType'
          fieldBuf = []
        }
        continue
      }
      if (currentField === '_blockType') {
        if (!trimmed) continue
        if (matched && matched.field === 'content') {
          startBlock('paragraph')
          currentField = null
          fieldBuf = []
          i--
          continue
        }
        startBlock(trimmed)
        currentField = null
        fieldBuf = []
        continue
      }

      if (matched && matched.field === 'content') {
        if (!currentBlock) startBlock('paragraph')
        collectingContent = true
        contentBuf = matched.value ? [matched.value] : []
        continue
      }

      if (matched && currentBlock && currentBlock.type === 'image') {
        if (matched.field === 'alt') currentBlock.alt = matched.value.trim()
        else if (matched.field === 'caption') currentBlock.caption = matched.value.trim()
        else if (matched.field === 'url' || matched.field === 'src') currentBlock.url = matched.value.trim()
        else if (matched.field === 'content') {
          collectingContent = true
          contentBuf = matched.value ? [matched.value] : []
        }
        continue
      }

      if (collectingContent && currentBlock) {
        if (matched && (matched.field === 'block' || matched.field === 'heading' || FIELD_ALIASES[matched.field])) {
          // end content — reprocess this line
          i--
          collectingContent = false
          continue
        }
        if (isSectionHeader(trimmed) || isSectionsMarker(trimmed)) {
          i--
          collectingContent = false
          continue
        }
        contentBuf.push(line)
        continue
      }

      // Loose paragraph lines inside a section without Block: wrapper
      if (currentSection && trimmed && !matched) {
        if (!currentBlock) {
          startBlock('paragraph')
          collectingContent = true
          contentBuf = [line]
        } else if (currentBlock.type === 'paragraph' && !collectingContent) {
          collectingContent = true
          contentBuf = [line]
        }
      }
    }

    flushField()
    flushSection()

    if (!meta.title) warnings.push('Missing Title')
    if (!meta.slug && meta.title) meta.slug = slugify(meta.title)
    if (!sections.length) {
      warnings.push('No sections found')
      sections = [{ id: uid(), heading: '', headingLevel: 'h2', blocks: [emptyBlock('paragraph')] }]
    }

    var blockCount = 0
    sections.forEach(function (s) { blockCount += (s.blocks || []).length })

    return {
      title: meta.title,
      slug: meta.slug || slugify(meta.title),
      excerpt: meta.excerpt,
      category: meta.category,
      tags: meta.tags.slice(0, 8),
      seoTitle: meta.seoTitle,
      seoDescription: meta.seoDescription,
      seoKeywords: meta.seoKeywords,
      sections: sections,
      warnings: warnings,
      sectionCount: sections.length,
      blockCount: blockCount,
    }
  }

  function suggestCategory(article) {
    if (article.category) {
      var exact = CATEGORIES.find(function (c) { return c.toLowerCase() === article.category.toLowerCase() })
      if (exact) return { value: exact, suggested: false }
      var fuzzy = CATEGORIES.find(function (c) { return c.toLowerCase().indexOf(article.category.toLowerCase()) >= 0 || article.category.toLowerCase().indexOf(c.toLowerCase()) >= 0 })
      if (fuzzy) return { value: fuzzy, suggested: true, note: 'Mapped from "' + article.category + '"' }
    }
    var hay = [article.title, article.excerpt, article.seoKeywords]
      .concat(article.tags || [])
      .concat((article.sections || []).map(function (s) { return s.heading }))
      .join(' ')
      .toLowerCase()

    var rules = [
      { cat: 'Work Drama', keys: ['office', 'workplace', 'coworker', 'boss', 'job', 'colleague', 'work'] },
      { cat: 'Friend Drama', keys: ['friend', 'bestie', 'friendship', 'behind your back'] },
      { cat: 'Dating', keys: ['dating', 'boyfriend', 'girlfriend', 'ex ', 'romance', 'date'] },
      { cat: 'Confessions', keys: ['confession', 'anonymous', 'admit', "i shouldn't"] },
      { cat: 'Family Drama', keys: ['family', 'mom', 'dad', 'sibling', 'parents'] },
      { cat: 'Social Media', keys: ['instagram', 'tiktok', 'dm', 'social media', 'followers'] },
      { cat: 'Celebrity', keys: ['celebrity', 'influencer', 'famous'] },
      { cat: 'Funny Stories', keys: ['funny', 'hilarious', 'awkward laugh'] },
      { cat: 'Hot Takes', keys: ['hot take', 'opinion', 'pretend', 'we all', 'unpopular'] },
      { cat: 'Advice', keys: ['advice', 'should you', 'how to'] },
    ]
    for (var i = 0; i < rules.length; i++) {
      for (var j = 0; j < rules[i].keys.length; j++) {
        if (hay.indexOf(rules[i].keys[j]) >= 0) return { value: rules[i].cat, suggested: true }
      }
    }
    return { value: 'Hot Takes', suggested: true }
  }

  function suggestTags(article, max) {
    max = max || 8
    var existing = (article.tags || []).slice()
    if (existing.length >= max) return { tags: existing.slice(0, max), suggested: [] }

    var hay = [article.title, article.excerpt, article.category, article.seoKeywords]
      .concat((article.sections || []).map(function (s) {
        return s.heading + ' ' + (s.blocks || []).map(function (b) { return b.content || (b.items || []).join(' ') || b.alt || '' }).join(' ')
      }))
      .join(' ')
      .toLowerCase()

    var pool = [
      'gossip', 'secrets', 'drama', 'confessions', 'friendship', 'workplace', 'office-drama',
      'social-life', 'dating', 'boundaries', 'anonymous', 'awkward', 'toxic-friendship',
      'red-flags', 'best-friends', 'family', 'social-media', 'advice', 'funny',
    ]
    var suggested = []
    pool.forEach(function (t) {
      var needle = t.replace(/-/g, ' ')
      if (hay.indexOf(needle) >= 0 || hay.indexOf(t) >= 0) {
        if (existing.indexOf(t) < 0 && suggested.indexOf(t) < 0) suggested.push(t)
      }
    })
    // title words as light suggestions
    String(article.title || '').toLowerCase().split(/[^a-z0-9]+/).forEach(function (w) {
      if (w.length < 5) return
      var t = normalizeTag(w)
      if (t && existing.indexOf(t) < 0 && suggested.indexOf(t) < 0 && suggested.length < 6) suggested.push(t)
    })
    return { tags: existing, suggested: suggested.slice(0, max - existing.length) }
  }

  function suggestSeo(article) {
    var title = article.title || 'Between Us Journal'
    var excerpt = article.excerpt || ''
    var seoTitle = article.seoTitle || (title + ' | Between Us').slice(0, 60)
    var seoDescription = article.seoDescription || excerpt.slice(0, 155)
    var keywords = article.seoKeywords
    if (!keywords) {
      var tagPart = (article.tags || []).join(', ')
      keywords = tagPart || title.toLowerCase()
    }
    return {
      seoTitle: seoTitle,
      seoDescription: seoDescription,
      seoKeywords: keywords,
      titleSuggested: !article.seoTitle,
      descSuggested: !article.seoDescription,
      keywordsSuggested: !article.seoKeywords,
    }
  }

  function buildImageBrief(article) {
    var title = article.title || 'anonymous social drama'
    var cat = article.category || 'social life'
    return (
      'Editorial lifestyle photograph for a magazine blog about "' + title +
      '" (' + cat + '). Subtle storytelling mood, realistic environment, cinematic natural lighting, ' +
      'sophisticated magazine aesthetic, strong composition with negative space for cropping, ' +
      'photorealistic, no text, no logos, no watermarks, no celebrity likenesses, no identifiable real people, ' +
      'no cartoon or meme style.'
    )
  }

  function buildImageAlt(article) {
    var title = String(article.title || 'social story').slice(0, 80)
    return 'Editorial photo illustrating themes from “' + title + '”'
  }

  function suggestRelated(article, publishedArticles, limit) {
    limit = limit || 3
    var list = (publishedArticles || []).filter(function (a) { return a && a.status === 'published' })
    if (!list.length) return []
    var tags = (article.tags || []).map(function (t) { return String(t).toLowerCase() })
    var cat = String(article.category || '').toLowerCase()
    var titleWords = String(article.title || '').toLowerCase().split(/[^a-z0-9]+/).filter(function (w) { return w.length > 3 })

    var scored = list.map(function (a) {
      var score = 0
      if (cat && String(a.category || '').toLowerCase() === cat) score += 5
      ;(a.tags || []).forEach(function (t) {
        if (tags.indexOf(String(t).toLowerCase()) >= 0) score += 2
      })
      var at = String(a.title || '').toLowerCase()
      titleWords.forEach(function (w) { if (at.indexOf(w) >= 0) score += 1 })
      return { article: a, score: score }
    }).filter(function (x) { return x.score > 0 })

    scored.sort(function (a, b) { return b.score - a.score })
    return scored.slice(0, limit).map(function (x) { return x.article })
  }

  return {
    parseArticle: parseArticle,
    suggestCategory: suggestCategory,
    suggestTags: suggestTags,
    suggestSeo: suggestSeo,
    buildImageBrief: buildImageBrief,
    buildImageAlt: buildImageAlt,
    suggestRelated: suggestRelated,
    CATEGORIES: CATEGORIES,
    normalizeTag: normalizeTag,
    slugify: slugify,
  }
})
