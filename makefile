run:
	@echo "==> Run with docker-compose"
	docker-compose down && docker-compose up --build

.PHONY: run