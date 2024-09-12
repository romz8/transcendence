FROM python:3.12.4

WORKDIR /home/apriego-/login

COPY res/requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

# COPY res ./

# COPY ./scripts/entrypoint.sh .
# RUN chmod +x ./entrypoint.sh
# RUN apt upgrade
RUN apt update
RUN apt install netcat-openbsd

EXPOSE 8080

ENTRYPOINT [ "bash", "./entrypoint.sh" ]

CMD [ "python", "manage.py", "runserver", "0.0.0.0:8080" ]