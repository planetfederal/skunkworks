# Minesweeper goes Geo

## 1. Data download and preparation


- First download countries shapefile from http://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/

- Create new Postgis database called geomines, this can be most easily be accomplished by using PgAdmin:

<insert image here>

Using PgAdmin or pgsql make sure you enable the Postgis extension: ```create extension postgis```;

- Create new Postgis datastore called geomines with the default datastore

<insert image here>




## 2. GeoServer services creation

- Log in to GeoServer and use the importer to import the countries shapefile into Postgis (use default workspace)

- Publish layer




## 3. Client app configuration and building

