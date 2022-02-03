export interface venue {
    venue_id: number;
    venue_name: string;
    city_name: string;
    country_name: string;
    capacity: number;
    matches_played: number;
}

export interface innings_score {
    season_year: number;
    score: number;
}

export interface venue_details {
    venue_id: number;
    venue_name: string;
    address: string;
    capacity: number;
    matches: number;
    highest_rec: number;
    lowest_rec: number;
    highest_chased: number;
    matches_won_bat: number;
    matches_won_bowl: number;
    matches_draw: number;
    avg_first_innings_score: innings_score[];
}