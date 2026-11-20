# React, TypeScript и Vite для frontend

Для frontend выбраны React, TypeScript и Vite. Интерфейс работает в браузере и обращается к backend на NestJS. Vite используется для локальной разработки и сборки приложения.

Первая версия предусматривает закрытый рабочий интерфейс администратора и разработчика. Требования не содержат сценариев, для которых необходимо формировать страницы на сервере. Выбранный вариант позволяет изучать взаимодействие самостоятельного интерфейса с backend, опираясь на знакомый React.

Рассмотрен Next.js. Его серверные возможности не требуются для первой версии. В выбранном стеке маршрутизация и загрузка данных используют отдельные библиотеки. Для структуры frontend выбрана FSD. [ADR-0014](0014-frontend-fsd.md).

TanStack Router и TanStack Query подключаются в каркасе для диагностической страницы `/system`. Файловые маршруты находятся в `app` и подключают страницы из `pages`. Страница использует [типизированный HTTP-клиент](0022-http-contract.md). React Hook Form и Zod подключаются на frontend с первой пользовательской формой для управления полями и проверки значений. [TanStack Router](https://tanstack.com/router/latest/docs/routing/file-based-routing) · [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview) · [React Hook Form](https://react-hook-form.com/get-started) · [Zod](https://zod.dev/).

Tailwind CSS — единственный способ стилизации компонентов интерфейса. Он используется и в SmoothUI, и в собственных компонентах. Tailwind CSS и нужные компоненты SmoothUI подключаются с первым пользовательским интерфейсом. При копировании исходников SmoothUI сохраняются штатные стили и уведомления лицензии. Один способ стилизации позволяет использовать компоненты со штатной настройкой для Vite. [SmoothUI для Vite](https://smoothui.dev/docs/guides/vite) · [Лицензия SmoothUI](https://github.com/educlopez/smoothui/blob/main/LICENSE).
