/**
 * @require ol.js
 */

var app = (function() {

  var map = new ol.Map({
    view: new ol.View2D({
      center: [0, 0],
      zoom: 2
    }),
    layers: [
      new ol.layer.Tile({
        source: new ol.source.TileWMS({
          url: '/geoserver/wms',
          params: {
            LAYERS: 'opengeo:countries'
          }
        })
      })
    ],
    target: 'map'
  });

}());