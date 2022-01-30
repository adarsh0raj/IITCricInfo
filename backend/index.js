const express = require('express');
const app = express();
const pool = require('./db');

app.use(express.json());

// Routes 
app.get('/teams', async(req, res) => {
    try {
        const teams = await pool.query('SELECT * FROM team');
        res.json(teams.rows);
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/players', async(req, res) => {
    try {
        const players = await pool.query('SELECT * FROM player');
        res.json(players.rows);
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/players/:id', async(req, res) => {
    try {
        const player = await pool.query('SELECT * FROM player WHERE player_id = $1', [parseInt(req.params.id)]);
        const runs_match = await pool.query("SELECT match_id, sum(runs_scored) as runs FROM ball_by_ball WHERE striker = $1 group by match_id", [parseInt(req.params.id)]);
        const matches = await pool.query("select count(*) from player_match where player_id = $1", [parseInt(req.params.id)]);
        const runs = await pool.query("select sum(runs_scored) from ball_by_ball where striker = $1", [parseInt(req.params.id)]);
        const fours = await pool.query("select count(*) from ball_by_ball where striker = $1 and runs_scored = 4", [parseInt(req.params.id)]);
        const sixes = await pool.query("select count(*) from ball_by_ball where striker = $1 and runs_scored = 6", [parseInt(req.params.id)]);
        const fifties = await pool.query("select count(*) from (select match_id, sum(runs_scored) from ball_by_ball where striker = $1 group by match_id) as t where t.sum >= 50", [parseInt(req.params.id)]);
        const highest = await pool.query("select max(runs) from (select match_id, sum(runs_scored) as runs from ball_by_ball where striker = $1 group by match_id) as t", [parseInt(req.params.id)]);

        // todo strike rate

        // todo avg

        // todo bowling section

        if (runs.rows[0].sum === null) {
            runs.rows[0].sum = 0;
        }
        if (highest.rows[0].max === null) {
            highest.rows[0].sum = 0;
        }
    
        res.json({
            player_id: player.rows[0].player_id,
            player_name: player.rows[0].player_name,
            country_name: player.rows[0].country_name,
            batting_skill: player.rows[0].batting_hand,
            bowling_skill: player.rows[0].bowling_skill,
            matches: runs_match.rows,
            no_matches: matches.rows[0].count,
            runs: runs.rows[0].sum,
            fours: fours.rows[0].count,
            sixes: sixes.rows[0].count,
            fifties: fifties.rows[0].count,
            highest: highest.rows[0].max,

        });

    } catch (err) {
        console.error(err.message);
    }
});

app.get('/venues', async(req, res) => {
    try {
        const venues = await pool.query('SELECT * FROM venue');
        res.json(venues.rows);
    } catch (err) {
        console.error(err.message);
    }
});

app.get('/venues/:id', async(req, res) => {
    try {
        const venue = await pool.query('SELECT * FROM venue WHERE venue_id = $1', [parseInt(req.params.id)]);
        const matches = await pool.query('SELECT count(*) FROM match WHERE venue_id = $1', [parseInt(req.params.id)]);

        const highest_rec = await pool.query("select max(runs) from (select match.match_id, ball_by_ball.innings_no, (sum(ball_by_ball.runs_scored)+sum(ball_by_ball.extra_runs)) as runs from match, ball_by_ball where match.venue_id = $1 and match.match_id = ball_by_ball.match_id group by match.match_id, ball_by_ball.innings_no) as t", [parseInt(req.params.id)]);
        const lowest_rec = await pool.query("select min(runs) from (select match.match_id, ball_by_ball.innings_no, (sum(ball_by_ball.runs_scored)+sum(ball_by_ball.extra_runs)) as runs from match, ball_by_ball where match.venue_id = $1 and match.match_id = ball_by_ball.match_id group by match.match_id, ball_by_ball.innings_no) as t", [parseInt(req.params.id)]);
        // const highest_chased = 

        const matches_won_bat = await pool.query("SELECT count(*) FROM match WHERE venue_id = $1 AND ((match_winner = toss_winner and toss_name = 'bat') or (match_winner != toss_winner and toss_name = 'field'))", [parseInt(req.params.id)]);
        const matches_won_bowl = await pool.query("SELECT count(*) FROM match WHERE venue_id = $1 AND ((match_winner = toss_winner and toss_name = 'field') or (match_winner != toss_winner and toss_name = 'bat'))", [parseInt(req.params.id)]);
        const matches_draw = await pool.query("SELECT count(*) FROM match WHERE venue_id = $1 AND (match_winner is NULL or (match_winner != team1 and match_winner != team2))", [parseInt(req.params.id)]);

        res.json({
            venue_id: venue.rows[0].venue_id,
            venue_name: venue.rows[0].venue_name,
            address: venue.rows[0].city_name + ', '+ venue.rows[0].country_name,
            capacity: parseInt(venue.rows[0].capacity),
            matches: parseInt(matches.rows[0].count),
            highest_rec: parseInt(highest_rec.rows[0].max),
            lowest_rec: parseInt(lowest_rec.rows[0].min),
            // highest_chased: parseInt(highest_chased.rows[0].max),
            matches_won_bat: parseInt(matches_won_bat.rows[0].count)/parseInt(matches.rows[0].count)*100,
            matches_won_bowl: parseInt(matches_won_bowl.rows[0].count)/parseInt(matches.rows[0].count)*100,
            matches_draw: parseInt(matches_draw.rows[0].count)/parseInt(matches.rows[0].count)*100
        });

    } catch (err) {
        console.error(err.message);
    }
});



app.listen(3000, (req, res) => {
    console.log('Node Server is running on port 3000');
});