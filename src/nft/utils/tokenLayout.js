
import * as BufferLayout from 'buffer-layout';

export const MINT_LAYOUT = BufferLayout.struct([
    BufferLayout.blob(44),
    BufferLayout.u8('decimals'),
    BufferLayout.blob(37),
  ]);
  