import '@prisma/client'

declare module '@prisma/client' {
  // Extensão do PrismaClient para os métodos mockados
  export interface PrismaClient {
    trendKeyword: any;
    trendSignal: any;
    trendDataPoint: any;
    holidaySignal: any;
    weatherSignal: any;
    zMGMessage: any;
    zMGActivity: any;
    contactProfile: any;
    mLInteractionLog: any;
  }

  // Definição dos tipos ausentes
  export type TrendKeyword = any;
  export type TrendSignal = any;
  export type ContactProfile = any;
}
