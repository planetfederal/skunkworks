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
  - Create a style named ``lwss_downstream``
  - Use the ``lwss_downstream.sld`` file for the style and add it to the layer
  
- Add a layer named ``points_of_diversion_affected`` and make it a SQL view layer

  - Use the points_of_diversion_affected SQL to fill in the layer definition
  - Create a style named ``points_of_diversion_affected``
  - Use the ``points_of_diversion_affected.sld`` file for the style and add it to the layer


SQL Setup
=========

The SQL views used for visualization require a support table to operate. 

The data in the table codes every "river" with a unique "wsg_id / ws_key" combination. To make downstream queries faster, we will calculation the from/to relationships between each river. So, "river A flows down to river B which flows down to river C", etc.

The from/to table calculation is a little complex::

  -- Index the keys we're going to be searching on a lot
  CREATE INDEX lwss_idx ON lwss (wsg_id, ws_key, seg_no);

  -- Create the from/to table
  CREATE TABLE lwss_from_to AS
  WITH seg_candidates AS (
  SELECT 
    a.geom AS geom,
    a.wsg_id AS from_wsg_id,
    a.ws_key AS from_ws_key,
    a.seg_no AS from_seg_no,
    b.wsg_id AS to_wsg_id,
    b.ws_key AS to_ws_key,
    b.seg_no AS to_seg_no
  FROM lwss a JOIN lwss b 
    ON a.geom && b.geom 
    AND st_distance(st_endpoint(b.geom),st_startpoint(a.geom)) < 1
    AND a.ws_key != b.ws_key
    AND a.seg_no > 0
    AND a.ws_key = a.bl_key
    AND b.code != '2300'
    AND a.wsg_id = 'UEUT'
  ),
  downstream_seg_candidates AS (
  SELECT 
    a.from_wsg_id AS from_wsg_id,
    a.from_ws_key AS from_ws_key,
    a.from_seg_no AS from_seg_no,
    c.wsg_id AS to_wsg_id,
    c.ws_key AS to_ws_key,
    c.seg_no AS to_seg_no
  FROM seg_candidates a JOIN lwss c
    ON ST_DWithin(a.geom, c.geom, 500)
    AND c.wsg_id = a.to_wsg_id
    AND c.ws_key = a.to_ws_key
    AND c.bl_key = c.ws_key
  ORDER BY from_wsg_id, from_ws_key, from_seg_no, to_wsg_id, to_ws_key,
           ST_Distance(ST_StartPoint(a.geom), ST_EndPoint(c.geom)) ASC
  )
  SELECT DISTINCT ON (from_wsg_id, from_ws_key, from_seg_no) * FROM downstream_seg_candidates;
  

  -- Index the from/to table
  CREATE INDEX lwss_from_to_idx ON lwss_from_to (from_wsg_id, from_ws_key);

  -- How to use the from/to table: recurse on it to find all downstream 
  -- rivers from your start point, then join on the main table 
  -- to get all the segments in each river
  WITH RECURSIVE from_to AS (
    SELECT 'LNIC'::varchar AS wsg_id, 319 AS ws_key, 1 AS seg_no
    UNION
    SELECT to_wsg_id AS wsg_id, to_ws_key AS ws_key, to_seg_no AS seg_no
    FROM lwss_from_to l JOIN from_to f
    ON l.from_wsg_id = f.wsg_id AND l.from_ws_key = f.ws_key
  )
  SELECT 
    l.gid, l.geom, l.gaze_name, l.ws_code, 
    l.wsg_id, l.ws_key, l.seg_no, l.l_order 
  FROM lwss l JOIN from_to f 
  ON l.wsg_id = f.wsg_id 
  AND l.ws_key = f.ws_key 
  AND l.seg_no <= f.seg_no
  WHERE l.bl_key = l.ws_key



SQL View Queries
================

Use these in defining the SQL views that will drive the dynamic part of the application. They take in a parameter, and output a result set that can be used to draw the downstream effects.

lwss_downstream
---------------

::

  -- use the following values as defaults and regex
  -- filters for security on the parameters
  -- ws_key  319   ^[\d]+$ 
  -- seg_no  1     ^[\d]+$ 
  -- wsg_id  LNIC  ^[\w]+$ 
  WITH RECURSIVE from_to AS (
    SELECT 
      '%wsg_id%'::varchar AS wsg_id, 
      %ws_key% AS ws_key, 
      %seg_no% AS seg_no
    UNION
    SELECT 
      to_wsg_id AS wsg_id, 
      to_ws_key AS ws_key, 
      to_seg_no AS seg_no
    FROM lwss_from_to l JOIN from_to f
    ON l.from_wsg_id = f.wsg_id AND l.from_ws_key = f.ws_key
  )
  SELECT 
    l.gid, l.geom, l.gaze_name, l.ws_code, 
    l.wsg_id, l.ws_key, l.seg_no, l.l_order 
  FROM lwss l JOIN from_to f 
  ON l.wsg_id = f.wsg_id 
  AND l.ws_key = f.ws_key 
  AND l.seg_no <= f.seg_no
  WHERE l.bl_key = l.ws_key


points_of_diversion_affected
----------------------------

::

  -- use the following values as defaults and regex
  -- filters for security on the parameters
  -- ws_key  319   ^[\d]+$ 
  -- seg_no  1     ^[\d]+$ 
  -- wsg_id  LNIC  ^[\w]+$ 
  -- radius  300   ^[\d]+$ 
  WITH RECURSIVE from_to AS (
    SELECT 
      '%wsg_id%'::varchar AS wsg_id, 
      %ws_key% AS ws_key, 
      %seg_no% AS seg_no
    UNION
    SELECT 
      to_wsg_id AS wsg_id, 
      to_ws_key AS ws_key, 
      to_seg_no AS seg_no
    FROM lwss_from_to l JOIN from_to f
    ON l.from_wsg_id = f.wsg_id AND l.from_ws_key = f.ws_key
  ),
  downstream AS
  (
    SELECT
      l.gid, l.geom, l.gaze_name, l.ws_code, 
      l.wsg_id, l.ws_key, l.seg_no, l.l_order 
    FROM lwss l JOIN from_to f 
    ON l.wsg_id = f.wsg_id 
    AND l.ws_key = f.ws_key 
    AND l.seg_no <= f.seg_no
    WHERE l.bl_key = l.ws_key
  )
  SELECT DISTINCT ON (tpod_tag)
    p.gid, p.geom, p.licence_no, p.purpose, 
    p.strm_name, p.licensee, p.ddrssln1, p.ddrssln2
  FROM points_of_diversion p
  JOIN downstream 
  ON ST_DWithin(downstream.geom, p.geom, %radius%)
  WHERE lic_status = 'CURRENT'





Interface
=========

To run dev server:

npm install && npm start



Building the App
================

- Start with the Suite SDK ol3view template
- Change the center zoom to::

    var center = [-13772294, 6237567];
    var zoom = 10;

- Add MapBox Terrain base to the layer chooser::

    // MapBox grey base
    new ol.layer.Tile({
      title: 'Terrain',
      group: "background",
      visible: true,
       source: new ol.source.XYZ({
         url: 'http://{a-c}.tiles.mapbox.com/v3/nps.2yxv8n84/{z}/{x}/{y}.png'
       })
    }),

- 