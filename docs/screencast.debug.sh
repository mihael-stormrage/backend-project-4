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
PROMPT_TIMEOUT=3
pe "DEBUG=page-loader page-loader -o tmp https://ru.hexlet.io/courses"
wait
clear
pe "DEBUG=page-loader page-loader -o tmp https://scrapeme.live/shop/"
wait
clear
pe "DEBUG=axios,nock.*,page-loader make test"

#PROMPT_TIMEOUT=3
wait
echo
