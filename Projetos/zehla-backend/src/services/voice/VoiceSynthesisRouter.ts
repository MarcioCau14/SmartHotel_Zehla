import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface VoiceGenerationPayload {
  propertyId: string;
  leadId: string;
  textToSpeak: string;
  formalityIndex: number; // 0.0 a 1.0 (DNA Wizard)
}

export class VoiceSynthesisRouter {
  /**
   * ZEHLA Neural Voice: Roteador Cognitivo TTS
   * 
   * Determina qual modelo usar (GPT-SoVITS vs F5-TTS) com base no perfil
   * da pousada, carrega a "Voice Print" do dono e injeta na fila (Mocked BullMQ).
   */
  public async routeToTTS(payload: VoiceGenerationPayload): Promise<Buffer> {
    console.log(`[VoiceRouter] Roteando síntese de voz para a Property ${payload.propertyId}. Formality: ${payload.formalityIndex}`);

    // 1. Busca se a Pousada clonou a voz oficial
    const voicePrint = await prisma.voicePrint.findFirst({
      where: { propertyId: payload.propertyId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' }
    });

    const modelToUse = voicePrint?.modelType || 'F5_TTS'; // Fallback para F5-TTS
    
    console.log(`[VoiceRouter] Modelo Selecionado: ${modelToUse}. (Voz Proprietária: ${voicePrint ? 'SIM' : 'NÃO'})`);

    // 2. Modula o "Acting" (Tom de Voz) baseado na Formality Index
    let emotionPrompt = "Normal";
    if (payload.formalityIndex > 0.8) emotionPrompt = "Muito formal e polido";
    if (payload.formalityIndex < 0.3) emotionPrompt = "Descontraído e alegre, ritmo rápido";

    // 3. (MOCK) Disparo para a Fila do BullMQ "voice:generate"
    // No ambiente real, aguardaríamos a resposta do Worker GPU (Python / JAX Pallas)
    const audioBufferResult = this.mockWorkerGeneration(payload.textToSpeak, modelToUse, emotionPrompt);
    
    // 4. Descontar Tokens de Voz da Property (LGPD & Custos)
    const tokensSpent = payload.textToSpeak.length; // 1 token = 1 caractere no TTS
    await prisma.property.update({
      where: { id: payload.propertyId },
      data: { voiceTokensUsed: { increment: tokensSpent } }
    });

    console.log(`[VoiceRouter] Áudio gerado. Foram consumidos ${tokensSpent} Voice Tokens.`);

    return audioBufferResult;
  }

  private mockWorkerGeneration(text: string, model: string, emotion: string): Buffer {
    console.log(`[BullMQ-Worker-GPU] (Simulado) Gerando áudio via ${model} | Emoção: ${emotion}`);
    // Simula a devolução de um buffer OGG/OPUS
    return Buffer.from(`MOCK_AUDIO_BUFFER_FOR: ${text}`);
  }
}
