function required(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) throw new Error(`Missing required setting: ${name}`);
  return value;
}

function port(name: string): number {
  const value = Number(required(name));
  if (!Number.isInteger(value) || value < 1 || value > 65535) {
    throw new Error(`Invalid port setting: ${name}`);
  }
  return value;
}

export function apiSettings() {
  return { host: required('API_HOST'), port: port('API_PORT') };
}

export function postgresSettings() {
  return {
    host: required('PGHOST'),
    port: port('PGPORT'),
    database: required('PGDATABASE'),
    user: required('PGUSER'),
    password: required('PGPASSWORD'),
  };
}

export function rabbitmqSettings() {
  return {
    protocol: 'amqp',
    hostname: required('AMQP_HOST'),
    port: port('AMQP_PORT'),
    username: required('AMQP_USER'),
    password: required('AMQP_PASSWORD'),
  };
}
