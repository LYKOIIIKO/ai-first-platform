import { useQuery } from '@tanstack/react-query';
import { api } from '@web/shared/api';

async function loadReadiness(signal: AbortSignal) {
  const { data, error, response } = await api.GET('/health/ready', { signal });
  if (response.status === 200 && data) return data;
  if (response.status === 503 && error) return error;
  throw new Error('API readiness response is unavailable');
}

const labels = { ready: 'Работает', unavailable: 'Недоступен' };

export function SystemPage() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['system-readiness'],
    queryFn: ({ signal }) => loadReadiness(signal),
    retry: false,
    refetchInterval: 5000,
  });

  return (
    <main>
      <h1>Состояние системы</h1>
      <div aria-live="polite">
        {isPending && <p>Проверяем зависимости…</p>}
        {isError && <p>Не удалось получить состояние от API.</p>}
        {data && !isError && (
          <dl>
            <dt>PostgreSQL</dt>
            <dd>{labels[data.postgres]}</dd>
            <dt>RabbitMQ</dt>
            <dd>{labels[data.rabbitmq]}</dd>
          </dl>
        )}
      </div>
    </main>
  );
}
