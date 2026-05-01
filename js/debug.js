  const logBox = document.getElementById('log-area');
  
  function appendToLog(content, isHtml = false) {
    if (isHtml) {
      const div = document.createElement('div');
      div.innerHTML = content;
      logBox.appendChild(div);
    } else {
      const span = document.createElement('span');
      span.className = 'log-line';
      span.innerHTML = content;
      logBox.appendChild(span);
      logBox.appendChild(document.createElement('br'));
    }
    logBox.scrollTop = logBox.scrollHeight;
  }
  
  function clearLog() {
    logBox.innerHTML = '';
  }
  
  function formatTableData(data, tableName) {
    if (!Array.isArray(data) || data.length === 0) {
      return '<div class="log-line">[info] No data found in ' + tableName + '</div>';
    }
    
    let html = '<div style="overflow-x: auto;">';
    html += '<table class="table table-sm table-bordered debug-table">';
    
    // Headers
    const keys = Object.keys(data[0]);
    html += '<thead><tr>';
    keys.forEach(key => {
      html += `<th>${escapeHtml(key)}</th>`;
    });
    html += '</thead><tbody>';
    
    // Rows
    data.forEach(row => {
      html += '<tr>';
      keys.forEach(key => {
        let val = row[key];
        if (val === null) val = '<em style="color:#666;">null</em>';
        else if (typeof val === 'object') val = JSON.stringify(val);
        else val = escapeHtml(String(val));
        html += `<td>${val}</td>`;
      });
      html += '</tr>';
    });
    
    html += '</tbody></div>';
    html += `<div class="log-line">[ok] ${data.length} row(s) returned</div>`;
    return html;
  }
  
  function formatJsonData(data) {
    return '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
  }
  
  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;');
  }
  
  async function fetchDebugData(url, isClean = false) {
    // Clear previous results
    clearLog();
    
    // Add request header
    appendToLog('----------------------------------------------------------------------');
    appendToLog(`[request] ${url}`);
    appendToLog(`[time] ${new Date().toLocaleString()}`);
    appendToLog('');
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Handle clean operation
      if (isClean && data.cleaned) {
        appendToLog('[warning] DANGER ZONE');
        appendToLog('[ok] Database cleaned successfully');
        appendToLog('[info] All data has been removed from all tables');
        appendToLog('[info] You can now re-import books via the Import page');
      }
      // Handle table data (array of objects with multiple rows)
      else if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
        const tableName = url.split('/').pop();
        const tableHtml = formatTableData(data, tableName);
        appendToLog(tableHtml, true);
      }
      // Handle other JSON data
      else {
        const formatted = formatJsonData(data);
        appendToLog(formatted, true);
      }
      
      appendToLog('');
      appendToLog('[ok] Request completed successfully');
      
    } catch (error) {
      appendToLog(`[error] ${error.message}`);
      appendToLog(`[info] Could not load data from ${url}`);
    }
    
    appendToLog('----------------------------------------------------------------------');
    appendToLog('');
  }
  
  // Attach click handlers to all debug links
  document.querySelectorAll('.debug-link').forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const url = link.getAttribute('data-url');
      const confirmMsg = link.getAttribute('data-confirm');
      
      if (confirmMsg) {
        if (confirm(confirmMsg)) {
          await fetchDebugData(url, true);
        } else {
          clearLog();
          appendToLog(`[warning] Action cancelled: ${url}`);
          appendToLog(`[info] Clean operation was aborted by user`);
        }
      } else {
        await fetchDebugData(url, false);
      }
    });
  });