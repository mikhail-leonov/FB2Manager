const db = require("./db");
const { paginate } = require("./pagination");

/**
 * Generic paginated query helper
 *
 * @param {Object} options
 * @param {string} options.table - table name
 * @param {string} options.select - SELECT fields (default: *)
 * @param {string} options.orderBy - ORDER BY clause (default: rowid DESC)
 * @param {number} options.page
 * @param {number} options.limit
 * @param {string} options.where - optional WHERE clause (without "WHERE")
 * @param {Array} options.params - params for WHERE
 */
function pagedQuery({
    table,
    select = "*",
    orderBy = "rowid DESC",
    page = 1,
    limit = 20,
    where = "",
    params = []
}) {
    const countSql = `SELECT COUNT(*) as c FROM ${table} ${where ? "WHERE " + where : ""}`;
    const total = db.prepare(countSql).get(...params).c;

    const p = paginate({ page, limit, total });

    const dataSql = `
        SELECT ${select}
        FROM ${table}
        ${where ? "WHERE " + where : ""}
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
    `;

    const rows = db.prepare(dataSql).all(...params, p.limit, p.offset);

    return {
        data: rows,
        pagination: p
    };
}

module.exports = {
    pagedQuery
};