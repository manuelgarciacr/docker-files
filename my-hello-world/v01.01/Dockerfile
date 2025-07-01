# Utilitza una imagen base. Esta base a su vez puede derivar de otra base, etc...
# En la raiz normalmente encontraremos un servidor de aplicaciones
FROM node:20.19.3-alpine3.22
# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app
# Copio los ficheros necesarios al contenedor
COPY app .
#COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
#ENTRYPOINT [ "docker-entrypoint.sh" ]
# Ejecuto los comandos necesarios para preparar el contenedor
# En este caso, instalar las dependencias de la aplicación
RUN npm init -y
RUN npm i express
RUN npm i --production
# Establezco el comando que por defecto se ejecutará al iniciar el contenedor
CMD ["node", "index.js", "Argument 01"]