// hub/lib/zip.mjs
//
// A minimal zip writer (deflate, no zip64) so the build can package each skill
// for upload without depending on a `zip` binary being on the build machine.

import { deflateRawSync, crc32 } from "node:zlib";

const u16 = (n) => {
  const b = Buffer.alloc(2);
  b.writeUInt16LE(n);
  return b;
};
const u32 = (n) => {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n >>> 0);
  return b;
};

/**
 * @param {{ name: string, data: Buffer | string }[]} files  paths use forward slashes
 * @returns {Buffer}
 */
export function zip(files) {
  // A fixed timestamp keeps the archive byte-identical between builds.
  const time = u16(0);
  const date = u16(((2026 - 1980) << 9) | (1 << 5) | 1);
  const local = [];
  const central = [];
  let offset = 0;

  for (const f of [...files].sort((a, b) => a.name.localeCompare(b.name))) {
    const name = Buffer.from(f.name, "utf8");
    const raw = Buffer.isBuffer(f.data) ? f.data : Buffer.from(f.data, "utf8");
    const packed = deflateRawSync(raw, { level: 9 });
    const crc = u32(crc32(raw));
    const head = Buffer.concat([
      u32(0x04034b50), u16(20), u16(0x0800), u16(8), time, date, crc,
      u32(packed.length), u32(raw.length), u16(name.length), u16(0), name,
    ]);
    local.push(head, packed);
    central.push(
      Buffer.concat([
        u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(8), time, date, crc,
        u32(packed.length), u32(raw.length), u16(name.length), u16(0), u16(0), u16(0), u16(0),
        u32(0o100644 << 16), u32(offset), name,
      ])
    );
    offset += head.length + packed.length;
  }

  const dir = Buffer.concat(central);
  const end = Buffer.concat([
    u32(0x06054b50), u16(0), u16(0), u16(central.length), u16(central.length),
    u32(dir.length), u32(offset), u16(0),
  ]);
  return Buffer.concat([...local, dir, end]);
}
