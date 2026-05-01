  let total = null, processed = 0;
  let currentReader = null;
  let heartbeatInterval = null;
  let lastDataTime = null;
  
  // Skip counters for 5 categories
  let skipCounts = {
    duplicate: 0,
    language: 0,
    genre: 0,
    author: 0,
    encoding: 0
  };
  let imported = 0;

  function setStatus(s, label) {
    const b = document.getElementById('statusBadge');
    b.className = s;
    b.textContent = label;
  }

  function updateSkipDisplay(category, value) {
    const element = document.getElementById(`skip${category.charAt(0).toUpperCase() + category.slice(1)}`);
    if (element) {
      element.textContent = value;
      // Flash effect
      element.style.transform = 'scale(1.1)';
      setTimeout(() => { element.style.transform = 'scale(1)'; }, 200);
    }
  }

  function updateProcessedDisplay() {
    document.getElementById('cntProcessed').textContent = processed;
    if (total && total > 0) {
      const pct = Math.min(100, Math.round((processed / total) * 100));
      document.getElementById('progressFill').style.width = pct + '%';
      document.getElementById('progressPct').textContent = pct + '%';
      document.getElementById('progressText').textContent = `Processing ${processed} / ${total}`;
    }
  }

  function appendLog(line) {
    const box = document.getElementById('logBox');
    const span = document.createElement('span');
    span.className = 'log-line';

    // Apply colors based on content
    if (line.includes('BATCH') || line.includes('====')) {
        span.style.color = '#00ff9d'; // Bright green for batch headers
    } else if (line.includes('Skip Code: 0') || line.includes('IMPORTED')) {
        span.style.color = '#00ff9d'; // Green for success
    } else if (line.match(/Skip Code: [1-9]/) || line.includes('Skip Reason:')) {
        span.style.color = '#ffd700'; // Yellow for skips
    } else if (line.includes('Error:') || line.includes('Failed')) {
        span.style.color = '#ff4444'; // Red for errors
    } else if (line.includes('File:') || line.includes('Index:')) {
        span.style.color = '#00bfff'; // Cyan for file info
    } else if (line.includes('Author:') || line.includes('Genre:') || line.includes('Serie:')) {
        span.style.color = '#9d9dff'; // Purple for metadata
    } else if (line.includes('Progress:') || line.includes('completed')) {
        span.style.color = '#ff9d00'; // Orange for progress
    } else if (line.startsWith('//')) {
        span.style.color = '#2a3a2a'; // Dim for comments
    } else {
        span.style.color = '#888'; // Default gray
    }

    span.textContent = line + '\n';
    box.appendChild(span);
    while (box.children.length > 300) {
      box.removeChild(box.firstChild);
    }
    box.scrollTop = box.scrollHeight;
  }

  // Map skip codes to categories
  function getSkipCategory(code) {
    // Code 1: Duplicate
    if (code === 1) return 'duplicate';
    // Codes 2-3: Language
    if (code === 2 || code === 3) return 'language';
    // Codes 4-5: Encoding
    if (code === 4 || code === 5) return 'encoding';
    // Codes 6-7: Genre
    if (code === 6 || code === 7) return 'genre';
    // Code 8: Author
    if (code === 8) return 'author';
    // Codes 9-11: Other (not displayed in badges)
    return null;
  }

  function parseLine(line) {
    // Parse total files found
    const mTotal = line.match(/^Found (\d+) files/);
    if (mTotal) { 
      total = parseInt(mTotal[1]); 
      document.getElementById('cntTotal').textContent = total;
      updateProcessedDisplay();
      return; 
    }

    // Parse SKIP CODE
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
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('progressPct').textContent = '0%';
    document.getElementById('progressText').textContent = 'Processing...';
  }

  async function startImport() {
    const btn = document.getElementById('importBtn');
    
    if (currentReader) {
      try {
        await currentReader.cancel();
      } catch (e) {
        console.error('Error canceling reader:', e);
      }
      currentReader = null;
    }
    
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
    
    btn.disabled = true;
    document.getElementById('btnLabel').textContent = 'Running…';

    document.getElementById('logBox').innerHTML = '<span style="color:#2a3a2a">// Import started...\n</span>';
    document.getElementById('progressWrap').classList.add('visible');
    
    resetStats();
    
    lastDataTime = Date.now();

    heartbeatInterval = setInterval(() => {
      if (lastDataTime && (Date.now() - lastDataTime) > 45000) {
        appendLog('[warn] Connection stalled - no data for 45 seconds');
        if (currentReader) {
          currentReader.cancel();
        }
      }
    }, 10000);

    try {
      const resp = await fetch('/import-stream');
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      
      const reader = resp.body.getReader();
      currentReader = reader;
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        lastDataTime = Date.now();
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop();
        
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const msg = line.slice(5).trim();
          if (msg === '[DONE]') {
            await reader.cancel();
            currentReader = null;
            break;
          }
          parseLine(msg);
        }
      }

      // Update final summary
      document.getElementById('sumImported').textContent = imported;
      document.getElementById('sumDuplicate').textContent = skipCounts.duplicate;
      document.getElementById('sumLanguage').textContent = skipCounts.language;
      document.getElementById('sumGenre').textContent = skipCounts.genre;
      document.getElementById('sumAuthor').textContent = skipCounts.author;
      document.getElementById('sumEncoding').textContent = skipCounts.encoding;
      document.getElementById('summaryBox').classList.add('visible');
      document.getElementById('progressFill').style.width = '100%';
      document.getElementById('progressPct').textContent = '100%';
      
      setStatus('done', 'done');

    } catch (e) {
      if (e.name !== 'AbortError') {
        appendLog('Error: ' + e.message);
        setStatus('error', 'error');
      } else {
        appendLog('[warn] Import cancelled');
        setStatus('idle', 'idle');
      }
    } finally {
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
      }
      currentReader = null;
      btn.disabled = false;
      document.getElementById('spinner').style.display = 'none';
      document.getElementById('btnLabel').textContent = 'Run Import';
    }
  }