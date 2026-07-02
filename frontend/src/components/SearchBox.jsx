'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, TrendingUp } from 'lucide-react'

const POPULAR = ['curtains', 'blinds', 'wallpaper', 'cushions', 'table runner']

const API_BASE =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : 'https://api.homelineteam.com'

/* Highlight matching text in red */
function Highlighted({ text, query }) {
  if (!query) return <>{text}</>
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return (
    <>
      {parts.map((p, i) =>
        regex.test(p)
          ? <mark key={i} className="bg-sky-100 text-sky-700 font-bold not-italic rounded px-0.5">{p}</mark>
          : p
      )}
    </>
  )
}

export default function SearchBox({
  placeholder   = 'Search products…',
  size          = 'sm',     // 'sm' (navbar) | 'lg' (search page)
  defaultValue  = '',
  className     = '',
  onSearch,                 // optional: called with query string on submit
}) {
  const router        = useRouter()
  const [query,       setQuery]       = useState(defaultValue)
  const [suggestions, setSuggestions] = useState([])
  const [open,        setOpen]        = useState(false)
  const [fetching,    setFetching]    = useState(false)
  const [activeIdx,   setActiveIdx]   = useState(-1)
  const inputRef      = useRef(null)
  const wrapRef       = useRef(null)
  const timerRef      = useRef(null)

  // Sync defaultValue when parent changes it (e.g. URL query changes on search page)
  useEffect(() => { setQuery(defaultValue) }, [defaultValue])

  const fetchSuggestions = useCallback(async (q) => {
    setFetching(true)
    try {
      const res = await fetch(
        `${API_BASE}/products/suggestions?q=${encodeURIComponent(q)}`
      )
      if (!res.ok) throw new Error()
      const json = await res.json()
      setSuggestions(json?.data || [])
      setOpen(true)
    } catch {
      setSuggestions([])
    } finally {
      setFetching(false)
    }
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    setActiveIdx(-1)
    clearTimeout(timerRef.current)
    if (val.trim().length >= 2) {
      timerRef.current = setTimeout(() => fetchSuggestions(val.trim()), 300)
    } else {
      setSuggestions([])
      setOpen(false)
    }
  }

  const submit = (q) => {
    const trimmed = (q ?? query).trim()
    if (!trimmed) return
    setOpen(false)
    setSuggestions([])
    if (onSearch) onSearch(trimmed)
    else router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  const pickSuggestion = (name) => {
    setQuery(name)
    setOpen(false)
    if (onSearch) onSearch(name)
    else router.push(`/search?q=${encodeURIComponent(name)}`)
  }

  const clear = () => {
    setQuery('')
    setSuggestions([])
    setOpen(false)
    inputRef.current?.focus()
  }

  /* Keyboard navigation */
  const handleKeyDown = (e) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      pickSuggestion(suggestions[activeIdx].name)
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIdx(-1)
    }
  }

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isLg       = size === 'lg'
  const showDrop   = open && (suggestions.length > 0 || fetching || query.trim().length >= 2)

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <form onSubmit={(e) => { e.preventDefault(); submit() }}>
        <div className="relative">
          {/* Search icon */}
          <Search className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none
            ${isLg ? 'left-4 w-5 h-5' : 'left-3 w-4 h-4'}`}
          />

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => { if (suggestions.length > 0) setOpen(true) }}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck="false"
            className={`w-full bg-white text-gray-800 border border-gray-200
              focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400
              transition-all placeholder:text-gray-400
              ${isLg
                ? 'pl-12 pr-28 py-4 text-base rounded-2xl border-2'
                : 'pl-9 pr-8 py-2 text-sm rounded-xl'
              }`}
          />

          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={clear}
              className={`absolute top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors
                ${isLg ? 'right-[108px]' : 'right-2'}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Submit button — large only */}
          {isLg && (
            <button
              type="submit"
              disabled={!query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2
                bg-sky-600 hover:bg-sky-700 disabled:opacity-40 disabled:cursor-not-allowed
                text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
            >
              Search
            </button>
          )}
        </div>
      </form>

      {/* ── Dropdown ─────────────────────────────────────────────── */}
      {showDrop && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[300]">

          {/* Loading spinner */}
          {fetching && suggestions.length === 0 && (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Suggestion rows */}
          {suggestions.length > 0 && (
            <>
              <p className="px-4 pt-3 pb-1 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                Suggestions
              </p>
              <ul role="listbox">
                {suggestions.map((item, i) => (
                  <li key={item._id || i} role="option" aria-selected={activeIdx === i}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()} // keep focus on input
                      onClick={() => pickSuggestion(item.name)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                        ${activeIdx === i ? 'bg-sky-50' : 'hover:bg-gray-50'}`}
                    >
                      {/* Thumbnail */}
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Search className="w-4 h-4 text-gray-300" />
                        </div>
                      )}

                      {/* Name + category */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          <Highlighted text={item.name} query={query} />
                        </p>
                        {item.categoryName && (
                          <p className="text-xs text-gray-400 mt-0.5">{item.categoryName}</p>
                        )}
                      </div>

                      {/* Price */}
                      {item.basePrice != null && (
                        <span className="text-sm font-bold text-sky-600 flex-shrink-0 ml-2">
                          ₹{item.basePrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>

              {/* "See all" footer */}
              <div className="border-t border-gray-100 mx-3 mt-1">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => submit(query)}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-sky-600 hover:text-sky-700 transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  See all results for &ldquo;{query}&rdquo;
                </button>
              </div>
            </>
          )}

          {/* No results → show popular chips */}
          {!fetching && suggestions.length === 0 && query.trim().length >= 2 && (
            <div className="px-4 py-4">
              <p className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> No suggestions — try popular searches:
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickSuggestion(term)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full hover:bg-sky-50 hover:text-sky-600 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
