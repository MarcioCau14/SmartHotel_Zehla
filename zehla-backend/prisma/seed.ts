import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...\n')

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
  console.log('✅ Admin:', admin.email)

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
  console.log('✅ Cliente:', client.email)

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
  console.log('✅ Propriedade:', property.name)

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
  console.log('✅ Quartos:', 8)

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
  console.log('✅ Serviços:', 8)

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
  console.log('✅ Reservas:', 4)

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
  console.log('✅ Pagamentos:', 4)

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
  console.log('✅ Logs:', 10)

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
  console.log('✅ Mensagens:', 6)

  // 10. REGRAS DE PREÇO
  await prisma.pricingRule.createMany({
    data: [
      { propertyId: property.id, name: 'Alta Temporada', description: '+40% verão', startDate: new Date('2026-12-15'), endDate: new Date('2027-03-15'), multiplier: 1.4, isActive: true },
      { propertyId: property.id, name: 'Réveillon', description: '2x preço', startDate: new Date('2026-12-30'), endDate: new Date('2027-01-02'), multiplier: 2.0, isActive: true },
      { propertyId: property.id, name: 'Inverno', description: '-20%', startDate: new Date('2026-06-01'), endDate: new Date('2026-08-31'), multiplier: 0.8, isActive: true },
      { propertyId: property.id, name: 'Feriado', description: '+25%', startDate: new Date('2026-04-17'), endDate: new Date('2026-04-21'), multiplier: 1.25, isActive: true }
    ]
  })
  console.log('✅ Regras de preço:', 4)

  console.log('\n🎉 SEED CONCLUÍDO!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
