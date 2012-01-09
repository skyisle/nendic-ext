#!/bin/bash

java -jar compiler.jar \
--js ../src/lib/j-framework.js \
--js ../src/content/frame.js \
--js ../src/content/extension.js \
--js ../src/content/markup.js \
--js ../src/content/ui.js \
--js ../src/content/command.js \
--js ../src/content/mouseEvent.js \
--js ../src/content/shortcut.js \
--js ../src/content/audio.js \
--js ../src/content/start.js \
--js_output_file content_script.js

mv content_script.js ../src/content/build/

exit 0
