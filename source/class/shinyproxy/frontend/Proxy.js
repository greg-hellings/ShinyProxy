qx.Class.define("shinyproxy.frontend.Proxy", {
extend : qx.ui.container.Composite

/**
 * Create a small entry that displays the list of proxies to the user.
 * 
 * @param proxy {Object} The proxy's config.
 * @param view {shinyproxy.frontend.View} The view displaying this object
 * @param def {Boolean} True if this is the default setting, false otherwise
 */
,construct : function(proxy, view, def) {
	// Grid layout - boxes
	this.base(arguments, new qx.ui.layout.Grid());
	// 10 px between cells
	this.getLayout().setSpacing(3);
	// Minimum width
	this.getLayout().setColumnMinWidth(2, 85);
	this.getLayout().setColumnMinWidth(1, 85);
	this.getLayout().setColumnMinWidth(0, 100);
	// Decorators
	//~ this.setDecorator(new qx.ui.decoration.Single(1, 'solid', 'gray'));
	
	this.__view = view;
	this.setProxy(proxy);
	
	// Create the sub-widgets
	this.__setB = new qx.ui.form.Button("Activate");
	this.__editB = new qx.ui.form.Button("Edit");
	this.__editB.setEnabled(!def);	// Disable the default/no proxy edit screen
	
	
	this._add(new qx.ui.basic.Label(proxy.key), { column : 0, row : 1/*, colSpan : 2 */});
	this._add(this.__setB, { column : 1, row : 1 });
	this._add(this.__editB, { column : 2, row : 1 });
	
	// Add listeners - the View can handle it
	this.__setB.addListener("click", this.__view.setProxy, this.__view);
	this.__editB.addListener("click", this.__view.editProxy, this.__view);
	
	this.show();
}

,properties : {
	proxy : {
		event : "proxyChanged"
	}
}

,members : {
	__view : null
	,__setB : null
	,__editB : null
}
});
