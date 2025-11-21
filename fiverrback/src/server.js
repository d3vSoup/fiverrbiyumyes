/** Core dependencies used by the minimalist Express API */
const express = require('express')
const cors = require('cors')
const fs = require('fs').promises
const path = require('path')
const { nanoid } = require('nanoid')

/** App level constants: port, admin inbox, and domain allow list */
const app = express()
const PORT = process.env.PORT || 4000
const ADMIN_EMAIL = 'souparno.cs24@bmsce.ac.in'
const ALLOWED_DOMAINS = ['bmsce.ac.in', 'bmsca.org', 'bmscl.ac.in']
const DB_PATH = path.join(__dirname, 'db.json')

/** Default catalog used to seed the JSON “database” for local dev */
const defaultServices = [
  {
    id: nanoid(),
    title: 'CAD Homework Lifeline',
    description:
      'Detailed CAD homework support with annotated DWG submissions and voice walkthroughs.',
    category: 'cad-homework',
    price: 1200,
    currency: 'INR',
    hostName: 'Riya K',
    hostEmail: 'riya.cad@bmsce.ac.in',
    hostRating: 4.9,
    tags: ['CAD', 'Homework', '3D'],
  },
  {
    id: nanoid(),
    title: 'Maths Assignment Sprint',
    description:
      'Step-by-step solutions for calculus, linear algebra, and statistics assignments with LaTeX write-ups.',
    category: 'maths-assignment',
    price: 900,
    currency: 'INR',
    hostName: 'Arjun M',
    hostEmail: 'arjun.maths@bmsce.ac.in',
    hostRating: 4.8,
    tags: ['Mathematics', 'Assignment'],
  },
  {
    id: nanoid(),
    title: 'AutoCAD Event Panel Build',
    description:
      'Custom AutoCAD panels and booth layouts for college events, with export-ready files.',
    category: 'autocad-panel',
    price: 1500,
    currency: 'INR',
    hostName: 'Sahana P',
    hostEmail: 'sahana.cad@bmsce.ac.in',
    hostRating: 5,
    tags: ['AutoCAD', 'Events'],
  },
  {
    id: nanoid(),
    title: 'UI/UX Project Rescue',
    description:
      'Complete UI/UX project help: user flows, wireframes, and Figma prototypes tailor-made for coursework.',
    category: 'ui-ux',
    price: 1800,
    currency: 'INR',
    hostName: 'Dev Patel',
    hostEmail: 'dev.uiux@bmscl.ac.in',
    hostRating: 4.7,
    tags: ['UI', 'UX', 'Figma'],
  },
  {
    id: nanoid(),
    title: 'Presentation Video Polish',
    description:
      'Video editing for academic project presentations with motion graphics, captions, and background score.',
    category: 'project-help',
    price: 1300,
    currency: 'INR',
    hostName: 'Nisha V',
    hostEmail: 'nisha.media@bmsca.org',
    hostRating: 4.8,
    tags: ['Video Editing'],
  },
  {
    id: nanoid(),
    title: 'Background Score Composer',
    description:
      'Custom background music tailored for prototype demos and YouTube submissions.',
    category: 'project-help',
    price: 1600,
    currency: 'INR',
    hostName: 'Abhay Rao',
    hostEmail: 'abhay.sound@bmsce.ac.in',
    hostRating: 4.9,
    tags: ['Music', 'Background Score'],
  },
]

/** Data shape stored in src/db.json so we can bootstrap without Supabase */
const defaultDB = {
  users: [],
  services: defaultServices,
  carts: [],
  wishlists: [],
  orders: [],
  chats: [],
}

/** Basic middleware stack: CORS + JSON body parsing */
app.use(cors())
app.use(express.json())

/** Ensure the JSON file exists before we attempt to read from it */
async function ensureDB() {
  try {
    await fs.access(DB_PATH)
  } catch (err) {
    await fs.writeFile(DB_PATH, JSON.stringify(defaultDB, null, 2), 'utf-8')
  }
}

/** Convenience helper that returns the parsed JSON database */
async function readDB() {
  await ensureDB()
  const data = await fs.readFile(DB_PATH, 'utf-8')
  return JSON.parse(data)
}

/** Persist arbitrary data back to disk (pretty printed for clarity) */
async function writeDB(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

/** Helper to verify whether an email belongs to allowed BMS domains */
function isAllowedEmail(email) {
  if (!email) return false
  const domain = email.split('@')[1]?.toLowerCase()
  return ALLOWED_DOMAINS.includes(domain)
}

/** Join cart rows with matching service objects so UI can render details */
function enrichCart(cartItems, services) {
  return cartItems.map((item) => ({
    ...item,
    service: services.find((service) => service.id === item.serviceId) || null,
  }))
}

/** Same as enrichCart but for wishlist rows */
function enrichWishlist(wishlistItems, services) {
  return wishlistItems.map((item) => ({
    ...item,
    service: services.find((service) => service.id === item.serviceId) || null,
  }))
}

/** GET /health – simple ping endpoint for Docker/Render probes */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

/** GET /services – return every listing (used by the React home page) */
app.get('/services', async (_req, res) => {
  const db = await readDB()
  res.json(db.services)
})

/** POST /services – host submissions, gated by allowed domains */
app.post('/services', async (req, res) => {
  const { title, description, price, category, hostName, hostEmail, tags, deliveryEstimate, portfolioLink } = req.body

  if (!hostEmail || !isAllowedEmail(hostEmail)) {
    return res.status(403).json({ error: 'Only approved college domains can list services.' })
  }

  if (!title || !description || !price || !category || !hostName) {
    return res.status(400).json({ error: 'Missing required fields.' })
  }

  // Validate 100-word minimum for description
  const wordCount = description.trim().split(/\s+/).filter(Boolean).length
  if (wordCount < 100) {
    return res.status(400).json({ error: `Description must be at least 100 words (currently ${wordCount}).` })
  }

  const db = await readDB()
  const newService = {
    id: nanoid(),
    title,
    description,
    price,
    currency: 'INR',
    category,
    hostName,
    hostEmail,
    hostRating: 4.7,
    tags: tags || [],
    deliveryEstimate: deliveryEstimate || null,
    portfolioLink: portfolioLink || null,
    createdAt: new Date().toISOString(),
  }

  db.services.unshift(newService)
  await writeDB(db)

  res.status(201).json(newService)
})

/** DELETE /services/:id – delete a service listing (only by owner) */
app.delete('/services/:id', async (req, res) => {
  const { id } = req.params
  const userEmail = req.headers['x-user-email']
  
  if (!userEmail) {
    return res.status(401).json({ error: 'User email required.' })
  }

  const db = await readDB()
  const service = db.services.find((s) => s.id === id)
  
  if (!service) {
    return res.status(404).json({ error: 'Service not found.' })
  }

  // Only owner or admin can delete
  if (service.hostEmail !== userEmail && userEmail !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'You can only delete your own listings.' })
  }

  db.services = db.services.filter((s) => s.id !== id)
  await writeDB(db)

  res.json({ message: 'Service deleted successfully.' })
})

/** POST /auth/login – minimal mock auth that enforces campus emails */
app.post('/auth/login', async (req, res) => {
  const { email, name = 'Student', image } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' })
  }

  if (!isAllowedEmail(email) && email !== ADMIN_EMAIL) {
    return res.status(403).json({
      error: 'Only BMSCE / BMSCA / BMSCL email IDs are allowed.',
    })
  }

  const db = await readDB()
  let existing = db.users.find((u) => u.email === email)

  if (!existing) {
    existing = {
      id: nanoid(),
      email,
      name,
      image,
      isAdmin: email === ADMIN_EMAIL,
      phoneNumber: null,
      usn: null,
      semester: null,
      createdAt: new Date().toISOString(),
    }
    db.users.push(existing)
    await writeDB(db)
  } else {
    // Update name and image if provided
    if (name) existing.name = name
    if (image) existing.image = image
    await writeDB(db)
  }

  res.json({
    user: {
      id: existing.id,
      email: existing.email,
      name: name || existing.name,
      image: image || existing.image,
      isAdmin: existing.isAdmin,
      phoneNumber: existing.phoneNumber || null,
      usn: existing.usn || null,
      semester: existing.semester || null,
    },
    allowedDomains: ALLOWED_DOMAINS,
  })
})

/** PUT /users/profile – update user profile (phone, USN, semester) */
app.put('/users/profile', async (req, res) => {
  const { email, phoneNumber, usn, semester } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' })
  }

  const db = await readDB()
  const user = db.users.find((u) => u.email === email)

  if (!user) {
    return res.status(404).json({ error: 'User not found.' })
  }

  // Update profile fields
  if (phoneNumber !== undefined) user.phoneNumber = phoneNumber || null
  if (usn !== undefined) user.usn = usn || null
  if (semester !== undefined) user.semester = semester || null

  await writeDB(db)

  res.json({
    phoneNumber: user.phoneNumber,
    usn: user.usn,
    semester: user.semester,
  })
})

/** GET /cart?userEmail – fetch cart rows for one student */
app.get('/cart', async (req, res) => {
  const { userEmail } = req.query
  if (!userEmail) {
    return res.status(400).json({ error: 'userEmail query param is required.' })
  }
  const db = await readDB()
  const cartItems = db.carts.filter((item) => item.userEmail === userEmail)
  res.json(enrichCart(cartItems, db.services))
})

/** POST /cart – add/update an item for a student cart */
app.post('/cart', async (req, res) => {
  const { userEmail, serviceId, quantity = 1, portfolioLink, message } = req.body
  if (!userEmail || !serviceId) {
    return res.status(400).json({ error: 'userEmail and serviceId are required.' })
  }
  if (!portfolioLink) {
    return res.status(400).json({ error: 'Portfolio link is required.' })
  }
  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required.' })
  }
  if (message.trim().length > 50) {
    return res.status(400).json({ error: 'Message must be maximum 50 characters.' })
  }
  const db = await readDB()
  const service = db.services.find((s) => s.id === serviceId)
  if (!service) {
    return res.status(404).json({ error: 'Service not found.' })
  }
  const exists = db.carts.find(
    (item) => item.userEmail === userEmail && item.serviceId === serviceId,
  )
  if (exists) {
    exists.quantity = quantity
    exists.portfolioLink = portfolioLink
    exists.message = message
  } else {
    db.carts.push({
      id: nanoid(),
      userEmail,
      serviceId,
      quantity,
      portfolioLink,
      message,
      addedAt: new Date().toISOString(),
    })
  }
  await writeDB(db)
  res.status(201).json(enrichCart(db.carts.filter((item) => item.userEmail === userEmail), db.services))
})

/** DELETE /cart/:id – remove a single cart entry */
app.delete('/cart/:id', async (req, res) => {
  const { id } = req.params
  const { userEmail } = req.query
  if (!userEmail) {
    return res.status(400).json({ error: 'userEmail query param is required.' })
  }
  const db = await readDB()
  db.carts = db.carts.filter((item) => item.id !== id)
  await writeDB(db)
  res.json(enrichCart(db.carts.filter((item) => item.userEmail === userEmail), db.services))
})

/** GET /wishlist?userEmail – fetch wishlist entries for student */
app.get('/wishlist', async (req, res) => {
  const { userEmail } = req.query
  if (!userEmail) {
    return res.status(400).json({ error: 'userEmail query param is required.' })
  }
  const db = await readDB()
  const wishlistItems = db.wishlists.filter((item) => item.userEmail === userEmail)
  res.json(enrichWishlist(wishlistItems, db.services))
})

/** POST /wishlist – toggle wishlist entry for the logged in user */
app.post('/wishlist', async (req, res) => {
  const { userEmail, serviceId } = req.body
  if (!userEmail || !serviceId) {
    return res.status(400).json({ error: 'userEmail and serviceId are required.' })
  }
  const db = await readDB()
  const exists = db.wishlists.find(
    (item) => item.userEmail === userEmail && item.serviceId === serviceId,
  )
  if (exists) {
    db.wishlists = db.wishlists.filter((item) => item.id !== exists.id)
  } else {
    db.wishlists.push({
      id: nanoid(),
      userEmail,
      serviceId,
      addedAt: new Date().toISOString(),
    })
  }
  await writeDB(db)
  res.json(enrichWishlist(db.wishlists.filter((item) => item.userEmail === userEmail), db.services))
})

/** DELETE /wishlist/:id – drop wishlist row entirely */
app.delete('/wishlist/:id', async (req, res) => {
  const { id } = req.params
  const { userEmail } = req.query
  if (!userEmail) {
    return res.status(400).json({ error: 'userEmail query param is required.' })
  }
  const db = await readDB()
  db.wishlists = db.wishlists.filter((item) => item.id !== id)
  await writeDB(db)
  res.json(enrichWishlist(db.wishlists.filter((item) => item.userEmail === userEmail), db.services))
})

/** POST /orders – creates order from cart items (but doesn't clear cart - payment gateway not ready) */
app.post('/orders', async (req, res) => {
  const { userEmail } = req.body
  if (!userEmail) {
    return res.status(400).json({ error: 'userEmail is required.' })
  }
  const db = await readDB()
  const userCart = db.carts.filter((item) => item.userEmail === userEmail)
  if (userCart.length === 0) {
    return res.status(400).json({ error: 'Cart is empty.' })
  }
  const services = db.services
  const user = db.users.find((u) => u.email === userEmail)
  
  // Create orders for each cart item (one order per service)
  const newOrders = userCart.map((item) => {
    const service = services.find((srv) => srv.id === item.serviceId)
    const price = service?.price || 0
    const total = typeof price === 'object' && price.min && price.max
      ? (price.min + price.max) / 2
      : price * (item.quantity || 1)
    
    return {
      id: nanoid(),
      buyerEmail: userEmail,
      buyerName: user?.name || 'Student',
      hostEmail: service?.hostEmail,
      hostName: service?.hostName,
      listingTitle: service?.title,
      listingDescription: service?.description,
      serviceId: item.serviceId,
      portfolioLink: item.portfolioLink,
      message: item.message,
      status: 'carted', // Status: carted / checkout attempted / pending / completed
      items: [{
        serviceId: item.serviceId,
        title: service?.title,
        serviceTitle: service?.title,
        price: service?.price,
        quantity: item.quantity || 1,
      }],
      total,
      currency: 'INR',
      placedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    }
  })
  
  // Add all orders to database
  db.orders.push(...newOrders)
  await writeDB(db)
  
  // Note: We don't clear the cart because payment gateway is not ready
  res.status(201).json(newOrders)
})

/** GET /orders – admin sees every order, hosts see their listings' orders, students see their own */
app.get('/orders', async (req, res) => {
  const { userEmail } = req.query
  if (!userEmail) {
    return res.status(400).json({ error: 'userEmail query param is required.' })
  }
  const db = await readDB()
  const user = db.users.find((u) => u.email === userEmail)
  
  if (userEmail === ADMIN_EMAIL) {
    // Admin sees all orders
    return res.json(db.orders)
  }
  
  // Check if user is a host (has created services)
  const userServices = db.services.filter((s) => s.hostEmail === userEmail)
  if (userServices.length > 0) {
    // Host sees orders for their services
    const serviceIds = userServices.map((s) => s.id)
    const hostOrders = db.orders.filter((order) => 
      serviceIds.includes(order.serviceId) || order.hostEmail === userEmail
    )
    return res.json(hostOrders)
  }
  
  // Student sees only their own orders
  const userOrders = db.orders.filter((order) => 
    order.buyerEmail === userEmail || order.userEmail === userEmail
  )
  res.json(userOrders)
})

/** GET /admin/inventory – summarized host + student snapshots for dashboard */
app.get('/admin/inventory', async (req, res) => {
  const adminEmail = req.headers['x-admin-email']
  if (adminEmail !== ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Admin access only.' })
  }
  const db = await readDB()
  const servicesByHost = db.services.reduce((acc, service) => {
    if (!acc[service.hostEmail]) {
      acc[service.hostEmail] = []
    }
    acc[service.hostEmail].push(service)
    return acc
  }, {})
  const cartByStudent = db.carts.reduce((acc, item) => {
    if (!acc[item.userEmail]) {
      acc[item.userEmail] = []
    }
    acc[item.userEmail].push(item)
    return acc
  }, {})
  res.json({ servicesByHost, cartByStudent })
})

/** Boot up the server */
app.listen(PORT, () => {
  console.log(`fiverrback listening on http://localhost:${PORT}`)
})


