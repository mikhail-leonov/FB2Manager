function renderFb2ToHtml(buffer) {
    const json = parser.parse(buffer.toString("utf8"));

    const body = json?.FictionBook?.body;
    if (!body) return "<p>No content found.</p>";

    const bodies = Array.isArray(body) ? body : [body];
    return bodies.map(b => nodesToHtml(b)).join("\n");
}