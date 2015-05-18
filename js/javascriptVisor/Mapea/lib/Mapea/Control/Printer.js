/**
 * Class: Mapea.Control.Geolocate
 * The Geolocate control wraps w3c geolocation API into control that can be
 * bound to a map, and generate events on location update
 *
 * To use this control requires to load the proj4js library if the projection
 * of the map is not EPSG:4326 or EPSG:900913.
 *
 * Inherits from:
 *  - <OpenLayers.Control.Geolocate>
 */
Mapea.Control.Printer = OpenLayers.Class(OpenLayers.Control, {
    
    _provider : null,
    
    _showControl : false,
    
    _layoutSelectId : null,
    _dpiSelectId : null,
//    _scalesSelectId : null,
    _formatSelectId : null,
    _titleInputId : null,
    _descriptionAreaId : null,
    _queueULId : null,
    _queueTitleId : null,
    _downloadIframeId : null,
    _forceScaleCheckboxId : null,
    
    _completedQueue: null,
    
    printURL : null,
    
    printEvents : null,
    
    layoutParams : null,
    
    pagesParams : null,
    
    options : null,
    
    /**
     * Constructor: Mapea.Control.Geolocate
     * Creates an Mapea Control Geolocate.
     * 
     * Parameters:
     * options - {Object} 
     */
    initialize: function (url, layoutParams, pagesParams, options) {
        // validations
        // TODO
        
        // super call
        OpenLayers.Control.prototype.initialize.apply(this, [options]);
        
        // URL
        this.printURL = url;
        
        // Layout parameters
        this.layoutParams = layoutParams;
        
        // Page parameters
        if (pagesParams && !OpenLayers.Util.isArray(pagesParams)) {
            pagesParams = [pagesParams];
        }
        this.pagesParams = pagesParams;
        
        // other options
        this.options = options || {};
        
        // print events
        this.printEvents = this.options.events || {
            "print" : OpenLayers.Function.bind(this.download, this),
            "printexception" : OpenLayers.Function.bind(this.printError, this),
            "loadcapabilities" : OpenLayers.Function.bind(this.capabilitiesCallback, this),
            "loadcapabilitiesexception" : OpenLayers.Function.bind(this.capabilitiesError, this)
        };
        
        // ids generation
        this._layoutSelectId = OpenLayers.Util.createUniqueID("layoutSelect_");
        this._dpiSelectId = OpenLayers.Util.createUniqueID("dpiSelect_");
        this._formatSelectId = OpenLayers.Util.createUniqueID("formatSelect_");
        this._titleInputId = OpenLayers.Util.createUniqueID("titleInput_");
        this._descriptionAreaId = OpenLayers.Util.createUniqueID("descriptionArea_");
        this._queueULId = OpenLayers.Util.createUniqueID("queueUL_");
        this._queueTitleId = OpenLayers.Util.createUniqueID("queueTitle_");
        this._downloadIframeId = OpenLayers.Util.createUniqueID("mapeaPrinterDownload_");
        this._forceScaleCheckboxId = OpenLayers.Util.createUniqueID("forceScale_");
        
        Mapea.Util.hasPrinterControl = true;
    },

    /**
     * Method: draw
     * The draw method is called when the control is ready to be displayed
     * on the page.  If a div has not been created one is created.  Controls
     * with a visual component will almost always want to override this method 
     * to customize the look of control. 
     *
     * Parameters:
     * px - {<OpenLayers.Pixel>} The top-left pixel position of the control
     *      or null.
     *
     * Returns:
     * {DOMElement} A reference to the DIV DOMElement containing the control
     */
    draw: function (px) {
        var div = OpenLayers.Control.prototype.draw.apply(this, arguments);
        
        // adds class for mobile devices
        if (Mapea.Util.isMobile) {
            OpenLayers.Element.addClass(div, "mobile");
        }
        
        /**********************************************
         * PRINT TITLE
         **********************************************/
        var printTitle = Mapea.Util.createDiv("title");
        printTitle.innerHTML = "Impresión del mapa";
        div.appendChild(printTitle);
        
        // generates the form
        var printForm = Mapea.Util.createDiv("form");

        /**********************************************
         * TITLE
         **********************************************/
        // div
        var titleDiv = Mapea.Util.createDiv("title");
        // input
        var titleInput = Mapea.Util.createInput("text", this._titleInputId, null, "Título");
        titleDiv.appendChild(titleInput);

        printForm.appendChild(titleDiv);

        // mobile events
        if (Mapea.Util.isMobile) {
            OpenLayers.Event.observe(titleInput, "touchend", function(evt) {
                jQuery(titleInput).focus();
            });
        }

        /**********************************************
         * DESCRIPTION
         **********************************************/
        // div
        var descriptionDiv = Mapea.Util.createDiv("description");
        // area
        var descriptionArea = Mapea.Util.createArea(this._descriptionAreaId, null, "Descripción");
        descriptionDiv.appendChild(descriptionArea);
        
        printForm.appendChild(descriptionDiv);
        
        // mobile events
        if (Mapea.Util.isMobile) {
            OpenLayers.Event.observe(descriptionArea, "touchend", function(evt) {
                jQuery(descriptionArea).focus();
            });
        }

        /**********************************************
         * LAYOUT
         **********************************************/
        // div
        var layoutDiv = Mapea.Util.createDiv("layout");
        // label
        var layoutLabel = Mapea.Util.createLabel(this._layoutSelectId, "Plantilla ");
        layoutDiv.appendChild(layoutLabel);
        // select
        var layoutSelect = Mapea.Util.createSelect(this._layoutSelectId);
        layoutDiv.appendChild(layoutSelect);

        printForm.appendChild(layoutDiv);
        
        /*
         * emulates click events for mobile devices
         * because they do not registers touch events when
         * the control is include map div
         */
        if (Mapea.Util.isMobile) {
            OpenLayers.Event.observe(layoutSelect, "touchend", function(evt) {
                var mouseEvt = document.createEvent("MouseEvents");
                mouseEvt.initMouseEvent("mousedown", true, true, this);
                this.dispatchEvent(mouseEvt);
            });
        }
        
        /**********************************************
         * DPI
         **********************************************/
        // div
        var dpiDiv = Mapea.Util.createDiv("dpi");
        // label
        var dpiLabel = Mapea.Util.createLabel(this._dpiSelectId, "DPI ");
        dpiDiv.appendChild(dpiLabel);
        // select
        var dpiSelect = Mapea.Util.createSelect(this._dpiSelectId);
        dpiDiv.appendChild(dpiSelect);

        printForm.appendChild(dpiDiv);
        
        /*
         * emulates click events for mobile devices
         * because they do not registers touch events when
         * the control is include map div
         */
        if (Mapea.Util.isMobile) {
            OpenLayers.Event.observe(dpiSelect, "touchend", function(evt) {
                var mouseEvt = document.createEvent("MouseEvents");
                mouseEvt.initMouseEvent("mousedown", true, true, this);
                this.dispatchEvent(mouseEvt);
            });
        }

        /**********************************************
         * FORMAT
         **********************************************/
        // div
        var formatDiv = Mapea.Util.createDiv("format");
        // label
        var formatLabel = Mapea.Util.createLabel(this._formatSelectId, "Formato ");
        formatDiv.appendChild(formatLabel);
        // select
        var formatSelect = Mapea.Util.createSelect(this._formatSelectId);
        formatDiv.appendChild(formatSelect);

        printForm.appendChild(formatDiv);

        /*
         * emulates click events for mobile devices
         * because they do not registers touch events when
         * the control is include map div
         */
        if (Mapea.Util.isMobile) {
            OpenLayers.Event.observe(formatSelect, "touchend", function(evt) {
                var mouseEvt = document.createEvent("MouseEvents");
                mouseEvt.initMouseEvent("mousedown", true, true, this);
                this.dispatchEvent(mouseEvt);
            });
        }
        
        /**********************************************
         * FORCE SCALE
         **********************************************/
        // div
        var forceScaleDiv = Mapea.Util.createDiv("forcescale");
        // label
        var forceScaleLabel = Mapea.Util.createLabel(this._forceScaleCheckboxId, "Forzar escala ");
        forceScaleDiv.appendChild(forceScaleLabel);
        // checkbox
        var forceScaleCheckbox = Mapea.Util.createInput("checkbox", this._forceScaleCheckboxId);
        forceScaleDiv.appendChild(forceScaleCheckbox);

        printForm.appendChild(forceScaleDiv);
        
        /*
         * emulates click events for mobile devices
         * because they do not registers touch events when
         * the control is include map div
         */
        if (Mapea.Util.isMobile) {
            OpenLayers.Event.observe(forceScaleCheckbox, "touchend", function(evt) {
                forceScaleCheckbox.checked = !forceScaleCheckbox.checked;
            });
        }

        div.appendChild(printForm);
        
        /**********************************************
         * BUTTON
         **********************************************/
        var printBtnDiv = Mapea.Util.createDiv("button");
        // print
        var printBtn = document.createElement("button");
        OpenLayers.Element.addClass(printBtn, "print");
        printBtnDiv.appendChild(printBtn);
        // remove
        var cleanBtn = document.createElement("button");
        OpenLayers.Element.addClass(cleanBtn, "remove");
        printBtnDiv.appendChild(cleanBtn);
        div.appendChild(printBtnDiv);

        /**********************************************
         * WORKS QUEUE
         **********************************************/
        // queue div
        var completedQueueDiv = Mapea.Util.createDiv("queue");
        div.appendChild(completedQueueDiv);
        
        // download title
        var downloadTitle = Mapea.Util.createDiv("title");
        downloadTitle.setAttribute("id", this._queueTitleId);
        downloadTitle.innerHTML = "Descargar";
        downloadTitle.style.display = "none";
        completedQueueDiv.appendChild(downloadTitle);
        
        // queue wrapper
        var queueWrapperDiv = Mapea.Util.createDiv("queue-wrapper");
        completedQueueDiv.appendChild(queueWrapperDiv);
        
        // queue list
        this._completedQueue = document.createElement("ul");
        this._completedQueue.setAttribute("id", this._queueULId);
        OpenLayers.Element.addClass(this._completedQueue, "queue");
        queueWrapperDiv.appendChild(this._completedQueue);
        
        if (Mapea.Util.isMobile) {
            this.events = new OpenLayers.Events(this, completedQueueDiv, null, true);
            
            var ignoreEvent = function (evt) {
                OpenLayers.Event.stop(evt, true);
            };
            this.events.on({
                "touchstart": ignoreEvent,
                "touchmove": ignoreEvent,
                scope: this
            });
        }
        
        /**********************************************
         * MINIMIZE BUTTON
         **********************************************/
        var minimizeDiv = Mapea.Util.createDiv("minimize");
        minimizeDiv.setAttribute("title", "Minimizar el control de impresión");
        div.appendChild(minimizeDiv);
        
        /**********************************************
         * EVENTS
         **********************************************/
        if (Mapea.Util.isMobile) {
            // print button
            OpenLayers.Event.observe(printBtn, "touchend",
                OpenLayers.Function.bind(function(evt) {
                    if (this._showControl === false) {
                        this.showControl(evt);
                    }
                    else {
                        this.print(evt);
                        OpenLayers.Event.stop(evt, true);
                    }
                }, this));
            // clear button
            OpenLayers.Event.observe(cleanBtn, "touchend", 
                    OpenLayers.Function.bind(this.cleanForm, this));
            
            // hides control
            OpenLayers.Event.observe(minimizeDiv, "touchend",
                    OpenLayers.Function.bind(this.hideControl, this));
        }
        else {
            // print button
            OpenLayers.Event.observe(printBtn, "click", 
                OpenLayers.Function.bind(function(evt) {
                    if (this._showControl === false) {
                        this.showControl(evt);
                    }
                    else {
                        this.print(evt);
                        OpenLayers.Event.stop(evt, true);
                    }
                }, this));
            // clean button
            OpenLayers.Event.observe(cleanBtn, "click", 
                    OpenLayers.Function.bind(this.cleanForm, this));
            
            // hides control
            OpenLayers.Event.observe(minimizeDiv, "click",
                    OpenLayers.Function.bind(this.hideControl, this));

            // prevents map events
            OpenLayers.Event.observe(div, "mousedown", function(evt) {
                OpenLayers.Event.stop(evt, true);
            });
            OpenLayers.Event.observe(div, "dblclick", function(evt) {
                OpenLayers.Event.stop(evt, true);
            });
        }

        /**********************************************
         * PROVIDER
         **********************************************/
        this._provider = new Mapea.Util.PrintProvider({
            url: this.printURL,
            events : this.printEvents
        });
        this._provider.setMap(this.map);

        return div;
    },

    /**
     * Method: deactivate
     * Deactivates the control.
     *
     * Returns:
     * {Boolean} The control was effectively deactivated.
     */
    deactivate : function() {
        // TODO
        return OpenLayers.Control.prototype.deactivate.apply(this, arguments);
    },
    
    /**
     * Method: activate
     * Activates the control.
     *
     * Returns:
     * {Boolean} The control was effectively activated.
     */
    activate : function() {
        // TODO
        return OpenLayers.Control.prototype.activate.apply(this, arguments);
    },
    
    /**
     * Method: destroy
     * This method destroies this
     * object and all its attributes
     *
     */
    destroy: function() {
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },

    capabilitiesCallback : function(capabilities) {
        if (capabilities) {
            // layouts
            if (capabilities.layouts) {
                var layoutSelect = document.getElementById(this._layoutSelectId);
                for (var i = 0, ilen = capabilities.layouts.length; i < ilen; i++) {
                    var layout = capabilities.layouts[i];
                    var opt = document.createElement("option");
                    opt.setAttribute("value", layout.name);
                    opt.innerHTML = layout.name;
                    layoutSelect.appendChild(opt);
                }
            }

            // dpis
            if (capabilities.dpis) {
                var dpiSelect = document.getElementById(this._dpiSelectId);
                for (var i = 0, ilen = capabilities.dpis.length; i < ilen; i++) {
                    var dpi = capabilities.dpis[i];
                    var opt = document.createElement("option");
                    opt.setAttribute("value", dpi.value);
                    opt.innerHTML = dpi.name;
                    dpiSelect.appendChild(opt);
                }
            }

            // formats
            if (capabilities.outputFormats) {
                var formatSelect = document.getElementById(this._formatSelectId);
                for (var i = 0, ilen = capabilities.outputFormats.length; i < ilen; i++) {
                    var format = capabilities.outputFormats[i];
                    var opt = document.createElement("option");
                    opt.setAttribute("value", format.name);
                    opt.innerHTML = format.name;
                    formatSelect.appendChild(opt);
                }
            }
        }
    },

    print : function(evt) {
        // params selected
        var title = document.getElementById(this._titleInputId).value;
        var description = document.getElementById(this._descriptionAreaId).value;
        var layoutSelect = document.getElementById(this._layoutSelectId);
        var layout = {
            value : layoutSelect.value,
            name : layoutSelect.options[layoutSelect.selectedIndex].text
        };
        var dpiSelect = document.getElementById(this._dpiSelectId);
        var dpi = {
            value : dpiSelect.value,
            name : dpiSelect.options[dpiSelect.selectedIndex].text
        };
        var format = document.getElementById(this._formatSelectId).value;
        
        // GENERAL PARAMS
        var providerParams = OpenLayers.Util.applyDefaults({
            outputFormat : format
        }, this.layoutParams);
        this._provider.setCustomParams(providerParams);
        this._provider.setLayout(layout);
        this._provider.setDpi(dpi);

        // PAGES
        var forceScaleCheckbox = document.getElementById(this._forceScaleCheckboxId);
        var pages = [];
        var mapBBOX, mapCenter, mapScale;
        if (forceScaleCheckbox.checked === false) {
            mapBBOX = [
               this.map.getExtent().left, // xMin
               this.map.getExtent().bottom, // yMin
               this.map.getExtent().right, // xMax
               this.map.getExtent().top // yMax
            ];
        }
        else if (forceScaleCheckbox.checked === true) {
            mapCenter = this.map.getCenter();
            mapScale = {
                    "value" : this.map.getScale()
            };
        }
        for (var i = 0, ilen = this.pagesParams.length; i < ilen; i++) {
            // parameters
            var pageParams =  OpenLayers.Util.applyDefaults({
                title : title,
                printTitle : title,
                printDescription : description
            }, this.pagesParams[i]);
            
            // options
            var pageOptions = {
                printProvider: this._provider,
                customParams: pageParams
            };
            if (forceScaleCheckbox.checked === false) {
                pageOptions.bbox = mapBBOX;
            }
            else if (forceScaleCheckbox.checked === true) {
                pageOptions.center = mapCenter;
                pageOptions.scale = mapScale;
            }
            var page = new Mapea.Util.PrintPage(pageOptions);
//            var fitOptions = {
//                    "mode" : this.options.fitMode
//            };
//            page.fit(this.map, fitOptions);
            pages.push(page);
        }
        
        var downloadId = this._generateDownloadId(title);
        this.options.downloadId = downloadId;
        this._provider.print(this.map, pages, this.options);
        
        // shows download title
        document.getElementById(this._queueTitleId).style.display = "";

        this.addLoadingState(title, downloadId);
    },
    
    cleanForm : function(evt) {
        // title
        document.getElementById(this._titleInputId).value = "";
        // description
        document.getElementById(this._descriptionAreaId).value = "";
        // layouts
        document.getElementById(this._layoutSelectId).selectedIndex = 0;
        // dpis
        document.getElementById(this._dpiSelectId).selectedIndex = 0;
        // formats
        document.getElementById(this._formatSelectId).selectedIndex = 0;
        // foce scale
        document.getElementById(this._forceScaleCheckboxId).checked = false;
        // queue
        this._completedQueue.innerHTML = "";
        // hides the download title
        document.getElementById(this._queueTitleId).style.display = "none";
    },
    
    download : function(response, downloadId) {
        // gets a loading li and removes its class
        var li = document.getElementById(downloadId);
        if (li != null) {
            this._hideLoadingState(li);
        
            if (response && response.getURL) {
                this.appendCompletedPrint(li, response.getURL);
            }
            else {
                Mapea.Util.showErrorMessage("Error al obtener la descarga del documento de impresión");
                OpenLayers.Element.addClass(li, Mapea.Control.Printer.ERROR_CLASS);
            }
        }
    },
    
    appendCompletedPrint : function(li, url) {
        var iframeId = this._downloadIframeId;
        jQuery(li).attr("url", url).click(function(evt) {
            evt.preventDefault();
            var thisURL = jQuery(this).attr("url");
            
            // removes previous iframes
            jQuery("#" + iframeId).remove();
            
            // adds a new one
            jQuery('<iframe>').attr("id", iframeId)
                .attr("src", thisURL).appendTo(jQuery("body"));
        });
    },
    
    addLoadingState : function(title, id) {
        if (!title || (OpenLayers.String.trim(title).length == 0)) {
            title = "(Sin título)";
        }
        var loadingLI = jQuery("<li>").attr("id", id)
            .html(title).addClass(Mapea.Control.Printer.LOADING_CLASS).get(0);
        this._completedQueue.appendChild(loadingLI);
    },
    
    _hideLoadingState: function(li) {
        OpenLayers.Element.removeClass(li, Mapea.Control.Printer.LOADING_CLASS);
    },
    
    capabilitiesError : function(err) {
        Mapea.Util.showErrorMessage("Error al obtener el capabilities del servicio de impresión: " + err);
    },
    
    printError: function(err, downloadId) {
        // gets a loading li and add the error class
        var li = document.getElementById(downloadId);
        if (li != null) {
            this._hideLoadingState(li);
            OpenLayers.Element.addClass(li, Mapea.Control.Printer.ERROR_CLASS);
            Mapea.Util.showErrorMessage("Error al obtener la descarga del documento de impresión");
        }
    },
    
    _generateDownloadId : function(title) {
        return OpenLayers.Util.createUniqueID(title);
    },
    
    showControl : function(evt) {
        if (this._showControl === false) {
            // saves the minimized control height
            if (!Mapea.Util.printerMinHeight) {
                Mapea.Util.printerMinHeight = jQuery(this.div).outerHeight(true);
            }
            
            OpenLayers.Element.addClass(this.div, "hover");
            
            // disables map events for mobile
            if (Mapea.Util.isMobile) {
//                Mapea.Util.disableNavControls(this.map);
            }
            
            this._showControl = true;
            OpenLayers.Event.stop(evt, true);
        }
    },
    
    hideControl : function(evt) {
        if (this._showControl === true) {
            OpenLayers.Element.removeClass(this.div, "hover");
                
            // loses focus for mobile devices
            if (Mapea.Util.isMobile) {
                jQuery(this.div).find("button.print").focus();
            }
            
            this._showControl = false;
        }
        
        // resize zoom controls and searches
        Mapea.Util.adjustZoomControls(this.map);
        Mapea.Util.centerSearchDialog();
    },
    
    CLASS_NAME: "Mapea.Control.Printer"
});

Mapea.Control.Printer.LOADING_CLASS = "printing";
Mapea.Control.Printer.ERROR_CLASS = "error";