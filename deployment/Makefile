build-proyect:
	docker network create meli || true
	cd ../node_scraper && docker build -t "meli/node-scraper" .

start-proyect:
	docker-compose up -d