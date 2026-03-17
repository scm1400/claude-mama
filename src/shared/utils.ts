/** Convert a local skin file path to a skin:// protocol URL for secure loading in renderer.
 *  Only the filename is used — the protocol handler resolves from the skins directory. */
export function toFileUrl(p: string): string {
  const fileName = p.replace(/\\/g, '/').split('/').pop() || '';
  return 'skin://local/' + encodeURIComponent(fileName);
}
