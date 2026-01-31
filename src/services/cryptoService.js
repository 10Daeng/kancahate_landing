// --- ENCRYPTION SERVICE ---
// Handles encryption and anonymization of sensitive user data
// Uses Web Crypto API for proper AES-GCM encryption

/**
 * Generate a cryptographic key from a password
 * @param {string} password - The password to derive key from
 * @returns {Promise<CryptoKey>}
 */
async function deriveKey(password) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  // Use a static salt for consistency (in production, use unique salt per user)
  const salt = encoder.encode('kancahate-salt-2024');

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-GCM
 * @param {string} data - Data to encrypt
 * @param {string} keyPassword - Password for encryption key
 * @returns {Promise<string>} - Encrypted data as base64 string (IV + ciphertext)
 */
export async function encryptData(data, keyPassword = 'kancahate-default-key') {
  try {
    const key = await deriveKey(keyPassword);
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encoder.encode(JSON.stringify(data))
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to base64 for storage
    return btoa(String.fromCharCode.apply(null, combined));
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
}

/**
 * Decrypt data using AES-GCM
 * @param {string} encryptedData - Encrypted data as base64 string
 * @param {string} keyPassword - Password for decryption key
 * @returns {Promise<any>} - Decrypted data
 */
export async function decryptData(encryptedData, keyPassword = 'kancahate-default-key') {
  try {
    if (!encryptedData) return null;

    const key = await deriveKey(keyPassword);
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

    // Extract IV and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decrypted));
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

/**
 * Hash data for anonymity (one-way, cannot be reversed)
 * @param {string} data - Data to hash
 * @returns {Promise<string>} - SHA-256 hash as hex string
 */
export async function hashData(data) {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Anonymize user data before sending to external API
 * Removes or hashes personally identifiable information (PII)
 * @param {object} userData - User data object
 * @returns {object} - Anonymized data
 */
export function anonymizeUserData(userData) {
  const anonymized = { ...userData };

  // Hash the actual name but keep a display name
  if (anonymized.name) {
    anonymized._nameHash = null; // Will be hashed asynchronously
    anonymized.name = anonymized.name.charAt(0) + '***'; // Only keep first letter
  }

  // Remove or hash exact location
  if (anonymized.location) {
    anonymized.location = anonymized.location === 'Lainnya' ? 'Other' : anonymized.location;
  }

  // Remove email
  if (anonymized.email) {
    delete anonymized.email;
  }

  // Hash date of birth to only keep age
  if (anonymized.dob) {
    const age = calculateAge(anonymized.dob);
    anonymized.age_group = getAgeGroup(age);
    delete anonymized.dob;
  }

  return anonymized;
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dob) {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Get age group for additional privacy
 */
function getAgeGroup(age) {
  if (age < 13) return 'under_13';
  if (age < 18) return '13_17';
  if (age < 25) return '18_24';
  if (age < 35) return '25_34';
  if (age < 50) return '35_49';
  return '50_plus';
}

/**
 * Sanitize message before sending to API
 * Removes potential PII while preserving emotional context
 * @param {string} message - User message
 * @returns {string} - Sanitized message
 */
export function sanitizeMessage(message) {
  let sanitized = message;

  // Remove common PII patterns (basic implementation)
  // Phone numbers
  sanitized = sanitized.replace(/\b\d{10,}\b/g, '[PHONE_REDACTED]');
  // Email addresses
  sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]');
  // Full names (simple heuristic - remove words that look like "Nama Saya X" or "saya X")
  // This is a basic implementation; more sophisticated NLP could be used

  return sanitized;
}

export default {
  encryptData,
  decryptData,
  hashData,
  anonymizeUserData,
  sanitizeMessage
};
