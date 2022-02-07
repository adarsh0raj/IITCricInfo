DROP TABLE if exists ball_by_ball cascade ;
DROP TABLE if exists player_match cascade;
DROP TABLE if exists match cascade;
DROP TABLE if exists team cascade;
DROP TABLE if exists player cascade;
DROP TABLE if exists venue cascade;
DROP TABLE if exists umpire cascade;
DROP TABLE if exists umpire_match cascade;
DROP TABLE if exists "owner" cascade;
DROP SEQUENCE if exists venue_id_sequence cascade;

--Team id and name
CREATE TABLE   team (
    team_id INT ,
    team_name TEXT,
    Primary key(team_id)
);

--Player information
CREATE TABLE player (
    player_id INT,
    player_name TEXT,
    dob DATE,
    batting_hand TEXT,
    bowling_skill TEXT,
    country_name TEXT,
    Primary Key(player_id)
);

--Venue information
CREATE TABLE venue (
    venue_id INT,
    venue_name TEXT,
    city_name TEXT,
    country_name TEXT,
    capacity INT,
    Primary Key(venue_id)
);

--Match information
CREATE TABLE   match (
    match_id INT,
    season_year INT, 
    team1 INT,
    team2 INT,
    venue_Id INT,
    toss_winner INT,
    match_winner INT,
    toss_name TEXT CHECK(toss_name='field' or toss_name='bat'),
    win_type TEXT CHECK(win_type='wickets' or win_type='runs' or win_type IS NULL),
    man_of_match INT,
    win_margin INT,
    attendance INT,
    PRIMARY KEY(match_id),
    FOREIGN KEY(venue_id) references venue on delete set null,
    FOREIGN KEY(team1) references team on delete set null,
    FOREIGN KEY(team2) references team on delete set null,
    FOREIGN KEY(toss_winner) references team on delete set null,
    FOREIGN KEY(match_winner) references team on delete set null,
    FOREIGN KEY(man_of_match) references player on delete set null
);

--For each match contains all players along with their role and team
CREATE TABLE   player_match (
    playermatch_key bigINT,
    match_id INT,
    player_id INT,
    role_desc TEXT CHECK(role_desc='Player' or role_desc='Keeper' or role_desc='CaptainKeeper' or role_desc='Captain'),
    team_id INT,
    PRIMARY KEY(playermatch_key),
    FOREIGN KEY(match_id) references match on delete set null,
    FOREIGN KEY(player_id) references player on delete set null,
    FOREIGN KEY(team_id) references team on delete set null
     
);

--Information for each ball
CREATE TABLE   ball_by_ball (
    match_id INT,
    innings_no INT CHECK(innings_no=1 or innings_no=2),  
    over_id INT,
    ball_id INT,
    runs_scored INT CHECK(runs_scored between 0 and 6),
    extra_runs INT,
    out_type TEXT CHECK(out_type='caught' or out_type='caught and bowled' or out_type='bowled' or out_type='stumped' or out_type='retired hurt' or out_type='keeper catch' or out_type='lbw' or out_type='run out' or out_type='hit wicket' or out_type IS null),
    striker INT,
    non_striker INT,
    bowler INT,
    PRIMARY KEY(match_id, innings_no, over_id,ball_id),
    Foreign Key (match_id) references match on delete set null,
    Foreign Key(striker) references player on delete set null,
    Foreign Key(non_striker) references player on delete set null,
    Foreign Key(bowler) references player on delete set null
);

--Owner Information
CREATE TABLE "owner"(
    owner_id INT,
    owner_name TEXT,
    owner_type TEXT,
    team_id INT,
    stake INT CHECK(stake BETWEEN 1 AND 100),
    PRIMARY KEY(owner_id),
    FOREIGN KEY(team_id) references team on delete set null
);

--Umpire Information
CREATE TABLE umpire(
    umpire_id INT,
    umpire_name TEXT,
    country_name TEXT,
    PRIMARY KEY(umpire_id)
);

--For each match contains the umpires and their roles
CREATE TABLE umpire_match(
    umpirematch_key BIGINT,
    match_id INT,
    umpire_id INT,
    role_desc TEXT CHECK(role_desc = 'Field' or role_desc = 'Third'),
    PRIMARY KEY(umpirematch_key),
    FOREIGN KEY(match_id) references match on delete set null,
    FOREIGN KEY(umpire_id) references umpire on delete set null
);


CREATE OR REPLACE FUNCTION attendance_trigger_function()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
    AS
$$
BEGIN
    IF (NEW.attendance > (SELECT DISTINCT capacity FROM venue WHERE venue.venue_id = NEW.venue_id)) THEN
    RAISE EXCEPTION 'Attendance exceeded venue capacity';
    ROLLBACK;
    END IF;
    RETURN NEW;
END;
$$;

CREATE CONSTRAINT TRIGGER attendance_trigger
AFTER INSERT ON "match"
FOR EACH ROW
EXECUTE PROCEDURE attendance_trigger_function();


CREATE OR REPLACE FUNCTION stake_sum_trigger_function()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
    AS
$$
BEGIN
    IF ((SELECT SUM(stake) FROM "owner" 
    WHERE "owner".team_id=NEW.team_id) NOT BETWEEN 1 AND 100) THEN
    RAISE EXCEPTION 'Team stake not between 1 and 100';
    ROLLBACK;
    END IF;
    RETURN NEW;
END;
$$;

CREATE CONSTRAINT TRIGGER stake_sum_trigger
AFTER INSERT ON "owner"
FOR EACH ROW
EXECUTE PROCEDURE stake_sum_trigger_function();


CREATE OR REPLACE FUNCTION umpire_match_trigger_function()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
    AS
$$
BEGIN
    IF (((SELECT COUNT(*) FROM (SELECT COUNT(*) AS ump_count, umpire_match.match_id FROM umpire_match 
    WHERE umpire_match.match_id=NEW.match_id AND role_desc='Field'
    GROUP BY umpire_match.match_id) AS ump_table
    WHERE ump_table.ump_count > 2) <> 0)
    OR ((SELECT COUNT(*) FROM (SELECT COUNT(*) AS ump_count, umpire_match.match_id FROM umpire_match 
    WHERE umpire_match.match_id=NEW.match_id AND role_desc='Third'
    GROUP BY umpire_match.match_id) AS ump_table_again
    WHERE ump_table_again.ump_count > 1) <> 0)) THEN
    RAISE EXCEPTION 'Umpire number constraint violated';
    ROLLBACK;
    END IF;
    RETURN NEW;
END;
$$;

CREATE CONSTRAINT TRIGGER umpire_match_trigger
AFTER INSERT ON umpire_match
FOR EACH ROW
EXECUTE PROCEDURE umpire_match_trigger_function();


CREATE OR REPLACE FUNCTION team_stake_trigger_function()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
    AS
$$
BEGIN
    IF ((SELECT COALESCE(SUM(stake), 0) FROM "owner"
    WHERE "owner".team_id = NEW.team_id) NOT BETWEEN 1 AND 100) THEN
    RAISE EXCEPTION 'Team stake not between 1 and 100';
    ROLLBACK;
    END IF;
    RETURN NEW;
END;
$$;

CREATE CONSTRAINT TRIGGER team_stake_trigger
AFTER INSERT ON team
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE PROCEDURE team_stake_trigger_function();


-- Code for auto-incrementing primary key

CREATE SEQUENCE venue_id_sequence START WITH 1000 INCREMENT BY 1;
ALTER TABLE venue ALTER COLUMN venue_id SET DEFAULT nextval('venue_id_sequence');