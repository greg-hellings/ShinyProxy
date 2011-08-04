/*

#ignore(chrome.proxy.settings)

*/

/**
 * The specific logic and endpoints for the supplier logic which I need
 * to implement.
 */
qx.Class.define("shinyproxy.backend.ProxyServiceImpl",
{
extend : chromeplugin.backend.ServiceImpl

/**
 * function construct()
 * 
 * We override the base constructor so we can invoke our own choice of
 * name and register our endpoints.
 */
,construct : function() {
	this.base(arguments, "proxies");
	
	this.register("list", this.list);
	this.register("set", this.set);
	this.register("get", this.get);
	this.register("add", this.add);
	this.register("update", this.update);
	this.register("clear", this.clear);
	
	// Retrieve the list of proxies
	var proxies = null;
	try {
		proxies = qx.lang.Json.parse(localStorage['proxies']);
	} catch(error) {
		// Bad parsing, etc
	}

	// If we ever need to update the format, we will do that here
	if(!proxies) {
		this.__save();
	} else {
		if(proxies.version != this.__version) {
			proxies = this.__update(proxies); 
		}
		this.__proxies = new qx.type.Array();
		this.__proxies.append(proxies.entries);
	}
}

/*
 * Member methods
 */
,members : {
	__proxies : null
	,__version : 1
	/**
	 * Returns a list of proxies that have been saved.
	 * 
	 * @return {Array} An array of pre-configured proxies.
	 */
	,list : function() {
		return this.__proxies;
	}
	
	/**
	 * Sets the given proxy settings.  Documentation recorded here:
	 * http://code.google.com/chrome/extensions/proxy.html
	 * 
	 * @param settings {Object} A config object that specifies the user
	 * defined settings.  If this value is null, then the proxy settings
	 * will be returned to their default values.
	 * @return {Boolean} True on success, false on failure.
	 */
	,set : function(settings) {
		var val = false;
		if(settings == null) {
			chrome.proxy.settings.clear({scope: 'regular'}, function() {
				val = true;
			});
		} else {
			// Now, set the values as the user has requested we do
			chrome.proxy.settings.set(settings, function() {
				val = true;
			});
		}
		return val;
	}
	
	/**
	 * Returns only information on a single proxy.
	 * 
	 * @param idx {String} The key name of the setting to be returned.
	 * @return The proxy config setting, or false on failure
	 */
	,get : function(idx) {
		if(idx < this.__proxies.length) return this.__proxies[idx];
		else return null;
	}
	
	/**
	 * Adds a new entry to the proxy config list.
	 * 
	 * @param key {String} The name of this one
	 * @param config {Object} The item to add to the list.
	 * @return Null
	 */
	,add : function(key, config) {
		this.key = key;
		this.__proxies.push(config);
		
		this.__save();
	}
	
	/**
	 * Updates the config in a particular element to be the new value.
	 * 
	 * @param key {String} The element in the proxies array to modify
	 * @param config {Object} The new value for this parameter.
	 * @return Null
	 */
	,update : function(key, config) {
		config.key = key;
		var found = false;
		// Iterate until we find the desired one
		this.__proxies.forEach(function(val, idx) {
			if(val.key == key) {
				this.__proxies[idx] = config;
				found = true;
			}
		}, this);
		
		// If it wasn't found, we'll add it
		this.__proxies.push(config);
		
		this.__save();
	}
	
	/**
	 * Deletes all entries in the proxy config.
	 * 
	 * @return Null
	 */
	,clear : function() {
		this.__proxies = new qx.type.Array();
		
		this.__save();
	}
	
	/**
	 * Saves the current set of proxies back to the localStorave variable.
	 * 
	 * @param x {Object} Optional argument. If this value is set, then that
	 * value will be written to the localStorage, otherwise a new save value
	 * will be written. Use this with caution, as you can break everything
	 * if you are not careful
	 * @return Null
	 */
	,__save : function(x) {
		var proxies;
		if(!x)
			proxies = {version : this.__version, entries : this.__proxies};
		else
			proxies = x;
		localStorage.setItem('proxies', qx.lang.Json.stringify(proxies));
	}
	
	/**
	 * Updates the style of proxy listing.
	 * 
	 * @return {Object} The updated object.
	 */
	,__update : function(proxies) {
		proxies = {version : this.__version, entries : []};
		this.__save(proxies);
		
		return proxies;
	}

} // End of members
});
