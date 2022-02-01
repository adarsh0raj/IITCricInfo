const express = require('express');
const app = express();
const pool = require('./db');

const cors = require('cors');
app.use(cors());
// const corsOptions ={
//     origin:'http://localhost:3000', 
//     credentials:true,            //access-control-allow-credentials:true
//     optionSuccessStatus:200
// }
// app.use(cors(corsOptions));

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

        const strike_rate = await pool.query('SELECT COALESCE(((SUM(runs_scored) * 1.0 / COUNT(*)) * 100.0), 0.0) AS strike_rate FROM ball_by_ball WHERE striker = $1', [parseInt(req.params.id)]);
        const batting_avg = await pool.query('SELECT COALESCE((SUM(runs_scored) * 1.0 / COALESCE(Nullif((SELECT COUNT(*) FROM ball_by_ball WHERE striker = $1 AND out_type IS NOT NULL), 0), 1.0)), 0.0) AS batting_avg FROM ball_by_ball WHERE striker = $1', [parseInt(req.params.id)]);

        // todo bowling section
        const matches_bowled = await pool.query('SELECT COUNT(DISTINCT match_id) AS matches_bowled FROM ball_by_ball WHERE bowler = $1', [parseInt(req.params.id)]);
        const balls_bowled = await pool.query('SELECT COUNT(*) as balls_bowled FROM ball_by_ball WHERE bowler = $1', [parseInt(req.params.id)]);
        const runs_conceded = await pool.query('SELECT SUM(runs_scored+extra_runs) AS runs_conceded FROM ball_by_ball WHERE bowler = $1', [parseInt(req.params.id)]);
        const overs_bowled = await pool.query('SELECT COUNT(*) AS overs_bowled FROM (SELECT DISTINCT match_id, innings_no, over_id FROM ball_by_ball WHERE bowler = $1) as table1', [parseInt(req.params.id)]);
        const wickets_taken = await pool.query("SELECT COUNT(*) AS wickets_taken FROM ball_by_ball WHERE bowler = $1 AND out_type IS NOT NULL AND out_type NOT IN ('run out', 'retired hurt')", [parseInt(req.params.id)]);
        var economy = 0.0;
        const five_wicket_hauls = await pool.query("SELECT COUNT(*) as five_wicket_hauls FROM (SELECT COUNT(*) AS wkts, match_id FROM ball_by_ball WHERE bowler = $1 AND out_type IS NOT NULL AND out_type NOT IN ('run out', 'retired hurt') GROUP BY match_id) table1 WHERE wkts >= 5", [parseInt(req.params.id)]);

        if(overs_bowled.rows[0].overs_bowled != 0)
        {
            economy = parseFloat(runs_conceded.rows[0].runs_conceded) / parseFloat(overs_bowled.rows[0].overs_bowled);
        }

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
            strike_rate: strike_rate.rows[0].strike_rate,
            batting_avg: batting_avg.rows[0].batting_avg,

            matches_bowled: matches_bowled.rows[0].matches_bowled,
            balls_bowled: balls_bowled.rows[0].balls_bowled,
            runs_conceded: runs_conceded.rows[0].runs_conceded,
            overs_bowled: overs_bowled.rows[0].overs_bowled,
            wickets_taken: wickets_taken.rows[0].wickets_taken,
            economy: economy,
            five_wicket_hauls: five_wicket_hauls.rows[0].five_wicket_hauls
        });

    } catch (err) {
        console.error(err.message);
    }
});

app.get('/pointstable/:year', async(req, res) => {
    try {
        const pointstable = await pool.query("WITH teams(team_id) AS \
        (SELECT DISTINCT team1 as team_id FROM match WHERE season_year = $1 \
         UNION \
         SELECT DISTINCT team2 as team_id FROM match WHERE season_year = $1), \
         teams_played(team_id, played) AS \
         (SELECT team_id, COUNT(*) FROM teams, match \
          WHERE season_year = $1 AND (team_id=team1 OR team_id=team2) \
         GROUP BY team_id), \
         teams_won(team_id, won) AS \
         (SELECT team_id, COUNT(*) FROM teams, match \
         WHERE season_year = $1 AND match_winner=team_id \
         GROUP BY team_id), \
         teams_points(team_id, played, won, lost, tied, points) AS \
         (SELECT team_id, played, won, (played-won) AS lost, 0 AS tied, (won*2) AS points \
          FROM (teams_played natural join teams_won)), \
         ball_team(match_id, innings_no, over_id, ball_id, runs, striker, team_id) AS \
          (SELECT match.match_id, innings_no, over_id, ball_id, (runs_scored + extra_runs), striker, team_id \
          FROM ball_by_ball, match, player_match WHERE match.match_id=ball_by_ball.match_id AND  \
           match.match_id=player_match.match_id AND match.season_year=$1 AND player_match.player_id=striker), \
         runs_innings(match_id, innings_no, runs, team_id) AS \
         (SELECT match_id, innings_no, SUM(runs), team_id FROM ball_team \
         GROUP BY match_id, innings_no, team_id), \
         overs_innings(match_id, innings_no, overs, team_id) AS \
         (SELECT match_id, innings_no, COUNT(DISTINCT over_id), team_id FROM ball_team \
         GROUP BY match_id, innings_no, team_id), \
         rr_innings(team_id, match_id, rr) AS \
         (SELECT team_id, match_id, ((runs*1.0) / (overs * 1.0)) FROM runs_innings natural join overs_innings), \
         teams_nrr(team_id, nrr) AS \
         (SELECT A.team_id, SUM(A.rr - B.rr) FROM rr_innings A, rr_innings B \
         WHERE A.match_id = B.match_id AND A.team_id <> B.team_id \
         GROUP BY A.team_id) \
         SELECT team_name, played, won, lost, tied, nrr, points FROM teams_points, teams_nrr, team \
         WHERE teams_points.team_id = teams_nrr.team_id AND teams_nrr.team_id = team.team_id \
         ORDER BY points DESC, nrr DESC", [parseInt(req.params.year)]);

        res.json(pointstable.rows);
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