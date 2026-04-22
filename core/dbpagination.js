const db = require("./db");
const { paginate } = require("./pagination");

function pagedQuery({
    table,
    select = "*",
    orderBy = "rowid DESC",
    page = 1,
    limit = 20,
    where = "",
    params = []
}) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);

    const countSql = `
        SELECT COUNT(*) as c
        FROM ${table}
        ${where ? "WHERE " + where : ""}
    `;

    const total = db.prepare(countSql).get(...params).c;

    const pagination = paginate({
        page: safePage,
        limit: safeLimit,
        total
    });

    const dataSql = `
        SELECT ${select}
        FROM ${table}
        ${where ? "WHERE " + where : ""}
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?
    `;

    const rows = db.prepare(dataSql).all(
        ...params,
        pagination.limit,
        pagination.offset
    );

    return {
        data: rows,
        pagination
    };
}

module.exports = {
    pagedQuery
};