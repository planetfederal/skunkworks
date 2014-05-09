window.Boundless = {};
var Boundless = window.Boundless

/**
 * @class
 * The LayersControl is a layer switcher that can be configured with groups.
 * A minimal configuration is:
 *
 *     new Boundless.LayersControl()
 *
 * In this case, all layers are shown with checkboxes and in a single list.
 * If you want to group layers in separate lists, you can configure the control
 * with a groups config option, for example:
 *
 *     new Boundless.LayersControl({
 *       groups: {
 *         background: {
 *           title: "Base Layers",
 *           exclusive: true
 *         },
 *         default: {
 *           title: "Overlays"
 *         }
 *       }
 *     })
 *
 * Layers that have their 'group' property set to 'background', will be part of
 * the first list. The list will be titled 'Base Layers'. The title is
 * optional. All other layers will be part of the default list. Configure a
 * group with exclusive true to get a radio group.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object} opt_options Options.
 */
Boundless.LayersControl = function(opt_options) {
  this.defaultGroup = "default";
  var options = opt_options || {};
  var element = document.createElement('div');
  element.className = 'layers-control ol-unselectable';
  if (options.groups) {
    this.groups = options.groups;
    if (!this.groups[this.defaultGroup]) {
      this.groups[this.defaultGroup] = {};
    }
  } else {
    this.groups = {};
    this.groups[this.defaultGroup] = {};
  }
  this.containers = {};
  for (var group in this.groups) {
    this.containers[group] = document.createElement('ul');
    if (this.groups[group].title) {
      $(this.containers[group]).html(this.groups[group].title);
    }
    element.appendChild(this.containers[group]);
  }
  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });
};

ol.inherits(Boundless.LayersControl, ol.control.Control);

/**
 * Remove the control from its current map and attach it to the new map.
 * Here we create the markup for our layer switcher component.
 * @param {ol.Map} map Map.
 */
Boundless.LayersControl.prototype.setMap = function(map) {
  ol.control.Control.prototype.setMap.call(this, map);
  var layers = map.getLayers().getArray();
  for (var i=0, ii=layers.length; i < ii; ++i) {
    var layer = layers[i];
    var title = layer.get('title');
    var group = layer.get('group') || this.defaultGroup;
    if (title) {
      var item = document.createElement('li');
      if (this.groups[group] && this.groups[group].exclusive === true) {
        $('<input />', {type: 'radio', name: group, value: title, checked:
          layer.get('visible')}).
          change([map, layer, group], function(evt) {
            var map = evt.data[0];
            var layers = map.getLayers().getArray();
            for (var i=0, ii=layers.length; i<ii; ++i) {
              if (layers[i].get("group") == evt.data[2]) {
                layers[i].set('visible', false);
              }
            }
            var layer = evt.data[1];
            layer.set('visible', $(this).is(':checked'));
          }).appendTo(item);
        $('<span />').html(title).appendTo(item);
        this.containers[group].appendChild(item);
      } else {
        $('<input />', {type: 'checkbox', checked: layer.get('visible')}).
          change(layer, function(evt) {
            evt.data.set('visible', $(this).is(':checked'));
          }).appendTo(item);
        $('<span />').html(title).appendTo(item);
        if (this.containers[group]) {
          this.containers[group].appendChild(item);
        } else if (this.containers[this.defaultGroup]) {
          this.containers[this.defaultGroup].appendChild(item);
        }
      }
    }
  }
};

/**
 * @class
 * A popup that can be used to show information about a feature.
 * The map is the core component of OpenLayers. In its minimal configuration it
 * needs an element (a div that is normally a child of the map div):
 *
 *     var popup = new Boundless.Popup({
 *       element: document.getElementById('popup')
 *     });
 *
 * A more complete configuration would be:
 *
 *     var popup = new Boundless.Popup({
 *       element: document.getElementById('popup'),
 *       closeBox: true,
 *       offsetY: -25,
 *       autoPan: true
 *     });
 *
 * `closeBox` will determine whether or not an x will be shown which on click
 * close the popup.
 * `offsetX` and `offsetY` are offsets to be applied to the positioning of the
 * popup overlay.
 * `autoPan` will determine if the map will automatically be panned if the
 * popup is not completely visible.
 * The popup is added to the map by using the `overlays` configuration option
 * of the map.
 *
 * @constructor
 * @extends {ol.Overlay}
 * @param {Object} options Options.
 */
Boundless.Popup = function(options) {
  this.autoPan = options.autoPan !== undefined ? options.autoPan : false;
  this.margin = options.margin !== undefined ? options.margin : 10;
  ol.Overlay.call(this, options);
  if (options.closeBox === true) {
    $('<a href="#" id="popup-closer" class="ol-popup-closer"></a>').click(
      this.getElement(), function(evt) {
        evt.data.style.display = 'none';
        evt.target.blur();
        return false;
      }).appendTo($(this.getElement()));
  }
  $('<div id="popup-content"></div>').appendTo($(this.getElement()));
};

ol.inherits(Boundless.Popup, ol.Overlay);

/**
 * Set the content to be shown in the popup.
 * @param {string} content The content to be shown.
 */
Boundless.Popup.prototype.setContent = function(content) {
  document.getElementById('popup-content').innerHTML = content;
};

/**
 * Show this popup.
 */
Boundless.Popup.prototype.show = function() {
  $(this.getElement()).show();
};

/**
 * Hide this popup.
 */
Boundless.Popup.prototype.hide = function() {
  $(this.getElement()).hide();
};

/**
 * Set the position for this overlay.
 * @param {ol.Coordinate|undefined} position Position.
 */
Boundless.Popup.prototype.setPosition = function(position) {
  ol.Overlay.prototype.setPosition.call(this, position);
  if (this.autoPan === true) {
    var map = this.getMap();
    var el = this.getElement();
    var margin = this.margin;
    window.setTimeout(function() {
      var resolution = map.getView().getResolution();
      var center = map.getView().getCenter();
      var popupOffset = $(el).offset();
      var mapOffset = $(map.getTarget()).offset();
      var offsetY = popupOffset.top - mapOffset.top;
      var mapSize = map.getSize();
      var offsetX = (mapOffset.left + mapSize[0])-(popupOffset.left+$(el).outerWidth(true));
      if (offsetY < 0 || offsetX < 0) {
        var dx = 0, dy = 0;
        if (offsetX < 0) {
          dx = (margin-offsetX)*resolution;
        }
        if (offsetY < 0) {
          dy = (margin-offsetY)*resolution;
        }
       map.getView().setCenter([center[0]+dx, center[1]+dy]);
      }
    }, 0);
  }
};
