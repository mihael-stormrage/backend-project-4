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
PROMPT_TIMEOUT=2
wait
clear
pe "page-loader -o tmp https://ru.hexlet.io/courses"
wait
pe "bat tmp/ru-hexlet-io-courses.html"

PROMPT_TIMEOUT=3
wait
echo
