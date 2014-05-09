//var baseUrl = 'http://ec2-54-221-78-168.compute-1.amazonaws.com:8080';
var baseUrl = 'http://localhost:8000/gs'

var lon = -15323025,
    lat = 8461731;
var zoom = 12;

var mousePositionControl = new ol.control.MousePosition({
  coordinateFormat: ol.coordinate.createStringXY(4),
  projection: 'EPSG:4326',
  // comment the following two lines to have the mouse position
  // be placed within the map.
  className: 'custom-mouse-position',
  target: document.getElementById('info'),
  undefinedHTML: '&nbsp;'
});

var view = new ol.View2D({
  center: [lon, lat],
  zoom: zoom
});

var riverSource = new ol.source.TileWMS({
  url: baseUrl + '/geoserver/wms',
  params: {'LAYERS': 'boundless:rivers', 'TILED': true},
  hidpi: false,
  serverType: 'geoserver'
});

var downstreamSource = new ol.source.ImageWMS({
  url: baseUrl + '/geoserver/wms',
  params: {'LAYERS': 'boundless:downstream'},
  serverType: 'geoserver'
});

function updateStream(from) {
  if (from) {
    downstreamSource.updateParams({'viewparams': 'from_junct:' + from});
  }
}
var map = new ol.Map({
  controls: ol.control.defaults().extend([mousePositionControl]),
  layers: [
    new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: 'http://{a-c}.tiles.mapbox.com/v3/nps.2yxv8n84/{z}/{x}/{y}.png'
      })
    }),
    new ol.layer.Tile({
      source: riverSource
    }),
    new ol.layer.Image({
      source: downstreamSource
    })
  ],
  target: 'map',
  view: view
});


var viewProjection = view.getProjection();
var btn = $('.go-btn');
function selectRiver(evt) {
  document.getElementById('info').innerHTML = '';
  var viewResolution = /** @type {number} */ (view.getResolution());
  var url = riverSource.getGetFeatureInfoUrl(
      evt.coordinate, viewResolution, viewProjection,
      {'feature_count': 1, 'INFO_FORMAT': 'application/json'});

  $.get(url, function(res) {
    console.log(res);
    if (res && res.features) {
      updateStream(res.features[0].properties.from_junct);
    }
  });

  btn.removeClass('toggled');
}


btn.on('click', function() {
  btn.addClass('toggled');
  map.once('singleclick', selectRiver);
}); 
