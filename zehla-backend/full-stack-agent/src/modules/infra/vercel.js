import { writeFile, exists } from '../../utils/fs.js';
import logger from '../../utils/logger.js';
import path from 'node:path';

export class VercelGenerator {
  async generate(projectPath, context) {
    const configPath = path.join(projectPath, 'vercel.json');

    if (exists(configPath)) {
      return { status: 'SKIPPED', message: 'vercel.json já existe.' };
    }

    const content = JSON.stringify(this.getConfig(context), null, 2) + '\n';

    try {
      await writeFile(configPath, content);
      return { status: 'CREATED', path: 'vercel.json' };
    } catch (err) {
      logger.error(`Falha ao gerar vercel.json: ${err.message}`);
      return { status: 'ERROR', message: err.message };
    }
  }

  getConfig(context) {
    const framework = context.project.framework?.name || '';
    const isNext = framework === 'next.js';
    const isReact = framework === 'react' || framework === 'create-react-app';

    return {
      ...(isNext ? { framework: 'nextjs' } : {}),
      ...(isReact ? { framework: 'create-react-app' } : {}),
      buildCommand: isNext ? 'next build' : 'npm run build',
      outputDirectory: isNext ? '.next' : 'build',
      installCommand: 'npm install',
      devCommand: isNext ? 'next dev' : 'npm start',
      functions: {
        'api/**/*.js': {
          maxDuration: 30
        }
      }
    };
  }
}
