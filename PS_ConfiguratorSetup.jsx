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

var mainDir, psbDir, superDoc, angleName, skipCrypto, lyr_Dummy, grp_Interiors, grp_Window, grp_Wipers, grp_Paints, grp_LocalAdjustments, grp_GlobalAdjustments, grp_Passes;
var subDirs = [];
var elementList = [];
// var skipCrypto = false;
var skipCryptoMat = false;
var skipCryptoMesh = false;
var docBit = BitsPerChannelType.SIXTEEN;
// var docBit = BitsPerChannelType.THIRTYTWO;
var settingsFile;
var cryptoRun;
var overwritePSBs = false;

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
                try {
                    grp_Btn1.add ("image", undefined, File (scriptFolder + "/icon_PaintMain.png"));
                } catch(e) {
                    grp_Btn1.add("statictext", undefined, "pai");
                }

            var grp_Btn3 = grp_BtnTop.add("group");
                grp_Btn3.orientation = "column";
                grp_Btn3.alignment = "center";
                    
                var btn_Interior = grp_Btn3.add ("button",undefined,"Interior");
                    btn_Interior.enabled = false;
                try {
                    grp_Btn3.add ("image", undefined, File (scriptFolder + "/icon_Interior.png"));
                } catch(e) {
                    grp_Btn3.add("statictext", undefined, "int");
                }

            var grp_Btn4 = grp_BtnTop.add("group");
                grp_Btn4.orientation = "column";
                grp_Btn4.alignment = "center";

                var btn_Windows = grp_Btn4.add ("button",undefined,"Windows");
                    btn_Windows.enabled = false;
                try {
                    grp_Btn4.add ("image", undefined, File (scriptFolder + "/icon_Windows.png"));
                } catch(e) {
                    grp_Btn4.add("statictext", undefined, "win");
                }

            var grp_Btn5 = grp_BtnTop.add("group");
                grp_Btn5.orientation = "column";
                grp_Btn5.alignment = "center";
                
                var btn_Wipers = grp_Btn5.add ("button",undefined,"Wipers");
                    btn_Wipers.enabled = false;
                try {
                    grp_Btn5.add ("image", undefined, File (scriptFolder + "/icon_Wipers.png"));
                } catch(e) {
                    grp_Btn5.add("statictext", undefined, "wip");
                }

            var grp_Btn6 = grp_BtnTop.add("group");
                grp_Btn6.orientation = "column";
                grp_Btn6.alignment = "center";
                
                var btn_Shadow = grp_Btn6.add ("button",undefined,"Shadow");
                    btn_Shadow.enabled = false;
                try {
                    grp_Btn6.add ("image", undefined, File (scriptFolder + "/icon_Shadow.png"));
                } catch(e) {
                    grp_Btn6.add("statictext", undefined, "sha");
                }

            var grp_Btn2 = grp_BtnTop.add("group");
                grp_Btn2.orientation = "column";
                grp_Btn2.alignment = "center";

                var btn_Other = grp_Btn2.add ("button",undefined,"Other");
                    btn_Other.enabled = false;
                try {
                    grp_Btn2.add ("image", undefined, File (scriptFolder + "/icon_Other.png"));
                } catch(e) {
                    grp_Btn2.add("statictext", undefined, "oth");
                }

		var list_Folders = w.add ("listbox", [0, 0, 600, 600], null, {multiselect: true});
            for (subIndex = 0; subIndex < subDirs.length; subIndex++) {
                list_Folders.add ("item", subDirs[subIndex].name);
                try {
                    list_Folders.items[subIndex].image = File (scriptFolder + "/icon_" + subDirs[subIndex].category + ".png");
                } catch(e) {
                    list_Folders.items[subIndex].text = shortCategory(subDirs[subIndex].category) + " - " + subDirs[subIndex].name;
                }
                list_Folders.items[subIndex].checked = subDirs[subIndex].use;
            }
            list_Folders.onChange = function () {
                if (list_Folders.selection == null) {
                    btn_PaintMain.enabled = false;
                    btn_Interior.enabled = false;
                    btn_Windows.enabled = false;
                    btn_Wipers.enabled = false;
                    btn_Shadow.enabled = false;
                    btn_Other.enabled = false;
                } else {
                    btn_PaintMain.enabled = true;
                    btn_Interior.enabled = true;
                    btn_Windows.enabled = true;
                    btn_Wipers.enabled = true;
                    btn_Shadow.enabled = true;
                    btn_Other.enabled = true;
                }
            }

        // var chk_Crypto = w.add("checkbox", undefined, "Skip cryptomattes");

        var grp_Use = w.add("group");
            grp_Use.orientation = "row";
            grp_Use.alignment = "left";

            var btn_Use = grp_Use.add("button", undefined, "Use");
            var btn_DontUse = grp_Use.add("button", undefined, "Don't use");

        var grp_Warning = w.add("group");
            grp_Warning.orientation = "row";
            grp_Warning.alignment = "left";
            
            try {
                var img_Warning = grp_Warning.add ("image", undefined, File (scriptFolder + "/icon_Blank.png"));
            } catch(e) {
                var img_Warning = grp_Warning.add("statictext", undefined, "   ");
            }
            var txt_Warning = grp_Warning.add("statictext",[0,0,400,15],"");
            txt_Warning.text = "";

        var grp_Btn = w.add("group");
            grp_Btn.orientation = "row";
            grp_Btn.alignment = "right";

            var btn_Crypto = grp_Btn.add ("button",undefined,"Create crypto masks (Exr-IO)");
            if (!File(scriptFolder + "/PS_CryptoPrep.jsx").exists && !File(scriptFolder.parent + "/PS_CryptoPrep/PS_CryptoPrep.jsx").exists || os == "MAC") btn_Crypto.enabled = false;
            var btn_Save = grp_Btn.add ("button",undefined,"Save settings");
            var btn_OK = grp_Btn.add ("button",undefined,"OK");
            grp_Btn.add ("button",undefined,"Cancel");

    // chk_Crypto.onChange = function() {
    //     skipCrypto = chk_Crypto;
    //     grp_Warning.visible = chk_Crypto;
    // }

    var cryptosAvailable = false;
    
    btn_PaintMain.onClick = function() {
        cryptosAvailable = false;
        for (i = 0; i < list_Folders.selection.length; i++) {
            var index = list_Folders.selection[i].index;
            
            subDirs[index].category = "PaintMain";
            try {
                list_Folders.items[index].image = File(scriptFolder + "/icon_" + subDirs[index].category + ".png");
            } catch(e) {
                list_Folders.items[index].text = shortCategory(subDirs[index].category) + " - " + subDirs[index].name;
            }

            if (!cryptosAvailable) checkCrypto(index);

            for (listIndex = index + 1; listIndex < list_Folders.items.length; listIndex++) {
                if (subDirs[listIndex].name.indexOf(subDirs[index].name) != -1) {
                    subDirs[listIndex].category = "PaintSub";
                    subDirs[listIndex].note = subDirs[index].name;
                    try {
                        list_Folders.items[listIndex].image = File(scriptFolder + "/icon_" + subDirs[listIndex].category + ".png");
                    } catch(e) {
                        list_Folders.items[listIndex].text = shortCategory(subDirs[listIndex].category) + " - " + subDirs[listIndex].name;
                    }
                } else {
                    break;
                }
            }
        }

        list_Folders.active = true;
    }
    btn_Other.onClick = function() {
        for (i = 0; i < list_Folders.selection.length; i++) {
            var index = list_Folders.selection[i].index;
            subDirs[index].category = "Other";
            updateIcons(index);
        }
    }
    btn_Interior.onClick = function() {
        for (i = 0; i < list_Folders.selection.length; i++) {
            var index = list_Folders.selection[i].index;
            subDirs[index].category = "Interior";
            updateIcons(index);
        }
    }
    btn_Windows.onClick = function() {
        for (i = 0; i < list_Folders.selection.length; i++) {
            var index = list_Folders.selection[i].index;
            subDirs[index].category = "Windows";
            updateIcons(index);
        }
    }
    btn_Wipers.onClick = function() {
        for (i = 0; i < list_Folders.selection.length; i++) {
            var index = list_Folders.selection[i].index;
            subDirs[index].category = "Wipers";
            updateIcons(index);
        }
    }
    btn_Shadow.onClick = function() {
        for (i = 0; i < list_Folders.selection.length; i++) {
            var index = list_Folders.selection[i].index;
            subDirs[index].category = "Shadow";
            updateIcons(index);
        }
    }

    btn_Use.onClick = function() {
        for (i = 0; i < list_Folders.selection.length; i++) {
            var index = list_Folders.selection[i].index;
            list_Folders.items[index].checked = true;
            subDirs[index].use = true;
        }
    }
    btn_DontUse.onClick = function() {
        for (i = 0; i < list_Folders.selection.length; i++) {
            var index = list_Folders.selection[i].index;
            list_Folders.items[index].checked = false;
            subDirs[index].use = false;
        }
    }

    btn_Crypto.onClick = function() {
        cryptoRun = true;
        w.close();
    }

    btn_Save.onClick = function() {
        saveJson(JSON.stringify(subDirs), settingsFile);
    }

    btn_OK.onClick = function() {
        if (checkSettings(false) === true) w.close();
    }
   
    if (settingsFile.exists) {
        cryptosAvailable = false;
        for (i_json = 0; i_json < subDirs.length; i_json++) if (subDirs[i_json].category == "PaintMain" || subDirs[i_json].category == "PaintSub" && !cryptosAvailable) checkCrypto(i_json);
    }
    function checkCrypto(index) {
        
        try {
            img_Warning.image = File(scriptFolder + "/icon_Blank.png");
        } catch(e) {
            img_Warning.text = "!!!";
        }
        txt_Warning.text = "";
        
        var tempElements = getOnlyFolders(Folder(subDirs[index].dir), false);
        for (tempIndex = 0; tempIndex < tempElements.length; tempIndex++) {
            var itemName = String(tempElements[tempIndex]).substring(String(tempElements[tempIndex]).lastIndexOf("/") + 1, String(tempElements[tempIndex]).length);
            if (itemName.toLowerCase().indexOf("crypto") != -1) {
                var psbFileList = tempElements[tempIndex].getFiles("*.psb");
                if (psbFileList.length != 0) return cryptosAvailable = true;
                // if (psbFileList.length == 0) {
                //     try {
                //         img_Warning.image = File(scriptFolder + "/icon_Warning.png");
                //     } catch(e) {
                //         img_Warning.text = "!!!";
                //     }
                //     txt_Warning.text = subDirs[index].name + " is missing cryptomattes";
                //     break;
                // }
            }
            
            if (tempIndex == (tempElements.length - 1)) {
                try {
                    img_Warning.image = File(scriptFolder + "/icon_Warning.png");
                } catch(e) {
                    img_Warning.text = "!!!";
                }
                txt_Warning.text = "There are no cryptomattes for this angle";
            }
        }
    }

    function updateIcons(index) {
        try {
            list_Folders.items[index].image = File(scriptFolder + "/icon_" + subDirs[index].category + ".png");
            list_Folders.items[index].text = subDirs[index].name;
        } catch(e) {
            list_Folders.items[index].text = shortCategory(subDirs[index].category) + " - " + subDirs[index].name;
            try { 
                list_Folders.items[index].image = File(scriptFolder + "/icon_Blank.png");
            } catch(e) {}
        }
        try {
            img_Warning.image = File(scriptFolder + "/icon_Blank.png");
        } catch(e) {
            img_Warning.text = "   ";
        }
        list_Folders.active = true;
        txt_Warning.text = "";
    }

    function shortCategory(text) {
        switch(text) {
            case "PaintMain": return "pai";
            case "PaintSub": return "sub";
            case "Interior": return "int";
            case "Windows": return "win";
            case "Wipers": return "wip";
            case "Other": return "oth";
            case "Empty": return "   ";
            default: return "#";
        }
    }

    w.center();
    x = w.show();

    // Global variables
    

    return x;

    function checkSettings(ignoreAlerts) {
      
        // If something has to be checked before closing the window, do it here and return false if faulty
        if (!ignoreAlerts) {
            if (File(psbDir + "/" + angleName + ".psb").exists) return confirm("Overwrite file?\nThere's already a main document in the save directory\n" + psbDir + "\n\nDo you want to continue and overwrite the file?");
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

    angleName = String(mainDir).substring(String(mainDir).lastIndexOf("/") + 1, String(mainDir).length);
    psbDir = Folder(mainDir.parent + "/" + angleName + "_PSBs");
    settingsFile = File(mainDir + "/settings.json");
    if (settingsFile.exists) {
        var jsonEval = $.evalFile(settingsFile);
        if (cleanFolderStr(mainDir) == cleanFolderStr(jsonEval[0].dir).substring(0, String(jsonEval[0].dir).lastIndexOf("/"))) {
            subDirs = jsonEval;
        }
    }

    if (subDirs.length == 0) getSubDirs();

    try {
        var ok = createDialog();
    } catch(e) {
        subDirs = [];
        getSubDirs();
        var ok = createDialog();
    }
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

        if (!psbDir.exists) psbDir.create();

        for (indexMain = 0; indexMain < subDirs.length; indexMain++) {

            if (!subDirs[indexMain].use) continue;

            if (!superDoc) {
                var firstExr = Folder(subDirs[indexMain].dir).getFiles("*.exr");
                open(firstExr[0]);
                var docWidth = activeDocument.width;
                var docHeight = activeDocument.height;
                activeDocument.close(SaveOptions.DONOTSAVECHANGES);
                app.documents.add(docWidth, docHeight, 72, angleName, NewDocumentMode.RGB, DocumentFill.TRANSPARENT, 1.0, docBit);
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

		        if (!overwritePSBs) {
                    var savePath = Folder(psbDir + "/" + angleName + "_LinkedFiles");
                    var smartPSB = File(savePath + "/" + subDirs[indexMain].name + ".psb");
                    if (!smartPSB.exists) {
                        overwritePSBs = true;
                    }
                }
                if (!overwritePSBs) {
                    placeLinkedFile(smartPSB);
                } else {
                    var firstExr = Folder(subDirs[indexMain].dir).getFiles("*.exr");
                    if (firstExr.length == 0) continue;
                    var doc_Linked = open(firstExr[0]);
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
                            
                            // if (skipCrypto) continue;
                            if (itemName.toLowerCase().indexOf("cryptomatte_material") != -1 && skipCryptoMat) continue;
                            if (itemName.toLowerCase().indexOf("cryptomatte_object") != -1 && skipCryptoMesh) continue;

                            var cryptoPSB = elementFolders[indexEl].getFiles("*.psb");
                            if (cryptoPSB[0] == undefined) continue;
                            activeDocument = superDoc;
                            placeLinkedFile(cryptoPSB[0]);
                            var placedFile = activeDocument.activeLayer;
                            try {
                                activeDocument.activeLayer = activeDocument.layerSets.getByName("Crypto Mattes");
                            } catch(e) {
                                activeDocument.layerSets.add();
                                activeDocument.activeLayer.name = "Crypto Mattes";
                                activeDocument.activeLayer.move(activeDocument.layers[0], ElementPlacement.PLACEBEFORE);
                            }
                            placedFile.move(activeDocument.activeLayer, ElementPlacement.INSIDE);
                            activeDocument.activeLayer = placedFile;
                            convertPlacedToLayers();
                            if (itemName.toLowerCase().indexOf("cryptomatte_material") != -1) {
                                activeDocument.activeLayer.name = "Crypto Material";
                                skipCryptoMat = true;
                            }
                            if (itemName.toLowerCase().indexOf("cryptomatte_object") != -1) {
                                activeDocument.activeLayer.name = "Crypto Object";
                                skipCryptoMesh = true;
                            }
                            try { activeDocument.activeLayer.blendMode = BlendMode.PASSTHROUGH; } catch(e) {}

                            activeDocument = doc_Linked;

                            // if (skipCryptoMat && skipCryptoMesh) skipCrypto = true;

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

                                try {
                                    open(exrFileList[indexExr]);
                                    activeDocument.selection.selectAll();
                                    activeDocument.selection.copy();
                                    activeDocument.close(SaveOptions.DONOTSAVECHANGES);

                                    activeDocument.paste();
                                    var lyr = activeDocument.activeLayer;
                                    lyr.name = String(cleanFolderStr(exrFileList[indexExr])).substring(String(cleanFolderStr(exrFileList[indexExr])).lastIndexOf("\\") + 1, String(cleanFolderStr(exrFileList[indexExr])).lastIndexOf("."));
                                    lyr.move(activeDocument.layers[0], ElementPlacement.PLACEBEFORE);

                                    selectRgbChannel();
                                    try {
                                        if (activeDocument.selection.bounds == undefined) throw 0;
                                        try {
                                            contrastSelection();
                                            if (activeDocument.selection.bounds[0].value == 0 && activeDocument.selection.bounds[2] == activeDocument.width) activeDocument.selection.invert();
                                            var ptLeft = activeDocument.selection.bounds[0].as('pt');
                                            var ptTop = activeDocument.selection.bounds[1].as('pt');
                                            var ptRight = activeDocument.selection.bounds[2].as('pt');
                                            var ptBottom = activeDocument.selection.bounds[3].as('pt');
                                            makePointSelection([[ptLeft, ptTop],[ptRight, ptTop],[ptRight, ptBottom], [ptLeft, ptBottom]], 0, SelectionType.REPLACE);
                                            activeDocument.selection.invert();
                                            try { activeDocument.selection.clear(); } catch(e) {}
                                        } catch(e) {}
                                        activeDocument.selection.deselect();
                                        
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
                                        } else if (lyr.name.toLowerCase().indexOf("puzzle") != -1) {
                                            activeDocument.activeLayer = lyr;
                                            fillSolidColour(0, 0, 0);
                                            activeDocument.activeLayer.move(lyr, ElementPlacement.PLACEAFTER);
                                            activeDocument.selection.load(activeDocument.channels.getByName("Red")); // Making a selection of the RED channel
                                            activeDocument.activeLayer.remove();
                                            activeDocument.activeLayer = lyr;
                                            makeLayerMask();
                                            selectRgb();
                                            activeDocument.selection.selectAll();
                                            activeDocument.selection.clear();
                                            activeDocument.selection.deselect();
                                        } else {
                                            lyr.move(activeDocument.activeLayer.layers[0], ElementPlacement.PLACEBEFORE);
                                            lyr.visible = false;
                                        }
                                    } catch(e) {
                                        lyr.remove();
                                    }
                                } catch(e) {
                                    // Fix error log
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
                    lyr_Ref.visible = false;

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
                        } catch(e) {
                            try {
                                activeDocument.activeLayer = lyr_Ref;
                                layerSelection();
                                if (activeDocument.selection.bounds[0].value != 0) {
                                    activeDocument.activeLayer = grp_Car;
                                    makeLayerMask();
                                }
                            } catch(e) {}
                        }
                        // No mask for the car
                    }
                    activeDocument.selection.deselect();

                    lyr_Ref.remove();
                    removeEmptyChannels();
                
                    var savePath = Folder(psbDir + "/" + angleName + "_LinkedFiles");
                    if (!savePath.exists) savePath.create();
                    savePSB(File(savePath + "/" + subDirs[indexMain].name + ".psb"));
                    activeDocument.close(SaveOptions.DONOTSAVECHANGES);
                    
                    placeLinkedFile(File(savePath + "/" + subDirs[indexMain].name + ".psb"));
                }
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
                // for (i_carLyrs = 0; i_carLyrs < activeDocument.activeLayer.layers.length; i_carLyrs++) {
                //     activeDocument.activeLayer = activeDocument.activeLayer.layers[i_carLyrs];
                //     layerSelection();
                //     // Find if any layer has better mask
                //     activeDocument.activeLayer = activeDocument.activeLayer.parent;
                // }

                app.purge(PurgeTarget.ALLCACHES);

            } else {

                try {
                    activeDocument.activeLayer = activeDocument.layerSets.getByName(subDirs[indexMain].category);
                } catch(e) {
                    activeDocument.layerSets.add();
                    activeDocument.activeLayer.name = subDirs[indexMain].category;
                }
                var lyr_Grp = activeDocument.activeLayer;

                var exrList = Folder(subDirs[indexMain].dir).getFiles("*.exr");
                if (firstExr.length == 0) continue;
                open(exrList[0]);

                activeDocument.selection.selectAll();
                activeDocument.selection.copy();
                activeDocument.close(SaveOptions.DONOTSAVECHANGES);

                pasteInPlace();
                activeDocument.activeLayer.name = subDirs[indexMain].name;

                switch(subDirs[indexMain].category) {
                    case "Windows": activeDocument.activeLayer.blendMode = BlendMode.SCREEN; break;
                    case "Shadow": lyr_Grp.move(activeDocument.layers[activeDocument.layers.length - 1], ElementPlacement.PLACEAFTER); break;
                    default:
                }

            }
        }

        try {
            lyr_Dummy.remove();
        } catch(e) {}

        fillSolidColour(255, 255, 255);
        activeDocument.activeLayer.move(activeDocument.layers[activeDocument.layers.length - 1], ElementPlacement.PLACEAFTER);
        activeDocument.activeLayer.name = "Background";
        selectMask(activeDocument.activeLayer.name);
        deleteMask();
        
        savePSB(File(psbDir + "/" + activeDocument.name));
    
    } else {
        var cryptoMat = false;
        var cryptoMesh = false;
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
                                    savePSB(File(String(exrFileList[i_exr]).substring(0, String(exrFileList[i_exr]).lastIndexOf(".exr"))) + ".psb");
                                    activeDocument.close(SaveOptions.DONOTSAVECHANGES);
                                }
                            } else {
                                if (itemName.toLowerCase().indexOf("material")) {
                                    cryptoMat = true;
                                } else {
                                    cryptoMesh = true;
                                }
                            }
                        }
                    }
                }
                if (cryptoMat && cryptoMesh) break;
            }
        } catch(e) {
            alert("Failed to create crypto masks" + "\n" + e)
        }
    }
}

// FUNCTIONS

function getSubDirs() {
    var tempList = getOnlyFolders(mainDir, false).sort();
    var psbDir_clean = cleanFolderStr(psbDir, true);
    for (i_list = 0; i_list < tempList.length; i_list++) {
        var dir = cleanFolderStr(tempList[i_list], true);
        if (dir == psbDir_clean) continue;
        var itemName = String(tempList[i_list]).substring(String(tempList[i_list]).lastIndexOf("/") + 1, String(tempList[i_list]).length);
        if (itemName.toLowerCase().indexOf("interior") != -1) {
            var category = "Interior";
        } else if (itemName.toLowerCase().indexOf("window") != -1) {
            var category = "Windows";
        } else if (itemName.toLowerCase().indexOf("wiper") != -1) {
            var category = "Wipers";
        } else if (itemName.toLowerCase().indexOf("shadow") != -1) {
            var category = "Shadow";
        } else {
            var category = "Empty";
        }
        subDirs.push({
            "dir": dir,
            "name": itemName,
            "category": category,
            "note": "",
            "use": true
        })
    }
}

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

function layerSelection() {
    var idset = stringIDToTypeID( "set" );
        var desc1345 = new ActionDescriptor();
        var idnull = stringIDToTypeID( "null" );
            var ref1144 = new ActionReference();
            var idchannel = stringIDToTypeID( "channel" );
            var idselection = stringIDToTypeID( "selection" );
            ref1144.putProperty( idchannel, idselection );
        desc1345.putReference( idnull, ref1144 );
        var idto = stringIDToTypeID( "to" );
            var ref1145 = new ActionReference();
            var idchannel = stringIDToTypeID( "channel" );
            var idchannel = stringIDToTypeID( "channel" );
            var idtransparencyEnum = stringIDToTypeID( "transparencyEnum" );
            ref1145.putEnumerated( idchannel, idchannel, idtransparencyEnum );
        desc1345.putReference( idto, ref1145 );
    executeAction( idset, desc1345, DialogModes.NO );
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

function deleteMask() {
    var iddelete = stringIDToTypeID( "delete" );
        var desc498 = new ActionDescriptor();
        var idnull = stringIDToTypeID( "null" );
            var ref432 = new ActionReference();
            var idchannel = stringIDToTypeID( "channel" );
            var idordinal = stringIDToTypeID( "ordinal" );
            var idtargetEnum = stringIDToTypeID( "targetEnum" );
            ref432.putEnumerated( idchannel, idordinal, idtargetEnum );
        desc498.putReference( idnull, ref432 );
    executeAction( iddelete, desc498, DialogModes.NO );
}

function selectMask() {
    var idselect = stringIDToTypeID( "select" );
        var desc37 = new ActionDescriptor();
        var idnull = stringIDToTypeID( "null" );
            var ref16 = new ActionReference();
            var idchannel = stringIDToTypeID( "channel" );
            var idchannel = stringIDToTypeID( "channel" );
            var idmask = stringIDToTypeID( "mask" );
            ref16.putEnumerated( idchannel, idchannel, idmask );
        desc37.putReference( idnull, ref16 );
        var idmakeVisible = stringIDToTypeID( "makeVisible" );
        desc37.putBoolean( idmakeVisible, false );
    executeAction( idselect, desc37, DialogModes.NO );
}

function makePointSelection(pointArray, feather, selectionType) {
    var currentRulerUnits = app.preferences.rulerUnits;
    var currentTypeUnits = app.preferences.typeUnits;
    var currentDisplayDialogs = app.displayDialogs;

    app.preferences.rulerUnits = Units.POINTS;
    app.preferences.typeUnits = TypeUnits.POINTS;
    app.displayDialogs = DialogModes.NO;

    var lineArray = [];
    for (pointIndex = 0; pointIndex < pointArray.length; pointIndex++) {
        lineArray[pointIndex] = new PathPointInfo;
        lineArray[pointIndex].kind = PointKind.CORNERPOINT;
        lineArray[pointIndex].anchor = pointArray[pointIndex];
        lineArray[pointIndex].leftDirection = lineArray[pointIndex].anchor;
        lineArray[pointIndex].rightDirection = lineArray[pointIndex].anchor;
    }
    var lineSubPathArray = new Array();
        lineSubPathArray[0] = new SubPathInfo();
        lineSubPathArray[0].operation = ShapeOperation.SHAPEXOR;
        lineSubPathArray[0].closed = false;
        lineSubPathArray[0].entireSubPath = lineArray;

    var tempPathItem = activeDocument.pathItems.add("Temp path", lineSubPathArray);
    tempPathItem.makeSelection(feather, true, selectionType);
    tempPathItem.remove();

    app.preferences.rulerUnits = currentRulerUnits;
    app.preferences.typeUnits = currentTypeUnits;
    app.displayDialogs = currentDisplayDialogs;
}

function selectRgbChannel() {
    try {
        // make temp black alpha channel
        var d = new ActionDescriptor();
        var d1 = new ActionDescriptor();
            d1.putEnumerated(stringIDToTypeID("colorIndicates"), stringIDToTypeID("maskIndicator"), stringIDToTypeID("maskedAreas"));
        var d2 = new ActionDescriptor();
            d2.putDouble(stringIDToTypeID("red"), 255);
            d2.putDouble(stringIDToTypeID("green"), 0);
            d2.putDouble(stringIDToTypeID("blue"), 0);
            d1.putObject(stringIDToTypeID("color"), stringIDToTypeID("RGBColor"), d2);
            d1.putInteger(stringIDToTypeID("opacity"), 50);
            d.putObject(stringIDToTypeID("new"), stringIDToTypeID("channel"), d1);
        executeAction(stringIDToTypeID("make"), d, DialogModes.NO);
    
        // apply RGB to alpha channel
        var d = new ActionDescriptor();
        var d1 = new ActionDescriptor();
        var r = new ActionReference();
            r.putEnumerated(stringIDToTypeID("channel"), stringIDToTypeID("channel"), stringIDToTypeID("RGB"));
            r.putEnumerated(stringIDToTypeID("layer"), stringIDToTypeID("ordinal"), stringIDToTypeID("merged"));
            d1.putReference(stringIDToTypeID("to"), r);
            d1.putBoolean(stringIDToTypeID("preserveTransparency"), true);
            d.putObject(stringIDToTypeID("with"), stringIDToTypeID("calculation"), d1);
        executeAction(stringIDToTypeID("applyImageEvent"), d, DialogModes.NO);
    
        // make selection from alpha channel
        var d = new ActionDescriptor();
        var r = new ActionReference();
            r.putProperty(stringIDToTypeID("channel"), stringIDToTypeID("selection"));
            d.putReference(stringIDToTypeID("null"), r);
        var r1 = new ActionReference();
            r1.putEnumerated(stringIDToTypeID("channel"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
            d.putReference(stringIDToTypeID("to"), r1);
            executeAction(stringIDToTypeID("set"), d, DialogModes.NO);
        var d = new ActionDescriptor();
    
        // delete temp alpha channel
        var r = new ActionReference();
            r.putEnumerated(stringIDToTypeID("channel"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
            d.putReference(stringIDToTypeID("null"), r);
            executeAction(stringIDToTypeID("delete"), d, DialogModes.NO);
        }
    catch (e) {}
}

function contrastSelection() {
    var idsmartBrushWorkspace = stringIDToTypeID( "smartBrushWorkspace" );
        var desc121 = new ActionDescriptor();
        var idsmartBrushRadius = stringIDToTypeID( "smartBrushRadius" );
        desc121.putInteger( idsmartBrushRadius, 0 );
        var idsmartBrushSmooth = stringIDToTypeID( "smartBrushSmooth" );
        desc121.putInteger( idsmartBrushSmooth, 0 );
        var idsmartBrushFeather = stringIDToTypeID( "smartBrushFeather" );
        var idpixelsUnit = stringIDToTypeID( "pixelsUnit" );
        desc121.putUnitDouble( idsmartBrushFeather, idpixelsUnit, 0.000000 );
        var idsmartBrushContrast = stringIDToTypeID( "smartBrushContrast" );
        var idpercentUnit = stringIDToTypeID( "percentUnit" );
        desc121.putUnitDouble( idsmartBrushContrast, idpercentUnit, 100.000000 );
        var idsmartBrushShiftEdge = stringIDToTypeID( "smartBrushShiftEdge" );
        var idpercentUnit = stringIDToTypeID( "percentUnit" );
        desc121.putUnitDouble( idsmartBrushShiftEdge, idpercentUnit, 0.000000 );
        var idsampleAllLayers = stringIDToTypeID( "sampleAllLayers" );
        desc121.putBoolean( idsampleAllLayers, true );
        var idsmartBrushUseSmartRadius = stringIDToTypeID( "smartBrushUseSmartRadius" );
        desc121.putBoolean( idsmartBrushUseSmartRadius, false );
        var idsmartBrushDecontaminate = stringIDToTypeID( "smartBrushDecontaminate" );
        desc121.putBoolean( idsmartBrushDecontaminate, false );
        var idsmartBrushDeconAmount = stringIDToTypeID( "smartBrushDeconAmount" );
        var idpercentUnit = stringIDToTypeID( "percentUnit" );
        desc121.putUnitDouble( idsmartBrushDeconAmount, idpercentUnit, 100.000000 );
        var idrefineEdgeOutput = stringIDToTypeID( "refineEdgeOutput" );
        var idrefineEdgeOutput = stringIDToTypeID( "refineEdgeOutput" );
        var idselectionOutputToSelection = stringIDToTypeID( "selectionOutputToSelection" );
        desc121.putEnumerated( idrefineEdgeOutput, idrefineEdgeOutput, idselectionOutputToSelection );
    executeAction( idsmartBrushWorkspace, desc121, DialogModes.NO );
}

function fillSolidColour(R, G, B) {
    var id117 = charIDToTypeID( "Mk  " );
    var desc25 = new ActionDescriptor();
    var id118 = charIDToTypeID( "null" );
    var ref13 = new ActionReference();
    var id119 = stringIDToTypeID( "contentLayer" );
    ref13.putClass( id119 );
    desc25.putReference( id118, ref13 );
    var id120 = charIDToTypeID( "Usng" );
    var desc26 = new ActionDescriptor();
    var id121 = charIDToTypeID( "Type" );
    var desc27 = new ActionDescriptor();
    var id122 = charIDToTypeID( "Clr " );
    var desc28 = new ActionDescriptor();
    var id123 = charIDToTypeID( "Rd  " );
    desc28.putDouble( id123, R ); //red
    var id124 = charIDToTypeID( "Grn " );
    desc28.putDouble( id124, G ); //green
    var id125 = charIDToTypeID( "Bl  " );
    desc28.putDouble( id125, B ); //blue
    var id126 = charIDToTypeID( "RGBC" );
    desc27.putObject( id122, id126, desc28 );
    var id127 = stringIDToTypeID( "solidColorLayer" );
    desc26.putObject( id121, id127, desc27 );
    var id128 = stringIDToTypeID( "contentLayer" );
    desc25.putObject( id120, id128, desc26 );
    executeAction( id117, desc25, DialogModes.NO );
    
    return activeDocument.activeLayer;
}

function selectRgb() {
    var id248 = charIDToTypeID( "slct" );
        var desc48 = new ActionDescriptor();
        var id249 = charIDToTypeID( "null" );
        var ref36 = new ActionReference();
        var id250 = charIDToTypeID( "Chnl" );
        var id251 = charIDToTypeID( "Chnl" );
        var id252 = charIDToTypeID( "RGB " );
        ref36.putEnumerated( id250, id251, id252 );
        desc48.putReference( id249, ref36 );
        var id253 = charIDToTypeID( "MkVs" );
        desc48.putBoolean( id253, false );
	executeAction( id248, desc48, DialogModes.NO );
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

function removeEmptyChannels() {
    for (i_alpha = 3; i_alpha < activeDocument.channels.length; i_alpha++) {

        activeDocument.activeChannels = [activeDocument.channels[i_alpha]];
        var visibleStatus = activeDocument.channels[i_alpha].visible;
        activeDocument.channels[i_alpha].visible = true;
        var emptyAlpha = true;
        var histSection = activeDocument.channels[i_alpha].histogram;
        for (i_hist = 1; i_hist < histSection.length - 1; i_hist++) {
            if (histSection[i_hist] != 0) {
                emptyAlpha = false;
                break;
            }
        }
        activeDocument.channels[i_alpha].visible = visibleStatus;
        if (histSection[activeDocument.channels[i_alpha].histogram.length - 1] == 51195456 && emptyAlpha) activeDocument.channels[i_alpha].remove(); // Is black
        if (histSection[0] == 51195456 && emptyAlpha) activeDocument.channels[i_alpha].remove(); // Is white

        activeDocument.activeChannels = [activeDocument.channels[0], activeDocument.channels[1], activeDocument.channels[2]];

    }
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