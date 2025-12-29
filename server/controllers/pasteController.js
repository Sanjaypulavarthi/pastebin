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

    // ✅ SAFE HTML RESPONSE
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>View Paste</title>
        </head>
        <body>
          <h2>Paste Content</h2>
          <pre>${paste.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(404).send("Paste not found");
  }
};
