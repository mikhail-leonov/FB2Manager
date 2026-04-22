const BOOK_COLUMNS 	= { hidden: ["book_id",   "title", "hash"], 		visible: [] };
const AUTHOR_COLUMNS 	= { hidden: ["author_id", "title", "book_id", "hash"], 	visible: [] };
const GENRE_COLUMNS  	= { hidden: ["genre_id",  "title", "book_id", "hash"], 	visible: [] };
const SERIE_COLUMNS  	= { hidden: ["serie_id",  "title", "book_id", "hash"], 	visible: [] };

module.exports = { BOOK_COLUMNS, GENRE_COLUMNS, AUTHOR_COLUMNS, SERIE_COLUMNS };