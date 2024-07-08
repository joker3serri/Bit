/** Options that provide contextual information about the application state
 *  when a forwarder is invoked.
 *  @remarks these fields should always be omitted when saving options.
 */
export type RequestOptions = {
  /** @param website The domain of the website the generated email is used
   *  within. This should be set to `null` when the request is not specific
   *  to any website.
   */
  website: string | null;
};
