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