$(document).on "change:selected_input_file", "#input_files", (event, selectedElement) ->
  $('#input_files').toggleClass("text_input_is_selected",  $(selectedElement).is(".text.input"))
  $('#input_files').toggleClass("image_input_is_selected", $(selectedElement).is(".image.input"))

# Make a text file when the page is ready and then emit a "change:blob" event on the
# unencrypted text file input element.
$(document).ready (event) ->
  makeTextBlobAndAttributes (blob, attributes) ->
    emitBlobChangedEvent "#input_files div.unencrypted.text.file.input", [blob, attributes]

$(document).on "focusin", "#input_files div.unencrypted.text.file.input", (event) ->
  inputElement = event.currentTarget
  return if $(inputElement).is(".selected")
  $("#input_files div.unencrypted.file.input").removeClass("selected")
  $(inputElement).addClass("selected")
  $("#input_files").trigger("change:selected_input_file", [inputElement])
  $(inputElement).one "transitionend", (event) ->
    makeTextBlobAndAttributes (blob, attributes) ->
      emitBlobChangedEvent inputElement, [blob, attributes]

$(document).on "mousedown", "#input_files div.unencrypted.image.file.input", (event) ->
  inputElement = event.currentTarget
  return if $(inputElement).is(".selected, .blank")
  $("#input_files div.unencrypted.file.input").removeClass("selected")
  $(inputElement).addClass("selected")
  $("#input_files").trigger("change:selected_input_file", [inputElement])
  $(inputElement).one "transitionend", (event) ->
    makeImageBlobAndAttributes (blob, attributes) ->
      emitBlobChangedEvent inputElement, [blob, attributes]

# When an image from the camera is ready, select the image input and make a file.
$(document).on "camera:image_is_ready", "#input_files div.unencrypted.image.file.input", (event) ->
  inputElement = event.currentTarget
  throw "What the fuckup" if $(inputElement).is(".selected")
  $(inputElement).removeClass("blank")
  $("#input_files div.unencrypted.file.input").removeClass("selected")
  $(inputElement).addClass("selected")
  $("#input_files").trigger("change:selected_input_file", [inputElement])
  $(inputElement).one "transitionend", (event) ->
    makeImageBlobAndAttributes (blob, attributes) ->
      emitBlobChangedEvent inputElement, [blob, attributes]

# Select the image input when one of its elements is focused. Doesn’t apply if the image is blank or already selected.
$(document).on "focusin", "#input_files div.unencrypted.image.file.input", (event) ->
  inputElement = event.currentTarget
  return if $(inputElement).is(".blank, .selected")
  $("#input_files div.unencrypted.file.input").removeClass("selected")
  $(inputElement).addClass("selected")
  $("#input_files").trigger("change:selected_input_file", [inputElement])

# Make an image file when the media type is changed.
$(document).on "input", "#input_files div.unencrypted.image.file.input [name=type]", (event) ->
  return if $("#input_files div.unencrypted.image.file.input").is(".blank")
  makeImageBlobAndAttributes (blob, attributes) ->
    emitBlobChangedEvent event.currentTarget, [blob, attributes]

# When the camera is erased, select the text input and make a text file.
$(document).on "camera:closed", "#input_files div.unencrypted.image.file.input", (event) ->
  inputElement = event.currentTarget
  $(event.currentTarget).addClass("blank")
  $("#input_files div.unencrypted.file.input").removeClass("selected")
  $("#input_files div.unencrypted.text.input").addClass("selected")
  $("#input_files").trigger("change:selected_input_file", ["#input_files div.unencrypted.text.input"])
  $("#input_files div.unencrypted.text.input").one "transitionend", (event) ->
    makeTextBlobAndAttributes (blob, attributes) ->
      emitBlobChangedEvent inputElement, [blob, attributes]

# Make a text file when its input data or name are changed.
$(document).on "input", "#input_files div.unencrypted.text.input", (event) ->
  makeTextBlobAndAttributes.debounced (blob, attributes) ->
    emitBlobChangedEvent event.currentTarget, [blob, attributes]

# Make a miniLock file when the encryption keys are changed.
$(document).on "input", "#input_files div.encrypted.file.input [name=keys]", (event) ->
  makeMiniLockFile (encrypted) ->
    emitBlobChangedEvent event.currentTarget, [encrypted.data, encrypted]

# Make a miniLock file when its file name is changed.
$(document).on "input", "#input_files div.encrypted.file.input [name=name]", (event) ->
  makeMiniLockFile.debounced (encrypted) ->
    emitBlobChangedEvent event.currentTarget, [encrypted.data, encrypted]

# Make a miniLock file when a permit is added or removed.
$(document).on "change", "#input_files div.encrypted.file.input [type=checkbox]", (event) ->
  makeMiniLockFile (encrypted) ->
    emitBlobChangedEvent event.currentTarget, [encrypted.data, encrypted]

# Make a miniLock file when one of the unencrypted input files is changed.
$(document).on "change:blob", "#input_files div.unencrypted.file.input", (event, blob, attributes) ->
  makeMiniLockFile blob, (encrypted) ->
    emitBlobChangedEvent "#input_files div.encrypted.file.input", [encrypted.data, encrypted]

makeTextBlobAndAttributes = (done) ->
  container = "#input_files div.unencrypted.text.input"
  blob = new Blob [$("#{container} textarea").val()]
  attributes =
    name: $("#{container} [name=name]").val()
    type: "text/plain"
  done blob, attributes

makeImageBlobAndAttributes = (done) ->
  window.camera.readImageBlob (blob) ->
    done blob, {type: blob.type}

makeMiniLockFile = (blob, done) ->
  if arguments.length is 2
    makeMiniLockFile.cachedInputBlob = blob
  else
    done = arguments[0]
    blob = makeMiniLockFile.cachedInputBlob
  encryptedFileInput = '#input_files div.encrypted.file.input'
  unencryptedFileInput = "#input_files div.unencrypted.file.input.selected"
  console.info miniLockLib.encrypt
    version: Number $("#{encryptedFileInput} [name=version]").val()
    data: blob
    name: $("#{unencryptedFileInput} [name=name]").val()
    type: $("#{unencryptedFileInput} [name=type]").val()
    keys: window.characters[$("#{encryptedFileInput} [name=keys]").val()]
    miniLockIDs: $("#{encryptedFileInput} [name=minilock_ids]:checked").map((i, el) -> el.value).toArray()
    callback: (error, encrypted) ->
      if encrypted and error is undefined
        done encrypted
      else
        console.error "makeEncryptedBlobAndAttributes", error

makeMiniLockFile.debounced = _.debounce(makeMiniLockFile, 300)
makeTextBlobAndAttributes.debounced = _.debounce(makeTextBlobAndAttributes, 300)
emitBlobChangedEvent = (element, params) -> $(element).trigger("change:blob", params)

# Place the cursor at the end of the text input when it is autofocused after the page is ready.
placeCursorAtEndOfTextInput = (event) ->
  lengthOfValue = event.target.value.length
  event.target.setSelectionRange(lengthOfValue, lengthOfValue)
  # Remove the event observer after it is executed for the first time.
  $(document).off placeCursorAtEndOfTextInput.eventParams...
placeCursorAtEndOfTextInput.eventParams = [
  "focusin", "#input_files textarea", placeCursorAtEndOfTextInput
]
$(document).on placeCursorAtEndOfTextInput.eventParams...

delay = (amount, func) -> setTimeout func, amount
