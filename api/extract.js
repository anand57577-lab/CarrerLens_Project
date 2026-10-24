
const pdfParse = require("pdf-parse");

const MAX_BYTES = 3 * 1024 * 1024;
const MAX_TEXT = 20000;

function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  // Simple endpoint health check
  if (req.method === "GET") {
    return res.status(200).json({
      status: "ok",
      message: "Node.js PDF extraction endpoint ready"
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return sendError(res, 405, "Method not allowed.");
  }

  try {
    const body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || {};

    const filename = String(body.filename || "");
    const encoded = body.data;

    if (!filename.toLowerCase().endsWith(".pdf")) {
      return sendError(res, 415, "Please upload a PDF file.");
    }

    if (typeof encoded !== "string" || !encoded.length) {
      return sendError(res, 400, "PDF data is missing.");
    }

    // Reject oversized base64 data before decoding it.
    if (encoded.length > Math.ceil(MAX_BYTES / 3) * 4 + 8) {
      return sendError(res, 413, "PDF must be 3 MB or smaller.");
    }

    if (!/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)) {
      return sendError(res, 400, "Invalid PDF upload data.");
    }

    const buffer = Buffer.from(encoded, "base64");

    if (buffer.length > MAX_BYTES) {
      return sendError(res, 413, "PDF must be 3 MB or smaller.");
    }

    if (!buffer.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
      return sendError(
        res,
        415,
        "The uploaded file does not appear to be a valid PDF."
      );
    }

    const result = await pdfParse(buffer, {
      max: 25
    });

    const pages = result.numpages || 0;

    if (pages > 25) {
      return sendError(res, 413, "PDF must have 25 pages or fewer.");
    }

    const text = String(result.text || "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
      .slice(0, MAX_TEXT);

    if (text.length < 40) {
      return sendError(
        res,
        422,
        "No selectable text found. This may be a scanned PDF. Use OCR or paste the resume text manually."
      );
    }

    return res.status(200).json({
      text,
      pages,
      characters: text.length
    });
  } catch (error) {
    console.error("PDF extraction failed:", error.message);

    return sendError(
      res,
      422,
      "Could not read this PDF. Try exporting it again as a text-based PDF."
    );
  }
};
