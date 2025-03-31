#!/bin/bash

# Load environment variables from .env.local
source ../.env.local

# Check if the container is running
if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
    echo "Stopping running container: $CONTAINER_NAME"
    docker stop $CONTAINER_NAME
fi

# Check if the container exists (even if stopped) and remove it
if docker ps -aq -f name=$CONTAINER_NAME | grep -q .; then
    echo "Removing existing container: $CONTAINER_NAME"
    docker rm $CONTAINER_NAME
fi

# Check if the image exists and remove it
if docker images -q $IMAGE_NAME | grep -q .; then
    echo "Removing existing image: $IMAGE_NAME"
    docker rmi $IMAGE_NAME
fi

# Build the new image
echo "Building new image: $IMAGE_NAME"
docker build -f Dockerfile -t $IMAGE_NAME .

# Run the new container
echo "Running new container: $CONTAINER_NAME"
# For debugging --cap-add=SYS_PTRACE \
docker run --name $CONTAINER_NAME \
           --ulimit core=-1 --privileged \
           --mount source=coredumps_volume,target=/cores \
           --cap-add=SYS_PTRACE \
           -p $DATABASE_PORT:$DATABASE_PORT \
           -e "POSTGRES_PASSWORD=$DATABASE_PASSWORD" \
           -e "POSTGRES_DB=$CONTAINER_NAME" \
           -e "POSTGRES_USER=$DATABASE_USER" \
           -v $VOLUME_NAME:/var/lib/postgresql/data \
           -d $IMAGE_NAME

# Display running containers
docker ps
