import crypto from 'crypto';

export const COOKIE_NAME = 'gl-admin-auth';

const RESET_PASSWORD_HASH = '736c5d641814992057ee6fbcc82be0871415df08557ff05f9208809c889787a1';
const AUTH_COOKIE_VALUE = crypto
  .createHash('sha256')
  .update(RESET_PASSWORD_HASH + 'gl-admin-salt')
  .digest('hex');

export function isAdminAuthed(cookieValue: string | undefined): boolean {
  return cookieValue === AUTH_COOKIE_VALUE;
}

export { AUTH_COOKIE_VALUE };
