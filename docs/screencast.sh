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
wait
clear
pe 'page-loader -o tmp https://scrapeme.live/shop/'
pe 'page-loader -o /baz https://scrapeme.live/shop/'
pe 'page-loader -o /etc https://scrapeme.live/shop/'
pe 'page-loader -o tmp http://ya.ru'
pe 'page-loader -o tmp http://ya.ru'

#PROMPT_TIMEOUT=3
wait
echo
