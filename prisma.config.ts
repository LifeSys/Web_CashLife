import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Config de la Prisma CLI (migrate, generate, studio). El cliente en
// runtime de la app usa su propio driver adapter (src/lib/db/prisma.ts).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
