window.templates = {}

templates["unencrypted_summary"] = _.template """
<pre>
File Name:       <%- miniLockFileName %>
File Size:       <b class="size_graphic" style="width:<%- miniLockFileSize/4 %>px"></b> <%- miniLockFileSize %> bytes
Header Size:     <b class="header size_graphic" style="width:<%- sizeOfHeader/4 %>px"></b> <%- sizeOfHeader %> bytes
Ciphertext Size: <b class="ciphertext size_graphic" style="width:<%- sizeOfCiphertext/4 %>px"></b> <%- sizeOfCiphertext %> bytes
Version:         <%- version %>
Ephemeral Key:   <%= ephemeralKeyHTML %>
Decrypt Info:    <span class="punctuation">{</span><% if (encryptedPermits.length === 0) { %><span class="punctuation">}</span><% }; %><% _.each(encryptedPermits, function(permit) { %>
  <%= permit.nonceHTML %>: <span class="encoded_permit"><%= permit.encoded.substr(0, 36) %>...</span><% }); %>
<% if (encryptedPermits.length !== 0) { %><span class="punctuation">}</span><% }; %></pre>
"""

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
