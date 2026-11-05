// 智能任务管理系统 —— Node.js + Express + Supabase
const express = require("express");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// ====== Supabase 配置（二选一）======
// 方式1（推荐）：在 Vercel 的 Environment Variables 中配置 SUPABASE_URL / SUPABASE_ANON_KEY
// 方式2：直接把下面两个引号里的内容替换成你自己的 Project URL 和 anon public key
const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://pumyqonjbkhgltcsybhw.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_N11mba_kBYN6BFNdT4_vQw_e1-ogclY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 查询全部任务（按创建时间倒序）
app.get("/api/tasks", async (req, res) => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 新增任务
app.post("/api/tasks", async (req, res) => {
  const { title, priority } = req.body || {};
  if (!title || !String(title).trim()) {
    return res.status(400).json({ error: "任务标题不能为空" });
  }
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: String(title).trim(),
      priority: priority || "中",
      completed: false,
    })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 切换完成状态
app.patch("/api/tasks/:id", async (req, res) => {
  const { completed } = req.body || {};
  const { data, error } = await supabase
    .from("tasks")
    .update({ completed: !!completed })
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 删除任务
app.delete("/api/tasks/:id", async (req, res) => {
  const { error } = await supabase.from("tasks").delete().eq("id", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`服务已启动: http://localhost:${port}`));
