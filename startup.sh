#!/bin/sh
ip=$(cat config.conf | grep host | awk '{print $3}' | awk -F '\r' '{print $1}')
port=$(cat config.conf | grep port | awk '{print $3}' | awk -F '\r' '{print $1}')
gunicorn main:app -b $ip:$port -k uvicorn.workers.UvicornWorker --daemon
echo "start server success ~"