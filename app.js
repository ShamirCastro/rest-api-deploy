const express = require('express')
const crypto = require('node:crypto')
const movies = require('./movies.json')
const app = express()
const { validateMovie, validatePartialMovie } = require('./schemas/movies')
const { json } = require('body-parser')



app.disable('x-powered-by')
app.use(express.json())
app.get('/', (req,res) => {
     res.json({message:'Hola mundo'})
})

const ACCEPTED_ORIGINS = [
    'http://127.0.0.1:5500',
    'http://localhost:1234'
]
app.get('/movies', (req,res) => {
    const origin = req.header('origin')
    
    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin)
    }

    const {genere} = req.query
    if(genere){
        const filterMovies = movies.filter(
            movie => movie.genre.some(g => g.toLowerCase() == genere.toLowerCase()) 
        )
        return res.json(filterMovies)
    }

    res.json(movies)
})

app.get('/movies/:id', (req,res) => {
    const { id } = req.params 
    const movie = movies.find(movie => movie.id == id)

    if(movie) return res.json(movie)

    res.status(404).json({message:'movie not found'})
})

app.post('/movies', (req, res)=>{

    const result = validateMovie(req.body)
     
    if (result.error) {
        return res.status(400).json({error: JSON.parse(result.error.message)})
    }

    const newMovie = { 
        id: crypto.randomUUID(),
        ...result.data
    }
    movies.push(newMovie)
    
    res.status(201).json(newMovie)
}) 

app.patch('/movies/:id', (req, res) => {

    const result = validatePartialMovie(req.body)

    if(!result.success){
        return res.status(400).json({error: JSON.parse(result.error.message)})
    }

    const {id} = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1){
        return res.status(404).json({message: 'movie not fund'})
    }

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }
    
    movies[movieIndex] = updateMovie

    return res.json(updateMovie)
})

app.delete('/movies/:id', (req, res) => {
    const origin = req.header('origin')

    if (ACCEPTED_ORIGINS.includes(origin) || !origin ) {
        res.header('Access-Control-Allow-Origin', origin)
    }

    const {id} = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if (movieIndex === -1) {
        return res.status(404).json({message: 'Movie not found'})
    }

    movies.splice(movieIndex, 1)

    return res.json({message: 'Movie delete'})
})

app.options('/movies/:id', (req, res) => {
    const origin = req.header('origin')

    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin)
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH')
    }

    res.sendStatus(200)
})

const PORT = process.env.PORT ?? 1234
app.listen(PORT,()=>{
    console.log(`server listening on port http://localhost:${PORT}`)
})