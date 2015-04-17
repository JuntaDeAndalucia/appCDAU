/**
 * Copyright (c) 2008-2011 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 *
 * Class adapter from GeoExt
 */

/**
 * @require OpenLayers/Layer.js
 * @require OpenLayers/Format/JSON.js
 * @require OpenLayers/Format/GeoJSON.js
 * @require OpenLayers/BaseTypes/Class.js
 */

/** api: example
 * Provides print functionality for OpenLayers maps using MapFish Print.
 *  Minimal code to print as much of the current map extent as possible as
 *  soon as the print service capabilities are loaded, using the first layout
 *  reported by the print service:
 *
 *  .. code-block:: javascript
 *
 *      var mapPanel = new GeoExt.MapPanel({
 *          renderTo: "mappanel",
 *          layers: [new OpenLayers.Layer.WMS("wms", "/geoserver/wms",
 *              {layers: "topp:tasmania_state_boundaries"})],
 *          center: [146.56, -41.56],
 *          zoom: 7
 *      });
 *      var printProvider = new GeoExt.data.PrintProvider({
 *          url: "/geoserver/pdf",
 *          listeners: {
 *              "loadcapabilities": funcramirotion() {
 *                  var printPage = new GeoExt.data.PrintPage({
 *                      printProvider: printProvider
 *                  });
 *                  printPage.fit(mapPanel, true);
 *                  printProvider.print(mapPanel, printPage);
 *              }
 *          }
 *      });
 */

/** api: constructor
 *  .. class:: PrintProvider
 *
 *  Provides an interface to a Mapfish or GeoServer print module. For printing,
 *  one or more instances of :class:`Mapea.Util.PrintPage ` are also required
 *  to tell the PrintProvider about the scale and extent (and optionally
 *  rotation) of the page(s) we want to print.
 */
Mapea.Util.PrintProvider = OpenLayers.Class({
   /** api: config[url]
    *  ``String`` Base url of the print service. Only required if
    *  ``capabilities`` is not provided. This
    *  is usually something like http://path/to/mapfish/print for Mapfish,
    *  and http://path/to/geoserver/pdf for GeoServer with the printing
    *  extension installed. This property requires that the print service is
    *  at the same origin as the application (or accessible via proxy).
    */

   /** private:  property[url]
    *  ``String`` Base url of the print service. Will always have a trailing
    *  "/".
    */
   url: null,

   /** api: config[autoLoad]
    *  ``Boolean`` If set to true, the capabilities will be loaded upon
    *  instance creation, and ``loadCapabilities`` does not need to be called
    *  manually. Setting this when ``capabilities`` and no ``url`` is provided
    *  has no effect. Default is false.
    */

   /** api: config[capabilities]
    *  ``Object`` Capabilities of the print service. Only required if ``url``
    *  is not provided. This is the object returned by the ``info.json``
    *  endpoint of the print service, and is usually obtained by including a
    *  script tag pointing to
    *  http://path/to/printservice/info.json?var=myvar in the head of the
    *  html document, making the capabilities accessible as ``window.myvar``.
    *  This property should be used when no local print service or proxy is
    *  available, or when you do not listen for the ``loadcapabilities``
    *  events before creating components that require the PrintProvider's
    *  capabilities to be available.
    */

   /** private: property[capabilities]
    *  ``Object`` Capabilities as returned from the print service.
    */
   capabilities: null,

   /** api: config[method]
    *  ``String`` Either ``POST`` or ``GET`` (case-sensitive). Method to use
    *  when sending print requests to the servlet. If the print service is at
    *  the same origin as the application (or accessible via proxy), then
    *  ``POST`` is recommended. Use ``GET`` when accessing a remote print
    *  service with no proxy available, but expect issues with character
    *  encoding and URLs exceeding the maximum length. Default is ``POST``.
    */

   /** private: property[method]
    *  ``String`` Either ``POST`` or ``GET`` (case-sensitive). Method to use
    *  when sending print requests to the servlet.
    */
   method: "POST",

   /** api: config[encoding]
    * ``String`` The encoding to set in the headers when requesting the print
    * service. Prevent character encoding issues, especially when using IE.
    * Default is retrieved from document charset or characterSet if existing
    * or ``UTF-8`` if not.
    */
   encoding: document.charset || document.characterSet || "UTF-8",

   /** api: config[timeout]
    *  ``Number`` Timeout of the POST Ajax request used for the print request
    *  (in milliseconds). Default of 30 seconds. Has no effect if ``method``
    *  is set to ``GET``.
    */
   timeout: 30000,

   /** api: property[customParams]
    *  ``Object`` Key-value pairs of custom data to be sent to the print
    *  service. Optional. This is e.g. useful for complex layout definitions
    *  on the server side that require additional parameters.
    */
   customParams: null,

   /** api: config[baseParams]
    *  ``Object`` Key-value pairs of base params to be add to every
    *  request to the service. Optional.
    */

   /** api: property[scales]
    *  ``Object`` read-only. A store representing the scales
    *  available.
    *
    *  Fields of records in this store:
    *
    *  * name - ``String`` the name of the scale
    *  * value - ``Float`` the scale denominator
    */
   scales: null,

   /** api: property[dpis]
    *  ``Object`` read-only. A store representing the dpis
    *  available.
    *
    *  Fields of records in this store:
    *
    *  * name - ``String`` the name of the dpi
    *  * value - ``Float`` the dots per inch
    */
   dpis: null,

   /** api: property[layouts]
    *  ``Object`` read-only. A store representing the layouts
    *  available.
    *
    *  Fields of records in this store:
    *
    *  * name - ``String`` the name of the layout
    *  * size - ``Object`` width and height of the map in points
    *  * rotation - ``Boolean`` indicates if rotation is supported
    */
   layouts: null,

   /** api: property[dpi]
    *  ``Object`` the record for the currently used resolution.
    *  Read-only, use ``setDpi`` to set the value.
    */
   dpi: null,

   /** api: property[layout]
    *  ``Object`` the record of the currently used layout. Read-only,
    *  use ``setLayout`` to set the value.
    */
   layout: null,
   
   /** api: property[events]
    *  ``Object`` the events registered to this provider
    */
   events : {
       "layoutchange" : OpenLayers.Function.Void,
       "dpichange" : OpenLayers.Function.Void,
       "print" : OpenLayers.Function.Void,
       "printexception" : OpenLayers.Function.Void,
       "loadcapabilities" : OpenLayers.Function.Void,
       "loadcapabilitiesexception" : OpenLayers.Function.Void
   },
   
   /** api: property[map]
    *  ``Mapea.Map`` Map object of Mapea
    */
   map : null,

   /** private:  method[initialize]
    *  Private constructor override.
    */
   initialize: function(config) {

      this.initialConfig = config;

      OpenLayers.Util.applyDefaults(this, config);

      if (!this.customParams) {
         this.customParams = {};
      }

      if (config.capabilities) {
         this.loadStores();
      }
      else {
         if (this.url.split("/").pop()) {
            this.url += "/";
         }
         this.loadCapabilities();
      }

   },

   /** api: method[setLayout]
    *  :param layout: ``Object`` the record of the layout.
    *
    *  Sets the layout for this printProvider.
    */
   setLayout: function(layout) {
      this.layout = layout;
      this.fireEvent("layoutchange", layout);
   },

   /** api: method[setDpi]
    *  :param dpi: ``Object`` the dpi record.
    *
    *  Sets the dpi for this printProvider.
    */
   setDpi: function(dpi) {
      this.dpi = dpi;
      this.fireEvent("dpichange", dpi);
   },
   
   /** api: method[setCustomParams]
    *  :param customParams: ``Object`` the custom parameters for this
    *  printProvider.
    *
    *  Sets the custom parameters for this printProvider.
    */
   setCustomParams : function(customParams) {
       this.customParams = customParams;
   },

   /** api: method[print]
    *  :param map: ``GeoExt.MapPanel`` or ``OpenLayers.Map`` The map to print.
    *  :param pages: ``Array`` of :class:`GeoExt.data.PrintPage` or
    *      :class:`GeoExt.data.PrintPage` page(s) to print.
    *  :param options: ``Object`` of additional options, see below.
    *
    *  Sends the print command to the print service and opens a new window
    *  with the resulting PDF.
    *
    *  Valid properties for the ``options`` argument:
    *
    *      * ``legend`` - :class:`GeoExt.LegendPanel` If provided, the legend
    *        will be added to the print document. For the printed result to
    *        look like the LegendPanel, the following ``!legends`` block
    *        should be included in the ``items`` of your page layout in the
    *        print module's configuration file:
    *
    *        .. code-block:: none
    *
    *          - !legends
    *              maxIconWidth: 0
    *              maxIconHeight: 0
    *              classIndentation: 0
    *              layerSpace: 5
    *              layerFontSize: 10
    *
    *      * ``overview`` - :class:`OpenLayers.Control.OverviewMap` If provided,
    *        the layers for the overview map in the printout will be taken from
    *        the OverviewMap control. If not provided, the print service will
    *        use the main map's layers for the overview map. Applies only for
    *        layouts configured to print an overview map.
    */
   print: function(map, pages, options) {
      if (!OpenLayers.Util.isArray(pages)) {
          pages = [pages];
      }

      options = options || {};

      var jsonData = OpenLayers.Util.applyDefaults({
         units: map.getUnits(),
         srs: map.baseLayer.projection.getCode(),
         layout: this.layout.name,
         dpi: this.dpi.value
      }, this.customParams);

      var pagesLayer = pages[0].feature.layer;

      var encodedLayers = [];

      // ensure that the baseLayer is the first one in the encoded list
      var layers = map.layers.concat();
      var idxBaseLayer = layers.indexOf(map.baseLayer);
      if (idxBaseLayer != -1) {
         layers.splice(idxBaseLayer, 1);
      }
      layers.splice(0, 0, map.baseLayer);

      for (var i = 0; i < layers.length; i++) {
          if ((layers[i].getVisibility() === true) 
                  && (layers[i].inRange === true)) {
            var enc = this.encodeLayer(layers[i]);
            if(enc != null) {
                encodedLayers.push(enc);
            }
         }
      }

      jsonData.layers = encodedLayers;

      var encodedPages = [];
      for (var i = 0; i < pages.length; i++) {
          var page = pages[i];
          // PAGE CONFIG
          var pageconf = {};
          // rotation
          pageconf.rotation = page.rotation;
          // center & scale
          if (page.center && page.scale) {
              pageconf.center = [page.center.lon, page.center.lat];
              pageconf.scale = page.scale.value
          }
          // bbox
          else if (page.bbox) {
              pageconf.bbox = page.bbox;
          }
          pageconf = OpenLayers.Util.applyDefaults(pageconf, page.customParams);
          encodedPages.push(pageconf);
      }

      jsonData.pages = encodedPages;
           
      if (options.legend === true) {
          var encodedLegends = [];
          
          var layers = map.layers.concat();
          var idxBaseLayer = layers.indexOf(map.baseLayer);
          if (idxBaseLayer != -1) {
             layers.splice(idxBaseLayer, 1);
          }
          layers.splice(0, 0, map.baseLayer);

          for (var i = 0, ilen = layers.length; i < ilen; i++) {
             var layer = layers[i];
             
             if ((layer.getVisibility() === true) 
                     && (layer.inRange === true) && !Mapea.Util.isControlLayer(layer)) {
                var enc = OpenLayers.Function.bind(this.encoders.legends, this)(layer);
                if (enc != null) {
                    encodedLegends.push(enc);
                }
             }
          }
          
          jsonData.legends = encodedLegends;
      }
      
      var createURL = OpenLayers.Util.urlAppend(this.capabilities.createURL, "mapeaop=geoprint");
      var headers = {"Content-Type": "application/json; charset=" + this.encoding};
      
      // only POST request
      var dataAsString = JSON.stringify(jsonData);
      
      var _self = this;
      var elemScope = {"downloadId" : options.downloadId};
      var request = OpenLayers.Request.POST({
          url: createURL,
          data: dataAsString,
          headers: headers,
          success: OpenLayers.Function.bind(function(xmlhttpResponse) {
              try {
                  var response = JSON.parse(xmlhttpResponse.responseText);
                  _self.fireEvent("print", response, this.downloadId);
              }
              catch(err) {
                  _self.fireEvent("printexception", err, this.downloadId);
              }
          }, elemScope),
          failure: OpenLayers.Function.bind(function(err) {
              _self.fireEvent("printexception", err, this.downloadId);
          }, elemScope),
          scope: this
      });
   },

   /** api: method[loadCapabilities]
    *
    *  Loads the capabilities from the print service. If this instance is
    *  configured with either ``capabilities`` or a ``url`` and ``autoLoad``
    *  set to true, then this method does not need to be called from the
    *  application.
    */
   loadCapabilities: function() {
      if (!this.url) {
         return;
      }
      
      // builds the url
      var capabilitiesUrl = this.url + "info.json";
      capabilitiesUrl = OpenLayers.Util.urlAppend(capabilitiesUrl, "mapeaop=geoprint");

      var request = OpenLayers.Request.GET({
         url: capabilitiesUrl,
         success: function(xmlhttpResponse) {
            try {
              this.capabilities = JSON.parse(xmlhttpResponse.responseText);
            }
            catch(err) {
                return this.fireEvent("loadcapabilitiesexception", err);
            }
            this.loadStores();
         },
         failure: function(err) {
             this.fireEvent("loadcapabilitiesexception", err);
         },
         scope: this
      });
   },

   /** private: method[loadStores]
    */
   loadStores: function() {
      this.scales = this.capabilities.scales;
      this.dpis = this.capabilities.dpis;
      this.layouts = this.capabilities.layouts;

      this.setLayout(this.layouts[0]);
      this.setDpi(this.dpis[0]);
      this.fireEvent("loadcapabilities", this.capabilities);
   },

   /** private: method[encodeLayer]
    *  :param layer: ``OpenLayers.Layer``
    *  :return: ``Object``
    *
    *  Encodes a layer for the print service.
    */
   encodeLayer: function(layer) {

      var encLayer;

      for (var c in this.encoders.layers) {
         if (OpenLayers.Layer[c] && layer instanceof OpenLayers.Layer[c]) {
            encLayer = this.encoders.layers[c](layer);
            break;
         }
      }
      // only return the encLayer object when we have a type. Prevents a
      // fallback on base encoders like HTTPRequest.
      return (encLayer && encLayer.type) ? encLayer : null;

   },

   /** private: property[encoders]
    *  ``Object`` Encoders for all print content
    */
   encoders: {
      "layers": {
         "Layer": function(layer) {
            var enc = {};
            /*if (layer.options && layer.options.maxScale) {
               enc.minScaleDenominator = layer.options.maxScale;
            }
            if (layer.options && layer.options.minScale) {
               enc.maxScaleDenominator = layer.options.minScale;
            }*/
            return enc;
         },
         "WMS": function(layer) {
            var enc = this.HTTPRequest.call(this, layer);
            jQuery.extend(enc, {
               type: 'WMS',
               layers: [layer.params.LAYERS].join(",").split(","),
               format: layer.params.FORMAT,
               styles: [layer.params.STYLES].join(",").split(",")
            });
            
            /******************************
             * MAPEO DE CAPAS TILEADAS 
             */
            // gets the layer configurated
            var noCachedLayer = Mapea.Util.changeCachedLayer(layer);
            
            if (noCachedLayer != null) {
                enc.layers = [noCachedLayer.name];
                enc.baseURL = noCachedLayer.url;
            }
            /**
             ******************************/
            
            var param;
            for (var p in layer.params) {
               param = p.toLowerCase();
               if (!layer.DEFAULT_PARAMS[param] &&
                  "layers,styles,width,height,srs".indexOf(param) == -1) {
                  if (!enc.customParams) {
                     enc.customParams = {};
                  }
                  enc.customParams[p] = layer.params[p];
               }
            }
            return enc;
         },
         "OSM": function(layer) {
            var enc = this.TileCache.call(this, layer);
            return jQuery.extend(enc, {
               type: 'OSM',
               baseURL: enc.baseURL.substr(0, enc.baseURL.indexOf("$")),
               extension: "png"
            });
         },
         "TMS": function(layer) {
            var enc = this.TileCache.call(this, layer);
            return jQuery.extend(enc, {
               type: 'TMS',
               format: layer.type
            });
         },
         "TileCache": function(layer) {
            var enc = this.HTTPRequest.call(this, layer);
            return jQuery.extend(enc, {
               type: 'TileCache',
               layer: layer.layername,
               maxExtent: layer.maxExtent.toArray(),
               tileSize: [layer.tileSize.w, layer.tileSize.h],
               extension: layer.extension,
               resolutions: layer.serverResolutions || layer.resolutions
            });
         },
         "WMTS": function(layer) {
            var enc = this.HTTPRequest.call(this, layer);
            return jQuery.extend(enc, {
               type: 'WMTS',
               layer: layer.layer,
               version: layer.version,
               requestEncoding: layer.requestEncoding,
               tileOrigin: [layer.tileOrigin.lon, layer.tileOrigin.lat],
               tileSize: [layer.tileSize.w, layer.tileSize.h],
               style: layer.style,
               formatSuffix: layer.formatSuffix,
               dimensions: layer.dimensions,
               params: layer.params,
               maxExtent: (layer.tileFullExtent != null) ? layer.tileFullExtent.toArray() : layer.maxExtent.toArray(),
               matrixSet: layer.matrixSet,
               zoomOffset: layer.zoomOffset,
               resolutions: layer.serverResolutions || layer.resolutions
            });
         },
         "KaMapCache": function(layer) {
            var enc = this.KaMap.call(this, layer);
            return jQuery.extend(enc, {
               type: 'KaMapCache',
               // group param is mandatory when using KaMapCache
               group: layer.params['g'],
               metaTileWidth: layer.params['metaTileSize']['w'],
               metaTileHeight: layer.params['metaTileSize']['h']
            });
         },
         "KaMap": function(layer) {
            var enc = this.HTTPRequest.call(this, layer);
            return jQuery.extend(enc, {
               type: 'KaMap',
               map: layer.params['map'],
               extension: layer.params['i'],
               // group param is optional when using KaMap
               group: layer.params['g'] || "",
               maxExtent: layer.maxExtent.toArray(),
               tileSize: [layer.tileSize.w, layer.tileSize.h],
               resolutions: layer.serverResolutions || layer.resolutions
            });
         },
         "HTTPRequest": function(layer) {
            var enc = this.Layer.call(this, layer);
            return jQuery.extend(enc, {
               baseURL: OpenLayers.Util.isArray(layer.url)? layer.url[0] :
                   layer.url,
               opacity: (layer.opacity != null)? layer.opacity : 1.0,
               singleTile: layer.singleTile
            });
         },
         "Image": function(layer) {
            var enc = this.Layer.call(this, layer);
            return jQuery.extend(enc, {
               type: 'Image',
               baseURL: Mapea.Util.getAbsoluteUrl(layer.getURL(layer.extent)),
               opacity: (layer.opacity != null) ? layer.opacity : 1.0,
               extent: layer.extent.toArray(),
               pixelSize: [layer.size.w, layer.size.h],
               name: layer.name
            });
         },
         "Vector": function(layer) {
            if (!layer.features.length) {
               return;
            }
            var extent = layer.map.getExtent();
            var encFeatures = [];
            var encStyles = {};
            var features = layer.features;
            var featureFormat = new OpenLayers.Format.GeoJSON();
            var styleFormat = new OpenLayers.Format.JSON();
            var nextId = 1;
            var styleDict = {};
            var feature, style, dictKey, dictItem, styleName;
            for (var i = 0, len = features.length; i < len; ++i) {
               feature = features[i];
               // checks if the feature is in the extent
               if (feature.geometry && extent.intersectsBounds(feature.geometry.getBounds())) {
                   style = feature.style || layer.style ||
                      layer.styleMap.createSymbolizer(feature,
                         feature.renderIntent);
                   dictKey = styleFormat.write(style);
                   dictItem = styleDict[dictKey];
                   if (dictItem) {
                      //this style is already known
                      styleName = dictItem;
                   }
                   else {
                      // new style
                      styleDict[dictKey] = styleName = nextId++;
                      if (style.externalGraphic) {
                          encStyles[styleName] = OpenLayers.Util.extend({
                              externalGraphic: Mapea.Util.getAbsoluteUrl(style.externalGraphic)
                          }, style);
                      }
                      else {
                         encStyles[styleName] = style;
                      }
                   }
                   // clones the feature to remove its attributes
                   var clonedFeature = feature.clone();
                   clonedFeature.attributes = {};
                   var featureGeoJson = featureFormat.extract.feature.call(
                      featureFormat, clonedFeature);
    
                   featureGeoJson.properties = OpenLayers.Util.extend({
                      _gx_style: styleName
                   }, featureGeoJson.properties);
    
                   encFeatures.push(featureGeoJson);
               }
            }
            var enc = this.Layer.call(this, layer);
            return jQuery.extend(enc, {
               type: 'Vector',
               styles: encStyles,
               styleProperty: '_gx_style',
               geoJson: {
                  type: "FeatureCollection",
                  features: encFeatures
               },
               name: layer.name,
               opacity: (layer.opacity != null) ? layer.opacity : 1.0
            });
         },
         "Markers": function(layer) {
            var features = [];
            for (var i = 0, len = layer.markers.length; i < len; i++) {
               var marker = layer.markers[i];
               var geometry = new OpenLayers.Geometry.Point(marker.lonlat.lon, marker.lonlat.lat);
               var style = {
                  externalGraphic: marker.icon.url,
                  graphicWidth: marker.icon.size.w,
                  graphicHeight: marker.icon.size.h,
                  graphicXOffset: marker.icon.offset.x,
                  graphicYOffset: marker.icon.offset.y
               };
               var feature = new OpenLayers.Feature.Vector(geometry, {}, style);
               features.push(feature);
            }
            var vector = new OpenLayers.Layer.Vector(layer.name);
            vector.addFeatures(features);
            var output = this.Vector.call(this, vector);
            vector.destroy();
            return output;
         }
      },
      "legends": function(layer) {
          var encLegend = null;

          if (layer && layer.displayInLayerSwitcher) {
              var name = layer.name;
              var legendURL = null;
    
              if (!Mapea.Util.isWFS(layer) && layer.params) {
                  if (layer.params.ISWMC && layer.params.LAYERLEGEND) {
                      legendURL = layer.params.LAYERLEGEND.href;
                  }
                  else {
                      var layerURL = layer.params.LAYERS;
                      
                      // checks if the layer is cached
                      var noCachedLayer = Mapea.Util.changeCachedLayer(layer);
                      if (noCachedLayer != null) {
                          layerURL = noCachedLayer.url;
                      }
                      // builds the URL
                      legendURL = layer.getFullRequestString({
                          REQUEST : "GetLegendGraphic",
                          LAYER : layerURL,
                          FORMAT : "image/png",
                          EXCEPTIONS: "application/vnd.ogc.se_blank",
                          WIDTH : "150"
                      });
                  }
              }
              
              encLegend = {
                  "name" : name,
                  "classes" : []
              };
              
              if (legendURL && (legendURL != null)) {
                  legendURL = Mapea.Util.getAbsoluteUrl(legendURL);
                  
                  encLegend["classes"].push({
                      "name" : "",
                      "icons" : [legendURL]
                  });
              }
          }

          return encLegend;
      }
   },
   
   /**
    * This method fires the callbacks for the
    * specified event name
    */
   fireEvent : function(eventName, args, id) {
       var eventCallback = this.events[eventName];
       if (eventCallback && (typeof eventCallback === "function" )) {
           eventCallback(args, id);
       }
   },
   
   /**
    * Sets the map object for this provider instance
    */
   setMap : function(map) {
       this.map = map;
   },

   CLASS_NAME: "Mapea.Util.PrintProvider"
});