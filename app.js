const express = require("express");
const app = express();
const { open } = require("sqlite");
app.use(express.json());
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running on http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const convertDbObjectTOResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
// getting a list of players
app.get("/players/", async (request, response) => {
  const playersListQuery = `
    SELECT * FROM cricket_team;
    `;
  const playerList = await db.all(playersListQuery);
  response.send(
    playerList.map((eachPlayer) => convertDbObjectTOResponseObject(eachPlayer))
  );
});
// creating new row in database
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;

  const addPlayerQuery = `
    INSERT INTO 
    cricket_team (player_name,jersey_number,role)
    VALUES( 
        `${playerName}`,
        ${jerseyNumber}, 
        `${role}`
        );
        `;
  const dbResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

// get one player with playerId
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
        SELECT * FROM cricket_team WHERE  player_id = ${playerId};
    `;
  const playerArray = await db.get(playerQuery);
  response.send(convertDbObjectTOResponseObject(playerArray));
});
// update a player
app.put("/player/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
        UPDATE cricket_team 
        SET 
            player_name = `${playerName}`,
            jersey_number = ${jerseyNumber},
            role = `${role}`
        WHERE player_id = ${playerId};    

    `;
  await db.run(updatePlayerQuery);

  response.send("Player Details Updated");
});

// delete player
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `
    delete from cricket_team where player_id = ${playerId};`;
  const dltPlayer = await db.run(deletePlayer);
  response.send("Player Removed");
});

module.exports = app;
