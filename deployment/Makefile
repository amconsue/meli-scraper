build-proyect:
	docker network create meli || true

	cd ../node_scraper && docker build -t "meli/node-scraper" .
	cd ../scraper_admin && docker build -t "meli/scraper-admin" .

start-proyect:
	docker-compose up -d