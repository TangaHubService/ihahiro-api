if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = require('crypto');
} else if (typeof globalThis.crypto.randomUUID !== 'function') {
  globalThis.crypto.randomUUID = require('crypto').randomUUID;
}
