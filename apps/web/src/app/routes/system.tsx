import { createFileRoute } from '@tanstack/react-router';
import { SystemPage } from '@web/pages/system';

export const Route = createFileRoute('/system')({ component: SystemPage });
