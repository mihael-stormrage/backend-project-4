#!/bin/bash

########################
# include the magic
########################
__filename=$(readlink -f "$0")
__dirname=$(dirname $__filename)

. $__dirname/demo-magic.sh -n

# hide the evidence
clear

# script
pe "page-loader -h"
PROMPT_TIMEOUT=3
wait
clear
p "page-loader -o tmp https://ru.hexlet.io/courses"
echo "tmp/ru-hexlet-io-courses.html"
p
pe "ls -1R tmp"
wait
clear
pe 'cat tmp/ru-hexlet-io-courses.html | grep -E "\<img|\<link|\<script" | bat -l html'

#PROMPT_TIMEOUT=3
wait
echo
