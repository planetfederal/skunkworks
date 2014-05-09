

//var baseUrl = 'http://ec2-75-101-218-208.compute-1.amazonaws.com:8080';
var baseUrl = 'http://localhost:8000/gs'

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
/*
function getAffectedFeatures(gid) {
  var params = {
    service: 'wfs',
    version: '2.0.0',
    request: 'GetFeature',
    typeName: 'boundless:wsa_affected',
    outputFormat: 'application/json',
    viewparams: 'gid:' + gid
  };
  console.log($.param(params));
  $.get(wfsUrl, params, function(res) {
    console.log(res);
  });
}
*/
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
    console.log('res', res);
    var source = new ol.source.GeoJSON({
        object: res
    });
    source.on('addfeature', function(feature) {
      console.log('downstream feature added');
    });
    vectorLayer = new ol.layer.Vector({
      source: source,
      style: downstreamStyles,
      visible: true
    });
    var collection = map.getLayers();
    collection.insertAt(2, vectorLayer);
    //map.addLayer(vectorLayer);

    //getAffectedFeaturesLayer(res);
  })
}
/*
function getAffectedFeaturesLayer(geojson) {
  var params = {
    service: 'wfs',
    version: '2.0.0',
    request: 'GetFeature',
    typeName: 'boundless:wsa_affected_vector',
    outputFormat: 'application/json',
    srsname: 'EPSG:3857',
    viewparams: 'json:' + JSON.stringify(geojson)
  };
  $.post(wfsUrl, JSON.stringify(geojson), function(res) {
    var source = new ol.source.GeoJSON({
        url: wfsUrl + '?' + $.param(params)
    });
    source.on('addfeature', function(feature) {
      console.log('affected feature added');
    });
    map.addLayer(new ol.layer.Vector({
      source: source,
      style: downstreamStyles,
      visible: true
    }));
  });
}
*/
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

var vectorLayer;

function updateStream(gid) {
  if (gid) {
    gid = gid.split('.')[1];
    downstreamSource.updateParams({'viewparams': 'gid:' + gid});
    affectedSource.updateParams({'viewparams': 'gid:' + gid});

    if (vectorLayer) {
      map.removeLayer(vectorLayer);
    }
    getDownstreamFeaturesLayer(gid);

    //downstreamLayer.setVisible(true);
    affectedLayer.setVisible(true);
    //getAffectedFeatures(gid);
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
    var featureList = $('.feature-list').html('');

    // Add feature items
    var items = features.map(function(feature) {
      return $('li').addClass('feature-list-item')
                    .html(feature.properties.ddrssln1);
    });

    featureList.append(items);
  }
}
