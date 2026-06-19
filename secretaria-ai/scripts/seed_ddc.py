import sqlite3
import json
from datetime import datetime, timedelta

DB_PATH = './db/secretaria.db'

def seed_ddc():
    print("🌱 Seeding DDC tables for Pousada Serenity...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    tenant_id = 'client-001'
    prop_id = 'prop-001'
    
    # 1. Clean up old data for client-001 to support idempotent runs
    print("🧹 Cleaning old records for client-001...")
    
    # Get active conversation IDs for this tenant
    cursor.execute("SELECT id FROM conversation_logs WHERE tenantId = ?", (tenant_id,))
    conv_ids = [r[0] for r in cursor.fetchall()]
    if conv_ids:
        placeholders = ','.join('?' for _ in conv_ids)
        cursor.execute(f"DELETE FROM conversation_messages WHERE conversationId IN ({placeholders})", conv_ids)
        
    cursor.execute("DELETE FROM conversation_logs WHERE tenantId = ?", (tenant_id,))
    cursor.execute("DELETE FROM bookings WHERE tenantId = ?", (tenant_id,))
    
    # Get guest IDs to clean guest_messages
    cursor.execute("SELECT id FROM guests WHERE tenantId = ?", (tenant_id,))
    guest_ids = [r[0] for r in cursor.fetchall()]
    if guest_ids:
        placeholders = ','.join('?' for _ in guest_ids)
        cursor.execute(f"DELETE FROM guest_messages WHERE guestId IN ({placeholders})", guest_ids)
        
    cursor.execute("DELETE FROM guests WHERE tenantId = ?", (tenant_id,))
    cursor.execute("DELETE FROM rooms WHERE tenantId = ?", (tenant_id,))
    cursor.execute("DELETE FROM properties WHERE tenantId = ?", (tenant_id,))
    cursor.execute("DELETE FROM tenants WHERE id = ?", (tenant_id,))
    cursor.execute("DELETE FROM knowledge_entries WHERE tenantId = ?", (tenant_id,))
    cursor.execute("DELETE FROM training_prompts WHERE tenantId = ?", (tenant_id,))
    cursor.execute("DELETE FROM notifications WHERE tenantId = ?", (tenant_id,))
    cursor.execute("DELETE FROM performance_snapshots WHERE tenantId = ?", (tenant_id,))
    cursor.execute("DELETE FROM ai_activity_logs WHERE tenantId = ?", (tenant_id,))
    
    # Current date and offsets
    now_str = datetime.utcnow().isoformat() + 'Z'
    today_str = datetime.utcnow().strftime('%Y-%m-%d')
    yesterday = (datetime.utcnow() - timedelta(days=1)).strftime('%Y-%m-%d')
    
    # 2. Insert Tenant
    print("🏨 Inserting Tenant...")
    cursor.execute('''
        INSERT INTO tenants (id, name, email, passwordHash, phone, phoneAlt, role, plan, status, trialStart, trialEnd, subscriptionAt, domain, clerkOrgId, subscriptionId, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        tenant_id,
        'Pousada Serenity',
        'ana@pousadaserenity.com.br',
        None, # passwordHash
        '5532999990001', # phone
        '5532999990001', # phoneAlt (WhatsApp DDC)
        'owner',
        'pro',
        'active',
        (datetime.utcnow() - timedelta(days=30)).isoformat() + 'Z', # trialStart
        (datetime.utcnow() + timedelta(days=60)).isoformat() + 'Z', # trialEnd
        now_str, # subscriptionAt
        'pousadaserenity.com.br',
        'org_serenity_01',
        'sub_serenity_01',
        now_str,
        now_str
    ))
    
    # 3. Insert Property
    print("🏢 Inserting Property...")
    cursor.execute('''
        INSERT INTO properties (id, tenantId, name, document, street, number, neighborhood, city, state, zipCode, type, website, description, services, paymentMethods, pixKey, pixKeyType, bankName, bankAgency, bankAccount, bankAccountType, bankCpf, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        prop_id,
        tenant_id,
        'Pousada Serenity',
        '12.345.678/0001-90',
        'Rua Direita',
        '124',
        'Centro Histórico',
        'Tiradentes',
        'MG',
        '36325-000',
        'pousada',
        'https://www.pousadaserenity.com.br',
        'Pousada aconchegante no coração histórico de Tiradentes com piscina aquecida, café da manhã colonial e atendimento personalizado por IA.',
        json.dumps(['wifi', 'piscina', 'cafe_manha', 'estacionamento', 'pet_friendly']),
        json.dumps(['pix', 'cartao_credito', 'dinheiro']),
        '12.345.678/0001-90',
        'cnpj',
        'Banco do Brasil',
        '0123-4',
        '12345-6',
        'cc',
        '12.345.678/0001-90',
        now_str,
        now_str
    ))
    
    # 4. Insert Rooms (12 Rooms)
    print("🛏️ Inserting 12 Rooms...")
    rooms_data = [
        ('room-101', 'Suíte Luxo Casal 101', '101', 'luxo', 2, 350.0, 350.0, 'disponivel'),
        ('room-102', 'Suíte Luxo Casal 102', '102', 'luxo', 2, 350.0, 350.0, 'ocupado'),
        ('room-103', 'Suíte Standard Casal 103', '103', 'standard', 2, 280.0, 280.0, 'disponivel'),
        ('room-104', 'Suíte Standard Duplo 104', '104', 'standard', 2, 280.0, 280.0, 'ocupado'),
        ('room-105', 'Suíte Família 105', '105', 'suite', 4, 480.0, 480.0, 'disponivel'),
        ('room-106', 'Chalé Jardim 106', '106', 'chale', 2, 400.0, 400.0, 'disponivel'),
        ('room-107', 'Chalé Jardim 107', '107', 'chale', 2, 400.0, 400.0, 'disponivel'),
        ('room-201', 'Suíte Master Hidro 201', '201', 'luxo', 2, 650.0, 650.0, 'ocupado'),
        ('room-202', 'Suíte Master Hidro 202', '202', 'luxo', 2, 650.0, 650.0, 'disponivel'),
        ('room-203', 'Suíte Vista Serra 203', '203', 'standard', 2, 380.0, 380.0, 'disponivel'),
        ('room-204', 'Suíte Vista Serra 204', '204', 'standard', 2, 380.0, 380.0, 'manutencao'),
        ('room-205', 'Bangalô Premium 205', '205', 'chale', 2, 550.0, 550.0, 'disponivel'),
    ]
    
    for r_id, r_name, r_num, r_type, r_cap, r_price, r_base, r_status in rooms_data:
        cursor.execute('''
            INSERT INTO rooms (id, propertyId, tenantId, name, number, type, capacity, price, basePrice, status, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (r_id, prop_id, tenant_id, r_name, r_num, r_type, r_cap, r_price, r_base, r_status, now_str, now_str))
        
    # 5. Insert Guests
    print("👤 Inserting Guests...")
    guests_data = [
        # id, name, phone, email, document, status, avatar, source, value, lastContact, checkIn, checkOut, room, aiScore, notes, conversationCount, metadata
        ('guest-01', 'Carlos Eduardo Silva', '5511987654321', 'carlos.eduardo@gmail.com', '123.456.789-00', 'staying', 'CE', 'whatsapp', 1050.0, 
         (datetime.utcnow() - timedelta(hours=1)).isoformat() + 'Z', (datetime.utcnow() - timedelta(days=2)).isoformat() + 'Z', (datetime.utcnow() + timedelta(days=1)).isoformat() + 'Z', '101', 85, 'Pediu travesseiro extra e café no quarto.', 4, '{}'),
        
        ('guest-02', 'Mariana Alencar Costa', '5521998887766', 'mariana.costa@hotmail.com', '234.567.890-11', 'staying', 'MC', 'booking', 1440.0,
         (datetime.utcnow() - timedelta(hours=3)).isoformat() + 'Z', (datetime.utcnow() - timedelta(days=1)).isoformat() + 'Z', (datetime.utcnow() + timedelta(days=2)).isoformat() + 'Z', '201', 90, 'Comemoração de aniversário de casamento.', 3, '{}'),
         
        ('guest-03', 'Fernanda Lima Nogueira', '5531977778888', 'fernanda.lima@yahoo.com.br', '345.678.901-22', 'booked', 'FL', 'whatsapp', 700.0,
         (datetime.utcnow() - timedelta(hours=5)).isoformat() + 'Z', (datetime.utcnow() + timedelta(days=1)).isoformat() + 'Z', (datetime.utcnow() + timedelta(days=3)).isoformat() + 'Z', '103', 95, 'Primeira vez na pousada. Solicitou berço.', 6, '{}'),
         
        ('guest-04', 'Roberto Almeida Sobrinho', '5511966665555', 'roberto.almeida@gmail.com', '456.789.012-33', 'checked_out', 'RA', 'airbnb', 1200.0,
         (datetime.utcnow() - timedelta(days=2)).isoformat() + 'Z', (datetime.utcnow() - timedelta(days=5)).isoformat() + 'Z', (datetime.utcnow() - timedelta(days=2)).isoformat() + 'Z', '105', 80, None, 8, '{}'),
         
        ('guest-05', 'José Silveira Ramos', '5551955554444', 'jose.silveira@uol.com.br', '567.890.123-44', 'warm', 'JR', 'whatsapp', 0.0,
         (datetime.utcnow() - timedelta(minutes=15)).isoformat() + 'Z', None, None, None, 75, 'Perguntou sobre política de pet.', 4, '{}'),
         
        ('guest-06', 'Juliana Mendes Rezende', '5519944443333', 'juliana.mendes@gmail.com', '678.901.234-55', 'hot', 'JR', 'instagram', 0.0,
         (datetime.utcnow() - timedelta(minutes=5)).isoformat() + 'Z', None, None, None, 88, 'Quer fechar pacote de feriado em Julho.', 5, '{}'),
         
        ('guest-07', 'Lucas Santos Machado', '5581933332222', 'lucas.santos@gmail.com', '789.012.345-66', 'booked', 'LM', 'direct', 800.0,
         (datetime.utcnow() - timedelta(days=1)).isoformat() + 'Z', (datetime.utcnow() + timedelta(days=5)).isoformat() + 'Z', (datetime.utcnow() + timedelta(days=7)).isoformat() + 'Z', '106', 92, None, 2, '{}'),
         
        ('guest-08', 'Patrícia Costa Ferreira', '5571922221111', 'patricia.costa@gmail.com', '890.123.456-77', 'checked_out', 'PF', 'booking', 760.0,
         (datetime.utcnow() - timedelta(days=5)).isoformat() + 'Z', (datetime.utcnow() - timedelta(days=7)).isoformat() + 'Z', (datetime.utcnow() - timedelta(days=5)).isoformat() + 'Z', '203', 82, None, 3, '{}'),
         
        ('guest-09', 'Ana Claudia Martins', '5532999990001', 'ana@pousadaserenity.com.br', None, 'new', 'AM', 'whatsapp', 0.0,
         (datetime.utcnow() - timedelta(days=10)).isoformat() + 'Z', None, None, None, 50, 'Contato Administrativo Proprietária', 1, '{}')
    ]
    
    for g in guests_data:
        cursor.execute('''
            INSERT INTO guests (id, tenantId, name, phone, email, document, status, avatar, source, value, lastContact, checkIn, checkOut, room, aiScore, notes, conversationCount, metadata, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            g[0], tenant_id, g[1], g[2], g[3], g[4], g[5], g[6], g[7], g[8],
            g[9], # lastContact
            g[10], # checkIn
            g[11], # checkOut
            g[12], # room
            g[13], # aiScore
            g[14], # notes
            g[15], # conversationCount
            g[16], # metadata
            now_str, now_str
        ))

    # 6. Insert Bookings (Reservas)
    print("📅 Inserting Bookings...")
    bookings_data = [
        # id, guestId, guestName, roomName, checkIn, checkOut, nights, guests, totalValue, status, paymentMethod, paymentStatus, source, aiGenerated
        ('book-01', 'guest-01', 'Carlos Eduardo Silva', 'Suíte Luxo Casal 101', (datetime.utcnow() - timedelta(days=2)), (datetime.utcnow() + timedelta(days=1)), 3, 2, 1050.0, 'checked_in', 'pix', 'paid', 'whatsapp_ai', 1),
        ('book-02', 'guest-02', 'Mariana Alencar Costa', 'Suíte Master Hidro 201', (datetime.utcnow() - timedelta(days=1)), (datetime.utcnow() + timedelta(days=2)), 3, 2, 1440.0, 'checked_in', 'credit_card', 'paid', 'booking', 0),
        ('book-03', 'guest-03', 'Fernanda Lima Nogueira', 'Suíte Standard Casal 103', (datetime.utcnow() + timedelta(days=1)), (datetime.utcnow() + timedelta(days=3)), 2, 2, 700.0, 'confirmed', 'pix', 'paid', 'whatsapp_ai', 1),
        ('book-04', 'guest-04', 'Roberto Almeida Sobrinho', 'Suíte Família 105', (datetime.utcnow() - timedelta(days=5)), (datetime.utcnow() - timedelta(days=2)), 3, 4, 1200.0, 'checked_out', 'pix', 'paid', 'airbnb', 0),
        ('book-05', 'guest-07', 'Lucas Santos Machado', 'Chalé Jardim 106', (datetime.utcnow() + timedelta(days=5)), (datetime.utcnow() + timedelta(days=7)), 2, 2, 800.0, 'confirmed', 'pix', 'pending', 'direct', 0),
        ('book-06', 'guest-08', 'Patrícia Costa Ferreira', 'Suíte Vista Serra 203', (datetime.utcnow() - timedelta(days=7)), (datetime.utcnow() - timedelta(days=5)), 2, 2, 760.0, 'checked_out', 'credit_card', 'paid', 'booking', 0),
    ]
    
    for b in bookings_data:
        cursor.execute('''
            INSERT INTO bookings (id, tenantId, guestId, guestName, roomName, checkIn, checkOut, nights, guests, totalValue, status, paymentMethod, paymentStatus, source, aiGenerated, metadata, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            b[0], tenant_id, b[1], b[2], b[3],
            b[4].strftime('%Y-%m-%d') + 'T14:00:00.000Z',
            b[5].strftime('%Y-%m-%d') + 'T12:00:00.000Z',
            b[6], b[7], b[8], b[9], b[10], b[11], b[12], b[13], '{}', now_str, now_str
        ))
        
    # 7. Insert Conversations & Messages (WhatsApp Live Feed)
    print("💬 Inserting Conversation Logs and Messages...")
    # Juliana Mendes conversation (hot)
    cursor.execute('''
        INSERT INTO conversation_logs (id, tenantId, guestId, guestName, guestPhone, status, lastUpdate, aiConfidence, metadata, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('conv-juliana', tenant_id, 'guest-06', 'Juliana Mendes Rezende', '5519944443333', 'active', (datetime.utcnow() - timedelta(minutes=5)).isoformat() + 'Z', 92.5, '{}', now_str, now_str))
    
    juliana_messages = [
        ('m-ju-1', 'guest', 'Oi, qual o valor da diária para o feriado de 9 de julho?', 20),
        ('m-ju-2', 'ai', 'Olá Juliana! Para o feriado de 9 de Julho, temos tarifas especiais. A nossa suíte Vista Serra sai por R$ 420 por diária, e o Bangalô Premium por R$ 600. Você prefere uma opção com hidromassagem ou vista panorâmica?', 18),
        ('m-ju-3', 'guest', 'A com hidro parece ótima. O café da manhã está incluso?', 15),
        ('m-ju-4', 'ai', 'Sim, Juliana! Um café da manhã colonial completo com produtos artesanais de Tiradentes está incluso em todas as diárias. Gostaria de reservar essa suíte?', 12),
        ('m-ju-5', 'guest', 'Acho que sim! Mas me tira uma dúvida: vocês têm piscina aquecida?', 5)
    ]
    for m_id, sender, content, mins_ago in juliana_messages:
        ts = (datetime.utcnow() - timedelta(minutes=mins_ago)).isoformat() + 'Z'
        cursor.execute('''
            INSERT INTO conversation_messages (id, conversationId, [from], content, timestamp, [read], metadata, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (m_id, 'conv-juliana', sender, content, ts, 0, '{}', ts))

    # José Silveira conversation (warm)
    cursor.execute('''
        INSERT INTO conversation_logs (id, tenantId, guestId, guestName, guestPhone, status, lastUpdate, aiConfidence, metadata, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('conv-jose', tenant_id, 'guest-05', 'José Silveira Ramos', '5551955554444', 'active', (datetime.utcnow() - timedelta(minutes=15)).isoformat() + 'Z', 95.0, '{}', now_str, now_str))
    
    jose_messages = [
        ('m-jo-1', 'guest', 'Olá! Gostaria de saber se vocês aceitam pets na pousada?', 35),
        ('m-jo-2', 'ai', 'Olá José! Sim, nós somos pet friendly na Pousada Serenity. Aceitamos cães de pequeno e médio porte mediante taxa de R$ 50 por diária. O seu pet é de qual porte?', 32),
        ('m-jo-3', 'guest', 'Legal! É um Golden Retriever médio de 22kg.', 25),
        ('m-jo-4', 'ai', 'Perfeito, José! Um Golden de 22kg é super bem-vindo. Nós pedimos apenas que ele use guia nas áreas comuns e que você traga a caminha e os utensílios dele. Gostaria de verificar disponibilidade para quais datas?', 22),
        ('m-jo-5', 'guest', 'Estou planejando ir de 10 a 12 de julho. Vocês têm suíte livre?', 15)
    ]
    for m_id, sender, content, mins_ago in jose_messages:
        ts = (datetime.utcnow() - timedelta(minutes=mins_ago)).isoformat() + 'Z'
        cursor.execute('''
            INSERT INTO conversation_messages (id, conversationId, [from], content, timestamp, [read], metadata, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (m_id, 'conv-jose', sender, content, ts, 0, '{}', ts))

    # Carlos Eduardo (staying, active housekeeping query)
    cursor.execute('''
        INSERT INTO conversation_logs (id, tenantId, guestId, guestName, guestPhone, status, lastUpdate, aiConfidence, metadata, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', ('conv-carlos', tenant_id, 'guest-01', 'Carlos Eduardo Silva', '5511987654321', 'active', (datetime.utcnow() - timedelta(hours=1)).isoformat() + 'Z', 98.0, '{}', now_str, now_str))
    
    carlos_messages = [
        ('m-ca-1', 'guest', 'Oi, por favor, vocês poderiam mandar mais duas toalhas de banho para a suíte 101?', 70),
        ('m-ca-2', 'ai', 'Olá Sr. Carlos! Claro, já solicitei à nossa equipe de camareiras para levar mais duas toalhas de banho para a suíte 101 imediatamente. Mais alguma coisa que possamos ajudar?', 68),
        ('m-ca-3', 'guest', 'Só isso, obrigado!', 65),
        ('m-ca-4', 'ai', 'Por nada! Tenha uma excelente estadia.', 63)
    ]
    for m_id, sender, content, mins_ago in carlos_messages:
        ts = (datetime.utcnow() - timedelta(minutes=mins_ago)).isoformat() + 'Z'
        cursor.execute('''
            INSERT INTO conversation_messages (id, conversationId, [from], content, timestamp, [read], metadata, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (m_id, 'conv-carlos', sender, content, ts, 1, '{}', ts))

    # 8. Insert Knowledge Entries
    print("📚 Inserting Knowledge Entries...")
    knowledge_data = [
        ('k-01', 'location', 'Qual a localização da pousada?', 'A Pousada Serenity está localizada na Rua Direita, 124, no coração do Centro Histórico de Tiradentes, MG. Ficamos a poucos passos da Igreja Matriz de Santo Antônio e da praça principal, cercados pelos melhores restaurantes e ateliers da cidade.'),
        ('k-02', 'policies', 'Qual o horário de check-in e check-out?', 'O nosso horário de check-in inicia-se às 14:00 e o check-out deve ser efetuado até as 12:00. O check-out tardio (late check-out) está sujeito a disponibilidade e taxas adicionais, consulte nossa recepção.'),
        ('k-03', 'amenities', 'Tem piscina na pousada?', 'Sim! Temos uma bela piscina climatizada localizada no nosso pátio interno com deck de madeira e espreguiçadeiras, perfeita para relaxar após um passeio pelas ladeiras históricas de Tiradentes. O funcionamento é das 09:00 às 21:00.'),
        ('k-04', 'cafe_manha', 'Como funciona o café da manhã?', 'O nosso café da manhã colonial completo está incluso em todas as diárias. Ele é servido diariamente no salão principal das 08:00 às 10:30, contando com pães caseiros, bolos típicos mineiros, frutas frescas, sucos naturais e o tradicional pão de queijo quentinho.'),
        ('k-05', 'estacionamento', 'A pousada oferece estacionamento?', 'Sim! Oferecemos estacionamento interno, privativo e totalmente gratuito para os nossos hóspedes. Ele fica localizado nos fundos da pousada e não necessita de reserva prévia.'),
        ('k-06', 'pet_friendly', 'Vocês aceitam animais de estimação (pets)?', 'Sim! Somos pet friendly e adoramos receber animais de estimação. Aceitamos cães de pequeno e médio porte (até 25kg) mediante taxa única de R$ 50 por diária por pet. Solicitamos o uso de guia nas áreas comuns e que tragam os pertences do pet.'),
        ('k-07', 'voltagem', 'Qual a voltagem das tomadas na pousada?', 'A voltagem das tomadas na pousada (e em toda a cidade de Tiradentes) é de 127V (110V). Dispomos de transformadores de voltagem para 220V na recepção caso seja necessário para seus aparelhos.'),
        ('k-08', 'internet', 'Qual a senha do Wi-Fi?', 'Oferecemos internet Wi-Fi de alta velocidade gratuita em toda a pousada. A rede para hóspedes é "Serenity_Guest" e a senha de acesso é "serenity2026".')
    ]
    for k_id, cat, q, a in knowledge_data:
        cursor.execute('''
            INSERT INTO knowledge_entries (id, tenantId, category, question, answer, priority, [usage], effectiveness, createdFor, lastUsed, metadata, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (k_id, tenant_id, cat, q, a, 'medium', 12, 95.0, 'both', None, '{}', now_str, now_str))

    # 9. Insert Training Prompts
    print("🤖 Inserting Training Prompts...")
    prompts_data = [
        ('p-persona', 'Persona Principal', 'persona', 'Você é o ZÉLLA, o assistente inteligente da Pousada Serenity em Tiradentes-MG. Seu tom é caloroso, acolhedor e educado (estilo mineiro de receber bem). Use expressões gentis, responda com clareza e sempre convide o hóspede a viver uma experiência inesquecível de repouso e lazer. Chame-os pelo nome se disponível.'),
        ('p-pricing', 'Negociação Tarifária', 'response', 'Ao fornecer tarifas, apresente as opções de suítes de forma atraente, destacando os diferenciais de cada uma (ex: hidromassagem, vista da serra). Ofereça o PIX como método prioritário e explique que o café da manhã colonial e o estacionamento interno já estão inclusos.'),
        ('p-escalation', 'Transição para Humanos', 'escalation', 'Se o hóspede solicitar falar com a gerência, demonstrar irritação, pedir descontos fora da tabela ou tiver dúvidas muito específicas que não estejam na base, responda com empatia dizendo que passará para a equipe humana. Coloque o log em status "escalated" e encerre o turno de atendimento da IA educadamente.')
    ]
    for p_id, p_name, p_type, p_content in prompts_data:
        cursor.execute('''
            INSERT INTO training_prompts (id, tenantId, name, type, content, variables, isActive, successRate, usageCount, lastUsed, metadata, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (p_id, tenant_id, p_name, p_type, p_content, '[]', 1, 93.4, 256, now_str, '{}', now_str, now_str))

    # 10. Insert Notifications
    print("🔔 Inserting Notifications...")
    notifications_data = [
        ('not-01', 'booking', 'high', 'Nova Reserva Confirmada', 'Fernanda Lima Nogueira confirmou a reserva de 2 diárias na Suíte Standard 103 via WhatsApp Zélla.', 'confirmed', 0),
        ('not-02', 'escalation', 'urgent', 'IA Necessita de Suporte Humano', 'José Silveira Ramos solicitou detalhes sobre pacote de lua de mel que requer cotação personalizada.', 'escalated', 0),
        ('not-03', 'payment', 'medium', 'Pagamento Recebido via PIX', 'Recebido R$ 1.050,00 ref. reserva de Carlos Eduardo Silva (Suíte 101).', 'paid', 1)
    ]
    for n_id, n_type, prio, title, msg, meta_status, is_read in notifications_data:
        cursor.execute('''
            INSERT INTO notifications (id, tenantId, type, priority, title, message, actionUrl, actionLabel, [read], metadata, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (n_id, tenant_id, n_type, prio, title, msg, '/dashboard/conversations', 'Ver Conversa', is_read, json.dumps({'status': meta_status}), now_str))

    # 11. Insert Performance Snapshots for the last 7 days
    print("📈 Inserting 7 Days of Performance Snapshots...")
    # Generate for the past 7 days
    for i in range(7):
        date_d = (datetime.utcnow() - timedelta(days=i)).strftime('%Y-%m-%d')
        snap_id = f'snap-{date_d}'
        
        # Add some variation
        revenue = 1800.0 - (i * 200.0) if i % 2 == 0 else 2400.0 + (i * 100.0)
        if i == 0: revenue = 1450.0  # Today
        bookings_count = int(revenue / 350.0)
        conv_rate = 32.5 + (i * 0.5) if i % 2 == 0 else 34.0 - (i * 0.4)
        satisfaction = 4.8 + (0.02 * i) if i < 5 else 4.7
        occupancy = 75.0 + (i * 2.0) if i % 3 == 0 else 83.0 - (i * 1.5)
        
        cursor.execute('''
            INSERT INTO performance_snapshots (id, tenantId, date, aiResponseTime, conversionRate, guestSatisfaction, occupancyRate, revenueGrowth, aiAutonomy, totalRevenue, totalBookings, aiConversations, metadata, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            snap_id, tenant_id, date_d,
            4.2, # aiResponseTime (sec)
            conv_rate,
            satisfaction,
            occupancy,
            8.5, # revenueGrowth
            92.0, # aiAutonomy
            revenue,
            bookings_count,
            45 + i * 2,
            '{}',
            now_str,
            now_str
        ))
        
    # 12. Insert AI Activity Logs
    print("📝 Inserting AI Activity Logs...")
    logs_data = [
        ('act-01', 'message', 'Juliana Mendes', 'Suíte Vista Serra', 'Respondeu Juliana Mendes sobre tarifas de julho com 92% de precisão.', 'success', 2100),
        ('act-02', 'booking', 'Fernanda Lima', 'Suíte Standard 103', 'Registrou pré-reserva de Fernanda Lima na Suíte Standard 103 com sucesso.', 'success', 4500),
        ('act-03', 'escalation', 'José Silveira', None, 'Encaminhou conversa de José Silveira para atendimento humano (cotação de pacotes).', 'warning', 1800),
        ('act-04', 'message', 'Carlos Eduardo', 'Suíte 101', 'Respondeu solicitação de toalhas extras da Suíte 101 e notificou governança.', 'success', 1500)
    ]
    for act_id, act_type, g_name, r_name, msg, status, dur in logs_data:
        ts = (datetime.utcnow() - timedelta(minutes=10)).isoformat() + 'Z'
        cursor.execute('''
            INSERT INTO ai_activity_logs (id, tenantId, type, guestName, roomName, message, timestamp, status, duration, metadata, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (act_id, tenant_id, act_type, g_name, r_name, msg, ts, status, dur, '{}', ts))

    conn.commit()
    conn.close()
    print("🎉 Seeding complete successfully! Pousada Serenity is now ready in secretaria.db.")

if __name__ == '__main__':
    seed_ddc()
