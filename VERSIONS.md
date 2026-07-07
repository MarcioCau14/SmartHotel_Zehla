# SmartHotel Zehla — Versoes Unificadas de Dependencias

Documento de referencia central para versoes minimas de dependencias
compartilhadas entre os subprojetos do monorepo.

| Dependencia    | Versao minima | zehla-backend | Projetos/zehla-frontend | secretaria-ai |
| -------------- | ------------- | ------------- | ----------------------- | ------------- |
| next           | 16.2.7        | 16.2.7        | 16.2.7                  | 16.2.7        |
| react          | 19.2.4        | 19.2.4        | 19.2.4                  | 19.2.4        |
| react-dom      | 19.2.4        | 19.2.4        | 19.2.4                  | 19.2.4        |
| @prisma/client | 6.11.1        | 6.11.1        | —                       | 6.11.1        |
| prisma         | 6.11.1        | 6.11.1        | —                       | 6.11.1        |

## Gerenciadores de pacote por projeto

| Projeto                 | Gerenciador |
| ----------------------- | ----------- |
| zehla-backend           | pnpm        |
| Projetos/zehla-frontend | npm         |
| secretaria-ai           | bun         |

## Como atualizar

```bash
# zehla-backend
cd zehla-backend
pnpm update next@16.2.7 react@19.2.4 react-dom@19.2.4 @prisma/client@6.11.1 prisma@6.11.1

# Projetos/zehla-frontend
cd Projetos/zehla-frontend
npm update next react react-dom

# secretaria-ai
cd secretaria-ai
bun update next@16.2.7 react@19.2.4 react-dom@19.2.4
```

## Regras

1. Ao subir a versao de uma dependencia compartilhada em um projeto,
   suba nos demais na mesma janela de trabalho e atualize esta tabela.
2. Prisma deve permanecer na mesma major/minor em todos os projetos que
   o utilizam (backend e secretaria-ai) para evitar divergencia de schema
   engine e de client gerado.
3. Nao fixar versoes divergentes de react/react-dom — React 19 exige
   pareamento exato entre os dois pacotes.
