function renderTable(rows, hiddenColumns = [], url = null) {

    if (!rows || rows.length === 0) { return "<p>No data</p>"; }
    const keys = Object.keys(rows[0]).filter(k => !hiddenColumns.includes(k));
    
    let html = "<table class='table'>";
    html += "<thead><tr>";
    
    for (const k of keys) {
        if (url) {
            const currentSort = url.searchParams.get("sort");
            const currentOrder = url.searchParams.get("order") || "DESC";
            const newOrder = (currentSort === k && currentOrder === "ASC") ? "DESC" : "ASC";
            
            // Build URL with sorting params
            const sortUrl = new URL(url);
            sortUrl.searchParams.set("sort", k);
            sortUrl.searchParams.set("order", newOrder);
            sortUrl.searchParams.delete("page"); // Reset to page 1 when sorting
            
            // Add sorting indicator
            let indicator = "";
            if (currentSort === k) {
                indicator = currentOrder === "ASC" ? " ▲" : " ▼";
            }
            
            html += `<th><a href="${sortUrl.pathname}${sortUrl.search}" style="color: inherit; text-decoration: none;">${k}${indicator}</a></th>`;
        } else {
            html += `<th>${k}</th>`;
        }
    }
    
    html += "</tr></thead><tbody>";
    
    for (const row of rows) {
        html += "<tr>";
        for (const k of keys) {
            let val = row[k];
            if (val === null) val = "";
            if (typeof val === "object") val = JSON.stringify(val);
            html += `<td>${val}</td>`;
        }
        html += "</tr>";
    }
    html += "</tbody></table>";
    return html;
}

function renderJson(obj) {
    return `<pre>${JSON.stringify(obj, null, 2)}</pre>`;
}

module.exports = {
    renderTable,
    renderJson
};

function renderJson(obj) {
    return `<pre>${JSON.stringify(obj, null, 2)}</pre>`;
}

module.exports = {
    renderTable,
    renderJson
};