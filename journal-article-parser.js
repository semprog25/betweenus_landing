/**
 * Between Us Journal — structured article paste parser.
 * Structural labels (Paragraph:, Heading:, Final CTA paragraph:, etc.) are never content.
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

  /** Labels that start a paragraph-style block (content follows; label discarded). */
  var CTA_ALIASES = [
    'final cta paragraph',
    'final cta',
    'closing cta',
    'call to action',
    'cta paragraph',
    'cta',
  ]

  var CATEGORIES = [
    'Confessions', 'Dating', 'Friend Drama', 'Work Drama', 'Family Drama', 'Celebrity',
    'Neighbours', 'School & College', 'Social Media', 'Advice', 'Funny Stories', 'Hot Takes',
    'Relationships', 'Friendship', 'Secrets', 'Breakups', 'Boundaries',
  ]

  var WORDS_PER_MINUTE = 225

  function normalizeKey(s) {
    return String(s || '').toLowerCase().replace(/[_:]+$/g, '').replace(/\s+/g, ' ').trim()
  }

  function isSectionHeader(line) {
    return /^section\s*0*\d+\s*:?\s*$/i.test(String(line || '').trim())
  }

  function isSectionsMarker(line) {
    return /^sections?\s*:?\s*$/i.test(String(line || '').trim())
  }

  function isJunkMarker(line) {
    var t = normalizeKey(String(line || '').replace(/:$/, ''))
    return t === 'final verification' || t === 'final requirement' || t === 'test plan'
  }

  function normalizeBlockType(raw) {
    var key = normalizeKey(raw)
    for (var canon in BLOCK_ALIASES) {
      if (BLOCK_ALIASES[canon].indexOf(key) >= 0) return canon
    }
    return 'paragraph'
  }

  /**
   * Match a structural instruction at the start of a line (label position only).
   * Returns null for ordinary prose, even if it contains the words "paragraph" / "heading".
   */
  function matchInstruction(line) {
    var raw = String(line || '')
    var m = raw.match(/^([A-Za-z][A-Za-z0-9 _/-]{0,48})\s*:\s*(.*)$/)
    if (!m) {
      if (isSectionHeader(raw) || isSectionsMarker(raw) || isJunkMarker(raw)) {
        return { kind: 'marker', key: normalizeKey(raw.replace(/:$/, '')), value: '' }
      }
      return null
    }
    var key = normalizeKey(m[1])
    var value = m[2] == null ? '' : m[2]

    for (var canon in FIELD_ALIASES) {
      if (FIELD_ALIASES[canon].indexOf(key) >= 0) return { kind: 'meta', field: canon, value: value }
    }
    if (key === 'heading') return { kind: 'heading', value: value }
    if (key === 'block') return { kind: 'block', value: value }
    if (key === 'content') return { kind: 'content', value: value }
    if (key === 'alt' || key === 'caption' || key === 'url' || key === 'src') {
      return { kind: 'imageField', field: key, value: value }
    }
    if (CTA_ALIASES.indexOf(key) >= 0) return { kind: 'blockType', blockType: 'paragraph', value: value, isCta: true }
    for (var bt in BLOCK_ALIASES) {
      if (BLOCK_ALIASES[bt].indexOf(key) >= 0) return { kind: 'blockType', blockType: bt, value: value }
    }
    if (/^section\s*0*\d+$/i.test(key)) return { kind: 'marker', key: key, value: '' }
    if (key === 'sections' || key === 'section') return { kind: 'marker', key: key, value: '' }
    return null
  }

  /** True when the entire string is only a structural label (safe to drop from article HTML). */
  function isParserLabelOnly(text) {
    var t = String(text || '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (!t) return false
    if (isSectionHeader(t) || isSectionsMarker(t) || isJunkMarker(t)) return true
    var inst = matchInstruction(t)
    if (!inst) return false
    // Label with no trailing prose on the same line (or only whitespace)
    if (inst.kind === 'meta' || inst.kind === 'heading' || inst.kind === 'block' ||
        inst.kind === 'content' || inst.kind === 'blockType' || inst.kind === 'imageField' ||
        inst.kind === 'marker') {
      return !String(inst.value || '').trim()
    }
    return false
  }

  function stripParserLabelsFromHtml(html) {
    var raw = String(html || '')

    // Only truncate when an exact label-only verification/requirement paragraph appears.
    // Never match prose like "The verification process was surprisingly simple."
    var verifyTail = /<p\b[^>]*>\s*(?:<(?:strong|em|b|i)\b[^>]*>\s*)*FINAL\s+(?:VERIFICATION|REQUIREMENT)\s*(?:<\/(?:strong|em|b|i)>\s*)*<\/p>/i
    var verifyMatch = raw.match(verifyTail)
    if (verifyMatch && typeof verifyMatch.index === 'number') {
      raw = raw.slice(0, verifyMatch.index)
    }

    // Exact leaked agent instruction line only (whole paragraph)
    raw = raw.replace(/<p\b[^>]*>\s*Do not publish the four articles\.?\s*<\/p>/gi, '')

    raw = raw.replace(/<(p|h[1-6]|li|td|th|figcaption)(\b[^>]*)>([\s\S]*?)<\/\1>/gi, function (full, tag, attrs, inner) {
      var plain = String(inner || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ').trim()
      if (isParserLabelOnly(plain)) return ''
      return '<' + tag + attrs + '>' + inner + '</' + tag + '>'
    })

    raw = raw.replace(/<p>\s*<\/p>/gi, '')
    raw = raw.replace(/\n{3,}/g, '\n\n').trim()
    return raw
  }

  function estimateReadingTimeMinutes(html) {
    var cleaned = stripParserLabelsFromHtml(html)
    var text = String(cleaned || '')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z#0-9]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    var words = text ? text.split(' ').filter(Boolean).length : 0
    if (!words) return 1
    return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
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
    // Drop any leaked label-only lines inside the buffer
    text = text.split('\n').filter(function (line) {
      return !isParserLabelOnly(line.trim())
    }).join('\n').replace(/^\n+|\n+$/g, '')

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
    var stoppedForJunk = false

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
      if (has) currentSection.blocks.push(currentBlock)
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

    function beginBlockWithOptionalInline(type, inlineValue) {
      startBlock(type)
      if (inlineValue && String(inlineValue).trim()) {
        collectingContent = true
        contentBuf = [String(inlineValue)]
      } else {
        // Content follows on subsequent lines until next instruction
        collectingContent = true
        contentBuf = []
      }
    }

    for (var i = 0; i < lines.length; i++) {
      if (stoppedForJunk) break
      var line = lines[i]
      var trimmed = line.trim()
      var inst = matchInstruction(line)

      if (inst && (isJunkMarker(trimmed) || (inst.kind === 'marker' && (inst.key === 'final verification' || inst.key === 'final requirement')))) {
        flushField()
        flushSection()
        stoppedForJunk = true
        warnings.push('Stopped before leaked verification/instructions block')
        break
      }

      if (mode === 'meta' && (isSectionsMarker(trimmed) || (inst && inst.kind === 'marker' && inst.key === 'sections'))) {
        flushField()
        mode = 'sections'
        continue
      }

      if (isSectionHeader(trimmed) || (inst && inst.kind === 'marker' && /^section\s*0*\d+$/i.test(inst.key || ''))) {
        flushField()
        startSection()
        continue
      }

      if (mode === 'meta') {
        if (inst && inst.kind === 'meta') {
          flushField()
          currentField = inst.field
          fieldBuf = inst.value ? [inst.value] : []
          continue
        }
        if (currentField) {
          if (inst && (inst.kind === 'heading' || inst.kind === 'block' || inst.kind === 'content' || inst.kind === 'blockType')) {
            flushField()
            warnings.push('Unexpected structural label before Sections:')
            i--
            continue
          }
          fieldBuf.push(line)
        }
        continue
      }

      // ---- section body ----
      if (inst && inst.kind === 'heading') {
        flushBlock()
        if (!currentSection) startSection()
        if (inst.value.trim()) {
          currentSection.heading = inst.value.trim()
        } else {
          currentField = '_heading'
          fieldBuf = []
        }
        continue
      }
      if (currentField === '_heading') {
        if (inst || isSectionHeader(trimmed) || !trimmed) {
          if (trimmed && !inst && !isSectionHeader(trimmed)) {
            fieldBuf.push(line)
            currentSection.heading = fieldBuf.join('\n').trim()
            currentField = null
            fieldBuf = []
            continue
          }
          currentSection.heading = fieldBuf.join('\n').trim()
          currentField = null
          fieldBuf = []
          if (inst || isSectionHeader(trimmed)) i--
          continue
        }
        fieldBuf.push(line)
        continue
      }

      if (inst && inst.kind === 'block') {
        if (inst.value.trim()) beginBlockWithOptionalInline(inst.value, '')
        else {
          currentField = '_blockType'
          fieldBuf = []
        }
        continue
      }
      if (currentField === '_blockType') {
        if (!trimmed) continue
        if (inst && inst.kind === 'content') {
          beginBlockWithOptionalInline('paragraph', inst.value)
          currentField = null
          continue
        }
        beginBlockWithOptionalInline(trimmed, '')
        currentField = null
        continue
      }

      if (inst && inst.kind === 'blockType') {
        beginBlockWithOptionalInline(inst.blockType, inst.value)
        continue
      }

      if (inst && inst.kind === 'content') {
        if (!currentBlock) startBlock('paragraph')
        collectingContent = true
        contentBuf = inst.value ? [inst.value] : []
        continue
      }

      if (inst && inst.kind === 'imageField' && currentBlock && currentBlock.type === 'image') {
        if (inst.field === 'alt') currentBlock.alt = inst.value.trim()
        else if (inst.field === 'caption') currentBlock.caption = inst.value.trim()
        else if (inst.field === 'url' || inst.field === 'src') currentBlock.url = inst.value.trim()
        continue
      }

      if (collectingContent && currentBlock) {
        if (inst) {
          i--
          collectingContent = false
          continue
        }
        if (isSectionHeader(trimmed) || isSectionsMarker(trimmed)) {
          i--
          collectingContent = false
          continue
        }
        if (isParserLabelOnly(trimmed)) continue
        contentBuf.push(line)
        continue
      }

      // Bare prose inside a section (not a label)
      if (currentSection && trimmed && !inst) {
        if (isParserLabelOnly(trimmed)) continue
        if (!currentBlock) {
          beginBlockWithOptionalInline('paragraph', line)
        } else if (currentBlock.type === 'paragraph' && !collectingContent) {
          collectingContent = true
          contentBuf = [line]
        } else if (currentBlock.type === 'paragraph' && collectingContent) {
          contentBuf.push(line)
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

    // Final pass: drop any label-only paragraph blocks
    sections.forEach(function (s) {
      s.blocks = (s.blocks || []).filter(function (b) {
        if (b.type === 'paragraph' || b.type === 'callout' || b.type === 'tip' || b.type === 'quote') {
          return !isParserLabelOnly(b.content)
        }
        return true
      })
      if (!s.blocks.length) s.blocks.push(emptyBlock('paragraph'))
    })

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
      var fuzzy = CATEGORIES.find(function (c) {
        return c.toLowerCase().indexOf(article.category.toLowerCase()) >= 0 ||
          article.category.toLowerCase().indexOf(c.toLowerCase()) >= 0
      })
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
        return s.heading + ' ' + (s.blocks || []).map(function (b) {
          return b.content || (b.items || []).join(' ') || b.alt || ''
        }).join(' ')
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
    isParserLabelOnly: isParserLabelOnly,
    stripParserLabelsFromHtml: stripParserLabelsFromHtml,
    estimateReadingTimeMinutes: estimateReadingTimeMinutes,
    matchInstruction: matchInstruction,
    CATEGORIES: CATEGORIES,
    WORDS_PER_MINUTE: WORDS_PER_MINUTE,
    normalizeTag: normalizeTag,
    slugify: slugify,
  }
})
