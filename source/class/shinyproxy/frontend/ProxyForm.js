qx.Class.define("shinyproxy.frontend.ProxyForm", {
extend : qx.ui.container.Composite

,construct : function() {
	this.base(arguments);
	var l = new qx.ui.layout.Grid();
	l.setColumnFlex(1, 1);	// Flex the right column
	//~ l.setRowFlex(3, 1);		// Flex the bottom row
	l.setSpacing(6);
	this.setLayout(l);
	
	this.setDecorator(new qx.ui.decoration.Single(1, 'solid', 'gray'));
	
	// Type
	this.__protocol = new qx.ui.form.RadioButtonGroup(new qx.ui.layout.VBox());
	var schemes = new qx.type.Array("Socks5", "Socks4", "HTTP", "HTTPS");
	schemes.forEach(function(val) {
		// Setup the button
		var s = new qx.type.BaseString(val);
		var disp = new qx.ui.form.RadioButton(s);
		disp.setModel(s.toLowerCase());
		// Add it to the dialog
		this.__protocol.add(disp);
	}, this);
	this._add(this.__protocol, {row : 0, column : 0, colSpan : 1});
	
	// Prompt for the proxy's host information
	this.__name = new qx.ui.form.TextField();
	this._add(new qx.ui.basic.Label("Host"), {row : 1, column : 0});
	this._add(this.__name, {row : 1, column : 1});
	
	// The port number
	this.__port = new qx.ui.form.TextField();
	this._add(new qx.ui.basic.Label("Port"), {row : 2, column : 0});
	this._add(this.__port, {row : 2, column : 1});
}

,members : {
	 __protocol   : null
	,__name       : null
	,__port       : null
	,__exceptions : null
	
	/**
	 * Clears the values in the form
	 */
	,clear : function() {
		this.__name.setValue('');
		this.__port.setValue('');
	}
	
	/**
	 * Populates this form with the values in the passed config parameter.
	 * 
	 * @param config {Object} The same format as retrieved from getConfig,
	 * but this will populate the fields
	 */
	,setConfig : function(config) {
		this.clear();
		if(config.host) this.__name.setValue(config.host);
		if(config.port) this.__port.setValue(config.port+'');
	}
	
	/**
	 * Fetches the values of a proxy into a config object which can be
	 * passed around to the interested parties.
	 *
	 * @return {Object} An object ready to be passed to Chrome's proxy
	 * config methods, plus an extra key to indicate the name of this
	 * proxy.  False if there is an error.
	 */
	,getConfig : function() {
		var config = {
			scheme : this.__protocol.getSelection()[0].getModel()
			,host  : this.__name.getValue()
		};
		// Sanity check the values
		if(!config.scheme || config.scheme == '') {
			dialog.Dialog.error("You must select a scheme");
			return false;
		}
		if(!config.host || config.host == '') {
			dialog.Dialog.error("You must specify a host");
			return false;
		}
		// Port is optional, but we will check it is a valid number
		var port = this.__port.getValue();
		port = Number(port);
		try {
			qx.core.Assert.assertInteger(port);
		} catch(e) {
			// This will be caught and an error thrown further on down the line
			port = -1;
		}
		if(port) {
			// TCP limits a machine to 65536 ports, this is not our
			// limit, nor is it Chrome's limit. It's a limit of the very
			// protocols HTTP runs on.
			if(port != NaN && port > 0 && port < 65535) {
				config.port = port;
				return config;
			} else {
				dialog.Dialog.warning("Port value must be between 1 and 65535, ignoring custom port.");
				return config;
			}
		} else {
			return config;
		}
		// There should be no way for us to reach this line of code, but we'll
		// go ahead and put it in here anyway, just for safe keeping.
		return false;
	}
}
});
