/**
 * @require ol.js
 */

var app = (function() {

  var featuresByFid = {};
  var clear = {};
  var flaggedCountries = [];

  var minefield = new ol.source.GeoJSON({
    url: '/geoserver/wfs?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&SRSNAME=EPSG:3857&TYPENAME=geomines:setup&outputformat=application/json'
  });
  minefield.once('change', function() {
    minefield.forEachFeature(function(feature) {
      featuresByFid[feature.get('fid')] = feature;
    });
  });

  var hidden = new ol.source.ImageWMS({
    url: '/geoserver/wms',
    params: {
      LAYERS: 'geomines:countries',
      STYLES: 'hidden_countries'
    }
  });

  var flagged = new ol.source.ImageWMS({
    url: '/geoserver/wms',
    params: {
      LAYERS: 'geomines:countries',
      STYLES: 'flagged_countries',
      FEATUREID: ','
    }
  });

  function getMinedNeighbours(feature) {
    var neighbours = feature.get('neighbours').split(',');
    var minedNeighbours = [];
    for (var i = neighbours.length - 1; i >= 0; --i) {
      var neighbour = featuresByFid[neighbours[i]];
      if (neighbour.get('mined')) {
        minedNeighbours.push(neighbour);
      }
    }
    return minedNeighbours;
  }

  function getHidden() {
    var hidden = [];
    for (var fid in featuresByFid) {
      if (!clear[fid]) {
        hidden.push(fid);
      }
    }
    return hidden;
  }

  function flag(fid) {
    var index = flaggedCountries.indexOf(fid);
    if (index == -1) {
      flaggedCountries.push(fid);
    } else {
      flaggedCountries.splice(index, 1);
    }
    flagged.updateParams({FEATUREID: flaggedCountries.join(',') + ','});
  }

  function reveal(fids) {
    for (var i = fids.length - 1; i >= 0; --i) {
      var fid = fids[i];
      if (!clear[fid] && !featuresByFid[fid].get('mined')) {
        clear[fid] = true;
      }
    }
    hidden.updateParams({FEATUREID: getHidden().join(',') + ','});
    minefield.dispatchChangeEvent();
  }

  function blowUp() {
    map.removeLayer(map.getLayers().pop());
    map.addLayer(new ol.layer.Tile({
      source: new ol.source.TileWMS({
        url: '/geoserver/wms',
        params: {
          LAYERS: 'geomines:countries'
        }
      })
    }));
  }

  var map = new ol.Map({
    view: new ol.View2D({
      center: [0, 0],
      zoom: 2
    }),
    layers: [
      new ol.layer.Image({
        source: new ol.source.ImageWMS({
          url: '/geoserver/wms',
          params: {
            LAYERS: 'geomines:countries',
            STYLES: 'clear_countries',
            TILED: true
          }
        })
      }),
      new ol.layer.Image({
        source: hidden
      }),
      new ol.layer.Image({
        source: flagged
      }),
      new ol.layer.Vector({
        source: minefield,
        style: (function() {
          var styleCache = {};
          return function(feature, resolution) {
            var text = clear[feature.get('fid')] ?
                (getMinedNeighbours(feature).length || '') + '' : '';
            if (!styleCache[text]) {
              styleCache[text] = [new ol.style.Style({
                fill: new ol.style.Fill({color: 'rgba(0, 0, 0, 0)'}),
                text: new ol.style.Text({
                  font: '12px Calibri,sans-serif',
                  text: text,
                  fill: new ol.style.Fill({
                    color: 'red'
                  }),
                  stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 3
                  })
                })
              })];
            }
            return styleCache[text];
          };
        }())
      })
    ],
    target: 'map'
  });

  var featureOverlay = new ol.FeatureOverlay({
    map: map,
    style: (function() {
      var styleCache = {};
      return function(feature, resolution) {
        var text = '(' + feature.get('count') + ')';
        if (!styleCache[text]) {
          styleCache[text] = [new ol.style.Style({
            stroke: new ol.style.Stroke({color: 'blue'}),
            text: new ol.style.Text({
              font: '12px Calibri,sans-serif',
              text: '(' + feature.get('count') + ')',
              offsetX: 10,
              offsetY: 10,
              fill: new ol.style.Fill({
                color: '#000'
              }),
              stroke: new ol.style.Stroke({
                color: '#fff',
                width: 3
              })
            })
          })];
        }
        return styleCache[text];
      };
    }())
  });

  var highlight;
  map.on('pointermove', function(evt) {
    var feature = map.forEachFeatureAtPixel(evt.pixel, function(f) {
      return f;
    });
    if (feature !== highlight) {
      if (highlight) {
        featureOverlay.removeFeature(highlight);
      }
      if (feature) {
        featureOverlay.addFeature(feature);
      }
      highlight = feature;
    }
  });

  map.on('singleclick', function(evt) {
    var feature = map.forEachFeatureAtPixel(evt.pixel, function(f) {
      return f;
    });
    if (feature) {
      var mined = feature.get('mined');
      if (mined) {
        blowUp();
      } else {
        reveal([feature.get('fid')]);
      }
    }    
  });

  $(map.getViewport()).on('contextmenu', function(evt) {
    var feature = map.forEachFeatureAtPixel(map.getEventPixel(evt), function(f) {
      return f;
    });
    if (feature) {
      flag(feature.get('fid'));
      evt.originalEvent.preventDefault();
    }
  });

}());