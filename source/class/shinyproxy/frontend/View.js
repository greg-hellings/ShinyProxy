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
	this.__service.bind("proxies", this, "proxies");
		
	// Create the UI for the user
	this.__createUIElements(this.__behavior);
	
	this.addListener("changeProxies", this.__changeProxies, this);
	
	// Now, call the backend
	this.__service.list();
	
	this.addListener('changeSelection', function() {this.__service.list();}, this);
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
	,__name : null
	,__type : null
	,__singleProxy : null
	,__multiProxy  : {http : null, https : null, ftp : null, catchall : null}
	,__multiProxyTabs : null
	,__save : null
	,__exceptions : null
	,__createForm : null
	,__singleMode : null
	,__defaultExceptions : ["localhost", "127.0.0.0/8", "*.local"]
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
		// First tab - the list of saved proxies
		this.__listPage = new qx.ui.tabview.Page("List", null);
		this.__listPage.setLayout(new qx.ui.layout.VBox());
		this.__listPage.getLayout().setSpacing(5);
		// The add/edit page
		this.__createPage = new qx.ui.tabview.Page("Add/Edit", null);
		this.__createPage.setLayout(new qx.ui.layout.Canvas());
		var scroller = new qx.ui.container.Scroll();
		this.__form  = new qx.ui.container.Composite();
		this.__createForm(this.__form);
		scroller.add(this.__form);
		this.__createPage.add(scroller, {top : 2, left : 2, bottom : 2, right : 2});
		// The display of current settings
		this.__currentPage = new qx.ui.tabview.Page("Current settings", null);
		
		this.add(this.__listPage);
		this.add(this.__createPage);
		this.add(this.__currentPage);
	}
	
	/**
	 * Reworks the list of available proxies.
	 * 
	 * @param e {Event} The change event.
	 */
	,__changeProxies : function(e) {
		var list = qx.lang.Array.toArray(this.getProxies());
		
		// First, remove the existing proxies from the list
		this.__listPage.removeAll();
		
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
	
	/**
	 * Creates the basic form that will be used to add new/edit old
	 * proxies to the list.
	 */
	,__createForm : function(dest) {
		dest.setLayout(new qx.ui.layout.Grid());
		dest.getLayout().setColumnFlex(1, 1);
		
		// Name line
		this.__name = new qx.ui.form.TextField();
		dest.add(new qx.ui.basic.Label("Name"), {row : 0, column : 0});
		dest.add(this.__name, {row : 0, column : 1});
		
		// Buttons?
		this.__single = new qx.ui.form.RadioButton("Single");
		this.__multi  = new qx.ui.form.RadioButton("Multiple");
		this.__type= new qx.ui.form.RadioGroup(this.__single, this.__multi);
		//~ dest.add(this.__single, {row : 1, column : 0});
		//~ dest.add(this.__multi,  {row : 1, column : 1});
		
		// Proxy forms
		this.__singleProxy = new shinyproxy.frontend.ProxyForm();
		this.__multiProxy  = {
			https : new shinyproxy.frontend.ProxyForm()
			,ftp  : new shinyproxy.frontend.ProxyForm()
			,http : new shinyproxy.frontend.ProxyForm()
			,catchall : new shinyproxy.frontend.ProxyForm()
		};
		this.__multiProxyTabs = new qx.ui.tabview.TabView();
		this.__multiProxyTabs.add(this.__createProxyTab('HTTP', this.__multiProxy.http));
		this.__multiProxyTabs.add(this.__createProxyTab('HTTPS', this.__multiProxy.https));
		this.__multiProxyTabs.add(this.__createProxyTab('FTP', this.__multiProxy.ftp));
		this.__multiProxyTabs.add(this.__createProxyTab('Catchall', this.__multiProxy.catchall));
		
		// There are two possibilities here, only one of them will be
		// displayed at a time
		this.__activateMultiMode(false);
		
		// The exceptions list
		this.__exceptions = new mutablelist.MutableList("Exceptions", "Host");
		this.__exceptions.setData(this.__defaultExceptions);
		dest.add(this.__exceptions, {row : 3, column : 0, colSpan : 2});
		
		// The bottom button to save the config
		this.__saveButton = new qx.ui.form.Button("Save");
		this.__saveButton.addListener("click", this.__save, this);
		dest.add(this.__saveButton, {row : 4, column : 0});
	}
	
	/**
	 * Clears all the values in the create form
	 */
	,__clearForm : function() {
		this.__name.setValue('');
		this.__type.setSelection([this.__single]);
		this.__exceptions.setData(this.__defaultExceptions);
		
		this.__activateMultiMode(false);
		
		this.__singleProxy.clear();
		this.__multiProxy.https.clear();
		this.__multiProxy.http.clear();
		this.__multiProxy.ftp.clear();
		this.__multiProxy.catchall.clear();
	}
	
	/**
	 * Turns the form into a multi-proxy mode or single proxy mode.
	 * 
	 * @param yes {Boolean} True if you want multi proxy, false if you
	 * want single proxy.
	 */
	,__activateMultiMode : function(yes) {
		// Put us into multi proxy mode
		if(yes) {
			if(this.__singleMode === true) this.__form.remove(this.__singleProxy);
			this.__form.add(this.__multiProxyTabs, {row : 2, column : 0, colSpan : 2});
			this.__singleMode = false;
		} else {
			if(this.__singleMode === false) this.__form.remove(this.__multiProxyTabs);
			this.__form.add(this.__singleProxy, {row : 2, column : 0, colSpan : 2});
			this.__singleMode = true;
		}
	}
	
	/**
	 * Straightforward little helper that generates one of the tabs for
	 * the layout of a ProxyForm widget.
	 * 
	 * @param title {String} The title for this tab page
	 * @param widget {shinyproxy.frontend.ProxyForm} The widget to add to
	 * the tab page
	 * @return {qx.ui.tabview.Page} The page to add to the tabs widget
	 */
	,__createProxyTab : function(title, widget) {
		var page = new qx.ui.tabview.Page(title);
		page.setLayout(new qx.ui.layout.Basic());
		page.add(widget, {top : 2, left : 2});
		
		return page;
	}
	
	/**
	 * Construct the object that represents this configuration and save
	 * it back to the backend.
	 * 
	 * @param event {Event} The click event - ignored.
	 */
	,__save : function(event) {
		// Create the empty config object
		var cfg = {};
		
		// Now populate it - name first
		cfg.key = qx.lang.String.trim(this.__name.getValue());
		// Mode is pretty well set in stone
		cfg.mode = "fixed_servers";
		
		// If we only have one, set it this way
		if(this.__singleMode) {
			cfg.rules = {
				singleProxy : this.__singleProxy.getConfig()
			}
			
			if(cfg.rules.singleProxy === false) {
				return;
			}
		}
		
		// Bypass list
		cfg.rules.bypassList = this.__exceptions.getData().toArray();
		
		this.__service.save(cfg.key, cfg);
		
		console.log(cfg);
		
		this.__clearForm();
		this.setSelection([this.__listPage]);
	}
	
	/**
	 * Populates the form with the values taken from this config object
	 * 
	 * @param config {Object} The configuration object which will be
	 * pre-populated into this form.
	 */
	,__populateForm : function(config) {
		this.__clearForm();
		// Set the name
		if(config.key) this.__name.setValue(config.key);
		// Set the proxy configuration
		if(config.rules.singleProxy) {
			this.__activateMultiMode(false);
			this.__singleProxy.setConfig(config.rules.singleProxy);
		}
		// Set the exceptions
		if(config.rules.bypassList) {
			this.__exceptions.setData(config.rules.bypassList);
		}
	}
	
	/* ***************************************************************
	 * 
	 * Public Members
	 * 
	 * ************************************************************** */
	,editProxy : function(event) {
		var proxy = event.getTarget().getLayoutParent().getProxy();
		
		// Setup the edit box
		this.__populateForm(proxy);
		this.setSelection([this.__createPage]);
		console.log("Changing pages");
	}
	
	,setProxy : function(event) {
		var proxy = event.getTarget().getLayoutParent().getProxy();
		
		console.log("Setting");
		
		this.__service.set(proxy);
	}
	
	,deleteProxy : function(event) {
		var proxy = event.getTarget().getLayoutParent().getProxy();
		
		this.__service.del(proxy);
	}
}
});
