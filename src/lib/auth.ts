import { supabase } from './supabase';

// Interface para dados de usuário
interface UserCreationData {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'barber';
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'barber';
  name: string;
}

export const authService = {
  // Sign up a new user
  signUp: async (email: string, password: string, userData: { role: 'admin' | 'barber'; name: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: undefined // Disable email confirmation
      }
    });
    
    if (error) throw error;
    return data;
  },

  // Sign in user
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  // Sign out user
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  getCurrentUser: async (): Promise<AuthUser | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    const metadata = user.user_metadata || {};
    
    return {
      id: user.id,
      email: user.email || '',
      role: metadata.role || (user.email === 'admin@gmbarbearia.com' ? 'admin' : 'barber'),
      name: metadata.name || (user.email === 'admin@gmbarbearia.com' ? 'Administrador' : 'Barbeiro')
    };
  },

  // Create multiple users automatically
  createUsersAutomatically: async () => {
    const usersToCreate: UserCreationData[] = [
      {
        email: 'admin@gmbarbearia.com',
        password: 'admin123',
        name: 'Administrador',
        role: 'admin'
      },
      {
        email: 'carlos@gmbarbearia.com',
        password: 'barber123',
        name: 'Carlos Silva',
        role: 'barber'
      },
      {
        email: 'joao@gmbarbearia.com',
        password: 'barber123',
        name: 'João Santos',
        role: 'barber'
      },
      {
        email: 'pedro@gmbarbearia.com',
        password: 'barber123',
        name: 'Pedro Costa',
        role: 'barber'
      },
      {
        email: 'rafael@gmbarbearia.com',
        password: 'barber123',
        name: 'Rafael Lima',
        role: 'barber'
      }
    ];

    const results = [];
    
    for (const userData of usersToCreate) {
      try {
        // Check if user already exists
        const { data: existingUser } = await supabase.auth.admin.getUserByEmail(userData.email);
        
        if (existingUser.user) {
          console.log(`Usuário ${userData.email} já existe`);
          results.push({ email: userData.email, status: 'exists', success: true });
          continue;
        }

        // Create new user
        const { data, error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              name: userData.name,
              role: userData.role
            },
            emailRedirectTo: undefined // Disable email confirmation
          }
        });

        if (error) {
          console.error(`Erro ao criar usuário ${userData.email}:`, error);
          results.push({ email: userData.email, status: 'error', error: error.message, success: false });
          continue;
        }

        console.log(`Usuário ${userData.email} criado com sucesso`);
        results.push({ email: userData.email, status: 'created', success: true, userId: data.user?.id });

        // If it's a barber, link with barber record
        if (userData.role === 'barber' && data.user?.id) {
          try {
            await authService.linkBarberToUser(userData.email, data.user.id);
          } catch (linkError) {
            console.error(`Erro ao vincular barbeiro ${userData.email}:`, linkError);
          }
        }

      } catch (error) {
        console.error(`Erro geral ao processar usuário ${userData.email}:`, error);
        results.push({ email: userData.email, status: 'error', error: (error as Error).message, success: false });
      }
    }

    return results;
  },

  // Link barber record to user
  linkBarberToUser: async (email: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('barbers')
        .update({ user_id: userId })
        .eq('email', email)
        .select()
        .single();

      if (error) {
        console.error('Erro ao vincular barbeiro ao usuário:', error);
        throw error;
      }

      console.log(`Barbeiro ${email} vinculado ao usuário ${userId}`);
      return data;
    } catch (error) {
      console.error('Erro ao vincular barbeiro:', error);
      throw error;
    }
  },

  // Check if all required users exist
  checkRequiredUsers: async () => {
    const requiredEmails = [
      'admin@gmbarbearia.com',
      'carlos@gmbarbearia.com',
      'joao@gmbarbearia.com',
      'pedro@gmbarbearia.com',
      'rafael@gmbarbearia.com'
    ];

    const results = [];
    
    for (const email of requiredEmails) {
      try {
        const { data } = await supabase.auth.admin.getUserByEmail(email);
        results.push({
          email,
          exists: !!data.user,
          userId: data.user?.id
        });
      } catch (error) {
        results.push({
          email,
          exists: false,
          error: (error as Error).message
        });
      }
    }

    return results;
  },

  // Create initial users (for development setup)
  createInitialUsers: async () => {
    try {
      console.log('Iniciando criação automática de usuários...');
      const results = await authService.createUsersAutomatically();
      
      const successful = results.filter(r => r.success).length;
      const total = results.length;
      
      console.log(`Processo concluído: ${successful}/${total} usuários processados com sucesso`);
      
      // Show detailed results
      results.forEach(result => {
        if (result.success) {
          console.log(`✅ ${result.email}: ${result.status}`);
        } else {
          console.log(`❌ ${result.email}: ${result.status} - ${result.error}`);
        }
      });
      
      return results;
    } catch (error) {
      console.error('Erro no processo de criação de usuários:', error);
      throw error;
    }
  },

  // Legacy method - keeping for compatibility
  createInitialUsersLegacy: async () => {
    try {
      // Create admin user
      await authService.signUp('admin@gmbarbearia.com', 'admin123', {
        role: 'admin',
        name: 'Administrador'
      });

      // Create barber users
      const barbers = [
        { email: 'carlos@gmbarbearia.com', name: 'Carlos Silva' },
        { email: 'joao@gmbarbearia.com', name: 'João Santos' },
        { email: 'pedro@gmbarbearia.com', name: 'Pedro Costa' },
        { email: 'rafael@gmbarbearia.com', name: 'Rafael Lima' }
      ];

      for (const barber of barbers) {
        await authService.signUp(barber.email, 'barber123', {
          role: 'barber',
          name: barber.name
        });
      }

      console.log('Initial users created successfully');
    } catch (error) {
      console.error('Error creating initial users (legacy):', error);
    }
  }
};