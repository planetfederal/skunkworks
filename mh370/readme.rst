MH370
======

What we wanted to do
**********************

The mystery of Malaysia Airlines flight 370 has caused many to speculate on its fate. We decided to make a few maps detailing a few different situations.

- Map 1: A close-in shot of the points where the plane took off, where it lost contact, and where it lost “secondary” contact.

- Map 2: What if the whole thing is a conspiracy? What airports could the plane have landed at, given the available fuel / maximum flying distance?

- Map 3: A satellite got a “ping” from the engine (!) of the plane, which showed an arc of possible positions of the plane at a later time. Where could the plane have been at this time of contact.

- Map 4: A visual showing the locations of the underwater search.

Our Approach
*************

We had the following approach when organizing tasks and coming up with the correct workflow:

- Use as many Suite elements as possible.

- Duplicate tasks if needed to show how things can be done in different Suite elements, or how the results compare. Due to lack of time, we did not try all available alternatives.

- Assign each task to the person in the group with less expertise on the technology used, so he/she could learn about it. The person doing the task was assisted by the most experienced one, providing guidance. Due to lack of time, we ended up changing this and having a more productive approach.

Setup / architecture
********************

We set up a basic AWS instance running Ubuntu, and installed OpenGeo Suite. We opened ports 8080 (for GeoServer), 22 (for SSH/SCP) and 80 (in case we needed it). We created a public/private key such that we could SSH into the box (for moving around files), and also used port tunneling to allow us to access pgAdmin (port 5432) on our host machines.

We ran out of disk space, but were able to extend it without having to create a new instance. We did that by allocating extra space and then linking it to our instance, mounting it as a external drive.

The data we needed to get
*****************************************

Data for the app falls into two categories: base layers and layers used for calculation and telling the airplane story.

- Base layers:

	- Relief raster layer, country borders, bounding box, graticule: from Natural Earth dataset

- Plane layers:

	- Last known coordinates. Data was entered manually from coordinates taken for wikipedia.

	- Estimated path followed by the plane after disappearing from radar: Originally calculated by Malasian airlines, it was digitized from a not-georeferenced image taken from http://www.cbsnews.com/news/malaysia-airlines-flight-370-vanishing-went-unnoticed-for-17-minutes/. Creating the layer involved georeferencing the image and manually digitizing the path.

	- Airports. From Natural Earth

	- Satellite points. Placement for satellites that received signal from airplane. Digitized from NY times article map http://www.nytimes.com/interactive/2014/03/17/world/asia/search-for-flight-370.html?_r=0

	- Search areas: Digitized from NY times article map

Data processing
****************

Once we had the data, we needed to process it. There were two main tasks we needed to accomplish:

Task 1: Draw circles.
----------------------

We had data for the last known points of contact, and also the satellite location.

For the former, we used PostGIS to create a new data layer with a circle around the last known points of contact detailing the maximum range of flight for the aircraft. This involved converting the point geometry to a geography, and then running a buffer process on the geographic feature. To make GeoServer render the data, we converted the geography features back to geometries.

(Alas, the many-stepped, multi-hour process for accomplishing this task has been lost.)

The particular structure of the PostGIS database with geometries and geography features did not play well with QGIS when accessed through a WFS services, which caused some problems when trying to perform analysis with it in QGIS.

Task 2: Intersect the circle with the airports
-----------------------------------------------

From the creation of the circle from the last known location of the aircraft, we then intersected that circle with the airports layer.
::

	CREATE TABLE aircircle AS (
	  SELECT ne_10m_airports.* from ne_10m_airports, circles WHERE
	  ST_Within(ne_10m_airports.geom, circles.geom) AND circles.id=2
	);

This intersection process could have been done in many ways. Originally, we wanted to have this intersection happen in the browser (via WFS) but expediency led to us creating a new data table / layer with the intersection.


Style and Map Composition
***********************************
Styles have been created in both SLD and CSS, and uploaded to GeoServer. The airport style with the plane icon was created in QGIS and exported using the OpenGeo Suite QGIS plugin. The remaining styles have been created manually and entered in the GeoServer web console.

We had the following options for NE style:

- export QGIS styles included in quickstart to SLD via QGIS
- Justin offered NE styles from opengeo demo
- uDig styles used in training materials

Team ended up making styles by hand and not spending a lot of time on the basemap.

* airports CSS was generated from training reference examples, using SCALERANK and vendor options to arrange labels dyanimically
* remaining styles generated by hand using SLD editor or CSS editor

Ended up using LayerGroup to compose rather than OpenLayers in order to keep more team members in the mix.

Glitches:

* Naming a layergroup? not enforced resulting in "Map4: Search Area" which could not be used by open layers!
* Adding circles layer twice to a layer group with different style? Does not work!
* Using CSS #circle.1 {fill,stroke} #circle.2 {fill} did not work -> resulting style rendered both circles with a stroke!
* communication issues around what data is available :)
* brought in gradiculte rather than world bounding box, ended up styling the grid for a pixel effect
* raster gamma correction did not appear to do anything, ended up blocking out the land mass to make the map appear "night"

The code we needed to write
****************************

We set up a web page with a carrousel of maps, each of them explaining a part of the plan story. It uses OL3 to render the layers for each of the maps, connecting the GeoServer to retrieve the data.

All layers are retrieved as WMS layers. Originally, we planned to access the airports and plane track layers using WFS and render them on the client side, to explore the possibilities of OL3 rendering. Style for the OL· application could have been produced manually or using the QGIS to OL3 exporter, experimenting with it. So far, we got the exporter to handle basic symbology from QGIS, including multi-layered symbols and icons.


What did we learn?
*******************

Google isn’t a substitute for good documentation. Searching for the correct syntax for PostGIS parameters was challenging. Usually, but not always, the correct information was somewhere on the web, but was not always on the first page of search results. Paging through the documentation is a better tactic, but depended on the usefulness of the table of contents of the documentation. Clear section headers are of primary importance in documentation (does the user know what the page is going to be about if this user clicks on the link)

The priorities of “learn aspects of the Suite that you aren’t familiar with” and “get something done” competed with each other, and in the end, the latter took precedence. As in: we started out working together on new technology, and we ended up with each doing what we knew the most about.

What can we improve/fix in our products?
*****************************************



The OpenGeo Suite plugin does not upload the SVG files used by a style when uploading the style to GeoServer

https://github.com/boundlessgeo/suite-qgis-plugin/issues/140


Process
********

1. Environment

- For a Windows-based GISP, connecting to an Amazon Ubuntu instance running GeoServer using keys, Putty, WinSCP + setting up pgAdminIII to get data in the correct place and restart PostGIS and GeoServer when it seems to be hanging (occurred a few times) can be very confusing.

2. Data Wrangling

- For someone not familiar with good GIS data sets, it's not clear how to get good basic data quickly so Data Packs and pointers would be very useful.

- We imported a lot of large data (that we didn't even use all of) and ended up with storage problems on our Amazon instance.

- For a GISP to get data on to a remote server using ssh + wget + unzip + psql import on the server was most straightforward but it'd be nice if they could do that through a Data Pack UI or pgAdminIII or pgShapeloader.


3. Documentation

- Searching online for straightforward documentation is not easy and can take long.  What's the best place to get scripts to import datasets like GeoNames to PostGIS?  GIS StackExchange?

- We found the structure of our documentation confusing. When installing the CSS extension for GeoServer we followed the wrong documentation for it, mixing Community doc and our own Suite Docs and installing the wrong module. https://github.com/boundlessgeo/suite/issues/331   We've asked resourcing to discuss and resolve this using a new visually distinct theme for Community vs. Suite and creating a Suite Docs version landing page on boundlessgeo.com.


4. Suite Stack

- What happened to the default layer switcher in OL3?  :(

- We had some initial discussions about what should be done *where* in the stack, with the person most familiar with GeoServer wanting to do certain things in GeoServer, the most person most familiar with OL wanting to do things in the client, same for PostGIS, QGIS...  It'd be nice to explain the pros and cons of each strategy in our Developer's Section because it's probably a common conversation.

- Overall, it would have been nice to have been able to understand/list everything that belonged to our App throughout the entire Suite Stack in one place.  As a Deveoper, I can open a Github repo in Sublime and see the current state of the project.  Is there an equivalent to that for Suite for Web App Developers?

- Wish GeoServer/PostGIS/our Amazon server had warned us it was going to start having major issues.  What tools could have told us that?  Justin was helping and mentioned use *top*, *jstack*, etc.... is this documented somewhere in one nice Troubleshooting one pager?

