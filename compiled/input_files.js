(function() {
  var delay, emitBlobChangedEvent, makeImageBlobAndAttributes, makeMiniLockFile, makeTextBlobAndAttributes, placeCursorAtEndOfTextInput, _ref;

  $(document).on("change:selected_input_file", "#input_files", function(event, selectedElement) {
    $('#input_files').toggleClass("text_input_is_selected", $(selectedElement).is(".text.input"));
    return $('#input_files').toggleClass("image_input_is_selected", $(selectedElement).is(".image.input"));
  });

  $(document).ready(function(event) {
    return makeTextBlobAndAttributes(function(blob, attributes) {
      return emitBlobChangedEvent("#input_files div.unencrypted.text.file.input", [blob, attributes]);
    });
  });

  $(document).on("focusin", "#input_files div.unencrypted.text.file.input", function(event) {
    var inputElement;
    inputElement = event.currentTarget;
    if ($(inputElement).is(".selected")) {
      return;
    }
    $("#input_files div.unencrypted.file.input").removeClass("selected");
    $(inputElement).addClass("selected");
    $("#input_files").trigger("change:selected_input_file", [inputElement]);
    return $(inputElement).one("transitionend", function(event) {
      return makeTextBlobAndAttributes(function(blob, attributes) {
        return emitBlobChangedEvent(inputElement, [blob, attributes]);
      });
    });
  });

  $(document).on("mousedown", "#input_files div.unencrypted.image.file.input", function(event) {
    var inputElement;
    inputElement = event.currentTarget;
    if ($(inputElement).is(".selected, .blank")) {
      return;
    }
    $("#input_files div.unencrypted.file.input").removeClass("selected");
    $(inputElement).addClass("selected");
    $("#input_files").trigger("change:selected_input_file", [inputElement]);
    return $(inputElement).one("transitionend", function(event) {
      return makeImageBlobAndAttributes(function(blob, attributes) {
        return emitBlobChangedEvent(inputElement, [blob, attributes]);
      });
    });
  });

  $(document).on("camera:image_is_ready", "#input_files div.unencrypted.image.file.input", function(event) {
    var inputElement;
    inputElement = event.currentTarget;
    if ($(inputElement).is(".selected")) {
      throw "What the fuckup";
    }
    $(inputElement).removeClass("blank");
    $("#input_files div.unencrypted.file.input").removeClass("selected");
    $(inputElement).addClass("selected");
    $("#input_files").trigger("change:selected_input_file", [inputElement]);
    return $(inputElement).one("transitionend", function(event) {
      return makeImageBlobAndAttributes(function(blob, attributes) {
        return emitBlobChangedEvent(inputElement, [blob, attributes]);
      });
    });
  });

  $(document).on("focusin", "#input_files div.unencrypted.image.file.input", function(event) {
    var inputElement;
    inputElement = event.currentTarget;
    if ($(inputElement).is(".blank, .selected")) {
      return;
    }
    $("#input_files div.unencrypted.file.input").removeClass("selected");
    $(inputElement).addClass("selected");
    return $("#input_files").trigger("change:selected_input_file", [inputElement]);
  });

  $(document).on("input", "#input_files div.unencrypted.image.file.input [name=type]", function(event) {
    if ($("#input_files div.unencrypted.image.file.input").is(".blank")) {
      return;
    }
    return makeImageBlobAndAttributes(function(blob, attributes) {
      return emitBlobChangedEvent(event.currentTarget, [blob, attributes]);
    });
  });

  $(document).on("camera:closed", "#input_files div.unencrypted.image.file.input", function(event) {
    var inputElement;
    inputElement = event.currentTarget;
    $(event.currentTarget).addClass("blank");
    $("#input_files div.unencrypted.file.input").removeClass("selected");
    $("#input_files div.unencrypted.text.input").addClass("selected");
    $("#input_files").trigger("change:selected_input_file", ["#input_files div.unencrypted.text.input"]);
    return $("#input_files div.unencrypted.text.input").one("transitionend", function(event) {
      return makeTextBlobAndAttributes(function(blob, attributes) {
        return emitBlobChangedEvent(inputElement, [blob, attributes]);
      });
    });
  });

  $(document).on("input", "#input_files div.unencrypted.text.input", function(event) {
    return makeTextBlobAndAttributes.debounced(function(blob, attributes) {
      return emitBlobChangedEvent(event.currentTarget, [blob, attributes]);
    });
  });

  $(document).on("input", "#input_files div.encrypted.file.input [name=keys]", function(event) {
    return makeMiniLockFile(function(encrypted) {
      return emitBlobChangedEvent(event.currentTarget, [encrypted.data, encrypted]);
    });
  });

  $(document).on("input", "#input_files div.encrypted.file.input [name=name]", function(event) {
    return makeMiniLockFile.debounced(function(encrypted) {
      return emitBlobChangedEvent(event.currentTarget, [encrypted.data, encrypted]);
    });
  });

  $(document).on("change", "#input_files div.encrypted.file.input [type=checkbox]", function(event) {
    return makeMiniLockFile(function(encrypted) {
      return emitBlobChangedEvent(event.currentTarget, [encrypted.data, encrypted]);
    });
  });

  $(document).on("change:blob", "#input_files div.unencrypted.file.input", function(event, blob, attributes) {
    return makeMiniLockFile(blob, function(encrypted) {
      return emitBlobChangedEvent("#input_files div.encrypted.file.input", [encrypted.data, encrypted]);
    });
  });

  makeTextBlobAndAttributes = function(done) {
    var attributes, blob, container;
    container = "#input_files div.unencrypted.text.input";
    blob = new Blob([$("" + container + " textarea").val()]);
    attributes = {
      name: $("" + container + " [name=name]").val(),
      type: "text/plain"
    };
    return done(blob, attributes);
  };

  makeImageBlobAndAttributes = function(done) {
    return window.camera.readImageBlob(function(blob) {
      return done(blob, {
        type: blob.type
      });
    });
  };

  makeMiniLockFile = function(blob, done) {
    var encryptedFileInput, unencryptedFileInput;
    if (arguments.length === 2) {
      makeMiniLockFile.cachedInputBlob = blob;
    } else {
      done = arguments[0];
      blob = makeMiniLockFile.cachedInputBlob;
    }
    encryptedFileInput = '#input_files div.encrypted.file.input';
    unencryptedFileInput = "#input_files div.unencrypted.file.input.selected";
    return console.info(miniLockLib.encrypt({
      version: Number($("" + encryptedFileInput + " [name=version]").val()),
      data: blob,
      name: $("" + unencryptedFileInput + " [name=name]").val(),
      type: $("" + unencryptedFileInput + " [name=type]").val(),
      keys: window.characters[$("" + encryptedFileInput + " [name=keys]").val()],
      miniLockIDs: $("" + encryptedFileInput + " [name=minilock_ids]:checked").map(function(i, el) {
        return el.value;
      }).toArray(),
      callback: function(error, encrypted) {
        if (encrypted && error === void 0) {
          return done(encrypted);
        } else {
          return console.error("makeEncryptedBlobAndAttributes", error);
        }
      }
    }));
  };

  makeMiniLockFile.debounced = _.debounce(makeMiniLockFile, 300);

  makeTextBlobAndAttributes.debounced = _.debounce(makeTextBlobAndAttributes, 300);

  emitBlobChangedEvent = function(element, params) {
    return $(element).trigger("change:blob", params);
  };

  placeCursorAtEndOfTextInput = function(event) {
    var lengthOfValue, _ref;
    lengthOfValue = event.target.value.length;
    event.target.setSelectionRange(lengthOfValue, lengthOfValue);
    return (_ref = $(document)).off.apply(_ref, placeCursorAtEndOfTextInput.eventParams);
  };

  placeCursorAtEndOfTextInput.eventParams = ["focusin", "#input_files textarea", placeCursorAtEndOfTextInput];

  (_ref = $(document)).on.apply(_ref, placeCursorAtEndOfTextInput.eventParams);

  delay = function(amount, func) {
    return setTimeout(func, amount);
  };

}).call(this);
