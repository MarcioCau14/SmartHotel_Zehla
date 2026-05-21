import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'


const prisma = new PrismaClient()

async function main() {
  

  // Limpa dados novos (ZEHLA 10)
  await prisma.financeAlert.deleteMany().catch(() => {})
  await prisma.pousadaFinance.deleteMany().catch(() => {})
  await prisma.financeTransaction.deleteMany().catch(() => {})
  await prisma.mALProfile.deleteMany().catch(() => {})
  await prisma.cadasturRecord.deleteMany().catch(() => {})
  await prisma.referral.deleteMany().catch(() => {})
  await prisma.creditTransaction.deleteMany().catch(() => {})
  await prisma.creditAccount.deleteMany().catch(() => {})
  await prisma.transactionLog.deleteMany().catch(() => {})
  await prisma.serviceItem.deleteMany().catch(() => {})
  await prisma.connectProfile.deleteMany().catch(() => {})
  await prisma.crmDeal.deleteMany().catch(() => {})
  await prisma.crmContact.deleteMany().catch(() => {})
  await prisma.crmPipeline.deleteMany().catch(() => {})

  // Limpa dados antigos (opcional)
  await prisma.payment.deleteMany().catch(() => {})
  await prisma.reservation.deleteMany().catch(() => {})
  await prisma.message.deleteMany().catch(() => {})
  await prisma.agentLog.deleteMany().catch(() => {})
  await prisma.pricingRule.deleteMany().catch(() => {})
  await prisma.service.deleteMany().catch(() => {})
  await prisma.room.deleteMany().catch(() => {})
  await prisma.property.deleteMany().catch(() => {})
  await prisma.user.deleteMany().catch(() => {})

  // 1. ADMIN
  const adminPass = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@zehla.com.br',
      name: 'Administrador ZEHLA',
      password: adminPass,
      role: 'SUPER_ADMIN',
      phone: '48999999999',
      isActive: true
    }
  })
  

  // 2. CLIENTE
  const clientPass = await bcrypt.hash('pousada123', 10)
  const client = await prisma.user.create({
    data: {
      email: 'maria@pousadadosol.com.br',
      name: 'Maria Silva',
      password: clientPass,
      role: 'CLIENT',
      phone: '48988888888',
      cpf: '12345678901',
      isActive: true
    }
  })
  

  // 3. PROPRIEDADE
  const property = await prisma.property.create({
    data: {
      userId: client.id,
      name: 'Pousada do Sol',
      slug: 'pousada-do-sol-praia-do-rosa',
      description: 'Pousada acolhedora na Praia do Rosa com vista para o mar.',
      address: 'Rua das Ondas, 123',
      city: 'Imbituba',
      state: 'SC',
      zipCode: '88780-000',
      latitude: -28.1334,
      longitude: -48.6543,
      capacity: 8,
      status: 'ACTIVE',
      plan: 'LITE',
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isTrial: true,
      phone: '48988888888',
      whatsapp: '5548988888888',
      email: 'maria@pousadadosol.com.br',
      website: 'https://pousadadosol.com.br',
      pixKey: 'maria@pousadadosol.com.br',
      pixKeyType: 'EMAIL'
    }
  })
  

  // 4. QUARTOS
  const rooms = await prisma.room.createMany({
    data: [
      { propertyId: property.id, number: '101', name: 'Vista Mar', type: 'DELUXE', capacity: 2, basePrice: 280, description: 'Vista panorâmica para o mar', amenities: ['Wi-Fi','Ar','TV','Varanda'], status: 'AVAILABLE' },
      { propertyId: property.id, number: '102', name: 'Jardim', type: 'STANDARD', capacity: 2, basePrice: 180, description: 'Vista para o jardim', amenities: ['Wi-Fi','Ar','TV'], status: 'AVAILABLE' },
      { propertyId: property.id, number: '103', name: 'Suíte Familiar', type: 'SUITE', capacity: 4, basePrice: 380, description: '2 quartos, cozinha compacta', amenities: ['Wi-Fi','Ar','TV','Cozinha'], status: 'OCCUPIED' },
      { propertyId: property.id, number: '104', name: 'Standard', type: 'STANDARD', capacity: 2, basePrice: 150, description: 'Confortável e econômico', amenities: ['Wi-Fi','Ventilador','TV'], status: 'CLEANING' },
      { propertyId: property.id, number: '105', name: 'Master', type: 'MASTER', capacity: 2, basePrice: 350, description: 'Hidromassagem, vista mar', amenities: ['Wi-Fi','Ar','TV','Hidro'], status: 'AVAILABLE' },
      { propertyId: property.id, number: '106', name: 'Família', type: 'FAMILY', capacity: 3, basePrice: 220, description: 'Cama casal + beliche', amenities: ['Wi-Fi','Ar','TV','Beliche'], status: 'AVAILABLE' },
      { propertyId: property.id, number: '107', name: 'Econômico', type: 'STANDARD', capacity: 1, basePrice: 120, description: 'Individual', amenities: ['Wi-Fi','Ventilador','TV'], status: 'MAINTENANCE' },
      { propertyId: property.id, number: '108', name: 'Lua de Mel', type: 'SUITE', capacity: 2, basePrice: 420, description: 'Romântico, champagne', amenities: ['Wi-Fi','Ar','TV','Hidro','Champagne'], status: 'BLOCKED' }
    ]
  })
  

  // 5. SERVIÇOS
  await prisma.service.createMany({
    data: [
      { propertyId: property.id, name: 'Café da Manhã', description: 'Caseiro com frutas', price: 0, isIncluded: true, icon: 'coffee' },
      { propertyId: property.id, name: 'Estacionamento', description: 'Privativo gratuito', price: 0, isIncluded: true, icon: 'car' },
      { propertyId: property.id, name: 'Wi-Fi', description: 'Alta velocidade', price: 0, isIncluded: true, icon: 'wifi' },
      { propertyId: property.id, name: 'Piscina', description: 'Ao ar livre', price: 0, isIncluded: true, icon: 'waves' },
      { propertyId: property.id, name: 'Transfer', description: 'Do aeroporto', price: 250, isIncluded: false, icon: 'plane' },
      { propertyId: property.id, name: 'Surf', description: 'Aluguel prancha', price: 80, isIncluded: false, icon: 'surf' },
      { propertyId: property.id, name: 'Passeio Barco', description: 'Lagoa Ibiraquera', price: 150, isIncluded: false, icon: 'ship' },
      { propertyId: property.id, name: 'Massagem', description: 'Relaxante', price: 180, isIncluded: false, icon: 'heart' }
    ]
  })
  

  // 6. RESERVAS
  const today = new Date()
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7)

  const allRooms = await prisma.room.findMany({ where: { propertyId: property.id } })

  await prisma.reservation.createMany({
    data: [
      { propertyId: property.id, roomId: allRooms[2].id, code: 'ZEH-2026-001', guestName: 'João Pereira', guestEmail: 'joao@email.com', guestPhone: '48977777777', guestCpf: '98765432100', guestCount: 3, checkIn: today, checkOut: nextWeek, nights: 7, roomPrice: 380, totalAmount: 2660, paidAmount: 2660, status: 'CHECKED_IN', checkInStatus: 'DONE', source: 'WHATSAPP', notes: 'Família com criança' },
      { propertyId: property.id, roomId: allRooms[0].id, code: 'ZEH-2026-002', guestName: 'Ana Carolina', guestEmail: 'ana@email.com', guestPhone: '48966666666', guestCpf: '45678912300', guestCount: 2, checkIn: tomorrow, checkOut: new Date(tomorrow.getTime() + 3*86400000), nights: 3, roomPrice: 280, totalAmount: 840, paidAmount: 420, status: 'CONFIRMED', checkInStatus: 'PENDING', source: 'DIRECT', notes: 'Lua de mel' },
      { propertyId: property.id, roomId: allRooms[4].id, code: 'ZEH-2026-003', guestName: 'Roberto Lima', guestEmail: 'roberto@email.com', guestPhone: '48955555555', guestCpf: '78912345600', guestCount: 2, checkIn: nextWeek, checkOut: new Date(nextWeek.getTime() + 3*86400000), nights: 3, roomPrice: 350, totalAmount: 1050, paidAmount: 0, status: 'CONFIRMED', checkInStatus: 'PENDING', source: 'BOOKING', notes: 'Hóspede VIP' },
      { propertyId: property.id, roomId: allRooms[1].id, code: 'ZEH-2026-004', guestName: 'Fernanda Costa', guestEmail: 'fernanda@email.com', guestPhone: '48944444444', guestCpf: '32165498700', guestCount: 1, checkIn: new Date(today.getTime() - 2*86400000), checkOut: today, nights: 2, roomPrice: 180, totalAmount: 360, paidAmount: 360, status: 'CHECKED_OUT', checkInStatus: 'DONE', source: 'WHATSAPP', notes: 'Viajante solo' }
    ]
  })
  

  // 7. PAGAMENTOS
  const reservations = await prisma.reservation.findMany({ where: { propertyId: property.id } })
  for (const res of reservations) {
    await prisma.payment.create({
      data: {
        propertyId: property.id,
        reservationId: res.id,
        amount: res.totalAmount,
        method: 'PIX',
        status: res.status === 'CHECKED_OUT' ? 'PAID' : 'PENDING',
        pixCode: `00020126580014BR.GOV.BCB.PIX0136${property.pixKey}5204000053039865406${res.totalAmount.toFixed(2)}5802BR5913ZEHLA6009IMBITUBA62070503***6304${Date.now()}`,
        pixQrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PIX${res.code}`,
        pixExpiration: new Date(Date.now() + 24*60*60*1000),
        paidAt: res.status === 'CHECKED_OUT' ? new Date() : null
      }
    })
  }
  

  // 8. LOGS
  await prisma.agentLog.createMany({
    data: [
      { propertyId: property.id, agentName: 'RECEPTIONIST', action: 'RESPOND', intent: 'GREETING', confidence: 0.98, input: 'Olá!', output: 'Olá! Bem-vindo à Pousada do Sol! ☀️', tokensUsed: 45, cost: 0.002, duration: 120, status: 'SUCCESS' },
      { propertyId: property.id, agentName: 'RECEPTIONIST', action: 'RESPOND', intent: 'PRICE_INQUIRY', confidence: 0.94, input: 'Quanto custa?', output: 'A partir de R$ 150/noite! 🏖️', tokensUsed: 120, cost: 0.005, duration: 350, status: 'SUCCESS' },
      { propertyId: property.id, agentName: 'RESERVATIONS', action: 'CREATE', intent: 'RESERVATION_CREATE', confidence: 0.91, input: 'Quero reservar', output: 'Reserva criada! Código: ZEH-2026-002', tokensUsed: 180, cost: 0.008, duration: 580, status: 'SUCCESS' },
      { propertyId: property.id, agentName: 'CONCIERGE', action: 'RESPOND', intent: 'LOCAL_INFO', confidence: 0.96, input: 'O que fazer?', output: 'Surf, trilhas, stand-up paddle! 🏄♂️', tokensUsed: 210, cost: 0.009, duration: 420, status: 'SUCCESS' },
      { propertyId: property.id, agentName: 'FINANCIAL', action: 'CREATE_PAYMENT', intent: 'PAYMENT_STATUS', confidence: 0.99, input: 'Como pagar?', output: 'PIX enviado! 📲', tokensUsed: 95, cost: 0.004, duration: 280, status: 'SUCCESS' },
      { propertyId: property.id, agentName: 'HOUSEKEEPING', action: 'UPDATE_STATUS', intent: 'HOUSEKEEPING_REQUEST', confidence: 0.88, input: 'Preciso de toalhas', output: 'Equipe a caminho! 🧹', tokensUsed: 85, cost: 0.003, duration: 200, status: 'SUCCESS' },
      { propertyId: property.id, agentName: 'RECEPTIONIST', action: 'RESPOND', intent: 'UNKNOWN', confidence: 0.45, input: 'Tem onda boa?', output: 'Consulte Windguru! 🌊', tokensUsed: 150, cost: 0.006, duration: 380, status: 'FALLBACK' },
      { propertyId: property.id, agentName: 'GUARDIAN', action: 'CHECK_RATE_LIMIT', intent: 'SECURITY', confidence: 1.0, input: 'Rate limit', output: 'OK', tokensUsed: 0, cost: 0, duration: 5, status: 'SUCCESS' },
      { propertyId: property.id, agentName: 'LEARNER', action: 'ANALYZE', intent: 'LEARNING', confidence: 0.92, input: 'Análise', output: '78% perguntam sobre preços', tokensUsed: 320, cost: 0.015, duration: 890, status: 'SUCCESS' },
      { propertyId: property.id, agentName: 'RECEPTIONIST', action: 'RESPOND', intent: 'CANCELATION_POLICY', confidence: 0.93, input: 'Política?', output: 'Cancelamento >7 dias = integral ✅', tokensUsed: 175, cost: 0.007, duration: 410, status: 'SUCCESS' }
    ]
  })
  

  // 9. MENSAGENS
  await prisma.message.createMany({
    data: [
      { propertyId: property.id, phone: '48977777777', name: 'João Pereira', content: 'Olá, boa tarde! Quanto custa um quarto?', direction: 'INBOUND', type: 'TEXT', status: 'READ', agentHandled: 'RECEPTIONIST' },
      { propertyId: property.id, phone: '48977777777', name: 'João Pereira', content: 'A partir de R$ 150/noite! 🏖️', direction: 'OUTBOUND', type: 'TEXT', status: 'DELIVERED', agentHandled: 'RECEPTIONIST' },
      { propertyId: property.id, phone: '48966666666', name: 'Ana Carolina', content: 'Tem vaga para amanhã?', direction: 'INBOUND', type: 'TEXT', status: 'READ', agentHandled: 'RECEPTIONIST' },
      { propertyId: property.id, phone: '48966666666', name: 'Ana Carolina', content: 'Temos sim! Para quantas pessoas?', direction: 'OUTBOUND', type: 'TEXT', status: 'DELIVERED', agentHandled: 'RECEPTIONIST' },
      { propertyId: property.id, phone: '48955555555', name: 'Roberto Lima', content: 'O que tem pra fazer aqui?', direction: 'INBOUND', type: 'TEXT', status: 'READ', agentHandled: 'CONCIERGE' },
      { propertyId: property.id, phone: '48955555555', name: 'Roberto Lima', content: 'Surf, trilhas, paddle! 🏄♂️', direction: 'OUTBOUND', type: 'TEXT', status: 'DELIVERED', agentHandled: 'CONCIERGE' }
    ]
  })
  

  // 10. REGRAS DE PREÇO
  await prisma.pricingRule.createMany({
    data: [
      { propertyId: property.id, name: 'Alta Temporada', description: '+40% verão', startDate: new Date('2026-12-15'), endDate: new Date('2027-03-15'), multiplier: 1.4, isActive: true },
      { propertyId: property.id, name: 'Réveillon', description: '2x preço', startDate: new Date('2026-12-30'), endDate: new Date('2027-01-02'), multiplier: 2.0, isActive: true },
      { propertyId: property.id, name: 'Inverno', description: '-20%', startDate: new Date('2026-06-01'), endDate: new Date('2026-08-31'), multiplier: 0.8, isActive: true },
      { propertyId: property.id, name: 'Feriado', description: '+25%', startDate: new Date('2026-04-17'), endDate: new Date('2026-04-21'), multiplier: 1.25, isActive: true }
    ]
  })

  // ============================================================
  // ZEHLA 10 — NOVOS MODELS (T1.1-T1.2)
  // ============================================================

  // 11. TRANSACTION LOGS — Auditoria financeira (Gap S-06)
  await prisma.transactionLog.createMany({
    data: [
      { propertyId: property.id, type: 'reservation', amount: 2660, description: 'Reserva ZEH-2026-001 — João Pereira', referenceId: 'ZEH-2026-001', status: 'completed', balanceBefore: 0, balanceAfter: 2660 },
      { propertyId: property.id, type: 'reservation', amount: 840, description: 'Reserva ZEH-2026-002 — Ana Carolina', referenceId: 'ZEH-2026-002', status: 'completed', balanceBefore: 2660, balanceAfter: 3500 },
      { propertyId: property.id, type: 'reservation', amount: 1050, description: 'Reserva ZEH-2026-003 — Roberto Lima', referenceId: 'ZEH-2026-003', status: 'pending', balanceBefore: 3500, balanceAfter: 4550 },
      { propertyId: property.id, type: 'service', amount: 180, description: 'Massagem — Quarto 103', referenceId: 'ZEH-2026-001', status: 'completed', balanceBefore: 4550, balanceAfter: 4730 },
      { propertyId: property.id, type: 'refund', amount: -200, description: 'Reembolso parcial — Cancelamento', referenceId: 'ZEH-2026-004', status: 'completed', balanceBefore: 4730, balanceAfter: 4530 },
    ]
  })

  // 12. CREDIT ACCOUNT — Modelo de créditos (Gap QV-02)
  const creditAccount = await prisma.creditAccount.create({
    data: {
      propertyId: property.id,
      balance: 500,
      totalEarned: 500,
      totalSpent: 0,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    }
  })

  await prisma.creditTransaction.create({
    data: {
      accountId: creditAccount.id,
      type: 'earn',
      amount: 500,
      description: 'Bônus de boas-vindas — Plano LITE',
    }
  })

  // 13. REFERRAL — Programa Ambassador (Gap SH-08)
  await prisma.referral.createMany({
    data: [
      { referrerId: client.id, referredEmail: 'carlos@pousadamar.com.br', referredPhone: '48933333333', status: 'signed_up', rewardAmount: 50 },
      { referrerId: client.id, referredEmail: 'lucia@pousadacanto.com.br', referredPhone: '48922222222', status: 'trial_started', rewardAmount: 100 },
      { referrerId: client.id, referredEmail: 'pedro@pousadavista.com.br', referredPhone: '48911111111', status: 'pending', rewardAmount: 0 },
    ]
  })

  // 14. SERVICE ITEMS — Catálogo de serviços upsell (Gap IN-01)
  await prisma.serviceItem.createMany({
    data: [
      { propertyId: property.id, name: 'Vinho do Vale', category: 'upsell', price: 89, description: 'Garrafa de vinho tinto local' },
      { propertyId: property.id, name: 'Travesseiro Extra', category: 'amenity', price: 0, description: 'Travesseiro de plumas' },
      { propertyId: property.id, name: 'Late Checkout', category: 'service', price: 60, description: 'Checkout até 16h' },
      { propertyId: property.id, name: 'Café no Quarto', category: 'experience', price: 45, description: 'Café da manhã servido no quarto' },
      { propertyId: property.id, name: 'Kit Praia', category: 'amenity', price: 30, description: 'Cadeira + guarda-sol + cooler' },
      { propertyId: property.id, name: 'Passeio de Barco', category: 'experience', price: 150, description: 'Passeio pela Lagoa de Ibiraquera' },
    ]
  })

  // 15. MAL PROFILES — Malha de Aprendizado (Fase 2 prep)
  await prisma.mALProfile.createMany({
    data: [
      { propertyId: property.id, agentName: 'receptionist', trainingData: JSON.stringify({ greetings: 150, priceInquiries: 89, reservationRequests: 34 }), modelVersion: '1.0', accuracy: 0.92, isActive: true },
      { propertyId: property.id, agentName: 'concierge', trainingData: JSON.stringify({ localInfo: 200, recommendations: 67, weatherQueries: 45 }), modelVersion: '1.0', accuracy: 0.88, isActive: true },
      { propertyId: property.id, agentName: 'revenue', trainingData: JSON.stringify({ seasonalPatterns: 365, eventCorrelations: 12, competitorPrices: 50 }), modelVersion: '1.0', accuracy: 0.85, isActive: false },
    ]
  })

  // 16. CADASTUR RECORD — Monitoramento regulatório
  await prisma.cadasturRecord.create({
    data: {
      propertyId: property.id,
      cadasturNumber: '00.000.000.0000/0001-00',
      status: 'verified',
      validUntil: new Date('2027-12-31'),
      lastCheckedAt: new Date(),
    }
  })

  // 17. CRM PIPELINE + DEALS (dados de teste adicionais)
  const pipeline = await prisma.crmPipeline.create({
    data: {
      propertyId: property.id,
      name: 'Vendas Diretas',
      stages: JSON.stringify([
        { name: 'Prospecção', color: '#94A3B8' },
        { name: 'Qualificação', color: '#3B82F6' },
        { name: 'Proposta', color: '#F59E0B' },
        { name: 'Fechamento', color: '#25D366' },
        { name: 'Perdido', color: '#EF4444' },
      ]),
      isDefault: true,
    }
  })

  await prisma.crmContact.createMany({
    data: [
      { propertyId: property.id, name: 'Carlos Mendes', email: 'carlos@pousadamar.com.br', phone: '48933333333', whatsapp: '5548933333333', source: 'REFERRAL', tags: JSON.stringify(['indicacao', 'alta-temporada']) },
      { propertyId: property.id, name: 'Lúcia Ferreira', email: 'lucia@pousadacanto.com.br', phone: '48922222222', whatsapp: '5548922222222', source: 'INSTAGRAM', tags: JSON.stringify(['instagram', 'trial']) },
      { propertyId: property.id, name: 'Pedro Santos', email: 'pedro@pousadavista.com.br', phone: '48911111111', whatsapp: '5548911111111', source: 'GOOGLE', tags: JSON.stringify(['google', 'frio']) },
    ]
  })

  const contacts = await prisma.crmContact.findMany({ where: { propertyId: property.id } })

  await prisma.crmDeal.createMany({
    data: [
      { propertyId: property.id, pipelineId: pipeline.id, contactId: contacts[0].id, title: 'Upgrade para PRO — Pousada Mar', value: 448, stage: 'Proposta', probability: 60, expectedCloseDate: new Date(Date.now() + 14 * 86400000) },
      { propertyId: property.id, pipelineId: pipeline.id, contactId: contacts[1].id, title: 'Trial → PRO — Pousada Canto', value: 448, stage: 'Qualificação', probability: 40, expectedCloseDate: new Date(Date.now() + 7 * 86400000) },
      { propertyId: property.id, pipelineId: pipeline.id, contactId: contacts[2].id, title: 'Primeiro contato — Pousada Vista', value: 248, stage: 'Prospecção', probability: 15, expectedCloseDate: new Date(Date.now() + 30 * 86400000) },
    ]
  })

  // 18. CONNECT PROFILE — ZEHLA Connect (dados de teste)
  await prisma.connectProfile.create({
    data: {
      propertyId: property.id,
      slug: 'pousada-do-sol',
      bio: 'Pousada acolhedora na Praia do Rosa com vista para o mar ☀️🌊',
      whatsappNumber: '5548988888888',
      status: 'published',
      isVerified: true,
      seoTitle: 'Pousada do Sol — Praia do Rosa, SC',
      seoDescription: 'Pousada com vista mar, piscina e café da manhã caseiro. Reserve direto e economize!',
      totalViews: 347,
      totalClicks: 89,
      publishedAt: new Date(Date.now() - 30 * 86400000),
    }
  })

  // 19. LEADS ADICIONAIS (20 leads para teste de volume)
  const leadNames = [
    { name: 'Pousada das Flores', city: 'Florianópolis', state: 'SC', phone: '48900000001' },
    { name: 'Pousada Recanto do Mar', city: 'Bombinhas', state: 'SC', phone: '48900000002' },
    { name: 'Pousada Villa Rosa', city: 'Imbituba', state: 'SC', phone: '48900000003' },
    { name: 'Pousada Luar do Rosa', city: 'Imbituba', state: 'SC', phone: '48900000004' },
    { name: 'Pousada Brisa do Sul', city: 'Laguna', state: 'SC', phone: '48900000005' },
    { name: 'Pousada Estalagem', city: 'Garopaba', state: 'SC', phone: '48900000006' },
    { name: 'Pousada Canto da Ilha', city: 'Florianópolis', state: 'SC', phone: '48900000007' },
    { name: 'Pousada Mar e Sol', city: 'Balneário Camboriú', state: 'SC', phone: '48900000008' },
    { name: 'Pousada do Morro', city: 'São Francisco do Sul', state: 'SC', phone: '47900000001' },
    { name: 'Pousada Atlântica', city: 'Joinville', state: 'SC', phone: '47900000002' },
    { name: 'Pousada Sereia', city: 'Ubatuba', state: 'SP', phone: '12900000001' },
    { name: 'Pousada Tropical', city: 'Paraty', state: 'RJ', phone: '24900000001' },
    { name: 'Pousada Recanto', city: 'Gramado', state: 'RS', phone: '54900000001' },
    { name: 'Pousada Serra Verde', city: 'Campos do Jordão', state: 'SP', phone: '12900000002' },
    { name: 'Pousada Pedra Azul', city: 'Domingos Martins', state: 'ES', phone: '27900000001' },
    { name: 'Pousada Capim Dourado', city: 'Jalapão', state: 'TO', phone: '63900000001' },
    { name: 'Pousada Chapada', city: 'Lençóis', state: 'BA', phone: '75900000001' },
    { name: 'Pousada Dunas', city: 'Natal', state: 'RN', phone: '84900000001' },
    { name: 'Pousada Coqueiral', city: 'Porto de Galinhas', state: 'PE', phone: '81900000001' },
    { name: 'Pousada Mangue', city: 'Jericoacoara', state: 'CE', phone: '88900000001' },
  ]

  for (const l of leadNames) {
    await prisma.lead.create({
      data: {
        name: l.name,
        phone: l.phone,
        email: `${l.name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
        city: l.city,
        state: l.state,
        region: ['SC', 'RS', 'PR'].includes(l.state) ? 'Sul' : ['SP', 'RJ', 'ES'].includes(l.state) ? 'Sudeste' : ['BA', 'PE', 'CE', 'RN'].includes(l.state) ? 'Nordeste' : 'Norte',
        score: Math.floor(Math.random() * 100),
        status: ['PROSPECT', 'QUALIFIED', 'TRIAL_STARTED'][Math.floor(Math.random() * 3)] as any,
        source: 'SECRETARIA_AI',
        roomsCount: Math.floor(Math.random() * 20) + 5,
        instagramFollowers: Math.floor(Math.random() * 15000) + 500,
        googleReviewsCount: Math.floor(Math.random() * 200) + 10,
        otaDependenceLevel: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
        leadTier: ['COLD', 'WARM', 'HOT'][Math.floor(Math.random() * 3)],
      }
    })
  }

  // 20. FINANCE TRANSACTIONS (dados de teste)
  await prisma.financeTransaction.createMany({
    data: [
      { propertyId: property.id, type: 'INCOME', category: 'reserva', channel: 'direto', description: 'Reserva ZEH-2026-001', amount: 2660, status: 'confirmed', date: today },
      { propertyId: property.id, type: 'INCOME', category: 'reserva', channel: 'direto', description: 'Reserva ZEH-2026-002', amount: 420, status: 'confirmed', date: today },
      { propertyId: property.id, type: 'EXPENSE', category: 'limpeza', channel: null, description: 'Equipe de limpeza — Semana 20', amount: -800, status: 'confirmed', date: today },
      { propertyId: property.id, type: 'EXPENSE', category: 'manutencao', channel: null, description: 'Reparo ar condicionado — Quarto 107', amount: -350, status: 'confirmed', date: today },
      { propertyId: property.id, type: 'EXPENSE', category: 'marketing', channel: 'instagram', description: 'Ads Instagram — Maio', amount: -500, status: 'confirmed', date: today },
      { propertyId: property.id, type: 'INCOME', category: 'reserva', channel: 'booking', description: 'Reserva Booking.com — Roberto Lima', amount: 1050, status: 'pending', date: nextWeek },
    ]
  })

  // 21. POUSADA FINANCE (métricas diárias)
  await prisma.pousadaFinance.create({
    data: {
      propertyId: property.id,
      date: today,
      grossRevenue: 3080,
      netRevenue: 2464,
      channelBreakdown: JSON.stringify({ direto: 1840, booking: 1050, whatsapp: 190 }),
      totalRooms: 8,
      occupiedRooms: 3,
      occupancyRate: 37.5,
      adr: 270,
      revpar: 101.25,
      operatingCosts: JSON.stringify({ limpeza: 800, manutencao: 350, marketing: 500 }),
      totalCosts: 1650,
      aiInsight: 'Ocupação abaixo da média para esta época. Considere ativar promoção de última hora para o fim de semana.',
      healthScore: 72,
      alertLevel: 'yellow',
    }
  })

  // 22. FINANCE ALERTS
  await prisma.financeAlert.createMany({
    data: [
      { propertyId: property.id, type: 'low_occupancy', severity: 'WARNING', agentName: 'Maria', message: 'Ocupação em 37.5% — abaixo da meta de 60%. Sugestão: ativar promoção de última hora.', metric: JSON.stringify({ current: 37.5, target: 60 }), isRead: false },
      { propertyId: property.id, type: 'cost_spike', severity: 'INFO', agentName: 'Maria', message: 'Custos de manutenção subiram 15% esta semana. Verifique se há padrões recorrentes.', metric: JSON.stringify({ increase: 15, category: 'manutencao' }), isRead: true },
      { propertyId: property.id, type: 'auditory_mismatch', severity: 'CRITICAL', agentName: 'Maria', message: 'Divergência detectada: Booking.com reporta R$1.050 mas sistema registra R$945. Verificar comissão.', metric: JSON.stringify({ expected: 1050, actual: 945, diff: 105 }), isRead: false },
    ]
  })
  

  
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
