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

function getForm(request, response){
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
                return new Book(book.volumeInfo)
            });

            response.render('pages/searches/show');
        })
}


function Book(bookObj){
    const placeholderImage = `https://i.imgur.com/J5LVHEL.jpg`;
    this.title = bookObj.title || 'no title available';
}
app.use('*', (request, response) => {
    response.status(404).send('page not found');
});



app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

