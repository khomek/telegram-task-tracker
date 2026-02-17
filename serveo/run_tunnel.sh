#!/bin/bash
echo "Запуск туннеля..."
ssh  -R cool-tracker-2022020202026666:80:frontend:80 serveo.net -o StrictHostKeyChecking=no -o ServerAliveInterval=60