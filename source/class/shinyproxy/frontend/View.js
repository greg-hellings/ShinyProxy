/* *********************************************************************

No assets here

***********************************************************************/

/**
 * The main viewport of the frontend of my application.
 */
qx.Class.define("shinyproxy.frontend.View", {
extend : qx.ui.tabview.TabView
/**
 * function construct()
 * 
 * Creates an instance of this class, which sets up the pop-up portion
 * of the Chrome plugin, rendering out our lists of material to the
 * user.
 */
,construct : function() {
	this.base(arguments);
	
	this.__service  = new shinyproxy.middleware.ProxyService();
	this.bind("proxies", this.__service, "proxies");
		
	// Create the UI for the user
	this.__createUIElements(this.__behavior);
	
	this.addListener("changeProxies", this.__changeProxies, this);
	
	// Now, call the backend
	this.__service.list();
}

/*
 * List of properties which can be automatically bound and set.
 */
,properties : {
	proxies : {
		nullable : true
		,event : "changeProxies"
	}
}

/*
 * List of member functions.
 */
,members : {
	/* *************************************************************
	 * 
	 * Private Members
	 * 
	 * ************************************************************/
	__listPane : null
	,__createPane : null
	,__currentPane : null
	/**
	 * Creates and constructs the UI elements which this class will
	 * define, laying them out on the viewport.  There should be a
	 * tabview on the left and either a blank panel on the right or
	 * a tabview there as well. The panel on the left is for viewing
	 * possible sources and installed works while the panel on the
	 * right is for viewing the content of reading the works, viewing
	 * search results and the like.
	 * 
	 * @param behavior {shinyproxy.frontend.Behavior} And instance of the
	 * behavior object associated with this module.
	 */
	,__createUIElements : function(behavior) {
		// Tablist
		this.__listPage = new qx.ui.tabview.Page("List", null);
		this.__listPage.setLayout(new qx.ui.layout.VBox());
		this.__createPage = new qx.ui.tabview.Page("Add/Edit", null);
		this.__currentPage = new qx.ui.tabview.Page("Current settings", null);
		
		this.add(this.__listPage);
		this.add(this.__createPage);
		this.add(this.__currentPage);
		
		//this.__createPage.hide();
	}
	
	/**
	 * Reworks the list of available proxies.
	 * 
	 * @param e {Event} The change event.
	 */
	,__changeProxies : function(e) {
		var list = this.getProxies();
		
		// Add a default "Clear the proxies" button
		var val = {
			mode : "direct",
			key : "No Proxies"
		};
		
		this.__listPage.add(new shinyproxy.frontend.Proxy(val, this, true));
		// forEach is added to the base Array object by qx
		list.forEach(function(val) {
			this.__listPage.add(new shinyproxy.frontend.Proxy(val, this));
		}, this);
	}
	
	
	/* ***************************************************************
	 * 
	 * Public Members
	 * 
	 * ************************************************************** */
	,editProxy : function(event) {
		var proxy = event.getTarget().getLayoutParent().getProxy();
		
		// Setup the edit box
	}
	
	,setProxy : function(event) {
		var proxy = event.getTarget().getLayoutParent().getProxy();
		
		this.__service.set(proxy);
	}
}
});
