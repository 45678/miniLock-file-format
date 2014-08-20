SCRIPTS = \
	compiled/miniLockLib.js \
	compiled/async.js \
	compiled/underscore.js \
	compiled/zepto.min.js \
	compiled/characters.js \
	compiled/demo.js \

COMPILED_TEMPLATES = \
	compiled/decrypt_keys.html.js \
	compiled/margin_byte.html.js \
	compiled/parsed_header.html.js \
	compiled/unencrypted_summary.html.js \
	compiled/summary_of_decrypted_ciphertext.html.js \
	compiled/summary_of_decrypted_header.html.js \

default: 1.html 2.html

1.html: templates/*.html $(SCRIPTS) $(COMPILED_TEMPLATES)
	bin/render templates/1.html > $@

2.html: templates/*.html $(SCRIPTS) $(COMPILED_TEMPLATES)
	bin/render templates/2.html > $@

compiled/%.js: %.coffee
	coffee --print $< > $@

compiled/%.html.js: templates/%.html
	eco --print $< > $@

compiled/miniLockLib.js:
	cp node_modules/miniLockLib/scripts/miniLockLib.js $@

compiled/async.js:
	cp node_modules/async/lib/async.js $@

compiled/underscore.js:
	cp node_modules/underscore/underscore.js $@

compiled/zepto.min.js:
	cp node_modules/zepto/zepto.min.js $@

clean:
	rm compiled/*.js
