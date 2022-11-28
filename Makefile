install:
	yarn

start: install
	npm start

test:
	npm test

coverage:
	npm test -- --coverage

lint:
	yarn eslint .

record:
	asciinema rec -c "docs/screencast.sh" docs/demo.cast --overwrite

publish-record:
	asciinema upload docs/demo.cast

svg: record
	svg-term --in docs/demo.cast --out docs/demo.svg --no-cursor --width 80 --height 20 --window

.PHONY: coverage
