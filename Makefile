.PHONY: install dev-install run test lint format docker-build docker-run clean

install:
	pip install -r requirements.txt

dev-install:
	pip install -e ".[dev]"

run:
	flask run --host=0.0.0.0 --port=5000

run-dev:
	FLASK_ENV=development flask run --host=0.0.0.0 --port=5000 --debug

test:
	pytest tests/ -v --cov=src

test-unit:
	pytest tests/unit/ -v

test-integration:
	pytest tests/integration/ -v

lint:
	flake8 src/ tests/

format:
	black src/ tests/

docker-build:
	docker build -t github-webhook-monitor .

docker-run:
	docker-compose up

clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	rm -rf .coverage htmlcov

seed-db:
	python scripts/seed_db.py

test-webhook:
	python scripts/test_webhook.py
