import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'images');

    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.log('Folder already exists');
    }

    const filename = `${Date.now()}${path.extname(file.name)}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      filename: filename,
      url: `/images/${filename}`
    });

  } catch (error) {
    console.log('UPLOAD ERROR:', error);

    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
