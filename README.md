# AI-first Platform

Технический каркас связывает React, NestJS, PostgreSQL и RabbitMQ. Страница `/system` показывает, доступны ли база и брокер из API.

## Первый запуск

1. Запустите Docker Desktop с Linux-контейнерами или Docker Engine с Compose. Для Watch нужна поддержка `initial_sync` (Compose 2.32 или новее).
2. Установите Node.js 24 из [`.node-version`](.node-version) и pnpm 12 из поля `packageManager` в [`package.json`](package.json).
3. Скопируйте `.env.example` в `.env`. Задайте локальные пароли PostgreSQL и RabbitMQ до первого запуска.
4. Выполните `pnpm smoke`.
5. Откройте <http://localhost:5173/system>. PostgreSQL и RabbitMQ должны показать «Работает».

`pnpm smoke` ждёт готовности контейнеров до 120 секунд. Затем он проверяет страницу и запрос к API через прокси Vite. Каждый HTTP-запрос ждёт ответ до пяти секунд. API проверяет базу и брокер параллельно, по две секунды на зависимость.

Без pnpm можно выполнить `docker compose up --wait --wait-timeout 120`. Для уже запущенного стека используйте `pnpm check:ready`. Команда проверяет страницу и API через один адрес web.

| Сервис | Локальный адрес | Параметр порта в `.env` |
| --- | --- | --- |
| Web | `127.0.0.1:5173` | `WEB_PORT` |
| API | `127.0.0.1:3000` | `API_PORT` |
| PostgreSQL | `127.0.0.1:5432` | `DB_PORT` |
| RabbitMQ | `127.0.0.1:5672` | `RABBITMQ_PORT` |

Выполните `docker compose down`, чтобы остановить стек и сохранить данные. Имя пользователя и пароль в уже созданном томе не меняются от редактирования `.env`.

## Разработка

- **В контейнерах.** Запустите `docker compose up --watch`. Изменения web подхватывает Vite, изменения API перезапускают процесс Node. При изменении манифеста или lock-файла Compose пересобирает образы. Проверяйте работающий стек командой `pnpm check:ready`.
- **На компьютере.** Остановите полный стек через `docker compose down`. Выполните `pnpm install --frozen-lockfile`, затем `pnpm dev`. Compose запустит базу и брокер, а web и API запустятся локально. После выхода из `pnpm dev` контейнеры инфраструктуры можно остановить командой `docker compose down`.

## Проверки кода

- `pnpm check` проверяет типы, ESLint, граф импортов и актуальность HTTP-контракта. GitHub Actions запускает ту же команду при открытии или обновлении PR.
- `pnpm test` запускает проверки через наблюдаемые точки входа.
- После изменения схем HTTP выполните `pnpm contract:generate`. Сохраните изменения OpenAPI и клиентских типов в Git. Для отдельной проверки выполните `pnpm contract:check`.

## Проверка поведения стека

| Действие | Ожидаемый результат |
| --- | --- |
| Запустите `pnpm smoke` после `docker compose down` | Команда завершится успешно. Браузер покажет две работающие зависимости на `/system`. |
| Выполните `docker compose stop db` | `/health/live` отвечает HTTP 200. `/health/ready` отвечает HTTP 503. Страница показывает недоступный PostgreSQL. `pnpm check:ready` завершается с ошибкой. |
| Выполните `docker compose start db`, затем повторите проверку с `rabbitmq` | PostgreSQL восстановит готовность. При остановке брокера HTTP 503 и страница укажут на RabbitMQ. После запуска брокер восстановится без перезапуска API. |
| Выполните `docker compose stop api` | Vite продолжит отдавать страницу. Браузер покажет ошибку связи с API. |
| Задайте `API_POSTGRES_PASSWORD` или `API_RABBITMQ_PASSWORD` в `.env` заведомо неверным значением и пересоздайте API через `docker compose up -d --no-deps api` | Процесс API отвечает, а готовность соответствующей зависимости пропадает. Удалите переопределение и пересоздайте API для восстановления. |
| Временно задайте `WEB_API_PROXY_TARGET=http://api:3999` в `.env` и пересоздайте web | Прямой запрос API проходит, `pnpm check:ready` через web завершается с ошибкой. Удалите переопределение и пересоздайте web. |
| В режиме Watch измените заголовок страницы, затем код API и манифест приложения | В браузере появится новый заголовок. В журнале API виден перезапуск. В выводе Compose видна сборка образа. Верните проверочные изменения после приёмки. |

Для проверки тома войдите в PostgreSQL командой `docker compose exec db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'`. Создайте техническую таблицу командой `CREATE TABLE foundation_probe (value integer); INSERT INTO foundation_probe VALUES (42);`. Выполните обычный `docker compose down` и запустите стек. Проверьте `SELECT value FROM foundation_probe;` и удалите таблицу командой `DROP TABLE foundation_probe;`.
