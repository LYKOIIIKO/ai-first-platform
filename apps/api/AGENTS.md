# Backend

- Размещай обработчики HTTP в `src/transport`. При изменении входного слоя и защищённых запросов прочитай [ADR о структуре backend](../../docs/adr/0013-backend-layout.md) и [предметную модель](../../docs/domain-model.md).
- При изменении связей модулей прочитай [матрицу зависимостей](../../docs/adr/0010-allowed-module-dependencies.md) и [правила проверки импортов](../../docs/adr/0011-module-dependency-checks.md). Пример сборки NestJS находится в [AppModule](src/app.module.ts).
- При изменении хранилища прочитай [ADR о принадлежности данных](../../docs/adr/0007-module-data-ownership.md) и [ADR о Drizzle и миграциях](../../docs/adr/0005-drizzle.md).
- При изменении событий прочитай [ADR о вызовах и событиях](../../docs/adr/0008-in-process-module-calls.md).
- При изменении HTTP-ответов прочитай [ADR о контракте](../../docs/adr/0022-http-contract.md). Пример схемы и маршрута — [проверка готовности](src/transport/health/ready.contract.ts).
