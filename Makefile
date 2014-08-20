SCRIPTS = \
	compiled/characters.js \
	compiled/demo.js \
	compiled/templates.js \

COMPILED_TEMPLATES = \
	compiled/summary_of_decrypted_ciphertext.html.js \
	compiled/decrypt_keys.html.js \
	compiled/margin_byte.html.js \
	compiled/unencrypted_summary.html.js \

default: 1.html 2.html

1.html: templates/*.html $(SCRIPTS) $(COMPILED_TEMPLATES)
	bin/render templates/1.html > $@

2.html: templates/*.html $(SCRIPTS) $(COMPILED_TEMPLATES)
	bin/render templates/2.html > $@

compiled/%.js: %.coffee
	coffee --print $< > $@

compiled/%.html.js: templates/%.html
	eco --print $< > $@

clean:
	rm compiled/*.js
