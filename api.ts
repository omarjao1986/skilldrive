
let API_BASE = 'http://10.0.2.2:4000'; // Android emulator local
let TOKEN: string | null = null;

export function setApiBase(v: string) { API_BASE = v; }
export function setToken(t: string | null) { TOKEN = t; }
export async function getToken() { return TOKEN; }

async function request(path: string, method: string = 'GET', body?: any) {
  const headers: any = { 'Content-Type': 'application/json' };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || 'API error');
  }
  return res.json();
}

export function apiGet(path: string) { return request(path, 'GET'); }
export function apiPost(path: string, body: any) { return request(path, 'POST', body); }
