#!/bin/sh
port=$(cat config.conf | grep port | awk '{print $3}' | awk -F '\r' '{print $1}')
pid1=$(ss -antp|grep $port |awk -F 'pid=' '{print $2 $3}'|awk -F ',' '{print $1}')
pid2=$(ss -antp|grep $port |awk -F 'pid=' '{print $2 $3}'|awk -F ',' '{print $4}')
if [ $pid1 ]; then
        kill -9 $pid1
        kill -9 $pid2
fi
echo "Stop $port success ~"