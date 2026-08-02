// api/submit-lead.js
// Vercel serverless function — receives lead from contact form, writes to dashboard-data repo

const GH_USER = 'JustPatrickG';
const GH_REPO = 'dashboard-data';
const GH_FILE = 'db.json';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.GH_TOKEN;
  if (!token) return res.status(500).json({ error: 'Server misconfigured' });

  try {
    const lead = req.body;
    if (!lead || !lead.id) return res.status(400).json({ error: 'Invalid lead data' });

    // GET current db.json
    const getRes = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${GH_FILE}`, {
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }
    });

    let DB = { clients: [], editors: ['Unassigned'], leads: [] };
    let sha = null;

    if (getRes.ok) {
      const j = await getRes.json();
      sha = j.sha;
      DB = JSON.parse(Buffer.from(j.content, 'base64').toString('utf8'));
      if (!DB.leads) DB.leads = [];
    }

    // Upsert lead by sessionId
    const existing = DB.leads.findIndex(l => l.sessionId === lead.sessionId);
    if (existing >= 0) {
      DB.leads[existing] = { ...DB.leads[existing], ...lead };
    } else {
      DB.leads.unshift(lead);
    }

    // PUT updated db.json
    const body = {
      message: `lead: ${lead.name || 'unknown'} ${new Date().toISOString()}`,
      content: Buffer.from(JSON.stringify(DB)).toString('base64'),
    };
    if (sha) body.sha = sha;

    const putRes = await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${GH_FILE}`, {
      method: 'PUT',
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!putRes.ok) {
      const err = await putRes.text();
      throw new Error('GitHub PUT failed: ' + err);
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
