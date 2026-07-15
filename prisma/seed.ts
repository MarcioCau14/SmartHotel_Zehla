import { db } from '../src/lib/db'

async function main() {
  console.log('🌱 Seeding plans...')

  // Seed Plans
  const pro = await db.plan.upsert({
    where: { slug: 'pro' },
    update: {},
    create: {
      slug: 'pro',
      name: 'PRO',
      priceCents: 39700,
      maxProperties: 4,
      maxWhatsappNumbers: 1,
      hasAnalytics: false,
      hasApi: false,
      hasPrioritySupport: false,
      hasAbTesting: false,
      hasCustomWebhooks: false,
      hasWeeklyReports: false,
      description: 'Ideal para anfitriões com até 4 imóveis. Atendimento IA 24/7, raspagem automática e Magic Onboarding.',
    },
  })

  const max = await db.plan.upsert({
    where: { slug: 'max' },
    update: {},
    create: {
      slug: 'max',
      name: 'MAX',
      priceCents: 79700,
      maxProperties: 12,
      maxWhatsappNumbers: 3,
      hasAnalytics: true,
      hasApi: true,
      hasPrioritySupport: true,
      hasAbTesting: true,
      hasCustomWebhooks: true,
      hasWeeklyReports: true,
      description: 'Para anfitriões profissionais com até 12 imóveis. Analytics avançado, API, suporte prioritário e mais.',
    },
  })

  console.log(`✅ Plans seeded: ${pro.name} (R$${pro.priceCents / 100}), ${max.name} (R$${max.priceCents / 100})`)

  // Seed a demo tenant for development
  const existingDemo = await db.user.findUnique({ where: { email: 'demo@zella.com.br' } })
  if (!existingDemo) {
    const demoUser = await db.user.create({
      data: {
        email: 'demo@zella.com.br',
        name: 'Demo Host',
        tenant: {
          create: {
            name: 'Apartamentos Vista Mar',
            mode: 'airbnb',
            planSlug: 'max',
            onboardingComplete: true,
          },
        },
      },
      include: { tenant: true },
    })

    // Create a sample property for the demo tenant
    if (demoUser.tenant) {
      await db.airBProperty.create({
        data: {
          tenantId: demoUser.tenant.id,
          airbnbId: '18584298',
          listingUrl: 'https://www.airbnb.com/rooms/18584298',
          name: 'Oceanfront Black Otter Cove w/hot tub',
          description: 'Stunning oceanfront property with panoramic views, private hot tub, and direct beach access. Perfect for families and groups looking for an unforgettable coastal getaway.',
          propertyType: 'entire_home',
          accommodates: 8,
          bedrooms: 4,
          beds: 5,
          bathrooms: 3,
          neighborhood: 'Lagoa da Conceição',
          city: 'Florianópolis',
          state: 'SC',
          country: 'Brasil',
          rating: 4.95,
          reviewCount: 237,
          basePrice: 450,
          currency: 'BRL',
          amenities: JSON.stringify(['WiFi', 'Air Conditioning', 'Pool', 'Hot Tub', 'Kitchen', 'Free Parking', 'Washer', 'Dryer', 'TV', 'BBQ Grill']),
          photoCount: 45,
          houseRules: 'No smoking, No parties/events, Check-in after 15:00, Check-out before 11:00',
          checkInTime: '15:00',
          checkOutTime: '11:00',
          hostName: 'Carlos',
          hostIsSuperhost: true,
          hostResponseRate: 99,
          hostResponseTime: 'within an hour',
          aiSummary: 'Propriedade à beira-mar com vista panorâmica, hidro privativa e acesso direto à praia. Ideal para famílias e grupos.',
          highlights: JSON.stringify(['Vista mar panorâmica', 'Hidro privativa', 'Acesso direto à praia', 'Piscina', 'Churrasqueira']),
          targetAudience: JSON.stringify(['famílias', 'grupos', 'casais']),
          sellingPoints: JSON.stringify(['Superhost com 237 reviews 4.95', 'Vista mar espetacular', 'Hidro aquecida', 'Localização privilegiada']),
          localTipsFromReviews: JSON.stringify(['Padaria do Zé a 2 quadras', 'Restaurante Mar e Cia na esquina', 'Trilha do Morro das Aranhas perto']),
          reviewSentiment: 'excellent',
          keywords: JSON.stringify(['praia', 'vista mar', 'hidro', 'piscina', 'família', 'Florianópolis']),
          wifiName: 'VistaMar_5G',
          wifiPassword: 'bemvindo2026',
          lockboxCode: '4829',
          lockboxLocation: 'Portão azul à direita da entrada',
          accessInstructions: 'O lockbox fica no portão azul. Digite o código e puxe para baixo. A chave está dentro.',
          emergencyContact: '(48) 99999-0000 - Carlos (proprietário)',
          parkingSpot: 'Vaga 12 no subsolo',
          personalLocalTips: 'Não perca o pôr do sol no mirante da Lagoa! A trilha começa na Rua das Bromélias.',
          favoriteRestaurants: 'Mar e Cia, Bar do Arante, Restaurante Ostradamus',
          supermarketLocation: 'Supermercado Bistek na Via Catarina, 5 min de carro',
          additionalRules: 'Por favor não fume na varanda. Feche as janelas quando sair se estiver chovendo.',
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          scrapingStatus: 'complete',
          lastScrapedAt: new Date(),
        },
      })

      // Create a sample conversation
      const property = await db.airBProperty.findFirst({ where: { tenantId: demoUser.tenant!.id } })
      if (property) {
        const conversation = await db.conversation.create({
          data: {
            tenantId: demoUser.tenant!.id,
            propertyId: property.id,
            guestPhone: '+5548998887776',
            guestName: 'Maria Silva',
            conversationMode: 'post_booking',
            status: 'active',
            messages: {
              create: [
                {
                  direction: 'inbound',
                  content: 'Olá! Estou chegando amanhã, como faço para entrar?',
                  intent: 'SELF_CHECK_IN',
                  isAiGenerated: false,
                },
                {
                  direction: 'outbound',
                  content: 'Olá Maria! Bem-vinda ao Oceanfront Black Otter Cove! 🏠\n\nAqui estão as informações de acesso:\n\n🔑 Lockbox: Portão azul à direita da entrada, código 4829\n📍 Endereço: Lagoa da Conceição, Florianópolis\n⏰ Check-in: a partir das 15:00\n📶 WiFi: VistaMar_5G / Senha: bemvindo2026\n🅿️ Sua vaga: Vaga 12 no subsolo\n\nPrecisa de mais alguma coisa?',
                  intent: 'SELF_CHECK_IN',
                  isAiGenerated: true,
                  tokensUsed: 145,
                  costCents: 4,
                },
                {
                  direction: 'inbound',
                  content: 'Qual a senha do WiFi?',
                  intent: 'WIFI_INFO',
                  isAiGenerated: false,
                },
                {
                  direction: 'outbound',
                  content: '📶 WiFi: VistaMar_5G\n🔑 Senha: bemvindo2026\n\nSe tiver dificuldade para conectar, me avise!',
                  intent: 'WIFI_INFO',
                  isAiGenerated: true,
                  tokensUsed: 38,
                  costCents: 4,
                },
              ],
            },
          },
        })

        // Create a second conversation (pre-booking)
        await db.conversation.create({
          data: {
            tenantId: demoUser.tenant!.id,
            propertyId: property.id,
            guestPhone: '+5511997654321',
            guestName: 'João Pereira',
            conversationMode: 'pre_booking',
            status: 'active',
            messages: {
              create: [
                {
                  direction: 'inbound',
                  content: 'Vi seu anúncio no Airbnb, me conta mais sobre o imóvel!',
                  intent: 'PROPERTY_INQUIRY',
                  isAiGenerated: false,
                },
                {
                  direction: 'outbound',
                  content: 'Olá João! Que bom que se interessou! 🏖️\n\nO Oceanfront Black Otter Cove é uma propriedade à beira-mar com:\n\n🌊 Vista panorâmica do oceano\n🔥 Hidro privativa aquecida\n🏖️ Acesso direto à praia\n🏊 Piscina e churrasqueira\n👨‍👩‍👧‍👦 Capacidade para 8 hóspedes em 4 quartos\n⭐ 4.95 de avaliação (237 reviews)\n\nLocalizado na Lagoa da Conceição, Florianópolis — uma das áreas mais privilegiadas da ilha!\n\nDeseja saber sobre disponibilidade ou preços?',
                  intent: 'PROPERTY_INQUIRY',
                  isAiGenerated: true,
                  tokensUsed: 210,
                  costCents: 4,
                },
              ],
            },
          },
        })
      }
    }

    console.log('✅ Demo user + property + conversations seeded')
  }

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
