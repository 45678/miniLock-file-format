(function() {
  this.ecoTemplates || (this.ecoTemplates = {});
  this.ecoTemplates["summary_of_decrypted_header.html"] = function(__obj) {
    if (!__obj) __obj = {};
    var __out = [], __capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return __safe(result);
    }, __sanitize = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else if (typeof value !== 'undefined' && value != null) {
        return __escape(value);
      } else {
        return '';
      }
    }, __safe, __objSafe = __obj.safe, __escape = __obj.escape;
    __safe = __obj.safe = function(value) {
      if (value && value.ecoSafe) {
        return value;
      } else {
        if (!(typeof value !== 'undefined' && value != null)) value = '';
        var result = new String(value);
        result.ecoSafe = true;
        return result;
      }
    };
    if (!__escape) {
      __escape = __obj.escape = function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };
    }
    (function() {
      (function() {
        __out.push('Author is:     ');
      
        __out.push(__sanitize(this.authorName));
      
        __out.push('\nAuthor ID:     ');
      
        __out.push(__sanitize(this.headerSenderID));
      
        __out.push('\nFile Key:      ');
      
        __out.push(this.headerFileKeyHTML);
      
        __out.push('\nFile Nonce:    ');
      
        __out.push(this.headerFileNonceHTML);
      
        __out.push('\nFile Hash:     ');
      
        __out.push(this.headerFileHashHTML);
      
        __out.push('\n');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  };
}).call(this);
