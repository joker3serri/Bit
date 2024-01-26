/** Settings supported when generating an ASCII username */
export type EffLongWordGenerationOptions = {
  wordCapitalize?: boolean;
  wordIncludeNumber?: boolean;
};

/** The default options for EFF long word generation. */
export const DefaultEffLongWordOptions: Partial<EffLongWordGenerationOptions> = Object.freeze({
  wordCapitalize: false,
  wordIncludeNumber: false,
});
