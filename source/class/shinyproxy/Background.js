/* ************************************************************************

#asset(shinyproxy/*)
#ignore(chrome.proxy.settings)
#ignore(chrome.proxy.settings.onChange)
#ignore(chrome.browserAction)

************************************************************************ */

/**
 * This is the main application class of your custom application "ChromeBibles"
 */
qx.Class.define("shinyproxy.Background",
{
  extend : qx.application.Standalone,



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * This method contains the initial application code and gets called 
     * during startup of the application
     * 
     * @lint ignoreDeprecated(alert)
     * @lint ignoreUnused(suppliers)
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug") == true)
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;
        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */

      // Create your service endpoints so they will register themselves
      var endpoint = new shinyproxy.backend.ProxyServiceImpl();
      
      // The place we will pull our IP address from
      this.__request = new qx.io.request.Xhr('http://dumpr.info/api/1.0/remote-addr', 'GET');
      this.__request.set({cache : false});
      this.__request.addListener("success", this.__modifyBrowserAction, this);
      
      // Set it to go off every 5 minutes
      qx.lang.Function.periodical(this.__checkIP, 300000, this);
      // And whenever the settings change
      chrome.proxy.settings.onChange.addListener(qx.lang.Function.listener(this.__checkIP, this));
      // And fire it now
      this.__checkIP();
    }

    /**
     * A method which regularly checks what our remote IP address is.
     */
    ,__checkIP : function() {
        this.__request.send();
    }

    /**
     * A method which sets the hover text for the browser action.
     */
    ,__modifyBrowserAction : function(e) {
        if(e.getTarget) {
            try {
                var req = qx.lang.Json.parse(e.getTarget().getResponse());
                chrome.browserAction.setTitle({
                    title : "External IP: " + req.ip
                });
                console.log("Set");
            } catch(e) {
                // Nothing to do
            }
            
        }
    }
  }
});
