TEAM
====

Michael W.
Kevin S.
Paul R.
Victor M.
Gabriel R.


PAUL LESSONS
------------

- CTE SQL is not fast enough to dynamically walk large networks
- SQL rules are verbose (already knew that)
- SLD elements are order dependent
- Attractive rendering is possible to achieve
- GeoServer labelling engine is really good


VICTOR LESSONS
--------------



MICHAEL LESSONS
---------------


KEVIN LESSONS
-------------



GABRIEL LESSONS
---------------



DATA
====

BC WSA data from
http://data.gov.bc.ca

http://www.data.gov.bc.ca/dbc/catalogue/detail.page?config=dbc&P110=recorduid:173912&recorduid=173912&title=WSA%20-%20STREAM%20CENTRELINE%20NETWORK%20(50,000)

  shp2pgsql -W LATIN1 -s 3005 -D -I -i -S WSA_SL_SVW_line.shp wsa_rivers | psql rivers

  ALTER TABLE wsa_rivers ALTER COLUMN geom TYPE Geometry(Linestring, 3005) USING ST_Force2D(geom);
  CLUSTER wsa_rivers USING wsa_rivers_geom_gist;


BC Points of Diversion with Water Licence Information from
http://data.gov.bc.ca

http://www.data.gov.bc.ca/dbc/catalogue/detail.page?config=dbc&P110=recorduid:173495&recorduid=173495&title=BC%20Points%20of%20Diversion%20with%20Water%20Licence%20Information

  ogr2ogr --config PG_USE_COPY YES -f PGDump points_of_diversion.sql WLS_PDL_SP_point.shp
  
  psql < points_of_diversion.sql

CTE SQL Queries
===============

WSA_DOWNSTREAM
--------------

.. code-block:: sql
   WITH RECURSIVE downstream(gidlist, gid, geom, trmmdwtrsh) AS (
     SELECT ARRAY[gid] as gidlist, gid, geom, trmmdwtrsh FROM wsa_rivers WHERE gid = %gid%
   UNION ALL
     SELECT array_append(d.gidlist, r.gid) AS gidlist, r.gid, r.geom, r.trmmdwtrsh
     FROM downstream d, wsa_rivers r
     WHERE d.geom && r.geom
     AND ST_Equals(ST_StartPoint(ST_GeometryN(d.geom,1)),ST_EndPoint(ST_GeometryN(r.geom,1)))
     AND NOT d.gidlist @> ARRAY[r.gid]
   )
   SELECT gid, geom FROM downstream


WSA_AFFECTED
------------

.. code-blocks:: sql

  WITH RECURSIVE downstream(gidlist, gid, geom, trmmdwtrsh) AS (
    SELECT ARRAY[gid] as gidlist, gid, geom, trmmdwtrsh FROM wsa_rivers WHERE gid = %gid%
  UNION ALL
    SELECT array_append(d.gidlist, r.gid) AS gidlist, r.gid, r.geom, r.trmmdwtrsh
    FROM downstream d, wsa_rivers r
    WHERE d.geom && r.geom
    AND ST_Equals(ST_StartPoint(ST_GeometryN(d.geom,1)),ST_EndPoint(ST_GeometryN(r.geom,1)))
    AND NOT d.gidlist @> ARRAY[r.gid]
  )
  SELECT ogc_fid, wkb_geometry, licence_no, purpose, strm_name, licensee, ddrssln1, ddrssln2
  FROM wls_pdl_sp_point JOIN downstream ON ST_DWithin(downstream.geom, wls_pdl_sp_point.wkb_geometry, %radius%)
  WHERE lic_status = 'CURRENT'


WSA_DOWNSTREAM_VECTOR
---------------------

.. code-block::sql

  WITH RECURSIVE downstream(gidlist, gid, geom, trmmdwtrsh) AS (
    SELECT ARRAY[gid] as gidlist, gid, geom, trmmdwtrsh FROM wsa_rivers WHERE gid = 885367
  UNION ALL
    SELECT array_append(d.gidlist, r.gid) AS gidlist, r.gid, r.geom, r.trmmdwtrsh
    FROM downstream d, wsa_rivers r
    WHERE d.geom && r.geom
    AND ST_Equals(ST_StartPoint(ST_GeometryN(d.geom,1)),ST_EndPoint(ST_GeometryN(r.geom,1)))
    AND NOT d.gidlist @> ARRAY[r.gid]
  )
  SELECT ST_LineMerge(ST_Collect(geom)) FROM downstream;


WSA_AFFECTED_VECTOR
-------------------

.. code-block::sql

  SELECT ogc_fid, wkb_geometry, licence_no, purpose, strm_name, licensee, ddrssln1, ddrssln2
  FROM wls_pdl_sp_point 
  WHERE ST_DWithin(wkb_geometry, 
    ST_SetSRID(ST_GeomFromGeoJSON('{"type":"LineString","coordinates":[[1180037.25,407540.750000003],[1179940.625,407511.718999996]]}'),3005), 500)
  AND lic_status = 'CURRENT';


INTERFACE
=========

To run dev server:

npm install && npm start
