const express = require('express');
const app = express();
const pool = require('./db');

const cors = require('cors');
app.use(cors());

app.use(express.json());

// Routes 
app.get('/matches', async(req, res) => {
    try {
        const matches = await pool.query("SELECT match_id, A.team_name as team1, B.team_name as team2, venue.venue_name as stadium_name, venue.city_name as city_name, \
            C.team_name as winner, win_type, win_margin, season_year FROM team A, team B, team C, \
            match, venue WHERE match.venue_id = venue.venue_id AND match.team1 = A.team_id AND \
            match.team2 = B.team_id AND match.match_winner = C.team_id \
            ORDER BY season_year DESC \
            OFFSET $1 \
            LIMIT $2", [(parseInt(req.query.skip) * parseInt(req.query.limit)), parseInt(req.query.limit)]);
        res.json(matches.rows);
    } catch (err) {
        console.error(err.message);
    }

});

app.get('/matches/:id', async(req, res) => {
    try {
        //score comparision
        const innings1_progress = await pool.query("WITH bbb_team(over_id, ball_id, runs, out_type, striker, team_id) AS \
        (SELECT over_id, ball_id, (runs_scored + extra_runs) AS runs, out_type, striker, team_id \
        FROM ball_by_ball, player_match WHERE striker=player_match.player_id AND player_match.match_id = ball_by_ball.match_id \
        AND ball_by_ball.match_id = $1 AND innings_no=1), \
        ball_wicket(over_id, ball_id, wicket, team_id) AS \
        (SELECT over_id, ball_id, 1, team_id FROM bbb_team \
        WHERE out_type IS NOT NULL AND out_type <> 'retired hurt' \
        GROUP BY over_id, ball_id, team_id \
        UNION \
        SELECT over_id, ball_id, 0, team_id FROM bbb_team \
        WHERE out_type IS NULL \
        GROUP BY over_id, ball_id, team_id), \
        team_wickets(over_id, wickets, team_id) AS \
        (SELECT over_id, SUM(wicket), team_id FROM ball_wicket \
        GROUP BY over_id, team_id), \
        over_runs(over_id, runs, team_id) AS \
        (SELECT over_id, SUM(runs), team_id FROM bbb_team \
        GROUP BY over_id, team_id), \
        team_runs(over_id, runs, team_id) AS \
        (SELECT A.over_id, SUM(B.runs), A.team_id FROM over_runs A, over_runs B \
        WHERE B.over_id<=A.over_id \
        GROUP BY A.over_id, A.team_id) \
        SELECT team_runs.over_id AS over_id, runs, wickets, team_name FROM team_runs, team_wickets, team \
        WHERE team_runs.over_id=team_wickets.over_id AND team_runs.team_id = team.team_id \
        ORDER BY team_runs.over_id", [parseInt(req.params.id)]);

        const innings2_progress = await pool.query("WITH bbb_team(over_id, ball_id, runs, out_type, striker, team_id) AS \
        (SELECT over_id, ball_id, (runs_scored + extra_runs) AS runs, out_type, striker, team_id \
        FROM ball_by_ball, player_match WHERE striker=player_match.player_id AND player_match.match_id = ball_by_ball.match_id \
        AND ball_by_ball.match_id = $1 AND innings_no=2), \
        ball_wicket(over_id, ball_id, wicket, team_id) AS \
        (SELECT over_id, ball_id, 1, team_id FROM bbb_team \
        WHERE out_type IS NOT NULL \
        GROUP BY over_id, ball_id, team_id \
        UNION \
        SELECT over_id, ball_id, 0, team_id FROM bbb_team \
        WHERE out_type IS NULL OR out_type='retired hurt' \
        GROUP BY over_id, ball_id, team_id), \
        team_wickets(over_id, wickets, team_id) AS \
        (SELECT over_id, SUM(wicket), team_id FROM ball_wicket \
        GROUP BY over_id, team_id), \
        over_runs(over_id, runs, team_id) AS \
        (SELECT over_id, SUM(runs), team_id FROM bbb_team \
        GROUP BY over_id, team_id), \
        team_runs(over_id, runs, team_id) AS \
        (SELECT A.over_id, SUM(B.runs), A.team_id FROM over_runs A, over_runs B \
        WHERE B.over_id<=A.over_id \
        GROUP BY A.over_id, A.team_id) \
        SELECT team_runs.over_id AS over_id, runs, wickets, team_name FROM team_runs, team_wickets, team \
        WHERE team_runs.over_id=team_wickets.over_id AND team_runs.team_id = team.team_id \
        ORDER BY team_runs.over_id", [parseInt(req.params.id)]);

        //match info
        const match_info_without_11 = await pool.query("SELECT match.match_id, A.team_name as team1, B.team_name as team2, C.team_name as toss_winner, \
        toss_name, venue_name, D.umpire_name, E.umpire_name, F.umpire_name \
        FROM match, venue, umpire_match G, umpire_match H, umpire_match I, \
        umpire D, umpire E, umpire F, \
        team A, team B, team C \
        WHERE venue.venue_id = match.venue_id AND A.team_id = team1 AND B.team_id = team2 \
        AND C.team_id = toss_winner AND G.match_id=match.match_id AND H.match_id=match.match_id \
        AND I.match_id = match.match_id AND D.umpire_id = G.umpire_id AND E.umpire_id = H.umpire_id \
        AND F.umpire_id = I.umpire_id AND G.role_desc = 'Field' AND H.role_desc = 'Field' AND I.role_desc='Third' \
        AND G.umpire_id < H.umpire_id AND match.match_id = $1", [parseInt(req.params.id)]);

        const playing_11_team1 = await pool.query("SELECT player.player_id, player_name FROM player, player_match, match \
        WHERE player_match.match_id = match.match_id AND player.player_id = player_match.player_id \
        AND player_match.team_id = match.team1 AND match.match_id = $1", [parseInt(req.params.id)]);

        const playing_11_team2 = await pool.query("SELECT player.player_id, player_name FROM player, player_match, match \
        WHERE player_match.match_id = match.match_id AND player.player_id = player_match.player_id \
        AND player_match.team_id = match.team2 AND match.match_id = $1", [parseInt(req.params.id)]);

        //scorecard
        const innings1_batting = await pool.query("WITH bbb_team(match_id, over_id, ball_id, runs, player_id, team_id) AS \
        (SELECT ball_by_ball.match_id, over_id, ball_id, runs_scored AS runs, striker, team_id \
        FROM ball_by_ball, player_match WHERE striker=player_match.player_id AND player_match.match_id = ball_by_ball.match_id \
        AND ball_by_ball.match_id = $1 AND innings_no=1), \
        playing_11(player_id) AS \
        (SELECT DISTINCT player_match.player_id FROM player_match, bbb_team WHERE player_match.match_id = bbb_team.match_id \
        AND player_match.team_id=(SELECT DISTINCT team_id FROM bbb_team)), \
        player_balls(player_id, balls, over_id, ball_id) AS \
        (SELECT bbb_team.player_id, COUNT(*), MIN(over_id), MIN(ball_id) FROM bbb_team \
        GROUP BY bbb_team.player_id), \
        player_runs(player_id, runs) AS \
        (SELECT player_id, SUM(runs) FROM bbb_team \
        GROUP BY player_id), \
        player_fours(player_id, fours) AS \
        (SELECT player_id, COUNT(*) FROM bbb_team \
         WHERE runs=4 \
        GROUP BY player_id), \
        player_sixes(player_id, sixes) AS \
        (SELECT player_id, COUNT(*) FROM bbb_team \
         WHERE runs=6 \
        GROUP BY player_id), \
        scorecard(player_id, runs, fours, sixes, balls, over_id, ball_id) AS \
        (SELECT playing_11.player_id, COALESCE(runs, 0), COALESCE(fours, 0), COALESCE(sixes, 0), COALESCE(balls, 0), COALESCE(over_id, 100), COALESCE(ball_id, 100) \
         FROM playing_11 \
         FULL OUTER JOIN player_balls ON (playing_11.player_id = player_balls.player_id) \
         FULL OUTER JOIN player_fours ON (playing_11.player_id = player_fours.player_id) \
         FULL OUTER JOIN player_runs ON (playing_11.player_id = player_runs.player_id) \
         FULL OUTER JOIN player_sixes ON (playing_11.player_id = player_sixes.player_id) \
        ) \
        SELECT player.player_id, player_name, runs, fours, sixes, balls FROM scorecard, player \
        WHERE player.player_id = scorecard.player_id \
        ORDER BY over_id, ball_id, player.player_id", [parseInt(req.params.id)]);

        const innings1_bowling = await pool.query("WITH bbb_wkts(bowler, over_id, ball_id, runs, wkt) AS \
        (SELECT bowler, over_id, ball_id, runs_scored, 1 FROM ball_by_ball \
        WHERE out_type IS NOT NULL AND out_type NOT IN ('retired hurt', 'run out') \
        AND match_id = $1 AND innings_no = 1 \
        UNION \
        SELECT bowler, over_id, ball_id, (runs_scored + extra_runs), 0 FROM ball_by_ball \
        WHERE (out_type IS NULL OR out_type IN ('retired hurt', 'run out')) \
        AND match_id = $1 AND innings_no = 1), \
        bowler_summary(bowler, balls, runs, wickets) AS \
        (SELECT bowler, COUNT(*), SUM(runs), SUM(wkt) FROM bbb_wkts \
         GROUP BY bowler) \
        SELECT player.player_id, player_name AS bowler, balls, runs, wickets FROM bowler_summary, player \
        WHERE player.player_id = bowler", [parseInt(req.params.id)]);


        const innings2_batting = await pool.query("WITH bbb_team(match_id, over_id, ball_id, runs, player_id, team_id) AS \
        (SELECT ball_by_ball.match_id, over_id, ball_id, runs_scored AS runs, striker, team_id \
        FROM ball_by_ball, player_match WHERE striker=player_match.player_id AND player_match.match_id = ball_by_ball.match_id \
        AND ball_by_ball.match_id = $1 AND innings_no=2), \
        playing_11(player_id) AS \
        (SELECT DISTINCT player_match.player_id FROM player_match, bbb_team WHERE player_match.match_id = bbb_team.match_id \
        AND player_match.team_id=(SELECT DISTINCT team_id FROM bbb_team)), \
        player_balls(player_id, balls, over_id, ball_id) AS \
        (SELECT bbb_team.player_id, COUNT(*), MIN(over_id), MIN(ball_id) FROM bbb_team \
        GROUP BY bbb_team.player_id), \
        player_runs(player_id, runs) AS \
        (SELECT player_id, SUM(runs) FROM bbb_team \
        GROUP BY player_id), \
        player_fours(player_id, fours) AS \
        (SELECT player_id, COUNT(*) FROM bbb_team \
         WHERE runs=4 \
        GROUP BY player_id), \
        player_sixes(player_id, sixes) AS \
        (SELECT player_id, COUNT(*) FROM bbb_team \
         WHERE runs=6 \
        GROUP BY player_id), \
        scorecard(player_id, runs, fours, sixes, balls, over_id, ball_id) AS \
        (SELECT playing_11.player_id, COALESCE(runs, 0), COALESCE(fours, 0), COALESCE(sixes, 0), COALESCE(balls, 0), COALESCE(over_id, 100), COALESCE(ball_id, 100) \
         FROM playing_11 \
         FULL OUTER JOIN player_balls ON (playing_11.player_id = player_balls.player_id) \
         FULL OUTER JOIN player_fours ON (playing_11.player_id = player_fours.player_id) \
         FULL OUTER JOIN player_runs ON (playing_11.player_id = player_runs.player_id) \
         FULL OUTER JOIN player_sixes ON (playing_11.player_id = player_sixes.player_id) \
        ) \
        SELECT player.player_id, player_name, runs, fours, sixes, balls FROM scorecard, player \
        WHERE player.player_id = scorecard.player_id \
        ORDER BY over_id, ball_id, player.player_id", [parseInt(req.params.id)]);

        const innings2_bowling = await pool.query("WITH bbb_wkts(bowler, over_id, ball_id, runs, wkt) AS \
        (SELECT bowler, over_id, ball_id, runs_scored, 1 FROM ball_by_ball \
        WHERE out_type IS NOT NULL AND out_type NOT IN ('retired hurt', 'run out') \
        AND match_id = $1 AND innings_no = 2 \
        UNION \
        SELECT bowler, over_id, ball_id, (runs_scored + extra_runs), 0 FROM ball_by_ball \
        WHERE (out_type IS NULL OR out_type IN ('retired hurt', 'run out')) \
        AND match_id = $1 AND innings_no = 2), \
        bowler_summary(bowler, balls, runs, wickets) AS \
        (SELECT bowler, COUNT(*), SUM(runs), SUM(wkt) FROM bbb_wkts \
         GROUP BY bowler) \
        SELECT player.player_id, player_name AS bowler, balls, runs, wickets FROM bowler_summary, player \
        WHERE player.player_id = bowler", [parseInt(req.params.id)]);

        //match summary
        const innings1_batting_summary = await pool.query("WITH bbb_team(match_id, over_id, ball_id, runs, player_id, team_id) AS \
        (SELECT ball_by_ball.match_id, over_id, ball_id, runs_scored AS runs, striker, team_id \
        FROM ball_by_ball, player_match WHERE striker=player_match.player_id AND player_match.match_id = ball_by_ball.match_id  \
        AND ball_by_ball.match_id = $1 AND innings_no=1), \
        playing_11(player_id) AS \
        (SELECT DISTINCT player_match.player_id FROM player_match, bbb_team WHERE player_match.match_id = bbb_team.match_id \
        AND player_match.team_id=(SELECT DISTINCT team_id FROM bbb_team)), \
        player_balls(player_id, balls, over_id, ball_id) AS \
        (SELECT bbb_team.player_id, COUNT(*), MIN(over_id), MIN(ball_id) FROM bbb_team \
        GROUP BY bbb_team.player_id), \
        player_runs(player_id, runs) AS \
        (SELECT player_id, SUM(runs) FROM bbb_team \
        GROUP BY player_id), \
        player_fours(player_id, fours) AS \
        (SELECT player_id, COUNT(*) FROM bbb_team \
         WHERE runs=4 \
        GROUP BY player_id), \
        player_sixes(player_id, sixes) AS \
        (SELECT player_id, COUNT(*) FROM bbb_team \
         WHERE runs=6 \
        GROUP BY player_id), \
        scorecard(player_id, runs, fours, sixes, balls, over_id, ball_id) AS \
        (SELECT playing_11.player_id, COALESCE(runs, 0), COALESCE(fours, 0), COALESCE(sixes, 0), COALESCE(balls, 0), COALESCE(over_id, 100), COALESCE(ball_id, 100) \
         FROM playing_11 \
         FULL OUTER JOIN player_balls ON (playing_11.player_id = player_balls.player_id) \
         FULL OUTER JOIN player_fours ON (playing_11.player_id = player_fours.player_id) \
         FULL OUTER JOIN player_runs ON (playing_11.player_id = player_runs.player_id) \
         FULL OUTER JOIN player_sixes ON (playing_11.player_id = player_sixes.player_id) \
        ), \
        final_scorecard(player_id, player_name, runs, fours, sixes, balls) AS \
        (SELECT player.player_id, player_name, runs, fours, sixes, balls FROM scorecard, player \
        WHERE player.player_id = scorecard.player_id \
        ORDER BY over_id, ball_id, player.player_id) \
        SELECT player_id, player_name, runs, balls FROM final_scorecard \
        ORDER BY runs DESC, balls ASC, player_name ASC \
        LIMIT 3", [parseInt(req.params.id)]);

        const innings1_bowler_summary = await pool.query("WITH bbb_wkts(bowler, over_id, ball_id, runs, wkt) AS \
        (SELECT bowler, over_id, ball_id, runs_scored, 1 FROM ball_by_ball \
        WHERE out_type IS NOT NULL AND out_type NOT IN ('retired hurt', 'run out') \
        AND match_id = $1 AND innings_no = 1 \
        UNION \
        SELECT bowler, over_id, ball_id, (runs_scored + extra_runs), 0 FROM ball_by_ball \
        WHERE (out_type IS NULL OR out_type IN ('retired hurt', 'run out')) \
        AND match_id = $1 AND innings_no = 1), \
        bowler_summary(bowler, balls, runs, wickets) AS \
        (SELECT bowler, COUNT(*), SUM(runs), SUM(wkt) FROM bbb_wkts \
         GROUP BY bowler), \
         bowler_scorecard(player_id, bowler, runs, wickets) AS \
        (SELECT player.player_id, player_name AS bowler, runs, wickets FROM bowler_summary, player \
        WHERE player.player_id = bowler) \
        SELECT player_id, bowler, runs, wickets FROM bowler_scorecard \
        WHERE wickets > 0 \
        ORDER BY wickets DESC, runs ASC, bowler ASC \
        LIMIT 3", [parseInt(req.params.id)]);

        const innings1_score_extras = await pool.query("WITH bbb_team(over_id, ball_id, runs, extras, out_type, striker, team_id) AS \
        (SELECT over_id, ball_id, (runs_scored + extra_runs) AS runs, extra_runs, out_type, striker, team_id \
        FROM ball_by_ball, player_match WHERE striker=player_match.player_id AND player_match.match_id = ball_by_ball.match_id  \
        AND ball_by_ball.match_id = $1 AND innings_no=1), \
        ball_wicket(over_id, ball_id, runs, extras, wicket) AS \
        (SELECT over_id, ball_id, runs, extras, 1 FROM bbb_team \
        WHERE out_type IS NOT NULL \
        UNION  \
        SELECT over_id, ball_id, runs, extras, 0 FROM bbb_team \
        WHERE out_type IS NULL) \
        SELECT SUM(runs) as total, SUM(wicket) as wickets, SUM(extras) AS extras FROM ball_wicket", [parseInt(req.params.id)]);


        const innings2_batting_summary = await pool.query("WITH bbb_team(match_id, over_id, ball_id, runs, player_id, team_id) AS \
        (SELECT ball_by_ball.match_id, over_id, ball_id, runs_scored AS runs, striker, team_id \
        FROM ball_by_ball, player_match WHERE striker=player_match.player_id AND player_match.match_id = ball_by_ball.match_id  \
        AND ball_by_ball.match_id = $1 AND innings_no=2), \
        playing_11(player_id) AS \
        (SELECT DISTINCT player_match.player_id FROM player_match, bbb_team WHERE player_match.match_id = bbb_team.match_id \
        AND player_match.team_id=(SELECT DISTINCT team_id FROM bbb_team)), \
        player_balls(player_id, balls, over_id, ball_id) AS \
        (SELECT bbb_team.player_id, COUNT(*), MIN(over_id), MIN(ball_id) FROM bbb_team \
        GROUP BY bbb_team.player_id), \
        player_runs(player_id, runs) AS \
        (SELECT player_id, SUM(runs) FROM bbb_team \
        GROUP BY player_id), \
        player_fours(player_id, fours) AS \
        (SELECT player_id, COUNT(*) FROM bbb_team \
         WHERE runs=4 \
        GROUP BY player_id), \
        player_sixes(player_id, sixes) AS \
        (SELECT player_id, COUNT(*) FROM bbb_team \
         WHERE runs=6 \
        GROUP BY player_id), \
        scorecard(player_id, runs, fours, sixes, balls, over_id, ball_id) AS \
        (SELECT playing_11.player_id, COALESCE(runs, 0), COALESCE(fours, 0), COALESCE(sixes, 0), COALESCE(balls, 0), COALESCE(over_id, 100), COALESCE(ball_id, 100) \
         FROM playing_11 \
         FULL OUTER JOIN player_balls ON (playing_11.player_id = player_balls.player_id) \
         FULL OUTER JOIN player_fours ON (playing_11.player_id = player_fours.player_id) \
         FULL OUTER JOIN player_runs ON (playing_11.player_id = player_runs.player_id) \
         FULL OUTER JOIN player_sixes ON (playing_11.player_id = player_sixes.player_id) \
        ), \
        final_scorecard(player_id, player_name, runs, fours, sixes, balls) AS \
        (SELECT player.player_id, player_name, runs, fours, sixes, balls FROM scorecard, player \
        WHERE player.player_id = scorecard.player_id \
        ORDER BY over_id, ball_id, player.player_id) \
        SELECT player_id, player_name, runs, balls FROM final_scorecard \
        ORDER BY runs DESC, balls ASC, player_name ASC \
        LIMIT 3", [parseInt(req.params.id)]);

        const innings2_bowler_summary = await pool.query("WITH bbb_wkts(bowler, over_id, ball_id, runs, wkt) AS \
        (SELECT bowler, over_id, ball_id, runs_scored, 1 FROM ball_by_ball \
        WHERE out_type IS NOT NULL AND out_type NOT IN ('retired hurt', 'run out') \
        AND match_id = $1 AND innings_no = 2 \
        UNION \
        SELECT bowler, over_id, ball_id, (runs_scored + extra_runs), 0 FROM ball_by_ball \
        WHERE (out_type IS NULL OR out_type IN ('retired hurt', 'run out')) \
        AND match_id = $1 AND innings_no = 2), \
        bowler_summary(bowler, balls, runs, wickets) AS \
        (SELECT bowler, COUNT(*), SUM(runs), SUM(wkt) FROM bbb_wkts \
         GROUP BY bowler), \
         bowler_scorecard(player_id, bowler, runs, wickets) AS \
        (SELECT player.player_id, player_name AS bowler, runs, wickets FROM bowler_summary, player \
        WHERE player.player_id = bowler) \
        SELECT player_id, bowler, runs, wickets FROM bowler_scorecard \
        WHERE wickets > 0 \
        ORDER BY wickets DESC, runs ASC, bowler ASC \
        LIMIT 3", [parseInt(req.params.id)]);

        const innings2_score_extras = await pool.query("WITH bbb_team(over_id, ball_id, runs, extras, out_type, striker, team_id) AS \
        (SELECT over_id, ball_id, (runs_scored + extra_runs) AS runs, extra_runs, out_type, striker, team_id \
        FROM ball_by_ball, player_match WHERE striker=player_match.player_id AND player_match.match_id = ball_by_ball.match_id  \
        AND ball_by_ball.match_id = $1 AND innings_no=2), \
        ball_wicket(over_id, ball_id, runs, extras, wicket) AS \
        (SELECT over_id, ball_id, runs, extras, 1 FROM bbb_team \
        WHERE out_type IS NOT NULL \
        UNION  \
        SELECT over_id, ball_id, runs, extras, 0 FROM bbb_team \
        WHERE out_type IS NULL) \
        SELECT SUM(runs) as total, SUM(wicket) as wickets, SUM(extras) AS extras FROM ball_wicket", [parseInt(req.params.id)]);


        //pie chart
        const pie_chart_innings1 = await pool.query("WITH bbb(over_id, ball_id, runs, extras) AS \
        (SELECT over_id, ball_id, runs_scored, extra_runs FROM ball_by_ball \
        WHERE match_id = $1 AND innings_no = 1), \
        num_ones(ones) AS \
        (SELECT SUM(runs) FROM bbb WHERE runs=1), \
        num_twos(twos) AS \
        (SELECT SUM(runs) FROM bbb WHERE runs=2), \
        num_threes(threes) AS \
        (SELECT SUM(runs) FROM bbb WHERE runs=3), \
        num_fours(fours) AS \
        (SELECT SUM(runs) FROM bbb WHERE runs=4), \
        num_fives(fives) AS \
        (SELECT SUM(runs) FROM bbb WHERE runs=5), \
        num_sixes(sixes) AS \
        (SELECT SUM(runs) FROM bbb WHERE runs=6), \
        num_extras(extras) AS \
        (SELECT SUM(extras) FROM bbb) \
        SELECT COALESCE(ones, 0) as ones, COALESCE(twos, 0) as twos, COALESCE(threes, 0) as threes, COALESCE(fours, 0) as fours \
        , COALESCE(fives, 0) as fives, COALESCE(sixes, 0) as sixes, COALESCE(extras, 0) as extras \
        FROM num_ones, num_twos, num_threes, num_fours, num_fives, num_sixes, num_extras", [req.params.id]);

        const pie_chart_innings2 = await pool.query("WITH bbb(over_id, ball_id, runs, extras) AS \
        (SELECT over_id, ball_id, runs_scored, extra_runs FROM ball_by_ball \
        WHERE match_id = $1 AND innings_no = 2), \
        num_ones(ones) AS \
        (SELECT SUM(runs) FROM bbb WHERE runs=1), \
        num_twos(twos) AS \
        (SELECT SUM(runs) FROM bbb WHERE runs=2), \
        num_threes(threes) AS \
        (SELECT SUM(runs) FROM bbb WHERE runs=3), \
        num_fours(fours) AS \
        (SELECT SUM(runs) FROM bbb WHERE runs=4), \
        num_fives(fives) AS \
        (SELECT SUM(runs) FROM bbb WHERE runs=5), \
        num_sixes(sixes) AS \
        (SELECT SUM(runs) FROM bbb WHERE runs=6), \
        num_extras(extras) AS \
        (SELECT SUM(extras) FROM bbb) \
        SELECT COALESCE(ones, 0) as ones, COALESCE(twos, 0) as twos, COALESCE(threes, 0) as threes, COALESCE(fours, 0) as fours \
        , COALESCE(fives, 0) as fives, COALESCE(sixes, 0) as sixes, COALESCE(extras, 0) as extras \
        FROM num_ones, num_twos, num_threes, num_fours, num_fives, num_sixes, num_extras", [req.params.id]);


        res.json({
            innings1_progress: innings1_progress.rows,
            innings2_progress: innings2_progress.rows,

            match_info_without_11: match_info_without_11.rows,
            playing_11_team1: playing_11_team1.rows,
            playing_11_team2: playing_11_team2.rows,

            innings1_batting: innings1_batting.rows,
            innings1_bowling: innings1_bowling.rows,
            innings2_batting: innings2_batting.rows,
            innings2_bowling: innings2_bowling.rows,

            innings1_batting_summary: innings1_batting_summary.rows,
            innings1_bowler_summary: innings1_bowler_summary.rows,
            innings1_score_extras: innings1_score_extras.rows,
            innings2_batting_summary: innings2_batting_summary.rows,
            innings2_bowler_summary: innings2_bowler_summary.rows,
            innings2_score_extras: innings2_score_extras.rows,

            pie_chart_innings1: pie_chart_innings1.rows,
            pie_chart_innings2: pie_chart_innings2.rows
        });
        
    } catch (err) {
        console.error(err.message);
    }
})

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
        // Basic Information
        const player = await pool.query('SELECT * FROM player WHERE player_id = $1', [parseInt(req.params.id)]);
        
        // Batting Stats
        const matches = await pool.query("select count(*) from player_match where player_id = $1", [parseInt(req.params.id)]);
        const runs = await pool.query("select sum(runs_scored) from ball_by_ball where striker = $1", [parseInt(req.params.id)]);
        const fours = await pool.query("select count(*) from ball_by_ball where striker = $1 and runs_scored = 4", [parseInt(req.params.id)]);
        const sixes = await pool.query("select count(*) from ball_by_ball where striker = $1 and runs_scored = 6", [parseInt(req.params.id)]);
        const fifties = await pool.query("select count(*) from (select match_id, sum(runs_scored) from ball_by_ball where striker = $1 group by match_id) as t where t.sum >= 50 and t.sum < 100", [parseInt(req.params.id)]);
        const highest = await pool.query("select max(runs) from (select match_id, sum(runs_scored) as runs from ball_by_ball where striker = $1 group by match_id) as t", [parseInt(req.params.id)]);
        const strike_rate = await pool.query('SELECT COALESCE(((SUM(runs_scored) * 1.0 / COUNT(*)) * 100.0), 0.0) AS strike_rate FROM ball_by_ball WHERE striker = $1', [parseInt(req.params.id)]);
        const batting_avg = await pool.query('SELECT COALESCE((SUM(runs_scored) * 1.0 / COALESCE(Nullif((SELECT COUNT(*) FROM ball_by_ball WHERE striker = $1 AND out_type IS NOT NULL), 0), 1.0)), 0.0) AS batting_avg FROM ball_by_ball WHERE striker = $1', [parseInt(req.params.id)]);

        // Runs Scored along with match id
        const runs_match = await pool.query("SELECT match_id, sum(runs_scored) as runs FROM ball_by_ball WHERE striker = $1 group by match_id order by match_id", [parseInt(req.params.id)]);
        
        // Bowling Stats
        const matches_bowled = await pool.query('SELECT COUNT(DISTINCT match_id) AS matches_bowled FROM ball_by_ball WHERE bowler = $1', [parseInt(req.params.id)]);
        const balls_bowled = await pool.query('SELECT COUNT(*) as balls_bowled FROM ball_by_ball WHERE bowler = $1', [parseInt(req.params.id)]);
        const runs_conceded = await pool.query('SELECT SUM(runs_scored) AS runs_conceded FROM ball_by_ball WHERE bowler = $1', [parseInt(req.params.id)]);
        const overs_bowled = await pool.query('SELECT COUNT(*) AS overs_bowled FROM (SELECT DISTINCT match_id, innings_no, over_id FROM ball_by_ball WHERE bowler = $1) as table1', [parseInt(req.params.id)]);
        const wickets_taken = await pool.query("SELECT COUNT(*) AS wickets_taken FROM ball_by_ball WHERE bowler = $1 AND out_type IS NOT NULL AND out_type NOT IN ('run out', 'retired hurt')", [parseInt(req.params.id)]);
        var economy = 0.0;
        const five_wicket_hauls = await pool.query("SELECT COUNT(*) as five_wicket_hauls FROM (SELECT COUNT(*) AS wkts, match_id FROM ball_by_ball WHERE bowler = $1 AND out_type IS NOT NULL AND out_type NOT IN ('run out', 'retired hurt') GROUP BY match_id) table1 WHERE wkts >= 5", [parseInt(req.params.id)]);

        // runs conceded and wickets taken per match
        const runs_wickets_match = await pool.query("WITH bbb_wkts(match_id, innings_no, over_id, ball_id, runs, wkt) AS \
        (SELECT match_id, innings_no, over_id, ball_id, (runs_scored + extra_runs), 1 FROM ball_by_ball \
        WHERE out_type IS NOT NULL AND out_type NOT IN ('retired hurt', 'run out') AND bowler=$1 \
        UNION \
        SELECT match_id, innings_no, over_id, ball_id, (runs_scored + extra_runs), 0 FROM ball_by_ball \
        WHERE (out_type IS NULL OR out_type IN ('retired hurt', 'run out')) AND bowler=$1) \
        SELECT match_id, SUM(runs) AS runs, SUM(wkt) AS wickets FROM bbb_wkts \
        GROUP BY match_id \
        ORDER BY match_id", [parseInt(req.params.id)]);
        
        if(overs_bowled.rows[0].overs_bowled != 0)
        {
            economy = parseFloat(runs_conceded.rows[0].runs_conceded) / parseFloat(overs_bowled.rows[0].overs_bowled);
        }

        if (runs.rows[0].sum === null) {
            runs.rows[0].sum = 0;
        }
        if (runs_conceded.rows[0].runs_conceded === null) {
            runs_conceded.rows[0].runs_conceded = 0;
        }
        if (highest.rows[0].max === null) {
            highest.rows[0].max = 0;
        }
    
        res.json({
            player_id: player.rows[0].player_id,
            player_name: player.rows[0].player_name,
            country_name: player.rows[0].country_name,
            batting_skill: player.rows[0].batting_hand,
            bowling_skill: player.rows[0].bowling_skill,

            runs_match: runs_match.rows,
            matches_bat: matches.rows[0].count,
            runs_bat: runs.rows[0].sum,
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
            five_wicket_hauls: five_wicket_hauls.rows[0].five_wicket_hauls,

            runs_conceded_match: runs_wickets_match.rows
        });

    } catch (err) {
        console.error(err.message);
    }
});

app.get('/years', async (req, res) => {
    try {
        const years = await pool.query('SELECT DISTINCT season_year FROM match ORDER BY season_year ASC');
        res.json(years.rows);
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
                 ball_team(match_id, innings_no, over_id, ball_id, runs, striker, batting_team, bowling_team) AS \
                  (SELECT match.match_id, innings_no, over_id, ball_id, (runs_scored + extra_runs), striker, A.team_id, B.team_id \
                  FROM ball_by_ball, match, player_match A, player_match B WHERE match.match_id=ball_by_ball.match_id AND  \
                   match.match_id=A.match_id AND match.match_id = B.match_id AND match.season_year=$1 \
                   AND A.player_id=striker AND B.player_id = bowler), \
                 overs(match_id, innings_no, over_id, runs, batting_team, bowling_team) AS \
                 (SELECT match_id, innings_no, over_id, SUM(runs), batting_team, bowling_team FROM ball_team \
                 GROUP BY match_id, innings_no, over_id, batting_team, bowling_team), \
                 batting_rr(team_id, rr) AS \
                 (SELECT batting_team, ((SUM(runs) * 1.0) / (COUNT(*) * 1.0)) FROM overs \
                 GROUP BY batting_team), \
                 bowling_rr(team_id, rr) AS \
                 (SELECT bowling_team, ((SUM(runs) * 1.0) / (COUNT(*) * 1.0)) FROM overs \
                 GROUP BY bowling_team), \
                 teams_nrr(team_id, nrr) AS \
                 (SELECT batting_rr.team_id, (batting_rr.rr - bowling_rr.rr) FROM batting_rr, bowling_rr \
                 WHERE batting_rr.team_id = bowling_rr.team_id) \
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
        const venues = await pool.query("WITH venue_matches(venue_id, num_matches) AS \
        (SELECT venue_id, COUNT(*) FROM match GROUP BY venue_id) \
        SELECT venue.venue_id AS venue_id, venue_name, city_name, country_name, capacity, COALESCE(num_matches, 0) AS matches_played \
        FROM venue \
        FULL OUTER JOIN venue_matches ON (venue.venue_id = venue_matches.venue_id)");
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
        const highest_chased = await pool.query("WITH chased_innings_totals(match_id, total) AS \
        (SELECT ball_by_ball.match_id, SUM(runs_scored+extra_runs) FROM ball_by_ball, match \
        WHERE ball_by_ball.match_id = match.match_id AND match.venue_id = $1 AND innings_no=2 \
        AND match.win_type='wickets' \
        GROUP BY ball_by_ball.match_id) \
        SELECT MAX(total) AS total FROM chased_innings_totals", [parseInt(req.params.id)]);

        const matches_won_bat = await pool.query("SELECT count(*) FROM match WHERE venue_id = $1 AND ((match_winner = toss_winner and toss_name = 'bat') or (match_winner != toss_winner and toss_name = 'field'))", [parseInt(req.params.id)]);
        const matches_won_bowl = await pool.query("SELECT count(*) FROM match WHERE venue_id = $1 AND ((match_winner = toss_winner and toss_name = 'field') or (match_winner != toss_winner and toss_name = 'bat'))", [parseInt(req.params.id)]);
        const matches_draw = await pool.query("SELECT count(*) FROM match WHERE venue_id = $1 AND (match_winner is NULL or (match_winner != team1 and match_winner != team2))", [parseInt(req.params.id)]);

        const avg_first_innings_score = await pool.query("WITH bbb_yr(match_id, innings_no, over_id, ball_id, runs, season_year, parity) AS \
        (SELECT match.match_id, innings_no, over_id, ball_id, (runs_scored+extra_runs), season_year, ((season_year-1)/2) FROM ball_by_ball bbb, match, venue \
        WHERE bbb.match_id = match.match_id AND innings_no=1 AND venue.venue_id = $1 AND match.venue_id = venue.venue_id), \
        match_total(match_id, total, season_year, parity) AS \
        (SELECT match_id, SUM(runs), MIN(season_year), parity FROM bbb_yr \
        GROUP BY match_id, parity) \
        SELECT season_year, AVG(total) AS score FROM match_total \
        GROUP BY season_year", [parseInt(req.params.id)]);

        if (highest_chased.rows[0].total === null) {
            highest_chased.rows[0].total = 0;
        }

        res.json({
            venue_id: venue.rows[0].venue_id,
            venue_name: venue.rows[0].venue_name,
            address: venue.rows[0].city_name + ', '+ venue.rows[0].country_name,
            capacity: parseInt(venue.rows[0].capacity),
            matches: parseInt(matches.rows[0].count),
            highest_rec: parseInt(highest_rec.rows[0].max),
            lowest_rec: parseInt(lowest_rec.rows[0].min),
            highest_chased: parseInt(highest_chased.rows[0].total),
            matches_won_bat: parseInt(matches_won_bat.rows[0].count)/parseInt(matches.rows[0].count)*100,
            matches_won_bowl: parseInt(matches_won_bowl.rows[0].count)/parseInt(matches.rows[0].count)*100,
            matches_draw: parseInt(matches_draw.rows[0].count)/parseInt(matches.rows[0].count)*100,
            avg_first_innings_score: avg_first_innings_score.rows
        });

    } catch (err) {
        console.error(err.message);
    }
});

app.listen(3000, (req, res) => {
    console.log('Node Server is running on port 3000');
});