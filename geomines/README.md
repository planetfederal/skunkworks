# Minesweeper goes Geo

## 1. Data download and preparation


- First download countries shapefile from http://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/

- Create new Postgis database called geomines, this can be most easily be accomplished by using PgAdmin:

<insert image here>

Using PgAdmin or pgsql make sure you enable the Postgis extension: ```create extension postgis```;

- Create new Postgis datastore called geomines with the default datastore

<insert image here>


## 2. Load data into PostGIS

- GeoMines requires a polygon or multipolygon data set to be loaded into a PostGIS database named ``geomines``::

     createdb geomines
     psql -c "CREATE EXTENSION postgis;" geomines

- The only requirement is that there is a Geometry column named ``geom`` and a primary key named ``fid``.

- We have loaded three game maps into our database for the demo: ``states``, ``contries`` and ``nybb``::

    shp2pgsql countries.shp | psql -U postgres geomines

- To rename a column to meet the requirements::

    ALTER TABLE countries RENAME COLUMN the_geom TO geom;

## 3. GeoServer services creation

- Create a ``geomines`` workspace. 

- Create a PostGIS store that connects to the ``geomines`` database. Ensure that "Expose Primary Keys" is checked.

- Publish layer named ``setup``. It will be the following SQL view::

     SELECT 
       a.fid, 
       count(a.fid), 
       a.geom,
       array_to_string(array_agg(b.fid), ',') AS neighbours,
       CASE WHEN random() < %field% THEN true ELSE false END AS mined
      FROM 
       %table% AS a, 
       %table% AS b 
     WHERE 
       a <> b AND 
       ST_Intersects(a.geom, b.geom) 
     GROUP BY a.fid

   The view will return the ``fid`` and geometry of each feature that has a land border with another feature (``ST_Intersects``). Additionally, we will receive the count of countries that are bordered and a comma-separated list of ``fid``s of the bordering features. Finally, the ``mined`` attribute will contain a boolean indicating whether there is a mine or not.

   There are two parameters in the view: ``table``, which allows us to use any table in the database for our game map; and ``field`` which is a number between 0 and 1 which indicates what percentage of features will btable``, which allows us to use any table in the database for our game map; and ``field`` which is a number between 0 and 1 which indicates what percentage of features will be mined. By default, we configured ``table`` to default to ``countries`` and ``field`` to ``0.2``.

## 4. Client app configuration and building

We will be using the OpenGeo Suite Webapp SDK to build the client app. Follow the [instructions](http://localhost:8080/opengeo-docs/installation/index.html#installation) for your platform to install the SDK. You will find the relevant information under the "New installation" section. The component you need, depending on your platform, is the "Webapp SDK" or the "OpenGeo CLI Tools". To make the `suite-sdk` command available, be sure to add the tools directory to your system's path as described in the instructions. Also make sure your system meets the [prerequisites](http://localhost:8080/opengeo-docs/webapps/webappsdk.html#webapps-sdk).

To make sure that everything works as expected, open a terminal window on your machine, and issue the `suite-sdk` command. You should get the following result:
```sh
$ suite-sdk

Usage: suite-sdk <command> <args>

List of commands:
    create      Create a new application.
    debug       Run an existing application in debug mode.
    deploy      Deploy an application to a remote OpenGeo Suite instance.
    
See 'suite-sdk <command> --help' for more detail on a specific command.

$
```
From the directory that contains this README, run the `suite-sdk` command to debug the application using our Suite's GeoServer as "local" GeoServer instance:
```sh
$ suite-sdk debug -g http://localhost:8080/geoserver app
```
Usually you would create a new application using the `suite-sdk create` command. In this case, we have already prepared the application, so you can go straight into debugging. The two interesting files are `index.html` and `app/app.js`. The former contains the markup of our application, the latter the JavaScript code.
