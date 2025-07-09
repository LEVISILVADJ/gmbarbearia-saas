import { createClient } from '@supabase/supabase-js'
import { whatsappAPI } from './whatsapp';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Only log in development
if (import.meta.env.DEV) {
  console.log('Supabase configuration:', {
    url: supabaseUrl ? 'Set' : 'Missing',
    key: supabaseAnonKey ? 'Set' : 'Missing'
  });
}

// Function to validate if a string is a valid URL
const isValidUrl = (string: string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// Export connection test function
export { testSupabaseConnection };
// Declare supabase variable at module level
let supabase: any;

// Check if environment variables are properly configured
const isSupabaseConfigured = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_url' && 
  supabaseAnonKey !== 'your_supabase_anon_key' &&
  supabaseAnonKey !== 'your_actual_anon_key_from_supabase_dashboard' &&
  isValidUrl(supabaseUrl);

// Add connection test function
const testSupabaseConnection = async () => {
  if (!isSupabaseConfigured) {
    console.error('Supabase not configured');
    return false;
  }
  
  try {
    // Test connection with a simple query
    const { data, error } = await supabase
      .from('business_settings')
      .select('id')
      .limit(1);
    
    if (error) {
      throw new Error(`Supabase connection failed: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};

if (!isSupabaseConfigured) {
  console.error('Missing or invalid Supabase environment variables');
  
  // Create a comprehensive mock query builder
  const createMockQueryBuilder = () => {
    const builder = {
      select: function(columns?: string) { return this; },
      insert: function(data: any) { return this; },
      update: function(data: any) { return this; },
      delete: function() { return this; },
      eq: function(column: string, value: any) { return this; },
      neq: function(column: string, value: any) { return this; },
      gt: function(column: string, value: any) { return this; },
      gte: function(column: string, value: any) { return this; },
      lt: function(column: string, value: any) { return this; },
      lte: function(column: string, value: any) { return this; },
      like: function(column: string, pattern: string) { return this; },
      ilike: function(column: string, pattern: string) { return this; },
      is: function(column: string, value: any) { return this; },
      in: function(column: string, values: any[]) { return this; },
      contains: function(column: string, value: any) { return this; },
      containedBy: function(column: string, value: any) { return this; },
      rangeGt: function(column: string, value: any) { return this; },
      rangeGte: function(column: string, value: any) { return this; },
      rangeLt: function(column: string, value: any) { return this; },
      rangeLte: function(column: string, value: any) { return this; },
      rangeAdjacent: function(column: string, value: any) { return this; },
      overlaps: function(column: string, value: any) { return this; },
      textSearch: function(column: string, query: string) { return this; },
      match: function(query: object) { return this; },
      not: function(column: string, operator: string, value: any) { return this; },
      or: function(filters: string) { return this; },
      filter: function(column: string, operator: string, value: any) { return this; },
      order: function(column: string, options?: any) { return this; },
      limit: function(count: number) { return this; },
      range: function(from: number, to: number) { return this; },
      abortSignal: function(signal: AbortSignal) { return this; },
      single: function() { 
        return Promise.resolve({ 
          data: null, 
          error: { message: 'Supabase not configured' } 
        }); 
      },
      maybeSingle: function() { 
        return Promise.resolve({ 
          data: null, 
          error: { message: 'Supabase not configured' } 
        }); 
      },
      then: function(onFulfilled?: any, onRejected?: any) {
        return Promise.resolve({ 
          data: [], 
          error: { message: 'Supabase not configured' } 
        }).then(onFulfilled, onRejected);
      },
      catch: function(onRejected?: any) {
        return Promise.resolve({ 
          data: [], 
          error: { message: 'Supabase not configured' } 
        }).catch(onRejected);
      }
    };
    return builder;
  };

  // Create a mock client to prevent crashes
  const mockClient = {
    from: (table: string) => createMockQueryBuilder(),
    auth: {
      signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  };
  
  // Assign mock client
  supabase = mockClient;
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Export at module level (only once)
export { supabase };

// Database types
export interface Barber {
  id: string
  name: string
  email: string
  phone?: string
  photo_url?: string
  specialties: string[]
  rating: number
  experience_years: number
  is_active: boolean
  user_id?: string
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  description?: string
  price: number
  duration_minutes: number
  icon: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  name: string
  phone: string
  birth_date?: string
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  client_id: string
  barber_id: string
  service_id: string
  booking_date: string
  booking_time: string
  status: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado'
  total_price: number
  notes?: string
  created_at: string
  updated_at: string
  // Relations
  client?: Client
  barber?: Barber
  service?: Service
}

export interface BusinessSettings {
  id: string
  business_name: string
  phone: string
  email: string
  address: string
  description?: string
  footer_address?: string
  opening_hours: {
    [key: string]: {
      open: string
      close: string
      closed: boolean
    }
  }
  logo_url?: string
  whatsapp_api_key?: string
  whatsapp_phone_number?: string
  whatsapp_enabled?: boolean
  primary_color?: string
  secondary_color?: string
  theme_mode?: 'dark' | 'light'
  created_at: string
  updated_at: string
}

export interface SlideshowImage {
  id: string
  title: string
  image_url: string
  alt_text?: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GalleryImage {
  id: string
  title: string
  image_url: string
  alt_text?: string
  description?: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Database functions
export const db = {
  // Barbers
  barbers: {
    getAll: async () => {
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured, returning empty barbers array');
        return [];
      }
      
      try {
        console.log('Fetching barbers from Supabase...');
        const { data, error } = await supabase
          .from('barbers')
          .select('*')
          .eq('is_active', true)
          .order('name')
        
        if (error) {
          console.error('Error fetching barbers:', error);
          throw error;
        }
        
        console.log(`Successfully fetched ${data?.length || 0} barbers`);
        return data as Barber[]
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching barbers:', error);
        }
        console.error('Failed to fetch barbers:', error);
        // Return empty array instead of throwing to prevent UI crashes
        return [];
      }
    },

    // Get all barbers for admin (including inactive)
    getAllForAdmin: async () => {
      try {
        const { data, error } = await supabase
          .from('barbers')
          .select('*')
          .order('name')
        
        if (error) throw error
        return data as Barber[]
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching all barbers for admin:', error);
        }
        return [];
      }
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as Barber
    },

    getByUserId: async (userId: string) => {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error) throw error
      return data as Barber
    },

    create: async (barber: Omit<Barber, 'id' | 'created_at' | 'updated_at'>) => {
      // Validate required fields
      if (!barber.name || !barber.name.trim()) {
        throw new Error('Nome é obrigatório')
      }
      
      if (!barber.email || !barber.email.trim()) {
        throw new Error('E-mail é obrigatório')
      }

      // Clean and validate the data
      const cleanBarber = {
        name: barber.name.trim(),
        email: barber.email.trim().toLowerCase(),
        phone: barber.phone?.trim() || null,
        photo_url: barber.photo_url?.trim() || null,
        specialties: Array.isArray(barber.specialties) ? barber.specialties : [],
        rating: Number(barber.rating) || 0,
        experience_years: Number(barber.experience_years) || 0,
        is_active: Boolean(barber.is_active),
        user_id: barber.user_id || null
      }

      console.log('Creating barber with data:', cleanBarber)

      const { data, error } = await supabase
        .from('barbers')
        .insert(cleanBarber)
        .select()
        .single()
      
      if (error) {
        console.error('Supabase error creating barber:', error)
        throw new Error(`Erro ao criar barbeiro: ${error.message}`)
      }
      
      console.log('Barber created successfully:', data)
      return data as Barber
    },

    // Link barber to user account
    linkToUser: async (barberId: string, userId: string) => {
      const { data, error } = await supabase
        .from('barbers')
        .update({ user_id: userId })
        .eq('id', barberId)
        .select()
        .single()
      
      if (error) {
        console.error('Error linking barber to user:', error)
        throw error
      }
      
      return data as Barber
    },
    update: async (id: string, updates: Partial<Barber>) => {
      // Clean and validate the data
      const cleanUpdates: any = {}
      
      if (updates.name !== undefined) {
        if (!updates.name.trim()) {
          throw new Error('Nome é obrigatório')
        }
        cleanUpdates.name = updates.name.trim()
      }
      
      if (updates.email !== undefined) {
        if (!updates.email.trim()) {
          throw new Error('E-mail é obrigatório')
        }
        cleanUpdates.email = updates.email.trim().toLowerCase()
      }
      
      if (updates.phone !== undefined) {
        cleanUpdates.phone = updates.phone?.trim() || null
      }
      
      if (updates.photo_url !== undefined) {
        cleanUpdates.photo_url = updates.photo_url?.trim() || null
      }
      
      if (updates.specialties !== undefined) {
        cleanUpdates.specialties = Array.isArray(updates.specialties) ? updates.specialties : []
      }
      
      if (updates.rating !== undefined) {
        cleanUpdates.rating = Number(updates.rating) || 0
      }
      
      if (updates.experience_years !== undefined) {
        cleanUpdates.experience_years = Number(updates.experience_years) || 0
      }
      
      if (updates.is_active !== undefined) {
        cleanUpdates.is_active = Boolean(updates.is_active)
      }
      
      if (updates.user_id !== undefined) {
        cleanUpdates.user_id = updates.user_id || null
      }

      console.log('Updating barber with data:', cleanUpdates)

      const { data, error } = await supabase
        .from('barbers')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Supabase error updating barber:', error)
        throw new Error(`Erro ao atualizar barbeiro: ${error.message}`)
      }
      
      console.log('Barber updated successfully:', data)
      return data as Barber
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('barbers')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    }
  },

  // Services
  services: {
    getAll: async () => {
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured, returning empty array');
        return [];
      }
      
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('name')
        
        if (error) throw error
        return data as Service[]
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching services:', error);
        }
        return [];
      }
    },

    // Get all services for admin (including inactive)
    getAllForAdmin: async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('name')
        
        if (error) throw error
        return data as Service[]
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching all services for admin:', error);
        }
        return [];
      }
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data as Service
    },

    create: async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('services')
        .insert(service)
        .select()
        .single()
      
      if (error) throw error
      return data as Service
    },

    update: async (id: string, updates: Partial<Service>) => {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as Service
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    }
  },

  // Clients
  clients: {
    getAll: async () => {
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured, returning empty array');
        return [];
      }
      
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('name')
        
        if (error) throw error
        return data as Client[]
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching clients:', error);
        }
        return [];
      }
    },

    create: async (client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
      // Validate required fields
      if (!client.name || !client.name.trim()) {
        throw new Error('Nome é obrigatório')
      }
      
      if (!client.phone || !client.phone.trim()) {
        throw new Error('Telefone é obrigatório')
      }

      // Clean the data - remove any extra spaces and normalize
      const cleanClient = {
        name: client.name.trim(),
        phone: client.phone.trim().replace(/\D/g, ''), // Remove non-digits from phone
        birth_date: client.birth_date || null
      }

      console.log('Creating client with cleaned data:', cleanClient)

      try {
        const { data, error } = await supabase
          .from('clients')
          .insert(cleanClient)
          .select()
          .single()
        
        if (error) {
          console.error('Supabase error creating client:', error)
          throw new Error(`Erro ao criar cliente: ${error.message}`)
        }
        
        console.log('Client created successfully:', data)
        return data as Client
      } catch (error) {
        console.error('Error in client creation:', error)
        throw error
      }
    },

    findByPhone: async (phone: string) => {
      if (!phone || !phone.trim()) {
        throw new Error('Telefone é obrigatório para busca')
      }

      // Clean phone number for search
      const cleanPhone = phone.trim().replace(/\D/g, '')
      console.log('Searching for client with phone:', cleanPhone)

      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('phone', cleanPhone)
          .maybeSingle()
        
        if (error) {
          console.error('Supabase error finding client by phone:', error)
          throw new Error(`Erro ao buscar cliente: ${error.message}`)
        }
        
        console.log('Client search result:', data)
        return data as Client | null
      } catch (error) {
        console.error('Error in client search:', error)
        throw error
      }
    },
    
    update: async (id: string, updates: Partial<Client>) => {
      // Clean and validate the data
      const cleanUpdates: any = {}
      
      if (updates.name !== undefined) {
        if (!updates.name.trim()) {
          throw new Error('Nome é obrigatório')
        }
        cleanUpdates.name = updates.name.trim()
      }
      
      if (updates.phone !== undefined) {
        if (!updates.phone.trim()) {
          throw new Error('Telefone é obrigatório')
        }
        cleanUpdates.phone = updates.phone.trim().replace(/\D/g, '')
      }
      
      if (updates.birth_date !== undefined) {
        cleanUpdates.birth_date = updates.birth_date || null
      }

      console.log('Updating client with data:', cleanUpdates)

      const { data, error } = await supabase
        .from('clients')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Supabase error updating client:', error)
        throw new Error(`Erro ao atualizar cliente: ${error.message}`)
      }
      
      console.log('Client updated successfully:', data)
      return data as Client
    }
  },

  // Bookings
  bookings: {
    getAll: async () => {
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured, returning empty array');
        return [];
      }
      
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            client:clients(*),
            barber:barbers(*),
            service:services(*)
          `)
          .order('booking_date', { ascending: false })
          .order('booking_time', { ascending: false })
        
        if (error) throw error
        return data as Booking[]
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching bookings:', error);
        }
        return [];
      }
    },

    getByDate: async (date: string) => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          client:clients(*),
          barber:barbers(*),
          service:services(*)
        `)
        .eq('booking_date', date)
        .order('booking_time')
      
      if (error) throw error
      return data as Booking[]
    },

    getByBarber: async (barberId: string, date?: string) => {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          client:clients(*),
          barber:barbers(*),
          service:services(*)
        `)
        .eq('barber_id', barberId)
      
      if (date) {
        query = query.eq('booking_date', date)
      }
      
      const { data, error } = await query
        .order('booking_date', { ascending: false })
        .order('booking_time')
      
      if (error) throw error
      return data as Booking[]
    },

    getByBarberUserId: async (userId: string, date?: string) => {
      // First get the barber by user_id
      const { data: barber, error: barberError } = await supabase
        .from('barbers')
        .select('id')
        .eq('user_id', userId)
        .single()
      
      if (barberError || !barber) {
        throw new Error('Barber not found for user')
      }

      return db.bookings.getByBarber(barber.id, date)
    },

    getByDateRange: async (barberId: string, startDate: string, endDate: string) => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          client:clients(*),
          barber:barbers(*),
          service:services(*)
        `)
        .eq('barber_id', barberId)
        .gte('booking_date', startDate)
        .lte('booking_date', endDate)
        .order('booking_date', { ascending: false })
        .order('booking_time')
      
      if (error) throw error
      return data as Booking[]
    },

    create: async (booking: Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'client' | 'barber' | 'service'>) => {
      // Validate required fields
      if (!booking.client_id) {
        throw new Error('ID do cliente é obrigatório')
      }
      
      if (!booking.barber_id) {
        throw new Error('ID do barbeiro é obrigatório')
      }
      
      if (!booking.service_id) {
        throw new Error('ID do serviço é obrigatório')
      }
      
      if (!booking.booking_date) {
        throw new Error('Data do agendamento é obrigatória')
      }
      
      if (!booking.booking_time) {
        throw new Error('Horário do agendamento é obrigatório')
      }
      
      if (!booking.total_price || booking.total_price <= 0) {
        throw new Error('Preço total deve ser maior que zero')
      }

      // Clean the data
      const cleanBooking = {
        client_id: booking.client_id,
        barber_id: booking.barber_id,
        service_id: booking.service_id,
        booking_date: booking.booking_date,
        booking_time: booking.booking_time,
        status: booking.status || 'agendado',
        total_price: Number(booking.total_price),
        notes: booking.notes?.trim() || null
      }

      console.log('Creating booking with data:', cleanBooking)

      try {
        const { data, error } = await supabase
          .from('bookings')
          .insert(cleanBooking)
          .select(`
            *,
            client:clients(*),
            barber:barbers(*),
            service:services(*)
          `)
          .single()
        
        if (error) {
          console.error('Supabase error creating booking:', error)
          throw new Error(`Erro ao criar agendamento: ${error.message}`)
        }
        
        console.log('Booking created successfully:', data)
        return data as Booking
      } catch (error) {
        console.error('Error in booking creation:', error)
        throw error
      }
    },

    update: async (id: string, updates: Partial<Booking>) => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .update(updates)
          .eq('id', id)
          .select(`
            *,
            client:clients(*),
            barber:barbers(*),
            service:services(*)
          `)
          .single()
        
      if (error) throw error
      
      const updatedBooking = data as Booking;
      
      // Send WhatsApp notification if status changed to 'confirmado'
      if (updates.status === 'confirmado' && updatedBooking.client?.phone) {
        try {
          // Check if WhatsApp is enabled in settings
          const settings = await db.settings.get();
          
          if (settings.whatsapp_enabled) {
            const message = whatsappAPI.formatConfirmationMessage(updatedBooking);
            const result = await whatsappAPI.sendMessage(updatedBooking.client.phone, message);
            
            if (result.success) {
              console.log('WhatsApp confirmation sent successfully via WPPConnect');
            } else {
              console.log('Failed to send WhatsApp confirmation:', result.message);
            }
          } else {
            console.log('WhatsApp notifications disabled in settings');
          }
        } catch (error) {
          console.error('Error sending WhatsApp confirmation:', error);
        }
      }
      
      return updatedBooking;
      } catch (error) {
        console.error('Error updating booking:', error);
        throw error;
      }
    },

    delete: async (id: string) => {
      try {
        const { error: deleteError } = await supabase
          .from('bookings')
          .delete()
          .eq('id', id)
        
      if (deleteError) throw deleteError
      } catch (error) {
        console.error('Error deleting booking:', error);
        throw error;
      }
    }
  },

  // Business Settings
  settings: {
    get: async () => {
      try {
        console.log('Fetching business settings...');
        const { data, error } = await supabase 
          .from('business_settings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(); // Use maybeSingle instead of single to handle empty results
        
        if (error) {
          console.error('Error fetching business settings:', error);
          throw error;
        }
        
        console.log('Business settings fetched:', data);
        
        // If no data found, return default settings
        if (!data) {
          console.log('No business settings found, returning defaults');
          return {
            id: null, // Use null instead of undefined for consistency
            business_name: 'GM Barbearia',
            phone: '(11) 99999-9999',
            email: 'contato@gmbarbearia.com',
            address: 'Rua das Flores, 123 - Centro, São Paulo - SP',
            description: 'Com mais de 10 anos de experiência, a GM Barbearia é referência em cortes masculinos na região. Combinamos técnicas tradicionais com tendências modernas para oferecer o melhor serviço aos nossos clientes.',
            footer_address: 'Rua das Flores, 123 - Centro',
            opening_hours: {
              monday: { open: '08:00', close: '18:00', closed: false },
              tuesday: { open: '08:00', close: '18:00', closed: false },
              wednesday: { open: '08:00', close: '18:00', closed: false },
              thursday: { open: '08:00', close: '18:00', closed: false },
              friday: { open: '08:00', close: '18:00', closed: false },
              saturday: { open: '08:00', close: '16:00', closed: false },
              sunday: { open: '08:00', close: '16:00', closed: true }
            },
            logo_url: '/WhatsApp Image 2025-06-26 at 08.22.png',
            whatsapp_enabled: false,
            whatsapp_api_key: '',
            whatsapp_phone_number: '',
            primary_color: '#f59e0b',
            secondary_color: '#ea580c',
            theme_mode: 'dark',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as BusinessSettings;
        }
        
        return data as BusinessSettings
      } catch (error) {
        console.error('Error in business settings.get():', error);
        // Return default settings if none found
        return {
          id: null,
          business_name: 'GM Barbearia',
          phone: '(11) 99999-9999',
          email: 'contato@gmbarbearia.com',
          address: 'Rua das Flores, 123 - Centro, São Paulo - SP',
          description: 'Com mais de 10 anos de experiência, a GM Barbearia é referência em cortes masculinos na região. Combinamos técnicas tradicionais com tendências modernas para oferecer o melhor serviço aos nossos clientes.',
          footer_address: 'Rua das Flores, 123 - Centro',
          opening_hours: {
            monday: { open: '08:00', close: '18:00', closed: false },
            tuesday: { open: '08:00', close: '18:00', closed: false },
            wednesday: { open: '08:00', close: '18:00', closed: false },
            thursday: { open: '08:00', close: '18:00', closed: false },
            friday: { open: '08:00', close: '18:00', closed: false },
            saturday: { open: '08:00', close: '16:00', closed: false },
            sunday: { open: '08:00', close: '16:00', closed: true }
          },
          logo_url: '/WhatsApp Image 2025-06-26 at 08.22.png',
          whatsapp_enabled: false,
          whatsapp_api_key: '',
          whatsapp_phone_number: '',
          primary_color: '#f59e0b',
          secondary_color: '#ea580c',
          theme_mode: 'dark',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as BusinessSettings;
      }
    },

    update: async (updates: Partial<BusinessSettings>) => {
      // Remove id from updates to prevent UUID conflicts
      const { id, ...cleanUpdates } = { ...updates };
      
      console.log('Updating business settings:', cleanUpdates);
      
      // Ensure tenant_id is null for single-tenant setups if not provided
      if (!cleanUpdates.tenant_id) {
        cleanUpdates.tenant_id = null;
      }
      
      // First get the most recent settings record
      const { data: currentSettings, error: fetchError } = await supabase
        .from('business_settings')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching current settings:', fetchError);
        throw fetchError;
      }
      
      if (!currentSettings) {
        // If no settings exist, create a new one
        console.log('No existing settings found, creating new record');
        
        // Ensure required fields have defaults for creation
        const settingsToCreate = {
          business_name: 'GM Barbearia',
          phone: '(11) 99999-9999',
          email: 'contato@gmbarbearia.com',
          address: 'Rua das Flores, 123 - Centro, São Paulo - SP',
          description: 'Com mais de 10 anos de experiência, a GM Barbearia é referência em cortes masculinos na região. Combinamos técnicas tradicionais com tendências modernas para oferecer o melhor serviço aos nossos clientes.',
          footer_address: 'Rua das Flores, 123 - Centro',
          opening_hours: {
            monday: { open: '08:00', close: '18:00', closed: false },
            tuesday: { open: '08:00', close: '18:00', closed: false },
            wednesday: { open: '08:00', close: '18:00', closed: false },
            thursday: { open: '08:00', close: '18:00', closed: false },
            friday: { open: '08:00', close: '18:00', closed: false },
            saturday: { open: '08:00', close: '16:00', closed: false },
            sunday: { open: '08:00', close: '16:00', closed: true }
          },
          logo_url: '/WhatsApp Image 2025-06-26 at 08.22.png',
          whatsapp_enabled: false,
          whatsapp_api_key: '',
          whatsapp_phone_number: '',
          primary_color: '#f59e0b',
          secondary_color: '#ea580c',
          theme_mode: 'dark',
          tenant_id: null,
          ...cleanUpdates
        };
        
        const { data, error } = await supabase
          .from('business_settings')
          .insert(settingsToCreate)
          .select()
          .single(); 
        
        if (error) {
          console.error('Error creating business settings:', error);
          throw error;
        }
        
        console.log('Created new business settings:', data);
        return data as BusinessSettings;
      }
      
      // Update the most recent settings record
      console.log('Updating existing settings with ID:', currentSettings.id);
      const { data, error } = await supabase
        .from('business_settings')
        .update(cleanUpdates)
        .eq('id', currentSettings.id)
        .select()
        .single(); 
      
      if (error) {
        console.error('Error updating business settings:', error);
        throw error;
      }
      
      console.log('Updated business settings:', data);
      return data as BusinessSettings;
    }
  },

  // Slideshow Images
  slideshow: {
    getAll: async () => {
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured, returning fallback slideshow');
        return [{
          id: 'fallback-1',
          title: 'GM Barbearia',
          image_url: '/WhatsApp Image 2025-06-26 at 08.22.png',
          alt_text: 'GM Barbearia - Tradição e qualidade',
          order_index: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }];
      }
      
      try {
        const { data, error } = await supabase
          .from('slideshow_images')
          .select('*')
          .eq('is_active', true)
          .order('order_index')
        
        if (error) throw error
        return data as SlideshowImage[]
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching slideshow images:', error);
        }
        return [];
      }
    },

    getAllForAdmin: async () => {
      if (!isSupabaseConfigured) {
        return [];
      }
      
      try {
        const { data, error } = await supabase
          .from('slideshow_images')
          .select('*')
          .order('order_index')
        
        if (error) throw error
        return data as SlideshowImage[]
      } catch (error) {
        console.error('Error fetching slideshow images for admin:', error);
        return [];
      }
    },

    create: async (image: Omit<SlideshowImage, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('slideshow_images')
        .insert(image)
        .select()
        .single()
      
      if (error) throw error
      return data as SlideshowImage
    },

    update: async (id: string, updates: Partial<SlideshowImage>) => {
      const { data, error } = await supabase
        .from('slideshow_images')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as SlideshowImage
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('slideshow_images')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },

    reorder: async (images: { id: string; order_index: number }[]) => {
      const updates = images.map(img => 
        supabase
          .from('slideshow_images')
          .update({ order_index: img.order_index })
          .eq('img.id', img.id)
      )
      
      await Promise.all(updates)
    }
  },

  // Gallery Images
  gallery: {
    getAll: async () => {
      if (!isSupabaseConfigured) {
        console.warn('Supabase not configured, returning fallback gallery');
        return [
          {
            id: '1',
            title: 'Degradê Moderno',
            image_url: '/378cb9c6-0863-42aa-ad7f-b2a338f13f2e.jpg',
            alt_text: 'Corte degradê moderno com acabamento perfeito',
            description: 'Corte degradê moderno com acabamento perfeito'
          },
          {
            id: '2',
            title: 'Corte Clássico',
            image_url: '/d7f6cecd-0b2b-4a33-a217-abcaa4f68a12.jpg',
            alt_text: 'Corte clássico com risco lateral e acabamento profissional',
            description: 'Corte clássico com risco lateral e acabamento profissional'
          }
        ];
      }
      
      try {
        const { data, error } = await supabase
          .from('gallery_images')
          .select('*')
          .eq('is_active', true)
          .order('order_index')
        
        if (error) throw error
        return data as GalleryImage[]
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching gallery images:', error);
        }
        return [];
      }
    },

    getAllForAdmin: async () => {
      if (!isSupabaseConfigured) {
        return [];
      }
      
      try {
        const { data, error } = await supabase
          .from('gallery_images')
          .select('*')
          .order('order_index')
        
        if (error) throw error
        return data as GalleryImage[]
      } catch (error) {
        console.error('Error fetching gallery images for admin:', error);
        return [];
      }
    },

    create: async (image: Omit<GalleryImage, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('gallery_images')
        .insert(image)
        .select()
        .single()
      
      if (error) throw error
      return data as GalleryImage
    },

    update: async (id: string, updates: Partial<GalleryImage>) => {
      const { data, error } = await supabase
        .from('gallery_images')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as GalleryImage
    },

    delete: async (id: string) => {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },

    reorder: async (images: { id: string; order_index: number }[]) => {
      const updates = images.map(img => 
        supabase
          .from('gallery_images')
          .update({ order_index: img.order_index })
          .eq('id', img.id)
      )
      
      await Promise.all(updates)
    }
  }
}