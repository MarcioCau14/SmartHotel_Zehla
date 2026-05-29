-- CreateTable
CREATE TABLE "marketing_reviews" (
    "id" TEXT NOT NULL,
    "pousadaId" TEXT NOT NULL,
    "hospedeNome" TEXT NOT NULL,
    "portal" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "sentimento" TEXT NOT NULL,
    "resposta" TEXT,
    "tom" TEXT,
    "status" TEXT NOT NULL DEFAULT 'recebido',
    "dataEstadia" TIMESTAMP(3) NOT NULL,
    "quartoId" TEXT,
    "problemaRelatado" TEXT,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketing_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_campanhas" (
    "id" TEXT NOT NULL,
    "pousadaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "publicoAlvo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "conteudo" TEXT,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "possuiPromiseFinanceira" BOOLEAN NOT NULL DEFAULT false,
    "promiseFinanceiraValidada" BOOLEAN NOT NULL DEFAULT false,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketing_campanhas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_conteudos" (
    "id" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "tom" TEXT NOT NULL,
    "versao" INTEGER NOT NULL DEFAULT 1,
    "conteudoAnteriorId" TEXT,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketing_conteudos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_posts" (
    "id" TEXT NOT NULL,
    "pousadaId" TEXT NOT NULL,
    "canal" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "conteudoId" TEXT NOT NULL,
    "midias" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dataAgendamento" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "dataPublicacao" TIMESTAMP(3),
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketing_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_metricas" (
    "id" TEXT NOT NULL,
    "pousadaId" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "notaMedia" DOUBLE PRECISION,
    "taxaResposta" DOUBLE PRECISION,
    "sentimentoMedio" DOUBLE PRECISION,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "totalRespondidos" INTEGER NOT NULL DEFAULT 0,
    "totalCampanhas" INTEGER NOT NULL DEFAULT 0,
    "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marketing_metricas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "marketing_reviews_pousadaId_status_idx" ON "marketing_reviews"("pousadaId", "status");

-- CreateIndex
CREATE INDEX "marketing_reviews_pousadaId_dataCriacao_idx" ON "marketing_reviews"("pousadaId", "dataCriacao");

-- CreateIndex
CREATE INDEX "marketing_reviews_pousadaId_sentimento_idx" ON "marketing_reviews"("pousadaId", "sentimento");

-- CreateIndex
CREATE INDEX "marketing_campanhas_pousadaId_status_idx" ON "marketing_campanhas"("pousadaId", "status");

-- CreateIndex
CREATE INDEX "marketing_campanhas_pousadaId_dataInicio_dataFim_idx" ON "marketing_campanhas"("pousadaId", "dataInicio", "dataFim");

-- CreateIndex
CREATE INDEX "marketing_posts_pousadaId_status_idx" ON "marketing_posts"("pousadaId", "status");

-- CreateIndex
CREATE INDEX "marketing_posts_pousadaId_canal_idx" ON "marketing_posts"("pousadaId", "canal");

-- CreateIndex
CREATE INDEX "marketing_metricas_pousadaId_dataInicio_dataFim_idx" ON "marketing_metricas"("pousadaId", "dataInicio", "dataFim");
