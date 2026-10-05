/**
 * Client-side pure TypeScript audio metadata extractor.
 * Reads ID3v2.3 / ID3v2.4 tags and extracts:
 * - Title (TIT2)
 * - Artist (TPE1)
 * - Album (TALB)
 * - Year / Date (TYER / TDRC)
 * - Embedded Album Cover Art (APIC) as a blob URL!
 */

export interface ParsedAudioMetadata {
  title?: string;
  artist?: string;
  album?: string;
  year?: string;
  coverArtUrl?: string;
}

// Decode synchsafe integer (used for ID3 sizes)
function readSynchsafeInt(view: DataView, offset: number): number {
  return (
    ((view.getUint8(offset) & 0x7f) << 21) |
    ((view.getUint8(offset + 1) & 0x7f) << 14) |
    ((view.getUint8(offset + 2) & 0x7f) << 7) |
    (view.getUint8(offset + 3) & 0x7f)
  );
}

// Decode text with proper character encoding
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

export async function parseAudioMetadata(file: File): Promise<ParsedAudioMetadata> {
  const result: ParsedAudioMetadata = {};

  try {
    // Read first 128KB of the file (sufficient for ID3v2 header & APIC art)
    const sliceSize = Math.min(file.size, 512 * 1024);
    const slice = file.slice(0, sliceSize);
    const buffer = await slice.arrayBuffer();
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    // Check for "ID3" identifier
    if (
      bytes[0] === 0x49 && // 'I'
      bytes[1] === 0x44 && // 'D'
      bytes[2] === 0x33    // '3'
    ) {
      const majorVersion = bytes[3]; // 3 for ID3v2.3, 4 for ID3v2.4
      const tagSize = readSynchsafeInt(view, 6);
      const maxOffset = Math.min(buffer.byteLength, 10 + tagSize);

      let offset = 10;

      while (offset + 10 < maxOffset) {
        // Read 4-character frame ID
        const frameId = String.fromCharCode(
          bytes[offset],
          bytes[offset + 1],
          bytes[offset + 2],
          bytes[offset + 3]
        );

        // If padding reached
        if (bytes[offset] === 0) break;

        // Frame size
        let frameSize = 0;
        if (majorVersion === 4) {
          frameSize = readSynchsafeInt(view, offset + 4);
        } else {
          frameSize = view.getUint32(offset + 4, false);
        }

        if (frameSize <= 0 || offset + 10 + frameSize > buffer.byteLength) {
          break;
        }

        const frameDataOffset = offset + 10;
        const frameData = bytes.subarray(frameDataOffset, frameDataOffset + frameSize);

        // 1. Title (TIT2)
        if (frameId === 'TIT2' && !result.title) {
          const enc = frameData[0];
          result.title = decodeText(frameData.subarray(1), enc);
        }

        // 2. Artist (TPE1)
        else if (frameId === 'TPE1' && !result.artist) {
          const enc = frameData[0];
          result.artist = decodeText(frameData.subarray(1), enc);
        }

        // 3. Album (TALB)
        else if (frameId === 'TALB' && !result.album) {
          const enc = frameData[0];
          result.album = decodeText(frameData.subarray(1), enc);
        }

        // 4. Year (TYER or TDRC)
        else if ((frameId === 'TYER' || frameId === 'TDRC') && !result.year) {
          const enc = frameData[0];
          result.year = decodeText(frameData.subarray(1), enc);
        }

        // 5. Embedded Album Cover Art (APIC)
        else if (frameId === 'APIC' && !result.coverArtUrl) {
          const encoding = frameData[0];
          let pos = 1;

          // Read MIME type string (null-terminated)
          let mime = '';
          while (pos < frameData.length && frameData[pos] !== 0) {
            mime += String.fromCharCode(frameData[pos]);
            pos++;
          }
          pos++; // skip null terminator

          // Default MIME if empty or shorthand
          if (!mime || mime.toLowerCase() === '-->') {
            mime = 'image/jpeg';
          }

          // Skip picture type byte (1 byte, e.g. 0x03 for front cover)
          pos++;

          // Skip description string (null-terminated according to encoding)
          if (encoding === 0 || encoding === 3) {
            while (pos < frameData.length && frameData[pos] !== 0) pos++;
            pos++;
          } else {
            // UTF-16 (double null)
            while (pos + 1 < frameData.length && !(frameData[pos] === 0 && frameData[pos + 1] === 0)) {
              pos += 2;
            }
            pos += 2;
          }

          // The remainder of the frame data is the raw image!
          if (pos < frameData.length) {
            const imageBytes = frameData.subarray(pos);
            const imageBlob = new Blob([imageBytes], { type: mime });
            result.coverArtUrl = URL.createObjectURL(imageBlob);
          }
        }

        offset += 10 + frameSize;
      }
    }
  } catch (err) {
    console.warn('Could not extract ID3 metadata:', err);
  }

  return result;
}
