(function() {
  window.templates = {};

  templates["summary_of_decrypted_ciphertext"] = _.template("Blob Data:     <%- data %>\nFile Name:     <%- name %>\nMedia Type:    <%- type %>\nEncrypt Time:  <%- time %>");

  templates["summary_of_decrypted_header"] = _.template("Author is:     <%- authorName %>\nAuthor ID:     <%- headerSenderID %>\nFile Key:      <%= headerFileKeyHTML %>\nFile Nonce:    <%= headerFileNonceHTML %>\nFile Hash:     <%= headerFileHashHTML %>");

  templates["decrypt_status_ok"] = _.template("<div><em>Ah-ha!</em> <%- name %>’s secret key unlocks the file! Look see:</div>");

  templates["decrypt_status_failed"] = _.template("<div><em>Oh-no!</em> <%- name %>’s secret key doesn’t fit. There is nothing to see:</div>");

}).call(this);
