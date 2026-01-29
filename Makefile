# Makefile
.PHONY: install test run deploy clean help

install:
	pip install -r requirements.txt
	pip install -r requirements-dev.txt

install-dev:
	pip install -e ".[dev]"

test:
	pytest tests/ -v --cov=src

test-integration:
	pytest tests/integration/ -v

run:
	flask run --host=0.0.0.0 --port=5000

run-dev:
	FLASK_ENV=development flask run --host=0.0.0.0 --port=5000

docker-build:
	docker build -t github-webhook-monitor .

docker-run:
	docker-compose up

lint:
	black src/ tests/
	flake8 src/ tests/

format:
	black src/ tests/

deploy-staging:
	git push staging main

deploy-production:
	git push production main

seed-db:
	python scripts/seed_db.py

clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete

help:
	@echo "Available commands:"
	@echo "  install      Install production dependencies"
	@echo "  install-dev  Install development dependencies"
	@echo "  test         Run unit tests"
	@echo "  run          Run the application"
	@echo "  docker-build Build Docker image"
	@echo "  lint         Run linter"
	@echo "  deploy       Deploy to production"
