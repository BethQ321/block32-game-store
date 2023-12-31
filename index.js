const pg = require('pg')
const client = new pg.Client('postgres://localhost/game_db')

const express = require('express')
const app = express()

const cors = require('cors')
app.use(cors())

app.use(express.json())

//GET all board games
app.get('/api/boardgames', async(req, res, next) => {
    try {
        console.log("api/boardgames")
        let SQL = `
            SELECT * FROM boardgames;
        `
        let {rows} = await client.query(SQL)
        console.log(rows)
        res.send(rows)
    } catch (error) {
        next(error)
    }
})

//GET single board game
app.get('/api/boardgames/:id', async(req, res, next) => {
    try {
        let SQL = `
            SELECT * FROM boardgames
            WHERE id = $1;
        `
        let response = await client.query(SQL, [req.params.id])
        res.send(response.rows[0])
    } catch (error) {
        next(error)
    }
})

//GET all video games
app.get('/api/videogames', async(req, res, next) => {
    try {
        let SQL = `
            SELECT * FROM videogames;
        `
        let {rows} = await client.query(SQL)
        console.log(rows)
        res.send(rows)
    } catch (error) {
        next(error)
    }
})

//GET single video game
app.get('/api/videogames/:id', async(req, res, next) => {
    try {
        let SQL = `
            SELECT * FROM videogames
            WHERE id = $1;
        `
        let response = await client.query(SQL, [req.params.id])
        res.send(response.rows[0])
    } catch (error) {
        next(error)
    }
})

//DELETE a board game
app.delete('/api/boardgames/:id', async(req, res, next) => {
    try {
        let SQL = `
            DELETE FROM boardgames WHERE id = $1;
        `
        let response = await client.query(SQL, [req.params.id])
        console.log("delete response", response)
        res.sendStatus(204)
    } catch (error) {
        next(error)
    }
})

//DELETE a video game
app.delete('/api/videogames/:id', async(req, res, next) => {
    try {
        let SQL = `
            DELETE FROM videogames WHERE id = $1;
        `
        let response = await client.query(SQL, [req.params.id])
        console.log("delete response", response)
        res.sendStatus(204)
    } catch (error) {
        next(error)
    }
})

//POST a board game
app.post('/api/boardgames', async(req, res, next) => {
    try {
        let SQL = `
            INSERT INTO boardgames (name, type, bggrating) 
            VALUES ($1, $2, $3)
            RETURNING *
        `
        let response = await client.query(SQL, [req.body.name, req.body.type, req.body.bggrating])
        res.send(response.rows[0])
    } catch (error) {
        next(error)
    }
})

//PUT (update) a game
// app.put('/api/boardgames/:id', async(res, req, next) => {
//     try {
//         const SQL = `
//             UPDATE boardgames
//             SET name = $1, type = $2, bggrating = $3
//             WHERE id = $4
//             RETURNING *
//         `
//         const response = await client.query(SQL, [req.body.name, req.body.type, req.body.bggrating, req.params.id])
//         res.send(response.rows)
//     } catch (error) {
//         next(error)
//     }
// })

app.put('/api/boardgames/:id', async (req, res, next) => {
    try {
        const SQL = `
            UPDATE boardgames
            SET name = $1, type = $2, bggrating = $3
            WHERE id = $4
            RETURNING *
        `
        const response = await client.query(SQL, [req.body.name, req.body.type, req.body.bggrating, req.params.id])
        res.send(response.rows)
    } catch (error) {
        next(error)
    }
}) 

const start = async() => {
    await client.connect()
    console.log("connected to database")

    let SQL = `
        DROP TABLE IF EXISTS videogames;
        DROP TABLE IF EXISTS boardgames;

        CREATE TABLE videogames(
            id SERIAL PRIMARY KEY,
            name VARCHAR(50),
            type VARCHAR(20),
            ignRating DECIMAL
        );

        CREATE TABLE boardgames(
            id SERIAL PRIMARY KEY,
            name VARCHAR(50),
            type VARCHAR(20),
            bggrating DECIMAL
        );

        INSERT INTO videogames (name, type, ignRating) VALUES ('Mario Wonder', 'platform', 9);
        INSERT INTO videogames (name, type, ignRating) VALUES ('Stardew Valley', 'role-playing', 9.5);
        INSERT INTO videogames (name, type, ignRating) VALUES ('Animal Crossing', 'social simulation', 9);
        INSERT INTO videogames (name, type, ignRating) VALUES ('Minecraft', 'sandbox', 9);

        INSERT INTO boardgames (name, type, bggrating) VALUES ('Azul', 'abstract strategy', 7.8);
        INSERT INTO boardgames (name, type, bggrating) VALUES ('Ticket to Ride', 'family', 7.4);
        INSERT INTO boardgames (name, type, bggrating) VALUES ('Abducktion', 'abstract strategy', 7.3);
        INSERT INTO boardgames (name, type, bggrating) VALUES ('Blokus', 'abstract strategy', 6.9);
    `

    await client.query(SQL)
    console.log('table created and data seeded')

    const port = process.env.PORT || 3003
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`)
    })
}

start()