
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS stadiums;
DROP TABLE IF EXISTS teams;

CREATE TABLE stadiums (
  stadium text,
  lat numeric,
  lon numeric,
  latlon geometry,
  CONSTRAINT stadium_pkey PRIMARY KEY (stadium)
);


CREATE TABLE teams (
  name text,
  icon text,
  CONSTRAINT teams_pkey PRIMARY KEY (name)
);

CREATE TABLE matches (
  time timestamp,
  team1 text,
  team2 text,
  stadium text,
  timezone text,
  identifier text,
  CONSTRAINT matches_team1_fkey FOREIGN KEY (team1)
      REFERENCES teams (name),
  CONSTRAINT matches_team2_fkey FOREIGN KEY (team2)
      REFERENCES teams (name),
  CONSTRAINT matches_stadium_fkey FOREIGN KEY (stadium)
      REFERENCES stadiums (stadium)
);
