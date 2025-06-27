
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const app = express();

// Enable CORS for all origins (dev only)
app.use(cors());
app.options("*", cors());

app.use(express.json());

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── Meetings CRUD ────────────────────────────────────────────────────────────

// GET all meetings
app.get("/api/meetings", async (req, res) => {
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .order("start_time", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST new meeting
app.post("/api/meetings", async (req, res) => {
  try {
    const { title, description, start_time, meet_url, chef_id } = req.body;
    if (!title || !start_time || !meet_url || !chef_id) {
      return res
        .status(400)
        .json({ error: "Missing title, start_time, meet_url, or chef_id" });
    }
    const { data, error } = await supabase
      .from("meetings")
      .insert([{ title, description, start_time, meet_url, chef_id }])
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT update meeting
app.put("/api/meetings/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, start_time, meet_url } = req.body;
  const { data, error } = await supabase
    .from("meetings")
    .update({ title, description, start_time, meet_url })
    .eq("id", id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE meeting
app.delete("/api/meetings/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("meetings").delete().eq("id", id);
  if (error) return res.status(500).json({ error: error.message });
  res.sendStatus(204);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
