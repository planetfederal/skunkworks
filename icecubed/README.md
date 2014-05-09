
# Icecubed

# Members

Josh Campbell, Matt Richards, Rob Marianski, Akiyo Dunetz

# Application
Ice3 is a mapping application that visualizes changes in Arctic sea ice over a 33 year period (1980-2013). The maximum August sea ice extent is shown in the timeline slider beneath the map. Additionally, an outline of the 30-year (1981-2010) median August sea ice extent is included for comparison. All data is from the National Snow and Ice Data Center (http://nsidc.org/data/seaice_index/), a source for consistently processed ice extent and concentration images and data values since 1979. A third dataset showing the average snow extent in August (1967-2004) is also included for reference.

# Suite Use Case:
Test the unique functions of the OpenGeo Suite that differentiates it from other web mapping platforms. Specifically, we wanted to build an application that utilized map projections that are not typically used in web mapping applications, test the ability of GeoServer to render vectors in different projections

* Web Application:
  * Render map in EPSG 3408 projection.
  * Use GeoWebCache to tile basemap in non-standard projections
  * Visualize time-series data of sea ice using WMS 
  * Use OGC standards to integrate data from a remote server
  * Utilize GeoServer on the fly projection to combine various datasets
  * Test OpenGeo Explorer (QGIS plugin) to build and publish map styles
  * Build new mapping template
    * Use OL3
    * New UI/UX Design
    * Responsive CSS
    * Time based controls

* Data and Processing:
  * Natural Earth base map (NE1, 1:50M scale)
    * Native projection EPSG 4326 --> reproject in QGIS to EPSG 3408
    * Cache to zoom level 10
* Sea Ice (August) :: http://nsidc.org/data/seaice_index/
  * Median (1981-2010) polyline
  * Extent (1980-2013 every 3 years) polygons, 12 data layers
  * FTP for data: ftp://sidads.colorado.edu/DATASETS/NOAA/G02135/shapefiles
  * Native projection in EPSG 3413 --> reproject on the fly in GeoServer to EPSG 3408
* Atlas of the Cryosphere http://nsidc.org/data/atlas/atlas_info.html
  * WFS/WMS calls for extra data 
  * OGC details  :: http://nsidc.org/data/atlas/ogc_services.html
      * http://nsidc.org/cgi-bin/atlas_north?service=WMS&request=GetCapabilities&version=1.1.1
  * Average Snow Extent in August (1967-2004) 
  * Native projection in EPSG 3408
* Projections
  * EPSG 3413 -- http://www.spatialreference.org/ref/epsg/wgs-84-nsidc-sea-ice-polar-stereographic-north/
  * EPSG 3408 -- http://www.spatialreference.org/ref/epsg/3408/

# Tasks:
* Stand up Suite on a machine.  Amazon instance:  http://ec2-54-198-167-104.compute-1.amazonaws.com:8080/geoserver
* Worked on backend development. 
* Downloaded the datasets and queue up in QGIS.  Reprojected the Natural Earth basemap and Sea Ice Median data.
* Created HTML CSS template with radio button view (showing time). 
* Used GeoServer to do on-the-fly conversion of the Sea Ice Extent data from EPSG 3413 to 3408.  Import the data layers into GeoServer.  You need to set each layer’s projection (in this case 3413).
* Used QGIS to do styling, then published to GeoServer.
* Hooked up backend to frontend, using OL3.
* Added a legend (CSS).
* Added About.
* Tested on laptop, tablet and mobile in both landscape and portrait.

# Lessons Learned:
* Projections introduce unique challenges.  There were differences with QGIS vs. OL3 vs. PostGIS.  
  * Reprojections in QGIS.  
  * Upload into PostGIS.  
  * Visualization in QGIS.
* The Suite QGIS plugin allows the end user/analyst to access/modify/visualize changes without having to go through a CLI or GeoServer interface.
* Data Management (discovering, downloading, processing, uploading the data) consumes the majority of time required to produce a map application.

# Artifacts:
Most of the data and styles are checked directly into the repo. The base map is natural earth reprojected to 3408, and can be found at:
https://docs.google.com/a/boundlessgeo.com/file/d/0ByoviHmnhuhWNkwtUy1KY1IzMVU

After download, put the natural earth file in the data directory to ensure the qgis project can locate the data.
