// week 3 - monday

const express = require('express');
const mysqlPool = require('./lib/mysqlPool');
const logger = require('./logger');
const { validateAgainstSchema } = require('./lib/validation');
const { LodgingSchema } = require('./models/lodging');

const app = express();
const port = process.env.PORT || 8080;

// can use also require('./lodgings.json')
//const lodgings = require('./lodgings');

app.use(express.json());

app.use(logger);

/*
*       SELECT COUNT(*) FROM lodgings;
*/
async function getLodgingsCount() {
        const [ results ] = await mysqlPool.query(
                "SELECT COUNT(*) AS count FROM lodgings");
        console.log(" -- results:", results);
        return results[0].count;
}

/*
*       SELECT * FROM lodgings ORDER BY id LIMIT <offset>, <pageSize>
*/
async function getLodgingsPage(page) {
        const count = await getLodgingsCount();
        const pageSize = 10;
        const lastPage = Math.ceil(count / pageSize);
        page = page > lastPage ? lastPage : page;
        page = page < 1 ? 1 : page;     // if page < 1, then page is 1
        const offset = (page - 1) * pageSize;

        /*
        *       offset = "; DROP TABLES *;"
        */
        const [ results ] = await mysqlPool.query(
                //"SELECT * FROM lodgings ORDER BY id LIMIT " + offset + "," + pageSize
                // ? is placeholder, this way is better then above one
                "SELECT * FROM lodgings ORDER BY id LIMIT ?,?", 
                [ offset, pageSize ]
        );
        
        return {
                lodgings: results,
                page: page,
                totalPages: lastPage,
                pageSize: pageSize,
                count: count
        };
}
exports.getLodgingsPage = getLodgingsPage;

/*
 * INSERT INTO lodgings SET ...;
 */
async function insertNewLodging(lodging) {
        lodging = extractValidFields(lodging, LodgingSchema);
        const [ result ] = await mysqlPool.query(
                "INSERT INTO lodgings SET ? ",
                lodging
        );
        return result.insertId;
}

app.get('/lodgings', async (req, res) => {
        try {
                const lodgingsPage = await getLodgingsPage(
                        parseInt(req.query.page) || 1 
                );
                res.status(200).send(lodgingsPage);

        } catch (err) {
                console.error(" -- error:", err);
                res.status(500).send({
                        err: "Error fetching lodgings page from DB. Try again later."
                });
        }

});

app.post('/lodgings', (req, res) => {
        console.log("== req.body:", req.body);
        if (req.body && req.body.name && req.body.description){
                lodgings.push({
                        name: req.body.name,
                        description: req.body.description,
                        price: req.body.price
                });
                const id = lodgings.length - 1;
                res.status(201).send({          // 201 is creation code
                        id: id
                });
        } else {
                res.status(400).send({
                        err: "Request body needs 'name' and 'description' fields"
                });
        }
        //next();
});

app.get('/lodgings/:id', (req, res, next) =>{
        console.log("== req.params:", req.params);
        const id = req.params.id;
        if (lodgings[id]) {
                res.status(200).send(lodgings[id]);
        } else {
                next(); // call next middleware app.use('*') 404.
                        // in this case: goes to line 58
        }

});

//app.put();
//app.patch();
//app.delete();

// if '*' use, put last order because it reads all url
app.use('*', (req, res, next) => {
        res.status(404).send({
                err: "The requested resource doesn't exist: " + req.originalUrl
        });

});


app.listen(port, () => {
        console.log("== Server is listening on port", port);
});