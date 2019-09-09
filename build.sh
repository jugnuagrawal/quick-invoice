#!/bin/bash

rm -rf server/public/*
cd client
ng build --prod
cd ..
cp -r  client/dist/. server/public/.
cd server
sudo docker stop quick-invoice
sudo docker rm quick-invoice
sudo docker rmi quick-invoice
sudo docker build -t quick-invoice .