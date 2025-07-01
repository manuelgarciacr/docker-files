# Instalar docker desde el repositorio oficial.
### Si lo instalamos desde snap tendremos problemas con la gestión de señales. Algunos contenedores podrían colgarse y tendríamos que eliminarlos desde fuera de docker. Las aplicaciones snap utilizan un sandbox.
```bash
# Instalo Docker desde el repositorio oficial

sudo apt update
sudo apt install ca-certificates curl gnupg lsb-release
```
```bash
# Agrego la clave GPG de Docker

sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```
```bash
# Agrego el repositorio oficial

echo \
  "deb [arch=$(dpkg --print-architecture) \
  signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```
```bash
# Actualizo e instalo los paquetes

sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io
```
```bash
# Verifico la instalación

docker --version
sudo systemctl status docker
```

# docker search
```bash
docker search --filter=stars=1000 mysql
```
```bash
docker search -f=is-official=true mysql
```
```bash
docker search --filter=stars=1000 --no-trunc mysql
```
```bash
docker search --limit 10 --format="{{.Name}}: {{.StarCount}}" mysql
```
```bash
docker search --limit 5 --format="table {{.Name}}\t{{.IsOfficial}}" mysql
```
# docker [container] run
```bash
# Create and run a new container from an image. Pulls the image if it is not downloaded locally

docker run hello-world
```
```bash
# -d, --detach  Run container in background and print container ID
# redis:6.2  Pulls an expecific version of redis

docker container run -d --name my-redis redis:6.2
```
```bash
docker run -d --name my-exited-redis redis ls -al
```
```bash
docker container run -d -e MYSQL_ROOT_PASSWORD=my@pwd --name my-mysql mysql
```
```bash
docker run -dit --name my-ubuntu ubuntu
```
# docker container ls
```bash
docker container ls -a
```
```bash
docker container ls -a --format "table {{.ID}}\t{{.Labels}}"
```
```bash
docker container ls -a --format json
```
```bash
docker container ls -f=since=my-redis
```
```bash
docker container ls -a -f=name=my-exited-redis -f=status=exited
```
```bash
id=$(docker ps -l -q | head -c 5)
echo id = $id
docker container ls -a -f=id=$id
```
# docker volume ls
```bash
docker volume ls -f=dangling=false -f=driver=local
```
```bash
docker volume ls -f=name=$(docker volume ls -q | head -c 5)
```
# docker image ls
```bash
docker image ls -a
```
```bash
docker image ls -f=reference=redis
```
```bash
docker image ls --filter=dangling=false
```
# docker container remove, rm & prune
```bash
docker container remove -f my-mysql my-redis my-ubuntu
```
```bash
docker container rm -v my-exited-redis
```
```bash
docker container prune -f
```
# docker volume remove, rm & prune
```bash
vol=$(docker volume ls -q | head -c 64)
echo vol = $vol
docker volume rm -f $vol
```
```bash
docker volume prune -fa
```
# docker image remove, rm & prune
```bash
docker image rm -f ubuntu
```
```bash
id=$(docker image ls -q | head -c 5)
echo id = $id
docker image remove -f $id
```
```bash
docker image prune -fa
```
# Gestión de volúmenes
### Me posiciono en "docker-files/volumes" y creo los directorios vacios "backup" y "data"
```bash
cd ...path-to-docker-files/volumes
rm -Rf backup
rm -Rf data
mkdir backup
mkdir data
ls -alR
```
<pre style="color: seagreen; background-color:rgb(42, 44, 47); padding: 1rem; font-family: monospace">
manuel@ docker-files (main) $ cd volumes &&
rm -Rf backup &&
rm -Rf data &&
mkdir backup &&
mkdir data &&
ls -alR
.:
total 16
drwxrwxr-x 4 manuel manuel 4096 jul  2 12:56 .
drwxrwxr-x 6 manuel manuel 4096 jul  2 11:37 ..
drwxrwxr-x 2 manuel manuel 4096 jul  2 12:56 backup
drwxrwxr-x 2 manuel manuel 4096 jul  2 12:56 data
-rw-rw-r-- 1 manuel manuel    0 jul  1 21:13 .gitkeep

./backup:
total 8
drwxrwxr-x 2 manuel manuel 4096 jul  2 12:56 .
drwxrwxr-x 4 manuel manuel 4096 jul  2 12:56 ..

./data:
total 8
drwxrwxr-x 2 manuel manuel 4096 jul  2 12:56 .
drwxrwxr-x 4 manuel manuel 4096 jul  2 12:56 ..
manuel@ volumes (main) $
</pre>

### Gestiono los volúmenes
```bash
docker volume create --label="desc=shared data" --label="date=$(date -u '+%Y/%m/%dT%TUTC')" shared-data
```
```bash
docker volume ls --format="{{.Name}}: {{.Labels}}"
```
```bash
docker volume ls --format='table {{.Name}}\t{{(.Label "date")}}'
```
```bash
docker volume ls -f=label=desc="shared data"
```
```bash
# "-v host-path:container-path" is also a bind mount

docker run -d --mount=type=bind,source=./data,target=/data/data -v /home/manuel/Vídeos:/home/root/Vídeos -v shared-data:/data/shared --name my-redis-vol redis
```
```bash
# Creo contenido en el volumen "shared-data" desde el contenedor "my-redis-vol"

docker exec my-redis-vol mkdir /data/shared/new-folder
docker exec my-redis-vol mkdir /data/shared/empty-folder
docker container exec my-redis-vol touch /data/shared/.hidden-file
docker container exec my-redis-vol touch /data/shared/new-folder/new-shared-file.txt
```
```bash
# Creo un nuevo contenedor ("my-redis-vol2") compartiendo el volumen "shared-data"

docker run -d -v shared-data:/data/shared --name my-redis-vol2 redis
```
```bash
# Compruebo que puedo acceder a los datos creados desde el primer contenedor

docker container exec my-redis-vol2 ls -alR /data/shared
```
<pre style="color: seagreen; background-color:rgb(42, 44, 47); padding: 1rem; font-family: monospace">
manuel@ volumes (main) $ # Compruebo que puedo acceder a los datos creados desde el primer contenedor
docker container exec my-redis-vol2 ls -alR /data/shared
/data/shared:
total 16
drwxr-xr-x 4 root  root  4096 Jul  2 13:47 .
drwxr-xr-x 3 redis redis 4096 Jul  2 13:53 ..
-rw-r--r-- 1 root  root     0 Jul  2 13:47 .hidden-file
drwxr-xr-x 2 root  root  4096 Jul  2 13:47 empty-folder
drwxr-xr-x 2 root  root  4096 Jul  2 13:47 new-folder

/data/shared/empty-folder:
total 8
drwxr-xr-x 2 root root 4096 Jul  2 13:47 .
drwxr-xr-x 4 root root 4096 Jul  2 13:47 ..

/data/shared/new-folder:
total 8
drwxr-xr-x 2 root root 4096 Jul  2 13:47 .
drwxr-xr-x 4 root root 4096 Jul  2 13:47 ..
-rw-r--r-- 1 root root    0 Jul  2 13:47 new-shared-file.txt
manuel@ volumes (main) $
</pre>
```bash
# Compruebo que desde el primer contenedor puedo acceder a los volumenes que comparto con el host

docker container exec my-redis-vol touch /data/data/new-data-file.txt
docker container exec my-redis-vol ls -al /home/root/Vídeos
ls -alR ./data
```
### save, delete & restore the "shared-data" volume
```bash
# Guardo los datos del volumen en un archivo tar comprimido

docker run --rm --volumes-from my-redis-vol -v $(pwd)/backup:/backup busybox tar czvf /backup/shared-data.tar.gz /data/shared
```
```bash
# O sin comprimir

docker run --rm --volumes-from my-redis-vol -v $(pwd)/backup:/backup busybox tar cvf /backup/shared-data.tar /data/shared
```
```bash
# Desde el host puedo acceder a los datos guardados

ls -al backup
```
<pre style="color: seagreen; background-color:rgb(42, 44, 47); padding: 1rem; font-family: monospace">
manuel@ volumes (main) $ ls -al backup
total 16
drwxrwxr-x 2 manuel manuel 4096 jul  2 16:19 .
drwxrwxr-x 4 manuel manuel 4096 jul  2 12:56 ..
-rw-r--r-- 1 root   root   3584 jul  2 16:16 shared-data.tar
-rw-r--r-- 1 root   root    199 jul  2 16:16 shared-data.tar.gz
manuel@ volumes (main) $ 
</pre>

```bash
# Elimino el volumen "shared-data" y los contenedores que lo utilizan

docker rm -fv my-redis-vol my-redis-vol2
docker volume rm shared-data
```
```bash
# Vuelvo a crear el volumen

docker volume create --label="desc=shared data" --label="date=$(date -u '+%Y/%m/%dT%TUTC')" shared-data
```
```bash
# Creo un nuevo contenedor con acceso al volumen

docker run -d -v shared-data:/data/shared --name my-redis-vol redis
```
```bash
# Recupero los datos desde el archivo comprimido

docker run --rm --volumes-from my-redis-vol -v $(pwd)/backup:/backup busybox sh -c "cd /data && tar xzvf /backup/shared-data.tar.gz --strip 1"
```
```bash
# O desde el archivo sin comprimir

docker run --rm --volumes-from my-redis-vol -v $(pwd)/backup:/backup busybox sh -c "cd /data && tar xvf /backup/shared-data.tar --strip 1"
```
```bash
# Compruebo que vuelven a estar los datos

docker container exec my-redis-vol ls -alR /data/shared
```
```bash
# Lo elimino todo

docker container remove -fv my-redis-vol
docker volume remove shared-data
docker image remove busybox redis
```
# Gestión de contenedores
```bash
# Creo un contenedor llamado "my-ubuntu" (sin arrancarlo) con una imagen de ubuntu, con acceso a solo uno de los nucleos del host, interactivo, con un terminal TTY asignado y con un volumen llamado "shared-data" montado en /data/shared

docker container create --cpus 1 -it -v shared-data:/data/shared --name my-ubuntu ubuntu
```
```bash
# Arranco el contenedor. Por defecto "start" no ataca los streams de I/O, se necesitaría la opción -i 

docker container start my-ubuntu
```
```bash
# Reinicio el contenedor (stop y start) sin esperar los 10 segundos que tiene por defecto (con contenedores windows son 30)

docker container restart -t 0 my-ubuntu
```
## IMPORTANTE. Ejecutar los siguientes comandos desde un terminal fuera de VScode
```bash
# VScode tiene la abreviatura de teclado ^p mapeada para acceder a la paleta. Ataco los streams de I/O del contenedor

docker container attach my-ubuntu
```
```bash
# Desconecto de los streams sin para el contenedor

^p^q
```
```bash
# vuelvo a atacar al container

docker container attach my-ubuntu
```
```bash
# y esta vez desconecto parando el contenedor

exit
```
## IMPORTANTE. Los siguientes comandos ya se pueden seguir ejecutando desde el terminal de VScode
```bash
# Es posible cambiar la secuencia de desconexión

docker container start -i --detach-keys="ctrl-x,ctrl-x" my-ubuntu
```
```bash
# Desconecto sin parar el contenedor

^x^x
```
```bash
# Paro el contenedor sin esperar a los 10/30 segundos

docker container stop -t 0 my-ubuntu
```
```bash
# Renombro el contenedor

docker rename my-ubuntu my-server
```
```bash
# Y le vuelvo a cambiar el nombre

docker container rename my-server my-ubuntu
```
```bash
# Ejecuto un comando interno del contenedor

docker container start my-ubuntu
docker container exec my-ubuntu ls -al
```
```bash
# Ejecuto "bash" de forma interactiva

docker exec -it my-ubuntu bash
```
```bash
# Esta shell no es la que ejecutó el contenedor al arrancar, ahora hay dos

ps -aux
```
```bash
# Por lo que si salgo de ella con exit el contenedor seguirá activo

exit
```
# docker info, inspect & docker [container] stats
```bash
# Información general del sistema docker

docker info --format=json
docker info -f="{{println}}Containers en ejecución: {{.ContainersRunning}}{{println}}"
```
```bash
# Información sobre objetos del sistema docker. -s añade información sobre el tamaño de los contenedores

docker inspect -s --type=container my-ubuntu
docker inspect -s --type=container -f="{{println}} SizeRw: {{.SizeRw}} SizeRootFs: {{.SizeRootFs}} {{println}}" my-ubuntu
```
```bash
docker inspect --type image --format json ubuntu
```
```bash
# Estadísticas en vivo sobre los contenedores. -a muestra también los contenedores parados. ^c para salir

docker stats -a
```
```bash
docker stats --format=json my-ubuntu
```
```bash
# --no-stream muestra solo las estadísticas en un momento dado 

docker stats --no-stream
``` 
# Actualizar container
### Me posiciono en "docker-files/htdocs"
```bash
cd ...path-to-docker-files/htdocs
ls -alR
```
<pre style="color: seagreen; background-color:rgb(42, 44, 47); padding: 1rem; font-family: monospace">
manuel@ docker-files (main) $ cd ../htdocs &&
ls -alR
.:
total 12
drwxrwxr-x 2 manuel manuel 4096 jul  1 21:13 .
drwxrwxr-x 6 manuel manuel 4096 jul  2 11:37 ..
-rw-rw-r-- 1 manuel manuel   19 jul  1 21:13 index.html
manuel@ htdocs (main) $
</pre>
```bash
# Ejecuto un contenedor con la imagen de un servidor Apache:

docker run -d --name my-apache-app -p 192.168.1.240:8080:80 -v "$PWD":/usr/local/apache2/htdocs/ httpd
```
Como le he indicado la IP del host (mi portatil), para acceder tendré que teclear esta dirección en el navegador (o con curl). Acceder con http://localhost:8080 dará error.

He montado el directorio en el que estoy (htdocs) en el volumen del contenedor desde donde se sirven los sitios WEB. "$PWD" (print working directory) hace referencia al directorio desde donde ejecuto el comando "docker".
``` bash
curl localhost:8080
curl 192.168.1.240:8080
```
```bash
# Actualizo el software del contenedor:

docker exec my-apache-app apt-get update
```
<pre style="color: seagreen; background-color:rgb(42, 44, 47); padding: 1rem; font-family: monospace">
manuel@ htdocs $ docker exec my-apache-app apt-get update
Get:1 http://deb.debian.org/debian bookworm InRelease [151 kB]
Get:2 http://deb.debian.org/debian bookworm-updates InRelease [55.4 kB]
Get:3 http://deb.debian.org/debian-security bookworm-security InRelease [48.0 kB]
Get:4 http://deb.debian.org/debian bookworm/main amd64 Packages [8793 kB]
Get:5 http://deb.debian.org/debian bookworm-updates/main amd64 Packages [756 B]
Get:6 http://deb.debian.org/debian-security bookworm-security/main amd64 Packages [268 kB]
Fetched 9316 kB in 2s (4963 kB/s)
Reading package lists...
manuel@ htdocs $
</pre>
```bash
# Instalo el paquete "curl"

docker exec my-apache-app apt-get install -y curl
```
<pre style="color: seagreen; background-color:rgb(42, 44, 47); padding: 1rem; font-family: monospace">
manuel@ htdocs $ docker exec my-apache-app apt-get install -y curl
Reading package lists...
Building dependency tree...
Reading state information...
The following NEW packages will be installed:
    curl
0 upgraded, 1 newly installed, 0 to remove and 1 not upgraded.
Need to get 315 kB of archives.
After this operation, 501 kB of additional disk space will be used.
Get:1 http://deb.debian.org/debian bookworm/main amd64 curl amd64 7.88.1-10+deb12u12 [315 kB]
debconf: delaying package configuration, since apt-utils is not installed
Fetched 315 kB in 0s (4102 kB/s)
Selecting previously unselected package curl.
(Reading database ... 6791 files and directories currently installed.)
Preparing to unpack .../curl_7.88.1-10+deb12u12_amd64.deb ...
Unpacking curl (7.88.1-10+deb12u12) ...
Setting up curl (7.88.1-10+deb12u12) ...
manuel@ htdocs $
</pre>
```bash
# Y el paquete "procps"

docker exec my-apache-app apt-get install -y procps
```
<pre style="color: seagreen; background-color:rgb(42, 44, 47); padding: 1rem; font-family: monospace">
manuel@ htdocs $ docker exec my-apache-app apt-get install -y procps
Reading package lists...
Building dependency tree...
Reading state information...
The following NEW package will be installed:
    procps
0 upgraded, 1 newly installed, 0 to remove and 3 not upgraded.
Need to get 709 kB of archives.
After this operation, 2141 kB of additional disk space will be used.
Get:1 http://deb.debian.org/debian bookworm/main amd64 procps amd64 2:4.0.2-3 [709 kB]
debconf: delaying package configuration, since apt-utils is not installed</br>
Fetched 709 kB in 0s (6005 kB/s)
Selecting previously unselected package procps.
(Reading database ... 6946 files and directories currently installed.)
Preparing to unpack .../procps_2%3a4.0.2-3_amd64.deb ...
Unpacking procps (2:4.0.2-3) ...
Setting up procps (2:4.0.2-3) ...
manuel@ htdocs $
</pre>
```bash
# Ahora ya podemos llamar a una API externa de pruebas desde dentro del contenedor:

docker exec my-apache-app curl https://jsonplaceholder.typicode.com/posts/1
```
<pre style="color: seagreen; background-color:rgb(42, 44, 47); padding: 1rem; font-family: monospace">
manuel@ htdocs $ docker exec my-apache-app curl https://jsonplaceholder.typicode.com/posts/1
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   292  100   292    0     0   2251      0 --:--:-- --:--:-- --:--:--  2246
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
  "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
}manuel@ htdocs $
</pre>
```bash
# Y podemos ver los procesos en ejecución dentro del contenedor:

docker exec my-apache-app ps -aux
```
<pre style="color: seagreen; background-color:rgb(42, 44, 47); padding: 1rem; font-family: monospace">
manuel@ htdocs $ docker exec my-apache-app ps -aux
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.0   5864  4352 ?        Ss   13:13   0:00 httpd -DFOREGROUND
www-data       8  0.0  0.0 1996996 3372 ?        Sl   13:13   0:00 httpd -DFOREGROUND
www-data       9  0.0  0.0 1931516 4012 ?        Sl   13:13   0:00 httpd -DFOREGROUND
www-data      10  0.0  0.0 1996996 3628 ?        Sl   13:13   0:00 httpd -DFOREGROUND
root         410 50.0  0.0   8064  4096 ?        Rs   13:27   0:00 ps -aux
manuel@ htdocs $ 
</pre>
```bash
# También se puede hacer ejecutando una shell "bash" interactiva. Primero elimino el contenedor apache

docker rm my-apache-app -f
```
```bash
# Lo vuelvo a ejecutar con una shell bash interactiva. Como verás en el prompt, los comandos que teclees desde ahora se ejecutarán en un terminal bash interno del contenedor.

docker run -it --name my-apache-app -p 192.168.1.240:8080:80 -v "$PWD":/usr/local/apache2/htdocs/ --detach-keys="ctrl-x,ctrl-x" httpd bash
```
```bash
# Actualizo el contenedor 

apt-get update
apt-get install -y curl procps
echo -e "\nEjecuto 'curl https://jsonplaceholder.typicode.com/posts/1':\n"
curl https://jsonplaceholder.typicode.com/posts/1
echo -e "\n\nEjecuto 'ps -aux':\n"
ps -aux
echo -e "\n"
```
<pre style="color: seagreen; background-color:rgb(42, 44, 47); padding: 1rem; font-family: monospace">
root@751a514ee762:/usr/local/apache2# # Actualizo el contenedor 
apt-get update
apt-get install -y curl procps
echo -e "\nEjecuto 'curl https://jsonplaceholder.typicode.com/posts/1':\n"
curl https://jsonplaceholder.typicode.com/posts/1
echo -e "\n\nEjecuto 'ps -aux':\n"
ps -aux
echo -e "\n"
Get:1 http://deb.debian.org/debian bookworm InRelease [151 kB]
Get:2 http://deb.debian.org/debian bookworm-updates InRelease [55.4 kB]
Get:3 http://deb.debian.org/debian-security bookworm-security InRelease [48.0 kB]
Get:4 http://deb.debian.org/debian bookworm/main amd64 Packages [8793 kB]
Get:5 http://deb.debian.org/debian bookworm-updates/main amd64 Packages [756 B]
Get:6 http://deb.debian.org/debian-security bookworm-security/main amd64 Packages [270 kB]
Fetched 9319 kB in 2s (4314 kB/s)                       
Reading package lists... Done
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
The following additional packages will be installed:
  libgpm2 libncursesw6 libproc2-0 psmisc
Suggested packages:
  gpm
The following NEW packages will be installed:
  curl libgpm2 libncursesw6 libproc2-0 procps psmisc
0 upgraded, 6 newly installed, 0 to remove and 0 not upgraded.
Need to get 1494 kB of archives.
After this operation, 4278 kB of additional disk space will be used.
Get:1 http://deb.debian.org/debian bookworm/main amd64 libncursesw6 amd64 6.4-4 [134 kB]
Get:2 http://deb.debian.org/debian bookworm/main amd64 libproc2-0 amd64 2:4.0.2-3 [62.8 kB]
Get:3 http://deb.debian.org/debian bookworm/main amd64 procps amd64 2:4.0.2-3 [709 kB]
Get:4 http://deb.debian.org/debian bookworm/main amd64 curl amd64 7.88.1-10+deb12u12 [315 kB]
Get:5 http://deb.debian.org/debian bookworm/main amd64 libgpm2 amd64 1.20.7-10+b1 [14.2 kB]
Get:6 http://deb.debian.org/debian bookworm/main amd64 psmisc amd64 23.6-1 [259 kB]
Fetched 1494 kB in 0s (6479 kB/s)
debconf: delaying package configuration, since apt-utils is not installed
Selecting previously unselected package libncursesw6:amd64.
(Reading database ... 6793 files and directories currently installed.)
Preparing to unpack .../0-libncursesw6_6.4-4_amd64.deb ...
Unpacking libncursesw6:amd64 (6.4-4) ...
Selecting previously unselected package libproc2-0:amd64.
Preparing to unpack .../1-libproc2-0_2%3a4.0.2-3_amd64.deb ...
Unpacking libproc2-0:amd64 (2:4.0.2-3) ...
Selecting previously unselected package procps.
Preparing to unpack .../2-procps_2%3a4.0.2-3_amd64.deb ...
Unpacking procps (2:4.0.2-3) ...
Selecting previously unselected package curl.
Preparing to unpack .../3-curl_7.88.1-10+deb12u12_amd64.deb ...
Unpacking curl (7.88.1-10+deb12u12) ...
Selecting previously unselected package libgpm2:amd64.
Preparing to unpack .../4-libgpm2_1.20.7-10+b1_amd64.deb ...
Unpacking libgpm2:amd64 (1.20.7-10+b1) ...
Selecting previously unselected package psmisc.
Preparing to unpack .../5-psmisc_23.6-1_amd64.deb ...
Unpacking psmisc (23.6-1) ...
Setting up libgpm2:amd64 (1.20.7-10+b1) ...
Setting up psmisc (23.6-1) ...
Setting up libproc2-0:amd64 (2:4.0.2-3) ...
Setting up libncursesw6:amd64 (6.4-4) ...
Setting up procps (2:4.0.2-3) ...
Setting up curl (7.88.1-10+deb12u12) ...
Processing triggers for libc-bin (2.36-9+deb12u10) ...

Ejecuto 'curl https://jsonplaceholder.typicode.com/posts/1':

{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
  "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
}

Ejecuto 'ps -aux':

USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.1  0.0   4192  3200 pts/0    Ss   16:39   0:00 bash
root         205  0.0  0.0   8064  4352 pts/0    R+   16:40   0:00 ps -aux


root@751a514ee762:/usr/local/apache2#
</pre>

El comando "bash" reemplaza al comando que por defecto ejecuta el contenedor al arrancar (httpd-foreground), por lo que el servidor Apache no ha llegado a arrancar:
```bash
# Salgo de la shell sin cerrar el contenedor

^x^x
```
```bash
# Comando ejecutado al arrancar el contenedor

docker inspect -f="{{.Config.Cmd}}" my-apache-app
```
```bash
# Intento acceder al servidor apache. No podré

docker exec my-apache-app curl 192.168.1.240:8080
```
```bash
# Entre los proceso en ejecucion no está el servidor apache (httpd)

docker exec my-apache-app ps -aux
```
# docker [container] logs
```bash
docker container logs my-apache-app
```
```bash
# Últimas 7 líneas del log. Muestro los tiempos

docker logs --tail 7 -t my-apache-app
```
```bash
# Entradas de log de los últimos 2 minutos

docker logs -t --since 2m my-apache-app
```
```bash
# Entradas de log desde una fecha y/o hora

docker logs --since 2025-06-28T17:50 my-apache-app
docker logs --since 2025-06-28 my-apache-app
```
```bash
# Log en vivo. ^c para salir

docker logs -f my-apache-app
```
# Creo la imagen my-hello-world:v01.01, creo el contenedor, y lo ejecuto
### Me posiciono en "docker-files/my-hello-world"
```bash
cd ...path-to-docker-files/my-hello-world
```
```bash
# creo la imagen. La ruta al final del comando es donde docker buscará los archivos

docker build -t my-hello-world:v01.01 -f ./v01.01/Dockerfile ./v01.01
# creo y ejecuto el contenedor

docker run --name my-hello-world-01 -d my-hello-world:v01.01
```
```bash
# si intento acceder al servidor desde un terminal (curl) o desde el navegador no podré hacerlo porque no he expuesto el puerto del contenedor y no lo he publicado al iniciar el contenedor (-p)

curl http://localhost:3000
```
# Creo la imagen my-hello-world:v01.02 (latest), creo el contenedor, y lo ejecuto
```bash
# Sigo posicionado en docker-files/my-hello-world y creo ahora la versión v01.02 (latest) de la imagen

docker build -t my-hello-world:v01.02 -t my-hello-world:latest -f ./v01.02/Dockerfile ./v01.02

# creo y ejecuto el contenedor, exponiendo el puerto 3000 publicado como 3300.
# como he utilizado ENTRYPOINT en vez de CMD, le paso el argumento como parametro de "docker run"

docker run --name my-hello-world-02 -p 3300:3000 -d my-hello-world "Argument adicional"
```
```bash
# ahora puedo acceder al servidor desde otro terminal (curl) o desde el navegador con el puerto publicado (-p 3300:3000)

curl http://localhost:3300

# Hola món des de un contenidor Docker!
```
```bash
# y puedo ver las variables de entorno modificadas

docker exec my-hello-world-02 env | grep PATH
docker exec my-hello-world-02 env | grep NEW_VAR
docker inspect --type=container -f='{{json .Config.Env}}' my-hello-world-02
```
# docker [image] save / load
```bash
# guardo las imágenes anteriores en un archivo .tar sin comprimir en el directorio actual (docker-files/my-hello-world)

docker save -o ./my-hello-world.tar my-hello-world my-hello-world:v01.01

# Al no especificar una etiqueta concreta en la imagen "my-hello-world", el archivo de salida incluirá las dos: "v01.02" y "latest"
```
```bash
# si ahora eliminamos todas las imágenes

docker image rm -f my-hello-world my-hello-world:v01.01 my-hello-world:v01.02
```
```bash
# Y las restauramos a partir del archivo .tar

docker image load -i my-hello-world.tar

# volveremos a tener las tres etiquetas de la imagen
```
```bash
# Si guardo las imágenes en un archivo tar comprimido con "gzip"

docker save my-hello-world:v01.01 my-hello-world:latest | gzip > my-hello-world.tar.gz

# Al especificar concretamente la etiqueta "latest" en la imagen "my-hello-world", el archivo de salida solo contendrá esta etiqueta, la etiqueta "v01.02" no se ingluirá en el .gz
```
```bash
# Si elimino las imágenes

docker image rm -f my-hello-world my-hello-world:v01.01 my-hello-world:v01.02
```
```bash
# y las restauro del archivo comprimido

docker load -i ./my-hello-world.tar.gz

# Solo tendremos dos etiquetas. Habremos perdido la etiqueta "v01.02"
```
# Remove all
```bash
if [ "$(docker ps -a -q)" != "" ]; then docker rm -vf $(docker ps -a -q); fi
docker image prune -af
docker volume prune -af
```