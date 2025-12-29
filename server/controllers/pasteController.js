import Paste from "../models/Paste.js";

// ❤️ Health Check
export const healthCheck = async (req, res) => {
  return res.status(200).json({ ok: true });
};

// ✍️ Create Paste
export const createPaste = async (req, res) => {
  try {
    const { content, ttl_seconds, max_views } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Content is required" });
    }

    const expiresAt = ttl_seconds
      ? new Date(Date.now() + ttl_seconds * 1000)
      : null;

    const paste = await Paste.create({
      content,
      expiresAt,
      maxViews: max_views || null,
      remainingViews: max_views || null
    });

    res.status(201).json({
      id: paste._id,
      url: `${process.env.CLIENT_URL}/p/${paste._id}`
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// 📥 Get Paste
export const getPaste = async (req, res) => {
  try {
    const paste = await Paste.findById(req.params.id);
    if (!paste) {
      return res.status(404).json({ error: "Paste not found" });
    }

    // Deterministic time (for tests)
    const now =
      process.env.TEST_MODE === "1" && req.headers["x-test-now-ms"]
        ? Number(req.headers["x-test-now-ms"])
        : Date.now();

    // TTL check
    if (paste.expiresAt && now > paste.expiresAt.getTime()) {
      return res.status(404).json({ error: "Paste expired" });
    }

    // View limit check
    if (paste.remainingViews !== null) {
      if (paste.remainingViews <= 0) {
        return res.status(404).json({ error: "View limit exceeded" });
      }
      paste.remainingViews -= 1;
      await paste.save();
    }

    res.status(200).json({
      content: paste.content,
      remaining_views: paste.remainingViews,
      expires_at: paste.expiresAt
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};


export const viewPasteHTML = async (req, res) => {
  try {
    const paste = await Paste.findById(req.params.id);

    if (!paste) {
      return res.status(404).send("Paste not found");
    }

    const now =
      process.env.TEST_MODE === "1" && req.headers["x-test-now-ms"]
        ? Number(req.headers["x-test-now-ms"])
        : Date.now();

    // Expiry check
    if (paste.expiresAt && now > paste.expiresAt.getTime()) {
      return res.status(404).send("Paste expired");
    }

    // View limit check
    if (paste.remainingViews !== null) {
      if (paste.remainingViews <= 0) {
        return res.status(404).send("View limit exceeded");
      }
      paste.remainingViews -= 1;
      await paste.save();
    }

    // 🔐 SAFE ESCAPING (VERY IMPORTANT)
    const safeContent = paste.content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // 🎨 STYLED HTML RESPONSE
    res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>View Paste - Pastebin Lite</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    pre { font-family: 'Fira Code', monospace; }
    .code-block {
      background: #1e293b;
      color: #e2e8f0;
      border-radius: 12px;
      padding: 1.5rem;
      overflow-x: auto;
      line-height: 1.6;
      font-size: 14px;
    }
  </style>
</head>

<body class="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen flex items-center justify-center px-4">
<div class="max-w-3xl w-full mx-auto fade-in">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Pastebin Lite</h1>
      <p class="text-gray-600">Viewing shared paste</p>
    </div>

    <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
        <h2 class="text-white font-semibold text-lg text-center">Paste Content</h2>
      </div>

      <div class="p-6   ">
        <pre class="code-block text-center text-2xl">${safeContent}</pre>
      </div>

    </div>
  </div>
</body>
</html>
    `);

  } catch (error) {
    res.status(404).send("Paste not found");
  }
};
