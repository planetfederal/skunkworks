/**
 * @require ol.js
 */

var app = (function() {

  // Append '?states' or '?nybb' to the url to play with US states or New York
  var table = window.location.search ?
      window.location.search.substr(1) : 'countries';

  var featuresByFid = {};
  var clearedCountries = [];
  var flaggedCountries = [];
  var minedCountries = [];

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
    minefield.dispatchChangeEvent();
    if (flaggedCountries.length == minedCountries.length) {
      var won = true;
      for (var i = minedCountries.length - 1; i >= 0; --i) {
        if (flaggedCountries.indexOf(minedCountries[i]) == -1) {
          won = false;
          break;
        }
      }
      if (won) {
        alert('Congrats, you won!');
      }
    }
  }

  function reveal(fids) {
    for (var i = fids.length - 1; i >= 0; --i) {
      var fid = fids[i];
      if (!featuresByFid[fid].get('mined') && clearedCountries.indexOf(fid) == -1) {
        clearedCountries.push(fid);
      }
    }
    minefield.dispatchChangeEvent();
  }

  function blowUp() {
    map.getLayers().forEach(function(l) { l.setVisible(false); });
    map.addLayer(new ol.layer.Tile({
      source: new ol.source.TileWMS({
        url: '/geoserver/wms',
        params: {
          LAYERS: 'geomines:sweep',
          FORMAT: 'image/png8',
          VIEWPARAMS: 'table:' + table,
          TILED: true
        }
      })
    }));
  }

  var minefield = new ol.source.GeoJSON({
    url: '/geoserver/wfs?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&SRSNAME=EPSG:4326&TYPENAME=geomines:setup&outputformat=application/json&VIEWPARAMS=table:' + table
  });
  minefield.once('change', function() {
    $('#map').css('background-image', 'none');
    map.getView().fitExtent(minefield.getExtent(), map.getSize());
    map.getLayers().forEach(function(l) { l.setVisible(true); });
    minefield.forEachFeature(function(feature) {
      var fid = feature.get('fid');
      if (feature.get('mined')) {
        minedCountries.push(fid);
      }
      featuresByFid[fid] = feature;
    });
  });

  var map = new ol.Map({
    view: new ol.View2D({
      projection: 'EPSG:4326',
      center: [0, 0],
      zoom: 2
    }),
    layers: [
      new ol.layer.Tile({
        visible: false,
        source: new ol.source.TileWMS({
          url: '/geoserver/wms',
          params: {
            LAYERS: 'geomines:sweep',
            STYLES: 'hidden_countries',
            FORMAT: 'image/png8',
            VIEWPARAMS: 'table:' + table,
            TILED: true
          }
        })
      }),
      new ol.layer.Vector({
        visible: false,
        source: minefield,
        style: (function() {
          var styleCache = {};
          var flagged = [new ol.style.Style({
            fill: new ol.style.Fill({color: '#e75c55'})
          })];
          return function(feature, resolution) {
            var fid = feature.get('fid');
            if (flaggedCountries.indexOf(fid) > -1) {
              return flagged;
            }
            var cleared = clearedCountries.indexOf(fid) > - 1;
            var text =  cleared ?
                (getMinedNeighbours(feature).length || '') + '' :
                '';
            var key = text + (cleared ? '_cleared' : ''); 
            if (!styleCache[key]) {
              styleCache[key] = [new ol.style.Style({
                fill: cleared ?
                    new ol.style.Fill({color: '#b8b672'}) :
                    new ol.style.Fill({color: 'rgba(0, 0, 0, 0)'}),
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
            return styleCache[key];
          };
        }())
      })
    ],
    target: 'map'
  });

  var popup = new ol.Overlay({
    element: $('#popup')
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
