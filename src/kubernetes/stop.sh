#!/bin/bash

kubectl delete -f mongo-db-persistentvolume.yaml

kubectl delete -f nginx-service.yaml
kubectl delete -f nginx-deployment.yaml

kubectl delete -f frontend-service.yaml
kubectl delete -f express-server-service.yaml
kubectl delete -f mongo-db-service.yaml

kubectl delete -f frontend-deployment.yaml
kubectl delete -f express-server-deployment.yaml
kubectl delete -f mongo-db-deployment.yaml
