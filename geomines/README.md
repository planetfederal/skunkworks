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
Now change into a directory you use for your projects, and create a new application. Let's call it `app`:
```sh
$ suite-sdk create app
```
