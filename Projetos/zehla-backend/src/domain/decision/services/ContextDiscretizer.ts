/**
 * ZEHLA SMARTHOTEL — ContextDiscretizer Domain Service
 * Módulo: src/domain/decision/services/ContextDiscretizer.ts
 */

import { Result } from '../../shared/Result';
import { RoutingContext } from '../models/RoutingContext';

export interface IBucketDefinition {
  readonly id: string; // "00" - "31"
  readonly name: string;
  readonly category: 'FAQ' | 'Pricing' | 'Booking' | 'Complaint' | 'Semantic' | 'Content' | 'Review' | 'I18N' | 'Emergency' | 'CRM';
  readonly minQuality: number;
  readonly slaMs: number;
  readonly fastPatterns: ReadonlyArray<RegExp>;
  readonly keywords: ReadonlyArray<string>;
}

export const BUCKETS: ReadonlyArray<IBucketDefinition> = [
  {
    id: '00',
    name: 'faq_hours_operating',
    category: 'FAQ',
    minQuality: 0.5,
    slaMs: 500,
    fastPatterns: [/horario.*funcionamento/i, /check.*in.*out/i, /aberto/i, /fecha/i],
    keywords: ['horario', 'funcionamento', 'checkin', 'checkout', 'aberto', 'fechado', 'horas', 'recepcao', 'funcionando'],
  },
  {
    id: '01',
    name: 'faq_location_access',
    category: 'FAQ',
    minQuality: 0.5,
    slaMs: 500,
    fastPatterns: [/como\s+(chegar|ir)/i, /endereco/i, /localizacao/i, /estacionamento/i, /mapa/i],
    keywords: ['como', 'chegar', 'endereco', 'localizacao', 'estacionamento', 'vaga', 'mapa', 'fica', 'onde', 'pousada'],
  },
  {
    id: '02',
    name: 'faq_amenities_services',
    category: 'FAQ',
    minQuality: 0.5,
    slaMs: 500,
    fastPatterns: [/piscina/i, /wi-fi|wifi/i, /cafe.*manha/i, /pet/i, /servico/i],
    keywords: ['piscina', 'wifi', 'internet', 'cafe', 'manha', 'pet', 'animais', 'servico', 'quarto', 'academia', 'ar-condicionado'],
  },
  {
    id: '03',
    name: 'faq_policies_rules',
    category: 'FAQ',
    minQuality: 0.6,
    slaMs: 500,
    fastPatterns: [/politica/i, /regra/i, /cancelar/i, /crianca/i, /multa/i],
    keywords: ['politica', 'regras', 'cancelamento', 'criancas', 'leito', 'extra', 'fumar', 'proibido', 'multa'],
  },
  {
    id: '04',
    name: 'faq_general_misc',
    category: 'FAQ',
    minQuality: 0.5,
    slaMs: 800,
    fastPatterns: [/ola|oi|bom\s+dia|boa\s+tarde|boa\s+noite/i, /tudo\s+bem/i],
    keywords: ['ola', 'oi', 'bom', 'dia', 'tarde', 'noite', 'tudo', 'bem', 'ajuda', 'suporte', 'informacao'],
  },
  {
    id: '05',
    name: 'pricing_simple_query',
    category: 'Pricing',
    minQuality: 0.7,
    slaMs: 1500,
    fastPatterns: [/quanto\s+(custa|e|custa\s+a)/i, /valor/i, /preco/i, /tarifa/i],
    keywords: ['quanto', 'custa', 'valor', 'preco', 'tarifa', 'diaria', 'orcamento', 'quanto fica', 'cotacao'],
  },
  {
    id: '06',
    name: 'pricing_comparison',
    category: 'Pricing',
    minQuality: 0.75,
    slaMs: 2000,
    fastPatterns: [/diferenca/i, /comparar/i, /melhor/i, /quarto.*ou/i],
    keywords: ['diferenca', 'comparacao', 'comparar', 'melhor', 'quarto', 'suite', 'standard', 'luxo', 'versus', 'vs'],
  },
  {
    id: '07',
    name: 'pricing_seasonal_promo',
    category: 'Pricing',
    minQuality: 0.7,
    slaMs: 2000,
    fastPatterns: [/promocao/i, /pacote/i, /desconto/i, /feriado/i, /natal|ano\s+novo|reveillon/i],
    keywords: ['promocao', 'pacote', 'desconto', 'feriado', 'temporada', 'carnaval', 'natal', 'reveillon', 'fim de semana'],
  },
  {
    id: '08',
    name: 'pricing_negotiation',
    category: 'Pricing',
    minQuality: 0.85,
    slaMs: 3000,
    fastPatterns: [/fazer\s+um\s+preco/i, /negociar/i, /desconto.*longa/i, /mais\s+barato/i],
    keywords: ['negociar', 'desconto', 'longa', 'estadia', 'mais barato', 'reduzir', 'preco especial', 'fechar agora'],
  },
  {
    id: '09',
    name: 'booking_new_request',
    category: 'Booking',
    minQuality: 0.8,
    slaMs: 2000,
    fastPatterns: [/quero\s+reservar/i, /fazer\s+reserva/i, /reservar\s+quarto/i, /disponibilidade/i],
    keywords: ['reservar', 'reserva', 'quarto', 'disponibilidade', 'vagas', 'datas', 'hospedar', 'agendar', 'checkin', 'checkout'],
  },
  {
    id: '10',
    name: 'booking_modification',
    category: 'Booking',
    minQuality: 0.8,
    slaMs: 2000,
    fastPatterns: [/alterar\s+data/i, /mudar/i, /modificar/i, /remarcar/i],
    keywords: ['alterar', 'mudar', 'modificar', 'remarcar', 'datas', 'quarto', 'hospedes', 'trocar', 'ajustar'],
  },
  {
    id: '11',
    name: 'booking_cancellation',
    category: 'Booking',
    minQuality: 0.8,
    slaMs: 1500,
    fastPatterns: [/cancelar/i, /cancele/i, /desistir/i, /estorno/i],
    keywords: ['cancelar', 'cancellation', 'cancele', 'desistir', 'estorno', 'devolver', 'dinheiro', 'reembolso'],
  },
  {
    id: '12',
    name: 'booking_checkin_confirm',
    category: 'Booking',
    minQuality: 0.6,
    slaMs: 500,
    fastPatterns: [/instrucoes.*check.*in/i, /confirmacao/i, /confirmar/i, /codigo/i],
    keywords: ['instrucoes', 'confirmacao', 'confirmar', 'codigo', 'chave', 'portao', 'senha', 'voucher'],
  },
  {
    id: '13',
    name: 'complaint_cleanliness',
    category: 'Complaint',
    minQuality: 0.85,
    slaMs: 3000,
    fastPatterns: [/sujo/i, /sujeira/i, /limpar/i, /cabelo/i, /cheiro/i],
    keywords: ['sujo', 'sujeira', 'limpeza', 'cabelo', 'cheiro', 'toalha', 'lixo', 'banheiro', 'cama', 'mancha'],
  },
  {
    id: '14',
    name: 'complaint_noise',
    category: 'Complaint',
    minQuality: 0.85,
    slaMs: 3000,
    fastPatterns: [/barulho/i, /ruido/i, /vizinho/i, /som/i, /gritando/i],
    keywords: ['barulho', 'ruido', 'vizinho', 'som', 'musica', 'gritando', 'parede', 'festa', 'gritos'],
  },
  {
    id: '15',
    name: 'complaint_service_staff',
    category: 'Complaint',
    minQuality: 0.85,
    slaMs: 3000,
    fastPatterns: [/mal\s+atendido/i, /atendimento/i, /demora/i, /grosso/i, /rude/i],
    keywords: ['atendimento', 'demora', 'grosso', 'rude', 'mal atendido', 'atendente', 'recepcionista', 'descaso', 'demorou'],
  },
  {
    id: '16',
    name: 'complaint_maintenance',
    category: 'Complaint',
    minQuality: 0.85,
    slaMs: 3000,
    fastPatterns: [/quebrado/i, /nao\s+funciona/i, /ar\s+condicionado/i, /chuveiro/i, /vazamento/i],
    keywords: ['quebrado', 'nao funciona', 'ar condicionado', 'chuveiro', 'quente', 'vazamento', 'lampada', 'entupido', 'tv'],
  },
  {
    id: '17',
    name: 'complaint_food_beverage',
    category: 'Complaint',
    minQuality: 0.85,
    slaMs: 3000,
    fastPatterns: [/estragado/i, /comida/i, /fria/i, /ruim/i, /cabelo/i],
    keywords: ['comida', 'ruim', 'fria', 'estragada', 'cafe', 'manha', 'sabor', 'atrasado', 'cru', 'queimado'],
  },
  {
    id: '18',
    name: 'complaint_billing_charge',
    category: 'Complaint',
    minQuality: 0.85,
    slaMs: 5000,
    fastPatterns: [/cobranca/i, /indevida/i, /cartao/i, /duplicado/i, /errado/i],
    keywords: ['cobranca', 'indevida', 'errado', 'cartao', 'duplicado', 'taxa', 'nota', 'fiscal', 'valor', 'reembolso'],
  },
  {
    id: '19',
    name: 'sentiment_negative_deep',
    category: 'Semantic',
    minQuality: 0.85,
    slaMs: 5000,
    fastPatterns: [/horrivel/i, /pessimo/i, /nunca\s+mais/i, /odiei/i, /processar/i],
    keywords: ['horrivel', 'pessimo', 'nunca mais', 'odiei', 'processar', 'procon', 'decepcionado', 'estragou', 'viagem'],
  },
  {
    id: '20',
    name: 'semantic_comparison',
    category: 'Semantic',
    minQuality: 0.85,
    slaMs: 5000,
    fastPatterns: [/analise/i, /trade-off/i, /pros\s+e\s+contras/i, /recomenda/i],
    keywords: ['analise', 'trade-off', 'pros', 'contras', 'recomenda', 'comparativo', 'custo-beneficio', 'vantagem'],
  },
  {
    id: '21',
    name: 'semantic_recommendation',
    category: 'Semantic',
    minQuality: 0.75,
    slaMs: 3000,
    fastPatterns: [/sugere/i, /recomenda/i, /indica/i, /qual\s+a\s+melhor\s+opcao/i],
    keywords: ['sugere', 'recomenda', 'indica', 'melhor opcao', 'perfil', 'casal', 'familia', 'dica'],
  },
  {
    id: '22',
    name: 'content_social_media',
    category: 'Content',
    minQuality: 0.7,
    slaMs: 8000,
    fastPatterns: [/instagram/i, /post/i, /story/i, /tiktok/i, /legenda/i],
    keywords: ['instagram', 'post', 'story', 'tiktok', 'legenda', 'redes', 'sociais', 'engajamento', 'hastags'],
  },
  {
    id: '23',
    name: 'content_email_marketing',
    category: 'Content',
    minQuality: 0.7,
    slaMs: 8000,
    fastPatterns: [/e-mail/i, /newsletter/i, /assunto/i, /campanha/i],
    keywords: ['email', 'newsletter', 'assunto', 'campanha', 'promocional', 'leads', 'clique', 'oferta'],
  },
  {
    id: '24',
    name: 'content_listing_desc',
    category: 'Content',
    minQuality: 0.7,
    slaMs: 8000,
    fastPatterns: [/listing/i, /booking\.com/i, /airbnb/i, /descricao/i],
    keywords: ['listing', 'booking', 'airbnb', 'descricao', 'anuncio', 'chamativo', 'titulo', 'otimizado'],
  },
  {
    id: '25',
    name: 'review_google_trustpilot',
    category: 'Review',
    minQuality: 0.85,
    slaMs: 5000,
    fastPatterns: [/trustpilot/i, /google\s+review/i, /estrelas/i, /comentario/i],
    keywords: ['trustpilot', 'google', 'review', 'estrelas', 'comentario', 'resposta', 'avaliaca', 'feedback'],
  },
  {
    id: '26',
    name: 'review_booking_tripadvisor',
    category: 'Review',
    minQuality: 0.85,
    slaMs: 5000,
    fastPatterns: [/tripadvisor/i, /booking\s+comentario/i, /nota/i, /critica/i],
    keywords: ['tripadvisor', 'booking', 'comentario', 'nota', 'critica', 'elogio', 'resposta', 'resposta review'],
  },
  {
    id: '27',
    name: 'multilingual_english',
    category: 'I18N',
    minQuality: 0.75,
    slaMs: 2000,
    fastPatterns: [/\b(hello|english|speak|book|room|reservation)\b/i, /how\s+much/i],
    keywords: ['hello', 'english', 'speak', 'book', 'room', 'reservation', 'price', 'rates', 'stay', 'where'],
  },
  {
    id: '28',
    name: 'multilingual_spanish',
    category: 'I18N',
    minQuality: 0.75,
    slaMs: 2000,
    fastPatterns: [/\b(hola|espanol|habla|cuarto|reserva)\b/i, /cuanto\s+cuesta/i],
    keywords: ['hola', 'espanol', 'habla', 'cuarto', 'reserva', 'precio', 'habitación', 'estancia', 'dónde'],
  },
  {
    id: '29',
    name: 'multilingual_other',
    category: 'I18N',
    minQuality: 0.75,
    slaMs: 2000,
    fastPatterns: [/\b(bonjour|hallo|deutsch|sprechen|parler|chambre|zimmer)\b/i],
    keywords: ['bonjour', 'hallo', 'deutsch', 'sprechen', 'parler', 'chambre', 'zimmer', 'sprache', 'langue'],
  },
  {
    id: '30',
    name: 'emergency_medical',
    category: 'Emergency',
    minQuality: 0.5,
    slaMs: 200,
    fastPatterns: [/ambulancia/i, /medico/i, /alergia/i, /passando\s+mal/i, /machucou/i, /dor\s+forte/i, /infarto/i],
    keywords: ['ambulancia', 'medico', 'alergia', 'passando mal', 'machucou', 'sangrando', 'dor forte', 'socorro', 'hospital'],
  },
  {
    id: '31',
    name: 'emergency_safety',
    category: 'Emergency',
    minQuality: 0.5,
    slaMs: 200,
    fastPatterns: [/fogo/i, /incendio/i, /policia/i, /ladrao/i, /roubo/i, /assalto/i, /arma/i],
    keywords: ['fogo', 'incendio', 'policia', 'ladrao', 'roubo', 'assalto', 'arma', 'briga', 'seguranca', 'perigo'],
  },
  {
    id: '32',
    name: 'revenue_pricing_dynamic',
    category: 'Pricing',
    minQuality: 0.75,
    slaMs: 1500,
    fastPatterns: [/cotacao/i, /pace/i, /desconto.*tarifa/i, /precificacao/i, /calcular.*preco/i],
    keywords: ['cotacao', 'pace', 'desconto', 'tarifa', 'precificacao', 'calcular', 'reajuste', 'teto', 'piso', 'yield'],
  },
  {
    id: '33',
    name: 'social_selling',
    category: 'CRM',
    minQuality: 0.7,
    slaMs: 3000,
    fastPatterns: [/instagram.*venda|venda.*instagram/i, /facebook.*negocio/i, /direct.*venda/i, /oportunidade.*social/i],
    keywords: ['instagram', 'facebook', 'direct', 'venda social', 'social selling', 'oportunidade', 'dm', 'engajamento', 'seguidor', 'influencer'],
  },
  {
    id: '34',
    name: 'followup_cadence',
    category: 'CRM',
    minQuality: 0.7,
    slaMs: 2000,
    fastPatterns: [/follow.?up/i, /cadencia/i, /disparo.*follow/i, /reengajar/i, /lead.*quente|quente.*lead/i],
    keywords: ['followup', 'cadencia', 'disparo', 'reengajar', 'lead quente', 'lembrete', 'acao', 'timing', 'agendado', 'automatico'],
  },
];

export class ContextDiscretizer {
  classify(context: RoutingContext): Result<IBucketDefinition, Error> {
    const text = context.inputText.trim();
    if (!text) {
      return Result.fail(new Error('Input text cannot be empty'));
    }

    // Fast Path (RegExp matching)
    // Priorities order: Emergency (30-31) > Complaint (13-18) > Pricing (05-08,32) > Booking (09-12) > CRM (33-34) > Review/I18N/Semantic/Content (19-29) > FAQ (00-04)
    const priorityBuckets = [
      ...BUCKETS.filter(b => b.category === 'Emergency'),
      ...BUCKETS.filter(b => b.category === 'Complaint'),
      ...BUCKETS.filter(b => b.category === 'Pricing'),
      ...BUCKETS.filter(b => b.category === 'Booking'),
      ...BUCKETS.filter(b => b.category === 'CRM'),
      ...BUCKETS.filter(b => b.category === 'Semantic' || b.category === 'Content' || b.category === 'Review' || b.category === 'I18N'),
      ...BUCKETS.filter(b => b.category === 'FAQ'),
    ];

    for (const bucket of priorityBuckets) {
      for (const rx of bucket.fastPatterns) {
        if (rx.test(text)) {
          return Result.ok(bucket);
        }
      }
    }

    // Feature Path (Jaccard Overlap)
    const inputWords = new Set(
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2)
    );

    if (inputWords.size === 0) {
      // Fallback a "faq_general_misc"
      return Result.ok(BUCKETS.find(b => b.id === '04')!);
    }

    let bestBucket = BUCKETS.find(b => b.id === '04')!;
    let maxJaccard = -1;

    for (const bucket of BUCKETS) {
      const bucketKeywords = new Set(bucket.keywords);
      const intersection = new Set([...inputWords].filter(w => bucketKeywords.has(w)));
      const union = new Set([...inputWords, ...bucketKeywords]);

      const jaccard = intersection.size / union.size;
      if (jaccard > maxJaccard) {
        maxJaccard = jaccard;
        bestBucket = bucket;
      }
    }

    return Result.ok(bestBucket);
  }
}
