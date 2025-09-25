/**
 * Utilitários de criptografia para hash de senhas usando Web Crypto API
 */

export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
  
  return hashHex.toLowerCase();
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  const hashOfPlain = await sha256(plainPassword);
  return hashOfPlain === hashedPassword;
}