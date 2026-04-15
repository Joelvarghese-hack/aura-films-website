/* Color Palette Studio © 2026 Joel Varghese. All rights reserved.
   Unauthorized copying or distribution is prohibited. */

/**
 * export.js — Export engine
 * Handles ASE (Adobe Swatch Exchange) binary format generation.
 * All other export formats live in app.js for simplicity.
 * Depends on: colorUtils.js
 */

const ExportEngine = (() => {

  /**
   * Generate an ASE (Adobe Swatch Exchange) binary file from a palette array.
   * Each color in palette: { hex, role }
   *
   * ASE File Structure (big-endian):
   *   Header:  4 bytes magic "ASEF"
   *            2 bytes version major (1)
   *            2 bytes version minor (0)
   *            4 bytes number of blocks
   *   Blocks:  2 bytes block type (0x0001 = color entry, 0xC001 = group start, 0xC002 = group end)
   *            4 bytes block length
   *            [block data]
   *
   *   Color Block Data:
   *            2 bytes name length (characters + 1 for null)
   *            N * 2 bytes name (UTF-16BE, null-terminated)
   *            4 bytes color model ("RGB ")
   *            4 bytes R (float32)
   *            4 bytes G (float32)
   *            4 bytes B (float32)
   *            2 bytes color type (0 = global, 1 = spot, 2 = normal)
   */
  function buildASE(palette) {
    const blocks = [];

    palette.forEach(color => {
      const rgb = ColorUtils.hexToRgb(color.hex);
      if (!rgb) return;

      const name = (color.role !== '—' ? color.role + ' ' : '') + color.hex;
      // UTF-16BE encode name + null terminator
      const nameChars = name.split('');
      const nameLen = nameChars.length + 1; // +1 for null

      // Block data size:
      // 2 (name len) + nameLen*2 (UTF-16BE) + 4 (model) + 12 (3 floats) + 2 (type) = 20 + nameLen*2
      const dataSize = 2 + nameLen * 2 + 4 + 12 + 2;

      const block = new ArrayBuffer(2 + 4 + dataSize); // type + length + data
      const view = new DataView(block);
      let offset = 0;

      view.setUint16(offset, 0x0001, false); offset += 2; // color entry block type
      view.setUint32(offset, dataSize, false); offset += 4; // block length

      view.setUint16(offset, nameLen, false); offset += 2; // name length

      // Name in UTF-16BE
      for (let i = 0; i < nameChars.length; i++) {
        view.setUint16(offset, nameChars[i].charCodeAt(0), false);
        offset += 2;
      }
      view.setUint16(offset, 0x0000, false); offset += 2; // null terminator

      // Color model "RGB " as 4 ASCII bytes
      view.setUint8(offset, 0x52); offset++; // R
      view.setUint8(offset, 0x47); offset++; // G
      view.setUint8(offset, 0x42); offset++; // B
      view.setUint8(offset, 0x20); offset++; // space

      // R, G, B as float32 (0.0–1.0)
      view.setFloat32(offset, rgb.r / 255, false); offset += 4;
      view.setFloat32(offset, rgb.g / 255, false); offset += 4;
      view.setFloat32(offset, rgb.b / 255, false); offset += 4;

      // Color type: 2 = normal
      view.setUint16(offset, 0x0002, false); offset += 2;

      blocks.push(block);
    });

    // Calculate total file size
    const headerSize = 12; // "ASEF" + 4 version bytes + 4 block count bytes
    const totalSize = headerSize + blocks.reduce((acc, b) => acc + b.byteLength, 0);

    const file = new ArrayBuffer(totalSize);
    const fileView = new DataView(file);
    let pos = 0;

    // Header
    fileView.setUint8(pos, 0x41); pos++; // A
    fileView.setUint8(pos, 0x53); pos++; // S
    fileView.setUint8(pos, 0x45); pos++; // E
    fileView.setUint8(pos, 0x46); pos++; // F
    fileView.setUint16(pos, 0x0001, false); pos += 2; // version major
    fileView.setUint16(pos, 0x0000, false); pos += 2; // version minor
    fileView.setUint32(pos, blocks.length, false); pos += 4; // block count

    // Write blocks
    const fileBytes = new Uint8Array(file);
    blocks.forEach(block => {
      fileBytes.set(new Uint8Array(block), pos);
      pos += block.byteLength;
    });

    return file;
  }

  /**
   * Trigger a browser download of the ASE file.
   */
  function downloadASE(palette) {
    if (!palette || palette.length === 0) return;
    const buffer = buildASE(palette);
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'palette.ase';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return { buildASE, downloadASE };

})();
