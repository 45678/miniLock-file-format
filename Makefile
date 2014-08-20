default: 1.html 2.html compiled/characters.js compiled/demo.js compiled/templates.js compiled/summary_of_decrypted_ciphertext.html.js

clean:
	rm compiled/*.js

compiled/characters.js: characters.coffee
	coffee --print $< > $@

compiled/demo.js: demo.coffee
	coffee --print $< > $@

compiled/templates.js: templates.coffee
	coffee --print $< > $@

compiled/summary_of_decrypted_ciphertext.html.js: templates/summary_of_decrypted_ciphertext.html
	eco --print $< > $@

1.html: templates/*.html
	bin/render 1.html > 1.html

2.html: templates/*.html
	bin/render 2.html > 2.html