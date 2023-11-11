const express = require('express');
const router = express.Router();

class Epigram{
    constructor(type, value) {
        this.id = Epigram.incrementId();
        this.type = type;
        this.value = value;
    }

    static incrementId() {
        if (!this.latestId) this.latestId = 1
        else this.latestId++
        return this.latestId
    }
}

let allEpigrams =[];

allEpigrams.push(new Epigram("Lustiger Spruch", "Fehler: Tastatur nicht angeschlossen. Bitte Taste F1 drücken!"));
allEpigrams.push(new Epigram("Lustiger Spruch", "Ich teile heimlich durch Null."));
allEpigrams.push(new Epigram("Lektion", "Onion rings = Zwiebel ruft an."));
allEpigrams.push(new Epigram("Weißheit", "Döner macht schöner!"));


router.get("/", (req, res) => {
    res.send(Object.values(allEpigrams));
});

router.get('/id/:id', (req, res) => {
    const epigramId = Number(req.params.id);
    const getEpigram = allEpigrams.find((allEpigrams) => allEpigrams.id === epigramId);

    if (!getEpigram) {
        res.status(422).send('Epigram with id:' + epigramId + ' not found.');
    } else {
        res.json(getEpigram);
    }
});

router.get("/random", (req, res) => {
    const randomNumber = Math.floor(Math.random() * allEpigrams.length);     // returns a random integer from 0 to array length
    res.send(allEpigrams[randomNumber]);
});

router.post('/', function (req, res) {
    let quote;

    try {
        const type = req.body.type;
        const value = req.body.value;

        if(!type || !value){
            res.status(422).jsonp({ message:'type or/and value is/are empty!' });
            return;
        }

        quote = new Epigram(type, value);
        allEpigrams.push(quote);
    }
    catch(err) {
        res.status(422).jsonp({"error":err.message});
        return;
    }
    res.status(201).jsonp(quote);
});


module.exports = router;