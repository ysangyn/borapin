import { createHash } from 'node:crypto';
import { open } from 'node:fs/promises';
import { createReadStream } from 'node:fs';

/** 빠른 해시: 크기 + 앞 64KB + 뒤 64KB. 훑기에서 먼저 묶어 두고, 같은 것끼리만 전체 해시를 견준다 */
export async function quickHashFile(path: string): Promise<string> {
  const fh = await open(path, 'r');
  try {
    const { size } = await fh.stat();
    const n = 64 * 1024;
    const head = Buffer.alloc(Math.min(n, size));
    await fh.read(head, 0, head.length, 0);
    const h = createHash('sha1').update(String(size)).update(head);
    if (size > n) {
      const tail = Buffer.alloc(Math.min(n, size - n));
      await fh.read(tail, 0, tail.length, size - tail.length);
      h.update(tail);
    }
    return h.digest('hex').slice(0, 24);
  } finally {
    await fh.close();
  }
}

/** 내용 전체 SHA-256 (스트림으로, 큰 동영상도 메모리 안 씀) */
export function sha256File(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const h = createHash('sha256');
    createReadStream(path).on('data', (c) => h.update(c)).on('end', () => resolve(h.digest('hex'))).on('error', reject);
  });
}
