#!/bin/sh
./node_modules/.bin/pkg -t node14-linux-x64 -o dist/lightdb-server --compress GZip server.js
cp -R public dist/public