#!/bin/bash

# validate version info
if [ -z $1 ]; then
  echo "Need a release version value for parameter."
  exit 0
fi

# compress javascript files
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


# zip source files
FILE_NAME="naver_endic_$1.zip"

cd ../src

find \
manifest.json \
lib \
background \
icon \
content/css \
content/build \
-type f \
| zip -@ $FILE_NAME

mv $FILE_NAME ../release/

exit 0
