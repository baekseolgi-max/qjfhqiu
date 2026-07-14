const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TABLE_NAME = "lotto_draws";

async function requestSupabase(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = new Error("Supabase request failed");
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

module.exports = async (req, res) => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({
      error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.",
    });
  }

  if (req.method === "GET") {
    try {
      const draws = await requestSupabase(
        `/rest/v1/${TABLE_NAME}?select=id,created_at,count,tickets&order=created_at.desc&limit=10`
      );
      return res.status(200).json({ draws: draws || [] });
    } catch (error) {
      return res.status(error.status || 500).json({
        error: "Could not load draws from Supabase.",
        detail: error.payload || null,
      });
    }
  }

  if (req.method === "POST") {
    try {
      const { count, tickets } = req.body || {};
      if (!Number.isInteger(count) || count < 1 || count > 10) {
        return res.status(400).json({ error: "count must be an integer between 1 and 10." });
      }
      if (!Array.isArray(tickets) || tickets.length !== count) {
        return res.status(400).json({ error: "tickets must be an array with count items." });
      }

      const normalizedTickets = tickets.map((ticket) => {
        if (!Array.isArray(ticket) || ticket.length !== 6) {
          throw new Error("Each ticket must contain 6 numbers.");
        }
        return ticket;
      });

      const [saved] = await requestSupabase(`/rest/v1/${TABLE_NAME}`, {
        method: "POST",
        headers: {
          Prefer: "return=representation",
        },
        body: JSON.stringify([{ count, tickets: normalizedTickets }]),
      });

      return res.status(201).json({ draw: saved });
    } catch (error) {
      return res.status(500).json({
        error: "Could not save draw to Supabase.",
        detail: error.payload || error.message,
      });
    }
  }

  return res.status(405).json({ error: "Method not allowed." });
};
