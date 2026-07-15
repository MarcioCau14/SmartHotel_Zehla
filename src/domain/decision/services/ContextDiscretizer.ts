export class ContextDiscretizer {
  private static readonly BUCKETS: { id: string; name: string }[] = [
    { id: '00', name: 'faq_hours_operating' },
    { id: '01', name: 'faq_location_access' },
    { id: '02', name: 'faq_amenities_services' },
    { id: '03', name: 'faq_policies_rules' },
    { id: '04', name: 'faq_general_misc' },
    { id: '05', name: 'pricing_simple_query' },
    { id: '06', name: 'pricing_comparison' },
    { id: '07', name: 'pricing_seasonal_promo' },
    { id: '08', name: 'pricing_negotiation' },
    { id: '09', name: 'booking_new_request' },
    { id: '10', name: 'booking_modification' },
    { id: '11', name: 'booking_cancellation' },
    { id: '12', name: 'booking_checkin_confirm' },
    { id: '13', name: 'complaint_cleanliness' },
    { id: '14', name: 'complaint_noise' },
    { id: '15', name: 'complaint_service_staff' },
    { id: '16', name: 'complaint_maintenance' },
    { id: '17', name: 'complaint_food_beverage' },
    { id: '18', name: 'complaint_billing_charge' },
    { id: '19', name: 'sentiment_negative_deep' },
    { id: '20', name: 'semantic_comparison' },
    { id: '21', name: 'semantic_recommendation' },
    { id: '22', name: 'content_social_media' },
    { id: '23', name: 'content_email_marketing' },
    { id: '24', name: 'content_listing_desc' },
    { id: '25', name: 'review_google_trustpilot' },
    { id: '26', name: 'review_booking_tripadvisor' },
    { id: '27', name: 'multilingual_english' },
    { id: '28', name: 'multilingual_spanish' },
    { id: '29', name: 'multilingual_other' },
    { id: '30', name: 'emergency_medical' },
    { id: '31', name: 'emergency_safety' },
  ];

  // Regex definitions for matching
  private static readonly RULES: { id: string; regex: RegExp; score: number }[] = [
    // Emergency Medical (High Priority)
    { id: '30', regex: /\b(hospital|médico|medico|ambulância|ambulancia|infarto|desmaiou|ferido|machucado|passar mal|sangue|médica|emergência médica)\b/i, score: 10 },
    // Emergency Safety (High Priority)
    { id: '31', regex: /\b(fogo|incêndio|incendio|assalto|ladrão|ladrao|roubo|assaltado|polícia|policia|perigo|segurança armada|invasão|invasao)\b/i, score: 10 },

    // Multilingual English Clues (if matches strongly, and not emergency)
    { id: '27', regex: /\b(hello|good morning|afternoon|evening|booking|reservation|room|price|rate|checkin|checkout|wifi|stay|pension|hotel|cancel|need help)\b/i, score: 4 },
    // Multilingual Spanish Clues
    { id: '28', regex: /\b(hola|buenos días|tardes|noches|reserva|precio|tarifa|habitación|habitacion|cancelar|hacer checkin|ayuda|pension|hotel|costo)\b/i, score: 4 },

    // FAQ Hours
    { id: '00', regex: /\b(horário|horario|funcionamento|abre|fecha|café|cafe da manha|almoço|almoco|jantar|piscina abre|recepção horário)\b/i, score: 3 },
    // FAQ Location
    { id: '01', regex: /\b(localização|localizacao|onde fica|como chegar|endereço|endereco|mapa|fica perto|distância|distancia|ônibus|onibus|aeroporto|rodoviária|rodoviaria)\b/i, score: 3 },
    // FAQ Amenities
    { id: '02', regex: /\b(wifi|wi-fi|internet|estacionamento|garagem|academia|ar condicionado|frigobar|secador|toalha|jacuzzi|sauna)\b/i, score: 3 },
    // FAQ Policies
    { id: '03', regex: /\b(política|politica|regras|proibido|permite|pet|cachorro|gato|animal|criança|crianca|idade|fumante|fumar|multa)\b/i, score: 3 },

    // Pricing simple query
    { id: '05', regex: /\b(preço|preco|valor|quanto custa|diária|diaria|tarifas|valores|custo|orçamento|orcamento)\b/i, score: 3 },
    // Pricing comparison
    { id: '06', regex: /\b(comparar|comparação|diferença de preço|mais barato que|outro quarto preço|tabela de preços)\b/i, score: 3 },
    // Pricing seasonal
    { id: '07', regex: /\b(promoção|promocao|desconto|cupom|oferta|pacote|feriado|carnaval|reveillon|ano novo|natal|fim de semana)\b/i, score: 3 },
    // Pricing negotiation
    { id: '08', regex: /\b(negociar|desconto extra|fazer menor|melhor preço se|contraproposta|descontinho|parcela|ajustar valor)\b/i, score: 4 },

    // Booking request
    { id: '09', regex: /\b(reservar|reserva|agendar|vaga|disponibilidade|quarto livre|gostaria de ficar|quero me hospedar)\b/i, score: 3 },
    // Booking modification
    { id: '10', regex: /\b(alterar reserva|mudar data|adiar|prorrogar|adicionar hóspede|alterar quarto|mudar check-in)\b/i, score: 4 },
    // Booking cancellation
    { id: '11', regex: /\b(cancelar|cancelamento|desistir|estorno|reembolso|devolver dinheiro|cancelar reserva)\b/i, score: 4 },
    // Booking checkin confirm
    { id: '12', regex: /\b(confirmação|confirmacao|comprovante|checkin|check-in|checkout|check-out|voucher|código da reserva|codigo)\b/i, score: 3 },

    // Complaint Cleanliness
    { id: '13', regex: /\b(sujo|sujeira|limpeza|faxina|barata|inseto|odor|fedor|cabelo na cama|lençol sujo|lixo)\b/i, score: 4 },
    // Complaint Noise
    { id: '14', regex: /\b(barulho|som alto|vizinho|gritando|latido|gritaria|acústica|acustica|zuada|incomodando)\b/i, score: 4 },
    // Complaint Staff
    { id: '15', regex: /\b(mau atendimento|grosso|grosseria|rude|demora|ignorou|péssimo serviço|pessimo servico|atendente)\b/i, score: 4 },
    // Complaint Maintenance
    { id: '16', regex: /\b(quebrado|estragado|vazamento|chuveiro frio|ar condicionado não funciona|lâmpada queimada|entupido|goteira|sem água|sem luz)\b/i, score: 4 },
    // Complaint Food
    { id: '17', regex: /\b(estragado|comida fria|cabelo na comida|gosto ruim|vencido|passou do ponto|azedo)\b/i, score: 4 },
    // Complaint Billing
    { id: '18', regex: /\b(cobrança|cobranca|cobrado|cobrar|taxa errada|cobrou a mais|estorno|duplicado|duplicada|fatura|cartão|cartao|cobraram errado)\b/i, score: 4 },

    // Sentiment Deep Negative
    { id: '19', regex: /\b(ódio|odio|horrível|horrivel|péssimo|pessimo|nunca mais|absurdo|inadmissível|decepção|decepcionado|processar|denúncia)\b/i, score: 5 },
    // Semantic comparison
    { id: '20', regex: /\b(comparar pousadas|concorrente|outro hotel é melhor|diferença entre pousadas)\b/i, score: 3 },
    // Semantic recommendation
    { id: '21', regex: /\b(o que fazer|dica de passeio|indicação de restaurante|ponto turístico|recomendação|onde ir)\b/i, score: 3 },

    // Content Social Media
    { id: '22', regex: /\b(legenda|post|instagram|reels|feed|redes sociais|stories)\b/i, score: 3 },
    // Content Email
    { id: '23', regex: /\b(newsletter|email marketing|campanha de e-mail|e-mail em massa)\b/i, score: 3 },
    // Content Listing
    { id: '24', regex: /\b(descrição de anúncio|anunciar no booking|anúncio airbnb|texto para o site)\b/i, score: 3 },

    // Review Google
    { id: '25', regex: /\b(avaliar google|trustpilot|deixar nota google|link de avaliação)\b/i, score: 3 },
    // Review Booking/Tripadvisor
    { id: '26', regex: /\b(tripadvisor|nota no booking|comentário booking|nota tripadvisor)\b/i, score: 3 }
  ];

  discretize(inputText: string): string {
    if (!inputText || inputText.trim() === '') {
      return '04'; // Default to faq_general_misc if empty
    }

    const scores = new Map<string, number>();
    for (const bucket of ContextDiscretizer.BUCKETS) {
      scores.set(bucket.id, 0);
    }

    // Evaluate rules
    for (const rule of ContextDiscretizer.RULES) {
      if (rule.regex.test(inputText)) {
        scores.set(rule.id, (scores.get(rule.id) || 0) + rule.score);
      }
    }

    // Find the bucket with the highest score
    let bestId = '04'; // default to faq_general_misc
    let highestScore = 0;

    for (const [id, score] of scores.entries()) {
      if (score > highestScore) {
        highestScore = score;
        bestId = id;
      }
    }

    // Secondary Language heuristics for English/Spanish if no specific match
    if (highestScore === 0) {
      const isEnglish = /[a-zA-Z]/i.test(inputText) && /\b(the|and|you|is|room|stay|for|with|have|reservation)\b/i.test(inputText);
      const isSpanish = /[a-zA-Z]/i.test(inputText) && /\b(el|la|los|y|usted|es|habitacion|estadia|para|con|tener|reserva)\b/i.test(inputText);
      if (isEnglish) return '27'; // multilingual_english
      if (isSpanish) return '28'; // multilingual_spanish
    }

    return bestId;
  }
}
