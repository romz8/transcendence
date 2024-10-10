
all:
	docker compose -f docker-compose.yml up --detach --build

stop:
	@if [ ! -z "$$(docker ps -aq)" ]; then \
		docker compose stop; \
	fi

clean:
	@if [ ! -z "$$(docker ps -aq)" ]; then \
		docker stop $$(docker ps -aq); \
		docker rm $$(docker ps -aq); \
	fi
	@if [ ! -z "$$(docker images -aq)" ]; then \
		docker rmi $$(docker images -aq); \
	fi	
	@if [ ! -z "$$(docker volume ls -q)" ]; then \
		docker volume rm $$(docker volume ls -q); \
	fi
	@if [ ! -z "$$(docker network ls -q --filter type=custom)" ]; then \
		docker network rm $$(docker network ls -q --filter type=custom); \
	fi
	@echo "$(GREEN)Deleted all docker containers, volumes, networks, and images succesfully$(END)"

re: clean all
