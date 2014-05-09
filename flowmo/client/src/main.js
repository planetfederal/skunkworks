

var baseUrl = 'http://flowmo.servebeer.com';
//var baseUrl = 'http://localhost:8000/gs'

var wfsUrl = baseUrl + '/geoserver/wfs';

function downstreamStyles(feature, res) {
  return [new ol.style.Style({
    fill: new ol.style.Fill({
      color: '#42A1E0'
    }),
    stroke: new ol.style.Stroke({
      color: '#990000',
      width: 5
    })
  })];
}

function getAffectedFeatures(gid) {
  var params = {
    service: 'wfs',
    version: '2.0.0',
    request: 'GetFeature',
    typeName: 'boundless:wsa_affected',
    outputFormat: 'application/json',
    viewparams: 'gid:' + gid
  };

  $.get(wfsUrl, params, function(res) {
    createFeatureList(res.features);
  });
}

function getDownstreamFeaturesLayer(gid) {
  var params = {
    service: 'wfs',
    version: '2.0.0',
    request: 'GetFeature',
    typeName: 'boundless:wsa_downstream_vector',
    outputFormat: 'application/json',
    srsname: 'EPSG:3857',
    viewparams: 'gid:' + gid
  };

  $.get(wfsUrl, params, function(res) {
    var source = new ol.source.GeoJSON({
        object: res
    });

    vectorLayer = new ol.layer.Vector({
      source: source,
      style: downstreamStyles,
      visible: true
    });
    var collection = map.getLayers();
    collection.insertAt(2, vectorLayer);

  });
}

var lon = -13772294,
    lat = 6237567;
var zoom = 10;

var view = new ol.View2D({
  center: [lon, lat],
  zoom: zoom
});

var riverSource = new ol.source.TileWMS({
  url: baseUrl + '/geoserver/wms',
  params: {'LAYERS': 'boundless:wsa_rivers', 'TILED': true},
  hidpi: false,
  serverType: 'geoserver'
});

var affectedSource = new ol.source.ImageWMS({
  url: baseUrl + '/geoserver/wms',
  params: {'LAYERS': 'boundless:wsa_affected'},
  serverType: 'geoserver'
});


var affectedLayer = new ol.layer.Image({
  source: affectedSource,
  visible: false
});

var vectorLayer;

function updateStream(gid) {
  if (gid) {
    gid = gid.split('.')[1];
    //downstreamSource.updateParams({'viewparams': 'gid:' + gid});
    affectedSource.updateParams({'viewparams': 'gid:' + gid});

    if (vectorLayer) {
      map.removeLayer(vectorLayer);
    }
    getDownstreamFeaturesLayer(gid);

    affectedLayer.setVisible(true);
    getAffectedFeatures(gid);
  }
}

var map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      source: new ol.source.XYZ({
        url: 'http://{a-c}.tiles.mapbox.com/v3/nps.2yxv8n84/{z}/{x}/{y}.png'
      })
    }),
    new ol.layer.Tile({
      source: riverSource
    }),
    affectedLayer
  ],
  target: 'map',
  view: view
});


var viewProjection = view.getProjection();
var btn = $('.go-btn');
var mapEl = $('#map');

function selectRiver(evt) {

  var viewResolution = /** @type {number} */ (view.getResolution());
  var url = riverSource.getGetFeatureInfoUrl(
      evt.coordinate, viewResolution, viewProjection,
      {'feature_count': 1, 'INFO_FORMAT': 'application/json'});

  $.get(url, function(res) {
    if (res && res.features) {
      updateStream(res.features[0].id);
    }
  });
  mapEl.removeClass('crosshair');
  btn.removeClass('toggled');
}


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


function createFeatureList(features) {
  if (features) {
    // clear existing contents
    var featureList = $('.feature-list');
    featureList.html('');
    // Add feature items
    var items = features.forEach(function(feature) {
      featureList.append('<li class="feature-list-item">' +
            feature.properties.licensee + '</li>');
    });
  }
}
