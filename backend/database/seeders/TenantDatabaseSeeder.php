<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TenantDatabaseSeeder extends Seeder
{
    /**
     * Seed the tenant's database.
     */
    public function run(): void
    {
        // Inserir barbeiros iniciais
        DB::table('barbers')->insert([
            [
                'id' => Str::uuid()->toString(),
                'name' => 'Carlos Silva',
                'email' => 'carlos@gmbarbearia.com',
                'phone' => '(11) 99999-0001',
                'photo_url' => 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300',
                'specialties' => json_encode(['Corte Clássico', 'Barba', 'Degradê']),
                'rating' => 4.9,
                'experience_years' => 8,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid()->toString(),
                'name' => 'João Santos',
                'email' => 'joao@gmbarbearia.com',
                'phone' => '(11) 99999-0002',
                'photo_url' => 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300',
                'specialties' => json_encode(['Corte Moderno', 'Sobrancelha', 'Barba']),
                'rating' => 4.8,
                'experience_years' => 6,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid()->toString(),
                'name' => 'Pedro Costa',
                'email' => 'pedro@gmbarbearia.com',
                'phone' => '(11) 99999-0003',
                'photo_url' => 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=300',
                'specialties' => json_encode(['Corte Social', 'Degradê', 'Barba Completa']),
                'rating' => 4.7,
                'experience_years' => 5,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Inserir serviços iniciais
        DB::table('services')->insert([
            [
                'id' => Str::uuid()->toString(),
                'name' => 'Corte Tradicional',
                'description' => 'Corte clássico com acabamento perfeito',
                'price' => 25.00,
                'duration_minutes' => 30,
                'icon' => '✂️',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid()->toString(),
                'name' => 'Corte + Barba',
                'description' => 'Corte completo com barba alinhada',
                'price' => 40.00,
                'duration_minutes' => 45,
                'icon' => '🧔',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid()->toString(),
                'name' => 'Barba Completa',
                'description' => 'Barba feita com navalha e acabamento',
                'price' => 20.00,
                'duration_minutes' => 25,
                'icon' => '🪒',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid()->toString(),
                'name' => 'Sobrancelha',
                'description' => 'Alinhamento e design de sobrancelhas',
                'price' => 10.00,
                'duration_minutes' => 15,
                'icon' => '👁️',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Inserir configurações do negócio
        DB::table('business_settings')->insert([
            'id' => Str::uuid()->toString(),
            'business_name' => 'GM Barbearia',
            'phone' => '(11) 99999-9999',
            'email' => 'contato@gmbarbearia.com',
            'address' => 'Rua das Flores, 123 - Centro, São Paulo - SP',
            'description' => 'Com mais de 10 anos de experiência, a GM Barbearia é referência em cortes masculinos na região. Combinamos técnicas tradicionais com tendências modernas para oferecer o melhor serviço aos nossos clientes.',
            'footer_address' => 'Rua das Flores, 123 - Centro',
            'opening_hours' => json_encode([
                'monday' => ['open' => '08:00', 'close' => '18:00', 'closed' => false],
                'tuesday' => ['open' => '08:00', 'close' => '18:00', 'closed' => false],
                'wednesday' => ['open' => '08:00', 'close' => '18:00', 'closed' => false],
                'thursday' => ['open' => '08:00', 'close' => '18:00', 'closed' => false],
                'friday' => ['open' => '08:00', 'close' => '18:00', 'closed' => false],
                'saturday' => ['open' => '08:00', 'close' => '16:00', 'closed' => false],
                'sunday' => ['open' => '08:00', 'close' => '16:00', 'closed' => true],
            ]),
            'logo_url' => '/WhatsApp Image 2025-06-26 at 08.22.png',
            'primary_color' => '#f59e0b',
            'secondary_color' => '#ea580c',
            'theme_mode' => 'dark',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Inserir imagens do slideshow
        DB::table('slideshow_images')->insert([
            [
                'id' => Str::uuid()->toString(),
                'title' => 'Interior da Barbearia 1',
                'image_url' => '/03d0d17b-50d9-4901-8828-3920ab89437f.jpg',
                'alt_text' => 'Vista geral do interior da barbearia com cadeiras e espelhos',
                'order_index' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid()->toString(),
                'title' => 'Interior da Barbearia 2',
                'image_url' => '/85d9542f-928a-4f42-a117-f19c5423163c.jpg',
                'alt_text' => 'Ambiente moderno da barbearia com iluminação profissional',
                'order_index' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Inserir imagens da galeria
        DB::table('gallery_images')->insert([
            [
                'id' => Str::uuid()->toString(),
                'title' => 'Degradê Moderno',
                'image_url' => '/378cb9c6-0863-42aa-ad7f-b2a338f13f2e.jpg',
                'alt_text' => 'Corte degradê moderno com acabamento perfeito',
                'description' => 'Corte degradê moderno com acabamento perfeito e transições suaves',
                'order_index' => 1,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid()->toString(),
                'title' => 'Corte Clássico com Risco',
                'image_url' => '/d7f6cecd-0b2b-4a33-a217-abcaa4f68a12.jpg',
                'alt_text' => 'Corte clássico com risco lateral e acabamento profissional',
                'description' => 'Corte clássico com risco lateral bem definido e acabamento profissional',
                'order_index' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Inserir mensagem de aniversário padrão
        DB::table('birthday_messages')->insert([
            'id' => Str::uuid()->toString(),
            'title' => 'Mensagem de Aniversário Padrão',
            'message_template' => '🎂 *Feliz Aniversário, {client_name}!* 🎉

Toda a equipe da GM Barbearia deseja a você um dia incrível cheio de felicidade e realizações!

Como presente especial, queremos oferecer um *desconto de 20%* em qualquer serviço da nossa barbearia válido durante todo o mês do seu aniversário.

Basta mencionar este desconto ao agendar seu horário.

Agradecemos por fazer parte da nossa história e esperamos continuar cuidando do seu visual por muitos anos!

Abraços,
Equipe GM Barbearia ✂️',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Inserir mensagem de retenção padrão
        DB::table('retention_messages')->insert([
            'id' => Str::uuid()->toString(),
            'title' => 'Mensagem de Retorno - 60 dias',
            'message_template' => '👋 *Olá, {client_name}!*

Sentimos sua falta na GM Barbearia! Já faz mais de {days_inactive} dias desde sua última visita.

Que tal agendar um horário para renovar seu visual? Estamos com novidades e promoções especiais para você.

*Oferta Especial de Retorno:* 15% de desconto em qualquer serviço!

Para agendar, é só responder esta mensagem ou acessar nosso site.

Esperamos vê-lo em breve!

Equipe GM Barbearia ✂️',
            'days_inactive' => 60,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}