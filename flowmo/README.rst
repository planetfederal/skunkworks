DATA
====


NHN Hydrography data from 

Home: http://www.geobase.ca/geobase/en/data/nhn/index.htm
Data Dictionary: http://www.geobase.ca/doc/catalogue/GeoBase_NHN_Catalogue_1.0.1_EN.html

Using the following layers

- NLFLOW, the connected flow lines
- WATERBODY, the polygon waterbodies


BC WSA data from
http://data.gov.bc.ca

http://www.data.gov.bc.ca/dbc/catalogue/detail.page?config=dbc&P110=recorduid:173912&recorduid=173912&title=WSA%20-%20STREAM%20CENTRELINE%20NETWORK%20(50,000)

  shp2pgsql -W LATIN1 -s 3005 -D -I -i -S WSA_SL_SVW_line.shp wsa_rivers | psql rivers

  ALTER TABLE wsa_rivers ALTER COLUMN geom TYPE Geometry(Linestring, 3005) USING ST_Force2D(geom);
  CLUSTER wsa_rivers USING wsa_rivers_geom_gist;




INTERFACE
=========

To run dev server:

npm install && npm start
