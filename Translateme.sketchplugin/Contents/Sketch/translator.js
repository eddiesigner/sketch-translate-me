@import "common.js";

function Translator () {}

Translator.prototype.languageLabels = [
  'Afrikaans',
  'Albanian',
  'Amharic',
  'Arabic',
  'Armenian',
  'Azeerbaijani',
  'Basque',
  'Belarusian',
  'Bengali',
  'Bosnian',
  'Bulgarian',
  'Catalan',
  'Cebuano',
  'Chinese (Simplified)',
  'Chinese (Traditional)',
  'Corsican',
  'Croatian',
  'Czech',
  'Danish',
  'Dutch',
  'English',
  'Esperanto',
  'Estonian',
  'Finnish',
  'French',
  'Frisian',
  'Galician',
  'Georgian',
  'German',
  'Greek',
  'Gujarati',
  'Haitian Creole',
  'Hausa',
  'Hawaiian',
  'Hebrew',
  'Hindi',
  'Hmong',
  'Hungarian',
  'Icelandic',
  'Igbo',
  'Indonesian',
  'Irish',
  'Italian',
  'Japanese',
  'Javanese',
  'Kannada',
  'Kazakh',
  'Khmer',
  'Korean',
  'Kurdish',
  'Kyrgyz',
  'Lao',
  'Latin',
  'Latvian',
  'Lithuanian',
  'Luxembourgish',
  'Macedonian',
  'Malagasy',
  'Malay',
  'Malayalam',
  'Maltese',
  'Maori',
  'Marathi',
  'Mongolian',
  'Myanmar (Burmese)',
  'Nepali',
  'Norwegian',
  'Nyanja (Chichewa)',
  'Pashto',
  'Persian',
  'Polish',
  'Portuguese (Portugal, Brazil)',
  'Punjabi',
  'Romanian',
  'Russian',
  'Samoan',
  'Scots Gaelic',
  'Serbian',
  'Sesotho',
  'Shona',
  'Sindhi',
  'Sinhala (Sinhalese)',
  'Slovak',
  'Slovenian',
  'Somali',
  'Spanish',
  'Sundanese',
  'Swahili',
  'Swedish',
  'Tagalog (Filipino)',
  'Tajik',
  'Tamil',
  'Telugu',
  'Thai',
  'Turkish',
  'Ukrainian',
  'Urdu',
  'Uzbek',
  'Vietnamese',
  'Welsh',
  'Xhosa',
  'Yiddish',
  'Yoruba',
  'Zulu'
];


Translator.prototype.languageCodes = [
  'af',
  'sq',
  'am',
  'ar',
  'hy',
  'az',
  'eu',
  'be',
  'bn',
  'bs',
  'bg',
  'ca',
  'ceb',
  'zh-CN',
  'zh-TW',
  'co',
  'hr',
  'cs',
  'da',
  'nl',
  'en',
  'eo',
  'et',
  'fi',
  'fr',
  'fy',
  'gl',
  'ka',
  'de',
  'el',
  'gu',
  'ht',
  'ha',
  'haw',
  'iw',
  'hi',
  'hmn',
  'hu',
  'is',
  'ig',
  'id',
  'ga',
  'it',
  'ja',
  'jw',
  'kn',
  'kk',
  'km',
  'ko',
  'ku',
  'ky',
  'lo',
  'la',
  'lv',
  'lt',
  'lb',
  'mk',
  'mg',
  'ms',
  'ml',
  'mt',
  'mi',
  'mr',
  'mn',
  'my',
  'ne',
  'no',
  'ny',
  'ps',
  'fa',
  'pl',
  'pt',
  'pa',
  'ro',
  'ru',
  'sm',
  'gd',
  'sr',
  'st',
  'sn',
  'sd',
  'si',
  'sk',
  'sl',
  'so',
  'es',
  'su',
  'sw',
  'sv',
  'tl',
  'tg',
  'ta',
  'te',
  'th',
  'tr',
  'uk',
  'ur',
  'uz',
  'vi',
  'cy',
  'xh',
  'yi',
  'yo',
  'zu'
];


Translator.prototype.translateSingleText = function (context) {
  if (!checkCount(context)) {
    return;
  } else {
    if (!checkTextLayerType(context)) {
      return;
    } else {
      var dialog = this.buildDialog(context);
      var languageIndex = handleAlertResponse(dialog, dialog.runModal());

      var textLayer = context.selection[0];
      var baseLanguage = detectLenguage(textLayer.stringValue());
      var toLanguage = this.languageCodes[languageIndex];

      if (baseLanguage == toLanguage) {
        context.document.showMessage('Please select a different language');
      }

      textLayer.setStringValue(getSingleTranslation(textLayer.stringValue(), baseLanguage, toLanguage));
    }
  }
}

Translator.prototype.translateArtboard = function (context) {
  if (!checkCount(context)) {
    return;
  } else {
    if (!checkArtboardLayerType(context)) {
      return;
    } else {
      var dialog = this.buildDialog(context);
      var languageIndex = handleAlertResponse(dialog, dialog.runModal());

      var artboardCopy = context.selection[0].duplicate();
      artboardCopy.frame().x = artboardCopy.frame().x() + context.selection[0].frame().width() + 100;

      if (MSApplicationMetadata.metadata().appVersion > 45) {
        artboardCopy.select_byExpandingSelection(true, false);
      } else {
        artboardCopy.select_byExtendingSelection(true, false);
      }

      var textLayers = selectLayersOfTypeInContainer(context.document, "MSTextLayer", artboardCopy);
      var toLanguage = this.languageCodes[languageIndex];

      for (var x = 0, l = textLayers.length; x < l; x++) {
        var textLayer = textLayers[x];
        var baseLanguage = detectLenguage(textLayer.stringValue());
        textLayer.setStringValue(getSingleTranslation(textLayer.stringValue(), baseLanguage, toLanguage));
      }
    }
  }
}


Translator.prototype.translateEverything = function (context) {
  var doc = context.document,
      initialPage = [doc currentPage],
      artboards = [initialPage artboards];

  if (artboards.length === 0) {
    return;
  }

  var dialog = this.buildDialog(context);
  var languageIndex = handleAlertResponse(dialog, dialog.runModal());

  var newPage = duplicatePage(context, this.languageLabels[languageIndex]);
  var artboards = selectLayersOfTypeInContainer(context.document, "MSArtboardGroup", newPage);

  for (var x = artboards.length - 1; x >= 0; x--) {
    var artboardCopy = artboards[x];

    var textLayers = selectLayersOfTypeInContainer(context.document, "MSTextLayer", artboardCopy);
    var toLanguage = this.languageCodes[languageIndex];

    for (var x = 0, l = textLayers.length; x < l; x++) {
      var textLayer = textLayers[x];
      var baseLanguage = detectLenguage(textLayer.stringValue());
      textLayer.setStringValue(getSingleTranslation(textLayer.stringValue(), baseLanguage, toLanguage));
    }
  }
}


Translator.prototype.buildDialog = function (context) {
  var dialogWindow = COSAlertWindow.new();

  dialogWindow.setMessageText('Translate Generator');
  dialogWindow.setInformativeText('Please select the language in which you want to translate the text:');

  var languageSelect = createSelect(this.languageLabels);
  dialogWindow.addAccessoryView(languageSelect);

  dialogWindow.addButtonWithTitle('OK');
  dialogWindow.addButtonWithTitle('Cancel');

  dialogWindow.setIcon(NSImage.alloc().initByReferencingFile(context.plugin.urlForResourceNamed("logo@2x.png").path()));

  return dialogWindow;
}