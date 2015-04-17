/* Copyright (c) 2006-2008 MetaCarta, Inc., published under the Clear BSD
 * license.  See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */


/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Feature/Vector.js
 */

/**
 * Class: OpenLayers.Control.DrawFeature
 * The DrawFeature control draws point, line or polygon features on a vector
 * layer when active.
 * CHANGE 2009/10/28
 * By default, attributes are associated to the feature with the value " "
 *
 * Inherits from:
 *  - <OpenLayers.Control.DrawFeature>
 */
Mapea.Control.DrawFeature = OpenLayers.Class(OpenLayers.Control.DrawFeature, {

    /**
     * Method: drawFeature
     */
    drawFeature: function(geometry) {
        var feature = new OpenLayers.Feature.Vector(geometry);
        var proceed = this.layer.events.triggerEvent(
            "sketchcomplete", {feature: feature});

        if (proceed !== false) {
            /*
             * All features draw has attributes defined to ""
             * if the type of this attribute is "String", else
             * the attribute is defined to 0
             */
            feature.layer = this.layer;
            this.layer.addAttributes(feature);
            this.layer.writer.fillDefaultValues(feature);
            feature.state = OpenLayers.State.INSERT;
            this.layer.addFeatures([feature]);
            this.featureAdded(feature);
            this.events.triggerEvent("featureadded",{feature : feature});
        }
    },

    /**
     * APIMethod: activate
     * Explicitly activates a control and it's associated
     * handler if one has been set.  Controls can be
     * deactivated by calling the deactivate() method.
     * 
     * Returns:
     * {Boolean}  True if the control was successfully activated or
     *            false if the control was already active.
     */
    activate: function() {
        this.map.uniqueSelectFeatureCtrl.deactivate();
        
        // puts the WFST layer to top
        this.moveLayerToTop();
        this.map.events.on({
            "removelayer": this.handleMapEvents,
            "changelayer": this.handleMapEvents,
            scope: this
        });
        
        return OpenLayers.Control.prototype.activate.apply(this, arguments);
    },
    
    /**
     * Method: handleMapEvents
     * 
     * Parameters:
     * evt - {Object}
     */
    handleMapEvents: function(evt) {
        if (evt.type == "removelayer" || evt.property == "order") {
            this.moveLayerToTop();
        }
    },
    
    /**
     * Method: moveLayerToTop
     * Moves the layer for this handler to the top, so mouse events can reach
     * it.
     */
    moveLayerToTop: function() {
        var index = Math.max(this.map.Z_INDEX_BASE['Feature'] - 1,
            this.layer.getZIndex()) + 1;
        this.layer.setZIndex(index);
        
    },
    
    /**
     * Method: moveLayerBack
     * Moves the layer back to the position determined by the map's layers
     * array.
     */
    moveLayerBack: function() {
        var index = this.layer.getZIndex() - 1;
        if (index >= this.map.Z_INDEX_BASE['Feature']) {
            this.layer.setZIndex(index);
        } else {
            this.map.setLayerZIndex(this.layer,
                this.map.getLayerIndex(this.layer));
        }
    },

    /**
     * APIMethod: deactivate
     * Deactivates a control and it's associated handler if any.  The exact
     * effect of this depends on the control itself.
     * 
     * Returns:
     * {Boolean} True if the control was effectively deactivated or false
     *           if the control was already inactive.
     */
    deactivate: function () {
        this.map.uniqueSelectFeatureCtrl.activate();
        
        // backs the WFST layer to initial state
        this.moveLayerBack();
        this.map.events.un({
            "removelayer": this.handleMapEvents,
            "changelayer": this.handleMapEvents,
            scope: this
        });
        
        return OpenLayers.Control.prototype.deactivate.apply(this, arguments);
    },

    CLASS_NAME: "Mapea.Control.DrawFeature"
});
