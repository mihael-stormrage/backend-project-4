install:
	yarn

test:
	npm test

test-log:
	DEBUG=axios,nock.*,page-loader make test

coverage:
	npm test -- --coverage

lint:
	yarn eslint .

record:
	asciinema rec -c "docs/screencast.sh" docs/demo.cast --overwrite

record-debug:
	asciinema rec -c "docs/screencast.debug.sh" docs/debug.cast --overwrite

publish-record:
	asciinema upload docs/demo.cast

publish-record-debug:
	asciinema upload docs/debug.cast

svg:
	svg-term --in docs/demo.cast --out docs/demo.svg --no-cursor --width 80 --height 20 --window
	svg-term --in docs/debug.cast --out docs/debug.svg --no-cursor --width 80 --height 20 --window

.PHONY: coverage
