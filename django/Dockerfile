# Usa una imagen base oficial de Python
FROM python:3.9

# Establece el directorio de trabajo en el contenedor
WORKDIR /home/apriego-/django

# Copia el archivo de requerimientos
COPY res/requirements.txt ./

# Instala las dependencias del proyecto
RUN pip install --no-cache-dir -r requirements.txt

# Copia el código de la aplicación
COPY res ./

# Expone el puerto en el que la aplicación va a correr
EXPOSE 8080

# Comando por defecto para ejecutar la aplicación
CMD ["python", "manage.py", "runserver", "0.0.0.0:8080"]
