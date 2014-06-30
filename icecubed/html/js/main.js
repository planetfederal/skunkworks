(function() {

  var extent3408 = [
    -4938036.174191093,
    -2573213.9925217666,
    5084539.232734008,
    3938318.148811234
  ];

  var extent3413 = [
    -2700000,
    -3600000,
    2350000,
    2100000
  ];

  var projection3408 = ol.proj.configureProj4jsProjection({
    code: 'EPSG:3408',
    extent: extent3408
  });

  var projection3413 = ol.proj.configureProj4jsProjection({
    code: 'EPSG:3413',
    extent: extent3413
  });

  var wmsUrl = 'http://apps.boundlessgeo.com/geoserver/icecubed/wms';
  var workspace = 'icecubed';

  var baseLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
      url: wmsUrl,
      params: {
        LAYERS: workspace + ':NaturalEarth1_3408_basemap',
        TILED: true
      },
      extent: extent3408,
      serverType: 'geoserver',
      projection: projection3408
    })
  });

  var extentLayerNames = [
    'extent_N_198008_polygon',
    'extent_N_198308_polygon',
    'extent_N_198608_polygon',
    'extent_N_198908_polygon',
    'extent_N_199208_polygon',
    'extent_N_199508_polygon',
    'extent_N_199808_polygon',
    'extent_N_200108_polygon',
    'extent_N_200408_polygon',
    'extent_N_200708_polygon',
    'extent_N_201008_polygon',
    'extent_N_201308_polygon'
  ];

  function makeExtentLayer(layerName, isVisible) {
    isVisible = !!isVisible;
    return new ol.layer.Tile({
      source: new ol.source.TileWMS({
        url: wmsUrl,
        params: {
          LAYERS: workspace + ':' + layerName,
          TILED: true
        },
        serverType: 'geoserver',
        projection: projection3413
      }),
      visible: isVisible
    });
  }

  var iceLayers = [];
  var layerLookup = {};
  extentLayerNames.forEach(function(layerName) {
    var layer = makeExtentLayer(layerName);
    layerLookup[layerName] = layer;
    iceLayers.push(layer);
  });
  var medianLayer = makeExtentLayer('median_N_08_1981_2010_polyline', true);
  var cryoLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
      url: 'https://nsidc.org/cgi-bin/atlas_north',
      params: {
        LAYERS: 'snow_extent_08',
        TILED: true,
        SRS: 'EPSG:3408'
      },
      projection: projection3408
    }),
    visible: true
  });

  var allLayers = [baseLayer]
    .concat(iceLayers)
    .concat(medianLayer)
    .concat(cryoLayer);

  var map = new ol.Map({
    target: 'map',
    renderer: 'canvas',
    layers: allLayers,
    view: new ol.View({
      center: [-5049.84109515, 825838.67673878],
      zoom: 2,
      projection: projection3408
    })
  });

  // turn on the single layer that is clicked on
  $('#radios').click(function(e) {
    var target = e.target;
    var layerName = target.getAttribute('data-radio');
    if (!layerName) {
      // user clicked in area but not on radio
      return;
    }
    var layer = layerLookup[layerName];
    if (!layer) {
      throw new Error('Could not find layer name: ' + layerName);
    }
    iceLayers.forEach(function(iceLayer) {
      iceLayer.setVisible(false);
    });
    layer.setVisible(true);
  });

  $('#cryo').click(function(e) {
    cryoLayer.setVisible(this.checked);
  });

  // the first layer should be visible on page load
  iceLayers[0].setVisible(true);

}());
