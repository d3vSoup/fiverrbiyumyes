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
  Package,
  Mail,
} from 'lucide-react'
import './App.css'
import { supabase, db } from './supabase'

// ---------- Constants describing backend location and allowed domains ----------
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const ALLOWED_DOMAINS = ['bmsce.ac.in', 'bmsca.org', 'bmscl.ac.in']
// Check if Supabase is properly configured with valid credentials
const USE_SUPABASE = (import.meta.env.VITE_USE_SUPABASE === 'true' || !!import.meta.env.VITE_SUPABASE_URL) && supabase !== null

// ---------- Comprehensive Fiverr-style category tabs ----------
const SERVICE_CATEGORIES = [
  { id: 'all', label: 'All Services', emoji: '✨' },
  { id: 'graphics-design', label: 'Graphics & Design', emoji: '🎨' },
  { id: 'programming-tech', label: 'Programming & Tech', emoji: '💻' },
  { id: 'digital-marketing', label: 'Digital Marketing', emoji: '📱' },
  { id: 'video-animation', label: 'Video & Animation', emoji: '🎬' },
  { id: 'writing-translation', label: 'Writing & Translation', emoji: '✍️' },
  { id: 'music-audio', label: 'Music & Audio', emoji: '🎵' },
  { id: 'business', label: 'Business', emoji: '💼' },
  { id: 'finance', label: 'Finance', emoji: '💰' },
  { id: 'ai-services', label: 'AI Services', emoji: '🤖' },
]

// ---------- Detailed service subcategories for popup displays ----------
const SERVICE_SUBCATEGORIES = {
  'graphics-design': [
    'Logo Design', 'Brand Style Guides', 'Business Cards & Stationery', 'Fonts & Typography',
    'Art Direction', 'Illustration', 'AI Artists', 'AI Avatar Design', 'Portraits & Caricatures',
    'Comic Illustration', 'Cartoon Illustration', 'Storyboards', 'Album Cover Design', 'Pattern Design',
    'Website Design', 'App Design', 'UX Design', 'Landing Page Design', 'Icon Design',
    'Industrial & Product Design', 'Character Modeling', 'Game Art', 'Graphics for Streamers',
    'Brochure Design', 'Flyer Design', 'Packaging & Label Design', 'Poster Design',
    'Book Design', 'Book Covers', 'Book Layout Design & Typesetting', 'Children\'s Book Illustration',
    'Comic Book Illustration', 'Image Editing', 'AI Image Editing', 'Presentation Design',
    'Resume Design', 'Infographic Design', 'Vector Tracing', 'Social Media Design',
    'Architecture & Interior Design', 'Landscape Design', 'Building Engineering', 'Lighting Design',
    'T-Shirts & Merchandise', 'Fashion Design', 'Jewelry Design', '3D Architecture',
    '3D Industrial Design', '3D Fashion & Garment', '3D Printing Characters', '3D Landscape', '3D Game Art'
  ],
  'programming-tech': [
    'Business Websites', 'E-Commerce Development', 'Custom Websites', 'Landing Pages', 'Dropshipping Websites',
    'WordPress', 'Shopify', 'Wix', 'Webflow', 'Bubble',
    'Website Customization', 'Bug Fixes', 'Backup & Migration',
    'Python', 'React', 'Java', 'React Native', 'Flutter',
    'AI Websites & Software', 'AI Mobile Apps', 'AI Integrations', 'AI Agents', 'AI Fine-Tuning',
    'AI Technology Consulting', 'Development & MVP', 'Troubleshooting & Improvements',
    'Cross-platform Development', 'Android App Development', 'iOS App Development', 'Mobile App Maintenance',
    'AI Chatbot', 'Rules Based Chatbot',
    'Unreal Engine', 'Unity Developers', 'Roblox', 'Fivem',
    'Cloud Computing', 'DevOps Engineering',
    'Full Stack Web Apps', 'Automations & Agents', 'APIs & Integrations', 'Databases', 'QA & Review',
    'User Testing', 'Decentralized Apps (dApps)', 'Cryptocurrencies & Tokens',
    'Electronics Engineering', 'Support & IT', 'Machine Learning', 'Data Tagging & Annotation'
  ],
  'digital-marketing': [
    'Search Engine Optimization (SEO)', 'Generative Engine Optimization', 'Search Engine Marketing (SEM)',
    'Local SEO', 'E-Commerce SEO', 'Video SEO',
    'Social Media Marketing', 'Paid Social Media', 'Social Commerce', 'Influencer Marketing', 'Online Communities',
    'TikTok Shop', 'Facebook Ads Campaign', 'Instagram Marketing', 'YouTube Promotion', 'Google SEM',
    'Shopify Marketing', 'Video Marketing', 'E-Commerce Marketing', 'Email Marketing', 'Email Automations',
    'Marketing Automation', 'Guest Posting', 'Affiliate Marketing', 'Display Advertising', 'Public Relations',
    'AI Marketing Prompt Strategy', 'Brand Personality Design', 'Email Marketing Personalization',
    'AI-Powered Campaign Management', 'AI-Powered Ad Bidding & Automation',
    'Marketing Strategy', 'Marketing Concepts & Ideation', 'Conversion Rate Optimization (CRO)',
    'Conscious Branding & Marketing', 'Web Analytics', 'Marketing Advice',
    'Music Promotion', 'Podcast Marketing', 'Mobile App Marketing', 'Book & eBook Marketing'
  ],
  'video-animation': [
    'Video Editing', 'Visual Effects', 'Intro & Outro Videos', 'Video Repurposing',
    'Video Templates Editing', 'Subtitles & Captions',
    'Video Ads & Commercials', 'Social Media Videos', 'Music Videos', 'Slideshow Videos',
    'UGC Videos', 'TikTok UGC Videos', 'Instagram UGC Videos', 'Spokesperson Videos',
    'Logo Animation', 'Lottie & Web Animation', 'Text Animation', 'Video Art',
    'Character Animation', 'Animated GIFs', 'Animation for Kids', 'Animation for Streamers', 'Rigging',
    'Videographers', 'Drone Videography', 'Filmed Video Production',
    'Animated Explainers', 'Live Action Explainers', 'Screencasting Videos',
    'eLearning Video Production', 'Crowdfunding Videos',
    '3D Product Animation', 'E-Commerce Product Videos', 'Corporate Videos', 'App & Website Previews',
    'AI UGC', 'AI Video Art', 'AI Videography', 'AI Music Videos', 'AI Video Avatars',
    'Virtual & Streaming Avatars', 'Article to Video', 'Game Trailers', 'Game Recordings & Guides',
    'Meditation Videos', 'Real Estate Promos', 'Book Trailers', 'Video Advice'
  ],
  'music-audio': [
    'Music Producers', 'Composers', 'Singers & Vocalists', 'Session Musicians',
    'Songwriters', 'Jingles & Intros', 'Custom Songs',
    '24hr Turnaround', 'Female Voice Over', 'Male Voice Over', 'French Voice Over', 'German Voice Over',
    'Mixing & Mastering', 'Audio Editing', 'Vocal Tuning',
    'Podcast Production', 'Audiobook Production', 'Audio Ads Production', 'Voice Synthesis & AI',
    'DJ Drops & Tags', 'DJ Mixing', 'Remixing',
    'Sound Design', 'Meditation Music', 'Audio Logo & Sonic Branding',
    'Custom Patches & Samples', 'Audio Plugin Development',
    'Online Music Lessons', 'Music Transcription', 'Music & Audio Advice'
  ]
}

// ---------- Fallback service catalog used if the backend is offline or empty ----------
const FALLBACK_SERVICES = [
  {
    id: 'seed-logo',
    title: 'Professional Logo Design',
    description: 'Custom logo design with multiple revisions, brand identity guidelines, and high-resolution files. Perfect for startups and businesses looking to establish their brand.',
    price: 2500,
    currency: 'INR',
    category: 'graphics-design',
    hostName: 'Riya K',
    hostEmail: 'riya.design@bmsce.ac.in',
    hostRating: 4.9,
    tags: ['logo', 'branding', 'design', 'graphics'],
    deliveryEstimate: '3-5 days',
  },
  {
    id: 'seed-website',
    title: 'Full Stack Web Development',
    description: 'Complete website development using React, Node.js, and MongoDB. Includes responsive design, database setup, and deployment assistance.',
    price: 15000,
    currency: 'INR',
    category: 'programming-tech',
    hostName: 'Arjun M',
    hostEmail: 'arjun.dev@bmsce.ac.in',
    hostRating: 4.8,
    tags: ['web development', 'react', 'nodejs', 'full stack'],
    deliveryEstimate: '2-3 weeks',
  },
  {
    id: 'seed-seo',
    title: 'SEO Optimization Service',
    description: 'Complete SEO audit and optimization for your website. Includes keyword research, on-page optimization, and technical SEO improvements.',
    price: 3500,
    currency: 'INR',
    category: 'digital-marketing',
    hostName: 'Dev Patel',
    hostEmail: 'dev.marketing@bmscl.ac.in',
    hostRating: 4.7,
    tags: ['seo', 'marketing', 'optimization'],
    deliveryEstimate: '1-2 weeks',
  },
  {
    id: 'seed-video',
    title: 'Video Editing & Production',
    description: 'Professional video editing with color correction, transitions, sound design, and motion graphics. Perfect for YouTube, social media, or presentations.',
    price: 2000,
    currency: 'INR',
    category: 'video-animation',
    hostName: 'Sahana P',
    hostEmail: 'sahana.video@bmsce.ac.in',
    hostRating: 5,
    tags: ['video editing', 'production', 'motion graphics'],
    deliveryEstimate: '5-7 days',
  },
  {
    id: 'seed-content',
    title: 'Content Writing & Blog Posts',
    description: 'High-quality blog posts, articles, and web content. SEO-optimized, engaging, and tailored to your target audience. Includes research and proofreading.',
    price: 1500,
    currency: 'INR',
    category: 'writing-translation',
    hostName: 'Nisha V',
    hostEmail: 'nisha.writer@bmsca.org',
    hostRating: 4.8,
    tags: ['content writing', 'blog', 'seo'],
    deliveryEstimate: '3-4 days',
  },
  {
    id: 'seed-music',
    title: 'Music Production & Mixing',
    description: 'Professional music production, mixing, and mastering services. From beats to full tracks, with high-quality audio output ready for distribution.',
    price: 3000,
    currency: 'INR',
    category: 'music-audio',
    hostName: 'Karan S',
    hostEmail: 'karan.music@bmsce.ac.in',
    hostRating: 4.9,
    tags: ['music production', 'mixing', 'mastering'],
    deliveryEstimate: '1 week',
  },
  {
    id: 'seed-ai',
    title: 'AI Chatbot Development',
    description: 'Custom AI chatbot using OpenAI or custom models. Integrates with your website or app, handles customer queries, and provides intelligent responses.',
    price: 8000,
    currency: 'INR',
    category: 'ai-services',
    hostName: 'Priya R',
    hostEmail: 'priya.ai@bmsce.ac.in',
    hostRating: 4.9,
    tags: ['ai', 'chatbot', 'openai', 'automation'],
    deliveryEstimate: '2 weeks',
  },
  {
    id: 'seed-business',
    title: 'Business Plan Writing',
    description: 'Comprehensive business plan with market analysis, financial projections, and strategic planning. Perfect for startups and investors.',
    price: 5000,
    currency: 'INR',
    category: 'business',
    hostName: 'Rahul T',
    hostEmail: 'rahul.business@bmsce.ac.in',
    hostRating: 4.7,
    tags: ['business plan', 'strategy', 'consulting'],
    deliveryEstimate: '1-2 weeks',
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
  navigate,
}) {
  const isHostMode = mode === 'host'

  // Helper function to get first letter of name for PFP
  const getFirstLetter = (name) => {
    if (!name) return '?'
    return name.charAt(0).toUpperCase()
  }

  // Initialize Google Sign-In button
  useEffect(() => {
    if (user) {
      // Clear button if user is signed in
      const googleBtn = document.getElementById('google-signin-button')
      if (googleBtn) googleBtn.innerHTML = ''
      return
    }

    const googleBtn = document.getElementById('google-signin-button')
    if (!googleBtn) return

    const initGoogleSignIn = () => {
      if (!window.google || !window.google.accounts) {
        console.warn('Google Sign-In library not loaded yet')
        return false
      }

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
      if (!clientId) {
        console.error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in .env file')
        googleBtn.innerHTML = '<button class="profile-btn" onclick="window.location.href=\'/signin\'" style="display: flex; align-items: center; gap: 0.5rem;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> Sign In (Configure Google OAuth)</button>'
        return false
      }

      // Clear any existing button
      googleBtn.innerHTML = ''

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: onGoogleSignIn,
          auto_select: false,
          cancel_on_tap_outside: true,
        })

        window.google.accounts.id.renderButton(googleBtn, {
          type: 'standard',
          theme: 'filled_black',
          size: 'medium',
          text: 'signin_with',
          shape: 'pill',
          logo_alignment: 'left',
        })
        return true
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error)
        return false
      }
    }

    // Try immediately if Google is already loaded
    if (window.google && window.google.accounts) {
      initGoogleSignIn()
    } else {
      // Wait for Google script to load (script is async defer in index.html)
      let attempts = 0
      const maxAttempts = 50 // 5 seconds max wait
      const checkGoogle = setInterval(() => {
        attempts++
        if (window.google && window.google.accounts) {
          clearInterval(checkGoogle)
          initGoogleSignIn()
        } else if (attempts >= maxAttempts) {
          clearInterval(checkGoogle)
          console.error('Google Sign-In library failed to load after 5 seconds')
          googleBtn.innerHTML = '<button class="profile-btn" onclick="window.location.href=\'/signin\'" style="display: flex; align-items: center; gap: 0.5rem;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> Sign In</button>'
        }
      }, 100)
    }

    return () => {
      if (googleBtn) {
        googleBtn.innerHTML = ''
      }
    }
  }, [user, onGoogleSignIn])

  // Handle mode change - navigate to home to show the appropriate page
  const handleModeToggle = (newMode) => {
    onModeChange(newMode)
    // Always navigate to home when switching modes
    navigate('/')
  }

  return (
    <header className={`nav-shell ${isHostMode ? 'nav-light' : 'nav-dark'}`}>
      <Link to="/" className="logo-pair">
        <span className="logo-green">Fiverr</span>
        <span className="logo-muted">for Students</span>
      </Link>

      <div className="mode-switch mode-switch-center">
        <button
          className={mode === 'student' ? 'mode-active' : ''}
          onClick={() => handleModeToggle('student')}
        >
          Services
        </button>
        <button
          className={mode === 'host' ? 'mode-active' : ''}
          onClick={() => handleModeToggle('host')}
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
                  <span className="profile-avatar-initial">{getFirstLetter(user.email)}</span>
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
              <>
                <Link to="/profile/manage-orders" className="profile-link">
                  <ShieldCheck size={16} /> Manage Orders
                </Link>
                <Link to="/profile/manage-items" className="profile-link">
                  <Package size={16} /> Manage Items
                </Link>
              </>
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
  // All hooks must be called at the top of the component before any conditionals
  const [interestOpenId, setInterestOpenId] = useState(null)

  if (!user) {
    return (
      <div className="host-listings-empty">
        <p>Sign in to see your listings</p>
      </div>
    )
  }

  // Filter out example services (those that start with 'seed-') for host listings
  const userListings = (services || []).filter((s) => 
    s && s.hostEmail === user.email && !s.id.startsWith('seed-')
  )

  const handleDelete = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this listing?')) return
    
    try {
      if (USE_SUPABASE) {
        await db.deleteService(serviceId, user.email)
      } else {
        await apiRequest(`/services/${serviceId}`, {
          method: 'DELETE',
          headers: { 'x-user-email': user.email },
        })
      }
      if (onToast) onToast('Listing deleted successfully')
      if (onDelete) onDelete()
    } catch (err) {
      console.error('Delete error:', err)
      if (onToast) onToast(err.message || 'Failed to delete listing')
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
          <div
            key={listing.id}
            className="host-listing-card"
            onClick={() => setInterestOpenId(listing.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') setInterestOpenId(listing.id) }}
            style={{ cursor: 'pointer' }}
          >
            <div className="host-listing-content">
              <div className="host-listing-header">
                <h4>{listing.title}</h4>
                <button
                  className="btn-delete-listing"
                  onClick={(e) => { e.stopPropagation(); handleDelete(listing.id) }}
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
            <HostInterestInfo
              serviceId={listing.id}
              onViewInterest={setInterestOpenId}
            />
          </div>
        ))}
      </div>
      <HostInterestsModal
        serviceId={interestOpenId}
        open={Boolean(interestOpenId)}
        onClose={() => setInterestOpenId(null)}
      />
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
  const [charCount, setCharCount] = useState(0)

  const MIN_CHARS = 10

  const handleDescriptionChange = (e) => {
    const text = e.target.value
    setFormData({ ...formData, description: text })
    setCharCount(text.trim().length)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      if (onToast) onToast('Please sign in to create a listing')
      return
    }

    if (charCount < MIN_CHARS) {
      if (onToast) onToast(`Description must be at least ${MIN_CHARS} characters (currently ${charCount})`)
      return
    }

    setLoading(true)
    try {
      const price = formData.priceRange
        ? { min: parseFloat(formData.priceMin), max: parseFloat(formData.priceMax) }
        : parseFloat(formData.price)

      let newService
      if (USE_SUPABASE) {
        // Use Supabase to create service
        const serviceData = await db.createService({
          title: formData.title,
          description: formData.description,
          price,
          category: formData.category,
          hostName: user.name,
          hostEmail: user.email,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
          deliveryEstimate: formData.deliveryEstimate,
          portfolioLink: formData.portfolioLink || null,
        })
        // Transform Supabase service to match expected format
        newService = {
          id: serviceData.id,
          title: serviceData.title,
          description: serviceData.description,
          category: serviceData.category,
          price: serviceData.price_min && serviceData.price_max
            ? { min: serviceData.price_min, max: serviceData.price_max }
            : (serviceData.price_in_inr || 0),
          hostName: serviceData.host_name,
          hostEmail: serviceData.host_email,
          tags: serviceData.tags || [],
          deliveryEstimate: serviceData.delivery_estimate,
          portfolioLink: serviceData.portfolio_link,
        }
      } else {
        // Use REST API
        newService = await apiRequest('/services', {
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
      }
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
      setCharCount(0)
      if (onServiceCreated) onServiceCreated(newService)
    } catch (err) {
      const errorMessage = err?.message || 'Failed to create listing. Please try again.'
      if (onToast) onToast(errorMessage)
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
            Description <span className="char-count">({charCount}/{MIN_CHARS} characters minimum)</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={handleDescriptionChange}
            placeholder="Describe what you offer in detail. Minimum 10 characters required..."
            rows={6}
            required
            className={charCount < MIN_CHARS ? 'description-warning' : ''}
          />
          {charCount < MIN_CHARS && (
            <p className="char-count-warning">
              {MIN_CHARS - charCount} more characters needed
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
 * ServiceDetailModal - beautiful popup showing full service details
 */
function ServiceDetailModal({ service, open, onClose, onAddToCart, onToggleWishlist, isWishlisted, user, mode }) {
  if (!open || !service) return null

  // Handle price display - could be number or object with min/max
  const getPriceDisplay = () => {
    if (typeof service.price === 'object' && service.price?.min && service.price?.max) {
      return `₹${service.price.min.toLocaleString('en-IN')} - ₹${service.price.max.toLocaleString('en-IN')}`
    }
    return `₹${(service.price || service.price_in_inr || 0).toLocaleString('en-IN')}`
  }
  
  const price = getPriceDisplay()

  return (
    <div className="modal-overlay service-detail-overlay" onClick={onClose}>
      <div className="modal-content service-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close service-detail-close" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="service-detail-header">
          <div className="service-detail-header-top">
            <div>
              <span className="service-detail-category">{service.category}</span>
              <h2 className="service-detail-title">{service.title}</h2>
            </div>
            <button
              className={isWishlisted(service.id) ? 'wishlist-btn active service-detail-wishlist' : 'wishlist-btn service-detail-wishlist'}
              onClick={() => onToggleWishlist(service.id)}
            >
              <Heart size={20} />
            </button>
          </div>
          
          <div className="service-detail-host">
            <div className="host-meta">
              <Star size={18} fill="#ffc107" />
              <span className="host-rating">{service.hostRating ?? 4.8}</span>
              <span className="host-name">· {service.hostName}</span>
            </div>
            {service.hostEmail && (
              <span className="host-email">{service.hostEmail}</span>
            )}
          </div>
        </div>

        <div className="service-detail-body">
          <div className="service-detail-description">
            <h3>About This Service</h3>
            <p>{service.description}</p>
          </div>

          {service.tags && service.tags.length > 0 && (
            <div className="service-detail-tags">
              <h3>Skills & Tags</h3>
              <div className="tags-list">
                {service.tags.map((tag, idx) => (
                  <span key={idx} className="tag">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {service.deliveryEstimate && (
            <div className="service-detail-delivery">
              <h3>Delivery Time</h3>
              <p>{service.deliveryEstimate}</p>
            </div>
          )}

          {service.portfolioLink && (
            <div className="service-detail-portfolio">
              <h3>Portfolio</h3>
              <a href={service.portfolioLink} target="_blank" rel="noopener noreferrer" className="portfolio-link">
                View Portfolio →
              </a>
            </div>
          )}
        </div>

        <div className="service-detail-footer">
          <div className="service-detail-price">
            <span className="price-label">Starting at</span>
            <span className="price-value">{price}</span>
          </div>
          {mode === 'student' ? (
            <button
              className="btn-primary btn-add-to-cart-large"
              disabled={!user}
              onClick={(e) => {
                e.stopPropagation()
                onAddToCart(service.id)
              }}
            >
              {user ? 'Show Interest' : 'Sign in to Show Interest'}
            </button>
          ) : (
            <span className="host-hint">Switch to student mode to hire</span>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * ServicesGrid shows each listing with wishlist/cart actions and INR pricing.
 * Now opens a detailed popup when clicked.
 */
function ServicesGrid({
  services,
  mode,
  user,
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
  onServiceClick,
}) {
  const displayList = services

  return (
    <div className="grid">
      {displayList.map((service) => (
        <article 
          key={service.id} 
          className="service-card service-card-clickable"
          onClick={() => onServiceClick(service)}
        >
          <header>
            <div>
              <p className="service-category">{service.category}</p>
              <h3>{service.title}</h3>
              <p className="service-blurb">{service.description}</p>
            </div>
            <button
              className={isWishlisted(service.id) ? 'wishlist-btn active' : 'wishlist-btn'}
              onClick={(e) => {
                e.stopPropagation()
                onToggleWishlist(service.id)
              }}
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
              <strong>
                {typeof service.price === 'object' && service.price?.min
                  ? `₹${service.price.min.toLocaleString('en-IN')}+`
                  : `₹${(service.price || 0).toLocaleString('en-IN')}`}
              </strong>
              {mode === 'student' ? (
                <button
                  className="btn-primary small"
                  disabled={!user}
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddToCart(service.id)
                  }}
                >
                    Interested
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
  const [negotiationOpen, setNegotiationOpen] = useState(false)
  const [negotiationPrice, setNegotiationPrice] = useState('')
  const [interestCount, setInterestCount] = useState(0)
  const MAX_CHARS = 50

  useEffect(() => {
    if (open && service?.id) {
      // Load interest count from cart for this service
      const localCart = JSON.parse(localStorage.getItem('local_cart') || '[]')
      const count = localCart.filter(item => item.serviceId === service.id).length
      setInterestCount(count)
    }
  }, [open, service?.id])

  useEffect(() => {
    if (!open) {
      setPortfolioLink('')
      setMessage('')
      setCharCount(0)
      setNegotiationOpen(false)
      setNegotiationPrice('')
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
    // Pass negotiationPrice if set
    onConfirm({ portfolioLink, message, negotiationPrice: negotiationOpen ? negotiationPrice : null })
    onClose()
  }

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Show Interest {interestCount > 0 && <span style={{ fontSize: '0.8em', color: '#666', marginLeft: 8 }}>({interestCount})</span>}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-service-info">
            <h4>{service?.title}</h4>
            <p>{service?.description}</p>
            {service?.hostEmail && (
              <p className="host-contact-info">
                <strong>Contact Host:</strong> <a href={`mailto:${service.hostEmail}`}>{service.hostEmail}</a>
              </p>
            )}
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
              onClick={(e) => e.stopPropagation()}
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
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation()
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
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              className={`btn-primary${negotiationOpen ? ' active' : ''}`}
              style={{ minWidth: 140, padding: '0.5em 1.5em', fontWeight: 600 }}
              onClick={(e) => { e.stopPropagation(); setNegotiationOpen((prev) => !prev) }}
            >
              Negotiate for
            </button>
            {negotiationOpen && (
              <input
                type="number"
                min="0"
                step="100"
                value={negotiationPrice}
                onChange={e => setNegotiationPrice(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Enter your price (INR)"
                className="negotiation-input"
                style={{ marginLeft: 8, width: 160, fontSize: 16, padding: '0.5em' }}
              />
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-ghost" onClick={(e) => { e.stopPropagation(); onClose() }}>Cancel</button>
          <button
            type="button"
            className="btn-primary"
            onClick={(e) => {
              e.stopPropagation()
              handleConfirm()
            }}
            disabled={!portfolioLink.trim() || charCount === 0}
          >
            Submit Interest
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

  // Helper function to get first letter of name for avatar
  const getFirstLetter = (name) => {
    if (!name) return '?'
    return name.charAt(0).toUpperCase()
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
                  <span className="profile-edit-initial">{getFirstLetter(user.name)}</span>
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
 * CartPage shows interested services with contact host via email.
 */
function CartPage({ cart, onRemove, onCheckout, loading }) {
  // Calculate total - use negotiated price if available, otherwise use service price
  const total = cart.reduce((sum, item) => {
    if (item.negotiationPrice) {
      return sum + parseFloat(item.negotiationPrice)
    }
    const price = item.service?.price
    if (typeof price === 'object' && price.min && price.max) {
      return sum + (price.min + price.max) / 2
    }
    return sum + (price || 0)
  }, 0)

  // Handle proceed to contact - opens mailto with all hosts
  const handleContactHosts = () => {
    // Get unique host emails from cart items
    const hostEmails = [...new Set(cart.map(item => item.service?.hostEmail).filter(Boolean))]
    
    if (hostEmails.length === 0) {
      alert('No hosts to contact.')
      return
    }

    // Create mailto link
    const subject = encodeURIComponent('Interest in Your Service')
    const body = encodeURIComponent(
      `Hello,\n\nI am interested in your service(s) listed on Fiverr for Students.\n\n` +
      `Service(s):\n${cart.map(item => `- ${item.service?.title}`).join('\n')}\n\n` +
      `Please let me know more details.\n\nThank you!`
    )
    
    if (hostEmails.length === 1) {
      // Single host - direct email
      window.location.href = `mailto:${hostEmails[0]}?subject=${subject}&body=${body}`
    } else {
      // Multiple hosts - show options
      const emailList = hostEmails.join(', ')
      window.location.href = `mailto:?bcc=${emailList}&subject=${subject}&body=${body}`
    }
  }

  // Handle remove item from cart
  const handleRemove = (cartId) => {
    if (onRemove) onRemove(cartId)
  }

  return (
    <section className="page-shell">
      <h2>Cart</h2>
      {cart.length === 0 ? (
        <p className="empty-note">Nothing in cart yet. Browse services and show interest!</p>
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
                {item.service?.hostEmail && (
                  <p className="cart-host-contact">
                    <strong>Host:</strong> <a href={`mailto:${item.service.hostEmail}`}>{item.service.hostEmail}</a>
                  </p>
                )}
                <div className="cart-item-price">
                  <div>
                    <strong>Host price:</strong> {typeof item.service?.price === 'object' && item.service?.price?.min
                      ? `₹${item.service.price.min.toLocaleString('en-IN')} - ₹${item.service.price.max.toLocaleString('en-IN')}`
                      : `₹${(item.service?.price || 0).toLocaleString('en-IN')}`}
                  </div>
                  {item.negotiationPrice && (
                    <div style={{ marginTop: 8, color: '#10b981' }}>
                      <strong>Your negotiated price:</strong> ₹{item.negotiationPrice}
                    </div>
                  )}
                </div>
              </div>
              <div className="cart-item-remove">
                <button className="btn-remove" onClick={() => handleRemove(item.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
          <footer className="cart-footer">
            <div className="cart-total">
              <strong>Total: ₹{total.toLocaleString('en-IN')}</strong>
              <span className="item-count">({cart.length} item{cart.length > 1 ? 's' : ''})</span>
            </div>
            <button 
              className="btn-primary btn-contact-hosts" 
              disabled={loading} 
              onClick={handleContactHosts}
            >
              <Mail size={18} />
              {loading ? 'Loading...' : 'Proceed to Contact Hosts'}
            </button>
          </footer>
        </div>
      )}
    </section>
  )
}

/**
 * WishlistPage allows moving saved services into the cart.
 */
function WishlistPage({ wishlist, onToggle, onAddToCart, onRemoveFromWishlist, mode, user }) {
  const handleRemoveClick = (e, wishlistId) => {
    e.preventDefault()
    e.stopPropagation()
    onRemoveFromWishlist(wishlistId)
  }

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
                <div className="header-actions">
  <button
    className="btn-remove-wishlist"
    onClick={(e) => handleRemoveClick(e, item.id)}
  >
    <X size={16} />
  </button>
</div>

              </header>
              <footer>
                <div className="host-meta">
                  <span>{item.service?.hostName}</span>
                </div>
                <div className="price-group">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <strong>
                      {typeof item.service?.price === 'object' && item.service?.price?.min
                        ? `₹${item.service.price.min.toLocaleString('en-IN')} - ₹${item.service.price.max.toLocaleString('en-IN')}`
                        : `₹${(item.service?.price || 0).toLocaleString('en-IN')}`}
                    </strong>
                    {item.negotiationPrice && (
                      <span style={{ fontSize: '0.85em', color: '#10b981', fontWeight: 600 }}>
                        Negotiated: ₹{item.negotiationPrice}
                      </span>
                    )}
                  </div>
                  <button
                    className="btn-primary small"
                    disabled={mode !== 'student' || !user}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onAddToCart(item.serviceId)
                    }}
                  >
                    Interested
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
 * HostInterestsModal - shows interests in a hosted service
 * Moved to top level to avoid z-index/clipping issues
 */
function HostInterestsModal({ serviceId, open, onClose }) {
  const [interests, setInterests] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function fetchInterests() {
      setLoading(true)
      try {
        const data = await db.getInterestsForService(serviceId)
        if (mounted) setInterests(data)
      } catch (err) {
        console.error('Failed to fetch interests:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (serviceId && open) fetchInterests()
    else if (!open) setInterests([]) // Clear on close
    return () => { mounted = false }
  }, [serviceId, open])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600, maxHeight: '80vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h3>Student Interests</h3>
          <button className="modal-close" onClick={(e) => { e.stopPropagation(); onClose() }}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {loading ? (
            <p style={{ textAlign: 'center', padding: 20 }}>Loading interests...</p>
          ) : interests.length === 0 ? (
            <p style={{ textAlign: 'center', padding: 20, color: '#666' }}>No student interests yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {interests.map((interest, idx) => (
                <div key={idx} style={{ 
                  padding: 16, 
                  border: '1px solid #e5e7eb', 
                  borderRadius: 8,
                  backgroundColor: '#f9fafb'
                }}>
                  <div style={{ marginBottom: 8 }}>
                    <p style={{ fontWeight: 600, margin: '0 0 4px 0' }}>
                      📧 {interest.user_email}
                    </p>
                  </div>
                  
                  {interest.message && (
                    <div style={{ marginBottom: 8 }}>
                      <p style={{ fontSize: '0.9em', color: '#4b5563', margin: '0 0 4px 0', fontWeight: 500 }}>Message:</p>
                      <p style={{ fontSize: '0.9em', color: '#666', margin: 0, fontStyle: 'italic' }}>"{interest.message}"</p>
                    </div>
                  )}
                  
                  {interest.portfolio_link && (
                    <div style={{ marginBottom: 8 }}>
                      <a href={interest.portfolio_link} target="_blank" rel="noopener noreferrer" 
                        style={{ fontSize: '0.9em', color: '#3b82f6', textDecoration: 'none' }}>
                        🔗 View Portfolio
                      </a>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 12 }}>
                    <div>
                      {interest.negotiation_price ? (
                        <div>
                          <p style={{ fontSize: '0.85em', color: '#666', margin: '0 0 4px 0' }}>Negotiated Price:</p>
                          <p style={{ fontSize: '1.1em', fontWeight: 700, color: '#10b981', margin: 0 }}>
                            ₹{parseInt(interest.negotiation_price).toLocaleString('en-IN')}
                          </p>
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.9em', color: '#999', margin: 0 }}>Interested in host price</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${interest.user_email}` }}
                      style={{
                        padding: '0.5em 1em',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: '0.9em',
                        fontWeight: 500
                      }}
                    >
                      Contact
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * HostInterestInfo component - button to trigger interest modal
 */
function HostInterestInfo({ serviceId, onViewInterest }) {
  return (
    <button className="btn-view-interest" onClick={(e) => { e.stopPropagation(); onViewInterest(serviceId) }}>
      View Interest
    </button>
  )
}

/**
 * WelcomeSignInModal - Merch-style welcome modal with Google Sign-In
 */
function WelcomeSignInModal({ open, onClose, onGoogleSignIn, user }) {
  const [showAccountDropdown, setShowAccountDropdown] = useState(false)

  useEffect(() => {
    if (user) {
      setShowAccountDropdown(false)
    }
  }, [user])

  if (!open) return null

  return (
    <div className="welcome-modal-overlay" onClick={onClose}>
      <div className="welcome-modal" onClick={(e) => e.stopPropagation()}>
        <div className="welcome-modal-header">
          <h2>Welcome</h2>
          <button className="welcome-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="welcome-modal-body">
          {!user ? (
            <>
              <p className="welcome-text">Sign in to access your cart and orders.</p>
              <div className="welcome-google-signin">
                <div className="welcome-google-button-container">
                  <div id="welcome-google-signin-button" className="welcome-google-button-wrapper" />
                </div>
                <div className="welcome-domains-info">
                  <p className="welcome-domains-title">Use your BMSCE Google account:</p>
                  <ul className="welcome-domains-list">
                    <li>@bmsce.ac.in</li>
                    <li>@bmsca.org</li>
                    <li>@bmscl.ac.in</li>
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className="welcome-signed-in">
              <p className="welcome-signed-in-text">Signed in as:</p>
              <div className="welcome-user-info">
                {user.image && (
                  <img src={user.image} alt={user.name} className="welcome-user-avatar" />
                )}
                <div className="welcome-user-details">
                  <p className="welcome-user-name">{user.name}</p>
                  <p className="welcome-user-email">{user.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * SignInPage lets users provide campus email or use Google OAuth.
 */
function SignInPage({ onEmailLogin, onGoogleSignIn, loading, user }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(!user)

  // Initialize Google Sign-In button in the welcome modal
  useEffect(() => {
    if (!welcomeModalOpen || user) return

    const googleBtn = document.getElementById('welcome-google-signin-button')
    if (!googleBtn) return

    const initGoogleSignIn = () => {
      if (!window.google || !window.google.accounts) {
        console.warn('Google Sign-In library not loaded yet')
        return false
      }

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
      if (!clientId) {
        console.error('Google Client ID not configured')
        googleBtn.innerHTML = '<p style="color: #ef4444; padding: 1rem;">Google Sign-In not configured. Please set VITE_GOOGLE_CLIENT_ID in .env</p>'
        return false
      }

      googleBtn.innerHTML = ''

      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: onGoogleSignIn,
          auto_select: false,
          cancel_on_tap_outside: true,
        })

        window.google.accounts.id.renderButton(googleBtn, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: '100%',
        })
        return true
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error)
        return false
      }
    }

    if (window.google && window.google.accounts) {
      initGoogleSignIn()
    } else {
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.accounts) {
          clearInterval(checkGoogle)
          initGoogleSignIn()
        }
      }, 100)

      setTimeout(() => clearInterval(checkGoogle), 5000)
    }

    return () => {
      if (googleBtn) {
        googleBtn.innerHTML = ''
      }
    }
  }, [welcomeModalOpen, user, onGoogleSignIn])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    try {
      await onEmailLogin({ email, name })
      setWelcomeModalOpen(false)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
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
            onClick={() => setWelcomeModalOpen(true)}
          >
            Continue with Google
          </button>
          {error && <p className="error-note">{error}</p>}
        </form>
      </section>
      <WelcomeSignInModal
        open={welcomeModalOpen}
        onClose={() => setWelcomeModalOpen(false)}
        onGoogleSignIn={(credentialResponse) => {
          onGoogleSignIn(credentialResponse)
          setWelcomeModalOpen(false)
        }}
        user={user}
      />
    </>
  )
}

/**
 * AdminManageItemsPage shows all hosted services with host details and allows admin to add/remove items
 */
function AdminManageItemsPage({ inventory, user, onServiceDeleted, onToast }) {
  const [hosts, setHosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [viewInterestServiceId, setViewInterestServiceId] = useState(null)

  useEffect(() => {
    if (inventory && inventory.hosts) {
      setHosts(inventory.hosts)
    }
  }, [inventory])

  const handleDeleteService = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this service? This action cannot be undone.')) return
    
    setDeletingId(serviceId)
    setLoading(true)
    try {
      if (USE_SUPABASE) {
        await db.deleteServiceAdmin(serviceId)
      } else {
        await apiRequest(`/services/${serviceId}`, {
          method: 'DELETE',
          headers: { 'x-admin-email': user?.email },
        })
      }
      if (onToast) onToast('Service deleted successfully')
      if (onServiceDeleted) onServiceDeleted()
    } catch (err) {
      console.error('Delete service error:', err)
      if (onToast) onToast(err.message || 'Failed to delete service')
    } finally {
      setDeletingId(null)
      setLoading(false)
    }
  }



  if (!user?.isAdmin) {
    return (
      <section className="page-shell">
        <h2>Access Denied</h2>
        <p>You must be an admin to access this page.</p>
      </section>
    )
  }

  return (
    <section className="page-shell">
      <h2>Admin · Manage Items</h2>
      <p className="admin-note">View and manage all hosted services. You can see who hosted each item and their details.</p>
      
      {hosts.length === 0 ? (
        <p className="empty-note">No hosted services found.</p>
      ) : (
        <div className="admin-items-container">
          {hosts.map((hostGroup) => (
            <div key={hostGroup.hostEmail} className="admin-host-group">
              <div className="admin-host-header">
                <div className="admin-host-info">
                  <h3>{hostGroup.hostName || hostGroup.hostEmail}</h3>
                  <p className="admin-host-email">{hostGroup.hostEmail}</p>
                  {hostGroup.phoneNumber && <p className="admin-host-phone">📱 {hostGroup.phoneNumber}</p>}
                  {hostGroup.usn && <p className="admin-host-usn">🎓 USN: {hostGroup.usn}</p>}
                  {hostGroup.semester && <p className="admin-host-semester">📚 Semester: {hostGroup.semester}</p>}
                </div>
                <div className="admin-host-stats">
                  <span className="admin-host-service-count">{hostGroup.services?.length || 0} service(s)</span>
                </div>
              </div>
              
              <div className="admin-services-grid">
                {hostGroup.services?.map((service) => (
                  <div key={service.service_id} className="admin-service-card">
                    <div className="admin-service-header">
                      <h4>{service.title}</h4>
                      <button
                        className="btn-delete-admin"
                        onClick={() => handleDeleteService(service.service_id)}
                        disabled={loading && deletingId === service.service_id}
                        title="Delete service"
                      >
                        {loading && deletingId === service.service_id ? (
                          <span className="loading-spinner">⏳</span>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                    <p className="admin-service-category">{service.category}</p>
                    <p className="admin-service-price">
                      {service.price_min && service.price_max
                        ? `₹${service.price_min.toLocaleString('en-IN')} - ₹${service.price_max.toLocaleString('en-IN')}`
                        : `₹${(service.price_in_inr || 0).toLocaleString('en-IN')}`}
                    </p>
                    {service.delivery_estimate && (
                      <p className="admin-service-delivery">⏱️ {service.delivery_estimate}</p>
                    )}
                    {service.created_at && (
                      <p className="admin-service-created">
                        Created: {new Date(service.created_at).toLocaleDateString()}
                      </p>
                    )}
                    {/* Show interest count and emails */}
                    <HostInterestInfo serviceId={service.service_id} onViewInterest={setViewInterestServiceId} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <HostInterestsModal
        serviceId={viewInterestServiceId}
        open={Boolean(viewInterestServiceId)}
        onClose={() => setViewInterestServiceId(null)}
      />
    </section>
  )
}

/**
 * AdminOrdersPage shows comprehensive order details with buyer/host info, portfolio links, and chat
 * Also shows cart/interested items from inventory for admin
 */
function AdminOrdersPage({ orders, user, cart, inventory }) {
  const isAdmin = user?.isAdmin || false
  const isHost = user && orders.some((o) => o.hostEmail === user.email)

  // Determine order status based on cart and payment
  const getOrderStatus = (order) => {
    // Check if item is still in cart
    const inCart = cart.some((item) => item.serviceId === order.serviceId)
    if (inCart) {
      return { status: 'Interested', className: 'order-status-carted' }
    }
    // Check if paid (status would be 'paid' or 'completed')
    if (order.status === 'paid' || order.status === 'completed') {
      return { status: 'Paid', className: 'order-status-paid' }
    }
    // Default to pending
    return { status: order.status || 'Pending', className: `order-status-${order.status || 'pending'}` }
  }

  // Transform cart items from inventory for admin view
  const cartItemsFromInventory = isAdmin && inventory?.students ? inventory.students.flatMap(student => 
    student.items?.map(item => ({
      id: `cart-${item.id}`,
      type: 'cart',
      buyerEmail: student.studentEmail,
      buyerName: student.studentName,
      buyerUsn: student.usn,
      buyerPhone: student.phoneNumber,
      buyerSemester: student.semester,
      serviceId: item.serviceId,
      service: item.service,
      listingTitle: item.service?.title,
      listingDescription: item.service?.description,
      hostEmail: item.service?.hostEmail,
      hostName: item.service?.hostName,
      portfolioLink: item.portfolioLink,
      message: item.message,
      quantity: item.quantity || 1,
      price: item.service?.price,
      total: typeof item.service?.price === 'object' 
        ? ((item.service.price.min + item.service.price.max) / 2) * (item.quantity || 1)
        : (item.service?.price || 0) * (item.quantity || 1),
      createdAt: new Date().toISOString(),
      placedAt: new Date().toISOString(),
    })) || []
  ) : []

  // Combine orders with cart items for admin
  const allItems = isAdmin ? [...orders, ...cartItemsFromInventory] : orders

  return (
    <section className="page-shell">
      <h2>{isAdmin ? 'Admin' : isHost ? 'Host' : 'Manage'} · Orders</h2>
      {isAdmin && (
        <p className="host-orders-note">Viewing all orders and interested items. Students who are interested in services and hosts who have created listings.</p>
      )}
      {isHost && (
        <p className="host-orders-note">Viewing orders for your listings. Students are looking for your services.</p>
      )}
      {allItems.length === 0 ? (
        <p className="empty-note">No orders or interested items yet. Items will appear here when students show interest in services.</p>
      ) : (
        <div className="orders-grid">
          {allItems.map((order) => {
            const statusInfo = getOrderStatus(order)
            const isCartItem = order.type === 'cart'
            return (
              <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>{isCartItem ? 'Interested' : 'Order'} #{order.id.slice(0, 8)}</h3>
                  <span className={isCartItem ? 'order-status-carted' : statusInfo.className}>
                    {isCartItem ? 'Interested' : statusInfo.status}
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
                  {order.buyerUsn && <p className="usn">🎓 USN: {order.buyerUsn}</p>}
                  {order.buyerPhone && <p className="phone">📱 {order.buyerPhone}</p>}
                  {order.buyerSemester && <p className="semester">📚 Semester: {order.buyerSemester}</p>}
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
  const [cart, setCart] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [orders, setOrders] = useState([])
  const [inventory, setInventory] = useState({ hosts: [], students: [] })
  const [loading, setLoading] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [modeTransition, setModeTransition] = useState(false)
  const [addToCartModal, setAddToCartModal] = useState({ open: false, service: null })
  const [profileEditModal, setProfileEditModal] = useState(false)
  const [serviceDetailModal, setServiceDetailModal] = useState({ open: false, service: null })

  // Load services on mount with Supabase or backend fallback.
  useEffect(() => {
    async function loadServices() {
      try {
        let data
        if (USE_SUPABASE) {
          // Use Supabase
          const servicesData = await db.getServices()
          // Transform Supabase data to match expected format
          data = servicesData.map(svc => ({
            id: svc.id,
            title: svc.title,
            description: svc.description,
            category: svc.category,
            price: svc.price_min && svc.price_max 
              ? { min: svc.price_min, max: svc.price_max }
              : (svc.price_in_inr || 0),
            hostName: svc.host_name,
            hostEmail: svc.host_email,
            hostRating: 4.8, // Default rating
            tags: svc.tags || [],
            deliveryEstimate: svc.delivery_estimate,
            portfolioLink: svc.portfolio_link,
          }))
        } else {
          // Use REST API
          data = await apiRequest('/services')
        }
        
        if (Array.isArray(data)) {
          // Always combine database services with fallback services
          const allServices = [...data, ...FALLBACK_SERVICES]
          setServices(allServices)
          setFilteredServices(allServices)
        } else {
          throw new Error('Invalid services data')
        }
      } catch (_err) {
        // Backend is offline, use fallback services so the UI still works
        console.error('Failed to load services:', _err)
        setServices(FALLBACK_SERVICES)
        setFilteredServices(FALLBACK_SERVICES)
        setToast(USE_SUPABASE ? 'Failed to load services from database. Showing example services only.' : 'Backend offline, showing fallback services.')
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
      let data
      if (USE_SUPABASE) {
        // Use Supabase
        const servicesData = await db.getServices()
        data = servicesData.map(svc => ({
          id: svc.id,
          title: svc.title,
          description: svc.description,
          category: svc.category,
          price: svc.price_min && svc.price_max
            ? { min: svc.price_min, max: svc.price_max }
            : (svc.price_in_inr || 0),
          hostName: svc.host_name,
          hostEmail: svc.host_email,
          hostRating: 4.8,
          tags: svc.tags || [],
          deliveryEstimate: svc.delivery_estimate,
          portfolioLink: svc.portfolio_link,
        }))
      } else {
        // Use REST API
        data = await apiRequest('/services')
      }
      if (Array.isArray(data)) {
        // Always combine database services with fallback services
        const allServices = [...data, ...FALLBACK_SERVICES]
        setServices(allServices)
        setFilteredServices(allServices)
      }
    } catch (_err) {
      // Backend offline, try to reload from current state
      console.error('Failed to reload services:', _err)
    }
  }

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

  // Persist cart to localStorage always (for example services and backup)
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  // Persist wishlist to localStorage always (for example services and backup)
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist))
  }, [wishlist])

  // Persist cart to localStorage for local/demo services (for non-Supabase backup and demo persistence)
  useEffect(() => {
    const localItems = cart.filter(item => item.id?.startsWith('local-'))
    if (localItems.length > 0) {
      localStorage.setItem('local_cart', JSON.stringify(localItems))
    }
  }, [cart])

  // Load cart and wishlist from database when user is available
  useEffect(() => {
    if (!user) {
      // No user - load from localStorage as fallback
      try {
        const savedCart = localStorage.getItem('cart')
        const savedWishlist = localStorage.getItem('wishlist')
        if (savedCart) {
          const cartData = JSON.parse(savedCart)
          if (Array.isArray(cartData)) setCart(cartData)
        }
        if (savedWishlist) {
          const wishlistData = JSON.parse(savedWishlist)
          if (Array.isArray(wishlistData)) setWishlist(wishlistData)
        }
      } catch (_err) {
        // Invalid data, ignore
      }
      return
    }

    // User is signed in - load from Supabase and merge with localStorage
    localStorage.setItem('user', JSON.stringify(user))
    ;(async () => {
      try {
        let cartData, wishlistData
        if (USE_SUPABASE) {
          // Use Supabase
          [cartData, wishlistData] = await Promise.all([
            db.getCart(user.email),
            db.getWishlist(user.email),
          ])
        } else {
          // Use REST API
          [cartData, wishlistData] = await Promise.all([
            apiRequest(`/cart?userEmail=${encodeURIComponent(user.email)}`),
            apiRequest(`/wishlist?userEmail=${encodeURIComponent(user.email)}`),
          ])
        }
        
        // Load local items (example services)
        let localCart = []
        let localWishlist = []
        try {
          const savedLocalCart = localStorage.getItem('local_cart')
          const savedLocalWishlist = localStorage.getItem('local_wishlist')
          if (savedLocalCart) localCart = JSON.parse(savedLocalCart).filter(item => item.id?.startsWith('local-'))
          if (savedLocalWishlist) localWishlist = JSON.parse(savedLocalWishlist).filter(item => item.id?.startsWith('local-'))
        } catch (_e) {
          // Ignore local storage errors
        }
        
        // Merge database items with local items
        if (Array.isArray(cartData)) {
          setCart([...cartData, ...localCart])
        } else {
          setCart(localCart)
        }
        if (Array.isArray(wishlistData)) {
          setWishlist([...wishlistData, ...localWishlist])
        } else {
          setWishlist(localWishlist)
        }
      } catch (_err) {
        // Silently fail if cart/wishlist can't load - try loading from localStorage
        console.error('Failed to load cart/wishlist from database:', _err)
        try {
          const savedCart = localStorage.getItem('cart')
          const savedWishlist = localStorage.getItem('wishlist')
          if (savedCart) {
            const cartData = JSON.parse(savedCart)
            if (Array.isArray(cartData)) setCart(cartData)
          }
          if (savedWishlist) {
            const wishlistData = JSON.parse(savedWishlist)
            if (Array.isArray(wishlistData)) setWishlist(wishlistData)
          }
        } catch (_e) {
          // Ignore
        }
        setToast('Could not load saved cart/wishlist from database.')
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
  const handleEmailLogin = async ({ email, name, image }) => {
    if (!email) throw new Error('Email is required')
    const domain = email.split('@')[1]
    if (!ALLOWED_DOMAINS.includes(domain) && email !== 'souparno.cs24@bmsce.ac.in') {
      throw new Error('Use your college email domain.')
    }
    setLoading(true)
    try {
      let userData
      if (USE_SUPABASE) {
        // Use Supabase - check if user exists, create if not
        let dbUser = await db.getUserByEmail(email)
        if (!dbUser) {
          dbUser = await db.createUser({
            email,
            name,
            image,
            isAdmin: email === 'souparno.cs24@bmsce.ac.in',
          })
        } else {
          // Update name/image if provided
          if (name || image) {
            await db.updateUser(email, { name, image })
            dbUser = await db.getUserByEmail(email)
          }
        }
        userData = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          image: dbUser.avatar_url,
          isAdmin: dbUser.role === 'admin',
          phoneNumber: dbUser.phone_number,
          usn: dbUser.usn,
          semester: dbUser.semester,
        }
      } else {
        // Use REST API
        const payload = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, name, image }),
        })
        userData = payload.user
      }
      setUser(userData)
      setToast('Signed in successfully.')
    } catch (_err) {
      console.error('Sign-in error:', _err)
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
        // Use the same handler for Google sign-in
        await handleEmailLogin({ email, name, image })
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
        setToast('Please sign in to show interest.')
        // Navigate to sign in page
        navigate('/signin')
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
  const handleAddToCart = async ({ portfolioLink, message, negotiationPrice }) => {
    const serviceId = addToCartModal.service?.id
    if (!serviceId || !user) return

    // Only allow UUIDs for Supabase
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(serviceId)
    if (!isUUID) {
      // Handle demo/local service: add to local cart only, do not call Supabase
      setCart((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          serviceId,
          userEmail: user.email,
          quantity: 1,
          portfolioLink,
          message,
          negotiationPrice,
          service: addToCartModal.service,
        },
      ])
      setToast('Added to cart (local/demo service)!')
      return
    }

    try {
      // Save interest (negotiation) for host tracking
      if (USE_SUPABASE) {
        await db.saveInterest({
          serviceId,
          userEmail: user.email,
          negotiationPrice,
          portfolioLink,
          message,
        })
      }
      // Add to cart
      let updated
      if (USE_SUPABASE) {
        await db.addToCart({
          userEmail: user.email,
          serviceId,
          quantity: 1,
          portfolioLink,
          message,
          negotiationPrice,
        })
        updated = await db.getCart(user.email)
        setCart(updated || [])
        setToast('Added to cart!')
      } else {
        // Handle example services - store them locally
        const service = services.find((svc) => svc && svc.id === serviceId)
        if (service) {
          const localCartItem = {
            id: `local-${Date.now()}`,
            serviceId,
            service,
            quantity: 1,
            portfolioLink,
            message,
            negotiationPrice,
          }
          setCart((prev) => {
            const newCart = [...prev, localCartItem]
            // Save local items separately for persistence
            const localItems = newCart.filter(item => item.id?.startsWith('local-'))
            localStorage.setItem('local_cart', JSON.stringify(localItems))
            return newCart
          })
          setToast('Added to cart (local service).')
        }
      }
    } catch (err) {
      setToast(err.message || 'Failed to add to cart')
    }
  }

  // Remove from cart.
  const handleRemoveFromCart = async (cartId) => {
    try {
      const isLocalItem = cartId?.toString().startsWith('local-')
      
      if (isLocalItem) {
        // Remove local item
        setCart((prev) => {
          const newCart = prev.filter((item) => item.id !== cartId)
          const localItems = newCart.filter((item) => item.id?.startsWith('local-'))
          localStorage.setItem('local_cart', JSON.stringify(localItems))
          console.log('Updated local cart:', newCart)
          return newCart
        })
        setToast('Removed from cart.')
        return
      }
      
      if (user?.email) {
        if (USE_SUPABASE) {
          // Use Supabase - remove from database
          await db.removeFromCart(cartId, user.email)
          // Fetch updated cart from database and merge with local items
          const dbCart = await db.getCart(user.email)
          const localItems = cart.filter(item => item.id?.startsWith('local-'))
          setCart([...dbCart, ...localItems])
          setToast('Removed from cart.')
        } else {
          // Use REST API
          const updated = await apiRequest(`/cart/${cartId}?userEmail=${encodeURIComponent(user.email)}`, {
            method: 'DELETE',
          })
          const localItems = cart.filter(item => item.id?.startsWith('local-'))
          setCart([...updated, ...localItems])
          setToast('Removed from cart.')
        }
      } else {
        // No user, just remove from local state
        setCart((prev) => prev.filter((item) => item.id !== cartId))
      }
    } catch (_err) {
      console.error('Remove from cart error:', _err)
      setToast('Failed to remove from cart. Please try again.')
      // Fallback: remove from local state
      setCart((prev) => {
        const newCart = prev.filter((item) => item.id !== cartId)
        const localItems = newCart.filter(item => item.id?.startsWith('local-'))
        localStorage.setItem('local_cart', JSON.stringify(localItems))
        return newCart
      })
    }
  }

  // Wishlist toggle.
  const handleToggleWishlist = async (serviceId) => {
    if (!user) {
      setToast('Sign in first to save items to wishlist.')
      // Still allow local wishlist for preview
      const service = services.find((svc) => svc && svc.id === serviceId)
      if (service) {
        setWishlist((prev) => {
          const exists = prev.find((item) => item.serviceId === serviceId)
          if (exists) {
            setToast('Removed from wishlist (local). Sign in to save permanently.')
            return prev.filter((item) => item.serviceId !== serviceId)
          }
          return [...prev, { id: Date.now().toString(), serviceId, service }]
        })
      }
      return
    }
    try {
      let updated
      if (USE_SUPABASE) {
        // Use Supabase - toggle in database
        await db.toggleWishlist(user.email, serviceId)
        // Fetch updated wishlist from database
        updated = await db.getWishlist(user.email)
      } else {
        // Use REST API
        updated = await apiRequest('/wishlist', {
          method: 'POST',
          body: JSON.stringify({ userEmail: user.email, serviceId }),
        })
      }
      setWishlist(() => {
  const next = updated || []
  return next.filter(
    (item, index, self) =>
      index === self.findIndex((i) => i.serviceId === item.serviceId)
  )
})

      const wasAdded = updated?.some(item => item.serviceId === serviceId)
      setToast(wasAdded ? 'Added to wishlist!' : 'Removed from wishlist!')
    } catch (_err) {
      // Handle example services - store them locally
      if (_err?.message === 'EXAMPLE_SERVICE' || _err?.message?.includes('EXAMPLE_SERVICE')) {
        const service = services.find((svc) => svc && svc.id === serviceId)
        if (service) {
          setWishlist((prev) => {
  const exists = prev.find((item) => item.serviceId === serviceId)

  const next = exists
    ? prev.filter((item) => item.serviceId !== serviceId)
    : [...prev, { id: `local-${Date.now()}`, serviceId, service }]

  const deduped = next.filter(
    (item, index, self) =>
      index === self.findIndex((i) => i.serviceId === item.serviceId)
  )

  const localItems = deduped.filter(item => item.id?.startsWith('local-'))
  localStorage.setItem('local_wishlist', JSON.stringify(localItems))

  return deduped
})
          return
        }
      }
      console.error('Toggle wishlist error:', _err)
      const errorMessage = _err?.message || 'Failed to update wishlist. Please try again.'
      setToast(errorMessage)
      // Don't update local state if user is signed in - we want database sync
    }
  }

// Remove from wishlist by ID.
  const handleRemoveFromWishlist = async(wishlistId) => {
    try {
      console.log('Attempting to remove wishlist item locally:', wishlistId);

      // Find the item in the wishlist by id
      const itemToRemove = wishlist.find((item) => item.id === wishlistId);
      const serviceId = itemToRemove?.serviceId;
      const isLocalItem = wishlistId?.toString().startsWith('local-');

      console.log('Item details:', { itemToRemove, serviceId, isLocalItem });

      // Remove from local state by id only (like cart)
      setWishlist((prev) => {
        const newWishlist = prev.filter((item) => item.id !== wishlistId);
        const localItems = newWishlist.filter((item) => item.id?.startsWith('local-'));
        localStorage.setItem('local_wishlist', JSON.stringify(localItems));
        console.log('Updated local wishlist:', newWishlist);
        return newWishlist;
      });

      setToast('Removed from wishlist.');

      if (isLocalItem) {
        console.log('Local item removed successfully:', wishlistId);
        return;
      }

      if (user?.email && serviceId) {
        if (USE_SUPABASE) {
          console.log('Attempting to remove from Supabase:', { userEmail: user.email, serviceId });
          const removalSuccess = await db.removeFromWishlist(user.email, serviceId);
          console.log('Supabase removal success:', removalSuccess);

          if (removalSuccess) {
            // Fetch updated wishlist from database only after successful removal
            const updated = await db.getWishlist(user.email);
            setWishlist(updated || []);
            console.log('Updated wishlist fetched from Supabase:', updated);
          } else {
            console.warn('Item not found in Supabase for removal:', serviceId);
          }
        }
      }
    } catch (_err) {
      console.error('Remove from wishlist error:', _err);
      setToast('Failed to remove from wishlist.');
      // Rollback: re-fetch wishlist on error so user sees current state
      try {
        if (user?.email && USE_SUPABASE) {
          console.log('Attempting to refetch wishlist after error.');
          const updated = await db.getWishlist(user.email);
          setWishlist(updated || []);
          console.log('Refetched wishlist:', updated);
        }
      } catch (fetchErr) {
        console.error('Error refetching wishlist after removal failure:', fetchErr);
      }
    }
  };

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
      let ordersData, inventoryData
      
      if (USE_SUPABASE) {
        // Use Supabase for admin data
        try {
          [ordersData, inventoryData] = await Promise.all([
            db.getOrders(adminEmail, true), // isAdmin = true
            db.getAdminInventory(),
          ])
          
          // Transform inventory data to match expected format
          setOrders(ordersData || [])
          setInventory({
            hosts: inventoryData?.servicesByHost || [],
            students: inventoryData?.cartByStudent || [],
          })
          setToast(null) // Clear any previous errors
        } catch (supabaseErr) {
          console.error('Supabase admin data fetch error:', supabaseErr)
          // If Supabase fails, try REST API as fallback if available
          if (API_URL && API_URL !== 'http://localhost:4000') {
            throw new Error('Supabase error: ' + (supabaseErr.message || 'Unknown error'))
          }
          // If no REST API, just set empty data
          setOrders([])
          setInventory({ hosts: [], students: [] })
          throw supabaseErr
        }
      } else {
        // Use REST API
        [ordersData, inventoryData] = await Promise.all([
          apiRequest(`/orders?userEmail=${encodeURIComponent(adminEmail)}`),
          apiRequest('/admin/inventory', {
            headers: { 'x-admin-email': adminEmail },
          }),
        ])
        setOrders(ordersData || [])
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
      }
    } catch (err) {
      // Admin dashboard data failed to load - show error but don't crash
      console.error('Admin data fetch error:', err)
      const errorMsg = err.message || err.toString() || 'Unknown error'
      setToast('Admin data failed to load: ' + errorMsg)
      // Set empty data so UI doesn't break
      setOrders([])
      setInventory({ hosts: [], students: [] })
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
          let ordersData
          if (USE_SUPABASE) {
            ordersData = await db.getOrders(user.email, false)
          } else {
            ordersData = await apiRequest(`/orders?userEmail=${encodeURIComponent(user.email)}`)
          }
          setOrders(ordersData || [])
        } catch (_err) {
          console.error('Failed to load orders:', _err)
          // Silently fail
        }
      })()
    }
  }, [user])

  // Refresh orders when cart changes
  useEffect(() => {
    if (user) {
      ;(async () => {
        try {
          let ordersData
          if (USE_SUPABASE) {
            ordersData = await db.getOrders(user.email, user?.isAdmin || false)
          } else {
            ordersData = await apiRequest(`/orders?userEmail=${encodeURIComponent(user.email)}`)
          }
          setOrders(ordersData || [])
        } catch (_err) {
          console.error('Failed to refresh orders:', _err)
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
        navigate={navigate}
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
                    onServiceClick={(service) => setServiceDetailModal({ open: true, service })}
                  />
                  <ServiceDetailModal
                    service={serviceDetailModal.service}
                    open={serviceDetailModal.open}
                    onClose={() => setServiceDetailModal({ open: false, service: null })}
                    onAddToCart={handleAddToCartClick}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={isWishlisted}
                    user={user}
                    mode={mode}
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
              onRemoveFromWishlist={handleRemoveFromWishlist}
              mode={mode}
              user={user}
            />
          }
        />
        <Route path="/signin" element={<SignInPage onEmailLogin={handleEmailLogin} onGoogleSignIn={handleGoogleSignIn} loading={loading} user={user} />} />
        <Route path="/profile/manage-orders" element={<AdminOrdersPage orders={orders} user={user} cart={cart} inventory={inventory} />} />
        <Route path="/profile/manage-items" element={<AdminManageItemsPage inventory={inventory} user={user} onServiceDeleted={handleServiceCreated} onToast={setToast} />} />
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
            let updated
            if (USE_SUPABASE) {
              // Use Supabase to update user profile
              const supabaseUser = await db.updateUser(user.email, formData)
              updated = {
                phoneNumber: supabaseUser.phone_number,
                usn: supabaseUser.usn,
                semester: supabaseUser.semester,
                name: supabaseUser.name,
                image: supabaseUser.avatar_url,
              }
            } else {
              // Use REST API
              updated = await apiRequest('/users/profile', {
                method: 'PUT',
                body: JSON.stringify({
                  email: user.email,
                  phoneNumber: formData.phoneNumber,
                  usn: formData.usn,
                  semester: formData.semester,
                }),
              })
            }
            setUser({ ...user, ...updated })
            setToast('Profile updated successfully!')
          } catch (err) {
            console.error('Profile update error:', err)
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
