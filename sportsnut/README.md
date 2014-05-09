Collecting data of teams/stadiums, game times and country flags- mostly from Wikipedia then placed into csv format manually.

Ran script to convert csv by grabbing out of spreadsheet, normalizing, removing what we didnt need and then download all then redo the csv, drop the schema and then load it all.

3 Tables and a view is what we created

osm2pgsql to convert osm map of brazil to pgsql

Install Geoserver Suite
Add postgres repo from https://wiki.postgresql.org/wiki/Apt

Compile PgRouting (http://pgrouting.org/) requires Kubuntu backports for cmake 2.8.12
sudo add-apt-repository ppa:kubuntu-ppa/backports

Created a parameterized geoserver view to support quering the 10 nearest hotels to the location from osm data



