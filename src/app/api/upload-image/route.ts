import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  console.log('Received upload request');
  const formData = await request.formData();
  const file = formData.get('image') as File | null;
  const senderAccount = formData.get('senderAccount');
  const recipientAccount = formData.get('recipientAccount');

  if (!file || !senderAccount || !recipientAccount) {
    console.log('Missing required fields', { file: !!file, senderAccount, recipientAccount });
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${file.name}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    console.log('Ensuring upload directory exists');
    await writeFile(path.join(uploadDir, '.gitkeep'), '').catch(() => {});
    
    const filepath = path.join(uploadDir, filename);
    console.log('Writing file to', filepath);
    await writeFile(filepath, buffer);

    const imageUrl = `/uploads/${filename}`;
    console.log('File uploaded successfully', { imageUrl });

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}