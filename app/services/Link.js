function makeBookLink(link) {
    return `<a href="/book/${link.book_id}">${link.title}</a>`;
}

function makeFileLink(link) {
    return `<a href="/files/${link.hash}">${link.title}</a>`;
}

function makeAuthorLink(link) {
    const name = `${link.firstname || ""} ${link.lastname || ""}`.trim();
    return `<a href="/author/${link.author_id}/books">${name}</a>`;
}

function makeGenreLink(link) {
    return `<a href="/genre/${link.genre_id}">${link.title}</a>`;
}

function makeSeriesLink(link) {
    return `<a href="/serie/${link.serie_id}">${link.title}</a>`;
}

module.exports = {
    makeBookLink,
    makeFileLink,
    makeAuthorLink,
    makeGenreLink,
    makeSeriesLink
};