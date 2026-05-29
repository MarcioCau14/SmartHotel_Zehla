import { PrismaClient } from "@prisma/client";


// prisma/seed-trends.ts


const prisma = new PrismaClient();

const DESTINATIONS = [
  "Paraty", "Tiradentes", "Campos do Jordao", "Buzios", "Florianopolis", 
  "Gramado", "Ouro Preto", "Lencois Maranhenses", "Jericoacoara", 
  "Fernando de Noronha", "Chapada dos Veadeiros", "Bonito MS", 
  "Arraial do Cabo", "Porto Seguro", "Trancoso", "Itacare", 
  "Morro de Sao Paulo", "Monte Verde", "Petropolis", "Saquarema", 
  "Cabo Frio", "Rio das Ostras", "Ilha Grande", "Ilhabela", 
  "Ubatuba", "Maresias", "Guaruja", "Santos", "Maragogi", 
  "Porto de Galinhas", "Pipa", "Canoa Quebrada", "Pirenopolis", 
  "Caldas Novas", "Diamantina", "Sao Joao del Rei", "Canela", 
  "Blumenau", "Joinville", "Bombinhas", "Balneario Camboriu",
  "Imbituba", "Praia do Rosa", "Garopaba", "Penha", "Governador Celso Ramos"
];

const TYPES = [
  "pousada pet friendly", "pousada romantica", "chale romantico", 
  "pousada com piscina", "glamping brasil", "pousada sustentavel", 
  "pousada familiar", "pousada boutique"
];

async function main() {
  

  // Destinos
  for (const city of DESTINATIONS) {
    await prisma.trendKeyword.upsert({
      where: { keyword: `pousada em ${city}` },
      update: {},
      create: {
        keyword: `pousada em ${city}`,
        category: "destino",
        tier: "pro",
        geo: "BR"
      },
    });
  }

  // Tipos
  for (const type of TYPES) {
    await prisma.trendKeyword.upsert({
      where: { keyword: type },
      update: {},
      create: {
        keyword: type,
        category: "tipo",
        tier: "max",
        geo: "BR"
      },
    });
  }

  // Feriados Genéricos
  const holidays = ["natal pousada", "reveillon pousada", "semana santa pousada"];
  for (const h of holidays) {
    await prisma.trendKeyword.upsert({
      where: { keyword: h },
      update: {},
      create: {
        keyword: h,
        category: "feriado",
        tier: "pro",
        geo: "BR"
      },
    });
  }

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
