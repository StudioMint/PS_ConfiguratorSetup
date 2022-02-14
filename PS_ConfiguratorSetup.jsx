/*
<javascriptresource>
<name>$$$/JavaScripts/ScriptName/Menu=The script...</name>
<about>$$$/JavaScripts/ScriptName/About=About text here.^r^rCopyright 2021 krypto.zoo^r^rMore script information.</about>
<category>krypto.zoo</category>
</javascriptresource>
*/

#target photoshop
var scriptFolder = (new File($.fileName)).parent; // The location of this script

// VARIABLES

var imageName, grp_LocalAdjustments, grp_GlobalAdjustments, grp_Passes;
var layerList = [];
var elementList = [];

var timeStart = null;
var savedText;

try {
    init();
} catch(e) {
    var timeFull = timeSinceStart(timeStart);
    if (timeFull != null) alert("Error code " + e.number + " (line " + e.line + "):\n" + e + "\n\nTime elapsed " + formatSeconds(timeFull));
}

function createDialog() {

    var w = new Window('dialog',"A script window",undefined);
        w.alignChildren = "left";
        w.orientation = "column";

        w.add("statictext",undefined,'This is a script',undefined);
        var edit_Text = w.add ("edittext",[0,0,200,20],"There's text here");
		
        var grp_Btn = w.add("group");
            grp_Btn.orientation = "row";
            grp_Btn.alignment = "right";
            
            var btn_OK = grp_Btn.add ("button",undefined,"OK");
            var btn_Close = grp_Btn.add ("button",undefined,"Cancel");
    
    btn_OK.onClick = function() {

        if (edit_Text.text == "There's text here") return alert("You should write something unique instead.");
        
        if (checkSettings() === true) w.close();

    }

    w.center();
    x = w.show();

    // Global variables
    savedText = edit_Text.text;

    return x;

  function checkSettings(ignoreAlerts) {
      
      // If something has to be checked before closing the window, do it here and return false if faulty
      
      if (!ignoreAlerts) {
          alert("The check is checked!");
      }
  
      return true;
  
  }

}

function init() {

    if (app.documents.length == 0) {
        return alert("Open a document!");
    }

    // Get name
    imageName = activeDocument.name.substring(0, activeDocument.name.indexOf("Crypto") - 1);

    // Add current document layers
    for (i = 0; i < activeDocument.layers.length; i++) {
        layerList.push({
            "layer": activeDocument.layers[i],
            "name": activeDocument.layers[i].name,
            "type": "Cryptomatte",
            "category": ""
        });
    }

    // Get elements    
    var elementFolders = getOnlyFolders(activeDocument.path.parent);
    for (i = 0; i < elementFolders.length; i++) {
        var exrFileList = elementFolders[i].getFiles("*.exr");
        for (j = 0; j < exrFileList.length; j++) {
            elementList.push({
                "path": exrFileList[j],
                "layer": "",
                "name": "",
                "type": ""
            });
        }
    }

    // Show window
    // var ok = createDialog();
    // if (ok === 2) return false;

    // Keeping the ruler settings to reset in the end of the script
    var startRulerUnits = app.preferences.rulerUnits;
    var startTypeUnits = app.preferences.typeUnits;
    var startDisplayDialogs = app.displayDialogs;
    
    // Changing ruler settings to pixels for correct image resizing
    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.PIXELS;
    app.displayDialogs = DialogModes.NO;

    // Timer prep
    var d = new Date();
    timeStart = d.getTime() / 1000;

    //// MAIN FUNCTION RUN ////
    try {
    //   activeDocument.suspendHistory("Name in history", "main()");
      main();
    } catch(e) {
      main();
    }
    ///////////////////////////

    // Timer calculate
    var timeFull = timeSinceStart(timeStart);

    // alert("Time elapsed " + formatSeconds(timeFull));

    // Reset the ruler
    app.preferences.rulerUnits = startRulerUnits;
    app.preferences.typeUnits = startTypeUnits;
    app.displayDialogs = startDisplayDialogs;

}

function main() {

    //// CRYPTOMATTES ////

    var grp_CryptoRaster = activeDocument.layerSets.add();
    grp_CryptoRaster.name = "Cryptomats Raster";
    
    for (i = layerList.length - 1; i >= 0; i--) {
        layerList[i].layer.move(grp_CryptoRaster, ElementPlacement.INSIDE);
    }

    grp_LocalAdjustments = activeDocument.layerSets.add();
    grp_LocalAdjustments.name = "Local Adjustments";
    for (i = layerList.length - 1; i >= 0; i--) {

        var lyrThis = grp_LocalAdjustments.layerSets.add();
        var namePrefix = "CryptoMaterial.";
        if (layerList[i].name.lastIndexOf(namePrefix) != -1) {
            lyrThis.name = layerList[i].name.substring(namePrefix.length, layerList[i].name.length);
        } else {
            lyrThis.name = layerList[i].name;
        }

        layerList[i].layer.name = layerList[i].name + " APPLY IMAGE";
        activeDocument.activeLayer = lyrThis;
        createMask();
        applyImageMask(layerList[i].layer.name);
        layerList[i].layer.remove();
        layerList[i].layer = lyrThis;
    
    }

    grp_CryptoRaster.remove();

    //// ADD PASSES ////

    grp_Passes = activeDocument.layerSets.add();
    grp_Passes.name = "Passes";
    grp_Passes.move(activeDocument.layers[activeDocument.layers.length - 1], ElementPlacement.PLACEAFTER);
    for (i = 0; i < elementList.length; i++) {

        open(elementList[i].path);
        activeDocument.selection.selectAll();
        activeDocument.selection.copy();
        activeDocument.close(SaveOptions.DONOTSAVECHANGES);

        activeDocument.paste();
        activeDocument.activeLayer.name = String(cleanFolderStr(elementList[i].path)).substring(String(cleanFolderStr(elementList[i].path)).lastIndexOf("\\") + 1, String(cleanFolderStr(elementList[i].path)).lastIndexOf("."));
        elementList[i].layer = activeDocument.activeLayer;
        elementList[i].name = activeDocument.activeLayer.name;
        elementList[i].type = activeDocument.activeLayer.name.substring(activeDocument.activeLayer.name.lastIndexOf("_") + 1, activeDocument.activeLayer.name.length - 4);
        
    }
    for (i = 0; i < elementList.length; i++) {

        if (elementList[i].type == "") continue;
        try {
            activeDocument.activeLayer = grp_Passes.layerSets.getByName(elementList[i].type);
        } catch(e) {
            grp_Passes.layerSets.add();
            activeDocument.activeLayer.name = elementList[i].type;
        }
        elementList[i].layer.move(activeDocument.activeLayer, ElementPlacement.INSIDE);

    }
    for (i = 0; i < grp_Passes.layers.length; i++) {
        var item = grp_Passes.layers[i];
        if (item.name.toLowerCase().indexOf("diffuse") != -1) {
            item.move(grp_Passes.layerSets[grp_Passes.layerSets.length - 1], ElementPlacement.PLACEBEFORE);
        } else if (item.name.toLowerCase().indexOf("reflection") != -1) {
            item.blendMode = BlendMode.LINEARDODGE;
        } else if (item.name.toLowerCase().indexOf("refraction") != -1) {
            item.blendMode = BlendMode.LINEARDODGE;
        } else if (item.name.toLowerCase().indexOf("specular") != -1) {
            item.blendMode = BlendMode.LINEARDODGE;
        } else {
            item.move(grp_Passes.layerSets[0], ElementPlacement.PLACEBEFORE);
            item.visible = false;
        }
    }

}

// FUNCTIONS

function createMask() {
    var idmake = stringIDToTypeID( "make" );
        var desc112 = new ActionDescriptor();
        var idnew = stringIDToTypeID( "new" );
        var idchannel = stringIDToTypeID( "channel" );
        desc112.putClass( idnew, idchannel );
        var idat = stringIDToTypeID( "at" );
            var ref85 = new ActionReference();
            var idchannel = stringIDToTypeID( "channel" );
            var idchannel = stringIDToTypeID( "channel" );
            var idmask = stringIDToTypeID( "mask" );
            ref85.putEnumerated( idchannel, idchannel, idmask );
        desc112.putReference( idat, ref85 );
        var idusing = stringIDToTypeID( "using" );
        var iduserMaskEnabled = stringIDToTypeID( "userMaskEnabled" );
        var idrevealAll = stringIDToTypeID( "revealAll" );
        desc112.putEnumerated( idusing, iduserMaskEnabled, idrevealAll );
    executeAction( idmake, desc112, DialogModes.NO );
}

function applyImageMask(lyrName) {
    var idapplyImageEvent = stringIDToTypeID( "applyImageEvent" );
        var desc12 = new ActionDescriptor();
        var idwith = stringIDToTypeID( "with" );
            var desc13 = new ActionDescriptor();
            var idto = stringIDToTypeID( "to" );
                var ref5 = new ActionReference();
                var idchannel = stringIDToTypeID( "channel" );
                var idchannel = stringIDToTypeID( "channel" );
                var idred = stringIDToTypeID( "red" );
                ref5.putEnumerated( idchannel, idchannel, idred );
                var idlayer = stringIDToTypeID( "layer" );
                ref5.putName( idlayer, lyrName );
            desc13.putReference( idto, ref5 );
            var idpreserveTransparency = stringIDToTypeID( "preserveTransparency" );
            desc13.putBoolean( idpreserveTransparency, true );
        var idcalculation = stringIDToTypeID( "calculation" );
        desc12.putObject( idwith, idcalculation, desc13 );
    executeAction( idapplyImageEvent, desc12, DialogModes.NO );
}

function cleanFolderStr(input) { // Input a path in any form and return a string that looks like it's pasted
	
	input = String(input);
	
	if (input[0] == "\/" && isLetter(input[1]) && input[2] == "\/") {
		inputLetter = input[1].toUpperCase();
		input = input.substring(3,input.length);
		input = inputLetter+":\\"+input;
	}
	
	input = input.replace(/\//g, "\\"); // Replace all slashes with backslashes to match if pasted
	input = input.replace(/%20/g, " "); // Replace all %20 with actual spaces to match if pasted
	input = input.replace(/%C3%A9/g, "é"); // Replace all %C3 with é to match if pasted
	
	return input;
	
	function isLetter(str) {
		return str.length === 1 && str.match(/[a-z]/i);
	}
	
}

function getOnlyFolders(path) {
    var fileArr = path.getFiles();
    var newArr = [];
    for (var arrIndex = 0; arrIndex < fileArr.length; arrIndex++) {
        try {
            if (fileArr[arrIndex].getFiles() && String(fileArr[arrIndex]).indexOf("Crypto") == -1) newArr.push(fileArr[arrIndex]);
        } catch(e) {
            continue;
        }
    }
    return newArr;
}

function timeSinceStart(start) {
    if (start == null) return null;
    var d = new Date();
    var timeNow = d.getTime() / 1000;
    return timeNow - start;
}

function formatSeconds(sec) {
    String.prototype.repeat = function(x) {
        var str = "";
        for (var repeats = 0; repeats < x; repeats++) str = str + this;
        return str;
    };
    Number.prototype.twoDigits = function() {
        if (this == 0) return ('0'.repeat(2));
        var dec = this / (Math.pow(10, 2));
        if (String(dec).substring(String(dec).lastIndexOf(".") + 1, String(dec).length).length == 1) dec = dec + "0";
        var str = dec.toString().substring(2, dec.toString().length);
        return str;
    };
    var hours = Math.floor(sec / 60 / 60);
    var minutes = Math.floor(sec / 60) - (hours * 60);
    var seconds = sec % 60;
    return Math.floor(hours).twoDigits() + ':' + Math.floor(minutes).twoDigits() + ':' + Math.floor(seconds).twoDigits();
}