const {BOOKS_PER_PAGE} = require("./constants");

function paginate({ page = 1, limit = BOOKS_PER_PAGE, total = 0 }) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const totalPages = Math.ceil(total / safeLimit) || 1;
    return {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
        hasNext: safePage < totalPages,
        hasPrev: safePage > 1,
        offset: (safePage - 1) * safeLimit
    };
}

module.exports = { paginate };