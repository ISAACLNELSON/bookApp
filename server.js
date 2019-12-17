'use strict';

const express = require('express');
const app = express();
require('ejs');
const superagent = require('superagent');
const PORT = process.env.PORT || 3001;

app.set('view engine', 'ejs');

app.use(express.static('./public'));

app.use(express.urlencoded());

app.post('/searches', getBookInfo);

app.get('/', getForm);

function getForm(request, response) {
    response.render('pages/index');
}


function getBookInfo(request, response) {
    let url = 'https://www.googleapis.com/books/v1/volumes?q=';
    let typeOfSearch = request.body.search[1];
    let searchCriteria = request.body.search[0];
    if (typeOfSearch === 'author') {
        url += `+inauthor:${searchCriteria}`;
    }
    //items[0].volumeInfo.title
    if (typeOfSearch === 'title') {
        url += `+intitle:${searchCriteria}`;
    }
    superagent.get(url)
        .then(res => {
            let bookArray = res.body.items.map(book => {
                return new Book(book)
            });
            // console.log(bookArray);

            response.render('searches/show', {bookArray:bookArray});
        })
        .catch( error =>{
         response.render('pages/error')
        })
}

function linkClean(url) {
    let prefix = 'https:';
    if (url.substr(0, 6) !== 'https:') {
        url = prefix + url.substr(url.search('//'), url.length);
        return url;
    } else {
        return url;
    }
}

function Book(bookObj) {

    let placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';
    this.title = bookObj.volumeInfo.title || 'no title available';
    this.author = bookObj.volumeInfo.authors[0] || 'no author available';
    // this.url = bookObj.selfLink
    this.url = linkClean(bookObj.selfLink);

    this.image = bookObj.volumeInfo.imageLinks && bookObj.volumeInfo.imageLinks.smallThumbnail ? bookObj.volumeInfo.imageLinks.smallThumbnail : placeholderImage;
    // console.log(this.title);
    // console.log(this.author);
    // console.log(this.url);
    
}
app.use('*', (request, response) => {
    response.status(404).send('page not found');
});



app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

