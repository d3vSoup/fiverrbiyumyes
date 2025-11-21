/**
 * App.js is intentionally the single brain of the UI so the user can open one
 * file in VS Code and understand how everything works. Every block in this file
 * is preceded by a comment explaining what it does in detail.
 */
import { useEffect, useMemo, useState, useRef } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  Heart,
  LogOut,
  Search,
  ShoppingCart,
  Star,
  User,
  ShieldCheck,
  ListChecks,
  Plus,
  MessageCircle,
  X,
  Trash2,
} from 'lucide-react'
import './App.css'

// ---------- Constants describing backend location and allowed domains ----------
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const ALLOWED_DOMAINS = ['bmsce.ac.in', 'bmsca.org', 'bmscl.ac.in']

// ---------- Default category tabs rendered on the home page ----------
const SERVICE_CATEGORIES = [
  { id: 'all', label: 'All Services', emoji: '✨' },
  { id: 'cad-homework', label: 'CAD Homework', emoji: '📐' },
  { id: 'maths-assignment', label: 'Maths Assignment', emoji: '➗' },
  { id: 'autocad-panel', label: 'AutoCAD Event Panel', emoji: '🧊' },
  { id: 'ui-ux', label: 'UI / UX Project', emoji: '🎨' },
  { id: 'project-help', label: 'Project Help', emoji: '🛠️' },
  { id: 'event-planning', label: 'Event Planning', emoji: '🎉' },
  { id: 'content-writing', label: 'Content Writing', emoji: '✍️' },
  { id: 'video-editing', label: 'Video Editing', emoji: '🎬' },
  { id: 'web-development', label: 'Web Development', emoji: '💻' },
  { id: 'graphic-design', label: 'Graphic Design', emoji: '🎨' },
  { id: 'presentation', label: 'Presentation Design', emoji: '📊' },
  { id: 'research', label: 'Research Help', emoji: '🔬' },
  { id: 'tutoring', label: 'Tutoring', emoji: '📚' },
]

// ---------- Fallback service catalog used if the backend is offline ----------
const FALLBACK_SERVICES = [
  {
    id: 'seed-cad',
    title: 'CAD Homework Lifeline',
    description: 'DWG cleanups, orthographic projections, and annotated sheets in INR.',
    price: 1200,
    currency: 'INR',
    category: 'cad-homework',
    hostName: 'Riya K',
    hostEmail: 'riya.cad@bmsce.ac.in',
    hostRating: 4.9,
    tags: ['cad', 'autocad', 'engineering'],
  },
  {
    id: 'seed-math',
    title: 'Maths Assignment Sprint',
    description: 'Calculus + statistics walkthrough videos recorded overnight.',
    price: 900,
    currency: 'INR',
    category: 'maths-assignment',
    hostName: 'Arjun M',
    hostEmail: 'arjun.maths@bmsce.ac.in',
    hostRating: 4.8,
    tags: ['maths'],
  },
  {
    id: 'seed-uiux',
    title: 'UI/UX Project Rescue',
    description: 'Figma rebuild + heuristic review + submission-ready slides.',
    price: 1800,
    currency: 'INR',
    category: 'ui-ux',
    hostName: 'Dev Patel',
    hostEmail: 'dev.uiux@bmscl.ac.in',
    hostRating: 4.7,
    tags: ['figma', 'ux', 'presentation'],
  },
  {
    id: 'seed-panel',
    title: 'AutoCAD Event Panel',
    description: 'Panels + booths with exploded views and cut lists.',
    price: 1500,
    currency: 'INR',
    category: 'autocad-panel',
    hostName: 'Sahana P',
    hostEmail: 'sahana.cad@bmsce.ac.in',
    hostRating: 5,
    tags: ['events', 'autocad'],
  },
  {
    id: 'seed-project',
    title: 'Project Video Polish',
    description: 'Motion graphics, subtitles, and background score for demo day.',
    price: 1300,
    currency: 'INR',
    category: 'project-help',
    hostName: 'Nisha V',
    hostEmail: 'nisha.media@bmsca.org',
    hostRating: 4.8,
    tags: ['video', 'motion'],
  },
]

// ---------- Helper util that wraps fetch and always returns JSON ----------
async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  if (!response.ok) {
    const problem = await response.json().catch(() => ({}))
    throw new Error(problem.error || 'Network request failed')
  }
  return response.json()
}

/**
 * Navbar component renders logo, About link, wishlist/cart counts,
 * host/student toggle, and the profile dropdown (with admin shortcuts).
 */
function Navbar({
  user,
  cart,
  wishlist,
  mode,
  onModeChange,
  onSignOut,
  onOpenSignIn,
  onGoogleSignIn,
  onEditProfile,
}) {
  const isHostMode = mode === 'host'

  // Initialize Google Sign-In button
  useEffect(() => {
    if (user) return

    const initGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
        if (!clientId) {
          console.warn('Google Client ID not configured. Set VITE_GOOGLE_CLIENT_ID in .env')
          return
        }

        const buttonElement = document.getElementById('google-signin-button')
        if (!buttonElement) return

        // Clear any existing button
        buttonElement.innerHTML = ''

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: onGoogleSignIn,
          auto_select: false,
          cancel_on_tap_outside: true,
        })

        window.google.accounts.id.renderButton(buttonElement, {
          type: 'standard',
          theme: 'filled_black',
          size: 'medium',
          text: 'signin_with',
          shape: 'pill',
          logo_alignment: 'left',
        })
      }
    }

    // Try immediately if Google is already loaded
    if (window.google) {
      initGoogleSignIn()
    } else {
      // Wait for Google script to load
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle)
          initGoogleSignIn()
        }
      }, 100)

      // Cleanup after 10 seconds
      setTimeout(() => clearInterval(checkGoogle), 10000)
    }

    return () => {
      const buttonElement = document.getElementById('google-signin-button')
      if (buttonElement) {
        buttonElement.innerHTML = ''
      }
    }
  }, [user, onGoogleSignIn])

  return (
    <header className={`nav-shell ${isHostMode ? 'nav-light' : 'nav-dark'}`}>
      <Link to="/" className="logo-pair">
        <span className="logo-green">Fiverr</span>
        <span className="logo-muted">for Students</span>
      </Link>

      <div className="mode-switch mode-switch-center">
        <button
          className={mode === 'student' ? 'mode-active' : ''}
          onClick={() => onModeChange('student')}
        >
          Student
        </button>
        <button
          className={mode === 'host' ? 'mode-active' : ''}
          onClick={() => onModeChange('host')}
        >
          Host
        </button>
      </div>

      <div className="nav-right">
        <Link to="/cart" className="icon-link">
          <ShoppingCart size={22} />
          {cart.length > 0 && <span className="badge badge-red">{cart.length}</span>}
        </Link>
        <Link to="/wishlist" className="icon-link">
          <Heart size={22} />
          {wishlist.length > 0 && <span className="badge badge-red">{wishlist.length}</span>}
        </Link>
        {user ? (
          <details className="profile-menu">
            <summary className="profile-summary">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  <User size={20} />
                </div>
              )}
            </summary>
            <div className="profile-card">
              <p className="profile-name">{user.name}</p>
              <p className="profile-email">{user.email}</p>
              {user.phoneNumber && <p className="profile-phone">📱 {user.phoneNumber}</p>}
              {user.usn && <p className="profile-usn">🎓 USN: {user.usn}</p>}
              {user.semester && <p className="profile-semester">📚 Semester: {user.semester}</p>}
            {user.isAdmin && (
              <Link to="/profile/manage-orders" className="profile-link">
                <ShieldCheck size={16} /> Manage Orders
              </Link>
            )}
            {mode === 'host' && user && (
              <Link to="/hosted-services" className="profile-link">
                <ListChecks size={16} /> Hosted Services
              </Link>
            )}
              <button className="profile-link" onClick={onEditProfile}>
                <User size={16} /> Edit Profile
              </button>
              <button className="signout-btn" onClick={onSignOut}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </details>
        ) : (
          <div
            id="google-signin-button"
            className="google-signin-container"
          />
        )}
      </div>
    </header>
  )
}

/**
 * Hero block for student mode - clean and minimal
 */
function Hero({ mode }) {
  if (mode === 'host') {
    return null // Host mode will show create listing interface
  }
  
  return (
    <section className="hero hero-dark">
      <div className="hero-copy">
        <h1>
          <span className="accent">Student creators</span> rescue fellow students.
        </h1>
      </div>
    </section>
  )
}

/**
 * CategoryTabs lets students filter services. Comments describe props clearly.
 */
function CategoryTabs({ activeCategory, onCategoryChange, mode }) {
  if (mode === 'host') return null
  return (
    <div className="category-row">
      {SERVICE_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          className={activeCategory === cat.id ? 'category active' : 'category'}
          onClick={() => onCategoryChange(cat.id)}
        >
          <span>{cat.emoji}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  )
}

/**
 * HostListings component shows user's own listings with delete functionality
 */
function HostListings({ user, services, onDelete, onToast }) {
  if (!user) {
    return (
      <div className="host-listings-empty">
        <p>Sign in to see your listings</p>
      </div>
    )
  }

  const userListings = (services || []).filter((s) => s.hostEmail === user.email)

  const handleDelete = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    try {
      await apiRequest(`/services/${serviceId}`, {
        method: 'DELETE',
        headers: { 'x-user-email': user.email },
      })
      if (onToast) onToast('Listing deleted successfully')
      if (onDelete) onDelete()
    } catch (err) {
      if (onToast) onToast('Failed to delete listing')
      console.error('Delete error:', err)
    }
  }

  if (userListings.length === 0) {
    return (
      <div className="host-listings-empty">
        <p>You haven't created any listings yet. Create one above!</p>
      </div>
    )
  }

  return (
    <div className="host-listings">
      <h3 className="host-listings-title">Your Listings</h3>
      <div className="host-listings-grid">
        {userListings.map((listing) => (
          <div key={listing.id} className="host-listing-card">
            <div className="host-listing-content">
              <div className="host-listing-header">
                <h4>{listing.title}</h4>
                <button
                  className="btn-delete-listing"
                  onClick={() => handleDelete(listing.id)}
                  title="Delete listing"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <p className="host-listing-category">{listing.category}</p>
              <p className="host-listing-desc">{listing.description}</p>
              <div className="host-listing-footer">
                <span className="host-listing-price">
                  {typeof listing.price === 'object' && listing.price?.min
                    ? `₹${listing.price.min.toLocaleString('en-IN')} - ₹${listing.price.max.toLocaleString('en-IN')}`
                    : `₹${(listing.price || 0).toLocaleString('en-IN')}`}
                </span>
                {listing.deliveryEstimate && (
                  <span className="host-listing-delivery">{listing.deliveryEstimate}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * HostCreateListing component for hosts to create new service listings
 */
function HostCreateListing({ user, onServiceCreated, services, onToast }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    priceRange: false,
    priceMin: '',
    priceMax: '',
    category: 'cad-homework',
    tags: '',
    deliveryEstimate: '',
    portfolioLink: '',
  })
  const [loading, setLoading] = useState(false)
  const [wordCount, setWordCount] = useState(0)

  const MIN_WORDS = 100

  const handleDescriptionChange = (e) => {
    const text = e.target.value
    setFormData({ ...formData, description: text })
    const words = text.trim().split(/\s+/).filter(Boolean)
    setWordCount(words.length)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      if (onToast) onToast('Please sign in to create a listing')
      return
    }

    if (wordCount < MIN_WORDS) {
      if (onToast) onToast(`Description must be at least ${MIN_WORDS} words (currently ${wordCount})`)
      return
    }

    setLoading(true)
    try {
      const price = formData.priceRange
        ? { min: parseFloat(formData.priceMin), max: parseFloat(formData.priceMax) }
        : parseFloat(formData.price)

      const newService = await apiRequest('/services', {
        method: 'POST',
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price,
          category: formData.category,
          hostName: user.name,
          hostEmail: user.email,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
          deliveryEstimate: formData.deliveryEstimate,
          portfolioLink: formData.portfolioLink || null,
        }),
      })
      if (onToast) onToast('Listing created successfully!')
      setFormData({
        title: '',
        description: '',
        price: '',
        priceRange: false,
        priceMin: '',
        priceMax: '',
        category: 'cad-homework',
        tags: '',
        deliveryEstimate: '',
        portfolioLink: '',
      })
      setWordCount(0)
      if (onServiceCreated) onServiceCreated(newService)
    } catch (err) {
      if (onToast) onToast('Failed to create listing. Please try again.')
      console.error('Create listing error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="host-create-container">
      <div className="host-create-header">
        <h2>Create New Listing</h2>
        <p>Share your skills and help fellow students</p>
      </div>
      <form className="host-create-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Service Title</label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., CAD Homework Help"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">
            Description <span className="word-count">({wordCount}/{MIN_WORDS} words minimum)</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={handleDescriptionChange}
            placeholder="Describe what you offer in detail. Minimum 100 words required..."
            rows={6}
            required
            className={wordCount < MIN_WORDS ? 'description-warning' : ''}
          />
          {wordCount < MIN_WORDS && (
            <p className="word-count-warning">
              {MIN_WORDS - wordCount} more words needed
            </p>
          )}
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              {SERVICE_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.priceRange}
                onChange={(e) => setFormData({ ...formData, priceRange: e.target.checked })}
              />
              Price Range
            </label>
            {formData.priceRange ? (
              <div className="price-range-inputs">
                <input
                  type="number"
                  value={formData.priceMin}
                  onChange={(e) => setFormData({ ...formData, priceMin: e.target.value })}
                  placeholder="Min ₹"
                  min="0"
                  required
                />
                <span>to</span>
                <input
                  type="number"
                  value={formData.priceMax}
                  onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                  placeholder="Max ₹"
                  min="0"
                  required
                />
              </div>
            ) : (
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Fixed price (₹)"
                min="0"
                step="1"
                required
              />
            )}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="deliveryEstimate">Delivery Estimate</label>
            <input
              id="deliveryEstimate"
              type="text"
              value={formData.deliveryEstimate}
              onChange={(e) => setFormData({ ...formData, deliveryEstimate: e.target.value })}
              placeholder="e.g., 3-5 days, 1 week"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="portfolioLink">Portfolio Link (Optional)</label>
            <input
              id="portfolioLink"
              type="url"
              value={formData.portfolioLink}
              onChange={(e) => setFormData({ ...formData, portfolioLink: e.target.value })}
              placeholder="https://your-portfolio.com"
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="tags">Skills/Tags (comma-separated)</label>
          <input
            id="tags"
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="CAD, AutoCAD, homework, 3D modeling"
            required
          />
        </div>
        <button type="submit" className="btn-primary btn-create" disabled={loading || !user}>
          <Plus size={18} />
          {loading ? 'Creating...' : 'Create Listing'}
        </button>
      </form>
    </div>
  )
}

/**
 * ServicesGrid shows each listing with wishlist/cart actions and INR pricing.
 */
function ServicesGrid({
  services,
  mode,
  user,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}) {
  const displayList = services

  return (
    <div className="grid">
      {displayList.map((service) => (
        <article key={service.id} className="service-card">
          <header>
            <div>
              <p className="service-category">{service.category}</p>
              <h3>{service.title}</h3>
              <p className="service-blurb">{service.description}</p>
            </div>
            <button
              className={isWishlisted(service.id) ? 'wishlist-btn active' : 'wishlist-btn'}
              onClick={() => onToggleWishlist(service.id)}
            >
              <Heart size={18} />
            </button>
          </header>
          <footer>
            <div className="host-meta">
              <Star size={16} />
              <span>{service.hostRating ?? 4.8}</span>
              <span>· {service.hostName}</span>
            </div>
            <div className="price-group">
              <strong>₹{service.price?.toLocaleString('en-IN') ?? '0'}</strong>
              {mode === 'student' ? (
                <button
                  className="btn-primary small"
                  disabled={!user}
                  onClick={() => onAddToCart(service.id)}
                >
                  Add to cart
                </button>
              ) : (
                <span className="host-hint">Switch to student mode to hire</span>
              )}
            </div>
          </footer>
        </article>
      ))}
    </div>
  )
}

/**
 * FloatingSearch is the green FAB plus the modal for keyword searching.
 */
function FloatingSearch({
  services,
  open,
  onClose,
  onOpen,
  onAddToCart,
  mode,
  user,
  onToggleWishlist,
  isWishlisted,
}) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return services.slice(0, 5)
    }
    const terms = query.toLowerCase().split(' ').filter(Boolean)
    return services.filter((svc) => {
      const haystack = `${svc.title} ${svc.description} ${svc.category} ${(svc.tags || []).join(' ')}`.toLowerCase()
      return terms.every((word) => haystack.includes(word))
    })
  }, [query, services])

  // Clear search query when modal closes to reset state for next open.
  // Using a cleanup function to avoid setState in effect body (React best practice).
  useEffect(() => {
    if (!open) {
      // Use setTimeout to defer state update and avoid cascading renders
      const timer = setTimeout(() => setQuery(''), 0)
      return () => clearTimeout(timer)
    }
  }, [open])

  return (
    <>
      <button className="fab fab-animated" onClick={onOpen}>
        <Search size={20} />
      </button>
      {open && (
        <div className="search-modal">
          <div className="backdrop" onClick={onClose} />
          <div className="search-panel">
            <header className="search-panel-head">
              <h4>Search services</h4>
              <button onClick={onClose}>&times;</button>
            </header>
            <div className="search-field">
              <Search size={16} />
              <input
                value={query}
                placeholder="CAD homework, UI critiques, AutoCAD..."
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="search-results">
              {filtered.map((svc) => (
                <div key={svc.id} className="search-row">
                  <div>
                    <p className="search-title">{svc.title}</p>
                    <p className="search-desc">{svc.description}</p>
                  </div>
                  <div className="search-actions">
                    <button
                      className={isWishlisted(svc.id) ? 'wishlist-btn active' : 'wishlist-btn'}
                      onClick={() => onToggleWishlist(svc.id)}
                    >
                      <Heart size={16} />
                    </button>
                    <button
                      className="btn-primary small"
                      disabled={mode !== 'student' || !user}
                      onClick={() => onAddToCart(svc.id)}
                    >
                      Hire
                    </button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <p className="empty-note">No matches yet.</p>}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * PointerWobble drops ripple spans each time the mouse is clicked.
 */
function PointerWobble() {
  const [ripples, setRipples] = useState([])

  useEffect(() => {
    const handler = (event) => {
      setRipples((prev) => {
        const next = [...prev, { id: Date.now(), x: event.clientX, y: event.clientY }]
        return next.slice(-10)
      })
    }
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [])

  return (
    <div className="ripple-layer">
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="ripple"
          style={{ left: ripple.x - 40, top: ripple.y - 40 }}
        />
      ))}
    </div>
  )
}

/**
 * AddToCartModal - requires portfolio link and message before adding to cart
 */
function AddToCartModal({ service, open, onClose, onConfirm, user }) {
  const [portfolioLink, setPortfolioLink] = useState('')
  const [message, setMessage] = useState('')
  const [charCount, setCharCount] = useState(0)
  const MAX_CHARS = 50

  useEffect(() => {
    if (!open) {
      setPortfolioLink('')
      setMessage('')
      setCharCount(0)
    }
  }, [open])

  // Safety check
  if (!service) {
    return null
  }

  const handleMessageChange = (e) => {
    try {
      const text = e.target.value
      if (text.length <= MAX_CHARS) {
        setMessage(text)
        setCharCount(text.length)
      } else {
        // Prevent typing beyond max, but don't crash
        e.target.value = message
      }
    } catch (err) {
      console.error('Message change error:', err)
    }
  }

  const handleConfirm = () => {
    if (!portfolioLink.trim()) {
      alert('Portfolio link is required')
      return
    }
    if (charCount === 0) {
      alert('Message is required')
      return
    }
    onConfirm({ portfolioLink, message })
    onClose()
  }

  if (!open) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Add to Cart</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-service-info">
            <h4>{service?.title}</h4>
            <p>{service?.description}</p>
          </div>
          <div className="form-group">
            <label htmlFor="portfolioLink">
              Portfolio Link <span className="required">*</span>
            </label>
            <input
              id="portfolioLink"
              type="url"
              value={portfolioLink}
              onChange={(e) => setPortfolioLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  e.stopPropagation()
                }
              }}
              placeholder="https://your-portfolio.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="message">
              Briefing Message <span className="char-count">({charCount}/{MAX_CHARS} characters max)</span>
            </label>
            <textarea
              id="message"
              value={message}
              onChange={handleMessageChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  // Allow Ctrl+Enter to submit
                  return
                }
                if (e.key === 'Enter' && e.target.value.length >= MAX_CHARS) {
                  e.preventDefault()
                }
              }}
              placeholder="Briefly describe your needs..."
              rows={3}
              required
              maxLength={MAX_CHARS}
              className={charCount === 0 ? 'description-warning' : ''}
            />
            {charCount === 0 && (
              <p className="char-count-warning">
                Message is required
              </p>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleConfirm}
            disabled={!portfolioLink.trim() || charCount === 0}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * CheckoutModal - shows payment gateway not ready message
 */
function CheckoutModal({ open, onClose, cartTotal }) {
  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Checkout</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="payment-warning">
            <p className="warning-icon">⚠️</p>
            <h4>Payment Gateway Not Initialized</h4>
            <p>Order cannot be placed at this time. Payment gateway integration is pending.</p>
            <p className="cart-safe">Your cart remains safe and will not be cleared.</p>
            <p className="total-amount">Total: ₹{cartTotal.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-primary" onClick={onClose}>Understood</button>
        </div>
      </div>
    </div>
  )
}

/**
 * ProfileEditModal - allows users to edit their profile (phone, USN, semester)
 */
function ProfileEditModal({ user, open, onClose, onSave }) {
  const [formData, setFormData] = useState({
    phoneNumber: user?.phoneNumber || '',
    usn: user?.usn || '',
    semester: user?.semester || '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && user) {
      setFormData({
        phoneNumber: user.phoneNumber || '',
        usn: user.usn || '',
        semester: user.semester || '',
      })
    }
  }, [open, user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (err) {
      console.error('Profile save error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!open || !user) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-edit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Profile</h3>
          <button type="button" className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="profile-edit-avatar">
              {user.image ? (
                <img src={user.image} alt={user.name} className="profile-edit-img" />
              ) : (
                <div className="profile-edit-img-placeholder">
                  <User size={40} />
                </div>
              )}
              <p className="profile-edit-name">{user.name}</p>
              <p className="profile-edit-email">{user.email}</p>
              <p className="profile-edit-note">Profile picture from Google account</p>
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+91 9876543210"
                pattern="[+]?[0-9\s-]{10,15}"
              />
            </div>
            <div className="form-group">
              <label htmlFor="usn">USN (University Seat Number)</label>
              <input
                id="usn"
                type="text"
                value={formData.usn}
                onChange={(e) => setFormData({ ...formData, usn: e.target.value.toUpperCase() })}
                placeholder="1BM21CS001"
                maxLength={20}
              />
            </div>
            <div className="form-group">
              <label htmlFor="semester">Semester</label>
              <select
                id="semester"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              >
                <option value="">Select Semester</option>
                <option value="1">1st Semester</option>
                <option value="2">2nd Semester</option>
                <option value="3">3rd Semester</option>
                <option value="4">4th Semester</option>
                <option value="5">5th Semester</option>
                <option value="6">6th Semester</option>
                <option value="7">7th Semester</option>
                <option value="8">8th Semester</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * CartPage shows INR totals plus checkout button syncing to backend orders.
 */
function CartPage({ cart, onRemove, onCheckout, loading }) {
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const total = cart.reduce((sum, item) => {
    const price = item.service?.price
    if (typeof price === 'object' && price.min && price.max) {
      return sum + (price.min + price.max) / 2
    }
    return sum + (price || 0)
  }, 0)

  const handleCheckoutClick = () => {
    setCheckoutModalOpen(true)
  }

  return (
    <section className="page-shell">
      <h2>Cart</h2>
      {cart.length === 0 ? (
        <p className="empty-note">Nothing booked yet. Search for CAD, maths, UI/UX, etc.</p>
      ) : (
        <div className="stack">
          {cart.map((item) => (
            <div key={item.id} className="list-card cart-item-card">
              <div className="cart-item-content">
                <h4>{item.service?.title}</h4>
                <p>{item.service?.description}</p>
                {item.portfolioLink && (
                  <p className="portfolio-link">
                    <a href={item.portfolioLink} target="_blank" rel="noopener noreferrer">
                      Portfolio Link
                    </a>
                  </p>
                )}
                {item.message && (
                  <p className="cart-message">
                    <strong>Your message:</strong> {item.message}
                  </p>
                )}
                <div className="cart-item-price">
                  <span>
                    {typeof item.service?.price === 'object' && item.service?.price?.min
                      ? `₹${item.service.price.min.toLocaleString('en-IN')} - ₹${item.service.price.max.toLocaleString('en-IN')}`
                      : `₹${(item.service?.price || 0).toLocaleString('en-IN')}`}
                  </span>
                </div>
              </div>
              <div className="cart-item-remove">
                <button className="btn-remove" onClick={() => onRemove(item.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
          <footer className="cart-footer">
            <strong>₹{total.toLocaleString('en-IN')}</strong>
            <button className="btn-primary" disabled={loading} onClick={handleCheckoutClick}>
              {loading ? 'Syncing...' : 'Proceed to Checkout'}
            </button>
          </footer>
        </div>
      )}
      <CheckoutModal
        open={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        cartTotal={total}
      />
    </section>
  )
}

/**
 * WishlistPage allows moving saved services into the cart.
 */
function WishlistPage({ wishlist, onToggle, onAddToCart, mode, user }) {
  return (
    <section className="page-shell">
      <h2>Wishlist</h2>
      {wishlist.length === 0 ? (
        <p className="empty-note">Tap the heart on any service to pin it here.</p>
      ) : (
        <div className="grid">
          {wishlist.map((item) => (
            <article key={item.id} className="service-card">
              <header>
                <div>
                  <p className="service-category">{item.service?.category}</p>
                  <h3>{item.service?.title}</h3>
                  <p className="service-blurb">{item.service?.description}</p>
                </div>
                <button className="wishlist-btn active" onClick={() => onToggle(item.serviceId)}>
                  <Heart size={18} />
                </button>
              </header>
              <footer>
                <div className="host-meta">
                  <span>{item.service?.hostName}</span>
                </div>
                <div className="price-group">
                  <strong>₹{item.service?.price?.toLocaleString('en-IN')}</strong>
                  <button
                    className="btn-primary small"
                    disabled={mode !== 'student' || !user}
                    onClick={() => onAddToCart(item.serviceId)}
                  >
                    Add to cart
                  </button>
                </div>
              </footer>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

/**
 * SignInPage lets users provide campus email or simulate Google OAuth prep.
 */
function SignInPage({ onEmailLogin, loading }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    try {
      await onEmailLogin({ email, name })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <section className="page-shell">
      <h2>Sign in</h2>
      <form className="signin-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Riya CAD" />
        </label>
        <label>
          Campus email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@bmsce.ac.in"
          />
        </label>
        <button className="btn-primary" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in with email'}
        </button>
        <button
          type="button"
          className="btn-ghost"
          disabled={loading}
          onClick={() =>
            onEmailLogin({
              email: 'student@bmsce.ac.in',
              name: 'Google Mock User',
            })
          }
        >
          Continue with Google (configure OAuth later)
        </button>
        {error && <p className="error-note">{error}</p>}
      </form>
    </section>
  )
}

/**
 * AdminOrdersPage shows comprehensive order details with buyer/host info, portfolio links, and chat
 */
function AdminOrdersPage({ orders, user, cart }) {
  const isAdmin = user?.isAdmin || false
  const isHost = user && orders.some((o) => o.hostEmail === user.email)

  // Determine order status based on cart and payment
  const getOrderStatus = (order) => {
    // Check if item is still in cart
    const inCart = cart.some((item) => item.serviceId === order.serviceId)
    if (inCart) {
      return { status: 'In Cart', className: 'order-status-carted' }
    }
    // Check if paid (status would be 'paid' or 'completed')
    if (order.status === 'paid' || order.status === 'completed') {
      return { status: 'Paid', className: 'order-status-paid' }
    }
    // Default to pending
    return { status: order.status || 'Pending', className: `order-status-${order.status || 'pending'}` }
  }

  return (
    <section className="page-shell">
      <h2>{isAdmin ? 'Admin' : isHost ? 'Host' : 'Manage'} · Orders</h2>
      {isHost && (
        <p className="host-orders-note">Viewing orders for your listings. Students are looking for your services.</p>
      )}
      {orders.length === 0 ? (
        <p className="empty-note">No orders yet. Orders will appear here when students add services to cart.</p>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => {
            const statusInfo = getOrderStatus(order)
            return (
              <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order.id.slice(0, 8)}</h3>
                  <span className={statusInfo.className}>
                    {statusInfo.status}
                  </span>
                </div>
                <div className="order-meta">
                  <p><strong>Placed:</strong> {new Date(order.placedAt || order.createdAt || Date.now()).toLocaleString()}</p>
                  {order.lastActivity && (
                    <p><strong>Last Activity:</strong> {new Date(order.lastActivity).toLocaleString()}</p>
                  )}
                </div>
              </div>

              <div className="order-parties">
                <div className="party-info">
                  <h4>Buyer</h4>
                  <p className="email">{order.buyerEmail || order.userEmail}</p>
                  {order.buyerName && <p className="name">{order.buyerName}</p>}
                </div>
                <div className="party-info">
                  <h4>Host</h4>
                  <p className="email">{order.hostEmail}</p>
                  {order.hostName && <p className="name">{order.hostName}</p>}
                </div>
              </div>

              <div className="order-listing">
                <h4>Service Listing</h4>
                <p className="listing-title">{order.listingTitle || order.serviceTitle}</p>
                <p className="listing-desc">{order.listingDescription || order.serviceDescription}</p>
                <p className="listing-creator">
                  <strong>Created by:</strong> {order.hostName || order.hostEmail}
                </p>
              </div>

              {order.portfolioLink && (
                <div className="order-portfolio">
                  <h4>Buyer Portfolio</h4>
                  <a href={order.portfolioLink} target="_blank" rel="noopener noreferrer" className="portfolio-link">
                    {order.portfolioLink}
                  </a>
                </div>
              )}

              {order.message && (
                <div className="order-message">
                  <h4>Buyer Message</h4>
                  <p className="message-text">{order.message}</p>
                </div>
              )}

              <div className="order-items">
                <h4>Items</h4>
                <ul>
                  {order.items?.map((item, idx) => (
                    <li key={idx}>
                      {item.title || item.serviceTitle} × {item.quantity || 1}
                      {item.price && (
                        <span className="item-price">
                          {' '}— ₹{typeof item.price === 'object' 
                            ? `${item.price.min || 0} - ${item.price.max || 0}`
                            : item.price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="order-footer">
                <div className="order-total">
                  <strong>Total: ₹{order.total?.toLocaleString('en-IN') || '0'}</strong>
                </div>
                <div className="order-actions">
                  <button className="btn-primary small">
                    <MessageCircle size={16} />
                    Chat
                  </button>
                </div>
              </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}


/**
 * Wrapper component ensures routes scroll to top when navigating.
 */
function ScrollToTopWrapper({ children }) {
  const location = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location])
  return children
}

/**
 * Core App component orchestrates all state, side effects, and routes.
 */
function AppShell() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('student')
  const [services, setServices] = useState([])
  const [filteredServices, setFilteredServices] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cart')
      const parsed = saved ? JSON.parse(saved) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('wishlist')
      const parsed = saved ? JSON.parse(saved) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const [orders, setOrders] = useState([])
  const [inventory, setInventory] = useState({ hosts: [], students: [] })
  const [loading, setLoading] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [modeTransition, setModeTransition] = useState(false)
  const [addToCartModal, setAddToCartModal] = useState({ open: false, service: null })
  const [profileEditModal, setProfileEditModal] = useState(false)

  // Load services on mount with backend fallback.
  useEffect(() => {
    async function loadServices() {
      try {
        const data = await apiRequest('/services')
        if (Array.isArray(data)) {
          setServices(data)
          setFilteredServices(data)
        } else {
          throw new Error('Invalid services data')
        }
      } catch (_err) {
        // Backend is offline, use fallback services so the UI still works
        console.error('Failed to load services:', _err)
        setServices(FALLBACK_SERVICES)
        setFilteredServices(FALLBACK_SERVICES)
        setToast('Backend offline, showing fallback services.')
      }
    }
    loadServices()
  }, [])

  // Handle mode change with animation
  const handleModeChange = (newMode) => {
    try {
      if (!newMode || (newMode !== 'student' && newMode !== 'host')) {
        console.error('Invalid mode:', newMode)
        return
      }
      setModeTransition(true)
      setTimeout(() => {
        setMode(newMode)
        setTimeout(() => setModeTransition(false), 300)
      }, 150)
    } catch (err) {
      console.error('Mode change error:', err)
      setModeTransition(false)
    }
  }

  // Filter services whenever category changes.
  useEffect(() => {
    try {
      if (!Array.isArray(services)) {
        setFilteredServices([])
        return
      }
      if (activeCategory === 'all') {
        setFilteredServices(services)
      } else {
        setFilteredServices(services.filter((svc) => svc && svc.category === activeCategory))
      }
    } catch (err) {
      console.error('Filter services error:', err)
      setFilteredServices([])
    }
  }, [activeCategory, services])

  // Reload services when a new one is created or deleted
  const handleServiceCreated = async () => {
    try {
      const data = await apiRequest('/services')
      if (Array.isArray(data)) {
        setServices(data)
        setFilteredServices(data)
      }
    } catch (_err) {
      // Backend offline, try to reload from current state
      console.error('Failed to reload services:', _err)
    }
  }

  // Persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  // Persist wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
      } catch (_err) {
        // Invalid user data, clear it
        localStorage.removeItem('user')
      }
    }
  }, [])

  // Hydrate cart + wishlist whenever a user signs in.
  useEffect(() => {
    if (!user) {
      setCart([])
      setWishlist([])
      localStorage.removeItem('user')
      return
    }
    // Save user to localStorage
    localStorage.setItem('user', JSON.stringify(user))
    ;(async () => {
      try {
        const [cartData, wishlistData] = await Promise.all([
          apiRequest(`/cart?userEmail=${encodeURIComponent(user.email)}`),
          apiRequest(`/wishlist?userEmail=${encodeURIComponent(user.email)}`),
        ])
        // Merge backend data with localStorage data (prefer backend if available)
        if (Array.isArray(cartData) && cartData.length > 0) {
          setCart(cartData)
        }
        if (Array.isArray(wishlistData) && wishlistData.length > 0) {
          setWishlist(wishlistData)
        }
      } catch (_err) {
        // Silently fail if cart/wishlist can't load - user can still use the app
        setToast('Could not load saved cart/wishlist yet.')
      }
    })()
  }, [user])

  // Helper to show transient toasts.
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  // Sign-in handler for both email form and Google simulation.
  const handleEmailLogin = async ({ email, name }) => {
    if (!email) throw new Error('Email is required')
    const domain = email.split('@')[1]
    if (!ALLOWED_DOMAINS.includes(domain) && email !== 'souparno.cs24@bmsce.ac.in') {
      throw new Error('Use your college email domain.')
    }
    setLoading(true)
    try {
      const payload = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, name }),
      })
      setUser(payload.user)
      setToast('Signed in successfully.')
    } catch (_err) {
      // Backend auth failed, create a local user session so the app still works
      setUser({ 
        email, 
        name, 
        isAdmin: email === 'souparno.cs24@bmsce.ac.in',
        phoneNumber: null,
        usn: null,
        semester: null,
      })
      setToast('Backend auth offline, using local session.')
    } finally {
      setLoading(false)
    }
  }

  // Sign-out simply clears all state.
  const handleSignOut = () => {
    setUser(null)
    setCart([])
    setWishlist([])
    setOrders([])
    setInventory({ hosts: [], students: [] })
    localStorage.removeItem('user')
    localStorage.removeItem('cart')
    localStorage.removeItem('wishlist')
    setToast('Signed out.')
  }

  // Google Sign-In handler
  const handleGoogleSignIn = async (credentialResponse) => {
    try {
      // Decode the JWT token to get user info
      const base64Url = credentialResponse.credential.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      const userInfo = JSON.parse(jsonPayload)
      const email = userInfo.email
      const name = userInfo.name || userInfo.given_name || 'User'
      const image = userInfo.picture

      // Validate domain
      const domain = email.split('@')[1]
      if (!ALLOWED_DOMAINS.includes(domain) && email !== 'souparno.cs24@bmsce.ac.in') {
        setToast('Only approved college email domains are allowed.')
        return
      }

      setLoading(true)
      try {
        const payload = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, name, image }),
        })
        const userData = {
          ...payload.user,
          image: image || payload.user.image,
        }
        setUser(userData)
        setToast('Signed in with Google successfully.')
      } catch (_err) {
        // Backend auth failed, create a local user session so the app still works
        setUser({
          email,
          name,
          image,
          isAdmin: email === 'souparno.cs24@bmsce.ac.in',
          phoneNumber: null,
          usn: null,
          semester: null,
        })
        setToast('Backend auth offline, using local session.')
      } finally {
        setLoading(false)
      }
    } catch (err) {
      setToast('Google sign-in failed. Please try again.')
      console.error('Google sign-in error:', err)
    }
  }

  // Open add to cart modal
  const handleAddToCartClick = (serviceId) => {
    try {
      if (!user) {
        setToast('Sign in first.')
        return
      }
      if (!Array.isArray(services)) {
        setToast('Services not loaded yet.')
        return
      }
      const service = services.find((svc) => svc && svc.id === serviceId)
      if (service) {
        setAddToCartModal({ open: true, service })
      } else {
        setToast('Service not found.')
      }
    } catch (err) {
      console.error('Add to cart click error:', err)
      setToast('Failed to open cart modal.')
    }
  }

  // Add service to cart with portfolio and message
  const handleAddToCart = async ({ portfolioLink, message }) => {
    const serviceId = addToCartModal.service?.id
    if (!serviceId || !user) return

    try {
      const updated = await apiRequest('/cart', {
        method: 'POST',
        body: JSON.stringify({
          userEmail: user.email,
          serviceId,
          quantity: 1,
          portfolioLink,
          message,
        }),
      })
      setCart(updated)
      setToast('Added to cart.')
    } catch (_err) {
      // Cart update failed - fallback to local storage
      const service = addToCartModal.service
      if (service) {
        const newCartItem = {
          id: Date.now().toString(),
          userEmail: user.email,
          serviceId,
          quantity: 1,
          service,
          portfolioLink,
          message,
          addedAt: new Date().toISOString(),
        }
        setCart((prev) => {
          const exists = prev.find((item) => item.serviceId === serviceId)
          if (exists) return prev
          return [...prev, newCartItem]
        })
        setToast('Added to cart (local storage).')
      } else {
        setToast('Unable to update cart right now.')
      }
    }
  }

  // Remove from cart.
  const handleRemoveFromCart = async (cartId) => {
    try {
      if (user?.email) {
        const updated = await apiRequest(`/cart/${cartId}?userEmail=${encodeURIComponent(user.email)}`, {
          method: 'DELETE',
        })
        setCart(updated)
      } else {
        // No user, just remove from local state
        setCart((prev) => prev.filter((item) => item.id !== cartId))
      }
    } catch (_err) {
      // Backend removal failed, remove from local state as fallback
      setCart((prev) => prev.filter((item) => item.id !== cartId))
    }
  }

  // Wishlist toggle.
  const handleToggleWishlist = async (serviceId) => {
    if (!user) {
      setToast('Sign in first.')
      return
    }
    try {
      const updated = await apiRequest('/wishlist', {
        method: 'POST',
        body: JSON.stringify({ userEmail: user.email, serviceId }),
      })
      setWishlist(updated)
    } catch (_err) {
      // Backend wishlist update failed, toggle locally as fallback
      setWishlist((prev) => {
        const exists = prev.find((item) => item.serviceId === serviceId)
        if (exists) return prev.filter((item) => item.serviceId !== serviceId)
        const service = services.find((svc) => svc.id === serviceId)
        return [...prev, { id: Date.now().toString(), serviceId, service }]
      })
    }
  }

  // Helper to check wishlist membership.
  const isWishlisted = (serviceId) => wishlist.some((item) => item.serviceId === serviceId)

  // Checkout - now handled by CheckoutModal, doesn't clear cart
  const handleCheckout = async () => {
    // This function is kept for compatibility but checkout is handled by modal
    // Payment gateway not ready, so we don't process orders yet
    return
  }

  // Fetch admin-only dashboards.
  const fetchAdminData = async (adminEmail) => {
    try {
      const [ordersData, inventoryData] = await Promise.all([
        apiRequest(`/orders?userEmail=${encodeURIComponent(adminEmail)}`),
        apiRequest('/admin/inventory', {
          headers: { 'x-admin-email': adminEmail },
        }),
      ])
      setOrders(ordersData)
      setInventory({
        hosts: Object.entries(inventoryData.servicesByHost || {}).map(([hostEmail, services]) => ({
          hostEmail,
          services,
        })),
        students: Object.entries(inventoryData.cartByStudent || {}).map(([studentEmail, items]) => ({
          studentEmail,
          items,
        })),
      })
    } catch (_err) {
      // Admin dashboard data failed to load - show error but don't crash
      setToast('Admin data failed to load.')
    }
  }

  // Watch for admin logins to load dashboards automatically.
  useEffect(() => {
    if (user?.isAdmin) {
      fetchAdminData(user.email)
    } else if (user) {
      // Load orders for regular users (hosts and students)
      ;(async () => {
        try {
          const ordersData = await apiRequest(`/orders?userEmail=${encodeURIComponent(user.email)}`)
          setOrders(ordersData)
        } catch (_err) {
          // Silently fail
        }
      })()
    }
  }, [user])

  // Refresh orders when cart changes
  useEffect(() => {
    if (user && orders.length > 0) {
      ;(async () => {
        try {
          const ordersData = await apiRequest(`/orders?userEmail=${encodeURIComponent(user.email)}`)
          setOrders(ordersData)
        } catch (_err) {
          // Silently fail
        }
      })()
    }
  }, [cart.length, user])

  // Update body class for host mode animation
  useEffect(() => {
    if (mode === 'host') {
      document.body.classList.add('host-mode-active')
    } else {
      document.body.classList.remove('host-mode-active')
    }
    return () => {
      document.body.classList.remove('host-mode-active')
    }
  }, [mode])

  return (
    <ScrollToTopWrapper>
      <PointerWobble />
      <Navbar
        user={user}
        cart={cart}
        wishlist={wishlist}
        mode={mode}
        onModeChange={handleModeChange}
        onSignOut={handleSignOut}
        onOpenSignIn={() => navigate('/signin')}
        onGoogleSignIn={handleGoogleSignIn}
        onEditProfile={() => setProfileEditModal(true)}
      />

      <Routes>
        <Route
          path="/"
          element={
            <main className={`page-shell ${mode === 'host' ? 'host-mode' : 'student-mode'} ${modeTransition ? 'transitioning' : ''}`}>
              {mode === 'host' ? (
                <div className="host-page">
                  <HostCreateListing
                    user={user}
                    onServiceCreated={handleServiceCreated}
                    services={services || []}
                    onToast={setToast}
                  />
                  {user && (
                    <HostListings
                      user={user}
                      services={services || []}
                      onDelete={handleServiceCreated}
                      onToast={setToast}
                    />
                  )}
                </div>
              ) : (
                <>
                  <Hero mode={mode} />
                  <CategoryTabs
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    mode={mode}
                  />
                  <ServicesGrid
                    services={filteredServices}
                    mode={mode}
                    user={user}
                    onAddToCart={handleAddToCartClick}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={isWishlisted}
                  />
                </>
              )}
            </main>
          }
        />
        <Route
          path="/about"
          element={
            <section className="page-shell">
              <h2>About Fiverr for Students</h2>
              <p>
                A platform connecting student creators with fellow students who need help.
                Hosts can create listings for their services, and students can browse and hire.
              </p>
              <ul className="about-list">
                <li>Payments displayed in INR for local clarity.</li>
                <li>Toggle between Student and Host modes to switch perspectives.</li>
                <li>Create listings, add to cart, and manage your services.</li>
              </ul>
            </section>
          }
        />
        <Route
          path="/cart"
          element={
            <CartPage
              cart={cart}
              onRemove={handleRemoveFromCart}
              onCheckout={handleCheckout}
              loading={loading}
            />
          }
        />
        <Route
          path="/wishlist"
          element={
            <WishlistPage
              wishlist={wishlist}
              onToggle={handleToggleWishlist}
              onAddToCart={handleAddToCartClick}
              mode={mode}
              user={user}
            />
          }
        />
        <Route path="/signin" element={<SignInPage onEmailLogin={handleEmailLogin} loading={loading} />} />
        <Route path="/profile/manage-orders" element={<AdminOrdersPage orders={orders} user={user} cart={cart} />} />
      </Routes>

      <FloatingSearch
        services={services}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpen={() => setSearchOpen(true)}
        onAddToCart={handleAddToCartClick}
        mode={mode}
        user={user}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={isWishlisted}
      />

      <AddToCartModal
        service={addToCartModal.service}
        open={addToCartModal.open}
        onClose={() => setAddToCartModal({ open: false, service: null })}
        onConfirm={handleAddToCart}
        user={user}
      />

      <ProfileEditModal
        user={user}
        open={profileEditModal}
        onClose={() => setProfileEditModal(false)}
        onSave={async (formData) => {
          try {
            const updated = await apiRequest('/users/profile', {
              method: 'PUT',
              body: JSON.stringify({
                email: user.email,
                phoneNumber: formData.phoneNumber,
                usn: formData.usn,
                semester: formData.semester,
              }),
            })
            setUser({ ...user, ...updated })
            setToast('Profile updated successfully!')
          } catch (err) {
            // Fallback to local storage
            const updatedUser = { ...user, ...formData }
            setUser(updatedUser)
            localStorage.setItem('user', JSON.stringify(updatedUser))
            setToast('Profile updated (local storage).')
          }
        }}
      />

      {toast && <div className="toast">{toast}</div>}

      <footer className="footer">
        <Link to="/about" className="footer-link">About</Link>
        <p>© {new Date().getFullYear()} Fiverr for Students</p>
      </footer>
    </ScrollToTopWrapper>
  )
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  )
}

export default App
