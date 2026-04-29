  let total = null, processed = 0;
  let currentReader = null;
  let heartbeatInterval = null;
  let lastDataTime = null;
  
  // Skip counters for all categories
  let skipCounts = {
    duplicate: 0,
    language: 0,
    genre: 0,
    author: 0,
    encoding: 0,
    other: 0
  };
  let imported = 0;

  function updateTotalSkipped() {
    const totalSkipped = Object.values(skipCounts).reduce((a, b) => a + b, 0);
    document.getElementById('cntSkipped').textContent = totalSkipped;
    return totalSkipped;
  }

  function updateSkipDisplay(category, value) {
    const element = document.getElementById(`skip${category.charAt(0).toUpperCase() + category.slice(1)}`);
    if (element) {
      element.textContent = value;
      // Flash effect
      element.style.transform = 'scale(1.1)';
      setTimeout(() => { element.style.transform = 'scale(1)'; }, 200);
    }
    updateTotalSkipped();
  }

  function updateProcessedDisplay() {
    document.getElementById('cntProcessed').textContent = processed;
    if (total && total > 0) {
      const pct = Math.min(100, Math.round((processed / total) * 100));
      const progressFill = document.getElementById('progressFill');
      progressFill.style.width = pct + '%';
      progressFill.setAttribute('aria-valuenow', pct);
      document.getElementById('progressPct').textContent = pct + '%';
      document.getElementById('progressText').textContent = `Processing ${processed} / ${total} files`;
      
      // Change progress bar color based on completion
      if (pct === 100) {
        progressFill.classList.remove('progress-bar-animated');
        progressFill.classList.add('bg-success');
      }
    }
  }

  function appendLog(line) {
    const box = document.getElementById('logBox');
    const span = document.createElement('span');
    span.className = 'log-line';
    span.textContent = line + '\n';
    box.appendChild(span);
    // Keep last 300 lines only for performance
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
    // Codes 9-11: Other
    return 'other';
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

    // Parse SKIP CODE (0 = imported, >0 = skip)
    const skipCodeMatch = line.match(/Skip Code:\s*(\d+)/);
    if (skipCodeMatch) {
      const code = parseInt(skipCodeMatch[1]);
      if (code === 0) {
        imported++;
        document.getElementById('cntImported').textContent = imported;
      } else {
        const category = getSkipCategory(code);
        if (skipCounts[category] !== undefined) {
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
      encoding: 0,
      other: 0
    };
    document.getElementById('cntImported').textContent = '0';
    document.getElementById('cntProcessed').textContent = '0';
    document.getElementById('cntTotal').textContent = '0';
    document.getElementById('cntSkipped').textContent = '0';
    document.getElementById('skipDuplicate').textContent = '0';
    document.getElementById('skipLanguage').textContent = '0';
    document.getElementById('skipGenre').textContent = '0';
    document.getElementById('skipAuthor').textContent = '0';
    document.getElementById('skipEncoding').textContent = '0';
    document.getElementById('skipOther').textContent = '0';
    
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = '0%';
    progressFill.classList.add('progress-bar-animated');
    progressFill.classList.remove('bg-success');
    progressFill.setAttribute('aria-valuenow', 0);
    document.getElementById('progressPct').textContent = '0%';
    document.getElementById('progressText').textContent = 'Processing...';
  }

  async function startImport() {
    const btn = document.getElementById('importBtn');
    const statusBadge = document.getElementById('statusBadge');
    
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
    document.getElementById('spinner').style.display = 'block';
    document.getElementById('btnLabel').textContent = 'Running…';
    statusBadge.textContent = 'Running';
    statusBadge.classList.remove('bg-secondary', 'bg-success', 'bg-danger');
    statusBadge.classList.add('bg-warning');

    document.getElementById('logBox').innerHTML = '<span style="color:#2a3a2a">// Import started...\n</span>';
    document.getElementById('progressWrap').classList.add('visible');
    document.getElementById('summaryBox').classList.remove('visible');
    
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
      
      const totalProcessed = imported + Object.values(skipCounts).reduce((a, b) => a + b, 0);
      const completionMsg = document.getElementById('completionMessage');
      if (totalProcessed > 0) {
        completionMsg.innerHTML = `Successfully imported <strong>${imported}</strong> out of <strong>${totalProcessed}</strong> files processed.`;
      } else {
        completionMsg.innerHTML = `No files were imported. Check your upload folder or import rules.`;
      }
      
      document.getElementById('summaryBox').classList.add('visible');
      const progressFill = document.getElementById('progressFill');
      progressFill.style.width = '100%';
      progressFill.classList.remove('progress-bar-animated');
      progressFill.classList.add('bg-success');
      document.getElementById('progressPct').textContent = '100%';
      
      statusBadge.textContent = 'Completed';
      statusBadge.classList.remove('bg-warning');
      statusBadge.classList.add('bg-success');

    } catch (e) {
      if (e.name !== 'AbortError') {
        appendLog('Error: ' + e.message);
        statusBadge.textContent = 'Error';
        statusBadge.classList.remove('bg-warning');
        statusBadge.classList.add('bg-danger');
      } else {
        appendLog('[warn] Import cancelled');
        statusBadge.textContent = 'Cancelled';
        statusBadge.classList.remove('bg-warning');
        statusBadge.classList.add('bg-secondary');
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
