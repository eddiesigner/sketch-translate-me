var pluginIdentifier = "io.craftbot.sketch.translate-me";
var app              = NSApplication.sharedApplication();


function checkCount (context) {
  if (context.selection.count() != 1) {
    app.displayDialog_withTitle("You have to select something.", "Wrong shape layer selection");
    return false;
  }

  return true;
}


function checkTextLayerType (context) {
  var layer = context.selection[0];

  if ([layer class] != MSTextLayer) {
    app.displayDialog_withTitle("Your selection was a “" + [layer name] + "”, that is not a text layer. Please select a text layer.", "Text layer only");
    return false;
  }

  return true;
}


function duplicatePage (context, language) {
  var doc = context.document;
  var page = [doc currentPage];
  var newPage = [page copy];

  newPage.setName([page name] + " " + language);

  [[doc documentData] addPage:newPage];
  [doc setCurrentPage:newPage];

  return newPage;
}


function checkArtboardLayerType (context) {
  var layer = context.selection[0];

  if ([layer class] != MSArtboardGroup) {
    app.displayDialog_withTitle("Your selection was a “" + [layer name] + "”, that is not an artboard. Please select an artboard.", "Artboard only");
    return false;
  }

  return true;
}


function selectLayersOfTypeInContainer (doc, layerType, containerLayer) {
  var scope = (typeof containerLayer !== 'undefined') ? [containerLayer children] : [[doc currentPage] children];
  var predicate = NSPredicate.predicateWithFormat("(className == %@)", layerType);
  var layers = [scope filteredArrayUsingPredicate:predicate];
  var page = (layerType === 'MSArtboardGroup') ? containerLayer : [doc currentPage];

  if (page.deselectAllLayers) {
    page.deselectAllLayers();
  } else {
    page.changeSelectionBySelectingLayers_([]);
  }

  var loop = [layers objectEnumerator];
  var layers = [];
  var layer;

  while (layer = [loop nextObject]) {
    layers.push(layer);

    if (MSApplicationMetadata.metadata().appVersion > 45) {
      layer.select_byExpandingSelection(true, true);
    } else {
      layer.select_byExtendingSelection(true, true);
    }
  }

  return layers;
}


function handleAlertResponse (dialog, responseCode) {
  if (responseCode == "1000") {
    return dialog.viewAtIndex(0).indexOfSelectedItem();
  } else {
    return null;
  }
}


function createSelect (options) {
  var select = NSPopUpButton.alloc().initWithFrame(NSMakeRect(0, 0, 200, 28));

  select.addItemsWithTitles(options);
  select.selectItemAtIndex(0);

  return select;
}


function detectLenguage (text) {
  var escapedText = text.replace('"', '\"');
  var data = JSON.stringify({q:escapedText});

  var languageDetected = networkRequest(["-X", "POST", "https://translation.googleapis.com/language/translate/v2/detect?key=AIzaSyBOxBWoT-FUavHsdaTO8yegsWnwMi-2Jwc", "-H", "Content-Type: application/json; charset=utf-8", "-d", data]);

  return languageDetected.data.detections[0][0].language;
}


function getSingleTranslation (text, baseLanguage, toLanguage) {
  var escapedText = text.replace('"', '\"');
  var data = JSON.stringify({q:escapedText, source: baseLanguage, target: toLanguage});

  var singleTranslation = networkRequest(["-X", "POST", "https://translation.googleapis.com/language/translate/v2?key=AIzaSyBOxBWoT-FUavHsdaTO8yegsWnwMi-2Jwc", "-H", "Content-Type: application/json; charset=utf-8", "-d", data]);

  return singleTranslation.data.translations[0].translatedText.replace(/&quot;/g, '"');
}


function networkRequest (args) {
  var task = NSTask.alloc().init();
  task.setLaunchPath("/usr/bin/curl");
  task.setArguments(args);

  var outputPipe = [NSPipe pipe];
  [task setStandardOutput:outputPipe];
  task.launch();

  var responseData = [[outputPipe fileHandleForReading] readDataToEndOfFile];
  var responseString = [[[NSString alloc] initWithData:responseData encoding:NSUTF8StringEncoding]];
  var parsed = tryParseJSON(responseString);

  if (!parsed) {
    log("Error invoking curl");
    log("args:");
    log(args);
    log("responseString");
    log(responseString);
    throw "Error communicating with server"
  }

  return parsed;
}


function tryParseJSON (jsonString){
  try {
    var o = JSON.parse(jsonString);

    if (o && typeof o === "object" && o !== null) {
      return o;
    }
  }
  catch (e) { }

  return false;
}