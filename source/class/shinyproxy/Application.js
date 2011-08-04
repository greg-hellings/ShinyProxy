/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/* ************************************************************************

#asset(shinyproxy/*)

************************************************************************ */

/**
 * This is the main application class of your custom application "ChromeBibles"
 */
qx.Class.define("shinyproxy.Application",
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

      // Create the base split pane view
      var view = new shinyproxy.frontend.View();
      this.getRoot().add(view, {top: 0, left: 0, right: 0, bottom: 0});
      
      //var behavior = new shinyproxy.frontend.Behavior(view);
    }
  }
});
