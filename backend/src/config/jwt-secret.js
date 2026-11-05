// backend/src/config/jwt-secret.js

const INSECURE_SECRETS = new Set([
  'secret',
  'jwtsecret',
  'jwt_secret',
  'jwt-secret',
  'changeme',
  'password',
  'default',
  'supersecret',
  'your-secret-key',
  'your_jwt_secret',
  'test',
  'development',
  '123456',
  'secretkey',
  'inventory-secret',
]);

const MIN_LENGTH = 32;

function validateJwtSecret(secret) {
  if (secret === undefined || secret === null || String(secret).trim() === '') {
    throw new Error(
      'Missing required environment variable: JWT_SECRET. Set a strong secret of at least 32 characters.'
    );
  }

  const value = String(secret);
  if (value !== value.trim()) {
    throw new Error('JWT_SECRET must not include leading or trailing whitespace.');
  }

  if (value.length < MIN_LENGTH) {
    throw new Error(`JWT_SECRET must be at least ${MIN_LENGTH} characters.`);
  }

  if (INSECURE_SECRETS.has(value.toLowerCase())) {
    throw new Error('JWT_SECRET is a known insecure default. Configure a unique random secret.');
  }

  return value;
}

module.exports = {
  validateJwtSecret,
  MIN_LENGTH,
  INSECURE_SECRETS,
};
