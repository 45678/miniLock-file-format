window.templates = {}

templates["summary_of_decrypted_ciphertext"] = _.template """
  Blob Data:     <%- data %>
  File Name:     <%- name %>
  Media Type:    <%- type %>
  Encrypt Time:  <%- time %>
"""

templates["summary_of_decrypted_header"] = _.template """
  Author is:     <%- authorName %>
  Author ID:     <%- headerSenderID %>
  File Key:      <%= headerFileKeyHTML %>
  File Nonce:    <%= headerFileNonceHTML %>
  File Hash:     <%= headerFileHashHTML %>
"""

templates["decrypt_status_ok"] = _.template """
<div><em>Ah-ha!</em> <%- name %>’s secret key unlocks the file! Look see:</div>
"""

templates["decrypt_status_failed"] = _.template """
<div><em>Oh-no!</em> <%- name %>’s secret key doesn’t fit. There is nothing to see:</div>
"""

templates["parsed_header"] = _.template """
version:     <%- version %>
ephemeral:   "<%- ephemeral %>"
decryptInfo: <%= decryptInfo %>
"""
