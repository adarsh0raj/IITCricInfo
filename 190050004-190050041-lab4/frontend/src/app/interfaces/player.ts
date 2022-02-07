export interface runsVSmatch {
    match_id: number;
    runs: number;
}

export interface runs_wickets_match {
    match_id: number;
    runs: number;
    wickets: number;
}

export interface player {
    player_id: number;
    player_name: string;
    country_name: string;
    batting_skill: string;
    bowling_skill: string;  

    runs_match: runsVSmatch[];
    matches_bat: number;
    runs_bat: number;
    fours: number;
    sixes: number;
    fifties: number;
    highest: number;
    strike_rate: number;
    batting_avg: number;

    matches_bowled: number;
    balls_bowled: number;
    runs_conceded: number;
    overs_bowled: number;
    wickets_taken: number;
    economy: number;
    five_wicket_hauls: number;

    runs_conceded_match: runs_wickets_match[];
}