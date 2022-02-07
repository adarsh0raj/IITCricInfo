export interface match {
    match_id: number;
    team1: string;
    team2: string;
    stadium_name: string;
    city_name: string;
    winner: string;
    win_type: string;
    win_margin: number;
    season_year: number;
}

export interface match_info {
    match_id: number;
    season_year: number;
    team1: string;
    team2: string;
    toss_winner: string;
    toss_name: string;
    venue_name: string;
    umpire_name: string;
}

export interface innings_detail {
    over_id: number;
    runs: number;
    wickets: number;
    team_name: string;
}

export interface player_details {
    player_id: number;
    player_name: string;
}

export interface bat_stats {
    player_id: number;
    player_name: string;
    runs: number;
    fours: number;
    sixes: number;
    balls: number;
}

export interface ball_stats {
    player_id: number;
    bowler: string;
    balls: number;
    runs: number;
    wickets: number;
}

export interface bat_stats2 {
    player_id: number;
    player_name: string;
    runs: number;
    balls: number;
}

export interface ball_stats2 {
    player_id: number;
    bowler: string;
    runs: number;
    wickets: number;
}

export interface extra {
    total: number;
    wickets: number;
    extras: number;
}

export interface chart {
    ones: number;
    twos: number;
    threes: number;
    fours: number;
    fives: number;
    sixes: number;
    extras: number;
}

export interface match_detail {
    full_info: match;
    
    innings1_progress: innings_detail[];
    innings2_progress: innings_detail[];
    match_info_without_11: match_info[];
    playing_11_team1: player_details[];
    playing_11_team2: player_details[];

    innings1_batting: bat_stats[];
    innings2_batting: bat_stats[];

    innings1_bowling: ball_stats[];
    innings2_bowling: ball_stats[];

    innings1_batting_summary: bat_stats2[];
    innings2_batting_summary: bat_stats2[];

    innings1_bowling_summary: ball_stats2[];
    innings2_bowling_summary: ball_stats2[];

    innings1_score_extras: extra[];
    innings2_score_extras: extra[];

    pie_chart_innings1: chart[];
    pie_chart_innings2: chart[];
}