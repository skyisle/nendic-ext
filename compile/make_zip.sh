#!/bin/bash

FILE_NAME="naver_endic_$1.zip"

if [ -z $1 ]; then
  echo "Need a release version value for parameter."
  exit 0
fi

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
