import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { readFile, unlink } from 'fs/promises';

export const runtime = 'nodejs'; // Required for child_process

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid text parameter' }, { status: 400 });
    }

    const id = uuidv4();
    const outPath = `/tmp/${id}.wav`;
    const cmd = `tts --text ${JSON.stringify(text)} --model_name "tts_models/en/ljspeech/tacotron2-DDC" --out_path ${outPath}`;

    // Run the TTS command
    await new Promise<void>((resolve, reject) => {
      exec(cmd, (error, stdout, stderr) => {
        if (error) {
          reject(stderr || error.message);
        } else {
          resolve();
        }
      });
    });

    // Read the generated wav file
    const audioBuffer = await readFile(outPath);
    // Clean up the file
    await unlink(outPath);

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': `inline; filename="${id}.wav"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return NextResponse.json({ error: 'TTS request failed', details: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
} 