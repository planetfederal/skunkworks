
#Sportsnut App

Map of the matches from the upcoming 2014 World Cup in Brazil.

## Datasets

### OSM Basemap

The basemap for the app consists of OSM for the entire country of Brazil. The original data was
taken from the [Geofabrik](http://www.geofabrik.de/) export and 
[osm2pgsql](http://wiki.openstreetmap.org/wiki/Osm2pgsql) was used to import the data into PostGIS. 

GeoServer styles and configuration were taken from [here](https://github.com/boundlessgeo/suite-data/tree/master/openstreetmap). This involved splitting up the raw OSM import into multiple tables.

### World Cup Data

The the world cup data model is made up of the following entities. All the data was taken from
the [World Cup 2014](http://en.wikipedia.org/wiki/2014_FIFA_World_Cup) Wikipedia page and copied
into a CSV document. The CSV data was then processed to import into PostGIS. Processing scripts 
are located in the backend/etl directory.

#### Teams

The individual countries participating in the games.

     Column | Type 
    --------+------
     name   | text 
     icon   | text 

#### Stadiums

The collection of stadiums (with location) hosting matches.

     Column  |   Type   
    ---------+----------
     stadium | text     
     lat     | numeric  
     lon     | numeric  
     latlon  | geometry 


#### Matches 

The collection of matches with time.

       Column   |            Type             
    ------------+-----------------------------
     time       | timestamp without time zone 
     team1      | text                        
     team2      | text                        
     stadium    | text                        
     timezone   | text                        
     identifier | text                        

#### Matchview

A denormalized view resulting from joining all the stadium, team, and match data.

       Column   |            Type             
    ------------+-----------------------------
     time       | timestamp without time zone 
     team1      | text                        
     team2      | text                        
     stadium    | text                        
     timezone   | text                        
     identifier | text                        
     icon1      | text                        
     icon2      | text                        
     latlon     | geometry                    

    CREATE OR REPLACE VIEW matchview AS
     SELECT m."time",
        m.team1,
        m.team2,
        m.stadium,
        m.timezone,
        m.identifier,
        ( SELECT teams.icon
               FROM teams
              WHERE teams.name = m.team1) AS icon1,
        ( SELECT teams.icon
               FROM teams
              WHERE teams.name = m.team2) AS icon2,
        ( SELECT stadiums.latlon
               FROM stadiums
              WHERE stadiums.stadium = m.stadium) AS latlon
       FROM matches m;

## Installation

The demo application was run on a Ubuntu 12.04 system.

### OpenGeo Suite

The base OpenGeo Suite installation was setup as described [here](http://suite.opengeo.org/opengeo-docs/installation/index.html).






