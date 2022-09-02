const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const database = require('./QuotesDB.js');
const { request } = require('express');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "OPTIONS, GET, POST, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

app.use(morgan('dev'));

app.use(express.static('public'));

app.get('/api/get-all-authors', (req, res, next) => {
    res.status(200).send(database);
});

app.get('/api/get-specific-author/:quote', (req, res, next) => {
    let requestedAuthorName = req.query.authorName;
    let objIndex = database.findIndex(obj => obj.authorName === requestedAuthorName);
    if (objIndex !== -1 || objIndex) {
        res.status(200).send(database[objIndex]);
        return console.log(database[objIndex]);
    } else {
        res.status(404).send('Object not found');
        return console.log(database[objIndex]);
    }
});

app.get('/api/random-quote', (req, res, next) => {
    let randomIndex = Math.floor(Math.random() * database.length);
    if (randomIndex) {
        res.status(200).send(database[randomIndex]);
    } else {
        res.status(400).send('Something went wrong');
    };
});

app.get('/api/restricted-area/:login', (req, res, next) => {
    let authValue = false;
    let usernameInput = req.query.username;
    let passwordInput = req.query.password;
    const authUsers = 
    [
        {
            username: 'Gil.Porto',
            password: '231546'
        },
        {
            username: 'Ale.Santos',
            password: '261501'
        }
    ];
    const methods = ['POST', 'PUT', 'DELETE'];
    for (user of authUsers) {
        if (user.username == usernameInput && user.password == passwordInput) {
            authValue = true;
            res.status(200).send({auth: authValue, method: methods, data: methods});
            console.log({auth: authValue, method: methods, data: database});
            break;
        } else {
            authValue = false;
            res.status(403).send({auth: authValue});
        };
    };
});

app.get('/api/use-post-method', (req, res, next) => {
    res.status(200).send({data: database});
});

app.get('/api/use-put-method', (req, res, next) => {
    res.status(200).send({data: database});
});

app.get('/api/use-delete-method', (req, res, next) => {
    res.status(200).send({data: database});
});

app.get('/api/get-put-method-ids/:author', (req, res, next) => {
    let authorNameChosenForPutMethod = req.query.selectInputAuthorToUpdateQuote;
    let indexOfAuthorChosenForPutMethod = Number(database.findIndex(obj => obj.authorName == authorNameChosenForPutMethod));
    if (indexOfAuthorChosenForPutMethod !== -1) {
        res.status(200).send({data: database[indexOfAuthorChosenForPutMethod]});
        return console.log(database[indexOfAuthorChosenForPutMethod]);
    } else {
        res.status(404).send('Object not found');
        return console.log('Object not found');
    }
});

app.get('/api/get-del-method-ids/:author', (req, res, next) => {
    let authorNameChosenForDeleteMethod = req.query.selectInputAuthorToDeleteQuote;
    let indexOfAuthorChosenForDeleteMethod = Number(database.findIndex(obj => obj.authorName == authorNameChosenForDeleteMethod));
    if (indexOfAuthorChosenForDeleteMethod !== -1) {
        res.status(200).send({data: database[indexOfAuthorChosenForDeleteMethod]});
        return console.log(database[indexOfAuthorChosenForDeleteMethod]);
    } else {
        res.status(404).send('Object not found');
        return console.log('Object not found');
    }
});

app.post('/api/post-new-quote/:quote', (req, res, next) => {
    let selectedAuthorName = req.query.selectInputAuthorToPostNewQuote;
    let newQuoteToAdd = req.query.newQuoteInput;
    const authorForPostingNewQuoteIndex = database.findIndex(obj => obj.authorName == selectedAuthorName);
    if (authorForPostingNewQuoteIndex !== -1 && authorForPostingNewQuoteIndex) {
        database[authorForPostingNewQuoteIndex]['quotes'].push(
        {
            id: (Number(database[authorForPostingNewQuoteIndex]['quotes'].length) + 1),
            content: newQuoteToAdd,
            ptBRContent: newQuoteToAdd
        });
        res.status(201).send({data: database[authorForPostingNewQuoteIndex]});
        return console.log(database[authorForPostingNewQuoteIndex]);
    } else {
        res.status(400).send('It was indeed a bad request');
        return console.log(database[authorForPostingNewQuoteIndex]);
    }
});

app.put('/api/update-quote/:quote', (req, res, next) => {
    let newQuoteInput = req.query.InputTextElemForUpdateQuote;
    let authorToBeUpdated = req.query.selectInputAuthorToUpdateQuote;
    let QuoteIdToBeUpdated = req.query.selectInputQuoteIdToUpdate;

    //First, we'll look for the author to update inside the DB array
    let indexOfAuthorToBeUpdated = database.findIndex(obj => obj.authorName == authorToBeUpdated);
    if (indexOfAuthorToBeUpdated !== -1) {
        console.log('This is the index of the author whose quote will be updated: ' + indexOfAuthorToBeUpdated);
        //Now, we'll look for the exact ID of the quote that should be updated
        IndexOfQuoteToUpdate = database[indexOfAuthorToBeUpdated]['quotes'].findIndex(obj => obj.id == QuoteIdToBeUpdated);
        console.log('This is the index of the quote that should be updated: '+ IndexOfQuoteToUpdate);
        if (IndexOfQuoteToUpdate !== -1) {
            console.log(`This is the quote that'll be updated: ${database[indexOfAuthorToBeUpdated]['quotes'][IndexOfQuoteToUpdate]}`);
            database[indexOfAuthorToBeUpdated]['quotes'][IndexOfQuoteToUpdate].content = newQuoteInput;
            database[indexOfAuthorToBeUpdated]['quotes'][IndexOfQuoteToUpdate].ptBRContent = newQuoteInput;
            res.status(200).send({data: database[indexOfAuthorToBeUpdated]['quotes'][IndexOfQuoteToUpdate]});
        } else {
            res.status(400).send('Bad Request');
            return console.log('Bad Request');
        }
    } else {
        res.status(400).send('Bad Request');
        return console.log('Bad Request');
    }
});

app.delete('/api/delete-quote/:quote', (req, res, next) => {
    //let newQuoteInput = req.query.InputTextElemForDeleteQuote;
    let authorToBeDeleted = req.query.selectInputAuthorToDeleteQuote;
    let QuoteIdToBeDeleted = req.query.selectInputQuoteIdToDelete;

    //First, we'll look for the author to update inside the DB array
    let indexOfAuthorToBeDeleted = database.findIndex(obj => obj.authorName == authorToBeDeleted);
    if (indexOfAuthorToBeDeleted !== -1) {
        console.log('This is the index of the author whose quote will be deleted: ' + indexOfAuthorToBeDeleted);
        //Now, we'll look for the exact ID of the quote that should be updated
        IndexOfQuoteToDelete = Number(database[indexOfAuthorToBeDeleted]['quotes'].findIndex(obj => obj.id == QuoteIdToBeDeleted));
        if (IndexOfQuoteToDelete !== -1) {
            console.log(`This is the quote that'll be deleted: ${database[indexOfAuthorToBeDeleted]['quotes'][IndexOfQuoteToDelete].content}`);
            database[indexOfAuthorToBeDeleted]['quotes'].splice(IndexOfQuoteToDelete, 1);
            res.send({data: database[indexOfAuthorToBeDeleted]});
            //res.status(204).send({data: database[indexOfAuthorToBeDeleted]});
            return console.log({data: database[indexOfAuthorToBeDeleted]});
        } else {
            res.status(400).send('Bad Request');
            console.log('Bad Request');
        }
    } else {
        res.status(400).send('Bad Request');
        return console.log('Bad Request');
    }
});


const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});