const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT 
    *
    FROM
    movie
    ORDER BY 
    movie_id;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieDetails = `
    INSERT INTO movie(director_id, movie_name, lead_actor)
    VALUES (
        ${directorId}, '${movieName}', '${leadActor}');
    `;
  const dbResponse = await db.run(addMovieDetails);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `
    SELECT * 
    FROM movie
    WHERE movie_id = ${movieId}
    `;
  let movie = await db.get(getMovie);
  response.send(movie);
});

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;

  const updateMovieDetails = `
    UPDATE movie
    SET 
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE 
        movie_id = ${movieId};`;
  await db.run(updateMovieDetails);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovies = `
    DELETE FROM movie
    WHERE movie_id = ${movieId}`;
  await db.run(deleteMovies);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorDetails = `
    SELECT *
    FROM director
    ORDER BY 
    director_id
    `;
  const director = await db.all(getDirectorDetails);
  response.send(director);
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const directorId = request.params;
  const getAllDetails = `
    SELECT movie_name 
    FROM movie 
    WHERE 
    director_id = ${directorId}
    `;
  const movieDirector = await db.get(getAllDetails);
  response.send(movieDirector);
});

module.exports = app;
