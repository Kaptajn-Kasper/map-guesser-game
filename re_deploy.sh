echo "Building the new Docker containers..."
if docker compose --file docker-compose.prod.yml build; then
    echo "Build succeeded. Taking down the current Docker containers..."
    docker compose --file docker-compose.prod.yml down

    echo "Starting the new Docker containers..."
    docker compose --file docker-compose.prod.yml up -d
else
    echo "Build failed. Existing containers remain untouched."
fi