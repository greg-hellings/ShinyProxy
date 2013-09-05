/* *********************************************************************

Nothing to see here

***********************************************************************/
/**
 * A specific background service for the ShinyProxy application that handles
 * the setting, unsetting and storage of proxy configurations and settings.
 */
qx.Class.define("shinyproxy.middleware.ProxyService",
{
extend : chromeplugin.middleware.Service

/**
 * A list of the properties for this service.
 */
,properties : {
    /**
     * The list of suppliers and the versions of the scripture
     * which each one supports
     */
    proxies : {
        nullable : true
        ,event : "changeProxies"
    }
}

/**
 * function construct()
 * 
 * Instantiates this particular Supplier Service and sets the
 * supplier's name.
 */
,construct : function() {
    this.base(arguments, "proxies");
}

/*
 * List of member methods
 */
,members : {
    /**
     * Refreshes the list of available proxies.
     */
    list : function() {
        this.invoke("list", null, this.__load, this);
    }
    
    /**
     * Internal helper method for callback puposes.
     * 
     * @param suppliers {Array} List of the suppliers returned from
     * the backend.
     */
    ,__load : function(proxies) {
        this.setProxies(proxies);
    }
    
    /**
     * function set(config)
     * 
     * Instructs the background to set the selected proxy configuration.
     * 
     * @param config {Object} The Chrome config object
     */
    ,set : function(config) {
        this.invoke("set", [config]);
    }
    
    /**
     * Gets the config for a particular item name.
     * 
     * @param key {String} The name of the particular item to fetch
     * @param callback {Function} The callback method to invoke with the
     * resultant config
     * @param bind {Object} The context of the callback method
     */
    ,get : function(key, callback, bind) {
        this.invoke("get", [key], callback, bind);
    }
    
    /**
     * Updates a particular conf entry with the newly specified values.
     * 
     * @param key {String} The name of the entry to updated
     * @param config {Object} The new values to write for this entry.
     */
    ,save : function(key, config) {
        this.invoke("save", [key,config]);
    }
    
    /**
     * Clears/deletes all stored proxy configurations.
     */
    ,clear : function() {
        this.invoke("clear");
    }
} // End of members
});
