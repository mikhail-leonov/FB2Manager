let total = null, processed = 0;
let currentReader = null;
let heartbeatInterval = null;
let lastDataTime = null;
let isStalled = false;
let reconnecting = false;

let skipCounts = {
  duplicate: 0,
  language: 0,
  genre: 0,
  author: 0,
  encoding: 0
};

let imported = 0;

function updateSkipDisplay(category, value) {
  const element = document.getElementById(`skip${category.charAt(0).toUpperCase() + category.slice(1)}`);
  if (element) {
    element.textContent = value;
    element.style.transform = 'scale(1.1)';
    setTimeout(() => { element.style.transform = 'scale(1)'; }, 200);
  }
}

function updateProcessedDisplay() {
  document.getElementById('cntProcessed').textContent = processed;
}

function appendLog(line) {
  const box = document.getElementById('logBox');
  if (!box) return;

  const span = document.createElement('span');
  span.className = 'log-line';

  if (line.includes('BATCH') || line.includes('====')) {
    span.style.color = '#00ff9d';
  } else if (line.includes('Skip Code: 0') || line.includes('IMPORTED')) {
    span.style.color = '#00ff9d';
  } else if (line.match(/Skip Code: [1-9]/) || line.includes('Skip Reason:')) {
    span.style.color = '#ffd700';
  } else if (line.includes('Error:') || line.includes('Failed')) {
    span.style.color = '#ff4444';
  } else if (line.includes('File:') || line.includes('Index:')) {
    span.style.color = '#00bfff';
  } else if (line.includes('Author:') || line.includes('Genre:') || line.includes('Serie:')) {
    span.style.color = '#9d9dff';
  } else if (line.includes('Progress:') || line.includes('completed')) {
    span.style.color = '#ff9d00';
  } else if (line.startsWith('//')) {
    span.style.color = '#2a3a2a';
  } else {
    span.style.color = '#888';
  }

  span.textContent = line + '\n';
  box.appendChild(span);

  while (box.children.length > 300) {
    box.removeChild(box.firstChild);
  }

  setTimeout(() => {
    box.scrollTop = box.scrollHeight;
  }, 10);
}

function getSkipCategory(code) {
  if (code === 1) return 'duplicate';
  if (code === 2 || code === 3) return 'language';
  if (code === 4 || code === 5) return 'encoding';
  if (code === 6 || code === 7) return 'genre';
  if (code === 8) return 'author';
  return null;
}

function parseLine(line) {
  const mTotal = line.match(/^Found (\d+) files/);
  if (mTotal) {
    total = parseInt(mTotal[1]);
    document.getElementById('cntTotal').textContent = total;
    updateProcessedDisplay();
    return;
  }

  const skipCodeMatch = line.match(/Skip Code:\s*(\d+)/);
  if (skipCodeMatch) {
    const code = parseInt(skipCodeMatch[1]);

    if (code === 0) {
      imported++;
      document.getElementById('cntImported').textContent = imported;
    } else {
      const category = getSkipCategory(code);
      if (category && skipCounts[category] !== undefined) {
        skipCounts[category]++;
        updateSkipDisplay(category, skipCounts[category]);
      }
    }

    processed = imported + Object.values(skipCounts).reduce((a, b) => a + b, 0);
    updateProcessedDisplay();
  }

  appendLog(line);
}

function resetStats() {
  imported = 0;
  processed = 0;
  total = null;

  skipCounts = {
    duplicate: 0,
    language: 0,
    genre: 0,
    author: 0,
    encoding: 0
  };

  document.getElementById('cntImported').textContent = '0';
  document.getElementById('cntProcessed').textContent = '0';
  document.getElementById('cntTotal').textContent = '0';
  document.getElementById('skipDuplicate').textContent = '0';
  document.getElementById('skipLanguage').textContent = '0';
  document.getElementById('skipGenre').textContent = '0';
  document.getElementById('skipAuthor').textContent = '0';
  document.getElementById('skipEncoding').textContent = '0';
}

/* =========================
   STREAM CONNECTION
========================= */

async function connectStream() {
  const resp = await fetch('/import-stream');
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

  const reader = resp.body.getReader();
  currentReader = reader;

  const decoder = new TextDecoder();
  let buf = '';

  while (true) {
    const { value, done } = await reader.read();

    // IMPORTANT: update time on ANY chunk
    lastDataTime = Date.now();

    if (done) {
      appendLog('[info] Stream ended');
      break;
    }

    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop();

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;

      const msg = line.slice(5).trim();

      if (msg === '[PING]') continue; // heartbeat ignore

      if (msg === '[DONE]') {
        appendLog('[info] Import finished');
        return;
      }

      parseLine(msg);
    }
  }
}

/* =========================
   RECONNECT LOGIC
========================= */

async function reconnect() {
  if (reconnecting) return;
  reconnecting = true;

  appendLog('[warn] Reconnecting to stream...');

  try {
    if (currentReader) {
      await currentReader.cancel().catch(() => {});
      currentReader = null;
    }

    await connectStream();

    appendLog('[ok] Reconnected');
    isStalled = false;

  } catch (e) {
    appendLog('[error] Reconnect failed: ' + e.message);

    setTimeout(() => {
      reconnecting = false;
      reconnect();
    }, 5000);

    return;
  }

  reconnecting = false;
}

/* =========================
   MAIN ENTRY
========================= */

async function startImport() {
  const btn = document.getElementById('importBtn');

  if (currentReader) {
    try {
      await currentReader.cancel();
    } catch (e) {}
    currentReader = null;
  }

  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }

  btn.disabled = true;
  document.getElementById('btnLabel').textContent = 'Running…';

  document.getElementById('logBox').innerHTML =
    '<span style="color:#2a3a2a">// Import started...\n</span>';

  resetStats();

  lastDataTime = Date.now();
  isStalled = false;

  /* ===== WATCHDOG ===== */
  heartbeatInterval = setInterval(() => {
    const delta = Date.now() - lastDataTime;

    if (delta > 60000 && !isStalled) {
      isStalled = true;
      appendLog('[warn] No data for 60s — trying reconnect...');
      reconnect();
    }

    if (delta > 180000) {
      appendLog('[error] No data for 3 minutes — still retrying...');
      reconnect();
    }

    if (delta > 360000) {
      appendLog('[error] No data for 6 minutes — still retrying...');
      reconnect();
    }

  }, 10000);

  try {
    await connectStream();

  } catch (e) {
    appendLog('[error] ' + e.message);
  } finally {
    clearInterval(heartbeatInterval);
    currentReader = null;
    btn.disabled = false;
    document.getElementById('btnLabel').textContent = 'Run Import';
  }
}