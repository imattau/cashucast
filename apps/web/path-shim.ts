/*
 * Licensed under GPL-3.0-or-later
 * path-shim module.
 */
export const join = (...parts: string[]) => parts.join('/');
export default { join };
