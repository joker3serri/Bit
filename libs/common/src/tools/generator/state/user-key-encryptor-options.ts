/** Configuration for a `UserKeyEncryptor` */
export type UserKeyEncryptorOptions = {
  /** The size of the dataframe used to pad encrypted values.
   *  The string is padded to a multiple of the frame size before encryption.
   */
  frameSize: number;
};
