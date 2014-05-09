/**
 * @require ol.js
 */

var app = (function() {

  var featuresByFid = {};
  var clearedCountries = [];
  var flaggedCountries = [];

  var minefield = new ol.source.GeoJSON({
    url: '/geoserver/wfs?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&SRSNAME=EPSG:4326&TYPENAME=geomines:setup&outputformat=application/json'
  });
  minefield.once('change', function() {
    minefield.forEachFeature(function(feature) {
      featuresByFid[feature.get('fid')] = feature;
    });
  });

  var cleared = new ol.source.ImageWMS({
    url: '/geoserver/wms',
    params: {
      LAYERS: 'geomines:sweep',
      FORMAT: 'image/png8',
      STYLES: 'clear_countries',
      FEATUREID: ','
    }
  });

  var flagged = new ol.source.ImageWMS({
    url: '/geoserver/wms',
    params: {
      LAYERS: 'geomines:sweep',
      FORMAT: 'image/png8',
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
      if (!featuresByFid[fid].get('mined') && clearedCountries.indexOf(fid) == -1) {
        clearedCountries.push(fid);
      }
    }
    cleared.updateParams({FEATUREID: clearedCountries.join(',') + ','});
    minefield.dispatchChangeEvent();
  }

  function blowUp() {
    map.removeLayer(map.getLayers().pop());
    map.addLayer(new ol.layer.Tile({
      source: new ol.source.TileWMS({
        url: '/geoserver/wms',
        params: {
          LAYERS: 'geomines:sweep',
          FORMAT: 'image/png8',
          TILED: true
        }
      })
    }));
  }

  var map = new ol.Map({
    view: new ol.View2D({
      projection: 'EPSG:4326',
      center: [0, 0],
      zoom: 2
    }),
    layers: [
      new ol.layer.Tile({
        source: new ol.source.TileWMS({
          url: '/geoserver/wms',
          params: {
            LAYERS: 'geomines:sweep',
            STYLES: 'hidden_countries',
            FORMAT: 'image/png8',
            TILED: true
          }
        })
      }),
      new ol.layer.Image({
        source: cleared
      }),
      new ol.layer.Image({
        source: flagged
      }),
      new ol.layer.Vector({
        source: minefield,
        style: (function() {
          var styleCache = {};
          return function(feature, resolution) {
            var text = clearedCountries.indexOf(feature.get('fid')) > - 1 ?
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

  var popup = new ol.Overlay({
    element: document.getElementById('popup')
  });
  map.addOverlay(popup);

  var featureOverlay = new ol.FeatureOverlay({
    map: map,
    style: new ol.style.Style({
      stroke: new ol.style.Stroke({color: 'blue'}),
      fill: new ol.style.Fill({color: 'rgba(0,0,255,0.05)'})
    })
  });

  var highlight;
  var element = popup.getElement();
  map.on('pointermove', function(evt) {
    var feature = map.forEachFeatureAtPixel(evt.pixel, function(f) {
      return f;
    });
    popup.setPosition(evt.coordinate);
    if (feature !== highlight) {
      $(element).tooltip('destroy');
      if (highlight) {
        featureOverlay.getFeatures().clear();
      }
      if (feature) {
        var neighbours = feature.get('neighbours').split(',');
        for (var i = neighbours.length - 1; i >= 0; --i) {
          featureOverlay.addFeature(featuresByFid[neighbours[i]]);
        }
        $(element).tooltip({title: feature.get('count')});
        $(element).tooltip('show');
      } else {
        $(element).tooltip('hide');
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

  $("#modal").modal({ show : true });
}());
