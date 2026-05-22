const crypto = require('crypto');

const SESSION_TTL_SECONDS = 2 * 60 * 60;

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value || '')).digest('hex');
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { ok: false, error: 'method-not-allowed' });
  }

  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const expectedPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!expectedUsername || (!expectedPassword && !expectedPasswordHash)) {
    return json(503, { ok: false, error: 'admin-auth-not-configured' });
  }

  let payload = {};
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { ok: false, error: 'invalid-json' });
  }

  const username = String(payload.username || '').trim();
  const password = String(payload.password || '');
  const passwordOk = expectedPasswordHash
    ? safeEqual(sha256(password), expectedPasswordHash)
    : safeEqual(password, expectedPassword);

  if (!safeEqual(username, expectedUsername) || !passwordOk) {
    return json(401, { ok: false, error: 'invalid-credentials' });
  }

  return json(200, {
    ok: true,
    session: crypto.randomBytes(32).toString('hex'),
    expiresIn: SESSION_TTL_SECONDS
  });
};
