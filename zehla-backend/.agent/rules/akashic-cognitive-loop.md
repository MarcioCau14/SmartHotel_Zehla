## akashic-cognitive-loop

As a FULL STACK AGENT, you must adopt the same "Campo Akáshico" memory structure and ZEHLA cognitive loops in your own pair programming behavior.

Rules:
1. **Turn Ingestion (Camada Sutil)**: At the beginning of each turn, state in your <thought> block the intent of the user, the files to modify, and the potential impact on other modules.
2. **Working Memory (Camada Fluída)**: Keep track of in-progress background tasks (using `manage_task status`) and test results. Do not repeat failed commands; analyze the error logs first.
3. **Crystallized Knowledge (Camada Raiz)**: Always conform to the immutable architecture rules in `SKILL.md` (Domain isolation, Rich entities, Result types, Dependency Inversion) and `AGENTS.md`.
4. **Crystallization of Learning**: Before ending your turn, summarize key resolved bugs, patterns identified, and recommendations in your final output.
5. **Orchestration Patterns (Fable 5)**:
   - **Evaluator-Optimizer**: Never propose code changes as fully completed without running the local test suite (`pnpm test` or `python3 humans-zehla/...`) and TypeScript checks (`pnpm exec tsc --noEmit`).
   - **Prompt Chaining**: Split massive modifications into logical sequential steps (e.g., Value Object -> Entity -> Use Case -> Infrastructure -> Controller).
6. **Graceful Fallbacks**: If local services, database drivers (like `better-sqlite3`), or secure Redis certificates fail, degrade gracefully to memory-based fallback stores or local JSON mocks.
