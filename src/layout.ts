// @flow
//@ts-ignore
import * as BufferLayout from 'buffer-layout';

/**
 * Layout for a public key
 */
export const publicKey = (property: string = 'publicKey'): Object => {
  return BufferLayout.blob(32, property);
};

/**
 * Layout for a 64bit unsigned value
 */
export const uint64 = (property: string = 'uint64'): Object => {
  return BufferLayout.blob(8, property);
};

export const uint8 = (property: string = 'uint8'): Object => {
  return BufferLayout.blob(1, property);
};

export const uint32 = (property: string = 'uint32'): Object => {
  return BufferLayout.blob(4, property);
};