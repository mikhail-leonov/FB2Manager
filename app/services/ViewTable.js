function renderTable(rows, hiddenColumns = []) {
    if (!rows || rows.length === 0) {
        return "<p>No data</p>";
    }

    const keys = Object.keys(rows[0])
        .filter(k => !hiddenColumns.includes(k));

    let html = "<table class='table table-bordered table-sm table-hover'>";
    html += "<thead><tr>";

    for (const k of keys) {
        html += `<th>${k}</th>`;
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