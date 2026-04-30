// D:\Projects\Books\core\dbpagination.js
const db = require("./db");
const { paginate } = require("./pagination");
const { BOOKS_PER_PAGE } = require("./constants");

function pagedQuery({
    table,
    select = "*",
    orderBy = "rowid DESC",
    page = 1,
    limit = BOOKS_PER_PAGE,
    where = "",
    params = []
}) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);

    let whereClause = "";
    let queryParams = [...params];
    
    if (where) {
        whereClause = `WHERE ${where}`;
    }

    const countSql = `
        SELECT COUNT(*) as c
        FROM ${table}
        ${whereClause}
    `;
    
    const total = db.prepare(countSql).get(...queryParams)?.c || 0;

    const pagination = paginate({
        page: safePage,
        limit: safeLimit,
        total
    });

    // If no results, return early
    if (total === 0) {
        return {
            data: [],
            pagination
        };
    }

    const dataSql = `
        SELECT ${select}
        FROM ${table}
        ${whereClause}
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
    `;
    
    // Add pagination params
    queryParams.push(pagination.limit, pagination.offset);
    
    const rows = db.prepare(dataSql).all(...queryParams);

    return {
        data: rows,
        pagination
    };
}

module.exports = {
    pagedQuery
};