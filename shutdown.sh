#!/bin/sh
port=$(cat startup.sh | grep uvicorn |awk -F '-' '{print $3}' |awk '{print $2}')
pid=$(netstat -nlp|grep $port |grep LISTEN |awk '{print $7}' |awk -F '/' '{print $1}')
# pid=$(ps -ef|grep daphne |grep -v grep |awk '{print $2}' |xargs)
if [ $pid ]; then
	kill -9 $pid
fi
echo "Stop $pid success ~"
