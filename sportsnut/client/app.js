var currentDate;
var matchDates = [];
var rewriteIcon = function(icon) {
  icon = icon.substring(icon.lastIndexOf('/')+1).replace('.svg', '.png');
  return 'http://ec2-54-81-74-227.compute-1.amazonaws.com:8080/geoserver/styles/sportsnut/' + icon;
}
var loadFeatures = function(response) {
  // TODO this does not work with ol.js
  var features = vector.getSource().readFeatures(response);
  for (var i=0, ii=features.length; i<ii; ++i) {
    var feature = features[i];
    feature.set('icon1', rewriteIcon(feature.get('icon1')));
    feature.set('icon2', rewriteIcon(feature.get('icon2')));
    var time = Date.parse(feature.get('time'));
    if (matchDates.indexOf(time) == -1) {
      matchDates.push(time);
    }
  }
  matchDates.sort();
  currentDate = matchDates[0];
  $('#wmstime').slider({
    min: 0,
    max: matchDates.length-1,
    step: 1,
    formater: function(value) {
      return new Date(matchDates[value]).toDateString();
    }
  }).on('slideStop', function(evt) {
    currentDate = matchDates[evt.value];
    vector.getSource().dispatchChangeEvent();
  });
  vector.getSource().addFeatures(features);
};

var url = 'http://ec2-54-81-74-227.compute-1.amazonaws.com:8080/geoserver/wfs?service=WFS&request=GetFeature&typename=opengeo:matchview&srsname=EPSG:3857&version=1.0.0&outputformat=text/javascript&format_options=callback:loadFeatures';

$.ajax({
  url: url,
  dataType: 'jsonp'
});

var vector = new ol.layer.Vector({
  source: new ol.source.GeoJSON({}),
  style : function(feature) {
    if (new Date(feature.get('time')).getTime() == currentDate) {
      return [new ol.style.Style({
        image: new ol.style.Icon({
          src: feature.get('icon1'),
          anchor: [1, 1],
          scale: 1/25
        })
      }), 
      new ol.style.Style({
        image: new ol.style.Icon({
          src: feature.get('icon2'),
          anchor: [0, 1],
          scale: 1/25
        })
      })];
    }
  }
});

var projection = ol.proj.get('EPSG:3857');
var projectionExtent = projection.getExtent();
var size = ol.extent.getWidth(projectionExtent) / 256;
var resolutions = new Array(14);
var matrixIds = new Array(14);
for (var z = 0; z < 14; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = 'EPSG:900913:'+z;
}

var layers = [
  new ol.layer.Tile({
    source: new ol.source.WMTS({
    url: 'http://ec2-54-81-74-227.compute-1.amazonaws.com:8080/geoserver/gwc/service/wmts',
        layer: 'osm:osm',
        matrixSet: 'EPSG:900913',
        format: 'image/png',
        projection: projection,
        tileGrid: new ol.tilegrid.WMTS({
          origin: ol.extent.getTopLeft(projectionExtent),
          resolutions: resolutions,
          matrixIds: matrixIds
        }),
        extent: projectionExtent,
        style: 'default'
      })
    }),
  vector
];
var map = new ol.Map({
  layers: layers,
  target: 'map',
  view: new ol.View2D({
    center: [-7067287.25262743, -2705645.022595205],
    zoom: 3
  })
});
vector.getSource().on('change', function(evt) {
  var newValue = matchDates.indexOf(currentDate);
  $('#wmstime').slider('setValue', newValue);
});
var timer;
var frameRate = 1;
$('#play').on('click', function (e) {
  timer = window.setInterval(function() {
    var idx = matchDates.indexOf(currentDate);
    if (idx == matchDates.length-1) {
       window.clearInterval(timer);
       currentDate = matchDates[0];
    } else {
      currentDate = matchDates[idx+1];
    }
    vector.getSource().dispatchChangeEvent();
  }, (1/frameRate)*1000);
});
$('#stop').on('click', function (e) {
  currentDate = matchDates[0];
  if (timer) {
    window.clearInterval(timer);
  }
  vector.getSource().dispatchChangeEvent();
});
$('#pause').on('click', function (e) {
  if (timer) {
    window.clearInterval(timer);
  }
});
$('#forward').on('click', function (e) {
  var idx = matchDates.indexOf(currentDate);
  if (idx+1 < matchDates.length) {
    currentDate = matchDates[idx+1];
    vector.getSource().dispatchChangeEvent();
  }
});
$('#backward').on('click', function (e) {
  var idx = matchDates.indexOf(currentDate);
  if (idx-1 >= 0) {
    currentDate = matchDates[idx-1];
    vector.getSource().dispatchChangeEvent();
  }
});
