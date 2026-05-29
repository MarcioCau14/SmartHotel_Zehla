export interface GeneratedTestSuite {
  type: 'component' | 'api' | 'e2e';
  filePath: string;
  content: string;
}

export class CodeGenerator {
  generateComponentTest(componentName: string, category: string, filePath: string): GeneratedTestSuite {
    const content = `import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ${componentName} } from '@/components/${category}/${componentName}';

describe('${componentName}', () => {
  const defaultProps = {};

  it('renderiza sem erros', () => {
    const { container } = render(<${componentName} {...defaultProps} />);
    expect(container).toBeInTheDocument();
  });

  it('renderiza com props obrigatorias', () => {
    render(<${componentName} {...defaultProps} />);
    expect(screen.getByTestId('${componentName.toLowerCase()}')).toBeInTheDocument();
  });
});`;

    return {
      type: 'component',
      filePath,
      content,
    };
  }

  generateAPITest(method: string, route: string, hasAuth: boolean): GeneratedTestSuite {
    const routePath = route.replace(/^\/api\//, '');
    const content = `import { describe, it, expect } from 'vitest';

describe('${method} /api/${routePath}', () => {
  it('deve retornar 200 com dados validos', async () => {
    const res = await fetch('http://localhost:3000/api/${routePath}');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toBeDefined();
  });

  ${hasAuth ? `
  it('deve retornar 401 sem autenticacao', async () => {
    const res = await fetch('http://localhost:3000/api/${routePath}');
    expect(res.status).toBe(401);
  });` : ''}
});`;

    return {
      type: 'api',
      filePath: `src/__tests__/api/${routePath.replace(/\//g, '-')}.test.ts`,
      content,
    };
  }
}
