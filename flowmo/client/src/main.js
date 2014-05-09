//var baseUrl = 'http://ec2-75-101-218-208.compute-1.amazonaws.com:8080';
var baseUrl = 'http://localhost:8000/gs'

var lon = -13772294,
    lat = 6237567;
var zoom = 10;

var mousePositionControl = new ol.control.MousePosition({
  coordinateFormat: ol.coordinate.createStringXY(4),
  projection: 'EPSG:3857',
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

var riverSource = new ol.source.ImageWMS({
  url: baseUrl + '/geoserver/wms',
  params: {'LAYERS': 'boundless:wsa_rivers'},
  hidpi: false,
  serverType: 'geoserver'
});

var downstreamSource = new ol.source.ImageWMS({
  url: baseUrl + '/geoserver/wms',
  params: {'LAYERS': 'boundless:wsa_downstream'},
  serverType: 'geoserver'
});

var affectedSource = new ol.source.ImageWMS({
  url: baseUrl + '/geoserver/wms',
  params: {'LAYERS': 'boundless:wsa_affected'},
  serverType: 'geoserver'
});


var downstreamLayer = new ol.layer.Image({
  source: downstreamSource,
  visible: false
});


var affectedLayer = new ol.layer.Image({
  source: affectedSource,
  visible: false
});

function updateStream(gid) {
  console.log(gid);
  if (gid) {
    console.log(gid);
    gid = gid.split('.')[1];
    console.log(gid);
    downstreamSource.updateParams({'viewparams': 'gid:' + gid});
    affectedSource.updateParams({'viewparams': 'gid:' + gid});
    downstreamLayer.setVisible(true);
    affectedLayer.setVisible(true);
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
    new ol.layer.Image({
      source: riverSource
    }),
    downstreamLayer,
    affectedLayer
  ],
  target: 'map',
  view: view
});


var viewProjection = view.getProjection();
var btn = $('.go-btn');
var mapEl = $('#map');

function selectRiver(evt) {
  console.log('Clicked');
  document.getElementById('info').innerHTML = '';
  var viewResolution = /** @type {number} */ (view.getResolution());
  var url = riverSource.getGetFeatureInfoUrl(
      evt.coordinate, viewResolution, viewProjection,
      {'feature_count': 1, 'INFO_FORMAT': 'application/json'});

  $.get(url, function(res) {
    console.log(res);
    if (res && res.features) {
      updateStream(res.features[0].id);
    }
  });
  mapEl.removeClass('crosshair');
  btn.removeClass('toggled');
}
console.log(map);

btn.on('click', function() {
  if (btn.hasClass('toggled')) {
    mapEl.removeClass('crosshair');
    btn.removeClass('toggled');
    map.un('singleclick', selectRiver);
  } else {
    mapEl.addClass('crosshair');
    btn.addClass('toggled');
    map.once('singleclick', selectRiver);
  }
}); 
