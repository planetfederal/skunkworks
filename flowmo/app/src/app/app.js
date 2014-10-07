/**
 * Add all your dependencies here.
 *
 * @require Popup.js
 * @require LayersControl.js
 */

// ========= config section ================================================
var url = '/geoserver/wms';
var urlWfs = '/geoserver/wfs';
var urlCached = '/geoserver/gwc/service/wms';
var featurePrefix = 'usa';
var featureType = 'states';
var featureNS = 'http://usa.opengeo.org';
var srsName = 'EPSG:900913';
var geometryName = 'the_geom';
var geometryType = 'MultiPolygon';
var fields = ['STATE_NAME', 'STATE_ABBR'];
var layerTitle = 'States';
var infoFormat = 'application/vnd.ogc.gml/3.1.1'; // can also be 'text/html'
var center = [-13772294, 6337567];
var zoom = 9;
var workspace = 'opengeo';
var streamWmsLayer = workspace + ':lwss';
var downstreamWfsLayer = workspace + ':lwss_downstream';
// =========================================================================

// override the axis orientation for WMS GetFeatureInfo
ol.proj.addProjection(
    new ol.proj.EPSG4326('http://www.opengis.net/gml/srs/epsg.xml#4326', 'enu')
);

// create a GML format to read WMS GetFeatureInfo response
var format = new ol.format.GML({featureNS: featureNS, featureType: featureType});

// create a new popup with a close box
// the popup will draw itself in the popup div container
// autoPan means the popup will pan the map if it's not visible (at the edges of the map).
var popup = new app.Popup({
  element: document.getElementById('popup'),
  closeBox: true,
  autoPan: true
});

// the tiled WMS source for our local GeoServer layer
var wmsSource = new ol.source.TileWMS({
  url: url,
  params: {'LAYERS': featurePrefix + ':' + featureType, 'TILED': true},
  serverType: 'geoserver'
});

// create a vector layer to contain the feature to be highlightLayered
var highlightLayer = new ol.layer.Vector({
  style: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: '#00FFFF',
      width: 3
    })
  }),
  source: new ol.source.Vector()
});

// create a tile layer for our GeoServer-rendered river layer
var riverLayer = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: urlCached,
    params: {'VERSION':'1.1.0', 'LAYERS':streamWmsLayer, 'TILED':true},
    hidpi: false,
    serverType: 'geoserver'
  })
});

// when the popup is closed, clear the highlightLayer
$(popup).on('close', function() {
  highlightLayer.getSource().clear();
});

// create the OpenLayers Map object
// we add a layer switcher to the map with two groups:
// 1. background, which will use radio buttons
// 2. default (overlays), which will use checkboxes
var map = new ol.Map({
  controls: ol.control.defaults().extend([
    new app.LayersControl({
      groups: {
        background: {
          title: "Base Layers",
          exclusive: true
        }
        // ,
        // 'default': {
        //   title: "Overlays"
        // }
      }
    })
  ]),
  // add the popup as a map overlay
  overlays: [popup],
  // render the map in the 'map' div
  target: document.getElementById('map'),
  // use the Canvas renderer
  renderer: 'canvas',
  layers: [
    // MapBox grey base
    new ol.layer.Tile({
      title: 'Terrain',
      group: "background",
      visible: true,
       source: new ol.source.XYZ({
         url: 'http://{a-c}.tiles.mapbox.com/v3/nps.2yxv8n84/{z}/{x}/{y}.png'
       })
    }),
    // MapQuest imagery
    new ol.layer.Tile({
      title: 'Imagery',
      group: "background",
      visible: false,
      source: new ol.source.MapQuest({layer: 'sat'})
    }),
    // MapQuest hybrid (uses a layer group)
    new ol.layer.Group({
      title: 'Imagery with Streets',
      group: "background",
      visible: false,
      layers: [
        new ol.layer.Tile({
          source: new ol.source.MapQuest({layer: 'sat'})
        }),
        new ol.layer.Tile({
          source: new ol.source.MapQuest({layer: 'hyb'})
        })
      ]
    }),
    // new ol.layer.Tile({
    //   title: layerTitle,
    //   source: wmsSource
    // }),
    riverLayer,
    highlightLayer
  ],
  // initial center and zoom of the map's view
  view: new ol.View2D({
    center: center,
    zoom: zoom
  })
});

// Convert obj to a viewparams string 
// key1:val1;key2:val2;key3:val3
function objToParamStr(obj) {
  var str = '';
  $.each(obj, function(k,v) {
    str.length && (str += ';');
    str += k + ':' + v;
  });
  return str;
}

map.on('singleclick', findStreamOnClick);

function findStreamOnClick(evt) {
  
  var projection = map.getView().getProjection();
  var resolution = map.getView().getResolution();

  var url = riverLayer.getSource().getGetFeatureInfoUrl(
      evt.coordinate, resolution, projection,
      {'feature_count': 1, 'INFO_FORMAT': 'application/json', buffer: 8}
    );

  $.get(url, function(res) {
    if (res && res.features) {
      updateDownstreamStreamLayer(res.features[0]);
    }
  });
  
}

function updateDownstreamStreamLayer(feature) {
  if (feature) {
    var params = {
      ws_key: feature.properties.ws_key,
      seg_no: feature.properties.seg_no,
      wsg_id: feature.properties.wsg_id
    };
    viewparams = objToParamStr(params);
    getDownstreamVectors(viewparams);
  }
}

/* viewparams: wsg_id, ws_key, seg_no */
function getDownstreamVectors(viewparams) {
  var params = {
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeName: downstreamWfsLayer,
    outputFormat: 'application/json',
    srsname: srsName,
    viewparams: viewparams
  };

  $.get(urlWfs, params, function(res) {
    var source = new ol.source.GeoJSON({
        object: res
    });

    vectorLayer = new ol.layer.Vector({
      source: source,
      style: function(feature, res) {
        return [new ol.style.Style({
          fill: new ol.style.Fill({
            color: '#42A1E0'
          }),
          stroke: new ol.style.Stroke({
            color: '#DD0000',
            width: 4
          })
        })];
      },
      visible: true
    });
    
    map.getLayers().pop();
    map.getLayers().push(vectorLayer);

  }); // $.get()
}



// register a single click listener on the map and show a popup
// based on WMS GetFeatureInfo
// map.on('singleclick', function(evt) {
//   var viewResolution = map.getView().getView2D().getResolution();
//   var url = wmsSource.getGetFeatureInfoUrl(
//       evt.coordinate, viewResolution, map.getView().getView2D().getProjection(),
//       {'INFO_FORMAT': infoFormat});
//
//   if (url) {
//     if (infoFormat == 'text/html') {
//       popup.setPosition(evt.coordinate);
//       popup.setContent('<iframe seamless frameborder="0" src="' + url + '"></iframe>');
//       popup.show();
//     } else {
//       alert(url);
//       $.ajax({
//         url: url,
//         success: function(data) {
//           var features = format.readFeatures(data);
//           highlightLayer.getSource().clear();
//           if (features && features.length >= 1 && features[0]) {
//             var feature = features[0];
//             var html = '<table class="table table-striped table-bordered table-condensed">';
//             var values = feature.getProperties();
//             var hasContent = false;
//             for (var key in values) {
//               if (key !== 'the_geom' && key !== 'boundedBy') {
//                 html += '<tr><td>' + key + '</td><td>' + values[key] + '</td></tr>';
//                 hasContent = true;
//               }
//             }
//             if (hasContent === true) {
//               popup.setPosition(evt.coordinate);
//               popup.setContent(html);
//               popup.show();
//             }
//             feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
//             highlightLayer.getSource().addFeature(feature);
//           } else {
//             popup.hide();
//           }
//         }
//       });
//     }
//   } else {
//     popup.hide();
//   }
// });
