import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL and Anon Key must be set in environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for database operations
export const db = {
  // Remove a service from wishlist for a user
  async removeFromWishlist(userEmail, serviceId) {
    console.log('Attempting to remove from wishlist:', { userEmail, serviceId });

    // Only allow UUIDs (real services)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(serviceId);
    if (!isUUID) throw new Error('EXAMPLE_SERVICE');

    const user = await this.getUserByEmail(userEmail);
    if (!user || !serviceId) {
      throw new Error('User or serviceId missing');
    }

    // Log for debugging
    console.log('Deleting wishlist for user:', user.id, 'service:', serviceId);

    // Delete by user_id and service_id (not by wishlist row id)
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id)
      .eq('service_id', serviceId);

    if (error) throw error;
    return true;
  },
  // Users
  async getUserByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user:', error)
      throw error
    }
    return data
  },

  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: userData.email,
        name: userData.name,
        avatar_url: userData.image || userData.avatar_url,
        role: userData.isAdmin ? 'admin' : (userData.role || 'student'),
        phone_number: userData.phoneNumber || null,
        usn: userData.usn || null,
        semester: userData.semester || null,
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating user:', error)
      throw error
    }
    return data
  },

  async updateUser(email, updates) {
    const { data, error } = await supabase
      .from('users')
      .update({
        phone_number: updates.phoneNumber || null,
        usn: updates.usn || null,
        semester: updates.semester || null,
        name: updates.name || undefined,
        avatar_url: updates.image || updates.avatar_url || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('email', email)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating user:', error)
      throw error
    }
    return data
  },

  // Services
  async getServices() {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching services:', error)
      throw error
    }
    return data || []
  },

  async createService(serviceData) {
    const { data, error } = await supabase
      .from('services')
      .insert([{
        host_email: serviceData.hostEmail,
        host_name: serviceData.hostName,
        title: serviceData.title,
        description: serviceData.description,
        category: serviceData.category,
        price_in_inr: typeof serviceData.price === 'object' ? null : serviceData.price,
        price_min: typeof serviceData.price === 'object' ? serviceData.price.min : null,
        price_max: typeof serviceData.price === 'object' ? serviceData.price.max : null,
        tags: serviceData.tags || [],
        delivery_estimate: serviceData.deliveryEstimate || null,
        portfolio_link: serviceData.portfolioLink || null,
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating service:', error)
      throw error
    }
    return data
  },

  async deleteService(serviceId, userEmail) {
    try {
      console.log('Attempting to delete service:', serviceId, 'for user:', userEmail)
      
      // First check if the service exists and belongs to this user
      const { data: existingService, error: fetchError } = await supabase
        .from('services')
        .select('id, host_email')
        .eq('id', serviceId)
        .maybeSingle()
      
      if (fetchError) {
        console.error('Error fetching service before delete:', fetchError)
        throw new Error('Failed to verify service ownership: ' + fetchError.message)
      }
      
      if (!existingService) {
        throw new Error('Service not found. It may have already been deleted.')
      }
      
      // Verify ownership
      if (existingService.host_email !== userEmail) {
        throw new Error('You do not have permission to delete this service.')
      }
      
      // Remove references from wishlist table
      const { error: wishlistDeleteError } = await supabase
        .from('wishlists')
        .delete()
        .eq('service_id', serviceId)

      if (wishlistDeleteError) {
        console.error('Error removing references from wishlist:', wishlistDeleteError)
        throw new Error('Failed to remove references from wishlist: ' + wishlistDeleteError.message)
      }

      console.log('References removed from wishlist successfully.')

      // Remove references from carts table
      const { error: cartDeleteError } = await supabase
        .from('carts')
        .delete()
        .eq('service_id', serviceId)

      if (cartDeleteError) {
        console.error('Error removing references from carts:', cartDeleteError)
        throw new Error('Failed to remove references from carts: ' + cartDeleteError.message)
      }

      console.log('References removed from carts successfully.')
      // Perform the deletion
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)
        .eq('host_email', userEmail)
      
      if (error) {
        console.error('Error deleting service:', error)
        throw new Error('Failed to delete service: ' + error.message)
      }
      
      console.log('Service deleted successfully:', serviceId)
      return { success: true }
    } catch (err) {
      console.error('deleteService error:', err)
      throw err
    }
  },

  async deleteServiceAdmin(serviceId) {
    try {
      console.log('Admin attempting to delete service:', serviceId)
      
      // First check if the service exists
      const { data: existingService, error: fetchError } = await supabase
        .from('services')
        .select('id, host_email, title')
        .eq('id', serviceId)
        .maybeSingle()
      
      if (fetchError) {
        console.error('Error fetching service for admin delete:', fetchError)
        throw new Error('Failed to verify service: ' + fetchError.message)
      }
      
      if (!existingService) {
        throw new Error('Service not found. It may have already been deleted.')
      }
      
      console.log('Admin deleting service:', existingService.title, 'hosted by:', existingService.host_email)
      
      // Perform the deletion as admin
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)
      
      if (error) {
        console.error('Error deleting service (admin):', error)
        throw new Error('Failed to delete service: ' + error.message)
      }
      
      console.log('Admin deleted service successfully:', serviceId)
      return { success: true, message: `Deleted "${existingService.title}"` }
    } catch (err) {
      console.error('deleteServiceAdmin error:', err)
      throw err
    }
  },

  // Cart - Note: schema has both user_id and user_email
  async getCart(userEmail) {
    // First get user_id from email for filtering
    const user = await this.getUserByEmail(userEmail)
    if (!user) return []

    const { data, error } = await supabase
      .from('carts')
      .select(`
        *,
        services (*)
      `)
      .eq('user_email', userEmail)
      .order('added_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching cart:', error)
      throw error
    }
    return (data || []).map(item => ({
      id: item.id,
      serviceId: item.service_id,
      userEmail: item.user_email,
      quantity: item.quantity,
      portfolioLink: item.portfolio_link,
      message: item.message,
      service: this.transformService(item.services),
    }))
  },

  async addToCart(cartData) {
    try {
      // Allow both UUIDs (database services) and string IDs (example services)
      // Example services will be stored in localStorage only
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cartData.serviceId)
      if (!isUUID) {
        // This is an example service - return a special marker so frontend can handle it locally
        throw new Error('EXAMPLE_SERVICE')
      }

      // First get user_id from email
      const user = await this.getUserByEmail(cartData.userEmail)
      if (!user) {
        console.error('User not found for email:', cartData.userEmail)
        throw new Error('User not found. Please sign in again.')
      }

      // Verify service exists
      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('id')
        .eq('id', cartData.serviceId)
        .maybeSingle()

      if (serviceError) {
        console.error('Error checking service:', cartData.serviceId, serviceError)
        throw new Error('Error checking service: ' + (serviceError.message || 'Unknown error'))
      }

      if (!serviceData) {
        console.error('Service not found:', cartData.serviceId)
        throw new Error('Service not found. It may have been removed.')
      }

      // Check if already in cart
      const { data: existingData, error: checkError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_email', cartData.userEmail)
        .eq('service_id', cartData.serviceId)
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing cart:', checkError)
        throw checkError
      }

      if (existingData) {
        // Update existing cart item
        const { data, error } = await supabase
          .from('carts')
          .update({
            portfolio_link: cartData.portfolioLink || null,
            message: cartData.message || null,
            quantity: cartData.quantity || 1,
          })
          .eq('id', existingData.id)
          .select(`
            *,
            services (*)
          `)
          .single()

        if (error) {
          console.error('Error updating cart:', error)
          throw error
        }
        return { ...data, service: this.transformService(data.services) }
      }

      // Create new cart item
      const { data, error } = await supabase
        .from('carts')
        .insert([{
          user_id: user.id,
          user_email: cartData.userEmail,
          service_id: cartData.serviceId,
          quantity: cartData.quantity || 1,
          portfolio_link: cartData.portfolioLink || null,
          message: cartData.message || null,
        }])
        .select(`
          *,
          services (*)
        `)
        .single()

      if (error) {
        console.error('Error adding to cart:', error)
        // Provide more helpful error message
        if (error.code === '23503') {
          throw new Error('Invalid service or user. Please refresh the page and try again.')
        } else if (error.code === '23505') {
          throw new Error('This item is already in your cart.')
        }
        throw new Error(error.message || 'Failed to add to cart. Please try again.')
      }
      return { ...data, service: this.transformService(data.services) }
    } catch (err) {
      console.error('addToCart error:', err)
      throw err
    }
  },

  async removeFromCart(cartId, userEmail) {
    const { error } = await supabase
      .from('carts')
      .delete()
      .eq('id', cartId)
      .eq('user_email', userEmail)
    
    if (error) {
      console.error('Error removing from cart:', error)
      throw error
    }
  },

  // Helper to transform Supabase service data to expected format
  transformService(svc) {
    if (!svc) return null
    return {
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
    }
  },

  // Wishlist - Note: schema uses user_id but we'll query by email via users join
  async getWishlist(userEmail) {
    // First get user_id from email
    const user = await this.getUserByEmail(userEmail)
    if (!user) return []

    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        *,
        services (*)
      `)
      .eq('user_id', user.id)
      .order('added_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching wishlist:', error)
      throw error
    }
    return (data || []).map(item => ({
      id: item.id,
      serviceId: item.service_id,
      service: this.transformService(item.services),
    }))
  },

  async toggleWishlist(userEmail, serviceId) {
    // Allow both UUIDs (database services) and string IDs (example services)
    // Example services will be stored in localStorage only
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(serviceId)
    if (!isUUID) {
      // This is an example service - return a special marker so frontend can handle it locally
      throw new Error('EXAMPLE_SERVICE')
    }

    // First get user_id from email
    const user = await this.getUserByEmail(userEmail)
    if (!user) {
      console.error('User not found for email:', userEmail)
      throw new Error('User not found. Please sign in again.')
    }

    // Verify service exists
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('id')
      .eq('id', serviceId)
      .maybeSingle()

    if (serviceError) {
      console.error('Error checking service:', serviceId, serviceError)
      throw new Error('Error checking service: ' + (serviceError.message || 'Unknown error'))
    }

    if (!serviceData) {
      console.error('Service not found:', serviceId)
      throw new Error('Service not found. It may have been removed.')
    }

    // Check if already in wishlist - use maybeSingle() to avoid errors if not found
    const { data: existing, error: checkError } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('service_id', serviceId)
      .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking wishlist:', checkError)
      throw new Error('Error checking wishlist: ' + (checkError.message || 'Unknown error'))
    }

    if (existing) {
      // Remove
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', existing.id)
      
      if (error) throw error
      return null
    } else {
      // Add
      const { data, error } = await supabase
        .from('wishlists')
        .insert([{
          user_id: user.id,
          service_id: serviceId,
        }])
        .select(`
          *,
          services (*)
        `)
        .single()

      if (error) throw error
      return { ...data, service: data.services }
    }
  },

  // Orders - includes user details for admin
  async getOrders(userEmail, isAdmin = false) {
    // Get orders first
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (!isAdmin && userEmail) {
      query = query.or(`buyer_email.eq.${userEmail},host_email.eq.${userEmail}`)
    }

    const { data: ordersData, error: ordersError } = await query

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
      throw ordersError
    }

    if (!ordersData || ordersData.length === 0) {
      return []
    }

    // Get unique buyer emails
    const buyerEmails = [...new Set(ordersData.map(o => o.buyer_email).filter(Boolean))]
    
    // Fetch user details for buyers
    let userMap = {}
    if (buyerEmails.length > 0) {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('email, name, phone_number, usn, semester')
        .in('email', buyerEmails)

      if (!usersError && usersData) {
        usersData.forEach(u => {
          userMap[u.email] = u
        })
      }
    }

    // Transform orders to include buyer details at top level
    return ordersData.map(order => {
      const buyer = userMap[order.buyer_email] || null
      return {
        ...order,
        buyerEmail: order.buyer_email,
        buyerName: buyer?.name || order.buyer_name || null,
        buyerUsn: buyer?.usn || null,
        buyerPhone: buyer?.phone_number || null,
        buyerSemester: buyer?.semester || null,
        // Keep original fields for compatibility
        userEmail: order.buyer_email,
        total: order.total_in_inr,
        createdAt: order.created_at,
        placedAt: order.placed_at,
        lastActivity: order.last_activity,
        listingTitle: order.listing_title,
        listingDescription: order.listing_description,
      }
    })
  },

  // Admin inventory data
  async getAdminInventory() {
    // Get all services
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false })

    if (servicesError) {
      console.error('Error fetching services for admin:', servicesError)
      throw servicesError
    }

    // Get all users to map email to user details
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email, name, phone_number, usn, semester')

    if (usersError) {
      console.warn('Error fetching users for admin (continuing anyway):', usersError)
    }

    const userMap = {}
    users?.forEach(user => {
      userMap[user.email] = user
    })

    // Group services by host email
    const servicesByHost = {}
    services?.forEach(service => {
      const hostEmail = service.host_email
      const hostUser = userMap[hostEmail]
      
      if (!servicesByHost[hostEmail]) {
        servicesByHost[hostEmail] = {
          hostEmail,
          hostName: hostUser?.name || service.host_name || hostEmail,
          phoneNumber: hostUser?.phone_number || null,
          usn: hostUser?.usn || null,
          semester: hostUser?.semester || null,
          services: []
        }
      }
      servicesByHost[hostEmail].services.push({
        service_id: service.id,
        title: service.title,
        category: service.category,
        price_in_inr: service.price_in_inr,
        price_min: service.price_min,
        price_max: service.price_max,
        delivery_estimate: service.delivery_estimate,
        created_at: service.created_at
      })
    })

    // Get all carts
    const { data: carts, error: cartsError } = await supabase
      .from('carts')
      .select('*')
      .order('added_at', { ascending: false })

    if (cartsError) {
      console.error('Error fetching carts for admin:', cartsError)
      throw cartsError
    }

    // Get service details for carts
    const serviceIds = [...new Set(carts?.map(c => c.service_id).filter(Boolean))]
    let cartServices = {}
    if (serviceIds.length > 0) {
      const { data: cartServicesData } = await supabase
        .from('services')
        .select('*')
        .in('id', serviceIds)
      
      cartServicesData?.forEach(svc => {
        cartServices[svc.id] = this.transformService(svc)
      })
    }

    // Group carts by student email with full user details
    const cartByStudent = {}
    carts?.forEach(cart => {
      const studentEmail = cart.user_email
      const studentUser = userMap[studentEmail]
      
      if (!cartByStudent[studentEmail]) {
        cartByStudent[studentEmail] = {
          studentEmail,
          studentName: studentUser?.name || null,
          phoneNumber: studentUser?.phone_number || null,
          usn: studentUser?.usn || null,
          semester: studentUser?.semester || null,
          items: []
        }
      }
      cartByStudent[studentEmail].items.push({
        id: cart.id,
        serviceId: cart.service_id,
        quantity: cart.quantity,
        portfolioLink: cart.portfolio_link,
        message: cart.message,
        service: cartServices[cart.service_id] || null
      })
    })

    return {
      servicesByHost: Object.values(servicesByHost),
      cartByStudent: Object.values(cartByStudent)
    }
  },
}

