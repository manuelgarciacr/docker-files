# Utilitza una imagen base. Esta base a su vez puede derivar de otra base, etc...
# En la raiz normalmente encontraremos un servidor de aplicaciones
FROM node:20.19.3-alpine3.22
# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app
# Copio los ficheros necesarios al contenedor
COPY app .
VOLUME data:/app/data
# Modifico la variable de entorno PATH. Le añado /app al final
ENV PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/app
# Añado la variable de entorno NEW_VAR
ENV NEW_VAR="Variable nueva de entorno"
# Ejecuto los comandos necesarios para preparar el contenedor
# En este caso, instalar las dependencias de la aplicación
RUN npm i --production
# Expongo el puerto. Para acceder desde el host se ha de publicar con -p al iniciar el contenedor
EXPOSE 3000
# Establezco el comando que por defecto se ejecutará al iniciar el contenedor
ENTRYPOINT ["node", "index.js"]