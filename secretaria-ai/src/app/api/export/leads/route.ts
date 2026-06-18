import { NextRequest, NextResponse } from 'next/server';
import { generateSpreadsheet, generateCSV } from '@/lib/export-spreadsheet';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const leads = body.leads;

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum lead fornecido para exportação' },
        { status: 400 }
      );
    }

    const format = body.format || 'xlsx';

    if (format === 'csv') {
      const csv = generateCSV(leads);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/tab-separated-values; charset=utf-8',
          'Content-Disposition':
            'attachment; filename="secretaria_leads_' +
            new Date().toISOString().slice(0, 10) +
            '.csv"',
        },
      });
    }

    /* Default: xlsx */
    const buffer = generateSpreadsheet(leads);
    const filename =
      'secretaria_leads_' + new Date().toISOString().slice(0, 10) + '.xlsx';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.byteLength),
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Erro ao gerar planilha' },
      { status: 500 }
    );
  }
}
