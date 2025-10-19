docker-compose up --build -d
docker-compose logs -f app # view logs
docker-compose down # stop

docker-compose -f docker-compose.prod.yml up --build -d
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml down
