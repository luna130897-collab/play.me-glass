/**
 * Client-side pure TypeScript audio metadata & album artwork extractor.
 * Supports:
 * - ID3v2.2, ID3v2.3, ID3v2.4 (MP3, WAV, etc.)
 * - ID3v1 fallback (MP3)
 * - FLAC (Vorbis comments & METADATA_BLOCK_PICTURE)
 * - M4A / AAC / MP4 (QuickTime/iTunes atoms: ©nam, ©ART, ©alb, covr)
 * - Embedded lyrics extraction (USLT, ULT, ©lyr, VORBIS LYRICS)
 * - Embedded Album Cover Art converted directly to permanent Base64 Data URL
 * - Accurate audio duration detection
 */

export interface ParsedAudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  genre?: string;
  coverArtUrl?: string; // Permanent Base64 Data URL (data:image/...)
  lyrics?: string;      // Plain embedded lyrics text if present
  duration?: number;    // In seconds
}

// Convert byte array to Base64 Data URL without memory issues
export function uint8ArrayToDataUrl(bytes: Uint8Array, mimeType: string = 'image/jpeg'): string {
  try {
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
    }
    return `data:${mimeType};base64,${btoa(binary)}`;
  } catch (e) {
    console.warn('Failed to convert bytes to Data URL:', e);
    return '';
  }
}

// Synchsafe integer decoder (ID3v2 size format: 7 bits per byte)
function readSynchsafeInt(view: DataView, offset: number): number {
  return (
    ((view.getUint8(offset) & 0x7f) << 21) |
    ((view.getUint8(offset + 1) & 0x7f) << 14) |
    ((view.getUint8(offset + 2) & 0x7f) << 7) |
    (view.getUint8(offset + 3) & 0x7f)
  );
}

// Text decoder with character encodings
function decodeText(bytes: Uint8Array, encoding: number): string {
  if (bytes.length === 0) return '';
  try {
    if (encoding === 0) {
      // ISO-8859-1 / Latin1
      let str = '';
      for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] === 0) break;
        str += String.fromCharCode(bytes[i]);
      }
      return str.trim();
    } else if (encoding === 1 || encoding === 2) {
      // UTF-16 with BOM or UTF-16BE
      const decoder = new TextDecoder(encoding === 2 ? 'utf-16be' : 'utf-16');
      return decoder.decode(bytes).replace(/\0.*$/g, '').trim();
    } else if (encoding === 3) {
      // UTF-8
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(bytes).replace(/\0.*$/g, '').trim();
    }
  } catch {
    // fallback
  }
  return '';
}

/**
 * Extract audio duration accurately using an offscreen HTMLAudioElement
 */
export function getAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    try {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      const objUrl = URL.createObjectURL(blob);
      audio.src = objUrl;

      const cleanup = () => {
        try {
          URL.revokeObjectURL(objUrl);
          audio.removeAttribute('src');
          audio.load();
        } catch {
          // ignore
        }
      };

      const timer = setTimeout(() => {
        cleanup();
        resolve(180); // Fallback 3 mins
      }, 3000);

      audio.onloadedmetadata = () => {
        clearTimeout(timer);
        const dur = audio.duration;
        cleanup();
        if (dur && !isNaN(dur) && isFinite(dur) && dur > 0) {
          resolve(Math.round(dur));
        } else {
          resolve(180);
        }
      };

      audio.onerror = () => {
        clearTimeout(timer);
        cleanup();
        resolve(180);
      };
    } catch {
      resolve(180);
    }
  });
}

/**
 * Main parser entry point: extracts ID3v2, FLAC, M4A, or ID3v1 metadata + album cover
 */
export async function parseAudioMetadata(file: File): Promise<ParsedAudioMetadata> {
  const result: ParsedAudioMetadata = {};

  try {
    // Read the first 16 bytes to detect format header
    const headSlice = await file.slice(0, 16).arrayBuffer();
    const headBytes = new Uint8Array(headSlice);

    // 1. Check ID3v2 (MP3, WAV with ID3, etc.)
    if (headBytes[0] === 0x49 && headBytes[1] === 0x44 && headBytes[2] === 0x33) {
      await parseID3v2(file, result);
    }
    // 2. Check FLAC ('fLaC')
    else if (headBytes[0] === 0x66 && headBytes[1] === 0x4c && headBytes[2] === 0x61 && headBytes[3] === 0x43) {
      await parseFLAC(file, result);
    }
    // 3. Check M4A / AAC ('ftyp' at offset 4)
    else if (headBytes[4] === 0x66 && headBytes[5] === 0x74 && headBytes[6] === 0x79 && headBytes[7] === 0x70) {
      await parseM4A(file, result);
    }

    // 4. Fallback ID3v1 if no title found and file is MP3
    if (!result.title && file.size > 128) {
      await parseID3v1(file, result);
    }

    // 5. Measure accurate duration
    try {
      const dur = await getAudioDuration(file);
      if (dur > 0) {
        result.duration = dur;
      }
    } catch {
      // duration fallback
    }
  } catch (err) {
    console.warn('Metadata parsing error:', err);
  }

  return result;
}

/**
 * Parser for ID3v2.2, ID3v2.3, ID3v2.4
 */
async function parseID3v2(file: File, result: ParsedAudioMetadata): Promise<void> {
  // Read first 10 bytes for header
  const headerBuf = await file.slice(0, 10).arrayBuffer();
  const headerView = new DataView(headerBuf);
  const headerBytes = new Uint8Array(headerBuf);

  const majorVersion = headerBytes[3]; // 2, 3, or 4
  const tagSize = readSynchsafeInt(headerView, 6);

  // Read the full ID3 tag (up to 12MB max to protect memory)
  const fullTagSize = Math.min(file.size, Math.min(10 + tagSize, 12 * 1024 * 1024));
  const tagBuf = await file.slice(0, fullTagSize).arrayBuffer();
  const view = new DataView(tagBuf);
  const bytes = new Uint8Array(tagBuf);

  if (majorVersion === 2) {
    // ID3v2.2 uses 3-character frame IDs and 3-byte size
    let offset = 10;
    while (offset + 6 < bytes.byteLength) {
      if (bytes[offset] === 0) break;
      const frameId = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2]);
      const frameSize = (bytes[offset + 3] << 16) | (bytes[offset + 4] << 8) | bytes[offset + 5];
      if (frameSize <= 0 || offset + 6 + frameSize > bytes.byteLength) break;

      const frameData = bytes.subarray(offset + 6, offset + 6 + frameSize);
      if (frameId === 'TT2' && !result.title) result.title = decodeText(frameData.subarray(1), frameData[0]);
      else if (frameId === 'TP1' && !result.artist) result.artist = decodeText(frameData.subarray(1), frameData[0]);
      else if (frameId === 'TAL' && !result.album) result.album = decodeText(frameData.subarray(1), frameData[0]);
      else if (frameId === 'TYE' && !result.year) result.year = decodeText(frameData.subarray(1), frameData[0]);
      else if (frameId === 'TCO' && !result.genre) result.genre = decodeText(frameData.subarray(1), frameData[0]);
      else if (frameId === 'ULT' && !result.lyrics) {
        // Unsynchronised lyrics
        const encoding = frameData[0];
        let p = 4; // skip encoding (1) + lang (3)
        while (p < frameData.length && frameData[p] !== 0) p++;
        p++; // skip descriptor
        if (p < frameData.length) result.lyrics = decodeText(frameData.subarray(p), encoding);
      } else if (frameId === 'PIC' && !result.coverArtUrl) {
        // PIC in ID3v2.2: encoding (1), format (3), picture type (1), descriptor (null-terminated), image data
        const fmt = String.fromCharCode(frameData[1], frameData[2], frameData[3]).toUpperCase();
        const mime = fmt === 'PNG' ? 'image/png' : 'image/jpeg';
        let p = 5;
        while (p < frameData.length && frameData[p] !== 0) p++;
        p++;
        if (p < frameData.length) {
          result.coverArtUrl = uint8ArrayToDataUrl(frameData.subarray(p), mime);
        }
      }
      offset += 6 + frameSize;
    }
    return;
  }

  // ID3v2.3 & ID3v2.4
  let offset = 10;
  while (offset + 10 < bytes.byteLength) {
    if (bytes[offset] === 0) break; // Padding

    const frameId = String.fromCharCode(
      bytes[offset],
      bytes[offset + 1],
      bytes[offset + 2],
      bytes[offset + 3]
    );

    let frameSize = 0;
    if (majorVersion === 4) {
      frameSize = readSynchsafeInt(view, offset + 4);
    } else {
      frameSize = view.getUint32(offset + 4, false);
    }

    if (frameSize <= 0 || offset + 10 + frameSize > bytes.byteLength) {
      break;
    }

    const frameData = bytes.subarray(offset + 10, offset + 10 + frameSize);

    // Title (TIT2)
    if (frameId === 'TIT2' && !result.title) {
      result.title = decodeText(frameData.subarray(1), frameData[0]);
    }
    // Artist (TPE1)
    else if (frameId === 'TPE1' && !result.artist) {
      result.artist = decodeText(frameData.subarray(1), frameData[0]);
    }
    // Album (TALB)
    else if (frameId === 'TALB' && !result.album) {
      result.album = decodeText(frameData.subarray(1), frameData[0]);
    }
    // Year (TYER or TDRC)
    else if ((frameId === 'TYER' || frameId === 'TDRC') && !result.year) {
      result.year = decodeText(frameData.subarray(1), frameData[0]);
    }
    // Genre (TCON)
    else if (frameId === 'TCON' && !result.genre) {
      result.genre = decodeText(frameData.subarray(1), frameData[0]);
    }
    // Embedded Lyrics (USLT)
    else if (frameId === 'USLT' && !result.lyrics) {
      const encoding = frameData[0];
      let p = 4; // skip encoding (1) + language (3)
      if (encoding === 0 || encoding === 3) {
        while (p < frameData.length && frameData[p] !== 0) p++;
        p++;
      } else {
        while (p + 1 < frameData.length && !(frameData[p] === 0 && frameData[p + 1] === 0)) p += 2;
        p += 2;
      }
      if (p < frameData.length) {
        result.lyrics = decodeText(frameData.subarray(p), encoding);
      }
    }
    // Album Cover Art (APIC)
    else if (frameId === 'APIC' && !result.coverArtUrl) {
      const encoding = frameData[0];
      let pos = 1;

      // MIME type (null-terminated)
      let mime = '';
      while (pos < frameData.length && frameData[pos] !== 0) {
        mime += String.fromCharCode(frameData[pos]);
        pos++;
      }
      pos++; // skip null byte

      if (!mime || mime.toLowerCase() === '-->') {
        mime = 'image/jpeg';
      }

      // Picture type (1 byte, e.g. 0x03 for front cover)
      pos++;

      // Skip description string
      if (encoding === 0 || encoding === 3) {
        while (pos < frameData.length && frameData[pos] !== 0) pos++;
        pos++;
      } else {
        while (pos + 1 < frameData.length && !(frameData[pos] === 0 && frameData[pos + 1] === 0)) {
          pos += 2;
        }
        pos += 2;
      }

      if (pos < frameData.length) {
        const imageBytes = frameData.subarray(pos);
        result.coverArtUrl = uint8ArrayToDataUrl(imageBytes, mime);
      }
    }

    offset += 10 + frameSize;
  }
}

/**
 * Parser for FLAC metadata blocks (Vorbis comments & Picture)
 */
async function parseFLAC(file: File, result: ParsedAudioMetadata): Promise<void> {
  const readLen = Math.min(file.size, 10 * 1024 * 1024);
  const buf = await file.slice(0, readLen).arrayBuffer();
  const view = new DataView(buf);
  const bytes = new Uint8Array(buf);

  let offset = 4; // Skip 'fLaC'

  while (offset + 4 < bytes.length) {
    const header = view.getUint8(offset);
    const isLast = (header & 0x80) !== 0;
    const blockType = header & 0x7f;
    const length = (view.getUint8(offset + 1) << 16) | (view.getUint8(offset + 2) << 8) | view.getUint8(offset + 3);
    offset += 4;

    if (offset + length > bytes.length) break;

    // Type 4: VORBIS_COMMENT
    if (blockType === 4) {
      try {
        let p = offset;
        const vendorLen = view.getUint32(p, true);
        p += 4 + vendorLen;
        const userCommentsLen = view.getUint32(p, true);
        p += 4;

        const decoder = new TextDecoder('utf-8');
        for (let i = 0; i < userCommentsLen && p + 4 <= offset + length; i++) {
          const commentLen = view.getUint32(p, true);
          p += 4;
          if (p + commentLen > offset + length) break;
          const comment = decoder.decode(bytes.subarray(p, p + commentLen));
          p += commentLen;

          const eqIdx = comment.indexOf('=');
          if (eqIdx !== -1) {
            const key = comment.substring(0, eqIdx).toUpperCase();
            const val = comment.substring(eqIdx + 1).trim();
            if (key === 'TITLE' && !result.title) result.title = val;
            else if (key === 'ARTIST' && !result.artist) result.artist = val;
            else if (key === 'ALBUM' && !result.album) result.album = val;
            else if ((key === 'DATE' || key === 'YEAR') && !result.year) result.year = val;
            else if (key === 'GENRE' && !result.genre) result.genre = val;
            else if ((key === 'LYRICS' || key === 'UNSYNCEDLYRICS') && !result.lyrics) result.lyrics = val;
          }
        }
      } catch (e) {
        console.warn('Vorbis comment parse error:', e);
      }
    }
    // Type 6: PICTURE
    else if (blockType === 6 && !result.coverArtUrl) {
      try {
        let p = offset;
        p += 4; // skip picture type
        const mimeLen = view.getUint32(p, false);
        p += 4;
        let mime = '';
        for (let i = 0; i < mimeLen; i++) mime += String.fromCharCode(bytes[p + i]);
        p += mimeLen;
        const descLen = view.getUint32(p, false);
        p += 4 + descLen;
        p += 16; // width (4), height (4), depth (4), colors (4)
        const picLen = view.getUint32(p, false);
        p += 4;
        if (p + picLen <= offset + length) {
          result.coverArtUrl = uint8ArrayToDataUrl(bytes.subarray(p, p + picLen), mime || 'image/jpeg');
        }
      } catch (e) {
        console.warn('FLAC picture parse error:', e);
      }
    }

    offset += length;
    if (isLast) break;
  }
}

/**
 * Parser for M4A / AAC / MP4 iTunes metadata atoms
 */
async function parseM4A(file: File, result: ParsedAudioMetadata): Promise<void> {
  const readLen = Math.min(file.size, 10 * 1024 * 1024);
  const buf = await file.slice(0, readLen).arrayBuffer();
  const view = new DataView(buf);
  const bytes = new Uint8Array(buf);

  const decoder = new TextDecoder('utf-8');

  // Search recursively for known atoms: ©nam, ©ART, ©alb, ©day, ©gen, ©lyr, covr
  let offset = 0;
  while (offset + 8 < bytes.length) {
    const size = view.getUint32(offset, false);
    if (size < 8 || offset + size > bytes.length) break;

    const atomType = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]);

    if (atomType === 'moov' || atomType === 'udta' || atomType === 'meta' || atomType === 'ilst') {
      // Step inside container atom (for 'meta', skip 4 extra version/flag bytes)
      offset += atomType === 'meta' ? 12 : 8;
      continue;
    }

    // Inside ilst entries:
    const dataOffset = offset + 8;
    if (dataOffset + 16 <= offset + size) {
      const dataSize = view.getUint32(dataOffset, false);
      const dataTag = String.fromCharCode(bytes[dataOffset + 4], bytes[dataOffset + 5], bytes[dataOffset + 6], bytes[dataOffset + 7]);

      if (dataTag === 'data' && dataSize >= 16) {
        const typeIndicator = view.getUint32(dataOffset + 8, false);
        const payload = bytes.subarray(dataOffset + 16, dataOffset + dataSize);

        if (atomType === '©nam' && !result.title) result.title = decoder.decode(payload).trim();
        else if (atomType === '©ART' && !result.artist) result.artist = decoder.decode(payload).trim();
        else if (atomType === '©alb' && !result.album) result.album = decoder.decode(payload).trim();
        else if (atomType === '©day' && !result.year) result.year = decoder.decode(payload).trim();
        else if (atomType === '©gen' && !result.genre) result.genre = decoder.decode(payload).trim();
        else if (atomType === '©lyr' && !result.lyrics) result.lyrics = decoder.decode(payload).trim();
        else if (atomType === 'covr' && !result.coverArtUrl) {
          const mime = typeIndicator === 14 ? 'image/png' : 'image/jpeg';
          result.coverArtUrl = uint8ArrayToDataUrl(payload, mime);
        }
      }
    }

    offset += size;
  }
}

/**
 * Parser for ID3v1 (last 128 bytes)
 */
async function parseID3v1(file: File, result: ParsedAudioMetadata): Promise<void> {
  const tailBuf = await file.slice(file.size - 128, file.size).arrayBuffer();
  const tailBytes = new Uint8Array(tailBuf);

  if (tailBytes[0] === 0x54 && tailBytes[1] === 0x41 && tailBytes[2] === 0x47) { // 'TAG'
    const readStr = (start: number, len: number) => {
      let str = '';
      for (let i = 0; i < len; i++) {
        const c = tailBytes[start + i];
        if (c === 0) break;
        str += String.fromCharCode(c);
      }
      return str.trim();
    };

    if (!result.title) result.title = readStr(3, 30);
    if (!result.artist) result.artist = readStr(33, 30);
    if (!result.album) result.album = readStr(63, 30);
    if (!result.year) result.year = readStr(93, 4);
  }
}
