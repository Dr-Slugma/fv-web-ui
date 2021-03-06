# Docker development environment (meant for localhost work)

This environment is setup for localhost work. It includes an embedded database (Derby), and embedded Elasticsearch.

## Prerequisites

1. You must have Docker installed and running, as well as git installed. Docker can be downloaded from [this link](https://docs.docker.com/install/) and git can be downloaded from [this link](https://git-scm.com/downloads).
2. Basic knowledge of Docker, Nuxeo and bash.
3. Ensure you have the two environment variables set for CYPRESS_FV_USERNAME and CYPRESS_FV_PASSWORD which will be passed into the container and used to create an admin account during the initial setup. After setting environment variables they can be checked by running the following in your terminal window:
```
printenv
```

## Initial Setup

### Step 1:

Clone the fv-web-ui repository and navigate into fv-web-ui/docker/
```
git clone https://github.com/First-Peoples-Cultural-Council/fv-web-ui.git
cd ./fv-web-ui/docker
```

### Step 2:
#### There are now two options:
#### Option A - Run the setup script (easier but less control - recommended):
##### A-1:
```
./setup_docker.sh
```
You may have to give the script execute permission first:
```
chmod +x setup_docker.sh
```
#### Option B - Run the commands individually:
##### B-1:
Navigate to the cloned folder and build this image locally:
```docker build -t me/nuxeo-dev .```

##### B-2::
Setup a folder on your local machine to store some persistant data from within the container (e.g. Nuxeo data), and a built package of FirstVoices, for example: `~/Dev/Dependencies/nuxeo_dev_docker`

##### B-3:
In the `fv-web-ui` project (cloned from https://github.com/First-Peoples-Cultural-Council/fv-web-ui), run `mvn clean install`, then copy the package `FirstVoices-marketplace/target/FirstVoices-marketplace-package-latest.zip` into the `nuxeo_dev_docker` folder. It is best to build the application outside of the docker container to make use of Maven and Node caching.

The Option B `run` command below assumes the following volumes on the host (change to match your file structure):

`~/Dev/Dependencies/nuxeo_dev_docker` = Directory on host mapped to /tmp/ directory. Useful for storing data you want to persist in the container.
`~/Dev/Dependencies/nuxeo_dev_docker/data` = Directory where Nuxeo data will be stored persisted.
`~/Dev/Dependencies/nuxeo_dev_docker/logs` = Directory where log files will be mapped.

### Step 3:
##### Startup the docker container
If you used Option A and are in the fv-web-ui/docker/ directory:
```
docker run --name nuxeo-dev --rm -ti -p 8080:8080 -v ${PWD}/nuxeo_dev_docker:/opt/nuxeo/server/nxserver/tmp -v ${PWD}/nuxeo_dev_docker/data:/opt/nuxeo/ext_data -v ${PWD}/nuxeo_dev_docker/logs:/var/log/nuxeo -e NUXEO_PACKAGES="nuxeo-dam nuxeo-jsf-ui" -e NUXEO_URL="http://localhost:8080" -e CYPRESS_FV_USERNAME -e CYPRESS_FV_PASSWORD me/nuxeo-dev
```

If you used Option B:
```
docker run --name nuxeo-dev --rm -ti -p 8080:8080 -v ~/Dev/Dependencies/nuxeo_dev_docker:/opt/nuxeo/server/nxserver/tmp -v ~/Dev/Dependencies/nuxeo_dev_docker/data:/opt/nuxeo/ext_data -v ~/Dev/Dependencies/nuxeo_dev_docker/logs:/var/log/nuxeo -e NUXEO_PACKAGES="nuxeo-dam nuxeo-jsf-ui" -e NUXEO_URL="http://localhost:8080" -e CYPRESS_FV_USERNAME -e CYPRESS_FV_PASSWORD me/nuxeo-dev
```

This may take a few minutes as Nuxeo starts up.

Notes:
* To expose remote debugging via port 8787: ```-p 8787:8787```\
* To include automation traces: ```-e NUXEO_AUTOMATION_TRACE="true"```\
* To enable Dev mode: ```-e NUXEO_DEV_MODE="true"```\
* To change the data folder: ```-e NUXEO_DATA="/opt/nuxeo/ext_data"```\

### Step 5:

Run the initial backend setup script in a new terminal once the backend server has started:

```
./initialsetup.sh
```
You may have to give the script execute permission first:
```
chmod +x initialsetup.sh
```

This will setup the proper data structure for FirstVoices, and create an admin account based on your environment variables.

### Step 6:

* You can now access the FirstVoices backend by going to localhost:8080 and logging in.
* You can also [run the frontend independently](https://github.com/First-Peoples-Cultural-Council/fv-web-ui/tree/master/frontend)

## Creating an archive to work in
By default, your instance will not have any archives to work in.
You will need to create a language family, language and dialect (i.e. archive).

Log into the backend, navigate to Workspace (top menu) -> FV -> Workspaces -> Data and create a Language Family, a Language and a Dialect (by clicking "New" in each view). You will then be able to work within that archive via the front end.

## Pushing Changes
After making a change to a Nuxeo module, you can deploy your change to the docker container in two ways:

### Method 1 (deploy entire ZIP - recommended for changes in multiple modules):

* Build the project at ```fv-web-ui```
* Copy ```FirstVoices-marketplace/target/FirstVoices-marketplace-package-latest.zip``` to your mounted directory (e.g. in Option A: ```docker/nuxeo_dev_docker```
* Execute the following command to stop the server, install the package and start the server:
```
docker exec nuxeo-dev /bin/bash -c "nuxeoctl stop && nuxeoctl mp-install --accept=yes /opt/nuxeo/server/nxserver/tmp/FirstVoices-marketplace-package-latest.zip && nuxeoctl start"
```

### Method 2 (deploy a single module):

* Navigate into the module you changed (e.g. FirstVoicesSecurity) and build it
* Execute the following command to copy the JAR into the server, and restart the server:
```
docker cp target/FirstVoicesSecurity-*.jar nuxeo-dev:/opt/nuxeo/server/nxserver/bundles/ && docker exec nuxeo-dev nuxeoctl restart
```

## Useful commands/common tasks/tips

### List running containers:

```docker ps```

### Log into container called 'nuxeo-dev':

```docker exec -it nuxeo-dev /bin/bash```

## TODO
1. Use `docker-compose` to optionally setup Apache2, Elasticsearch, and Postgresql
2. Add additional requirements such as FFMPEG and CCExtractor to image.
3. Figure out how to hot-reload into a docker container (potentially tied into IntelliJ). See https://doc.nuxeo.com/nxdoc/nuxeo-cli/.
