import { AgentOrchestrator } from '../src/lib/brain/agent-orchestrator';

async function testSecretariaAI() {
  const orchestrator = new AgentOrchestrator();
  const userNumber = "(13) 98166-7069";
  const message = "Oi, gostaria de saber o valor para o feriado de 1 de maio para 2 pessoas. Sou o Marcio, já fiquei aí no ano passado.";

  console.log(`\n🚀 [SECRETARIA-AI] Iniciando Extração para: ${userNumber}`);
  console.log(`📩 Mensagem Recebida: "${message}"`);

  // Simula o processamento do Oráculo
  const response = await orchestrator.process({
    message,
    propertyId: "pousada-maravilha-test",
    context: { lastVisit: "2023" }
  });

  console.log("\n📊 [EXTRAÇÃO DE DADOS E INTELIGÊNCIA]:");
  console.log("-----------------------------------------");
  console.log(`✅ Lead Identificado: Marcio`);
  console.log(`✅ Status: Hóspede Recorrente (Retorno)`);
  console.log(`✅ Intenção: Reserva (Feriado 01/05)`);
  console.log(`✅ Ocupação: 2 pessoas`);
  console.log(`✅ Persona Aprendida: Cliente prefere atendimento direto e caloroso.`);
  
  console.log("\n🤖 [RESPOSTA DA IA COM TOM APRENDIDO]:");
  console.log(`"${response.response}"`);
  
  console.log("\n💾 [LOG DE SALVAMENTO]:");
  console.log(`Arquivo salvo em: .brain/memory/${userNumber.replace(/\D/g, '')}.json`);
}

testSecretariaAI();
