Base58 = miniLockLib.Base58

window.encryptedBlobInput = undefined
window.keys = characters.Alice

decryptMiniLockFile = (blob) ->
  blob = blob ? window.encryptedBlobInput
  window.encryptedBlobInput = blob
  console.info operation = new miniLockLib.DecryptOperation
    data: blob
    keys: window.keys
  $(document).trigger("decrypt:start", [operation])
  operation.start (error, decrypted, header, sizeOfHeader) ->
    if (error)
      console.error(error)
      $(document).trigger("decrypt:complete", [operation, decrypted, header, sizeOfHeader])
    else
      reader = new FileReader
      reader.readAsText(decrypted.data.slice(0, 100))
      reader.onload = (event) ->
        decrypted.text = reader.result
        $(document).trigger("decrypt:complete", [operation, decrypted, header, sizeOfHeader])


# Reveal the body, scroll location hash into view and setup bookmarks
# when the first file is decrypted after the document ready event.
$(document).one "decrypt:complete", (event) ->
  $(document.body).removeClass("loading").addClass("ready")
  $(location.hash).get(0).scrollIntoView() if location.hash
  renderEncryptedInputFileArrow()
  setupBookmarks()


$(document).on "decrypt:start", (event, operation) ->
  $('a.secret_key').removeClass("fits jams")
  $('#decrypt_status > div:first-child').addClass('expired')


$(document).on "decrypt:complete", (event, operation, decrypted, header, sizeOfHeader) ->
  $("a.secret_key.selected").toggleClass("fits", decrypted?)
  $("a.secret_key.selected").toggleClass("jams", decrypted is undefined)
  renderDecryptedFile(operation, decrypted, header, sizeOfHeader)
  renderMarginBytesForEachSection operation, sizeOfHeader, (error) ->
    console.error(error) if (error)


$(document).on "change:blob", "#input_files div.encrypted.file.input", (event, blob, attributes) ->
  window.encryptedBlobInput = blob
  decryptMiniLockFile(blob)


$(document).on "mousedown", "a.secret_key", (event) ->
  name = $(event.currentTarget).data('name')
  if window.keys.name isnt name
    window.keys = window.characters[name]
    $('a.secret_key').removeClass("selected")
    $(event.currentTarget).addClass("selected")
    decryptMiniLockFile()


$(document).ready (event) ->
  $("#decrypt_keys").render
    aliceKeyHTML: renderByteStream characters.Alice.secretKey
    bobbyKeyHTML: renderByteStream characters.Bobby.secretKey
    sarahKeyHTML: renderByteStream characters.Sarah.secretKey


$(document).on "scroll", -> renderEncryptedInputFileArrow()


setupBookmarks = ->
  bookmarks = $('section h1 a').toArray().reverse()
  $(document).on "scroll", (event) ->
    filtered = bookmarks.filter (bookmark) -> window.scrollY >= $(bookmark).offset().top
    bookmark = filtered[0]
    bookmarkHash = (if bookmark then "#"+bookmark.id else "")
    if location.hash isnt bookmarkHash
      [baseUrl] = location.toString().split("#")
      history.replaceState({}, "", "#{baseUrl}#{bookmarkHash}")
    if location.hash
      window.hashOffset = window.scrollY - $(location.hash).offset().top
    else
      window.hashOffset = 0

renderDecryptedFile = (operation, decrypted, header, sizeOfHeader) ->
  renderFileSizeGraphic(operation, sizeOfHeader)
  renderIntroduction(operation, decrypted, header, sizeOfHeader)
  renderDecryptStatus(operation, decrypted)
  renderMagicBytes(operation)
  renderSizeOfHeader(sizeOfHeader)
  renderHeader(decrypted, header, sizeOfHeader)
  renderCiphertext(operation, decrypted, header, sizeOfHeader)
  renderScrollGraph(operation, sizeOfHeader)
  renderSectionSizeGraphic(operation, sizeOfHeader)

setupFileSizeGraphic = ->
  svg = d3.select("#minilock_file_summary svg")
  svg.append("g").attr
    class: "x axis"
    transform: "translate(0,0)"
  (setupFileSizeGraphic = -> svg)()

renderFileSizeGraphic = (operation, sizeOfHeader) ->
  previousSize = renderFileSizeGraphic.previousSize ? 0
  renderFileSizeGraphic.previousSize = operation.data.size
  duration = Math.abs(previousSize - operation.data.size) / 25
  duration = Math.min 600, duration
  duration = Math.max 250, duration
  sizeOfCiphertext = operation.data.size - 8 - 4 - sizeOfHeader
  graphicWidth = $("#minilock_file_summary dd").width()

  svg = setupFileSizeGraphic()
  svg.attr width: graphicWidth, height: 30*3
  max = Math.max operation.data.size, 1024*2.5
  scale = d3.scale.linear().domain([0, max]).range([0, graphicWidth - 150])
  tickValues = (tick for tick in [0...max] by 1024)
  xAxis = d3.svg.axis().scale(scale).orient("bottom").tickSize(30*3).tickValues(tickValues)
  svg.select("g.x.axis").transition().duration(duration).ease("quad-out").call(xAxis)
  d3.select("#minilock_file_summary div.file").style
    "width": scale(operation.data.size) + "px"
    "transition-duration": duration + "ms"
  d3.select("#minilock_file_summary div.header").style
    "width": scale(sizeOfHeader) + "px"
    "transition-duration": duration + "ms"
  d3.select("#minilock_file_summary div.ciphertext").style
    "width": scale(sizeOfCiphertext) + "px"
    "transition-duration": duration + "ms"
  $("#minilock_file_summary label.file").text(operation.data.size + " bytes").css
    "left": Math.round scale(operation.data.size)
    "transition-duration": duration + "ms"
  $("#minilock_file_summary label.header").text(sizeOfHeader + " bytes").css
    "left": Math.round scale(sizeOfHeader)
    "transition-duration": duration + "ms"
  $("#minilock_file_summary label.ciphertext").text(sizeOfCiphertext + " bytes").css
    "left": Math.round scale(sizeOfCiphertext)
    "transition-duration": duration + "ms"

renderIntroduction = (operation, decrypted, header, sizeOfHeader) ->
  if header?.decryptInfo
    encryptedPermits = for encodedNonce, encodedEncryptedPermit of header.decryptInfo
      nonce: miniLockLib.NACL.util.decodeBase64(encodedNonce)
      nonceHTML: renderByteStream miniLockLib.NACL.util.decodeBase64(encodedNonce)
      encoded: encodedEncryptedPermit
      encrypted: miniLockLib.NACL.util.decodeBase64(encodedEncryptedPermit)
  else
    encryptedPermits = []

  $('#minilock_file_version').text(header.version)
  $('#minilock_file_empemeral').html(renderByteStream miniLockLib.NACL.util.decodeBase64(header.ephemeral))

  html = ("<div>"+permit.nonceHTML+":"+'<span class="encoded_permit">'+permit.encoded.substr(0, 32)+'...</span></div>' for permit in encryptedPermits).join("")
  $('#minilock_file_decrypt_info').html(html)

  $('#introduction_minilock_filename').html($('div.encrypted.input.file input[type=text]').val())
  $('#decrypt_summary').toggleClass("empty", decrypted is undefined)
  $("#decrypted_file_container div.decrypted_file").addClass("expired")
  $("#decrypted_file_container").append ecoTemplates["decrypted_file.html"](
    type: decrypted?.type
    text: decrypted?.text
    url: if decrypted? and decrypted.type?.match("image/") then URL.createObjectURL(decrypted.data) else undefined
  )
  defer 1, ->
    $("#decrypted_file_container div.decrypted_file").addClass("expired")
    $("#decrypted_file_container div.decrypted_file:last-child").removeClass("expired inserted").addClass("current")



  $("#summary_of_decrypted_ciphertext").render
    version: header.version
    size: decrypted?.data.size
    name: decrypted?.name
    type: decrypted?.type
    time: decrypted?.time
    text: decrypted?.text
    url: if decrypted? and decrypted.type?.match("image/") then URL.createObjectURL(decrypted.data) else undefined
  $("#summary_of_decrypted_header").render
    authorName: (characters.find(decrypted.senderID).name if decrypted?)
    headerSenderID: decrypted?.senderID
    headerFileKeyHTML: (renderByteStream decrypted.fileKey if decrypted?)
    headerFileNonceHTML: (renderByteStream decrypted.fileNonce if decrypted?)
    headerFileHashHTML: (renderByteStream decrypted.fileHash if decrypted?)

renderDecryptStatus = (operation, decrypted) ->
  $('#decrypt_status').toggleClass("ok", decrypted?)
  $('#decrypt_status').toggleClass("failed", not decrypted?)
  template = if decrypted? then renderDecryptStatus.ok else renderDecryptStatus.failed
  $('#decrypt_status').append template(operation.keys.name)
  $('#decrypt_status > div:first-child').addClass("outgoing").on "transitionend", (event) ->
    $('#decrypt_status > div.outgoing').remove()

renderDecryptStatus.ok = (name) ->
  """<div><em>Ah-ha!</em> #{name}’s key unlocks the file! Look see:</div>"""

renderDecryptStatus.failed = (name) ->
  """<div><em>Oh-no!</em> #{name}’s key doesn’t fit. There is nothing to see:</div>"""

renderMagicBytes = (operation) ->
  bytesAsArray = [109,105,110,105,76,111,99,107]
  $('#magic_bytes_in_base10').html(JSON.stringify(bytesAsArray))
  $('#utf8_encoded_magic_bytes').html(miniLockLib.NACL.util.encodeUTF8(bytesAsArray))
  bytesAsBase16 = ("0x#{byte.toString(16)}" for byte in bytesAsArray)
  $('#magic_bytes_in_base16').html("["+bytesAsBase16.join(",")+"]")

renderSizeOfHeader = (sizeOfHeader) ->
  $('#size_of_header_bytes').html(sizeOfHeader)

renderHeader = (decrypted, header, sizeOfHeader) ->
  $('#header_section span.keyholder').html(window.keys.name)
  $('#end_of_header_bytes').html(12+sizeOfHeader)
  $('#end_slot_of_header_bytes').html("slot #{12+sizeOfHeader}")
  $('#parsed_header').render
    version: header.version
    ephemeral: header.ephemeral
    decryptInfo: JSON.stringify(header.decryptInfo, undefined, 2)
  ephemeralKey = miniLockLib.NACL.util.decodeBase64(header.ephemeral)
  ephemeralArray = (byte for byte in ephemeralKey)
  $('#decoded_ephemeral_key').html(renderByteStream ephemeralArray)
  $('#encoded_ephemeral_key').html(JSON.stringify(header.ephemeral))
  $("#number_of_permits").html(Object.keys(header.decryptInfo).length)
  # $('#unique_nonce').html(renderByteStream uniqueNonce)
  permitForRender = """
    senderID:    #{if decrypted? then '"'+decrypted.senderID+'"' else ''}
    recipientID: #{if decrypted? then '"'+decrypted.recipientID+'"' else ''}
    fileInfo:
      fileKey:   #{if decrypted? then '"'+miniLockLib.NACL.util.encodeBase64(decrypted.fileKey)+'"' else ''}
      fileNonce: #{if decrypted? then '"'+miniLockLib.NACL.util.encodeBase64(decrypted.fileNonce)+'"' else ''}
      fileHash:  #{if decrypted? then '"'+miniLockLib.NACL.util.encodeBase64(decrypted.fileHash)+'"' else ''}
  """
  $('#permit_with_encoded_file_info').html(permitForRender)
  permitForRender = """
    fileKey:   #{if decrypted? then renderByteStream decrypted.fileKey else ''}
    fileNonce: #{if decrypted? then renderByteStream decrypted.fileNonce else ''}
    fileHash:  #{if decrypted? then renderByteStream decrypted.fileHash else ''}
  """
  $('#permit').html(permitForRender)


renderCiphertext = (operation, decrypted, header, sizeOfHeader) ->
  $('#ciphertext_section span.keyholder').html(window.keys.name)
  if decrypted
    $('#ciphertext_section span.ok').show()
    $('#ciphertext_section span.failed').hide()
  else
    $('#ciphertext_section span.ok').hide()
    $('#ciphertext_section span.failed').show()
  $('#start_of_ciphertext').html("slot #{8 + 4 + sizeOfHeader}")
  $('#end_of_ciphertext').html("slot #{operation.data.size - 1}")
  $('#ciphertext_file_size_in_bytes').html(operation.data.size)
  $('#ciphertext_header_size_in_bytes').html(sizeOfHeader)
  $('#start_of_ciphertext_for_first_chunk').html(8 + 4 + sizeOfHeader)
  $('#decrypted_time').html decrypted?.time
  $('#decrypted_type').html decrypted?.type
  $('#decrypted_name').html decrypted?.name
  $('#ciphertext_size_in_bytes').html(operation.data.size - 8 - 4 - sizeOfHeader)
  $('#ciphertext_file_key'     ).html(if decrypted? then renderByteStream decrypted.fileKey else '')
  $('#ciphertext_file_nonce'   ).html(if decrypted? then renderByteStream decrypted.fileNonce else '')
  $('#start_of_name_bytes'     ).html(8 + 4 + sizeOfHeader)
  $('#end_of_name_bytes'       ).html(8 + 4 + sizeOfHeader + 256)
  $('#start_of_mime_type_bytes').html(8 + 4 + sizeOfHeader + 256)
  $('#end_of_mime_type_bytes'  ).html(8 + 4 + sizeOfHeader + 256 + 128)
  $('#start_of_time_bytes'     ).html(8 + 4 + sizeOfHeader + 256 + 128)
  $('#end_of_time_bytes'       ).html(8 + 4 + sizeOfHeader + 256 + 128 + 24)
  $('#start_position_of_data_chunks').html("slot #{8 + 4 + sizeOfHeader + 428}")
  $('#end_position_of_data_chunks').html("slot #{operation.data.size-1}")


renderScrollGraph = ->
  windowHeight = $(window).height()
  bodyHeight = $('body').height()
  scale = (n) -> (n / bodyHeight) * windowHeight
  magicBytesHeight = $('#magic_bytes_section').height()
  sizeOfHeaderHeight = $('#size_of_header_section').height()
  headerHeight = $('#header_section').height()
  ciphertextHeight = $('#ciphertext_section').height()
  introductionHeight = bodyHeight - magicBytesHeight - sizeOfHeaderHeight - headerHeight - ciphertextHeight
  container = $('#scrollgraph')
  container.find('.introduction').css(height: scale(introductionHeight))
  container.find('.magic').css(height: scale(magicBytesHeight))
  container.find('.size_of_header').css(height: scale(sizeOfHeaderHeight))
  container.find('.header').css(height: scale(headerHeight))
  container.find('.ciphertext').css(height: scale(ciphertextHeight))

renderSectionSizeGraphic = (operation, sizeOfHeader) ->
  scale = (n) -> (n / operation.data.size) * $(window).height()
  headerStartsAt = 12
  headerEndsAt = 12 + sizeOfHeader
  cyphertextStartsAt = headerEndsAt
  container = $('#section_sizes_graphic')
  container.find('.magic').css(height: scale(8))
  container.find('.size_of_header').css(height: scale(4))
  container.find('.header').css(height: scale(sizeOfHeader))
  container.find('.ciphertext').css(height: scale(operation.data.size - cyphertextStartsAt))

renderMarginBytesForEachSection = (operation, sizeOfHeader, done) ->
  async.series [
    (f) -> renderMarginBytes "#magic_bytes_section", operation, 0, 8, f
    (f) -> renderMarginBytes "#size_of_header_section", operation, 8, 12, f
    (f) -> renderMarginBytes "#header_section", operation, 12, 12+sizeOfHeader, f
    (f) -> renderMarginBytes "#ciphertext_section", operation, 12+sizeOfHeader, operation.data.size, f
  ], done

renderMarginBytes = (section, operation, start, end, done) ->
  operation.readSliceOfData start, end, (error, sliceOfBytes) ->
    totalBytes = end - start
    maxBytes = Math.round($(section).height() / 30)
    tags = []
    if totalBytes > maxBytes
      snipHeight = ($(section).height()-2) % 30
      stopAt = if snipHeight+10 > 30 then maxBytes-4 else maxBytes-3
      for byte, index in sliceOfBytes.subarray(0,stopAt)
        tags.push ecoTemplates["margin_byte.html"](
          index: ((start + index) / 10000).toFixed(4).replace("0.", "")
          base10: byte.toString(10)
          base16: "0x#{byte.toString(16)}"
        )
      tags.push """<div class="snip" style="margin: -5px 0px -4px; height:#{snipHeight+10}px"><label style="display:none;">SNIPPED #{totalBytes-maxBytes} BYTES</label></div>"""
      for byte, index in sliceOfBytes.subarray(totalBytes - 3,totalBytes)
        tags.push ecoTemplates["margin_byte.html"](
          index: ((start + index + totalBytes - 3) / 10000).toFixed(4).replace("0.", "")
          base10: byte.toString(10)
          base16: "0x#{byte.toString(16)}"
        )
    else
      for byte, index in sliceOfBytes
        tags.push ecoTemplates["margin_byte.html"](
          index: ((start + index) / 10000).toFixed(4).replace("0.", "")
          base10: byte.toString(10)
          base16: "0x#{byte.toString(16)}"
        )
    $(section).find('div.margin_bytes').html(tags.join(""))
    done(error)

renderByteStream = (u8intArray) ->
  bytes = ('<b class="byte" title="Byte #'+index+' of '+u8intArray.length+' : '+byte.toString(10)+' : 0x'+byte.toString(16)+'" style="background-color:rgb('+byte+','+byte+','+byte+');"></b>' for byte, index in u8intArray)
  '<span class="byte_stream">'+bytes.join("")+'</span>'+'<span class="byte_stream_size">'+bytes.length+'</span>'

renderEncryptedInputFileArrow = ->
  isExtended = -30 > ($('#input_files').offset().top - $('#magic_bytes').offset().top)
  $('#input_files img.second.arrow').toggleClass("extended", isExtended)

numberToByteArray = (n) ->
  byteArray = new Uint8Array(4)
  for index in [0..4]
    byteArray[index] = n & 255
    n = n >> 8
  byteArray

defer = (amount, f) ->
  setTimeout(f, amount)

$.fn.render = (params) ->
  template = $(this).attr('id')+".html"
  $(this).html ecoTemplates[template](params)
