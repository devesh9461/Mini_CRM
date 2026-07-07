.PHONY: help up down build logs seed restart psql

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

up: ## Start all services in detached mode
	docker compose up -d

down: ## Stop all services
	docker compose down

build: ## Rebuild images and start
	docker compose up -d --build

logs: ## Tail logs from all services
	docker compose logs -f

restart: ## Restart all services
	docker compose restart

psql: ## Open a PostgreSQL shell on the db container
	docker compose exec db psql -U mini_crm mini_crm

seed: ## Run the seed script manually inside the backend container
	docker compose exec backend python -m app.seed

bash: ## Open a shell in the backend container
	docker compose exec backend bash

nginx: ## Open a shell in the frontend (nginx) container
	docker compose exec frontend sh

clean: ## Remove all containers, volumes, and images
	docker compose down -v

prune: clean ## Full cleanup including builder cache
	docker builder prune -f
