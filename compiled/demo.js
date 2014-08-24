(function() {
  var Base58, decryptMiniLockFile, defer, numberToByteArray, renderByteStream, renderCiphertext, renderDecryptStatus, renderDecryptedFile, renderEncryptedInputFileArrow, renderFileSizeGraphic, renderHeader, renderIntroduction, renderMagicBytes, renderMarginBytes, renderMarginBytesForEachSection, renderScrollGraph, renderSectionSizeGraphic, renderSizeOfHeader, setupBookmarks, setupFileSizeGraphic;

  Base58 = miniLockLib.Base58;

  window.encryptedBlobInput = void 0;

  window.keys = characters.Alice;

  decryptMiniLockFile = function(blob) {
    var operation;
    blob = blob != null ? blob : window.encryptedBlobInput;
    window.encryptedBlobInput = blob;
    console.info(operation = new miniLockLib.DecryptOperation({
      data: blob,
      keys: window.keys
    }));
    $(document).trigger("decrypt:start", [operation]);
    return operation.start(function(error, decrypted, header, sizeOfHeader) {
      var reader;
      if (error) {
        console.error(error);
        return $(document).trigger("decrypt:complete", [operation, decrypted, header, sizeOfHeader]);
      } else {
        reader = new FileReader;
        reader.readAsText(decrypted.data.slice(0, 100));
        return reader.onload = function(event) {
          decrypted.text = reader.result;
          return $(document).trigger("decrypt:complete", [operation, decrypted, header, sizeOfHeader]);
        };
      }
    });
  };

  $(document).one("decrypt:complete", function(event) {
    $(document.body).removeClass("loading").addClass("ready");
    if (location.hash) {
      $(location.hash).get(0).scrollIntoView();
    }
    renderEncryptedInputFileArrow();
    return setupBookmarks();
  });

  $(document).on("decrypt:start", function(event, operation) {
    $('a.secret_key').removeClass("fits jams");
    return $('#decrypt_status > div:first-child').addClass('expired');
  });

  $(document).on("decrypt:complete", function(event, operation, decrypted, header, sizeOfHeader) {
    $("a.secret_key.selected").toggleClass("fits", decrypted != null);
    $("a.secret_key.selected").toggleClass("jams", decrypted === void 0);
    renderDecryptedFile(operation, decrypted, header, sizeOfHeader);
    return renderMarginBytesForEachSection(operation, sizeOfHeader, function(error) {
      if (error) {
        return console.error(error);
      }
    });
  });

  $(document).on("change:blob", "#input_files div.encrypted.file.input", function(event, blob, attributes) {
    window.encryptedBlobInput = blob;
    return decryptMiniLockFile(blob);
  });

  $(document).on("mousedown", "a.secret_key", function(event) {
    var name;
    name = $(event.currentTarget).data('name');
    if (window.keys.name !== name) {
      window.keys = window.characters[name];
      $('a.secret_key').removeClass("selected");
      $(event.currentTarget).addClass("selected");
      return decryptMiniLockFile();
    }
  });

  $(document).ready(function(event) {
    return $("#decrypt_keys").render({
      aliceKeyHTML: renderByteStream(characters.Alice.secretKey),
      bobbyKeyHTML: renderByteStream(characters.Bobby.secretKey),
      sarahKeyHTML: renderByteStream(characters.Sarah.secretKey)
    });
  });

  $(document).on("scroll", function() {
    return renderEncryptedInputFileArrow();
  });

  setupBookmarks = function() {
    var bookmarks;
    bookmarks = $('section h1 a').toArray().reverse();
    return $(document).on("scroll", function(event) {
      var baseUrl, bookmark, bookmarkHash, filtered;
      filtered = bookmarks.filter(function(bookmark) {
        return window.scrollY >= $(bookmark).offset().top;
      });
      bookmark = filtered[0];
      bookmarkHash = (bookmark ? "#" + bookmark.id : "");
      if (location.hash !== bookmarkHash) {
        baseUrl = location.toString().split("#")[0];
        history.replaceState({}, "", "" + baseUrl + bookmarkHash);
      }
      if (location.hash) {
        return window.hashOffset = window.scrollY - $(location.hash).offset().top;
      } else {
        return window.hashOffset = 0;
      }
    });
  };

  renderDecryptedFile = function(operation, decrypted, header, sizeOfHeader) {
    renderFileSizeGraphic(operation, sizeOfHeader);
    renderIntroduction(operation, decrypted, header, sizeOfHeader);
    renderDecryptStatus(operation, decrypted);
    renderMagicBytes(operation);
    renderSizeOfHeader(sizeOfHeader);
    renderHeader(decrypted, header, sizeOfHeader);
    renderCiphertext(operation, decrypted, header, sizeOfHeader);
    renderScrollGraph(operation, sizeOfHeader);
    return renderSectionSizeGraphic(operation, sizeOfHeader);
  };

  setupFileSizeGraphic = function() {
    var svg;
    svg = d3.select("#minilock_file_size_graphic svg");
    svg.append("g").attr({
      "class": "x axis",
      transform: "translate(0,0)"
    });
    return (setupFileSizeGraphic = function() {
      return svg;
    })();
  };

  renderFileSizeGraphic = function(operation, sizeOfHeader) {
    var duration, graphicHeight, graphicWidth, previousSize, scale, sizeOfCiphertext, svg, tick, tickValues, xAxis, _ref;
    previousSize = (_ref = renderFileSizeGraphic.previousSize) != null ? _ref : 0;
    renderFileSizeGraphic.previousSize = operation.data.size;
    duration = Math.abs(previousSize - operation.data.size) / 25;
    duration = Math.min(600, duration);
    duration = Math.max(250, duration);
    sizeOfCiphertext = operation.data.size - 8 - 4 - sizeOfHeader;
    graphicWidth = $("#minilock_file_size_graphic").width();
    graphicHeight = $("#minilock_file_size_graphic").height();
    svg = setupFileSizeGraphic();
    svg.attr({
      width: graphicWidth,
      height: graphicHeight
    });
    scale = d3.scale.linear().domain([0, operation.data.size]).range([0, graphicWidth]);
    tickValues = (function() {
      var _i, _ref1, _results;
      _results = [];
      for (tick = _i = 0, _ref1 = operation.data.size; _i <= _ref1; tick = _i += 1024) {
        _results.push(tick);
      }
      return _results;
    })();
    xAxis = d3.svg.axis().scale(scale).orient("bottom").tickSize(90).tickValues(tickValues);
    svg.select("g.x.axis").transition().duration(duration).ease("quad-out").call(xAxis);
    d3.select("#minilock_file_size_graphic div.file").style({
      "width": scale(operation.data.size) + "px",
      "transition-duration": duration + "ms"
    });
    d3.select("#minilock_file_size_graphic div.header").style({
      "width": scale(sizeOfHeader) + "px",
      "transition-duration": duration + "ms"
    });
    d3.select("#minilock_file_size_graphic div.ciphertext").style({
      "width": scale(sizeOfCiphertext) + "px",
      "transition-duration": duration + "ms"
    });
    $("#minilock_file_size_graphic div.file label").text(operation.data.size + " bytes");
    $("#minilock_file_size_graphic div.header label").text(sizeOfHeader + " bytes");
    return $("#minilock_file_size_graphic div.ciphertext label").text(sizeOfCiphertext + " bytes");
  };

  renderIntroduction = function(operation, decrypted, header, sizeOfHeader) {
    var encodedEncryptedPermit, encodedNonce, encryptedPermits, _ref, _ref1;
    if (header != null ? header.decryptInfo : void 0) {
      encryptedPermits = (function() {
        var _ref, _results;
        _ref = header.decryptInfo;
        _results = [];
        for (encodedNonce in _ref) {
          encodedEncryptedPermit = _ref[encodedNonce];
          _results.push({
            nonce: miniLockLib.NACL.util.decodeBase64(encodedNonce),
            nonceHTML: renderByteStream(miniLockLib.NACL.util.decodeBase64(encodedNonce)),
            encoded: encodedEncryptedPermit,
            encrypted: miniLockLib.NACL.util.decodeBase64(encodedEncryptedPermit)
          });
        }
        return _results;
      })();
    } else {
      encryptedPermits = [];
    }
    $('#unencrypted_summary_pre').render({
      miniLockFileName: $('div.encrypted.input.file input[type=text]').val(),
      miniLockFileSize: operation.data.size,
      magicBytesHTML: renderByteStream([109, 105, 110, 105, 76, 111, 99, 107]),
      sizeOfHeaderBytesHTML: renderByteStream(numberToByteArray(sizeOfHeader)),
      sizeOfHeader: sizeOfHeader,
      sizeOfCiphertext: operation.data.size - 8 - 4 - sizeOfHeader,
      version: header.version,
      ephemeralKeyHTML: renderByteStream(miniLockLib.NACL.util.decodeBase64(header.ephemeral)),
      encryptedPermits: encryptedPermits
    });
    $('#introduction_minilock_filename').html($('div.encrypted.input.file input[type=text]').val());
    $('#decrypt_summary').toggleClass("empty", decrypted === void 0);
    $("#decrypted_file_container div.decrypted_file").addClass("expired");
    $("#decrypted_file_container").append(ecoTemplates["decrypted_file.html"]({
      type: decrypted != null ? decrypted.type : void 0,
      text: decrypted != null ? decrypted.text : void 0,
      url: (decrypted != null) && ((_ref = decrypted.type) != null ? _ref.match("image/") : void 0) ? URL.createObjectURL(decrypted.data) : void 0
    }));
    defer(1, function() {
      $("#decrypted_file_container div.decrypted_file").addClass("expired");
      return $("#decrypted_file_container div.decrypted_file:last-child").removeClass("expired inserted").addClass("current");
    });
    $("#summary_of_decrypted_ciphertext").render({
      version: header.version,
      size: decrypted != null ? decrypted.data.size : void 0,
      name: decrypted != null ? decrypted.name : void 0,
      type: decrypted != null ? decrypted.type : void 0,
      time: decrypted != null ? decrypted.time : void 0,
      text: decrypted != null ? decrypted.text : void 0,
      url: (decrypted != null) && ((_ref1 = decrypted.type) != null ? _ref1.match("image/") : void 0) ? URL.createObjectURL(decrypted.data) : void 0
    });
    return $("#summary_of_decrypted_header").render({
      authorName: (decrypted != null ? characters.find(decrypted.senderID).name : void 0),
      headerSenderID: decrypted != null ? decrypted.senderID : void 0,
      headerFileKeyHTML: (decrypted != null ? renderByteStream(decrypted.fileKey) : void 0),
      headerFileNonceHTML: (decrypted != null ? renderByteStream(decrypted.fileNonce) : void 0),
      headerFileHashHTML: (decrypted != null ? renderByteStream(decrypted.fileHash) : void 0)
    });
  };

  renderDecryptStatus = function(operation, decrypted) {
    var template;
    $('#decrypt_status').toggleClass("ok", decrypted != null);
    $('#decrypt_status').toggleClass("failed", decrypted == null);
    template = decrypted != null ? renderDecryptStatus.ok : renderDecryptStatus.failed;
    $('#decrypt_status').append(template(operation.keys.name));
    return $('#decrypt_status > div:first-child').addClass("outgoing").on("transitionend", function(event) {
      return $('#decrypt_status > div.outgoing').remove();
    });
  };

  renderDecryptStatus.ok = function(name) {
    return "<div><em>Ah-ha!</em> " + name + "’s secret key unlocks the file! Look see:</div>";
  };

  renderDecryptStatus.failed = function(name) {
    return "<div><em>Oh-no!</em> " + name + "’s secret key doesn’t fit. There is nothing to see:</div>";
  };

  renderMagicBytes = function(operation) {
    var byte, bytesAsArray, bytesAsBase16;
    bytesAsArray = [109, 105, 110, 105, 76, 111, 99, 107];
    $('#magic_bytes_in_base10').html(JSON.stringify(bytesAsArray));
    $('#utf8_encoded_magic_bytes').html(miniLockLib.NACL.util.encodeUTF8(bytesAsArray));
    bytesAsBase16 = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = bytesAsArray.length; _i < _len; _i++) {
        byte = bytesAsArray[_i];
        _results.push("0x" + (byte.toString(16)));
      }
      return _results;
    })();
    return $('#magic_bytes_in_base16').html("[" + bytesAsBase16.join(",") + "]");
  };

  renderSizeOfHeader = function(sizeOfHeader) {
    return $('#size_of_header_bytes').html(sizeOfHeader);
  };

  renderHeader = function(decrypted, header, sizeOfHeader) {
    var byte, ephemeralArray, ephemeralKey, permitForRender;
    $('#header_section span.keyholder').html(window.keys.name);
    $('#end_of_header_bytes').html(12 + sizeOfHeader);
    $('#end_slot_of_header_bytes').html("slot " + (12 + sizeOfHeader));
    $('#parsed_header').render({
      version: header.version,
      ephemeral: header.ephemeral,
      decryptInfo: JSON.stringify(header.decryptInfo, void 0, 2)
    });
    ephemeralKey = miniLockLib.NACL.util.decodeBase64(header.ephemeral);
    ephemeralArray = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = ephemeralKey.length; _i < _len; _i++) {
        byte = ephemeralKey[_i];
        _results.push(byte);
      }
      return _results;
    })();
    $('#decoded_ephemeral_key').html(renderByteStream(ephemeralArray));
    $('#encoded_ephemeral_key').html(JSON.stringify(header.ephemeral));
    $("#number_of_permits").html(Object.keys(header.decryptInfo).length);
    permitForRender = "senderID:    " + (decrypted != null ? '"' + decrypted.senderID + '"' : '') + "\nrecipientID: " + (decrypted != null ? '"' + decrypted.recipientID + '"' : '') + "\nfileInfo:\n  fileKey:   " + (decrypted != null ? '"' + miniLockLib.NACL.util.encodeBase64(decrypted.fileKey) + '"' : '') + "\n  fileNonce: " + (decrypted != null ? '"' + miniLockLib.NACL.util.encodeBase64(decrypted.fileNonce) + '"' : '') + "\n  fileHash:  " + (decrypted != null ? '"' + miniLockLib.NACL.util.encodeBase64(decrypted.fileHash) + '"' : '');
    $('#permit_with_encoded_file_info').html(permitForRender);
    permitForRender = "fileKey:   " + (decrypted != null ? renderByteStream(decrypted.fileKey) : '') + "\nfileNonce: " + (decrypted != null ? renderByteStream(decrypted.fileNonce) : '') + "\nfileHash:  " + (decrypted != null ? renderByteStream(decrypted.fileHash) : '');
    return $('#permit').html(permitForRender);
  };

  renderCiphertext = function(operation, decrypted, header, sizeOfHeader) {
    $('#ciphertext_section span.keyholder').html(window.keys.name);
    if (decrypted) {
      $('#ciphertext_section span.ok').show();
      $('#ciphertext_section span.failed').hide();
    } else {
      $('#ciphertext_section span.ok').hide();
      $('#ciphertext_section span.failed').show();
    }
    $('#start_of_ciphertext').html("slot " + (8 + 4 + sizeOfHeader));
    $('#end_of_ciphertext').html("slot " + (operation.data.size - 1));
    $('#ciphertext_file_size_in_bytes').html(operation.data.size);
    $('#ciphertext_header_size_in_bytes').html(sizeOfHeader);
    $('#start_of_ciphertext_for_first_chunk').html(8 + 4 + sizeOfHeader);
    $('#decrypted_time').html(decrypted != null ? decrypted.time : void 0);
    $('#decrypted_type').html(decrypted != null ? decrypted.type : void 0);
    $('#decrypted_name').html(decrypted != null ? decrypted.name : void 0);
    $('#ciphertext_size_in_bytes').html(operation.data.size - 8 - 4 - sizeOfHeader);
    $('#ciphertext_file_key').html(decrypted != null ? renderByteStream(decrypted.fileKey) : '');
    $('#ciphertext_file_nonce').html(decrypted != null ? renderByteStream(decrypted.fileNonce) : '');
    $('#start_of_name_bytes').html(8 + 4 + sizeOfHeader);
    $('#end_of_name_bytes').html(8 + 4 + sizeOfHeader + 256);
    $('#start_of_mime_type_bytes').html(8 + 4 + sizeOfHeader + 256);
    $('#end_of_mime_type_bytes').html(8 + 4 + sizeOfHeader + 256 + 128);
    $('#start_of_time_bytes').html(8 + 4 + sizeOfHeader + 256 + 128);
    $('#end_of_time_bytes').html(8 + 4 + sizeOfHeader + 256 + 128 + 24);
    $('#start_position_of_data_chunks').html("slot " + (8 + 4 + sizeOfHeader + 428));
    return $('#end_position_of_data_chunks').html("slot " + (operation.data.size - 1));
  };

  renderScrollGraph = function() {
    var bodyHeight, ciphertextHeight, container, headerHeight, introductionHeight, magicBytesHeight, scale, sizeOfHeaderHeight, windowHeight;
    windowHeight = $(window).height();
    bodyHeight = $('body').height();
    scale = function(n) {
      return (n / bodyHeight) * windowHeight;
    };
    magicBytesHeight = $('#magic_bytes_section').height();
    sizeOfHeaderHeight = $('#size_of_header_section').height();
    headerHeight = $('#header_section').height();
    ciphertextHeight = $('#ciphertext_section').height();
    introductionHeight = bodyHeight - magicBytesHeight - sizeOfHeaderHeight - headerHeight - ciphertextHeight;
    container = $('#scrollgraph');
    container.find('.introduction').css({
      height: scale(introductionHeight)
    });
    container.find('.magic').css({
      height: scale(magicBytesHeight)
    });
    container.find('.size_of_header').css({
      height: scale(sizeOfHeaderHeight)
    });
    container.find('.header').css({
      height: scale(headerHeight)
    });
    return container.find('.ciphertext').css({
      height: scale(ciphertextHeight)
    });
  };

  renderSectionSizeGraphic = function(operation, sizeOfHeader) {
    var container, cyphertextStartsAt, headerEndsAt, headerStartsAt, scale;
    scale = function(n) {
      return (n / operation.data.size) * $(window).height();
    };
    headerStartsAt = 12;
    headerEndsAt = 12 + sizeOfHeader;
    cyphertextStartsAt = headerEndsAt;
    container = $('#section_sizes_graphic');
    container.find('.magic').css({
      height: scale(8)
    });
    container.find('.size_of_header').css({
      height: scale(4)
    });
    container.find('.header').css({
      height: scale(sizeOfHeader)
    });
    return container.find('.ciphertext').css({
      height: scale(operation.data.size - cyphertextStartsAt)
    });
  };

  renderMarginBytesForEachSection = function(operation, sizeOfHeader, done) {
    return async.series([
      function(f) {
        return renderMarginBytes("#magic_bytes_section", operation, 0, 8, f);
      }, function(f) {
        return renderMarginBytes("#size_of_header_section", operation, 8, 12, f);
      }, function(f) {
        return renderMarginBytes("#header_section", operation, 12, 12 + sizeOfHeader, f);
      }, function(f) {
        return renderMarginBytes("#ciphertext_section", operation, 12 + sizeOfHeader, operation.data.size, f);
      }
    ], done);
  };

  renderMarginBytes = function(section, operation, start, end, done) {
    return operation.readSliceOfData(start, end, function(error, sliceOfBytes) {
      var byte, index, maxBytes, snipHeight, stopAt, tags, totalBytes, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
      totalBytes = end - start;
      maxBytes = Math.round($(section).height() / 30);
      tags = [];
      if (totalBytes > maxBytes) {
        snipHeight = ($(section).height() - 2) % 30;
        stopAt = snipHeight + 10 > 30 ? maxBytes - 4 : maxBytes - 3;
        _ref = sliceOfBytes.subarray(0, stopAt);
        for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
          byte = _ref[index];
          tags.push(ecoTemplates["margin_byte.html"]({
            index: ((start + index) / 10000).toFixed(4).replace("0.", ""),
            base10: byte.toString(10),
            base16: "0x" + (byte.toString(16))
          }));
        }
        tags.push("<div class=\"snip\" style=\"margin: -5px 0px -4px; height:" + (snipHeight + 10) + "px\"><label style=\"display:none;\">SNIPPED " + (totalBytes - maxBytes) + " BYTES</label></div>");
        _ref1 = sliceOfBytes.subarray(totalBytes - 3, totalBytes);
        for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
          byte = _ref1[index];
          tags.push(ecoTemplates["margin_byte.html"]({
            index: ((start + index + totalBytes - 3) / 10000).toFixed(4).replace("0.", ""),
            base10: byte.toString(10),
            base16: "0x" + (byte.toString(16))
          }));
        }
      } else {
        for (index = _k = 0, _len2 = sliceOfBytes.length; _k < _len2; index = ++_k) {
          byte = sliceOfBytes[index];
          tags.push(ecoTemplates["margin_byte.html"]({
            index: ((start + index) / 10000).toFixed(4).replace("0.", ""),
            base10: byte.toString(10),
            base16: "0x" + (byte.toString(16))
          }));
        }
      }
      $(section).find('div.margin_bytes').html(tags.join(""));
      return done(error);
    });
  };

  renderByteStream = function(u8intArray) {
    var byte, bytes, index;
    bytes = (function() {
      var _i, _len, _results;
      _results = [];
      for (index = _i = 0, _len = u8intArray.length; _i < _len; index = ++_i) {
        byte = u8intArray[index];
        _results.push('<b class="byte" title="Byte #' + index + ' of ' + u8intArray.length + ' : ' + byte.toString(10) + ' : 0x' + byte.toString(16) + '" style="background-color:rgb(' + byte + ',' + byte + ',' + byte + ');"></b>');
      }
      return _results;
    })();
    return '<span class="byte_stream">[' + bytes.join("") + ']</span>' + '<span class="byte_stream_size">' + bytes.length + '</span>';
  };

  renderEncryptedInputFileArrow = function() {
    var isExtended;
    isExtended = -30 > ($('#input_files').offset().top - $('#magic_bytes').offset().top);
    return $('#input_files img.second.arrow').toggleClass("extended", isExtended);
  };

  numberToByteArray = function(n) {
    var byteArray, index, _i;
    byteArray = new Uint8Array(4);
    for (index = _i = 0; _i <= 4; index = ++_i) {
      byteArray[index] = n & 255;
      n = n >> 8;
    }
    return byteArray;
  };

  defer = function(amount, f) {
    return setTimeout(f, amount);
  };

  $.fn.render = function(params) {
    var template;
    template = $(this).attr('id') + ".html";
    return $(this).html(ecoTemplates[template](params));
  };

}).call(this);
