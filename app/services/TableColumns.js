// =============================
// Constants
// =============================

const BOOK_COLUMNS 	= { hidden: ["book_id",   "annotation", "hash"], 		visible: [] };
const AUTHOR_COLUMNS 	= { hidden: ["author_id", "annotation", "book_id", "hash"], 	visible: [] };
const GENRE_COLUMNS  	= { hidden: ["genre_id",  "annotation", "book_id", "hash"], 	visible: [] };
const SERIE_COLUMNS  	= { hidden: ["serie_id",  "annotation", "book_id", "hash"], 	visible: [] };

// =============================
// Service
// =============================


module.exports = { BOOK_COLUMNS, GENRE_COLUMNS, AUTHOR_COLUMNS, SERIE_COLUMNS };