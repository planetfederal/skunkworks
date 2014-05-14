Purpose
=======

Given a stream network, can we take a user input (click), figure out what portions of the network are downstream of the click, and what water users would be affected by a contamination introduced into the network at that point?


Team
====

- Michael W.
- Kevin S.
- Paul R.
- Victor M.
- Gabriel R.


Paul Lessons
------------

- CTE SQL is not fast enough to dynamically walk large networks
- SLD rules are verbose (already knew that)
- SLD elements are order dependent
- Attractive rendering is possible to achieve
- GeoServer labelling engine is really good


Victor Lessons
--------------
- SQL Views & CTE queries for fun and profit
- SQL View changes require saving both on that page and the layer page
- SLD error output not very helpful when min/max were out of order
- GWC can be a bit finicky to set up
- OL3 "Layers are cheap" -- can't set new source on vector layer, encouraged to just create new layer
- OL3's new searchable docs make for a much nicer experience

Michael Lessons
---------------

- Small AWS instances are far too resource constrained for even the most simple production use
- GeoServer needs a GeoScript WPS workflow
- We should be eating our own dogfood more often
- One can get a .servebeer.com domain for free!



Kevin Lessons
-------------



Gabriel Lessons
---------------

- Remember not to use workspace local styles. Or fix the integrated GWC.
- No real easy way to work with SLD
- JQuery rocks 



Data
====

- Create a database and PostGIS enable it

::

  createdb flowmo
  psql -d flowmo -c 'create extension postgis'

- Retrieve and load the `BC 1:50K Watershed Atlas <http://data.opengeo.org/flowmo/BC-WSA.zip>`_ data.

:: 

  # Load the data with shp2pgsql
  # stream lines
  shp2pgsql -W LATIN1 -s 3005 -D -I -i -S lwssbcgzl.shp lwss | psql flowmo
  # water polygons
  shp2pgsql -W LATIN1 -s 3005 -D -I -i -S lwslbcgz.shp lwsl | psql flowmo

- retrieve and load the `BC Points of Diversion with Water Licence Information <http://www.data.gov.bc.ca/dbc/catalogue/detail.page?config=dbc&P110=recorduid:173495&recorduid=173495&title=BC%20Points%20of%20Diversion%20with%20Water%20Licence%20Information>`_ from `data.gov.bc.ca <http://data.gov.bc.ca>`_

::

  shp2pgsql -W LATIN1 -s 3005 -D -I -i WLS_PDL_SP_point.shp points_of_diversion | psql flowmo
  


GeoServer Layers
================

- Add a layer named ``lwss`` referencing the lwss table
- Use the ``lwss.sld`` to style the layer
- Add a layer named ``lwss_downstream`` and make it a SQL view layer

  - Use the lwss_downstream SQL to fill in the layer definition
  - Use the ``lwss_downstream.sld`` to style the layer
  
- Add a layer named ``lwss_downstream_vector`` and make it a SQL view layer

  - Use the lwss_downstream_vector SQL to fill in the layer definition
  - Use the ``lwss_downstream.sld`` to style the layer
  
- Add a layer named ``points_of_diversion_affected`` and make it a SQL view layer

  - Use the points_of_diversion_affected SQL to fill in the layer definition
  - Use the ``points_of_diversion_affected.sld`` to style the layer


SQL Setup
=========

The SQL views used for visualization require some support functions and tables to operate. Here is the SQL to run to set them up.

The downstream query is executed using the "`watershed code <http://www.env.gov.bc.ca/fish/pdf/guide2_hierarchical_watershed_coding_system4BC.pdf>`_" on the stream segments, which encode the "stream heirarchy" into a 45-digit numerical code.

Here's an example watershed code, expanded into parts: major basin, then subwatersheds, working from the ocean (left) to the mountains (right)::

  120 246600 11500 09000 4320 1370 000 000 000 000 000 000

So, 120 = Fraser, and 24.6% up the Fraser, the Nicola entered, and 11.5% up the Nicola the next river entered, and so on.

::

  -- We need a table structure to define the output of our query building
  -- function
  DROP IF EXISTS TABLE wsquery;
  CREATE TABLE wsquery (ws_code varchar(45), seg_prop varchar(6));

  -- Query building function takes a watershed code and proportion up it, and 
  -- generates a set of codes and proportions that can be used to find all the 
  -- downstream segments.
  CREATE OR REPLACE FUNCTION get_wsquery(varchar,varchar) RETURNS SETOF wsquery AS
  $BODY$
  DECLARE
      ws_code varchar := $1;
      seg_prop varchar := $2;
      ws_sizes integer[] := ARRAY[6,5,5,4,4,3,3,3,3,3,3];
      result wsquery;
      ws_len integer;
      ws_size integer := 3;
      ws_pos integer := 4;
  BEGIN

      result.seg_prop := seg_prop;
      result.ws_code := ws_code;
      RETURN NEXT result;

      FOREACH ws_len IN ARRAY ws_sizes
      LOOP
          result.seg_prop := substring(ws_code from ws_pos for ws_len);
          result.ws_code := substring(ws_code from 1 for ws_size) || repeat('0', 45 - ws_size);
          IF int4(result.seg_prop) = 0 THEN
              RETURN;
          END IF;
          ws_size := ws_size + ws_len;
          ws_pos := ws_size + 1;
          RETURN NEXT result;
      END LOOP;
      RETURN;
  END
  $BODY$
  LANGUAGE plpgsql;

  -- How to use the query, just join it to the master table
  -- and find all the lines with the same watershed codes and proportions less than the 
  -- thresholds.
  SELECT s.geom, s.gaze_name, s.ws_code, s.seg_prop 
  FROM lwss s 
  JOIN get_wsquery('120246600115000900000000000000000000000000000','0140') q
  ON s.ws_code = q.ws_code and s.seg_prop < q.seg_prop
  ORDER BY ws_code DESC, seg_prop DESC;


SQL View Queries
================

Use these in defining the SQL views that will drive the dynamic part of the application. They take in a parameter, and output a result set that can be used to draw the downstream effects.

lwss_downstream
---------------

::

  # default values ws_code = 120246600115000900000000000000000000000000000, seg_prop = 0140
  SELECT s.geom, s.gaze_name, s.ws_code, s.seg_prop 
  FROM lwss s 
  JOIN get_wsquery('%ws_code%','%seg_prop%') q
  ON s.ws_code = q.ws_code and s.seg_prop < q.seg_prop;


points_of_diversion_affected
----------------------------

::

  # default values ws_code = 120246600115000900000000000000000000000000000, seg_prop = 0140
  # radius = 500
  WITH downstream AS (
    SELECT s.geom, s.gaze_name, s.ws_code, s.seg_prop 
    FROM lwss s 
    JOIN get_wsquery('%ws_code%','%seg_prop%') q
    ON s.ws_code = q.ws_code and s.seg_prop < q.seg_prop
  )
  SELECT DISTINCT ON (tpod_tag) 
    ogc_fid, wkb_geometry, licence_no, purpose, 
    strm_name, licensee, ddrssln1, ddrssln2
  FROM points_of_diversion 
  JOIN downstream 
  ON ST_DWithin(downstream.geom, points_of_diversion.geom, %radius%)
  WHERE lic_status = 'CURRENT'


lwss_downstream_vector
----------------------

::

  # default values ws_code = 120246600115000900000000000000000000000000000, seg_prop = 0140
  SELECT ST_Collect(s.geom) AS geom
  FROM lwss s 
  JOIN get_wsquery('%ws_code%','%seg_prop%') q
  ON s.ws_code = q.ws_code and s.seg_prop < q.seg_prop;





Interface
=========

To run dev server:

npm install && npm start
