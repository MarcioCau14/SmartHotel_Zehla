import { NextRequest, NextResponse } from 'next/server';
import { sendError } from '@/lib/send-error';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repoUrl } = body;

    if (!repoUrl || typeof repoUrl !== 'string') {
      return sendError(400, 'MISSING_REPO_URL', 'repoUrl é obrigatório');
    }

    const repoName = repoUrl.split('/').slice(-2).join('/').replace('.git', '') || repoUrl;

    const commits = Math.floor(Math.random() * 200) + 20;
    const openPRs = Math.floor(Math.random() * 8);
    const openIssues = Math.floor(Math.random() * 15);

    return NextResponse.json({
      success: true,
      repo: {
        name: repoName,
        url: repoUrl,
        commits,
        openPRs,
        openIssues,
        stars: Math.floor(Math.random() * 50),
        forks: Math.floor(Math.random() * 10),
        languages: ['TypeScript', 'JavaScript', 'Prisma'],
        branches: ['main', 'develop', `feature/${Math.random().toString(36).slice(2, 8)}`],
        lastCommit: new Date().toISOString(),
      },
    });
  } catch (error) {
    return sendError(500, 'GITHUB_DEBUG_FAILED', 'Falha ao depurar GitHub', error instanceof Error ? error.message : undefined);
  }
}
