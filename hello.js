console.log("Hello world!");
console.log("== process.env.PORT: ", process.env.PORT);

const fs = require('fs');
const figlet = require('figlet');

figlet('normal function', function(err, data) {
        if (err) {
            console.log('Something went wrong...');
            console.dir(err);
            return;
        }
        console.log(data)
    });

figlet('Arrow function', (err, data) => {
        if (err) {
            console.log('Something went wrong...');
            console.dir(err);
            return;
        }
        console.log(data)
    });


function asciiArtHandler(err, data) {
        if (!err) {
                console.log(data);
        }
}

figlet("Kimchi", asciiArtHandler);

const circle = require('./circle');
console.log("circumference(5):", circle.circumference(5));
console.log("area(5):", circle.area(5));

// const circumference = require('./circle').circumference;
// const {circumference} = require('./circle');