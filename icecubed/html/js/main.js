(function() {

  // TODO need to explicitly set map height?
  document.getElementById('map').style.height = '500px';

  var projection = ol.proj.configureProj4jsProjection({
    code: 'EPSG:3408',
    extent: [-4938036.174191093, -2573213.9925217666, 5084539.232734008, 3938318.148811234]
  });

  var map = new ol.Map({
    target: 'map',
    renderer: 'canvas',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.TileWMS({
          url: 'http://ec2-54-198-167-104.compute-1.amazonaws.com:8080/geoserver/opengeo/wms',
          params: {
            LAYERS: 'opengeo:ne1_3408_sea_ice',
            TILED: true
          },
          extent: [-4938036.174191093, -2573213.9925217666, 5084539.232734008, 3938318.148811234],
          serverType: 'geoserver',
          projection: 'EPSG:3408'
        })
      })
    ],
    view: new ol.View2D({
      center: [-5049.84109515, 825838.67673878],
      //center: [825838.67673878, -5049.84109515],
      zoom: 1,
      projection: projection
    })
  });
}());
