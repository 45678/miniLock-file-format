(function() {
  this.ecoTemplates || (this.ecoTemplates = {});
  this.ecoTemplates["unencrypted_summary_pre.html"] = function(__obj) {
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
        var permit, _i, _len, _ref;
      
        __out.push('File Name:        ');
      
        __out.push(__sanitize(this.miniLockFileName));
      
        __out.push('\nFile Size:\nHeader Size:\nCiphertext Size:  \nminiLock Version: ');
      
        __out.push(__sanitize(this.version));
      
        __out.push('\nEphemeral Key:    ');
      
        __out.push(this.ephemeralKeyHTML);
      
        __out.push('\nDecrypt Info:     <span class="punctuation">{');
      
        if (this.encryptedPermits.length === 0) {
          __out.push(__sanitize("}"));
        }
      
        __out.push('</span>\n');
      
        _ref = this.encryptedPermits;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          permit = _ref[_i];
          __out.push('  ');
          __out.push(permit.nonceHTML);
          __out.push(': <span class="encoded_permit">');
          __out.push(__sanitize(permit.encoded.substr(0, 36)));
          __out.push('...</span>\n');
        }
      
        if (this.encryptedPermits.length !== 0) {
          __out.push('<span class="punctuation">}</span>');
        }
      
        __out.push('\n');
      
      }).call(this);
      
    }).call(__obj);
    __obj.safe = __objSafe, __obj.escape = __escape;
    return __out.join('');
  };
}).call(this);
