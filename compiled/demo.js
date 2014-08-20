(function() {
  var Base58, decryptMiniLockFile, defer, makeMiniLockFile, makeMiniLockFileAndDecrypt, numberToByteArray, renderByteStream, renderCiphertext, renderDecryptStatus, renderDecryptedFile, renderEncryptedInputFileArrow, renderHeader, renderIntroduction, renderMagicBytes, renderMarginBytes, renderMarginBytesForEachSection, renderScrollGraph, renderSectionSizeGraphic, renderSizeOfHeader, setupBookmarks;

  Base58 = miniLockLib.Base58;

  defer = function(amount, f) {
    return setTimeout(f, amount);
  };

  window.keys = characters.Alice;

  $(document).ready(function(event) {
    return makeMiniLockFileAndDecrypt(function(error) {
      if (error) {
        return console.error(error);
      } else {
        $(document.body).removeClass("loading").addClass("ready");
        if (location.hash) {
          $(location.hash).get(0).scrollIntoView();
        }
        renderEncryptedInputFileArrow();
        return setupBookmarks();
      }
    });
  });

  $(document).on("scroll", function() {
    return renderEncryptedInputFileArrow();
  });

  $(document).on("input", "#input_files textarea, #input_files input[type=text]", function(event) {
    return makeMiniLockFileAndDecrypt.debounced(function(error) {
      if (error) {
        return console.error(error);
      }
    });
  });

  $(document).on("change", "#input_files select, #input_files input[type=checkbox]", function(event) {
    return makeMiniLockFileAndDecrypt(function(error) {
      if (error) {
        return console.error(error);
      }
    });
  });

  $(document).on("mousedown", "a.secret_key", function(event) {
    var name;
    name = $(event.currentTarget).data('name');
    if (window.keys.name !== name) {
      window.keys = window.characters[name];
      $('a.secret_key').removeClass("selected");
      $(event.currentTarget).addClass("selected");
      return decryptMiniLockFile(void 0, keys, function(error) {
        $(event.currentTarget).toggleClass("fits", error === void 0);
        $(event.currentTarget).toggleClass("jams", error != null);
        if (error) {
          return console.error(error);
        }
      });
    }
  });

  $(document).ready(function(event) {
    return $("#decrypt_keys").html(templates["decrypt_keys"]({
      aliceKeyHTML: renderByteStream(characters.Alice.secretKey),
      bobbyKeyHTML: renderByteStream(characters.Bobby.secretKey),
      sarahKeyHTML: renderByteStream(characters.Sarah.secretKey)
    }));
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

  makeMiniLockFileAndDecrypt = function(done) {
    $('a.secret_key').removeClass("fits jams");
    $('#decrypt_status > div:first-child').addClass('expired');
    return async.waterfall([
      function(ƒ) {
        return makeMiniLockFile(ƒ);
      }, function(file, ƒ) {
        return decryptMiniLockFile(file, void 0, ƒ);
      }
    ], function(error) {
      $("a.secret_key.selected").toggleClass("fits", error === void 0);
      $("a.secret_key.selected").toggleClass("jams", error != null);
      return done(error);
    });
  };

  makeMiniLockFileAndDecrypt.debounced = _.debounce(makeMiniLockFileAndDecrypt, 500);

  makeMiniLockFile = function(callback) {
    var encryptedFileInput, unencryptedFileInput;
    unencryptedFileInput = '#input_files div.unencrypted.file.input';
    encryptedFileInput = '#input_files div.encrypted.file.input';
    return miniLockLib.encrypt({
      version: Number($("" + encryptedFileInput + " input[name=version]").val()),
      data: new Blob([$("" + unencryptedFileInput + " textarea").val()]),
      name: $("" + unencryptedFileInput + " input[name=name]").val(),
      type: "text/plain",
      keys: window.characters[$("" + encryptedFileInput + " select[name=keys]").val()],
      miniLockIDs: $('input[name=minilock_ids]:checked').map(function(i, el) {
        return el.value;
      }).toArray(),
      callback: function(error, encrypted) {
        if (encrypted) {
          return callback(error, encrypted.data);
        } else {
          console.error("makeMiniLockFile", "Error making encrypted file!");
          return callback(error);
        }
      }
    });
  };

  decryptMiniLockFile = function(file, keys, callback) {
    var offset, operation;
    $('#decrypt_status > div:first-child').addClass('expired');
    offset = window.hashOffset;
    if (file) {
      window.miniLockFile = file;
    }
    if (keys) {
      window.keys = keys;
    }
    file = window.miniLockFile;
    keys = window.keys;
    operation = new miniLockLib.DecryptOperation({
      data: file,
      keys: keys
    });
    return operation.start(function(error, decrypted, header, sizeOfHeader) {
      renderDecryptedFile(operation, decrypted, header, sizeOfHeader);
      return renderMarginBytesForEachSection(operation, sizeOfHeader, function() {
        return callback(error);
      });
    });
  };

  renderDecryptedFile = function(operation, decrypted, header, sizeOfHeader) {
    renderIntroduction(operation, decrypted, header, sizeOfHeader);
    renderDecryptStatus(operation, decrypted);
    renderMagicBytes(operation);
    renderSizeOfHeader(sizeOfHeader);
    renderHeader(decrypted, header, sizeOfHeader);
    renderCiphertext(operation, decrypted, header, sizeOfHeader);
    renderScrollGraph(operation, sizeOfHeader);
    return renderSectionSizeGraphic(operation, sizeOfHeader);
  };

  renderIntroduction = function(operation, decrypted, header, sizeOfHeader) {
    var encodedEncryptedPermit, encodedNonce, encryptedPermits;
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
    $('#unencrypted_summary').html(templates["unencrypted_summary"]({
      miniLockFileName: $('div.encrypted.input.file input[type=text]').val(),
      miniLockFileSize: operation.data.size,
      magicBytesHTML: renderByteStream([109, 105, 110, 105, 76, 111, 99, 107]),
      sizeOfHeaderBytesHTML: renderByteStream(numberToByteArray(sizeOfHeader)),
      sizeOfHeader: sizeOfHeader,
      sizeOfCiphertext: operation.data.size - 8 - 4 - sizeOfHeader,
      version: header.version,
      ephemeralKeyHTML: renderByteStream(miniLockLib.NACL.util.decodeBase64(header.ephemeral)),
      encryptedPermits: encryptedPermits
    }));
    $('#introduction_minilock_filename').html($('div.encrypted.input.file input[type=text]').val());
    $('#decrypt_summary').toggleClass("empty", decrypted === void 0);
    $("#summary_of_decrypted_ciphertext").html(ecoTemplates["summary_of_decrypted_ciphertext.html"]({
      version: header.version,
      name: decrypted != null ? decrypted.name : void 0,
      type: decrypted != null ? decrypted.type : void 0,
      time: decrypted != null ? decrypted.time : void 0,
      data: decrypted != null ? $("div.unencrypted.input.file textarea").val() : void 0
    }));
    return $("#summary_of_decrypted_header").html(templates["summary_of_decrypted_header"]({
      authorName: (decrypted != null ? characters.find(decrypted.senderID).name : void 0),
      headerSenderID: decrypted != null ? decrypted.senderID : void 0,
      headerFileKeyHTML: (decrypted != null ? renderByteStream(decrypted.fileKey) : void 0),
      headerFileNonceHTML: (decrypted != null ? renderByteStream(decrypted.fileNonce) : void 0),
      headerFileHashHTML: (decrypted != null ? renderByteStream(decrypted.fileHash) : void 0)
    }));
  };

  renderDecryptStatus = function(operation, decrypted) {
    var template;
    $('#decrypt_status').toggleClass("ok", decrypted != null);
    $('#decrypt_status').toggleClass("failed", decrypted == null);
    template = decrypted != null ? "decrypt_status_ok" : "decrypt_status_failed";
    $('#decrypt_status').append(templates[template]({
      name: operation.keys.name
    }));
    $('#decrypt_status > div:first-child').addClass("outgoing");
    return defer(250, function() {
      return $('#decrypt_status > div:first-child').remove();
    });
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
    $('#parsed_header').html(templates["parsed_header"]({
      version: header.version,
      ephemeral: header.ephemeral,
      decryptInfo: JSON.stringify(header.decryptInfo, void 0, 2)
    }));
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
          tags.push(templates["margin_byte"]({
            index: ((start + index) / 10000).toFixed(4).replace("0.", ""),
            base10: byte.toString(10),
            base16: "0x" + (byte.toString(16))
          }));
        }
        tags.push("<div class=\"snip\" style=\"margin: -5px 0px -4px; height:" + (snipHeight + 10) + "px\"><label style=\"display:none;\">SNIPPED " + (totalBytes - maxBytes) + " BYTES</label></div>");
        _ref1 = sliceOfBytes.subarray(totalBytes - 3, totalBytes);
        for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
          byte = _ref1[index];
          tags.push(templates["margin_byte"]({
            index: ((start + index + totalBytes - 3) / 10000).toFixed(4).replace("0.", ""),
            base10: byte.toString(10),
            base16: "0x" + (byte.toString(16))
          }));
        }
      } else {
        for (index = _k = 0, _len2 = sliceOfBytes.length; _k < _len2; index = ++_k) {
          byte = sliceOfBytes[index];
          tags.push(templates["margin_byte"]({
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
    return $('#input_files > img.arrow').toggleClass("extended", isExtended);
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

}).call(this);
