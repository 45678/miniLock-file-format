(function() {
  window.templates = {};

  templates["unencrypted_summary"] = _.template("<pre>\nFile Name:       <%- miniLockFileName %>\nFile Size:       <b class=\"size_graphic\" style=\"width:<%- miniLockFileSize/4 %>px\"></b> <%- miniLockFileSize %> bytes\nHeader Size:     <b class=\"header size_graphic\" style=\"width:<%- sizeOfHeader/4 %>px\"></b> <%- sizeOfHeader %> bytes\nCiphertext Size: <b class=\"ciphertext size_graphic\" style=\"width:<%- sizeOfCiphertext/4 %>px\"></b> <%- sizeOfCiphertext %> bytes\nVersion:         <%- version %>\nEphemeral Key:   <%= ephemeralKeyHTML %>\nDecrypt Info:    <span class=\"punctuation\">{</span><% if (encryptedPermits.length === 0) { %><span class=\"punctuation\">}</span><% }; %><% _.each(encryptedPermits, function(permit) { %>\n  <%= permit.nonceHTML %>: <span class=\"encoded_permit\"><%= permit.encoded.substr(0, 36) %>...</span><% }); %>\n<% if (encryptedPermits.length !== 0) { %><span class=\"punctuation\">}</span><% }; %></pre>");

  templates["decrypt_keys"] = _.template("<div class=\"named_key\"><a class=\"secret_key selected\" data-name=\"Alice\"><label>Alice</label> <%= aliceKeyHTML %>-byte secret key</a></div>\n<div class=\"named_key\"><a class=\"secret_key\" data-name=\"Bobby\"><label>Bobby</label> <%= bobbyKeyHTML %>-byte secret key</a></div>\n<div class=\"named_key\"><a class=\"secret_key\" data-name=\"Sarah\"><label>Sarah</label> <%= sarahKeyHTML %>-byte secret key</a></div>");

  templates["summary_of_decrypted_ciphertext"] = _.template("Blob Data:     <%- data %>\nFile Name:     <%- name %>\nMedia Type:    <%- type %>\nEncrypt Time:  <%- time %>");

  templates["summary_of_decrypted_header"] = _.template("Author is:     <%- authorName %>\nAuthor ID:     <%- headerSenderID %>\nFile Key:      <%= headerFileKeyHTML %>\nFile Nonce:    <%= headerFileNonceHTML %>\nFile Hash:     <%= headerFileHashHTML %>");

  templates["margin_byte"] = _.template("<div class=\"byte\">\n  <div class=\"index\"><%- index %></div>\n  <div class=\"value\"><%- base16 %></div>\n</div>");

  templates["decrypt_status_ok"] = _.template("<div><em>Ah-ha!</em> <%- name %>’s secret key unlocks the file! Look see:</div>");

  templates["decrypt_status_failed"] = _.template("<div><em>Oh-no!</em> <%- name %>’s secret key doesn’t fit. There is nothing to see:</div>");

  templates["parsed_header"] = _.template("version:     <%- version %>\nephemeral:   \"<%- ephemeral %>\"\ndecryptInfo: <%= decryptInfo %>");

}).call(this);
