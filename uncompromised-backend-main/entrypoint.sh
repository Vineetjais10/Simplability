#!/bin/bash
ln -sf /usr/share/zoneinfo/Asia/Kolkata /etc/localtime
set -eu
cd /code && npx sequelize db:migrate
exec "$@"