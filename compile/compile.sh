#!/bin/bash

java -jar compiler.jar \
--js ../src/lib/jeff.js \
--js ../src/content/ui.frame.js \
--js ../src/content/ui.extension.js \
--js ../src/content/ui.markup.js \
--js ../src/content/ui.layer.js \
--js ../src/content/ui.audio.js \
--js ../src/content/ui.main.js \
--js ../src/content/event.mouseEvent.js \
--js ../src/content/event.shortcut.js \
--js ../src/content/start.js \
--js_output_file content_script.js

mv content_script.js ../src/content/build/

exit 0
