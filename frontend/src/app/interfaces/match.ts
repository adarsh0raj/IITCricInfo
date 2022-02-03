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

export interface match_detail {
    innings1_progress: innings_detail[];
    innings2_progress: innings_detail[];
    match_info_without_11: match_info;
}