import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts a string using AES-256-GCM
 * Returns a string in the format: iv:authTag:encryptedData
 */
export function encrypt(text: string): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    // If no key is provided, we return the original text to prevent breaking the app during dev
    // but in production this should throw an error.
    console.warn("No ENCRYPTION_KEY found. Storing data in plaintext!");
    return text;
  }

  // Ensure key is 32 bytes (64 hex characters)
  const encryptionKey = Buffer.from(key, 'hex');
  if (encryptionKey.length !== 32) {
    throw new Error('Encryption key must be 32 bytes (64 hex characters)');
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a string formatted as iv:authTag:encryptedData
 */
export function decrypt(encryptedText: string): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) return encryptedText;

  const parts = encryptedText.split(':');
  if (parts.length !== 3) {
    // If not in our encrypted format, it's likely old plaintext data
    return encryptedText;
  }

  const [ivHex, authTagHex, encryptedDataHex] = parts;
  const encryptionKey = Buffer.from(key, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
  decipher.setAuthTag(authTag);
  
  try {
    let decrypted = decipher.update(encryptedDataHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error("Decryption failed:", err);
    return encryptedText; // Fallback to original if decryption fails (e.g. wrong key on old data)
  }
}
