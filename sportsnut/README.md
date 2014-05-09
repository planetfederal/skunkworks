
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
are located in the `backend/etl` directory.

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

#### Flags

SVG files for all flags were converted to png and placed into the `styles` directory of the 
GeoServer data directory.

#### Lodging

A GeoServer parameterized SQL view for providing the nearest n hotels based on location. The idea
being that a sports fan wanting to see a particular game will want to know where the closest hotels 
are. The view is defined as:

      SELECT name, way 
        FROM planet_osm_point 
       WHERE tourism in ('hotel', 'hostel','chalet','guest_house','camp_site','motel','hotel','love_motel') 
         AND name IS NOT NULL
    ORDER BY way <#> ST_SetSRID(ST_Point( %lon% , %lat% ), 900913)
       LIMIT 10

## Software

The demo application was run on a Ubuntu 12.04 system.

### OpenGeo Suite

The base OpenGeo Suite installation was setup as described [here](http://suite.opengeo.org/opengeo-docs/installation/index.html).

### osm2pgsql

The Kai Krueger Ubuntu PPA was used to install osm2pgsql. This required also adding the PostgreSQL
package repository. As root:

    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc |  apt-key add -
    echo "deb http://apt.postgresql.org/pub/repos/apt/ precise-pgdg main" > /etc/apt/sources.list.d/pgdg.list
    apt-get install software-properties-common
    add-apt-repository ppa:kakrueger/openstreetmap
    apt-get update
    apt-get install osm2pgsql

### Front End







