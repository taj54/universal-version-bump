/**
 * universal-version-bump v1.1.0
 * Universal Version Bump
 *
 * Description: A GitHub Action to automatically bump versions across any app (Node, Python, PHP, Docker, etc.)
 * Author: Taj <tajulislamj200@gmail.com>
 * Homepage: https://github.com/taj54/universal-version-bump#readme
 * License: MIT
 * Generated on Sat, 14 Nov 2026 12:43:48 GMT
 */
require('./sourcemap-register.js');/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 5275:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const ANY = Symbol('SemVer ANY')
// hoisted class for cyclic dependency
class Comparator {
  static get ANY () {
    return ANY
  }

  constructor (comp, options) {
    options = parseOptions(options)

    if (comp instanceof Comparator) {
      if (comp.loose === !!options.loose) {
        return comp
      } else {
        comp = comp.value
      }
    }

    comp = comp.trim().split(/\s+/).join(' ')
    debug('comparator', comp, options)
    this.options = options
    this.loose = !!options.loose
    this.parse(comp)

    if (this.semver === ANY) {
      this.value = ''
    } else {
      this.value = this.operator + this.semver.version
    }

    debug('comp', this)
  }

  parse (comp) {
    const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR]
    const m = comp.match(r)

    if (!m) {
      throw new TypeError(`Invalid comparator: ${comp}`)
    }

    this.operator = m[1] !== undefined ? m[1] : ''
    if (this.operator === '=') {
      this.operator = ''
    }

    // if it literally is just '>' or '' then allow anything.
    if (!m[2]) {
      this.semver = ANY
    } else {
      this.semver = new SemVer(m[2], this.options.loose)
    }
  }

  toString () {
    return this.value
  }

  test (version) {
    debug('Comparator.test', version, this.options.loose)

    if (this.semver === ANY || version === ANY) {
      return true
    }

    if (typeof version === 'string') {
      try {
        version = new SemVer(version, this.options)
      } catch (er) {
        return false
      }
    }

    return cmp(version, this.operator, this.semver, this.options)
  }

  intersects (comp, options) {
    if (!(comp instanceof Comparator)) {
      throw new TypeError('a Comparator is required')
    }

    if (this.operator === '') {
      if (this.value === '') {
        return true
      }
      return new Range(comp.value, options).test(this.value)
    } else if (comp.operator === '') {
      if (comp.value === '') {
        return true
      }
      return new Range(this.value, options).test(comp.semver)
    }

    options = parseOptions(options)

    // Special cases where nothing can possibly be lower
    if (options.includePrerelease &&
      (this.value === '<0.0.0-0' || comp.value === '<0.0.0-0')) {
      return false
    }
    if (!options.includePrerelease &&
      (this.value.startsWith('<0.0.0') || comp.value.startsWith('<0.0.0'))) {
      return false
    }

    // Same direction increasing (> or >=)
    if (this.operator.startsWith('>') && comp.operator.startsWith('>')) {
      return true
    }
    // Same direction decreasing (< or <=)
    if (this.operator.startsWith('<') && comp.operator.startsWith('<')) {
      return true
    }
    // same SemVer and both sides are inclusive (<= or >=)
    if (
      (this.semver.version === comp.semver.version) &&
      this.operator.includes('=') && comp.operator.includes('=')) {
      return true
    }
    // opposite directions less than
    if (cmp(this.semver, '<', comp.semver, options) &&
      this.operator.startsWith('>') && comp.operator.startsWith('<')) {
      return true
    }
    // opposite directions greater than
    if (cmp(this.semver, '>', comp.semver, options) &&
      this.operator.startsWith('<') && comp.operator.startsWith('>')) {
      return true
    }
    return false
  }
}

module.exports = Comparator

const parseOptions = __nccwpck_require__(7308)
const { safeRe: re, t } = __nccwpck_require__(3191)
const cmp = __nccwpck_require__(8446)
const debug = __nccwpck_require__(5519)
const SemVer = __nccwpck_require__(1603)
const Range = __nccwpck_require__(9046)


/***/ }),

/***/ 9046:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const SPACE_CHARACTERS = /\s+/g

// hoisted class for cyclic dependency
class Range {
  constructor (range, options) {
    options = parseOptions(options)

    if (range instanceof Range) {
      if (
        range.loose === !!options.loose &&
        range.includePrerelease === !!options.includePrerelease
      ) {
        return range
      } else {
        return new Range(range.raw, options)
      }
    }

    if (range instanceof Comparator) {
      // just put it in the set and return
      this.raw = range.value
      this.set = [[range]]
      this.formatted = undefined
      return this
    }

    this.options = options
    this.loose = !!options.loose
    this.includePrerelease = !!options.includePrerelease

    // First reduce all whitespace as much as possible so we do not have to rely
    // on potentially slow regexes like \s*. This is then stored and used for
    // future error messages as well.
    this.raw = range.trim().replace(SPACE_CHARACTERS, ' ')

    // First, split on ||
    this.set = this.raw
      .split('||')
      // map the range to a 2d array of comparators
      .map(r => this.parseRange(r.trim()))
      // throw out any comparator lists that are empty
      // this generally means that it was not a valid range, which is allowed
      // in loose mode, but will still throw if the WHOLE range is invalid.
      .filter(c => c.length)

    if (!this.set.length) {
      throw new TypeError(`Invalid SemVer Range: ${this.raw}`)
    }

    // if we have any that are not the null set, throw out null sets.
    if (this.set.length > 1) {
      // keep the first one, in case they're all null sets
      const first = this.set[0]
      this.set = this.set.filter(c => !isNullSet(c[0]))
      if (this.set.length === 0) {
        this.set = [first]
      } else if (this.set.length > 1) {
        // if we have any that are *, then the range is just *
        for (const c of this.set) {
          if (c.length === 1 && isAny(c[0])) {
            this.set = [c]
            break
          }
        }
      }
    }

    this.formatted = undefined
  }

  get range () {
    if (this.formatted === undefined) {
      this.formatted = ''
      for (let i = 0; i < this.set.length; i++) {
        if (i > 0) {
          this.formatted += '||'
        }
        const comps = this.set[i]
        for (let k = 0; k < comps.length; k++) {
          if (k > 0) {
            this.formatted += ' '
          }
          this.formatted += comps[k].toString().trim()
        }
      }
    }
    return this.formatted
  }

  format () {
    return this.range
  }

  toString () {
    return this.range
  }

  parseRange (range) {
    // strip build metadata so it can't bleed into the version
    range = range.replace(BUILDSTRIPRE, '')

    // memoize range parsing for performance.
    // this is a very hot path, and fully deterministic.
    const memoOpts =
      (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) |
      (this.options.loose && FLAG_LOOSE)
    const memoKey = memoOpts + ':' + range
    const cached = cache.get(memoKey)
    if (cached) {
      return cached
    }

    const loose = this.options.loose
    // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
    const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE]
    range = range.replace(hr, hyphenReplace(this.options.includePrerelease))
    debug('hyphen replace', range)

    // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
    range = trimComparatorWhitespace(range)
    debug('comparator trim', range)

    // `~ 1.2.3` => `~1.2.3`
    range = range.replace(re[t.TILDETRIM], tildeTrimReplace)
    debug('tilde trim', range)

    // `^ 1.2.3` => `^1.2.3`
    range = range.replace(re[t.CARETTRIM], caretTrimReplace)
    debug('caret trim', range)

    // At this point, the range is completely trimmed and
    // ready to be split into comparators.

    let rangeList = range
      .split(' ')
      .map(comp => parseComparator(comp, this.options))
      .join(' ')
      .split(/\s+/)
      // >=0.0.0 is equivalent to *
      .map(comp => replaceGTE0(comp, this.options))

    if (loose) {
      // in loose mode, throw out any that are not valid comparators
      rangeList = rangeList.filter(comp => {
        debug('loose invalid filter', comp, this.options)
        return !!comp.match(re[t.COMPARATORLOOSE])
      })
    }
    debug('range list', rangeList)

    // if any comparators are the null set, then replace with JUST null set
    // if more than one comparator, remove any * comparators
    // also, don't include the same comparator more than once
    const rangeMap = new Map()
    const comparators = rangeList.map(comp => new Comparator(comp, this.options))
    for (const comp of comparators) {
      if (isNullSet(comp)) {
        return [comp]
      }
      rangeMap.set(comp.value, comp)
    }
    if (rangeMap.size > 1 && rangeMap.has('')) {
      rangeMap.delete('')
    }

    const result = [...rangeMap.values()]
    cache.set(memoKey, result)
    return result
  }

  intersects (range, options) {
    if (!(range instanceof Range)) {
      throw new TypeError('a Range is required')
    }

    return this.set.some((thisComparators) => {
      return (
        isSatisfiable(thisComparators, options) &&
        range.set.some((rangeComparators) => {
          return (
            isSatisfiable(rangeComparators, options) &&
            thisComparators.every((thisComparator) => {
              return rangeComparators.every((rangeComparator) => {
                return thisComparator.intersects(rangeComparator, options)
              })
            })
          )
        })
      )
    })
  }

  // if ANY of the sets match ALL of its comparators, then pass
  test (version) {
    if (!version) {
      return false
    }

    if (typeof version === 'string') {
      try {
        version = new SemVer(version, this.options)
      } catch (er) {
        return false
      }
    }

    for (let i = 0; i < this.set.length; i++) {
      if (testSet(this.set[i], version, this.options)) {
        return true
      }
    }
    return false
  }
}

module.exports = Range

const LRU = __nccwpck_require__(1663)
const cache = new LRU()

const parseOptions = __nccwpck_require__(7308)
const Comparator = __nccwpck_require__(5275)
const debug = __nccwpck_require__(5519)
const SemVer = __nccwpck_require__(1603)
const trimComparatorWhitespace = __nccwpck_require__(1777)
const {
  safeRe: re,
  src,
  t,
  tildeTrimReplace,
  caretTrimReplace,
} = __nccwpck_require__(3191)
const { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = __nccwpck_require__(5733)

// unbounded global build-metadata stripper used by parseRange
const BUILDSTRIPRE = new RegExp(src[t.BUILD], 'g')

const isNullSet = c => c.value === '<0.0.0-0'
const isAny = c => c.value === ''

// take a set of comparators and determine whether there
// exists a version which can satisfy it
const isSatisfiable = (comparators, options) => {
  let result = true
  const remainingComparators = comparators.slice()
  let testComparator = remainingComparators.pop()

  while (result && remainingComparators.length) {
    result = remainingComparators.every((otherComparator) => {
      return testComparator.intersects(otherComparator, options)
    })

    testComparator = remainingComparators.pop()
  }

  return result
}

// comprised of xranges, tildes, stars, and gtlt's at this point.
// already replaced the hyphen ranges
// turn into a set of JUST comparators.
const parseComparator = (comp, options) => {
  comp = comp.replace(re[t.BUILD], '')
  debug('comp', comp, options)
  comp = replaceCarets(comp, options)
  debug('caret', comp)
  comp = replaceTildes(comp, options)
  debug('tildes', comp)
  comp = replaceXRanges(comp, options)
  debug('xrange', comp)
  comp = replaceStars(comp, options)
  debug('stars', comp)
  return comp
}

const isX = id => !id || id.toLowerCase() === 'x' || id === '*'

const invalidXRangeOrder = (M, m, p) => (
  (isX(M) && !isX(m)) ||
  (isX(m) && p && !isX(p))
)

// ~, ~> --> * (any, kinda silly)
// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0-0
// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0-0
// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0-0
// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0-0
// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0-0
// ~0.0.1 --> >=0.0.1 <0.1.0-0
const replaceTildes = (comp, options) => {
  return comp
    .trim()
    .split(/\s+/)
    .map((c) => replaceTilde(c, options))
    .join(' ')
}

const replaceTilde = (comp, options) => {
  const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE]
  // if we're including prereleases in the match, then the lower bound is
  // -0, the lowest possible prerelease value, just like x-ranges and carets.
  // this keeps `~1.2` equivalent to the `1.2.x` x-range it's documented as.
  const z = options.includePrerelease ? '-0' : ''
  return comp.replace(r, (_, M, m, p, pr) => {
    debug('tilde', comp, _, M, m, p, pr)
    let ret

    if (isX(M)) {
      ret = ''
    } else if (isX(m)) {
      ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`
    } else if (isX(p)) {
      // ~1.2 == >=1.2.0 <1.3.0-0
      ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`
    } else if (pr) {
      debug('replaceTilde pr', pr)
      ret = `>=${M}.${m}.${p}-${pr
      } <${M}.${+m + 1}.0-0`
    } else {
      // ~1.2.3 == >=1.2.3 <1.3.0-0
      ret = `>=${M}.${m}.${p
      } <${M}.${+m + 1}.0-0`
    }

    debug('tilde return', ret)
    return ret
  })
}

// ^ --> * (any, kinda silly)
// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0-0
// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0-0
// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0-0
// ^1.2.3 --> >=1.2.3 <2.0.0-0
// ^1.2.0 --> >=1.2.0 <2.0.0-0
// ^0.0.1 --> >=0.0.1 <0.0.2-0
// ^0.1.0 --> >=0.1.0 <0.2.0-0
const replaceCarets = (comp, options) => {
  return comp
    .trim()
    .split(/\s+/)
    .map((c) => replaceCaret(c, options))
    .join(' ')
}

const replaceCaret = (comp, options) => {
  debug('caret', comp, options)
  const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET]
  const z = options.includePrerelease ? '-0' : ''
  return comp.replace(r, (_, M, m, p, pr) => {
    debug('caret', comp, _, M, m, p, pr)
    let ret

    if (isX(M)) {
      ret = ''
    } else if (isX(m)) {
      ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`
    } else if (isX(p)) {
      if (M === '0') {
        ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`
      } else {
        ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`
      }
    } else if (pr) {
      debug('replaceCaret pr', pr)
      if (M === '0') {
        if (m === '0') {
          ret = `>=${M}.${m}.${p}-${pr
          } <${M}.${m}.${+p + 1}-0`
        } else {
          ret = `>=${M}.${m}.${p}-${pr
          } <${M}.${+m + 1}.0-0`
        }
      } else {
        ret = `>=${M}.${m}.${p}-${pr
        } <${+M + 1}.0.0-0`
      }
    } else {
      debug('no pr')
      if (M === '0') {
        if (m === '0') {
          ret = `>=${M}.${m}.${p
          } <${M}.${m}.${+p + 1}-0`
        } else {
          ret = `>=${M}.${m}.${p
          } <${M}.${+m + 1}.0-0`
        }
      } else {
        ret = `>=${M}.${m}.${p
        } <${+M + 1}.0.0-0`
      }
    }

    debug('caret return', ret)
    return ret
  })
}

const replaceXRanges = (comp, options) => {
  debug('replaceXRanges', comp, options)
  return comp
    .split(/\s+/)
    .map((c) => replaceXRange(c, options))
    .join(' ')
}

const replaceXRange = (comp, options) => {
  comp = comp.trim()
  const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE]
  return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
    debug('xRange', comp, ret, gtlt, M, m, p, pr)
    if (invalidXRangeOrder(M, m, p)) {
      return comp
    }

    const xM = isX(M)
    const xm = xM || isX(m)
    const xp = xm || isX(p)
    const anyX = xp

    if (gtlt === '=' && anyX) {
      gtlt = ''
    }

    // if we're including prereleases in the match, then we need
    // to fix this to -0, the lowest possible prerelease value
    pr = options.includePrerelease ? '-0' : ''

    if (xM) {
      if (gtlt === '>' || gtlt === '<') {
        // nothing is allowed
        ret = '<0.0.0-0'
      } else {
        // nothing is forbidden
        ret = '*'
      }
    } else if (gtlt && anyX) {
      // we know patch is an x, because we have any x at all.
      // replace X with 0
      if (xm) {
        m = 0
      }
      p = 0

      if (gtlt === '>') {
        // >1 => >=2.0.0
        // >1.2 => >=1.3.0
        gtlt = '>='
        if (xm) {
          M = +M + 1
          m = 0
          p = 0
        } else {
          m = +m + 1
          p = 0
        }
      } else if (gtlt === '<=') {
        // <=0.7.x is actually <0.8.0, since any 0.7.x should
        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
        gtlt = '<'
        if (xm) {
          M = +M + 1
        } else {
          m = +m + 1
        }
      }

      if (gtlt === '<') {
        pr = '-0'
      }

      ret = `${gtlt + M}.${m}.${p}${pr}`
    } else if (xm) {
      ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`
    } else if (xp) {
      ret = `>=${M}.${m}.0${pr
      } <${M}.${+m + 1}.0-0`
    }

    debug('xRange return', ret)

    return ret
  })
}

// Because * is AND-ed with everything else in the comparator,
// and '' means "any version", just remove the *s entirely.
const replaceStars = (comp, options) => {
  debug('replaceStars', comp, options)
  // Looseness is ignored here.  star is always as loose as it gets!
  return comp
    .trim()
    .replace(re[t.STAR], '')
}

const replaceGTE0 = (comp, options) => {
  debug('replaceGTE0', comp, options)
  return comp
    .trim()
    .replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], '')
}

// This function is passed to string.replace(re[t.HYPHENRANGE])
// M, m, patch, prerelease, build
// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
// 1.2.3 - 3.4 => >=1.2.0 <3.5.0-0 Any 3.4.x will do
// 1.2 - 3.4 => >=1.2.0 <3.5.0-0
// TODO build?
const hyphenReplace = incPr => ($0,
  from, fM, fm, fp, fpr, fb,
  to, tM, tm, tp, tpr) => {
  if (isX(fM)) {
    from = ''
  } else if (isX(fm)) {
    from = `>=${fM}.0.0${incPr ? '-0' : ''}`
  } else if (isX(fp)) {
    from = `>=${fM}.${fm}.0${incPr ? '-0' : ''}`
  } else if (fpr) {
    from = `>=${from}`
  } else {
    from = `>=${from}${incPr ? '-0' : ''}`
  }

  if (isX(tM)) {
    to = ''
  } else if (isX(tm)) {
    to = `<${+tM + 1}.0.0-0`
  } else if (isX(tp)) {
    to = `<${tM}.${+tm + 1}.0-0`
  } else if (tpr) {
    to = `<=${tM}.${tm}.${tp}-${tpr}`
  } else if (incPr) {
    to = `<${tM}.${tm}.${+tp + 1}-0`
  } else {
    to = `<=${to}`
  }

  return `${from} ${to}`.trim()
}

const testSet = (set, version, options) => {
  for (let i = 0; i < set.length; i++) {
    if (!set[i].test(version)) {
      return false
    }
  }

  if (version.prerelease.length && !options.includePrerelease) {
    // Find the set of versions that are allowed to have prereleases
    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
    // That should allow `1.2.3-pr.2` to pass.
    // However, `1.2.4-alpha.notready` should NOT be allowed,
    // even though it's within the range set by the comparators.
    for (let i = 0; i < set.length; i++) {
      debug(set[i].semver)
      if (set[i].semver === Comparator.ANY) {
        continue
      }

      if (set[i].semver.prerelease.length > 0) {
        const allowed = set[i].semver
        if (allowed.major === version.major &&
            allowed.minor === version.minor &&
            allowed.patch === version.patch) {
          return true
        }
      }
    }

    // Version has a -pre, but it's not one of the ones we like.
    return false
  }

  return true
}


/***/ }),

/***/ 1603:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const debug = __nccwpck_require__(5519)
const { MAX_LENGTH, MAX_SAFE_INTEGER } = __nccwpck_require__(5733)
const { safeRe: re, t } = __nccwpck_require__(3191)

const parseOptions = __nccwpck_require__(7308)
const { compareIdentifiers } = __nccwpck_require__(9916)

const isPrereleaseIdentifier = (prerelease, identifier) => {
  const identifiers = identifier.split('.')
  if (identifiers.length > prerelease.length) {
    return false
  }

  for (let i = 0; i < identifiers.length; i++) {
    if (compareIdentifiers(prerelease[i], identifiers[i]) !== 0) {
      return false
    }
  }

  return true
}

class SemVer {
  constructor (version, options) {
    options = parseOptions(options)

    if (version instanceof SemVer) {
      if (version.loose === !!options.loose &&
        version.includePrerelease === !!options.includePrerelease) {
        return version
      } else {
        version = version.version
      }
    } else if (typeof version !== 'string') {
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`)
    }

    if (version.length > MAX_LENGTH) {
      throw new TypeError(
        `version is longer than ${MAX_LENGTH} characters`
      )
    }

    debug('SemVer', version, options)
    this.options = options
    this.loose = !!options.loose
    // this isn't actually relevant for versions, but keep it so that we
    // don't run into trouble passing this.options around.
    this.includePrerelease = !!options.includePrerelease

    const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL])

    if (!m) {
      throw new TypeError(`Invalid Version: ${version}`)
    }

    this.raw = version

    // these are actually numbers
    this.major = +m[1]
    this.minor = +m[2]
    this.patch = +m[3]

    if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
      throw new TypeError('Invalid major version')
    }

    if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
      throw new TypeError('Invalid minor version')
    }

    if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
      throw new TypeError('Invalid patch version')
    }

    // numberify any prerelease numeric ids
    if (!m[4]) {
      this.prerelease = []
    } else {
      this.prerelease = m[4].split('.').map((id) => {
        if (/^[0-9]+$/.test(id)) {
          const num = +id
          if (num >= 0 && num < MAX_SAFE_INTEGER) {
            return num
          }
        }
        return id
      })
    }

    this.build = m[5] ? m[5].split('.') : []
    this.format()
  }

  format () {
    this.version = `${this.major}.${this.minor}.${this.patch}`
    if (this.prerelease.length) {
      this.version += `-${this.prerelease.join('.')}`
    }
    return this.version
  }

  toString () {
    return this.version
  }

  compare (other) {
    debug('SemVer.compare', this.version, this.options, other)
    if (!(other instanceof SemVer)) {
      if (typeof other === 'string' && other === this.version) {
        return 0
      }
      other = new SemVer(other, this.options)
    }

    if (other.version === this.version) {
      return 0
    }

    return this.compareMain(other) || this.comparePre(other)
  }

  compareMain (other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options)
    }

    if (this.major < other.major) {
      return -1
    }
    if (this.major > other.major) {
      return 1
    }
    if (this.minor < other.minor) {
      return -1
    }
    if (this.minor > other.minor) {
      return 1
    }
    if (this.patch < other.patch) {
      return -1
    }
    if (this.patch > other.patch) {
      return 1
    }
    return 0
  }

  comparePre (other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options)
    }

    // NOT having a prerelease is > having one
    if (this.prerelease.length && !other.prerelease.length) {
      return -1
    } else if (!this.prerelease.length && other.prerelease.length) {
      return 1
    } else if (!this.prerelease.length && !other.prerelease.length) {
      return 0
    }

    let i = 0
    do {
      const a = this.prerelease[i]
      const b = other.prerelease[i]
      debug('prerelease compare', i, a, b)
      if (a === undefined && b === undefined) {
        return 0
      } else if (b === undefined) {
        return 1
      } else if (a === undefined) {
        return -1
      } else if (a === b) {
        continue
      } else {
        return compareIdentifiers(a, b)
      }
    } while (++i)
  }

  compareBuild (other) {
    if (!(other instanceof SemVer)) {
      other = new SemVer(other, this.options)
    }

    let i = 0
    do {
      const a = this.build[i]
      const b = other.build[i]
      debug('build compare', i, a, b)
      if (a === undefined && b === undefined) {
        return 0
      } else if (b === undefined) {
        return 1
      } else if (a === undefined) {
        return -1
      } else if (a === b) {
        continue
      } else {
        return compareIdentifiers(a, b)
      }
    } while (++i)
  }

  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc (release, identifier, identifierBase) {
    if (release.startsWith('pre')) {
      if (!identifier && identifierBase === false) {
        throw new Error('invalid increment argument: identifier is empty')
      }
      // Avoid an invalid semver results
      if (identifier) {
        const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE])
        if (!match || match[1] !== identifier) {
          throw new Error(`invalid identifier: ${identifier}`)
        }
      }
    }

    switch (release) {
      case 'premajor':
        this.prerelease.length = 0
        this.patch = 0
        this.minor = 0
        this.major++
        this.inc('pre', identifier, identifierBase)
        break
      case 'preminor':
        this.prerelease.length = 0
        this.patch = 0
        this.minor++
        this.inc('pre', identifier, identifierBase)
        break
      case 'prepatch':
        // If this is already a prerelease, it will bump to the next version
        // drop any prereleases that might already exist, since they are not
        // relevant at this point.
        this.prerelease.length = 0
        this.inc('patch', identifier, identifierBase)
        this.inc('pre', identifier, identifierBase)
        break
      // If the input is a non-prerelease version, this acts the same as
      // prepatch.
      case 'prerelease':
        if (this.prerelease.length === 0) {
          this.inc('patch', identifier, identifierBase)
        }
        this.inc('pre', identifier, identifierBase)
        break
      case 'release':
        if (this.prerelease.length === 0) {
          throw new Error(`version ${this.raw} is not a prerelease`)
        }
        this.prerelease.length = 0
        break

      case 'major':
        // If this is a pre-major version, bump up to the same major version.
        // Otherwise increment major.
        // 1.0.0-5 bumps to 1.0.0
        // 1.1.0 bumps to 2.0.0
        if (
          this.minor !== 0 ||
          this.patch !== 0 ||
          this.prerelease.length === 0
        ) {
          this.major++
        }
        this.minor = 0
        this.patch = 0
        this.prerelease = []
        break
      case 'minor':
        // If this is a pre-minor version, bump up to the same minor version.
        // Otherwise increment minor.
        // 1.2.0-5 bumps to 1.2.0
        // 1.2.1 bumps to 1.3.0
        if (this.patch !== 0 || this.prerelease.length === 0) {
          this.minor++
        }
        this.patch = 0
        this.prerelease = []
        break
      case 'patch':
        // If this is not a pre-release version, it will increment the patch.
        // If it is a pre-release it will bump up to the same patch version.
        // 1.2.0-5 patches to 1.2.0
        // 1.2.0 patches to 1.2.1
        if (this.prerelease.length === 0) {
          this.patch++
        }
        this.prerelease = []
        break
      // This probably shouldn't be used publicly.
      // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
      case 'pre': {
        const base = Number(identifierBase) ? 1 : 0

        if (this.prerelease.length === 0) {
          this.prerelease = [base]
        } else {
          let i = this.prerelease.length
          while (--i >= 0) {
            if (typeof this.prerelease[i] === 'number') {
              this.prerelease[i]++
              i = -2
            }
          }
          if (i === -1) {
            // didn't increment anything
            if (identifier === this.prerelease.join('.') && identifierBase === false) {
              throw new Error('invalid increment argument: identifier already exists')
            }
            this.prerelease.push(base)
          }
        }
        if (identifier) {
          // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
          // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
          let prerelease = [identifier, base]
          if (identifierBase === false) {
            prerelease = [identifier]
          }
          if (isPrereleaseIdentifier(this.prerelease, identifier)) {
            const prereleaseBase = this.prerelease[identifier.split('.').length]
            if (isNaN(prereleaseBase)) {
              this.prerelease = prerelease
            }
          } else {
            this.prerelease = prerelease
          }
        }
        break
      }
      default:
        throw new Error(`invalid increment argument: ${release}`)
    }
    this.raw = this.format()
    if (this.build.length) {
      this.raw += `+${this.build.join('.')}`
    }
    return this
  }
}

module.exports = SemVer


/***/ }),

/***/ 9455:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const parse = __nccwpck_require__(1817)
const clean = (version, options) => {
  const s = parse(version.trim().replace(/^[=v]+/, ''), options)
  return s ? s.version : null
}
module.exports = clean


/***/ }),

/***/ 8446:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const eq = __nccwpck_require__(3714)
const neq = __nccwpck_require__(6518)
const gt = __nccwpck_require__(5743)
const gte = __nccwpck_require__(972)
const lt = __nccwpck_require__(3896)
const lte = __nccwpck_require__(7221)

const cmp = (a, op, b, loose) => {
  switch (op) {
    case '===':
      if (typeof a === 'object') {
        a = a.version
      }
      if (typeof b === 'object') {
        b = b.version
      }
      return a === b

    case '!==':
      if (typeof a === 'object') {
        a = a.version
      }
      if (typeof b === 'object') {
        b = b.version
      }
      return a !== b

    case '':
    case '=':
    case '==':
      return eq(a, b, loose)

    case '!=':
      return neq(a, b, loose)

    case '>':
      return gt(a, b, loose)

    case '>=':
      return gte(a, b, loose)

    case '<':
      return lt(a, b, loose)

    case '<=':
      return lte(a, b, loose)

    default:
      throw new TypeError(`Invalid operator: ${op}`)
  }
}
module.exports = cmp


/***/ }),

/***/ 9889:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const SemVer = __nccwpck_require__(1603)
const parse = __nccwpck_require__(1817)
const { safeRe: re, t } = __nccwpck_require__(3191)

const coerce = (version, options) => {
  if (version instanceof SemVer) {
    return version
  }

  if (typeof version === 'number') {
    version = String(version)
  }

  if (typeof version !== 'string') {
    return null
  }

  options = options || {}

  let match = null
  if (!options.rtl) {
    match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE])
  } else {
    // Find the right-most coercible string that does not share
    // a terminus with a more left-ward coercible string.
    // Eg, '1.2.3.4' wants to coerce '2.3.4', not '3.4' or '4'
    // With includePrerelease option set, '1.2.3.4-rc' wants to coerce '2.3.4-rc', not '2.3.4'
    //
    // Walk through the string checking with a /g regexp
    // Manually set the index so as to pick up overlapping matches.
    // Stop when we get a match that ends at the string end, since no
    // coercible string can be more right-ward without the same terminus.
    const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL]
    let next
    while ((next = coerceRtlRegex.exec(version)) &&
        (!match || match.index + match[0].length !== version.length)
    ) {
      if (!match ||
            next.index + next[0].length !== match.index + match[0].length) {
        match = next
      }
      coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length
    }
    // leave it in a clean state
    coerceRtlRegex.lastIndex = -1
  }

  if (match === null) {
    return null
  }

  const major = match[2]
  const minor = match[3] || '0'
  const patch = match[4] || '0'
  const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : ''
  const build = options.includePrerelease && match[6] ? `+${match[6]}` : ''

  return parse(`${major}.${minor}.${patch}${prerelease}${build}`, options)
}
module.exports = coerce


/***/ }),

/***/ 9256:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const SemVer = __nccwpck_require__(1603)
const compareBuild = (a, b, loose) => {
  const versionA = new SemVer(a, loose)
  const versionB = new SemVer(b, loose)
  return versionA.compare(versionB) || versionA.compareBuild(versionB)
}
module.exports = compareBuild


/***/ }),

/***/ 2498:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const compare = __nccwpck_require__(6061)
const compareLoose = (a, b) => compare(a, b, true)
module.exports = compareLoose


/***/ }),

/***/ 6061:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const SemVer = __nccwpck_require__(1603)
const compare = (a, b, loose) =>
  new SemVer(a, loose).compare(new SemVer(b, loose))

module.exports = compare


/***/ }),

/***/ 7535:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const parse = __nccwpck_require__(1817)

const diff = (version1, version2) => {
  const v1 = parse(version1, null, true)
  const v2 = parse(version2, null, true)
  const comparison = v1.compare(v2)

  if (comparison === 0) {
    return null
  }

  const v1Higher = comparison > 0
  const highVersion = v1Higher ? v1 : v2
  const lowVersion = v1Higher ? v2 : v1
  const highHasPre = !!highVersion.prerelease.length
  const lowHasPre = !!lowVersion.prerelease.length

  if (lowHasPre && !highHasPre) {
    // Going from prerelease -> no prerelease requires some special casing

    // If the low version has only a major, then it will always be a major
    // Some examples:
    // 1.0.0-1 -> 1.0.0
    // 1.0.0-1 -> 1.1.1
    // 1.0.0-1 -> 2.0.0
    if (!lowVersion.patch && !lowVersion.minor) {
      return 'major'
    }

    // If the main part has no difference
    if (lowVersion.compareMain(highVersion) === 0) {
      if (lowVersion.minor && !lowVersion.patch) {
        return 'minor'
      }
      return 'patch'
    }
  }

  // add the `pre` prefix if we are going to a prerelease version
  const prefix = highHasPre ? 'pre' : ''

  if (v1.major !== v2.major) {
    return prefix + 'major'
  }

  if (v1.minor !== v2.minor) {
    return prefix + 'minor'
  }

  if (v1.patch !== v2.patch) {
    return prefix + 'patch'
  }

  // high and low are prereleases
  return 'prerelease'
}

module.exports = diff


/***/ }),

/***/ 3714:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const compare = __nccwpck_require__(6061)
const eq = (a, b, loose) => compare(a, b, loose) === 0
module.exports = eq


/***/ }),

/***/ 5743:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const compare = __nccwpck_require__(6061)
const gt = (a, b, loose) => compare(a, b, loose) > 0
module.exports = gt


/***/ }),

/***/ 972:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const compare = __nccwpck_require__(6061)
const gte = (a, b, loose) => compare(a, b, loose) >= 0
module.exports = gte


/***/ }),

/***/ 4858:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const SemVer = __nccwpck_require__(1603)

const inc = (version, release, options, identifier, identifierBase) => {
  if (typeof (options) === 'string') {
    identifierBase = identifier
    identifier = options
    options = undefined
  }

  try {
    return new SemVer(
      version instanceof SemVer ? version.version : version,
      options
    ).inc(release, identifier, identifierBase).version
  } catch (er) {
    return null
  }
}
module.exports = inc


/***/ }),

/***/ 3896:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const compare = __nccwpck_require__(6061)
const lt = (a, b, loose) => compare(a, b, loose) < 0
module.exports = lt


/***/ }),

/***/ 7221:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const compare = __nccwpck_require__(6061)
const lte = (a, b, loose) => compare(a, b, loose) <= 0
module.exports = lte


/***/ }),

/***/ 4567:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const SemVer = __nccwpck_require__(1603)
const major = (a, loose) => new SemVer(a, loose).major
module.exports = major


/***/ }),

/***/ 8467:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const SemVer = __nccwpck_require__(1603)
const minor = (a, loose) => new SemVer(a, loose).minor
module.exports = minor


/***/ }),

/***/ 6518:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const compare = __nccwpck_require__(6061)
const neq = (a, b, loose) => compare(a, b, loose) !== 0
module.exports = neq


/***/ }),

/***/ 1817:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const SemVer = __nccwpck_require__(1603)
const parse = (version, options, throwErrors = false) => {
  if (version instanceof SemVer) {
    return version
  }
  try {
    return new SemVer(version, options)
  } catch (er) {
    if (!throwErrors) {
      return null
    }
    throw er
  }
}

module.exports = parse


/***/ }),

/***/ 3276:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const SemVer = __nccwpck_require__(1603)
const patch = (a, loose) => new SemVer(a, loose).patch
module.exports = patch


/***/ }),

/***/ 4282:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const parse = __nccwpck_require__(1817)
const prerelease = (version, options) => {
  const parsed = parse(version, options)
  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null
}
module.exports = prerelease


/***/ }),

/***/ 6149:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const compare = __nccwpck_require__(6061)
const rcompare = (a, b, loose) => compare(b, a, loose)
module.exports = rcompare


/***/ }),

/***/ 4624:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const compareBuild = __nccwpck_require__(9256)
const rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose))
module.exports = rsort


/***/ }),

/***/ 883:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const Range = __nccwpck_require__(9046)
const satisfies = (version, range, options) => {
  try {
    range = new Range(range, options)
  } catch (er) {
    return false
  }
  return range.test(version)
}
module.exports = satisfies


/***/ }),

/***/ 4888:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const compareBuild = __nccwpck_require__(9256)
const sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose))
module.exports = sort


/***/ }),

/***/ 8314:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const parse = __nccwpck_require__(1817)
const constants = __nccwpck_require__(5733)
const SemVer = __nccwpck_require__(1603)

const truncate = (version, truncation, options) => {
  if (!constants.RELEASE_TYPES.includes(truncation)) {
    return null
  }

  const clonedVersion = cloneInputVersion(version, options)
  return clonedVersion && doTruncation(clonedVersion, truncation)
}

const cloneInputVersion = (version, options) => {
  const versionStringToParse = (
    version instanceof SemVer ? version.version : version
  )

  return parse(versionStringToParse, options)
}

const doTruncation = (version, truncation) => {
  if (isPrerelease(truncation)) {
    return version.version
  }

  version.prerelease = []

  switch (truncation) {
    case 'major':
      version.minor = 0
      version.patch = 0
      break
    case 'minor':
      version.patch = 0
      break
  }

  return version.format()
}

const isPrerelease = (type) => {
  return type.startsWith('pre')
}

module.exports = truncate


/***/ }),

/***/ 1988:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const parse = __nccwpck_require__(1817)
const valid = (version, options) => {
  const v = parse(version, options)
  return v ? v.version : null
}
module.exports = valid


/***/ }),

/***/ 2320:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



// just pre-load all the stuff that index.js lazily exports
const internalRe = __nccwpck_require__(3191)
const constants = __nccwpck_require__(5733)
const SemVer = __nccwpck_require__(1603)
const identifiers = __nccwpck_require__(9916)
const parse = __nccwpck_require__(1817)
const valid = __nccwpck_require__(1988)
const clean = __nccwpck_require__(9455)
const inc = __nccwpck_require__(4858)
const diff = __nccwpck_require__(7535)
const major = __nccwpck_require__(4567)
const minor = __nccwpck_require__(8467)
const patch = __nccwpck_require__(3276)
const prerelease = __nccwpck_require__(4282)
const compare = __nccwpck_require__(6061)
const rcompare = __nccwpck_require__(6149)
const compareLoose = __nccwpck_require__(2498)
const compareBuild = __nccwpck_require__(9256)
const sort = __nccwpck_require__(4888)
const rsort = __nccwpck_require__(4624)
const gt = __nccwpck_require__(5743)
const lt = __nccwpck_require__(3896)
const eq = __nccwpck_require__(3714)
const neq = __nccwpck_require__(6518)
const gte = __nccwpck_require__(972)
const lte = __nccwpck_require__(7221)
const cmp = __nccwpck_require__(8446)
const coerce = __nccwpck_require__(9889)
const truncate = __nccwpck_require__(8314)
const Comparator = __nccwpck_require__(5275)
const Range = __nccwpck_require__(9046)
const satisfies = __nccwpck_require__(883)
const toComparators = __nccwpck_require__(9830)
const maxSatisfying = __nccwpck_require__(5377)
const minSatisfying = __nccwpck_require__(2235)
const minVersion = __nccwpck_require__(2210)
const validRange = __nccwpck_require__(7705)
const outside = __nccwpck_require__(5472)
const gtr = __nccwpck_require__(940)
const ltr = __nccwpck_require__(9605)
const intersects = __nccwpck_require__(6465)
const simplifyRange = __nccwpck_require__(7076)
const subset = __nccwpck_require__(6585)
module.exports = {
  parse,
  valid,
  clean,
  inc,
  diff,
  major,
  minor,
  patch,
  prerelease,
  compare,
  rcompare,
  compareLoose,
  compareBuild,
  sort,
  rsort,
  gt,
  lt,
  eq,
  neq,
  gte,
  lte,
  cmp,
  coerce,
  truncate,
  Comparator,
  Range,
  satisfies,
  toComparators,
  maxSatisfying,
  minSatisfying,
  minVersion,
  validRange,
  outside,
  gtr,
  ltr,
  intersects,
  simplifyRange,
  subset,
  SemVer,
  re: internalRe.re,
  src: internalRe.src,
  tokens: internalRe.t,
  SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: constants.RELEASE_TYPES,
  compareIdentifiers: identifiers.compareIdentifiers,
  rcompareIdentifiers: identifiers.rcompareIdentifiers,
}


/***/ }),

/***/ 5733:
/***/ ((module) => {



// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
const SEMVER_SPEC_VERSION = '2.0.0'

const MAX_LENGTH = 256
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER ||
/* istanbul ignore next */ 9007199254740991

// Max safe segment length for coercion.
const MAX_SAFE_COMPONENT_LENGTH = 16

// Max safe length for a build identifier. The max length minus 6 characters for
// the shortest version with a build 0.0.0+BUILD.
const MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6

// ECMAScript whitespace and line terminators matched by \s.
const WHITESPACE_CHARACTERS = [
  '\t',
  '\n',
  '\v',
  '\f',
  '\r',
  ' ',
  '\u00a0',
  '\u1680',
  '\u2000',
  '\u2001',
  '\u2002',
  '\u2003',
  '\u2004',
  '\u2005',
  '\u2006',
  '\u2007',
  '\u2008',
  '\u2009',
  '\u200a',
  '\u2028',
  '\u2029',
  '\u202f',
  '\u205f',
  '\u3000',
  '\ufeff',
]

const RELEASE_TYPES = [
  'major',
  'premajor',
  'minor',
  'preminor',
  'patch',
  'prepatch',
  'prerelease',
]

module.exports = {
  MAX_LENGTH,
  MAX_SAFE_COMPONENT_LENGTH,
  MAX_SAFE_BUILD_LENGTH,
  MAX_SAFE_INTEGER,
  WHITESPACE_CHARACTERS,
  RELEASE_TYPES,
  SEMVER_SPEC_VERSION,
  FLAG_INCLUDE_PRERELEASE: 0b001,
  FLAG_LOOSE: 0b010,
}


/***/ }),

/***/ 5519:
/***/ ((module) => {



const debug = (
  typeof process === 'object' &&
  process.env &&
  process.env.NODE_DEBUG &&
  /\bsemver\b/i.test(process.env.NODE_DEBUG)
) ? (...args) => console.error('SEMVER', ...args)
  : () => {}

module.exports = debug


/***/ }),

/***/ 9916:
/***/ ((module) => {



const numeric = /^[0-9]+$/
const compareIdentifiers = (a, b) => {
  if (typeof a === 'number' && typeof b === 'number') {
    return a === b ? 0 : a < b ? -1 : 1
  }

  const anum = numeric.test(a)
  const bnum = numeric.test(b)

  if (anum && bnum) {
    a = +a
    b = +b
  }

  return a === b ? 0
    : (anum && !bnum) ? -1
    : (bnum && !anum) ? 1
    : a < b ? -1
    : 1
}

const rcompareIdentifiers = (a, b) => compareIdentifiers(b, a)

module.exports = {
  compareIdentifiers,
  rcompareIdentifiers,
}


/***/ }),

/***/ 1663:
/***/ ((module) => {



class LRUCache {
  constructor () {
    this.max = 1000
    this.map = new Map()
  }

  get (key) {
    const value = this.map.get(key)
    if (value === undefined) {
      return undefined
    } else {
      // Remove the key from the map and add it to the end
      this.map.delete(key)
      this.map.set(key, value)
      return value
    }
  }

  delete (key) {
    return this.map.delete(key)
  }

  set (key, value) {
    const deleted = this.delete(key)

    if (!deleted && value !== undefined) {
      // If cache is full, delete the least recently used item
      if (this.map.size >= this.max) {
        const firstKey = this.map.keys().next().value
        this.delete(firstKey)
      }

      this.map.set(key, value)
    }

    return this
  }
}

module.exports = LRUCache


/***/ }),

/***/ 7308:
/***/ ((module) => {



// parse out just the options we care about
const looseOption = Object.freeze({ loose: true })
const emptyOpts = Object.freeze({ })
const parseOptions = options => {
  if (!options) {
    return emptyOpts
  }

  if (typeof options !== 'object') {
    return looseOption
  }

  return options
}
module.exports = parseOptions


/***/ }),

/***/ 3191:
/***/ ((module, exports, __nccwpck_require__) => {



const {
  MAX_SAFE_COMPONENT_LENGTH,
  MAX_SAFE_BUILD_LENGTH,
  MAX_LENGTH,
} = __nccwpck_require__(5733)
const debug = __nccwpck_require__(5519)
exports = module.exports = {}

// The actual regexps go on exports.re
const re = exports.re = []
const safeRe = exports.safeRe = []
const src = exports.src = []
const safeSrc = exports.safeSrc = []
const t = exports.t = {}
let R = 0

const LETTERDASHNUMBER = '[a-zA-Z0-9-]'

// Replace some greedy regex tokens to prevent regex dos issues. These regex are
// used internally via the safeRe object since all inputs in this library get
// normalized first to trim and collapse all extra whitespace. The original
// regexes are exported for userland consumption and lower level usage. A
// future breaking change could export the safer regex only with a note that
// all input should have extra whitespace removed.
const safeRegexReplacements = [
  ['\\s', 1],
  ['\\d', MAX_LENGTH],
  [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH],
]

const makeSafeRegex = (value) => {
  for (const [token, max] of safeRegexReplacements) {
    value = value
      .split(`${token}*`).join(`${token}{0,${max}}`)
      .split(`${token}+`).join(`${token}{1,${max}}`)
  }
  return value
}

const createToken = (name, value, isGlobal) => {
  const safe = makeSafeRegex(value)
  const index = R++
  debug(name, index, value)
  t[name] = index
  src[index] = value
  safeSrc[index] = safe
  re[index] = new RegExp(value, isGlobal ? 'g' : undefined)
  safeRe[index] = new RegExp(safe, isGlobal ? 'g' : undefined)
}

// The following Regular Expressions can be used for tokenizing,
// validating, and parsing SemVer version strings.

// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.

createToken('NUMERICIDENTIFIER', '0|[1-9]\\d*')
createToken('NUMERICIDENTIFIERLOOSE', '\\d+')

// ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.

createToken('NONNUMERICIDENTIFIER', `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`)

// ## Main Version
// Three dot-separated numeric identifiers.

createToken('MAINVERSION', `(${src[t.NUMERICIDENTIFIER]})\\.` +
                   `(${src[t.NUMERICIDENTIFIER]})\\.` +
                   `(${src[t.NUMERICIDENTIFIER]})`)

createToken('MAINVERSIONLOOSE', `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
                        `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
                        `(${src[t.NUMERICIDENTIFIERLOOSE]})`)

// ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.
// Non-numeric identifiers include numeric identifiers but can be longer.
// Therefore non-numeric identifiers must go first.

createToken('PRERELEASEIDENTIFIER', `(?:${src[t.NONNUMERICIDENTIFIER]
}|${src[t.NUMERICIDENTIFIER]})`)

createToken('PRERELEASEIDENTIFIERLOOSE', `(?:${src[t.NONNUMERICIDENTIFIER]
}|${src[t.NUMERICIDENTIFIERLOOSE]})`)

// ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.

createToken('PRERELEASE', `(?:-(${src[t.PRERELEASEIDENTIFIER]
}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`)

createToken('PRERELEASELOOSE', `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]
}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`)

// ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.

createToken('BUILDIDENTIFIER', `${LETTERDASHNUMBER}+`)

// ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.

createToken('BUILD', `(?:\\+(${src[t.BUILDIDENTIFIER]
}(?:\\.${src[t.BUILDIDENTIFIER]})*))`)

// ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.

// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.

createToken('FULLPLAIN', `v?${src[t.MAINVERSION]
}${src[t.PRERELEASE]}?${
  src[t.BUILD]}?`)

createToken('FULL', `^${src[t.FULLPLAIN]}$`)

// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.
createToken('LOOSEPLAIN', `[v=\\s]*${src[t.MAINVERSIONLOOSE]
}${src[t.PRERELEASELOOSE]}?${
  src[t.BUILD]}?`)

createToken('LOOSE', `^${src[t.LOOSEPLAIN]}$`)

createToken('GTLT', '((?:<|>)?=?)')

// Something like "2.*" or "1.2.x".
// Note that "x.x" is a valid xRange identifier, meaning "any version"
// Only the first item is strictly required.
createToken('XRANGEIDENTIFIERLOOSE', `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`)
createToken('XRANGEIDENTIFIER', `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`)

createToken('XRANGEPLAIN', `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:${src[t.PRERELEASE]})?${
                     src[t.BUILD]}?` +
                   `)?)?`)

createToken('XRANGEPLAINLOOSE', `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:${src[t.PRERELEASELOOSE]})?${
                          src[t.BUILD]}?` +
                        `)?)?`)

createToken('XRANGE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`)
createToken('XRANGELOOSE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`)

// Coercion.
// Extract anything that could conceivably be a part of a valid semver
createToken('COERCEPLAIN', `${'(^|[^\\d])' +
              '(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})` +
              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`)
createToken('COERCE', `${src[t.COERCEPLAIN]}(?:$|[^\\d])`)
createToken('COERCEFULL', src[t.COERCEPLAIN] +
              `(?:${src[t.PRERELEASE]})?` +
              `(?:${src[t.BUILD]})?` +
              `(?:$|[^\\d])`)
createToken('COERCERTL', src[t.COERCE], true)
createToken('COERCERTLFULL', src[t.COERCEFULL], true)

// Tilde ranges.
// Meaning is "reasonably at or greater than"
createToken('LONETILDE', '(?:~>?)')

createToken('TILDETRIM', `(\\s*)${src[t.LONETILDE]}\\s+`, true)
exports.tildeTrimReplace = '$1~'

createToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`)
createToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`)

// Caret ranges.
// Meaning is "at least and backwards compatible with"
createToken('LONECARET', '(?:\\^)')

createToken('CARETTRIM', `(\\s*)${src[t.LONECARET]}\\s+`, true)
exports.caretTrimReplace = '$1^'

createToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`)
createToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`)

// A simple gt/lt/eq thing, or just "" to indicate "any version"
createToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`)
createToken('COMPARATOR', `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`)

// An expression to strip any whitespace between the gtlt and the thing
// it modifies, so that `> 1.2.3` ==> `>1.2.3`
createToken('COMPARATORTRIM', `(\\s*)${src[t.GTLT]
}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true)
exports.comparatorTrimReplace = '$1$2$3'

// Something like `1.2.3 - 1.2.4`
// Note that these all use the loose form, because they'll be
// checked against either the strict or loose comparator form
// later.
createToken('HYPHENRANGE', `^\\s*(${src[t.XRANGEPLAIN]})` +
                   `\\s+-\\s+` +
                   `(${src[t.XRANGEPLAIN]})` +
                   `\\s*$`)

createToken('HYPHENRANGELOOSE', `^\\s*(${src[t.XRANGEPLAINLOOSE]})` +
                        `\\s+-\\s+` +
                        `(${src[t.XRANGEPLAINLOOSE]})` +
                        `\\s*$`)

// Star ranges basically just allow anything at all.
createToken('STAR', '(<|>)?=?\\s*\\*')
// >=0.0.0 is like a star
createToken('GTE0', '^\\s*>=\\s*0\\.0\\.0\\s*$')
createToken('GTE0PRE', '^\\s*>=\\s*0\\.0\\.0-0\\s*$')


/***/ }),

/***/ 1777:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

// @ts-check


// Reproduce safeRe[COMPARATORTRIM] replacement boundaries, not version
// validation. Each end-index finder returns an exclusive end, or its start
// on no match.
// Positions count from zero. An end of 3 means characters 0, 1, and 2 were read;
// range.slice(start, end) gives the matched text, not a converted number.
const {
  MAX_LENGTH,
  MAX_SAFE_BUILD_LENGTH,
  WHITESPACE_CHARACTERS,
} = __nccwpck_require__(5733)

/**
 * Remembers the last two rows of digits so their characters need not be reread.
 * Positions start at -1 until a row has been found.
 *
 * @typedef {object} DigitRunCache
 * @property {number} start The first character of the most recently found row.
 * @property {number} end The position after that row's last character.
 * @property {number} previousStart The first character of the previous row.
 * @property {number} previousEnd The position after the previous row.
 */

// One entry per UTF-16 code unit keeps membership checks constant-time.
const whitespace = new Uint8Array(0x10000)
for (const char of WHITESPACE_CHARACTERS) {
  whitespace[char.charCodeAt(0)] = 1
}

/**
 * Checks whether a character is whitespace, like a space, tab, or newline.
 * Looking past the end of the string returns false.
 *
 * @param {string|undefined} char One character, or undefined past the string's end.
 * @returns {boolean} Whether the character is whitespace.
 * @example isWhitespace(' ') // true
 * @example isWhitespace('1') // false
 */
const isWhitespace = char =>
  char !== undefined && whitespace[char.charCodeAt(0)] === 1

/**
 * Checks for v, =, or whitespace before the version number.
 * These are historical version prefixes, not range operators:
 * < and > are handled separately, as are tilde and caret ranges.
 *
 * @param {string|undefined} char One character to check.
 * @returns {boolean} Whether the character can belong to a version prefix.
 * @example isVersionPrefix('=') // true
 * @example isVersionPrefix('>') // false
 */
const isVersionPrefix = char =>
  char === 'v' ||
  char === '=' ||
  isWhitespace(char)

/**
 * Checks whether a character is one of the digits 0 through 9.
 *
 * @param {string|undefined} char One character to check.
 * @returns {boolean} Whether the character is an ASCII digit.
 * @example isDigit('7') // true
 * @example isDigit('.') // false
 */
const isDigit = char => char !== undefined && char >= '0' && char <= '9'

/**
 * Checks whether a character is an English letter, uppercase or lowercase.
 *
 * @param {string|undefined} char One character to check.
 * @returns {boolean} Whether the character is an ASCII letter.
 * @example isLetter('b') // true
 * @example isLetter('7') // false
 */
const isLetter = char =>
  char !== undefined && (
    (char >= 'a' && char <= 'z') ||
    (char >= 'A' && char <= 'Z')
  )

/**
 * Checks for a letter, digit, or hyphen: the characters allowed inside
 * prerelease and build names such as beta-1.
 *
 * @param {string|undefined} char One character to check.
 * @returns {boolean} Whether the character can be part of an identifier.
 * @example isIdentifierCharacter('-') // true
 * @example isIdentifierCharacter('.') // false; dots separate identifiers
 */
const isIdentifierCharacter = char => isDigit(char) || isLetter(char) || char === '-'

/**
 * Checks whether a version component can begin here: with a digit or
 * a wildcard such as x, X, or *.
 *
 * @param {string|undefined} char One character to check.
 * @returns {boolean} Whether a number or wildcard can start with this character.
 * @example isVersionStart('x') // true
 * @example isVersionStart('v') // false; v belongs to the prefix
 */
const isVersionStart = char =>
  isDigit(char) ||
  char === 'x' ||
  char === 'X' ||
  char === '*'

/**
 * Finds the end of a row of digits, but returns no more than limit digits.
 * Remembers the last two rows so looking at them again does not reread them.
 *
 * @param {string} range The text to read; it is not changed.
 * @param {number} start The position of the first character to check.
 * @param {number} limit The most digit characters the returned match can include.
 * @param {DigitRunCache} digitRuns Shared cache of digit-run positions, updated in place.
 * @returns {number} The position after the matched digits, or start if none match.
 * @example findDigitsEndIndex('123abc', 0, 10, digitRuns) // 3, pointing at a
 * @example findDigitsEndIndex('123abc', 0, 2, digitRuns) // 2, pointing at the unread 3
 */
const findDigitsEndIndex = (range, start, limit, digitRuns) => {
  if (!isDigit(range[start])) {
    return start
  }
  if (start >= digitRuns.start && start < digitRuns.end) {
    return Math.min(start + limit, digitRuns.end)
  }
  if (start >= digitRuns.previousStart && start < digitRuns.previousEnd) {
    return Math.min(start + limit, digitRuns.previousEnd)
  }
  let end = start + 1
  while (isDigit(range[end])) {
    end++
  }
  // A failed full version can rewind from its second run to its first.
  digitRuns.previousStart = digitRuns.start
  digitRuns.previousEnd = digitRuns.end
  digitRuns.start = start
  digitRuns.end = end
  return Math.min(start + limit, end)
}

/**
 * Reads a number using the old regex's length and leading-zero rules.
 * Strict mode reads just the first zero in 012; loose mode can read all three.
 *
 * @param {string} range The text to read; it is not changed.
 * @param {number} start The position where the number should begin.
 * @param {boolean} loose Whether to allow leading zeros.
 * @param {DigitRunCache} digitRuns Shared digit-run cache, updated as needed.
 * @returns {number} The position after the matched digits, not their numeric value.
 * @example findVersionNumberEndIndex('012', 0, false, digitRuns) // 1
 * @example findVersionNumberEndIndex('012', 0, true, digitRuns) // 3
 */
const findVersionNumberEndIndex = (range, start, loose, digitRuns) => {
  if (!loose && range[start] === '0') {
    return start + 1
  }
  // Strict syntax allows an initial nonzero digit plus MAX_LENGTH digits.
  return findDigitsEndIndex(range, start, loose ? MAX_LENGTH : MAX_LENGTH + 1, digitRuns)
}

/**
 * Reads one piece of a prerelease name, such as beta or 1 in beta.1.
 * Tries the letter-or-hyphen form first, then the number-only form.
 *
 * @param {string} range The text to read; it is not changed.
 * @param {number} start The position where the identifier should begin.
 * @param {boolean} loose Whether numeric identifiers may have leading zeros.
 * @param {DigitRunCache} digitRuns Shared digit-run cache, updated as needed.
 * @returns {number} The position after the identifier, or start if none matches.
 * @example findPrereleaseIdentifierEndIndex('beta.1', 0, false, digitRuns) // 4, at the dot
 * @example findPrereleaseIdentifierEndIndex('001beta', 0, false, digitRuns) // 7
 */
const findPrereleaseIdentifierEndIndex = (range, start, loose, digitRuns) => {
  const digitsEnd = findDigitsEndIndex(range, start, MAX_LENGTH, digitRuns)
  // The legacy regex tries a nonnumeric identifier before a numeric one.
  if (isLetter(range[digitsEnd]) || range[digitsEnd] === '-') {
    let end = digitsEnd + 1
    const limit = end + MAX_SAFE_BUILD_LENGTH
    while (end < limit && isIdentifierCharacter(range[end])) {
      end++
    }
    return end
  }
  return findVersionNumberEndIndex(range, start, loose, digitRuns)
}

/**
 * Reads a prerelease suffix such as -beta.1, one dot-separated piece at a time.
 * Loose mode also allows the name without its opening hyphen.
 *
 * @param {string} range The text to read; it is not changed.
 * @param {number} start The position where the suffix should begin, including -.
 * @param {boolean} loose Whether the opening hyphen is optional and zeros allowed.
 * @param {DigitRunCache} digitRuns Shared digit-run cache, updated as needed.
 * @returns {number} The position after the matched suffix, or start if absent.
 * @example findPrereleaseEndIndex('-beta.1+sha', 0, false, digitRuns) // 7, at the plus
 * @example findPrereleaseEndIndex('beta', 0, false, digitRuns) // 0; no opening hyphen
 */
const findPrereleaseEndIndex = (range, start, loose, digitRuns) => {
  const hyphen = range[start] === '-'
  if (!loose && !hyphen) {
    return start
  }
  const identifierStart = start + (hyphen ? 1 : 0)
  let end = findPrereleaseIdentifierEndIndex(range, identifierStart, loose, digitRuns)
  if (end === identifierStart) {
    if (!loose || !hyphen) {
      return start
    }
    // In loose syntax, a lone hyphen can itself be the identifier.
    end = findPrereleaseIdentifierEndIndex(range, start, loose, digitRuns)
  }
  while (range[end] === '.') {
    const next = findPrereleaseIdentifierEndIndex(range, end + 1, loose, digitRuns)
    if (next === end + 1) {
      break
    }
    end = next
  }
  return end
}

/**
 * Reads one build-name piece, such as sha or 123 in +sha.123.
 * Stops at a disallowed character or the old regex's length limit.
 *
 * @param {string} range The text to read; it is not changed.
 * @param {number} start The position where the identifier should begin.
 * @returns {number} The position after the identifier, or start if none matches.
 * @example findBuildIdentifierEndIndex('sha.123', 0) // 3, at the dot
 * @example findBuildIdentifierEndIndex('001', 0) // 3; leading zeros are allowed
 */
const findBuildIdentifierEndIndex = (range, start) => {
  let end = start
  while (end - start < MAX_SAFE_BUILD_LENGTH && isIdentifierCharacter(range[end])) {
    end++
  }
  return end
}

/**
 * Reads optional build metadata such as +sha.123.
 * Leaves the position unchanged if there is no plus sign followed by a name.
 *
 * @param {string} range The text to read; it is not changed.
 * @param {number} start The position where the opening + should be.
 * @returns {number} The position after the matched metadata, or start if absent.
 * @example findBuildEndIndex('+sha.123 <2', 0) // 8, at the space
 * @example findBuildEndIndex('+', 0) // 0; a plus sign alone is not a match
 */
const findBuildEndIndex = (range, start) => {
  if (range[start] !== '+') {
    return start
  }
  let end = findBuildIdentifierEndIndex(range, start + 1)
  if (end === start + 1) {
    return start
  }
  while (range[end] === '.') {
    const next = findBuildIdentifierEndIndex(range, end + 1)
    if (next === end + 1) {
      break
    }
    end = next
  }
  return end
}

/**
 * Reads three numbers separated by dots, then any prerelease and build suffixes.
 * Uses loose rules, so forms such as 01.02.03beta can match here.
 *
 * @param {string} range The text to read; it is not changed.
 * @param {number} start The position of the first number, after any prefix.
 * @param {DigitRunCache} digitRuns Shared digit-run cache, updated as needed.
 * @returns {number} The position after the version match, or start if none matches.
 * @example findLooseFullVersionEndIndex('1.2.3-beta+sha <2', 0, digitRuns) // 14
 * @example findLooseFullVersionEndIndex('1.2', 0, digitRuns) // 0; needs three numbers
 */
const findLooseFullVersionEndIndex = (range, start, digitRuns) => {
  let end = start
  for (let component = 0; component < 3; component++) {
    const next = findVersionNumberEndIndex(range, end, true, digitRuns)
    if (next === end) {
      return start
    }
    end = next
    if (component < 2) {
      if (range[end] !== '.') {
        return start
      }
      end++
    }
  }
  const prereleaseEnd = findPrereleaseEndIndex(range, end, true, digitRuns)
  return findBuildEndIndex(range, prereleaseEnd)
}

/**
 * Reads one component of a partial or wildcard version, such as 2 or x in 2.x.
 * Numbers use strict leading-zero rules; wildcards take up one character.
 *
 * @param {string} range The text to read; it is not changed.
 * @param {number} start The position where the component should begin.
 * @param {DigitRunCache} digitRuns Shared digit-run cache, updated as needed.
 * @returns {number} The position after the component, or start if none matches.
 * @example findPartialVersionComponentEndIndex('2.x', 0, digitRuns) // 1, at the dot
 * @example findPartialVersionComponentEndIndex('2.x', 2, digitRuns) // 3, after x
 */
const findPartialVersionComponentEndIndex = (range, start, digitRuns) => {
  if (isDigit(range[start])) {
    return findVersionNumberEndIndex(range, start, false, digitRuns)
  }
  return isVersionStart(range[start]) ? start + 1 : start
}

/**
 * Reads up to three components, allowing forms such as 1, 1.2, or 1.x.
 * After the third component, also reads any strict prerelease and build suffixes.
 *
 * @param {string} range The text to read; it is not changed.
 * @param {number} start The position of a number or wildcard, after any prefix.
 * @param {DigitRunCache} digitRuns Shared digit-run cache, updated as needed.
 * @returns {number} The position after the matched version text.
 * @example findPartialVersionEndIndex('1.x <2', 0, digitRuns) // 3, at the space
 * @example findPartialVersionEndIndex('1.', 0, digitRuns) // 1; the trailing dot is unread
 */
const findPartialVersionEndIndex = (range, start, digitRuns) => {
  let end = findPartialVersionComponentEndIndex(range, start, digitRuns)
  for (let component = 0; component < 2; component++) {
    if (range[end] !== '.') {
      return end
    }
    const next = findPartialVersionComponentEndIndex(range, end + 1, digitRuns)
    if (next === end + 1) {
      return end
    }
    end = next
  }
  const prereleaseEnd = findPrereleaseEndIndex(range, end, false, digitRuns)
  return findBuildEndIndex(range, prereleaseEnd)
}

/**
 * Finds where a version match ends, without deciding whether the range is valid.
 * Tries a loose full version first, then a partial or wildcard version, just
 * like the old regex's LOOSEPLAIN and XRANGEPLAIN alternatives.
 *
 * @param {string} range The text to read; it is not changed.
 * @param {number} start The position of a number or wildcard, after any prefix.
 * @param {DigitRunCache} digitRuns Shared digit-run cache, updated as needed.
 * @returns {number} The position where scanning the next candidate can resume.
 * @example findVersionEndIndex('1.2.3 <2', 0, digitRuns) // 5, at the space
 * @example findVersionEndIndex('1.x <2', 0, digitRuns) // 3, at the space
 */
const findVersionEndIndex = (range, start, digitRuns) => {
  const fullVersionEnd = findLooseFullVersionEndIndex(range, start, digitRuns)
  return fullVersionEnd !== start
    ? fullVersionEnd
    : findPartialVersionEndIndex(range, start, digitRuns)
}

/**
 * Finds the one whitespace character the old replacement would remove.
 * Keeps leading whitespace, skips an optional operator, and checks immediately
 * after it. Returns -1 if there is nothing to remove.
 *
 * @param {string} range The text containing a candidate already found by the caller.
 * @param {number} matchStart The candidate's position, including leading whitespace.
 * @returns {number} The position of the removable whitespace, or -1 if absent.
 * @example findRemovableWhitespaceIndex(' > 1', 0) // 2; keep the space at position 0
 * @example findRemovableWhitespaceIndex('>1', 0) // -1
 */
const findRemovableWhitespaceIndex = (range, matchStart) => {
  let position = matchStart
  if (isWhitespace(range[position])) {
    position++
  }
  if (range[position] === '<' || range[position] === '>') {
    position++
  }
  if (range[position] === '=') {
    position++
  }
  return isWhitespace(range[position]) ? position : -1
}

/**
 * Joins an operator to its version, turning > 1.2.3 into >1.2.3.
 * Copies everything else according to the old regex's matching rules.
 * Moves forward through prefixes and whole versions to avoid repeatedly
 * searching the same characters on long inputs.
 *
 * @param {string} range The range text to process; the original string is unchanged.
 * @returns {string} The range with matched operator whitespace removed.
 * @example trimComparatorWhitespace('> 1.2.3 < 2') // '>1.2.3 <2'
 * @example trimComparatorWhitespace('> invalid') // '> invalid'
 */
const trimComparatorWhitespace = range => {
  let result = ''
  let copyFrom = 0
  let cursor = 0
  const digitRuns = { start: -1, end: -1, previousStart: -1, previousEnd: -1 }

  while (cursor < range.length) {
    const matchStart = cursor
    if (range[cursor] === '<' || range[cursor] === '>') {
      cursor++
    } else if (!isVersionPrefix(range[cursor]) && !isVersionStart(range[cursor])) {
      cursor++
      continue
    }

    // Consume a v/=/whitespace run once, even when no version follows it.
    while (cursor < range.length && isVersionPrefix(range[cursor])) {
      cursor++
    }
    if (!isVersionStart(range[cursor])) {
      continue
    }

    const whitespacePosition = findRemovableWhitespaceIndex(range, matchStart)
    if (whitespacePosition !== -1) {
      result += range.slice(copyFrom, whitespacePosition)
      copyFrom = whitespacePosition + 1
    }

    // Skip the entire match, so a prerelease's trailing v cannot be
    // reconsidered as the prefix of another version.
    cursor = findVersionEndIndex(range, cursor, digitRuns)
  }

  return result + range.slice(copyFrom)
}

module.exports = trimComparatorWhitespace


/***/ }),

/***/ 940:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



// Determine if version is greater than all the versions possible in the range.
const outside = __nccwpck_require__(5472)
const gtr = (version, range, options) => outside(version, range, '>', options)
module.exports = gtr


/***/ }),

/***/ 6465:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const Range = __nccwpck_require__(9046)
const intersects = (r1, r2, options) => {
  r1 = new Range(r1, options)
  r2 = new Range(r2, options)
  return r1.intersects(r2, options)
}
module.exports = intersects


/***/ }),

/***/ 9605:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const outside = __nccwpck_require__(5472)
// Determine if version is less than all the versions possible in the range
const ltr = (version, range, options) => outside(version, range, '<', options)
module.exports = ltr


/***/ }),

/***/ 5377:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const SemVer = __nccwpck_require__(1603)
const Range = __nccwpck_require__(9046)

const maxSatisfying = (versions, range, options) => {
  let max = null
  let maxSV = null
  let rangeObj = null
  try {
    rangeObj = new Range(range, options)
  } catch (er) {
    return null
  }
  versions.forEach((v) => {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!max || maxSV.compare(v) === -1) {
        // compare(max, v, true)
        max = v
        maxSV = new SemVer(max, options)
      }
    }
  })
  return max
}
module.exports = maxSatisfying


/***/ }),

/***/ 2235:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const SemVer = __nccwpck_require__(1603)
const Range = __nccwpck_require__(9046)
const minSatisfying = (versions, range, options) => {
  let min = null
  let minSV = null
  let rangeObj = null
  try {
    rangeObj = new Range(range, options)
  } catch (er) {
    return null
  }
  versions.forEach((v) => {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!min || minSV.compare(v) === 1) {
        // compare(min, v, true)
        min = v
        minSV = new SemVer(min, options)
      }
    }
  })
  return min
}
module.exports = minSatisfying


/***/ }),

/***/ 2210:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const SemVer = __nccwpck_require__(1603)
const Range = __nccwpck_require__(9046)
const gt = __nccwpck_require__(5743)

const minVersion = (range, loose) => {
  range = new Range(range, loose)

  let minver = new SemVer('0.0.0')
  if (range.test(minver)) {
    return minver
  }

  minver = new SemVer('0.0.0-0')
  if (range.test(minver)) {
    return minver
  }

  minver = null
  for (let i = 0; i < range.set.length; ++i) {
    const comparators = range.set[i]

    let setMin = null
    comparators.forEach((comparator) => {
      // Clone to avoid manipulating the comparator's semver object.
      const compver = new SemVer(comparator.semver.version)
      switch (comparator.operator) {
        case '>':
          if (compver.prerelease.length === 0) {
            compver.patch++
          } else {
            compver.prerelease.push(0)
          }
          compver.raw = compver.format()
          /* fallthrough */
        case '':
        case '>=':
          if (!setMin || gt(compver, setMin)) {
            setMin = compver
          }
          break
        case '<':
        case '<=':
          /* Ignore maximum versions */
          break
        /* istanbul ignore next */
        default:
          throw new Error(`Unexpected operation: ${comparator.operator}`)
      }
    })
    if (setMin && (!minver || gt(minver, setMin))) {
      minver = setMin
    }
  }

  if (minver && range.test(minver)) {
    return minver
  }

  return null
}
module.exports = minVersion


/***/ }),

/***/ 5472:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const SemVer = __nccwpck_require__(1603)
const Comparator = __nccwpck_require__(5275)
const { ANY } = Comparator
const Range = __nccwpck_require__(9046)
const satisfies = __nccwpck_require__(883)
const gt = __nccwpck_require__(5743)
const lt = __nccwpck_require__(3896)
const lte = __nccwpck_require__(7221)
const gte = __nccwpck_require__(972)

const outside = (version, range, hilo, options) => {
  version = new SemVer(version, options)
  range = new Range(range, options)

  let gtfn, ltefn, ltfn, comp, ecomp
  switch (hilo) {
    case '>':
      gtfn = gt
      ltefn = lte
      ltfn = lt
      comp = '>'
      ecomp = '>='
      break
    case '<':
      gtfn = lt
      ltefn = gte
      ltfn = gt
      comp = '<'
      ecomp = '<='
      break
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"')
  }

  // If it satisfies the range it is not outside
  if (satisfies(version, range, options)) {
    return false
  }

  // From now on, variable terms are as if we're in "gtr" mode.
  // but note that everything is flipped for the "ltr" function.

  for (let i = 0; i < range.set.length; ++i) {
    const comparators = range.set[i]

    let high = null
    let low = null

    comparators.forEach((comparator) => {
      if (comparator.semver === ANY) {
        comparator = new Comparator('>=0.0.0')
      }
      high = high || comparator
      low = low || comparator
      if (gtfn(comparator.semver, high.semver, options)) {
        high = comparator
      } else if (ltfn(comparator.semver, low.semver, options)) {
        low = comparator
      }
    })

    // If the edge version comparator has a operator then our version
    // isn't outside it
    if (high.operator === comp || high.operator === ecomp) {
      return false
    }

    // If the lowest version comparator has an operator and our version
    // is less than it then it isn't higher than the range
    if ((!low.operator || low.operator === comp) &&
        ltefn(version, low.semver)) {
      return false
    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
      return false
    }
  }
  return true
}

module.exports = outside


/***/ }),

/***/ 7076:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



// given a set of versions and a range, create a "simplified" range
// that includes the same versions that the original range does
// If the original range is shorter than the simplified one, return that.
const satisfies = __nccwpck_require__(883)
const compare = __nccwpck_require__(6061)
module.exports = (versions, range, options) => {
  const set = []
  let first = null
  let prev = null
  const v = versions.sort((a, b) => compare(a, b, options))
  for (const version of v) {
    const included = satisfies(version, range, options)
    if (included) {
      prev = version
      if (!first) {
        first = version
      }
    } else {
      if (prev) {
        set.push([first, prev])
      }
      prev = null
      first = null
    }
  }
  if (first) {
    set.push([first, null])
  }

  const ranges = []
  for (const [min, max] of set) {
    if (min === max) {
      ranges.push(min)
    } else if (!max && min === v[0]) {
      ranges.push('*')
    } else if (!max) {
      ranges.push(`>=${min}`)
    } else if (min === v[0]) {
      ranges.push(`<=${max}`)
    } else {
      ranges.push(`${min} - ${max}`)
    }
  }
  const simplified = ranges.join(' || ')
  const original = typeof range.raw === 'string' ? range.raw : String(range)
  return simplified.length < original.length ? simplified : range
}


/***/ }),

/***/ 6585:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const Range = __nccwpck_require__(9046)
const Comparator = __nccwpck_require__(5275)
const { ANY } = Comparator
const satisfies = __nccwpck_require__(883)
const compare = __nccwpck_require__(6061)

// Complex range `r1 || r2 || ...` is a subset of `R1 || R2 || ...` iff:
// - Every simple range `r1, r2, ...` is a null set, OR
// - Every simple range `r1, r2, ...` which is not a null set is a subset of
//   some `R1, R2, ...`
//
// Simple range `c1 c2 ...` is a subset of simple range `C1 C2 ...` iff:
// - If c is only the ANY comparator
//   - If C is only the ANY comparator, return true
//   - Else if in prerelease mode, return false
//   - else replace c with `[>=0.0.0]`
// - If C is only the ANY comparator
//   - if in prerelease mode, return true
//   - else replace C with `[>=0.0.0]`
// - Let EQ be the set of = comparators in c
// - If EQ is more than one, return true (null set)
// - Let GT be the highest > or >= comparator in c
// - Let LT be the lowest < or <= comparator in c
// - If GT and LT, and GT.semver > LT.semver, return true (null set)
// - If any C is a = range, and GT or LT are set, return false
// - If EQ
//   - If GT, and EQ does not satisfy GT, return true (null set)
//   - If LT, and EQ does not satisfy LT, return true (null set)
//   - If EQ satisfies every C, return true
//   - Else return false
// - If GT
//   - If GT.semver is lower than any > or >= comp in C, return false
//   - If GT is >=, and GT.semver does not satisfy every C, return false
//   - If GT.semver has a prerelease, and not in prerelease mode
//     - If no C has a prerelease and the GT.semver tuple, return false
// - If LT
//   - If LT.semver is greater than any < or <= comp in C, return false
//   - If LT is <=, and LT.semver does not satisfy every C, return false
//   - If LT.semver has a prerelease, and not in prerelease mode
//     - If no C has a prerelease and the LT.semver tuple, return false
// - Else return true

const subset = (sub, dom, options = {}) => {
  if (sub === dom) {
    return true
  }

  sub = new Range(sub, options)
  dom = new Range(dom, options)
  let sawNonNull = false

  OUTER: for (const simpleSub of sub.set) {
    for (const simpleDom of dom.set) {
      const isSub = simpleSubset(simpleSub, simpleDom, options)
      sawNonNull = sawNonNull || isSub !== null
      if (isSub) {
        continue OUTER
      }
    }
    // the null set is a subset of everything, but null simple ranges in
    // a complex range should be ignored.  so if we saw a non-null range,
    // then we know this isn't a subset, but if EVERY simple range was null,
    // then it is a subset.
    if (sawNonNull) {
      return false
    }
  }
  return true
}

const minimumVersionWithPreRelease = [new Comparator('>=0.0.0-0')]
const minimumVersion = [new Comparator('>=0.0.0')]

const simpleSubset = (sub, dom, options) => {
  if (sub === dom) {
    return true
  }

  if (sub.length === 1 && sub[0].semver === ANY) {
    if (dom.length === 1 && dom[0].semver === ANY) {
      return true
    } else if (options.includePrerelease) {
      sub = minimumVersionWithPreRelease
    } else {
      sub = minimumVersion
    }
  }

  if (dom.length === 1 && dom[0].semver === ANY) {
    if (options.includePrerelease) {
      return true
    } else {
      dom = minimumVersion
    }
  }

  const eqSet = new Set()
  let gt, lt
  for (const c of sub) {
    if (c.operator === '>' || c.operator === '>=') {
      gt = higherGT(gt, c, options)
    } else if (c.operator === '<' || c.operator === '<=') {
      lt = lowerLT(lt, c, options)
    } else {
      eqSet.add(c.semver)
    }
  }

  if (eqSet.size > 1) {
    return null
  }

  let gtltComp
  if (gt && lt) {
    gtltComp = compare(gt.semver, lt.semver, options)
    if (gtltComp > 0) {
      return null
    } else if (gtltComp === 0 && (gt.operator !== '>=' || lt.operator !== '<=')) {
      return null
    }
  }

  // will iterate one or zero times
  for (const eq of eqSet) {
    if (gt && !satisfies(eq, String(gt), options)) {
      return null
    }

    if (lt && !satisfies(eq, String(lt), options)) {
      return null
    }

    for (const c of dom) {
      if (!satisfies(eq, String(c), options)) {
        return false
      }
    }

    return true
  }

  let higher, lower
  let hasDomLT, hasDomGT
  // if the subset has a prerelease, we need a comparator in the superset
  // with the same tuple and a prerelease, or it's not a subset
  let needDomLTPre = lt &&
    !options.includePrerelease &&
    lt.semver.prerelease.length ? lt.semver : false
  let needDomGTPre = gt &&
    !options.includePrerelease &&
    gt.semver.prerelease.length ? gt.semver : false
  // exception: <1.2.3-0 is the same as <1.2.3
  if (needDomLTPre && needDomLTPre.prerelease.length === 1 &&
      lt.operator === '<' && needDomLTPre.prerelease[0] === 0) {
    needDomLTPre = false
  }

  for (const c of dom) {
    hasDomGT = hasDomGT || c.operator === '>' || c.operator === '>='
    hasDomLT = hasDomLT || c.operator === '<' || c.operator === '<='
    if (gt) {
      if (needDomGTPre) {
        if (c.semver.prerelease && c.semver.prerelease.length &&
            c.semver.major === needDomGTPre.major &&
            c.semver.minor === needDomGTPre.minor &&
            c.semver.patch === needDomGTPre.patch) {
          needDomGTPre = false
        }
      }
      if (c.operator === '>' || c.operator === '>=') {
        higher = higherGT(gt, c, options)
        if (higher === c && higher !== gt) {
          return false
        }
      } else if (gt.operator === '>=' && !c.test(gt.semver)) {
        return false
      }
    }
    if (lt) {
      if (needDomLTPre) {
        if (c.semver.prerelease && c.semver.prerelease.length &&
            c.semver.major === needDomLTPre.major &&
            c.semver.minor === needDomLTPre.minor &&
            c.semver.patch === needDomLTPre.patch) {
          needDomLTPre = false
        }
      }
      if (c.operator === '<' || c.operator === '<=') {
        lower = lowerLT(lt, c, options)
        if (lower === c && lower !== lt) {
          return false
        }
      } else if (lt.operator === '<=' && !c.test(lt.semver)) {
        return false
      }
    }
    if (!c.operator && (lt || gt) && gtltComp !== 0) {
      return false
    }
  }

  // if there was a < or >, and nothing in the dom, then must be false
  // UNLESS it was limited by another range in the other direction.
  // Eg, >1.0.0 <1.0.1 is still a subset of <2.0.0
  if (gt && hasDomLT && !lt && gtltComp !== 0) {
    return false
  }

  if (lt && hasDomGT && !gt && gtltComp !== 0) {
    return false
  }

  // we needed a prerelease range in a specific tuple, but didn't get one
  // then this isn't a subset.  eg >=1.2.3-pre is not a subset of >=1.0.0,
  // because it includes prereleases in the 1.2.3 tuple
  if (needDomGTPre || needDomLTPre) {
    return false
  }

  return true
}

// >=1.2.3 is lower than >1.2.3
const higherGT = (a, b, options) => {
  if (!a) {
    return b
  }
  const comp = compare(a.semver, b.semver, options)
  return comp > 0 ? a
    : comp < 0 ? b
    : b.operator === '>' && a.operator === '>=' ? b
    : a
}

// <=1.2.3 is higher than <1.2.3
const lowerLT = (a, b, options) => {
  if (!a) {
    return b
  }
  const comp = compare(a.semver, b.semver, options)
  return comp < 0 ? a
    : comp > 0 ? b
    : b.operator === '<' && a.operator === '<=' ? b
    : a
}

module.exports = subset


/***/ }),

/***/ 9830:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const Range = __nccwpck_require__(9046)

// Mostly just for testing and legacy API reasons
const toComparators = (range, options) =>
  new Range(range, options).set
    .map(comp => comp.map(c => c.value).join(' ').trim().split(' '))

module.exports = toComparators


/***/ }),

/***/ 7705:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const Range = __nccwpck_require__(9046)
const validRange = (range, options) => {
  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return new Range(range, options).range || '*'
  } catch (er) {
    return null
  }
}
module.exports = validRange


/***/ }),

/***/ 2421:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BUMP_TARGETS = exports.CHANGELOG_MODE = exports.CHANGELOG_PATH = exports.TARGET_PATH = exports.GIT_TAG = exports.TARGET_PLATFORM = exports.RELEASE_TYPE = void 0;
const core = __importStar(__nccwpck_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module '@actions/core'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
const utils_1 = __nccwpck_require__(5184);
exports.RELEASE_TYPE = (core.getInput('release_type') || 'patch');
exports.TARGET_PLATFORM = core.getInput('target_platform');
exports.GIT_TAG = core.getInput('git_tag') === 'true';
exports.TARGET_PATH = core.getInput('target_path') || '.';
exports.CHANGELOG_PATH = core.getInput('changelog_path') || 'CHANGELOG.md';
exports.CHANGELOG_MODE = core.getInput('changelog_mode') || 'auto';
exports.BUMP_TARGETS = (0, utils_1.safeParseJSON)(core.getInput('bump_targets'));


/***/ }),

/***/ 1967:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InvalidManifestError = exports.FileNotFoundError = exports.VersionBumpError = exports.PlatformDetectionError = void 0;
/**
 * Base class for custom errors.
 */
class CustomError extends Error {
    constructor(message, name) {
        super(message);
        this.name = name;
    }
}
/**
 * Error thrown when platform detection fails.
 */
class PlatformDetectionError extends CustomError {
    constructor(message) {
        super(message, 'PlatformDetectionError');
    }
}
exports.PlatformDetectionError = PlatformDetectionError;
/**
 * Error thrown when version bumping fails.
 */
class VersionBumpError extends CustomError {
    constructor(message) {
        super(message, 'VersionBumpError');
    }
}
exports.VersionBumpError = VersionBumpError;
/**
 * Error thrown when a file is not found.
 */
class FileNotFoundError extends CustomError {
    constructor(message) {
        super(message, 'FileNotFoundError');
    }
}
exports.FileNotFoundError = FileNotFoundError;
/**
 * Error thrown when a manifest file is invalid.
 */
class InvalidManifestError extends CustomError {
    constructor(message) {
        super(message, 'InvalidManifestError');
    }
}
exports.InvalidManifestError = InvalidManifestError;


/***/ }),

/***/ 5522:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.run = run;
const services_1 = __nccwpck_require__(2123);
const utils_1 = __nccwpck_require__(5184);
const registry_1 = __nccwpck_require__(1200);
const errors_1 = __nccwpck_require__(1967);
const config_1 = __nccwpck_require__(2421);
const core = __importStar(__nccwpck_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module '@actions/core'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
async function initializeServices() {
    const updaterRegistry = new registry_1.UpdaterRegistry();
    await updaterRegistry.loadUpdaters();
    const updaterService = new services_1.UpdaterService(updaterRegistry);
    const gitService = new services_1.GitService('main');
    const fileHandler = new utils_1.FileHandler();
    if (config_1.CHANGELOG_MODE !== 'auto' && config_1.CHANGELOG_MODE !== 'fail') {
        throw new Error(`Invalid changelog_mode: ${config_1.CHANGELOG_MODE}. Expected 'auto' or 'fail'.`);
    }
    const changelogService = new services_1.ChangelogService(fileHandler, gitService, config_1.CHANGELOG_PATH, config_1.CHANGELOG_MODE);
    return {
        updaterRegistry,
        updaterService,
        gitService,
        fileHandler,
        changelogService,
    };
}
async function run() {
    try {
        process.chdir(config_1.TARGET_PATH);
        const releaseType = config_1.RELEASE_TYPE;
        const targetPlatform = config_1.TARGET_PLATFORM;
        const bumpTargets = config_1.BUMP_TARGETS;
        const { updaterService, gitService, changelogService } = await initializeServices();
        const platform = updaterService.getPlatform(targetPlatform);
        core.info(`Detected platform: ${platform}`);
        core.info(`Bump targets: ${JSON.stringify(bumpTargets)}`);
        const version = updaterService.updateVersion(platform, releaseType, bumpTargets);
        core.setOutput('new_version', version);
        // Generate and update changelog
        const latestTag = await gitService.getLatestTag();
        const commits = await gitService.getCommitsSinceTag(latestTag);
        const changelogContent = changelogService.generateChangelog(commits, version);
        await changelogService.updateChangelog(changelogContent);
        // Git Commit & Tag
        const gitTag = config_1.GIT_TAG;
        await gitService.configureGitUser();
        const branch = await gitService.createReleaseBranch(version);
        if (branch) {
            core.info(`✅ Created branch: ${branch}`);
            const prUrl = await gitService.createPullRequest(branch, version);
            core.info(`✅ PR created: ${prUrl}`);
        }
        if (gitTag) {
            await gitService.createAndPushTag(version);
        }
    }
    catch (error) {
        handleError(error);
    }
}
function handleError(error) {
    if (error instanceof errors_1.PlatformDetectionError) {
        core.setFailed(`Platform detection failed: ${error.message}`);
    }
    else if (error instanceof errors_1.VersionBumpError) {
        core.setFailed(`Version bump failed: ${error.message}`);
    }
    else if (error instanceof errors_1.FileNotFoundError) {
        core.setFailed(`File not found: ${error.message}`);
    }
    else if (error instanceof errors_1.InvalidManifestError) {
        core.setFailed(`Invalid manifest: ${error.message}`);
    }
    else if (error instanceof Error) {
        core.setFailed(error.message);
    }
    else {
        core.setFailed(String(error));
    }
}
run();


/***/ }),

/***/ 1200:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(6446), exports);


/***/ }),

/***/ 6446:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdaterRegistry = void 0;
const updaters_1 = __nccwpck_require__(3025);
/**
 * Registry for managing updaters.
 */
class UpdaterRegistry {
    constructor() {
        this.updaters = new Map();
    }
    /**
     * Loads and registers all updaters.
     */
    async loadUpdaters() {
        this.registerUpdater(new updaters_1.DockerUpdater());
        this.registerUpdater(new updaters_1.GoUpdater());
        this.registerUpdater(new updaters_1.NodeUpdater());
        this.registerUpdater(new updaters_1.PHPUpdater());
        this.registerUpdater(new updaters_1.PythonUpdater());
        this.registerUpdater(new updaters_1.RustUpdater());
        this.registerUpdater(new updaters_1.DenoUpdater());
        this.registerUpdater(new updaters_1.JavaUpdater());
        this.registerUpdater(new updaters_1.DotNetUpdater());
        this.registerUpdater(new updaters_1.RubyUpdater());
        this.registerUpdater(new updaters_1.DartUpdater());
        this.registerUpdater(new updaters_1.CustomUpdater());
    }
    /**
     * Registers a new updater.
     * @param updater The updater to register.
     */
    registerUpdater(updater) {
        this.updaters.set(updater.platform, updater);
    }
    /**
     * Gets the updater for the specified platform.
     * @param platform The platform to get the updater for.
     * @returns The updater for the specified platform or undefined if not found.
     */
    getUpdater(platform) {
        return this.updaters.get(platform);
    }
    /**
     * Gets all registered updaters.
     * @returns An array of all registered updaters.
     */
    getAllUpdaters() {
        return Array.from(this.updaters.values());
    }
}
exports.UpdaterRegistry = UpdaterRegistry;


/***/ }),

/***/ 3018:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ChangelogService = void 0;
const core = __importStar(__nccwpck_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module '@actions/core'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
const errors_1 = __nccwpck_require__(1967);
/**
 * Service for managing the changelog file.
 */
class ChangelogService {
    constructor(fileHandler, gitService, changelogPath = 'CHANGELOG.md', changelogMode = 'auto') {
        this.fileHandler = fileHandler;
        this.gitService = gitService;
        this.changelogPath = changelogPath;
        this.changelogMode = changelogMode;
    }
    /**
     * Generate a changelog from the given commits.
     * @param commits The list of commits to include in the changelog.
     * @param newVersion The new version number.
     * @returns The generated changelog as a string.
     */
    generateChangelog(commits, newVersion) {
        const changelogDate = new Date().toISOString().split('T')[0];
        let changelogContent = `## v${newVersion} ${changelogDate}\n\n`;
        const categorizedCommits = { Added: [], Changed: [], Fixed: [] };
        for (const commit of commits) {
            const commitMessage = commit.split(' ').slice(1).join(' ');
            const messageParts = commitMessage.split(':');
            const message = messageParts.length > 1 ? messageParts.slice(1).join(':').trim() : commitMessage;
            if (commitMessage.startsWith('feat') || commitMessage.startsWith('Added')) {
                categorizedCommits.Added.push(`- ${message}`);
            }
            else if (commitMessage.startsWith('fix') || commitMessage.startsWith('Fixed')) {
                categorizedCommits.Fixed.push(`- ${message}`);
            }
            else {
                categorizedCommits.Changed.push(`- ${message}`);
            }
        }
        for (const category in categorizedCommits) {
            if (categorizedCommits[category].length > 0) {
                changelogContent += `### ${category}\n\n`;
                changelogContent += categorizedCommits[category].join('\n') + '\n\n';
            }
        }
        return changelogContent;
    }
    /**
     * Update the changelog file with the new content.
     * @param changelogContent The new changelog content to add.
     */
    async updateChangelog(changelogContent) {
        const changelogPath = this._getChangelogPath();
        let existingChangelog;
        try {
            existingChangelog = await this.fileHandler.readFile(changelogPath);
        }
        catch (error) {
            if (error instanceof errors_1.FileNotFoundError) {
                if (this.changelogMode === 'fail') {
                    throw new errors_1.FileNotFoundError(`Changelog file not found at ${changelogPath}`);
                }
                existingChangelog = '# Changelog\n\n---\n\n';
            }
            else {
                throw error;
            }
        }
        const versionMatch = changelogContent.match(/## v(\d+\.\d+\.\d+)/);
        if (versionMatch) {
            const newVersion = versionMatch[0];
            if (this._versionExistsInChangelog(existingChangelog, newVersion)) {
                core.info(`Changelog for version ${newVersion} already exists. Skipping.`);
                return;
            }
        }
        const updatedChangelog = this._insertChangelogContent(existingChangelog, changelogContent);
        await this.fileHandler.writeFile(changelogPath, updatedChangelog);
    }
    _getChangelogPath() {
        return this.changelogPath;
    }
    _versionExistsInChangelog(existingChangelog, newVersion) {
        return existingChangelog.includes(newVersion);
    }
    _insertChangelogContent(existingChangelog, changelogContent) {
        const separator = '\n---\n\n';
        const headerIndex = existingChangelog.indexOf(separator);
        if (headerIndex !== -1) {
            const header = existingChangelog.substring(0, headerIndex + separator.length);
            const contentAfterHeader = existingChangelog.substring(headerIndex + separator.length);
            const firstVersionIndex = contentAfterHeader.search(/## v\d+\.\d+\.\d+/);
            if (firstVersionIndex !== -1) {
                const oldChangelog = contentAfterHeader.substring(firstVersionIndex);
                return header + changelogContent + oldChangelog;
            }
            else {
                // No version found after header, so just append the new changelog
                return header + changelogContent;
            }
        }
        else {
            // No separator found, so prepend the new changelog
            return changelogContent + existingChangelog;
        }
    }
}
exports.ChangelogService = ChangelogService;


/***/ }),

/***/ 4240:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomUpdaterService = void 0;
const errors_1 = __nccwpck_require__(1967);
const updaters_1 = __nccwpck_require__(3025);
/**
 * Service for handling custom version updates.
 */
class CustomUpdaterService {
    /**
     * Updates the version for the specified bump targets.
     * @param releaseType The type of release (major, minor, patch).
     * @param bumpTargets The targets to bump.
     * @returns The new version string.
     */
    updateCustomVersions(releaseType, bumpTargets) {
        if (bumpTargets.length === 0) {
            throw new errors_1.VersionBumpError('No bump_targets provided for custom platform.');
        }
        let lastBumpedVersion = '';
        for (const target of bumpTargets) {
            if (!target.path || !target.variable) {
                throw new errors_1.VersionBumpError('Invalid bump_target provided for custom platform.');
            }
            const customUpdater = new updaters_1.CustomUpdater(target.path, target.variable);
            lastBumpedVersion = customUpdater.bumpVersion(releaseType);
        }
        return lastBumpedVersion;
    }
}
exports.CustomUpdaterService = CustomUpdaterService;


/***/ }),

/***/ 9172:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GitService = void 0;
const exec = __importStar(__nccwpck_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module '@actions/exec'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
const core = __importStar(__nccwpck_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module '@actions/core'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
const github = __importStar(__nccwpck_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module '@actions/github'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
/**
 * Service for interacting with Git.
 */
class GitService {
    constructor(baseBranch = 'main') {
        this.baseBranch = baseBranch;
    }
    async _execGitCommand(args, options) {
        return await exec.exec('git', args, options);
    }
    /**
     * Configures the Git user.
     */
    async configureGitUser() {
        await this._execGitCommand(['config', 'user.name', 'github-actions[bot]']);
        await this._execGitCommand([
            'config',
            'user.email',
            'github-actions[bot]@users.noreply.github.com',
        ]);
    }
    /**
     * Commits the changes with the specified commit message.
     * @param message The commit message.
     * @returns True if changes were committed, false otherwise.
     */
    async commitChanges(message) {
        await this._execGitCommand(['add', '-A']);
        try {
            await this._execGitCommand(['diff-index', '--quiet', 'HEAD']);
            core.info('⚠️ No changes to commit');
            return false;
        }
        catch {
            await this._execGitCommand(['commit', '-m', message]);
            return true;
        }
    }
    /**
     * Creates a release branch for the specified version.
     * @param version The version to create the branch for.
     * @returns The name of the created branch or null if no changes were made.
     */
    async createReleaseBranch(version) {
        const branch = `version-bump/v${version}`;
        await this._execGitCommand(['checkout', '-b', branch]);
        const committed = await this.commitChanges(`chore(release): bump version to v${version}`);
        if (!committed) {
            core.info('⚠️ Skipping branch push, no changes detected');
            return null;
        }
        await this._execGitCommand(['push', 'origin', branch, '--force']);
        return branch;
    }
    /**
     * Creates a Git tag for the specified version.
     * @param version The version to create the tag for.
     */
    async createAndPushTag(version) {
        await this._execGitCommand(['tag', `v${version}`]);
        await this._execGitCommand(['push', 'origin', 'HEAD', '--tags']);
    }
    /**
     * Get the latest git tag.
     * @returns The latest tag as a string.
     */
    async getLatestTag() {
        let latestTag = '';
        const options = {
            listeners: {
                stdout: (data) => {
                    latestTag += data.toString();
                },
            },
            ignoreReturnCode: true,
        };
        const exitCode = await this._execGitCommand(['describe', '--tags', '--abbrev=0'], options);
        if (exitCode !== 0) {
            throw new Error('No tags found in the repository. Please create a tag first.');
        }
        return latestTag.trim();
    }
    /**
     * Get the commits since a specific tag.
     * @param tag The tag to get commits since.
     * @returns An array of commit messages.
     */
    async getCommitsSinceTag(tag) {
        let commits = '';
        const options = {
            listeners: {
                stdout: (data) => {
                    commits += data.toString();
                },
            },
        };
        await this._execGitCommand(['log', `${tag}..HEAD`, '--oneline'], options);
        return commits.split('\n').filter(Boolean);
    }
    /**
     * Creates a pull request for the specified branch and version.
     * @param branch The branch to create the pull request for.
     * @param version The version to include in the pull request.
     * @returns The URL of the created pull request.
     */
    async createPullRequest(branch, version) {
        const token = process.env.GITHUB_TOKEN;
        if (!token) {
            throw new Error('❌ GITHUB_TOKEN not found in environment');
        }
        const octokit = github.getOctokit(token);
        const { owner, repo } = github.context.repo;
        const prTitle = `chore(release): bump version to v${version}`;
        const prBody = `This PR bumps the version to **v${version}** 🚀`;
        const { data: pr } = await octokit.rest.pulls.create({
            owner,
            repo,
            title: prTitle,
            head: branch,
            base: this.baseBranch,
            body: prBody,
        });
        return pr.html_url;
    }
}
exports.GitService = GitService;


/***/ }),

/***/ 2123:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(2619), exports);
__exportStar(__nccwpck_require__(9172), exports);
__exportStar(__nccwpck_require__(3018), exports);
__exportStar(__nccwpck_require__(4240), exports);


/***/ }),

/***/ 2619:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UpdaterService = void 0;
const errors_1 = __nccwpck_require__(1967);
const customUpdaterService_1 = __nccwpck_require__(4240);
/**
 * Service for managing version updates.
 */
class UpdaterService {
    /**
     * Creates an instance of the UpdaterService.
     * @param updaterRegistry The registry of updaters.
     */
    constructor(updaterRegistry) {
        this.updaterRegistry = updaterRegistry;
    }
    /**
     * Get the platform for the specified target platform.
     * @param targetPlatform The target platform to get.
     * @returns The platform string.
     */
    getPlatform(targetPlatform) {
        if (targetPlatform) {
            const updater = this.updaterRegistry.getUpdater(targetPlatform);
            if (!updater) {
                throw new errors_1.PlatformDetectionError(`Specified platform "${targetPlatform}" is not supported.`);
            }
            return updater.platform;
        }
        const detectedUpdater = this.updaterRegistry.getAllUpdaters().find((u) => u.canHandle());
        if (!detectedUpdater) {
            throw new errors_1.PlatformDetectionError('Could not detect platform. Please specify target_platform input if auto-detection fails.');
        }
        return detectedUpdater.platform;
    }
    /**
     * Update the version for the specified platform and release type.
     * @param platform The platform to update.
     * @param releaseType The type of release (major, minor, patch).
     * @returns The new version string.
     */
    updateVersion(platform, releaseType, bumpTargets = []) {
        if (platform === 'custom') {
            const customUpdaterService = new customUpdaterService_1.CustomUpdaterService();
            return customUpdaterService.updateCustomVersions(releaseType, bumpTargets);
        }
        else {
            const updater = this.updaterRegistry.getUpdater(platform);
            if (!updater) {
                throw new errors_1.VersionBumpError(`No updater found for platform: ${platform}`);
            }
            return updater.bumpVersion(releaseType);
        }
    }
}
exports.UpdaterService = UpdaterService;


/***/ }),

/***/ 6837:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CustomUpdater = void 0;
const core = __importStar(__nccwpck_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module '@actions/core'"); e.code = 'MODULE_NOT_FOUND'; throw e; }())));
const utils_1 = __nccwpck_require__(5184);
class CustomUpdater {
    constructor(filePath, variableName) {
        this.platform = 'custom';
        this.currentVersion = null;
        this.filePath = filePath || 'package.json';
        this.variableName = variableName || 'version';
        this.fileHandler = new utils_1.FileHandler();
        this.manifestParser = new utils_1.ManifestParser(this.fileHandler);
    }
    canHandle() {
        // This updater is explicitly called, so it can always handle if constructed.
        return true;
    }
    getCurrentVersion() {
        if (this.currentVersion) {
            return this.currentVersion;
        }
        try {
            const extension = this.filePath.split('.').pop() || '';
            if (extension === 'json') {
                this.currentVersion = this.manifestParser.getVersion(this.filePath, 'json', {
                    jsonPath: [this.variableName],
                });
            }
            else {
                // console.log(extension, this.filePath);
                const regex = new RegExp(`['"]?${this.variableName}['"]?\\s*(?:=|=>|:)?\\s*['"]([0-9]+\\.[0-9]+\\.[0-9]+(?:-[A-Za-z0-9_.-]+)?(?:\\+[A-Za-z0-9_.-]+)?)['"]`);
                this.currentVersion = this.manifestParser.getVersion(this.filePath, 'regex', {
                    regex,
                });
            }
            return this.currentVersion;
        }
        catch (error) {
            core.debug(`Could not read or parse version from ${this.filePath}: ${error}`);
        }
        return null;
    }
    bumpVersion(releaseType) {
        const oldVersion = this.getCurrentVersion();
        if (!oldVersion) {
            throw new Error(`Could not find current version for variable '${this.variableName}' in file '${this.filePath}'`);
        }
        const newVersion = (0, utils_1.calculateNextVersion)(oldVersion, releaseType);
        const extension = this.filePath.split('.').pop() || '';
        if (extension === 'json') {
            this.manifestParser.updateVersion(this.filePath, newVersion, 'json', {
                jsonPath: [this.variableName],
            });
        }
        else {
            const regexReplace = new RegExp(`(['"]?${this.variableName}['"]?\\s*(?:=|=>|:)?\\s*['"])([0-9]+\\.[0-9]+\\.[0-9]+(?:-[A-Za-z0-9_.-]+)?(?:\\+[A-Za-z0-9_.-]+)?)(['"])`);
            this.manifestParser.updateVersion(this.filePath, newVersion, 'regex', {
                regexReplace,
            });
        }
        core.info(`Bumped ${this.variableName} in ${this.filePath} from ${oldVersion} to ${newVersion}`);
        return newVersion;
    }
}
exports.CustomUpdater = CustomUpdater;


/***/ }),

/***/ 8939:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DartUpdater = void 0;
const utils_1 = __nccwpck_require__(5184);
/**
 * Updater for Dart and Flutter projects using pubspec.yaml.
 */
class DartUpdater {
    constructor() {
        this.platform = 'dart';
        this.manifestPath = null;
        const fileHandler = new utils_1.FileHandler();
        this.manifestParser = new utils_1.ManifestParser(fileHandler);
    }
    canHandle() {
        this.manifestPath = this.manifestParser.detectManifest(['pubspec.yaml']);
        return this.manifestPath !== null;
    }
    getCurrentVersion() {
        if (!this.manifestPath)
            return null;
        return this.manifestParser.getVersion(this.manifestPath, 'regex', {
            regex: /^version:\s*['"]?([^#\s'"]+)['"]?\s*(?:#.*)?$/m,
        });
    }
    bumpVersion(releaseType) {
        if (!this.manifestPath)
            throw new Error('pubspec.yaml not found');
        const current = this.getCurrentVersion();
        if (!current)
            throw new Error('Dart version not found');
        const newVersion = (0, utils_1.calculateNextVersion)(current, releaseType);
        this.manifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
            regexReplace: /^(\s*version:\s*['"]?)([^#\s'"]+)(['"]?\s*(?:#.*)?)$/m,
        });
        return newVersion;
    }
}
exports.DartUpdater = DartUpdater;


/***/ }),

/***/ 9532:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DenoUpdater = void 0;
const utils_1 = __nccwpck_require__(5184);
/**
 * Updater for the Deno ecosystem.
 *
 * Supports `deno.json` and `jsr.json` manifests. Detection reads from the first
 * manifest found; bumping writes the computed version to all present manifests
 * to keep them in sync.
 */
class DenoUpdater {
    constructor() {
        this.platform = 'deno';
        this.manifestPath = null;
        this.fileHandler = new utils_1.FileHandler();
        this.manifestParser = new utils_1.ManifestParser(this.fileHandler);
    }
    /**
     * Returns true when `deno.json` or `jsr.json` exists at the repo root.
     * Stores the detected manifest path for subsequent operations.
     */
    canHandle() {
        this.manifestPath = this.manifestParser.detectManifest(['deno.json', 'jsr.json']);
        return this.manifestPath !== null;
    }
    /**
     * Reads the `version` from the detected manifest.
     */
    getCurrentVersion() {
        if (!this.manifestPath)
            return null;
        return this.manifestParser.getVersion(this.manifestPath, 'json', { jsonPath: ['version'] });
    }
    /**
     * Calculates the next semver from the detected manifest, then writes the new
     * version to `deno.json` and `jsr.json` (only those that exist).
     */
    bumpVersion(releaseType) {
        if (!this.manifestPath)
            throw new Error('deno.json/jsr.json not found');
        const current = this.getCurrentVersion();
        if (!current)
            throw new Error('Deno/JSR version not found');
        const newVersion = (0, utils_1.calculateNextVersion)(current, releaseType);
        const manifests = ['deno.json', 'jsr.json'];
        for (const manifest of manifests) {
            if (this.fileHandler.fileExists(manifest)) {
                this.manifestParser.updateVersion(manifest, newVersion, 'json', { jsonPath: ['version'] });
            }
        }
        return newVersion;
    }
}
exports.DenoUpdater = DenoUpdater;


/***/ }),

/***/ 352:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DockerUpdater = void 0;
const utils_1 = __nccwpck_require__(5184);
/**
 * Updater for Dockerfiles.
 */
class DockerUpdater {
    constructor() {
        this.platform = 'docker';
        this.manifestPath = null;
        const fileHandler = new utils_1.FileHandler();
        this.manifestParser = new utils_1.ManifestParser(fileHandler);
    }
    /**
     * Checks if the updater can handle the current repository.
     * @returns True if the updater can handle the repo, false otherwise.
     */
    canHandle() {
        this.manifestPath = this.manifestParser.detectManifest(['Dockerfile']);
        return this.manifestPath !== null;
    }
    /**
     * Gets the current version from the Dockerfile.
     * @returns The current version or null if not found.
     */
    getCurrentVersion() {
        if (!this.manifestPath)
            return null;
        return this.manifestParser.getVersion(this.manifestPath, 'regex', {
            regex: /LABEL version="([^"]+)"/,
        });
    }
    /**
     * Bumps the version in the Dockerfile.
     * @param releaseType The type of release (patch, minor, major).
     * @returns The new version.
     */
    bumpVersion(releaseType) {
        if (!this.manifestPath)
            throw new Error('Dockerfile not found');
        const current = this.getCurrentVersion();
        if (!current)
            throw new Error('Docker version not found');
        const newVersion = (0, utils_1.calculateNextVersion)(current, releaseType);
        this.manifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
            regexReplace: /(LABEL\s+version=")([^"]+)(")/,
        });
        return newVersion;
    }
}
exports.DockerUpdater = DockerUpdater;


/***/ }),

/***/ 6838:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DotNetUpdater = void 0;
const utils_1 = __nccwpck_require__(5184);
/**
 * Updater for .NET project files and shared build properties.
 */
class DotNetUpdater {
    constructor() {
        this.platform = 'dotnet';
        this.manifestPath = null;
        this.fileHandler = new utils_1.FileHandler();
    }
    canHandle() {
        if (this.fileHandler.fileExists('Directory.Build.props')) {
            this.manifestPath = 'Directory.Build.props';
            return true;
        }
        const projectFiles = this.fileHandler
            .readDir('.')
            .filter((name) => /\.(cs|fs|vb)proj$/i.test(name))
            .sort();
        this.manifestPath = projectFiles[0] ?? null;
        return this.manifestPath !== null;
    }
    getCurrentVersion() {
        if (!this.manifestPath)
            return null;
        const match = this.getVersionMatch(this.fileHandler.readFile(this.manifestPath));
        return match?.[2].trim() ?? null;
    }
    bumpVersion(releaseType) {
        if (!this.manifestPath)
            throw new Error('.NET manifest file not found');
        const content = this.fileHandler.readFile(this.manifestPath);
        const match = this.getVersionMatch(content);
        if (!match)
            throw new Error('.NET version not found');
        const current = match[2].trim();
        const newVersion = (0, utils_1.calculateNextVersion)(current, releaseType);
        const versionStart = match.index + match[0].indexOf(match[2]);
        this.fileHandler.writeFile(this.manifestPath, content.slice(0, versionStart) + newVersion + content.slice(versionStart + match[2].length));
        return newVersion;
    }
    getVersionMatch(content) {
        return /<(Version|VersionPrefix|PackageVersion)\b[^>]*>\s*([^<]+?)\s*<\/\1\s*>/i.exec(content);
    }
}
exports.DotNetUpdater = DotNetUpdater;


/***/ }),

/***/ 9954:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GoUpdater = void 0;
const utils_1 = __nccwpck_require__(5184);
/**
 * Updater for Go modules.
 */
class GoUpdater {
    constructor() {
        this.platform = 'go';
        this.manifestPath = null;
        const fileHandler = new utils_1.FileHandler();
        this.manifestParser = new utils_1.ManifestParser(fileHandler);
    }
    /**
     * Checks if the updater can handle the current repository.
     * @returns True if the updater can handle the repo, false otherwise.
     */
    canHandle() {
        this.manifestPath = this.manifestParser.detectManifest(['go.mod']);
        return this.manifestPath !== null;
    }
    /**
     * Gets the current version from the go.mod file.
     * @returns The current version or null if not found.
     */
    getCurrentVersion() {
        if (!this.manifestPath)
            return null;
        return this.manifestParser.getVersion(this.manifestPath, 'regex', {
            regex: /^module\s+[^\s]+\s+v?(\d+\.\d+\.\d+)/m,
        });
    }
    /**
     * Bumps the version in the go.mod file.
     * @param releaseType The type of release (patch, minor, major).
     * @returns The new version.
     */
    bumpVersion(releaseType) {
        if (!this.manifestPath)
            throw new Error('go.mod not found');
        const current = this.getCurrentVersion();
        if (!current)
            throw new Error('Go version not found');
        const newVersion = (0, utils_1.calculateNextVersion)(current, releaseType);
        this.manifestParser.updateVersion(this.manifestPath, `v${newVersion}`, 'regex', {
            regexReplace: /v\d+\.\d+\.\d+/,
        });
        return newVersion;
    }
}
exports.GoUpdater = GoUpdater;


/***/ }),

/***/ 3025:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(8848), exports);
__exportStar(__nccwpck_require__(6894), exports);
__exportStar(__nccwpck_require__(5874), exports);
__exportStar(__nccwpck_require__(9954), exports);
__exportStar(__nccwpck_require__(352), exports);
__exportStar(__nccwpck_require__(7068), exports);
__exportStar(__nccwpck_require__(6837), exports);
__exportStar(__nccwpck_require__(9532), exports);
__exportStar(__nccwpck_require__(1924), exports);
__exportStar(__nccwpck_require__(6838), exports);
__exportStar(__nccwpck_require__(4956), exports);
__exportStar(__nccwpck_require__(8939), exports);


/***/ }),

/***/ 1924:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JavaUpdater = void 0;
const utils_1 = __nccwpck_require__(5184);
/**
 * Updater for Java projects using Maven or Gradle.
 */
class JavaUpdater {
    constructor() {
        this.platform = 'java';
        this.manifestPath = null;
        this.fileHandler = new utils_1.FileHandler();
        this.manifestParser = new utils_1.ManifestParser(this.fileHandler);
    }
    canHandle() {
        this.manifestPath = this.manifestParser.detectManifest([
            'pom.xml',
            'build.gradle',
            'build.gradle.kts',
        ]);
        return this.manifestPath !== null;
    }
    getCurrentVersion() {
        if (!this.manifestPath)
            return null;
        if (this.manifestPath === 'pom.xml') {
            return this.getMavenVersion(this.fileHandler.readFile(this.manifestPath))?.value ?? null;
        }
        return this.manifestParser.getVersion(this.manifestPath, 'regex', {
            regex: /^\s*version\s*(?:=\s*)?['"]([^'"]+)['"]/m,
        });
    }
    bumpVersion(releaseType) {
        if (!this.manifestPath)
            throw new Error('Java manifest file not found');
        const current = this.getCurrentVersion();
        if (!current)
            throw new Error('Java version not found');
        const newVersion = (0, utils_1.calculateNextVersion)(current, releaseType);
        if (this.manifestPath === 'pom.xml') {
            const content = this.fileHandler.readFile(this.manifestPath);
            const location = this.getMavenVersion(content);
            if (!location)
                throw new Error('Maven project version not found');
            this.fileHandler.writeFile(this.manifestPath, content.slice(0, location.start) + newVersion + content.slice(location.end));
        }
        else {
            this.manifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
                regexReplace: /^(\s*version\s*(?:=\s*)?['"])([^'"]+)(['"])/m,
            });
        }
        return newVersion;
    }
    getMavenVersion(content) {
        const projectOpen = /<project\b[^>]*>/i.exec(content);
        if (!projectOpen || projectOpen.index === undefined)
            return null;
        const innerStart = projectOpen.index + projectOpen[0].length;
        const projectClose = content.indexOf('</project>', innerStart);
        if (projectClose === -1)
            return null;
        const inner = content.slice(innerStart, projectClose);
        const tagRegex = /<!--[\s\S]*?-->|<\/?([A-Za-z_][\w:.-]*)\b[^>]*>/g;
        let depth = 0;
        let versionStart = -1;
        let match;
        while ((match = tagRegex.exec(inner)) !== null) {
            if (match[0].startsWith('<!--'))
                continue;
            const tagName = match[1].split(':').pop()?.toLowerCase();
            const isClosingTag = match[0].startsWith('</');
            if (isClosingTag) {
                if (depth === 1 && tagName === 'version' && versionStart >= 0) {
                    const value = inner.slice(versionStart, match.index).trim();
                    const start = innerStart + versionStart;
                    return value ? { start, end: innerStart + match.index, value } : null;
                }
                depth = Math.max(0, depth - 1);
                continue;
            }
            if (depth === 0 && tagName === 'version') {
                versionStart = tagRegex.lastIndex;
            }
            if (!/\/\s*>$/.test(match[0]))
                depth++;
        }
        return null;
    }
}
exports.JavaUpdater = JavaUpdater;


/***/ }),

/***/ 8848:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NodeUpdater = void 0;
const utils_1 = __nccwpck_require__(5184);
/**
 * Updater for Node.js projects using package.json.
 */
class NodeUpdater {
    constructor() {
        this.platform = 'node';
        this.manifestPath = null;
        this.fileHandler = new utils_1.FileHandler();
        this.manifestParser = new utils_1.ManifestParser(this.fileHandler);
    }
    /**
     * Checks if the updater can handle the current repository.
     * @returns True if the updater can handle the repo, false otherwise.
     */
    canHandle() {
        this.manifestPath = this.manifestParser.detectManifest(['package.json']);
        return this.manifestPath !== null;
    }
    /**
     * Gets the current version from the package.json file.
     * @returns The current version or null if not found.
     */
    getCurrentVersion() {
        if (!this.manifestPath)
            return null;
        return this.manifestParser.getVersion(this.manifestPath, 'json', {
            jsonPath: ['version'],
        });
    }
    /**
     * Bumps the version in the package.json file.
     * @param releaseType The type of release (patch, minor, major).
     * @returns The new version.
     */
    bumpVersion(releaseType) {
        if (!this.manifestPath)
            throw new Error('package.json not found');
        const current = this.getCurrentVersion();
        if (!current)
            throw new Error('Node version not found');
        const newVersion = (0, utils_1.calculateNextVersion)(current, releaseType);
        this.manifestParser.updateVersion(this.manifestPath, newVersion, 'json', {
            jsonPath: ['version'],
        });
        // Also bump deno.json/jsr.json if present to keep versions in sync
        const extraManifests = ['deno.json', 'jsr.json'];
        for (const manifest of extraManifests) {
            if (this.fileHandler.fileExists(manifest)) {
                this.manifestParser.updateVersion(manifest, newVersion, 'json', { jsonPath: ['version'] });
            }
        }
        return newVersion;
    }
}
exports.NodeUpdater = NodeUpdater;


/***/ }),

/***/ 7068:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PHPUpdater = void 0;
const utils_1 = __nccwpck_require__(5184);
/**
 * Updater for PHP projects.
 */
class PHPUpdater {
    constructor() {
        this.platform = 'php';
        this.manifestPath = null;
        const fileHandler = new utils_1.FileHandler();
        this.manifestParser = new utils_1.ManifestParser(fileHandler);
    }
    /**
     * Checks if the updater can handle the current repository.
     * @returns True if the updater can handle the repo, false otherwise.
     */
    canHandle() {
        this.manifestPath = this.manifestParser.detectManifest([
            'composer.json',
            'VERSION',
            'version.php',
            'config.php',
        ]);
        return this.manifestPath !== null;
    }
    /**
     * Gets the current version from the PHP manifest file.
     * @returns The current version or null if not found.
     */
    getCurrentVersion() {
        if (!this.manifestPath)
            return null;
        switch (this.manifestPath) {
            case 'composer.json':
                return this.manifestParser.getVersion(this.manifestPath, 'json', {
                    jsonPath: ['version'],
                });
            case 'VERSION':
                return this.manifestParser.getVersion(this.manifestPath, 'regex', {
                    regex: /^([\d.]+)$/m, // Matches the entire content as version
                });
            case 'version.php':
                return this.manifestParser.getVersion(this.manifestPath, 'regex', {
                    regex: /['"]([\d.]+)['']/, // Matches version in quotes
                });
            case 'config.php':
                return this.manifestParser.getVersion(this.manifestPath, 'regex', {
                    regex: /'version'\s*=>\s*'([\d.]+)'/, // Matches version in config array
                });
            default:
                return null;
        }
    }
    /**
     * Bumps the version in the PHP manifest file.
     * @param releaseType The type of release (patch, minor, major).
     * @returns The new version.
     */
    bumpVersion(releaseType) {
        if (!this.manifestPath)
            throw new Error('PHP manifest file not found');
        const current = this.getCurrentVersion();
        if (!current)
            throw new Error('PHP version not found');
        const newVersion = (0, utils_1.calculateNextVersion)(current, releaseType);
        switch (this.manifestPath) {
            case 'composer.json':
                this.manifestParser.updateVersion(this.manifestPath, newVersion, 'json', {
                    jsonPath: ['version'],
                });
                break;
            case 'VERSION':
                this.manifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
                    regexReplace: /^([\d.]+)$/m,
                });
                break;
            case 'version.php':
                this.manifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
                    regexReplace: /(['"])([\d.]+)(['"])/,
                });
                break;
            case 'config.php':
                this.manifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
                    regexReplace: /('version'\s*=>\s*')([\d.]+)(')/,
                });
                break;
            default:
                throw new Error(`Unsupported PHP manifest file: ${this.manifestPath}`);
        }
        return newVersion;
    }
}
exports.PHPUpdater = PHPUpdater;


/***/ }),

/***/ 6894:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PythonUpdater = void 0;
const utils_1 = __nccwpck_require__(5184);
/**
 * Updater for Python projects.
 */
class PythonUpdater {
    constructor() {
        this.platform = 'python';
        this.manifestPath = null;
        const fileHandler = new utils_1.FileHandler();
        this.manifestParser = new utils_1.ManifestParser(fileHandler);
    }
    /**
     * Checks if the updater can handle the current repository.
     * @returns True if the updater can handle the repo, false otherwise.
     */
    canHandle() {
        this.manifestPath = this.manifestParser.detectManifest(['pyproject.toml', 'setup.py']);
        return this.manifestPath !== null;
    }
    /**
     * Gets the current version from the Python manifest file.
     * @returns The current version or null if not found.
     */
    getCurrentVersion() {
        if (!this.manifestPath)
            return null;
        switch (this.manifestPath) {
            case 'pyproject.toml':
                return this.manifestParser.getVersion(this.manifestPath, 'regex', {
                    regex: /version\s*=\s*"([^"]+)"/,
                });
            case 'setup.py':
                return this.manifestParser.getVersion(this.manifestPath, 'regex', {
                    regex: /version\s*=\s*["']([^"']+)["']/, // Matches single or double quotes
                });
            default:
                return null;
        }
    }
    /**
     * Bumps the version in the Python manifest file.
     * @param releaseType The type of release (patch, minor, major).
     * @returns The new version.
     */
    bumpVersion(releaseType) {
        if (!this.manifestPath)
            throw new Error('Python manifest file not found');
        const current = this.getCurrentVersion();
        if (!current)
            throw new Error('Python version not found');
        const newVersion = (0, utils_1.calculateNextVersion)(current, releaseType);
        switch (this.manifestPath) {
            case 'pyproject.toml':
                this.manifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
                    regexReplace: /(version\s*=\s*")([^"]+)(")/,
                });
                break;
            case 'setup.py':
                this.manifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
                    regexReplace: /(version\s*=\s*["'])([^"']+)(["'])/,
                });
                break;
            default:
                throw new Error(`Unsupported Python manifest file: ${this.manifestPath}`);
        }
        return newVersion;
    }
}
exports.PythonUpdater = PythonUpdater;


/***/ }),

/***/ 4956:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RubyUpdater = void 0;
const utils_1 = __nccwpck_require__(5184);
/**
 * Updater for Ruby gems with a literal version in a gemspec or version.rb.
 */
class RubyUpdater {
    constructor() {
        this.platform = 'ruby';
        this.manifestPath = null;
        this.fileHandler = new utils_1.FileHandler();
        this.manifestParser = new utils_1.ManifestParser(this.fileHandler);
    }
    canHandle() {
        const gemspec = this.fileHandler
            .readDir('.')
            .filter((name) => name.endsWith('.gemspec'))
            .sort()[0];
        this.manifestPath =
            gemspec ?? (this.fileHandler.fileExists('version.rb') ? 'version.rb' : null);
        return this.manifestPath !== null;
    }
    getCurrentVersion() {
        if (!this.manifestPath)
            return null;
        return this.manifestParser.getVersion(this.manifestPath, 'regex', {
            regex: this.manifestPath === 'version.rb'
                ? /\bVERSION\s*=\s*['"]([^'"]+)['"]/
                : /\b\w+\.version\s*=\s*['"]([^'"]+)['"]/,
        });
    }
    bumpVersion(releaseType) {
        if (!this.manifestPath)
            throw new Error('Ruby manifest file not found');
        const current = this.getCurrentVersion();
        if (!current)
            throw new Error('Ruby version not found');
        const newVersion = (0, utils_1.calculateNextVersion)(current, releaseType);
        this.manifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
            regexReplace: this.manifestPath === 'version.rb'
                ? /(\bVERSION\s*=\s*['"])([^'"]+)(['"])/
                : /(\b\w+\.version\s*=\s*['"])([^'"]+)(['"])/,
        });
        return newVersion;
    }
}
exports.RubyUpdater = RubyUpdater;


/***/ }),

/***/ 5874:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RustUpdater = void 0;
const utils_1 = __nccwpck_require__(5184);
/**
 * Updater for Rust projects.
 */
class RustUpdater {
    constructor() {
        this.platform = 'rust';
        this.manifestPath = null;
        const fileHandler = new utils_1.FileHandler();
        this.manifestParser = new utils_1.ManifestParser(fileHandler);
    }
    /**
     * Checks if the updater can handle the current repository.
     * @returns True if the updater can handle the repo, false otherwise.
     */
    canHandle() {
        this.manifestPath = this.manifestParser.detectManifest(['Cargo.toml']);
        return this.manifestPath !== null;
    }
    /**
     * Gets the current version from the Cargo.toml file.
     * @returns The current version or null if not found.
     */
    getCurrentVersion() {
        if (!this.manifestPath)
            return null;
        return this.manifestParser.getVersion(this.manifestPath, 'regex', {
            regex: /version\s*=\s*"([^"]+)"/,
        });
    }
    /**
     * Bumps the version in the Cargo.toml file.
     * @param releaseType The type of release (patch, minor, major).
     * @returns The new version.
     */
    bumpVersion(releaseType) {
        if (!this.manifestPath)
            throw new Error('Cargo.toml not found');
        const current = this.getCurrentVersion();
        if (!current)
            throw new Error('Rust version not found');
        const newVersion = (0, utils_1.calculateNextVersion)(current, releaseType);
        this.manifestParser.updateVersion(this.manifestPath, newVersion, 'regex', {
            regexReplace: /(version\s*=\s*")([^"]+)(")/,
        });
        return newVersion;
    }
}
exports.RustUpdater = RustUpdater;


/***/ }),

/***/ 4450:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileHandler = void 0;
const fs = __importStar(__nccwpck_require__(9896));
const errors_1 = __nccwpck_require__(1967);
/**
 * Utility class for handling file operations.
 */
class FileHandler {
    constructor() { }
    /**
     * Checks if a file exists.
     * @param filePath The path to the file.
     * @returns True if the file exists, false otherwise.
     */
    fileExists(filePath) {
        return fs.existsSync(filePath);
    }
    /**
     * Reads the contents of a file.
     * @param filePath The path to the file.
     * @returns The contents of the file.
     */
    readFile(filePath) {
        if (!this.fileExists(filePath)) {
            throw new errors_1.FileNotFoundError(`File not found: ${filePath}`);
        }
        return fs.readFileSync(filePath, 'utf-8');
    }
    /**
     * Writes the contents to a file.
     * @param filePath The path to the file.
     * @param content The content to write to the file.
     */
    writeFile(filePath, content) {
        fs.writeFileSync(filePath, content);
    }
    /**
     * Reads the contents of a directory.
     * @param dirPath The path to the directory.
     * @returns An array of file names in the directory.
     * @throws Error if the directory does not exist.
     */
    readDir(dirPath) {
        if (!this.fileExists(dirPath)) {
            throw new errors_1.FileNotFoundError(`Directory not found: ${dirPath}`);
        }
        return fs.readdirSync(dirPath);
    }
}
exports.FileHandler = FileHandler;


/***/ }),

/***/ 5184:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__nccwpck_require__(9064), exports);
__exportStar(__nccwpck_require__(4450), exports);
__exportStar(__nccwpck_require__(296), exports);
__exportStar(__nccwpck_require__(9683), exports);


/***/ }),

/***/ 9683:
/***/ ((__unused_webpack_module, exports) => {


/**
 * Safely parses a JSON string.
 * Returns null (or a fallback) if parsing fails or input is invalid.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.safeParseJSON = safeParseJSON;
function safeParseJSON(str) {
    try {
        if (!str || typeof str !== 'string' || str.trim() === '') {
            return undefined;
        }
        return JSON.parse(str);
    }
    catch (e) {
        console.error('Invalid JSON:', e);
        return undefined;
    }
}


/***/ }),

/***/ 296:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ManifestParser = void 0;
const errors_1 = __nccwpck_require__(1967);
const jsonUtils_1 = __nccwpck_require__(9683);
/**
 * Utility class for parsing and updating manifest files.
 */
class ManifestParser {
    constructor(fileHandler) {
        this.fileHandler = fileHandler;
    }
    /**
     * Detects the presence of a manifest file.
     * @param manifestNames The names of the manifest files to check.
     * @returns The path to the manifest file if found, null otherwise.
     */
    detectManifest(manifestNames) {
        for (const name of manifestNames) {
            if (this.fileHandler.fileExists(name)) {
                return name;
            }
        }
        return null;
    }
    /**
     * Gets the version from a manifest file.
     * @param manifestPath The path to the manifest file.
     * @param type The type of manifest (json or regex).
     * @param options Options for extracting the version.
     * @returns The version string or null if not found.
     */
    getVersion(manifestPath, type, options) {
        const content = this.fileHandler.readFile(manifestPath);
        if (type === 'json') {
            let data;
            try {
                data = (0, jsonUtils_1.safeParseJSON)(content);
            }
            catch (e) {
                throw new errors_1.InvalidManifestError(`Invalid JSON in ${manifestPath}: ${e instanceof Error ? e.message : String(e)}`);
            }
            let version = data;
            if (options.jsonPath) {
                for (const key of options.jsonPath) {
                    if (typeof version === 'object' && version !== null && key in version) {
                        version = version[key];
                    }
                    else {
                        throw new errors_1.InvalidManifestError(`JSON path '${options.jsonPath.join('.')}' not found in ${manifestPath}`);
                    }
                }
            }
            console.log('version:', version);
            return typeof version === 'string' ? version : null;
        }
        else if (type === 'regex' && options.regex) {
            const match = content.match(options.regex);
            if (!match) {
                throw new errors_1.InvalidManifestError(`Regex '${options.regex.source}' did not find a match in ${manifestPath}`);
            }
            return match[1];
        }
        return null;
    }
    /**
     * Updates the version in a manifest file.
     * @param manifestPath The path to the manifest file.
     * @param newVersion The new version to set.
     * @param type The type of manifest (json or regex).
     * @param options Options for updating the version.
     */
    updateVersion(manifestPath, newVersion, type, options) {
        let content = this.fileHandler.readFile(manifestPath);
        if (type === 'json') {
            let data;
            try {
                data = JSON.parse(content);
            }
            catch (e) {
                throw new errors_1.InvalidManifestError(`Invalid JSON in ${manifestPath}: ${e instanceof Error ? e.message : String(e)}`);
            }
            let target = data;
            if (options.jsonPath && options.jsonPath.length > 0) {
                for (let i = 0; i < options.jsonPath.length - 1; i++) {
                    const key = options.jsonPath[i];
                    if (typeof target === 'object' && target !== null && key in target) {
                        target = target[key];
                    }
                    else {
                        throw new errors_1.InvalidManifestError(`JSON path '${options.jsonPath.slice(0, i + 1).join('.')}' not found for update in ${manifestPath}`);
                    }
                }
                const lastKey = options.jsonPath[options.jsonPath.length - 1];
                if (typeof target === 'object' && target !== null && lastKey in target) {
                    target[lastKey] = newVersion;
                }
                else {
                    throw new errors_1.InvalidManifestError(`JSON path '${options.jsonPath.join('.')}' not found for update in ${manifestPath}`);
                }
            }
            else {
                // If no jsonPath, assume the root is the version (e.g., a simple string file)
                // This case might not be directly handled by JSON.parse, but for completeness
                // if the JSON itself was just a version string, it would be `data = newVersion`
                // For typical JSON, jsonPath will always be present.
            }
            this.fileHandler.writeFile(manifestPath, JSON.stringify(data, null, 2));
        }
        else if (type === 'regex' && options.regexReplace) {
            content = content.replace(options.regexReplace, (_match, prefix, _oldVersion, suffix) => {
                return `${prefix}${newVersion}${suffix}`;
            });
            this.fileHandler.writeFile(manifestPath, content);
        }
    }
}
exports.ManifestParser = ManifestParser;


/***/ }),

/***/ 9064:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.calculateNextVersion = calculateNextVersion;
const semver_1 = __importDefault(__nccwpck_require__(2320));
/**
 * Calculates the next version based on the current version and release type.
 * @param currentVersion The current version string.
 * @param releaseType The type of release (patch, minor, major).
 * @returns The new version string.
 */
function calculateNextVersion(currentVersion, releaseType) {
    const newVersion = semver_1.default.inc(currentVersion, releaseType);
    if (!newVersion) {
        return currentVersion;
    }
    return newVersion;
}


/***/ }),

/***/ 9896:
/***/ ((module) => {

module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/asset-relocator-loader */
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(5522);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map