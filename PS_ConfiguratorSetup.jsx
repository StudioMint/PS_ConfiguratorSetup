/*
<javascriptresource>
<name>Polestar Configurator Setup...</name>
<about>Copyright 2022 Studio Mint</about>
<category>Studio Mint</category>
</javascriptresource>
*/

#include "json2.js"
#target photoshop
var scriptFolder = (new File($.fileName)).parent; // The location of this script

// VARIABLES

var mainDir, superDoc, lyr_Dummy, grp_Interiors, grp_Window, grp_Wipers, grp_Paints, grp_LocalAdjustments, grp_GlobalAdjustments, grp_Passes;
var subDirs = [];
var elementList = [];
var docBit = BitsPerChannelType.SIXTEEN;
// var docBit = BitsPerChannelType.THIRTYTWO;
var settingsFile;
var cryptoRun;

var timeStart = null;
var os = $.os.toLowerCase().indexOf('mac') >= 0 ? "MAC": "WINDOWS";

try {
    init();
} catch(e) {
    var timeFull = timeSinceStart(timeStart);
    if (timeFull != null) alert("Error code " + e.number + " (line " + e.line + "):\n" + e + "\n\nTime elapsed " + formatSeconds(timeFull));
}

function createDialog() {

    var w = new Window('dialog',"PS Configurator Setup",undefined);
        w.alignChildren = "left";
        w.orientation = "column";

        var grp_BtnTop = w.add("group");
            grp_BtnTop.orientation = "row";
            grp_BtnTop.alignment = "center";

            var grp_Btn1 = grp_BtnTop.add("group");
                grp_Btn1.orientation = "column";
                grp_Btn1.alignment = "center";

                var btn_PaintMain = grp_Btn1.add ("button",undefined,"Paint type");
                    btn_PaintMain.enabled = false;
                grp_Btn1.add ("image", undefined, File (scriptFolder + "/icon_PaintMain.png"));

            // var grp_Btn2 = grp_BtnTop.add("group");
            //     grp_Btn2.orientation = "column";
            //     grp_Btn2.alignment = "center";

                // var btn_PaintSub = grp_Btn2.add ("button",undefined,"Paint Sub");
                //     btn_PaintSub.enabled = false;
                // grp_Btn2.add ("image", undefined, File (scriptFolder + "/icon_PaintSub.png"));

            var grp_Btn3 = grp_BtnTop.add("group");
                grp_Btn3.orientation = "column";
                grp_Btn3.alignment = "center";
                    
                var btn_Interior = grp_Btn3.add ("button",undefined,"Interior");
                    btn_Interior.enabled = false;
                grp_Btn3.add ("image", undefined, File (scriptFolder + "/icon_Interior.png"));

            var grp_Btn4 = grp_BtnTop.add("group");
                grp_Btn4.orientation = "column";
                grp_Btn4.alignment = "center";

                var btn_Windows = grp_Btn4.add ("button",undefined,"Windows");
                    btn_Windows.enabled = false;
                grp_Btn4.add ("image", undefined, File (scriptFolder + "/icon_Windows.png"));

            var grp_Btn5 = grp_BtnTop.add("group");
                grp_Btn5.orientation = "column";
                grp_Btn5.alignment = "center";
                
                var btn_Wipers = grp_Btn5.add ("button",undefined,"Wipers");
                    btn_Wipers.enabled = false;
                grp_Btn5.add ("image", undefined, File (scriptFolder + "/icon_Wipers.png"));

		var list_Folders = w.add ("listbox", [0, 0, 600, 600]);
            for (subIndex = 0; subIndex < subDirs.length; subIndex++) {
                list_Folders.add ("item", subDirs[subIndex].name);
                list_Folders.items[subIndex].image = File (scriptFolder + "/icon_" + subDirs[subIndex].category + ".png");
            }
            list_Folders.onChange = function () {
                btn_PaintMain.enabled = true;
                // btn_PaintSub.enabled = true;
                btn_Interior.enabled = true;
                btn_Windows.enabled = true;
                btn_Wipers.enabled = true;
            }

        var grp_Warning = w.add("group");
            grp_Warning.orientation = "row";
            grp_Warning.alignment = "left";
            
            var img_Warning = grp_Warning.add ("image", undefined, File (scriptFolder + "/icon_Blank.png"));
            var txt_Warning = grp_Warning.add("statictext",[0,0,400,15],"");
            txt_Warning.text = "";

        var grp_Btn = w.add("group");
            grp_Btn.orientation = "row";
            grp_Btn.alignment = "right";

            var btn_Crypto = grp_Btn.add ("button",undefined,"Create crypto masks (Exr-IO)");
            if (!File(scriptFolder + "/PS_CryptoPrep.jsx").exists && !File(scriptFolder.parent + "/PS_CryptoPrep/PS_CryptoPrep.jsx").exists || os == "MAC") btn_Crypto.enabled = false;
            var btn_Save = grp_Btn.add ("button",undefined,"Save");
            var btn_OK = grp_Btn.add ("button",undefined,"OK");
            grp_Btn.add ("button",undefined,"Cancel");
    
    btn_PaintMain.onClick = function() {
        subDirs[list_Folders.selection.index].category = "PaintMain";
        list_Folders.items[list_Folders.selection.index].image = File(scriptFolder + "/icon_" + subDirs[list_Folders.selection.index].category + ".png");

        checkCrypto(list_Folders.selection.index);

        for (listIndex = list_Folders.selection.index + 1; listIndex < list_Folders.items.length; listIndex++) {
            if (subDirs[listIndex].name.indexOf(subDirs[list_Folders.selection.index].name) != -1) {
                subDirs[listIndex].category = "PaintSub";
                subDirs[listIndex].note = subDirs[list_Folders.selection.index].name;
                list_Folders.items[listIndex].image = File(scriptFolder + "/icon_" + subDirs[listIndex].category + ".png");
            } else {
                break;
            }
        }

        list_Folders.active = true;
    }
    // btn_PaintSub.onClick = function() {
    //     subDirs[list_Folders.selection.index].category = "PaintSub";
    //     list_Folders.items[list_Folders.selection.index].image = File(scriptFolder + "/icon_" + subDirs[list_Folders.selection.index].category + ".png");
    //     list_Folders.active = true;
    //     img_Warning.image = File(scriptFolder + "/icon_Blank.png");
    //     txt_Warning.text = "";
    // }
    btn_Interior.onClick = function() {
        subDirs[list_Folders.selection.index].category = "Interior";
        list_Folders.items[list_Folders.selection.index].image = File(scriptFolder + "/icon_" + subDirs[list_Folders.selection.index].category + ".png");
        list_Folders.active = true;
        img_Warning.image = File(scriptFolder + "/icon_Blank.png");
        txt_Warning.text = "";
    }
    btn_Windows.onClick = function() {
        subDirs[list_Folders.selection.index].category = "Windows";
        list_Folders.items[list_Folders.selection.index].image = File(scriptFolder + "/icon_" + subDirs[list_Folders.selection.index].category + ".png");
        list_Folders.active = true;
        img_Warning.image = File(scriptFolder + "/icon_Blank.png");
        txt_Warning.text = "";
    }
    btn_Wipers.onClick = function() {
        subDirs[list_Folders.selection.index].category = "Wipers";
        list_Folders.items[list_Folders.selection.index].image = File(scriptFolder + "/icon_" + subDirs[list_Folders.selection.index].category + ".png");
        list_Folders.active = true;
        img_Warning.image = File(scriptFolder + "/icon_Blank.png");
        txt_Warning.text = "";
    }

    btn_Crypto.onClick = function() {
        cryptoRun = true;
        w.close();
    }

    btn_Save.onClick = function() {
        saveJson(JSON.stringify(subDirs), settingsFile);
    }

    btn_OK.onClick = function() {
        if (checkSettings(true) === true) w.close();
    }
   
    if (settingsFile.exists) {
        for (i_json = 0; i_json < subDirs.length; i_json++) if (subDirs[i_json].category == "PaintMain" || subDirs[i_json].category == "PaintSub") checkCrypto(i_json);
    }
    function checkCrypto(index) {
        var tempElements = getOnlyFolders(Folder(subDirs[index].dir), false);
        for (tempIndex = 0; tempIndex < tempElements.length; tempIndex++) {
            var itemName = String(tempElements[tempIndex]).substring(String(tempElements[tempIndex]).lastIndexOf("/") + 1, String(tempElements[tempIndex]).length);
            if (itemName.toLowerCase().indexOf("crypto") != -1) {
                var psbFileList = tempElements[tempIndex].getFiles("*.psb");
                if (psbFileList.length == 0) {
                    img_Warning.image = File(scriptFolder + "/icon_Warning.png");
                    txt_Warning.text = subDirs[index].name + " is missing cryptomattes";
                    break;
                }
            }
            img_Warning.image = File(scriptFolder + "/icon_Blank.png");
            txt_Warning.text = "";
        }
    }

    w.center();
    x = w.show();

    // Global variables
    

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

    if (app.documents.length != 0) {
        return alert("Close all documents!");
    }

    // Select folder
    mainDir = Folder.selectDialog("Select the main car folder (ie. \"Front34\")");
    if (mainDir == null) return;

    settingsFile = File(mainDir + "/settings.json");
    if (settingsFile.exists) {
        var jsonEval = $.evalFile(settingsFile);
        if (cleanFolderStr(mainDir) == cleanFolderStr(jsonEval[0].dir).substring(0, String(jsonEval[0].dir).lastIndexOf("/"))) {
            subDirs = jsonEval;
        }
    }
    if (subDirs.length == 0) {
        var tempList = getOnlyFolders(mainDir, false).sort();
        for (i = 0; i < tempList.length; i++) {
            var dir = cleanFolderStr(tempList[i], true);
            var itemName = String(tempList[i]).substring(String(tempList[i]).lastIndexOf("/") + 1, String(tempList[i]).length);
            if (itemName.toLowerCase().indexOf("interior") != -1) {
                var category = "Interior";
            } else if (itemName.toLowerCase().indexOf("window") != -1) {
                var category = "Windows";
            } else if (itemName.toLowerCase().indexOf("wiper") != -1) {
                var category = "Wipers";
            } else {
                var category = "Empty";
            }
            subDirs.push({
                "dir": dir,
                "name": itemName,
                "category": category,
                "note": ""
            })
        }
    }

    var ok = createDialog();
    if (ok === 2) return false;

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
    main();
    ///////////////////////////

    // Timer calculate
    var timeFull = timeSinceStart(timeStart);
    alert("Time elapsed " + formatSeconds(timeFull));

    // Reset the ruler
    app.preferences.rulerUnits = startRulerUnits;
    app.preferences.typeUnits = startTypeUnits;
    app.displayDialogs = startDisplayDialogs;

}

function main() {

    if (!cryptoRun) {
        for (indexMain = 0; indexMain < subDirs.length; indexMain++) {

            if (!superDoc) {
                var firstExr = Folder(subDirs[indexMain].dir).getFiles("*.exr");
                open(firstExr[0]);
                var docWidth = activeDocument.width;
                var docHeight = activeDocument.height;
                activeDocument.close(SaveOptions.DONOTSAVECHANGES);
                app.documents.add(docWidth, docHeight, 72, String(mainDir).substring(String(mainDir).lastIndexOf("/") + 1, String(mainDir).length), NewDocumentMode.RGB, DocumentFill.TRANSPARENT, 1.0, docBit);
                superDoc = activeDocument;
                lyr_Dummy = activeDocument.activeLayer;
            }

            if (subDirs[indexMain].category == "PaintMain" || subDirs[indexMain].category == "PaintSub") {

                if (subDirs[indexMain].category == "PaintMain") {
                    var carName = subDirs[indexMain].name;
                } else {
                    var carName = subDirs[indexMain].note;
                }
                
                activeDocument.activeLayer = lyr_Dummy;
                var firstExr = Folder(subDirs[indexMain].dir).getFiles("*.exr");
                open(firstExr[0]);
                var lyr_Ref = activeDocument.activeLayer;
                    lyr_Ref.visible = false;
                    lyr_Ref.name = subDirs[indexMain].name + " - Reference";

                var grp_Car = activeDocument.layerSets.add();
                    grp_Car.name = subDirs[indexMain].name;
                lyr_Ref.move(grp_Car, ElementPlacement.INSIDE);

                var elementFolders = getOnlyFolders(Folder(subDirs[indexMain].dir), false);
                for (indexEl = 0; indexEl < elementFolders.length; indexEl++) {

                    var itemName = String(elementFolders[indexEl]).substring(String(elementFolders[indexEl]).lastIndexOf("/") + 1, String(elementFolders[indexEl]).length);
                    if (itemName.toLowerCase().indexOf("cryptomatte_material") != -1 || itemName.toLowerCase().indexOf("cryptomatte_object") != -1) {
                        
                        var cryptoPSB = elementFolders[indexEl].getFiles("*.psb");
                        if (cryptoPSB[0] == undefined) continue;
                        placeLinkedFile(cryptoPSB[0]);
                        activeDocument.activeLayer.move(grp_Car, ElementPlacement.INSIDE);
                        convertPlacedToLayers();
                        if (itemName.toLowerCase().indexOf("cryptomatte_material") != -1) activeDocument.activeLayer.name = "Crypto Material";
                        if (itemName.toLowerCase().indexOf("cryptomatte_object") != -1) activeDocument.activeLayer.name = "Crypto Object";
                        activeDocument.activeLayer.blendMode = BlendMode.PASSTHROUGH;

                    } else {

                        var exrFileList = elementFolders[indexEl].getFiles("*.exr");
                        for (indexExr = 0; indexExr < exrFileList.length; indexExr++) {
                            elementList.push({
                                "path": exrFileList[indexExr],
                                "layer": "",
                                "name": "",
                                "type": ""
                            });
                        }

                        //// ADD PASSES ////

                        try {
                            activeDocument.activeLayer = grp_Car.layerSets.getByName("Passes");
                        } catch(e) {
                            grp_Car.layerSets.add();
                            activeDocument.activeLayer.name = "Passes";
                        }
                        
                        for (indexExr = 0; indexExr < exrFileList.length; indexExr++) {

                            open(exrFileList[indexExr]);
                            activeDocument.selection.selectAll();
                            activeDocument.selection.copy();
                            activeDocument.close(SaveOptions.DONOTSAVECHANGES);

                            activeDocument.paste();
                            var lyr = activeDocument.activeLayer;
                            lyr.name = String(cleanFolderStr(exrFileList[indexExr])).substring(String(cleanFolderStr(exrFileList[indexExr])).lastIndexOf("\\") + 1, String(cleanFolderStr(exrFileList[indexExr])).lastIndexOf("."));
                            // exrFileList[indexExr].layer = activeDocument.activeLayer;
                            // exrFileList[indexExr].name = activeDocument.activeLayer.name;
                            // exrFileList[indexExr].type = activeDocument.activeLayer.name.substring(activeDocument.activeLayer.name.lastIndexOf("_") + 1, activeDocument.activeLayer.name.length - 4);
                            
                            var elementType = lyr.name.substring(lyr.name.lastIndexOf("_") + 1, lyr.name.length - 4);
                            if (elementType == "") continue;
                            try {
                                activeDocument.activeLayer = grp_Car.layerSets.getByName("Passes").layerSets.getByName(elementType);
                            } catch(e) {
                                grp_Car.layerSets.getByName("Passes").layerSets.add();
                                activeDocument.activeLayer.name = elementType;
                            }
                            lyr.move(activeDocument.activeLayer, ElementPlacement.INSIDE);

                            if (lyr.name.toLowerCase().indexOf("diffuse") != -1) {
                                lyr.move(activeDocument.activeLayer.layers[activeDocument.activeLayer.layers.length - 1], ElementPlacement.PLACEBEFORE);
                            } else if (lyr.name.toLowerCase().indexOf("reflection") != -1) {
                                lyr.blendMode = BlendMode.LINEARDODGE;
                            } else if (lyr.name.toLowerCase().indexOf("refraction") != -1) {
                                lyr.blendMode = BlendMode.LINEARDODGE;
                            } else if (lyr.name.toLowerCase().indexOf("specular") != -1) {
                                lyr.blendMode = BlendMode.LINEARDODGE;
                            } else {
                                lyr.move(activeDocument.activeLayer.layers[0], ElementPlacement.PLACEBEFORE);
                                lyr.visible = false;
                            }

                        }

                    }
                }

                try {
                    grp_Car.layerSets.getByName("Crypto Object").move(grp_Car.layers[0], ElementPlacement.PLACEBEFORE);
                } catch(e) {}
                try {
                    grp_Car.layerSets.getByName("Crypto Material").move(grp_Car.layers[0], ElementPlacement.PLACEBEFORE);
                } catch(e) {}

                lyr_Ref.move(grp_Car, ElementPlacement.INSIDE);

                try {
                    activeDocument.activeLayer = grp_Car.layerSets.getByName("Crypto Material").layerSets.getByName("dome_new");
                    selectionFromMask();
                    activeDocument.selection.invert();
                    activeDocument.activeLayer = grp_Car;
                    makeLayerMask();
                } catch(e) {
                    try {
                        activeDocument.activeLayer = grp_Car.layerSets.getByName("Crypto Object").layerSets.getByName("dome_new");
                        selectionFromMask();
                        activeDocument.selection.invert();
                        activeDocument.activeLayer = grp_Car;
                        makeLayerMask();
                    } catch(e) {}
                    // No mask for the car
                }
                activeDocument.selection.deselect();
            
                var savePath = File(subDirs[indexMain].dir + "/" + subDirs[indexMain].name + ".psb");
                savePSB(savePath);
                activeDocument.close(SaveOptions.DONOTSAVECHANGES);
                placeLinkedFile(savePath);
                var lyr_Car = activeDocument.activeLayer;

                var lyr_Dummy = activeDocument.artLayers.add();
                lyr_Dummy.move(activeDocument.layers[activeDocument.layers.length - 1], ElementPlacement.PLACEBEFORE);

                try {
                    activeDocument.activeLayer = activeDocument.layerSets.getByName(carName);
                } catch(e) {
                    activeDocument.layerSets.add();
                    activeDocument.activeLayer.name = carName;
                    activeDocument.activeLayer.move(activeDocument.layers[activeDocument.layers.length - 1], ElementPlacement.PLACEBEFORE);
                }

                try {
                    lyr_Car.move(activeDocument.activeLayer, ElementPlacement.INSIDE);
                } catch(e) {}

                if (lyr_Car.name == carName) lyr_Car.move(activeDocument.activeLayer.layers[activeDocument.activeLayer.layers.length - 1], ElementPlacement.PLACEBEFORE);

            // case "PaintSub":

                // var mainName = subDirs[indexMain].name.substring(0, subDirs[indexMain].name.lastIndexOf("_"));
                // try {
                //     activeDocument.activeLayer = activeDocument.layerSets.getByName(mainName);
                // } catch(e) {
                //     activeDocument.layerSets.add();
                //     activeDocument.activeLayer.name = mainName;
                //     activeDocument.activeLayer.move(activeDocument.layers[activeDocument.layers.length - 1], ElementPlacement.PLACEBEFORE);
                // }

                // var grp_Main = activeDocument.activeLayer;
                // var exrList = Folder(subDirs[indexMain].dir).getFiles("*.exr");
                // open(exrList[0]);

                // activeDocument.selection.selectAll();
                // activeDocument.selection.copy();
                // activeDocument.close(SaveOptions.DONOTSAVECHANGES);

                // pasteInPlace();
                // activeDocument.activeLayer.name = subDirs[indexMain].name;
                
                // try {
                //     activeDocument.activeLayer.move(grp_Main.layers[0], ElementPlacement.PLACEAFTER);
                // } catch(e) {}
                
                // break;
            } else {

                try {
                    activeDocument.activeLayer = activeDocument.layerSets.getByName(subDirs[indexMain].category);
                } catch(e) {
                    activeDocument.layerSets.add();
                    activeDocument.activeLayer.name = subDirs[indexMain].category;
                }

                var exrList = Folder(subDirs[indexMain].dir).getFiles("*.exr");
                open(exrList[0]);

                activeDocument.selection.selectAll();
                activeDocument.selection.copy();
                activeDocument.close(SaveOptions.DONOTSAVECHANGES);

                pasteInPlace();
                activeDocument.activeLayer.name = subDirs[indexMain].name;

            }
        }

        try {
            lyr_Dummy.remove();
        } catch(e) {}
    
    } else {
        try {
            for (i_crypto = 0; i_crypto < subDirs.length; i_crypto++) {
                if (subDirs[i_crypto].category == "PaintMain" || subDirs[i_crypto].category == "PaintSub") {
                    var tempElements = getOnlyFolders(Folder(subDirs[i_crypto].dir), false);
                    for (tempIndex = 0; tempIndex < tempElements.length; tempIndex++) {
                        var itemName = String(tempElements[tempIndex]).substring(String(tempElements[tempIndex]).lastIndexOf("/") + 1, String(tempElements[tempIndex]).length);
                        if (itemName.toLowerCase().indexOf("crypto") != -1) {
                            var psbFileList = tempElements[tempIndex].getFiles("*.psb");
                            if (psbFileList.length == 0) {
                                var exrFileList = tempElements[tempIndex].getFiles("*.exr");
                                for (i_exr = 0; i_exr < exrFileList.length; i_exr++) {
                                    open(exrFileList[i_exr]);
                                    if (File(scriptFolder + "/PS_CryptoPrep.jsx").exists) {
                                        $.evalFile(File(scriptFolder + "/PS_CryptoPrep.jsx"));
                                    } else {
                                        $.evalFile(File(scriptFolder.parent + "/PS_CryptoPrep/PS_CryptoPrep.jsx"));
                                    }
                                    savePSB(File(String(exrFileList[i_exr]).substring(0, String(exrFileList[i_exr].length - 4))) + ".psb");
                                    activeDocument.close(SaveOptions.DONOTSAVECHANGES);
                                }
                            }
                        }
                    }
                }
            }
        } catch(e) {
            alert("Failed to create crypto masks" + "\n" + e)
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

function makeLayerMask() { // Creates a layer mask on the activeLayer from current selection
	var maskType = 'RvlS' ; //from selection
	var desc140 = new ActionDescriptor();
	desc140.putClass( charIDToTypeID('Nw  '), charIDToTypeID('Chnl') );
		var ref51 = new ActionReference();
		ref51.putEnumerated( charIDToTypeID('Chnl'), charIDToTypeID('Chnl'), charIDToTypeID('Msk ') );
	desc140.putReference( charIDToTypeID('At  '), ref51 );
	desc140.putEnumerated( charIDToTypeID('Usng'), charIDToTypeID('UsrM'), charIDToTypeID(maskType) );
	executeAction( charIDToTypeID('Mk  '), desc140, DialogModes.NO );
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

function selectionFromMask() {
    var idset = stringIDToTypeID( "set" );
        var desc307 = new ActionDescriptor();
        var idnull = stringIDToTypeID( "null" );
            var ref268 = new ActionReference();
            var idchannel = stringIDToTypeID( "channel" );
            var idselection = stringIDToTypeID( "selection" );
            ref268.putProperty( idchannel, idselection );
        desc307.putReference( idnull, ref268 );
        var idto = stringIDToTypeID( "to" );
            var ref269 = new ActionReference();
            var idchannel = stringIDToTypeID( "channel" );
            var idchannel = stringIDToTypeID( "channel" );
            var idmask = stringIDToTypeID( "mask" );
            ref269.putEnumerated( idchannel, idchannel, idmask );
        desc307.putReference( idto, ref269 );
    executeAction( idset, desc307, DialogModes.NO );
}

function maskContentCheck() {
    selectionFromMask();
    try {
        if (activeDocument.selection.bounds[0]) {
            // There's content in the mask (even out of bounds will be checked)
            activeDocument.selection.deselect();
            return true;
        }
    } catch(e) {
        // Completely black mask
        return false;
    }
}

function pasteInPlace() {
    var idpaste = stringIDToTypeID( "paste" );
        var desc342 = new ActionDescriptor();
        var idinPlace = stringIDToTypeID( "inPlace" );
        desc342.putBoolean( idinPlace, true );
        var idantiAlias = stringIDToTypeID( "antiAlias" );
        var idantiAliasType = stringIDToTypeID( "antiAliasType" );
        var idantiAliasNone = stringIDToTypeID( "antiAliasNone" );
        desc342.putEnumerated( idantiAlias, idantiAliasType, idantiAliasNone );
        var idas = stringIDToTypeID( "as" );
        var idpixel = stringIDToTypeID( "pixel" );
        desc342.putClass( idas, idpixel );
    executeAction( idpaste, desc342, DialogModes.NO );
}

function placeLinkedFile(file) {
    var idplaceEvent = stringIDToTypeID( "placeEvent" );
        var desc591 = new ActionDescriptor();
        var idID = stringIDToTypeID( "ID" );
        desc591.putInteger( idID, 4 );
        var idnull = stringIDToTypeID( "null" );
        desc591.putPath( idnull, file );
        var idlinked = stringIDToTypeID( "linked" );
        desc591.putBoolean( idlinked, true );
        var idfreeTransformCenterState = stringIDToTypeID( "freeTransformCenterState" );
        var idquadCenterState = stringIDToTypeID( "quadCenterState" );
        var idQCSAverage = stringIDToTypeID( "QCSAverage" );
        desc591.putEnumerated( idfreeTransformCenterState, idquadCenterState, idQCSAverage );
        var idoffset = stringIDToTypeID( "offset" );
            var desc592 = new ActionDescriptor();
            var idhorizontal = stringIDToTypeID( "horizontal" );
            var idpixelsUnit = stringIDToTypeID( "pixelsUnit" );
            desc592.putUnitDouble( idhorizontal, idpixelsUnit, 0.000000 );
            var idvertical = stringIDToTypeID( "vertical" );
            var idpixelsUnit = stringIDToTypeID( "pixelsUnit" );
            desc592.putUnitDouble( idvertical, idpixelsUnit, 0.000000 );
        var idoffset = stringIDToTypeID( "offset" );
        desc591.putObject( idoffset, idoffset, desc592 );
    executeAction( idplaceEvent, desc591, DialogModes.NO );
}

function convertPlacedToLayers() {
    var idplacedLayerConvertToLayers = stringIDToTypeID( "placedLayerConvertToLayers" );
    executeAction( idplacedLayerConvertToLayers, undefined, DialogModes.NO );
}

function cleanFolderStr(input, singleSlash) { // Input a path in any form and return a string that looks like it's pasted
	
	input = String(input);
	
	if (input[0] == "\/" && isLetter(input[1]) && input[2] == "\/") {
		inputLetter = input[1].toUpperCase();
		input = input.substring(3,input.length);
		input = inputLetter+":\\"+input;
	}
	
	if (singleSlash) {
        input = input.replace(/\//g, "/"); // Replace all slashes with backslashes to match if pasted
    } else {
        input = input.replace(/\//g, "\\"); // Replace all slashes with backslashes to match if pasted
    }
    input = input.replace(/%20/g, " "); // Replace all %20 with actual spaces to match if pasted
	input = input.replace(/%C3%A9/g, "é"); // Replace all %C3 with é to match if pasted
	
	return input;
	
	function isLetter(str) {
		return str.length === 1 && str.match(/[a-z]/i);
	}
	
}

function getOnlyFolders(path, cryptoIgnore) {
    var fileArr = path.getFiles();
    var newArr = [];
    for (var arrIndex = 0; arrIndex < fileArr.length; arrIndex++) {
        try {
            if (cryptoIgnore) {
                if (fileArr[arrIndex].getFiles() && String(fileArr[arrIndex]).indexOf("Crypto") == -1) newArr.push(fileArr[arrIndex]);
            } else {
                if (fileArr[arrIndex].getFiles()) newArr.push(fileArr[arrIndex]);
            }
        } catch(e) {
            continue;
        }
    }
    return newArr;
}

function savePSB(saveFile) {
    if (String(saveFile).toLowerCase().substring(String(saveFile).length - 4, String(saveFile).length) != ".psb") saveFile = File(saveFile + ".psb");
    var desc1 = new ActionDescriptor(); 
        var desc2 = new ActionDescriptor(); 
        desc2.putBoolean( stringIDToTypeID('maximizeCompatibility'), true ); 
        desc1.putObject( charIDToTypeID('As  '), charIDToTypeID('Pht8'), desc2 ); 
        desc1.putPath( charIDToTypeID('In  '), new File(saveFile) ); 
        desc1.putBoolean( charIDToTypeID('LwCs'), true ); 
    executeAction( charIDToTypeID('save'), desc1, DialogModes.NO );
};

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

function saveJson(text, file) {
    if (file.exists) file.remove();
    file.encoding = "UTF8";
    file.open("e", "TEXT", "????");
    file.writeln(text);
    file.close();
    alert("Saved!\nLocated in the main directory");
}