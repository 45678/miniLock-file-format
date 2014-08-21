(function() {
  this.ecoTemplates || (this.ecoTemplates = {});
  this.ecoTemplates["summary_of_decrypted_ciphertext.html"] = function(__obj) {
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
        var _ref;
      
        if ((_ref = this.type) != null ? _ref.match("image/") : void 0) {
          __out.push('\n<div class="image">\n  <img src="');
          __out.push(this.url);
          __out.push('" height="110" width="110">\n</div>\n');
        } else {
          __out.push('\n<div class="text">\n  ');
          __out.push(__sanitize(this.text));
          __out.push('\n</div>\n');
        }
      
        __out.push('\n\n');
      
        if (this.version === 1) {
          __out.push('<pre class="ciphertext">\n\n\nFile Name:    ');
          __out.push(this.name);
          __out.push('\nFile Size:    ');
          if (this.size) {
            __out.push("" + this.size + " bytes");
          }
          __out.push('\n</pre>');
        }
      
        __out.push('\n\n');
      
        if (this.version === 2) {
          __out.push('<pre class="ciphertext">\nFile Name:    ');
          __out.push(this.name);
          __out.push('\nFile Size:    ');
          if (this.size) {
            __out.push("" + this.size + " bytes");
          }
          __out.push('\nMedia Type:   ');
          __out.push(this.type);
          __out.push('\nEncrypt Time: ');
          __out.push(this.time);
          __out.push('\n</pre>');
        }
      
        __out.push('\n');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  };
}).call(this);
