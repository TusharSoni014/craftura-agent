import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { PostgresStore } from '@mastra/pg';
import { Observability, MastraStorageExporter, MastraPlatformExporter, SensitiveDataFilter } from '@mastra/observability';
import { weatherWorkflow } from './workflows/weather-workflow';
import { weatherAgent } from './agents/weather-agent';

type MastraGlobal = typeof globalThis & {
  mastra?: Mastra;
  mastraPgStore?: PostgresStore;
};

const globalForMastra = globalThis as MastraGlobal;

function getPostgresStore() {
  if (globalForMastra.mastraPgStore) {
    return globalForMastra.mastraPgStore;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is required. Use a Neon pooled connection string for both local and production.',
    );
  }

  const store = new PostgresStore({
    id: 'neon-storage',
    connectionString,
  });
  globalForMastra.mastraPgStore = store;
  return store;
}

export const mastra =
  globalForMastra.mastra ??
  new Mastra({
    workflows: { weatherWorkflow },
    agents: { weatherAgent },
    storage: getPostgresStore(),
    logger: new PinoLogger({
      name: 'Mastra',
      level: 'info',
    }),
    observability: new Observability({
      configs: {
        default: {
          serviceName: 'mastra',
          exporters: [
            new MastraStorageExporter(),
            new MastraPlatformExporter(),
          ],
          spanOutputProcessors: [new SensitiveDataFilter()],
        },
      },
    }),
  });

globalForMastra.mastra = mastra;
