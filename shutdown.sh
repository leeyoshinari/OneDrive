#!/bin/sh
port=$(cat config.conf | grep -E "^port" | awk -F '=' '{print $2}' | awk -F '\r' '{print $1}')
ss -antp|grep $port |awk -F 'pid=' '{print $2 $3}'|awk -F ',' '{print $1, $4}' |xargs kill -9
echo "Stop $port success ~"
