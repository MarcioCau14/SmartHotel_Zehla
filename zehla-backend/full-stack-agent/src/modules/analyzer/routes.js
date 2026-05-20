/**
 * FULL_STACK_AGENT — Route Mapping
 * Mapeia páginas e APIs baseadas na estrutura do framework.
 */

import path from 'node:path';
import { walkDirSync, exists } from '../../utils/fs.js';

/**
 * Mapeia as rotas do projeto
 * @param {string} projectRoot 
 * @param {object} framework 
 * @returns {Promise<object>}
 */
export async function mapRoutes(projectRoot, framework) {
  const routes = {
    pages: [],
    apis: [],
    components: []
  };

  // 1. Next.js (App Router)
  if (framework.name === 'Next.js' && framework.features.includes('app-router')) {
    const appDir = path.join(projectRoot, 'app');
    if (exists(appDir)) {
      const files = walkDirSync(appDir, { extensions: ['.tsx', '.ts', '.js'] });
      
      for (const file of files) {
        const relative = path.relative(appDir, file);
        
        // Páginas: page.tsx
        if (file.endsWith('page.tsx') || file.endsWith('page.js')) {
          const routePath = '/' + path.dirname(relative).replace(/\\/g, '/').replace(/^\.$/, '');
          routes.pages.push({ path: routePath, file: relative });
        }
        
        // APIs: route.ts
        if (file.endsWith('route.ts') || file.endsWith('route.js')) {
          const routePath = '/api/' + path.dirname(relative).replace(/\\/g, '/');
          routes.apis.push({ method: 'ALL', path: routePath, file: relative });
        }
      }
    }
  }
  
  // 2. Mapeamento genérico de componentes (src/components)
  const compDir = path.join(projectRoot, 'src', 'components');
  if (exists(compDir)) {
    const files = walkDirSync(compDir, { extensions: ['.tsx', '.js'] });
    files.forEach(file => {
      routes.components.push({
        name: path.basename(file, path.extname(file)),
        file: path.relative(projectRoot, file)
      });
    });
  }

  return routes;
}
