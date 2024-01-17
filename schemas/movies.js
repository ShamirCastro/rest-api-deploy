const z = require('zod')

const movieSchema = z.object({
    title: z.string({
        invalid_type_error: 'Movie title must be a string',
        required_error: 'Movie tittle is required. Please check url'
    }),
    year : z.number().int().min(1900).max(2024),
    duration: z.number().int().positive(),
    rate: z.number().min().max(10).default(5.5),
    poster: z.string().url({message: 'Poster must be a valid url'}),
    genre: z.array(
        z.enum(['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi','Crime']),
        {
            required_error: 'Movie genere is required',
            invalid_type_error: 'Movie genere must be an array of enum Genere'
        }
    )
})

function validateMovie(object){
    return movieSchema.safeParse(object)
}

function validatePartialMovie(object){
    return movieSchema.partial().safeParse(object)
}

module.exports = {
    validateMovie,
    validatePartialMovie
}