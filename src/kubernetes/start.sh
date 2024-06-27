#!/bin/bash

kubectl apply -f mongo-db-persistentvolume.yaml

kubectl apply -f mongo-db-deployment.yaml
kubectl apply -f express-server-deployment.yaml
kubectl apply -f frontend-deployment.yaml

kubectl apply -f mongo-db-service.yaml
kubectl apply -f express-server-service.yaml
kubectl apply -f frontend-service.yaml

kubectl apply -f nginx-deployment.yaml
kubectl apply -f nginx-service.yaml

kubectl apply -f express-server-hpa.yaml
kubectl apply -f frontend-hpa.yaml
kubectl apply -f nginx-proxy-hpa.yaml

echo "SUCCESS."