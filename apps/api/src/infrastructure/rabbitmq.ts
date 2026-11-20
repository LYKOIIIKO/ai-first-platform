import { connect } from 'amqplib';
import { rabbitmqSettings } from './settings';

export function createRabbitmqProbe(timeout: number) {
  const settings = rabbitmqSettings();
  return async (signal: AbortSignal) => {
    const socketSignal = AbortSignal.any([signal, AbortSignal.timeout(timeout)]);
    const connection = await connect(settings, { timeout, signal: socketSignal });
    connection.on('error', () => {});
    try {
      const channel = await connection.createChannel();
      channel.on('error', () => {});
    } finally {
      void connection.close().catch(() => {});
    }
  };
}
