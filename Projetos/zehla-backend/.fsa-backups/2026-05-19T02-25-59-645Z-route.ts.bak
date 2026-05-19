import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import * as XLSX from 'xlsx';

const BASE_DIR = '/Users/marciocau/Downloads/ENTREGÁVEIS ZEHLA FULL STACK';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get('file');
    const download = searchParams.get('download') === 'true';

    // List all spreadsheets in the directory
    if (!fileName) {
      if (!fs.existsSync(BASE_DIR)) {
        return NextResponse.json({ files: [] });
      }
      const files = fs.readdirSync(BASE_DIR)
        .filter(f => f.endsWith('.xlsx'))
        .map(f => ({
          name: f,
          lastModified: fs.statSync(path.join(BASE_DIR, f)).mtime,
          size: fs.statSync(path.join(BASE_DIR, f)).size
        }));
      return NextResponse.json({ files });
    }

    const filePath = path.join(BASE_DIR, fileName);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
    }

    // Handle Download
    if (download) {
      const fileBuffer = fs.readFileSync(filePath);
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Disposition': `attachment; filename="${fileName}"`,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });
    }

    // Handle Read (JSON)
    const workbook = XLSX.readFile(filePath);
    const data: Record<string, any[][]> = {};
    workbook.SheetNames.forEach(sheetName => {
      data[sheetName] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    });

    return NextResponse.json({ 
      fileName,
      sheets: workbook.SheetNames,
      data: data,
      lastModified: fs.statSync(filePath).mtime
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (file) {
      // UPLOAD FLOW
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(BASE_DIR, file.name);
      fs.writeFileSync(filePath, buffer);
      return NextResponse.json({ success: true, message: 'Upload concluído!' });
    } else {
      // SAVE FLOW (JSON to XLSX)
      const { fileName, sheetName, data, sheetsOrder } = await req.json();
      const filePath = path.join(BASE_DIR, fileName);
      
      let workbook;
      if (fs.existsSync(filePath)) {
        workbook = XLSX.readFile(filePath);
      } else {
        workbook = XLSX.utils.book_new();
      }

      const newWorksheet = XLSX.utils.aoa_to_sheet(data);
      
      // If we want to replace or add
      if (!workbook.SheetNames.includes(sheetName)) {
        XLSX.utils.book_append_sheet(workbook, newWorksheet, sheetName);
      } else {
        workbook.Sheets[sheetName] = newWorksheet;
      }

      XLSX.writeFile(workbook, filePath);
      return NextResponse.json({ success: true, message: 'Arquivo atualizado!' });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { action, fileName, oldSheetName, newSheetName, newFileName } = await req.json();
    const filePath = path.join(BASE_DIR, fileName);

    if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });

    const workbook = XLSX.readFile(filePath);

    if (action === 'renameSheet') {
      const index = workbook.SheetNames.indexOf(oldSheetName);
      if (index > -1) {
        workbook.SheetNames[index] = newSheetName;
        workbook.Sheets[newSheetName] = workbook.Sheets[oldSheetName];
        delete workbook.Sheets[oldSheetName];
        XLSX.writeFile(workbook, filePath);
      }
    } else if (action === 'renameFile') {
      const newPath = path.join(BASE_DIR, newFileName);
      fs.renameSync(filePath, newPath);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
