# Use the official Python image from the Docker Hub
FROM python:3.12

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY ./pong_back/requirements.txt /app/

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the project files into the container
COPY ./pong_back /app/

RUN apt update
RUN apt install netcat-openbsd

# Expose the port the app runs on
EXPOSE 8001

ENTRYPOINT [ "bash", "/app/entrypoint.sh" ]
# Command to run the Django development server
#CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# Command to run the Daphne server
CMD ["daphne", "-b", "localhost", "-p", "8001", "pong_project.asgi:application"]
