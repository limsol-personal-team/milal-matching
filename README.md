# QUICK README

Going to flesh this out better later...

App is split into two directories: `client` that holds the React JS code and `server` for hosting the Django Server.

## Client

Boilerplate `create-react-app` code.

Install NPM packages via node (19.6.0):

```bash
cd client
npm install
```

In `/src folder`, create `.env.development.local` file to load env variables during local development (via `npm start`):

```
REACT_APP_AUTH0_DOMAIN={AUTH0_DOMAIN}
REACT_APP_AUTH0_CLIENT_ID={AUTH0_CLIENT_ID}
REACT_APP_AUTH0_AUDIENCE=https://milal-app.com
REACT_APP_AUTH0_CALLBACK_URL=http://localhost:3000/ops
REACT_APP_SERVER_URL=http://localhost:3000
```

Run the app in the development mode and
open http://localhost:3000 to view it in the browser:

```bash
npm start
```

The page will reload if you make edits.
You will also see any lint errors in the console.

## Server

Boilerplate Django App using Django Rest Framework. Follows [MVC](https://developer.mozilla.org/en-US/docs/Glossary/MVC) design pattern.

Setup python (3.10.4) packages by creating virtual env in python and activating it:

```bash
cd server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create `.env` file with following values (use `PROD_ENV=false` for local development):

```
# Django Server Config
# This file is only useful for local server. 
# We set these env vars in ECS via Task Definitions for Prod.
## PROD_ENV - lower case, CAREFUL TURNING IT ON. For interacting with Prod DB.

# LOCAL DEV VARS
PROD_ENV=false
DJANGO_SECRET_KEY={DJ_SECRET_KEY}
PORT=8000
DEBUG_ENABLE=false

# PROD VARS
## DB Creds
DB_NAME={DB_CONFIG}
DB_USER={DB_CONFIG}
DB_PASSWORD={DB_CONFIG}
DB_ENDPOINT={DB_CONFIG}
DB_PORT={DB_CONFIG}

## Auth0 Config
AUTH0_DOMAIN={AUTH0_CONFIG}
AUTH0_AUDIENCE={AUTH0_CONFIG}

## Email Config
EMAIL_HOST_USER={EMAIL_HOST_USER}
EMAIL_HOST_PASSWORD={EMAIL_HOST_PASSWORD}
DEFAULT_FROM_EMAIL={DEFAULT_FROM_EMAIL}

```

- The `.env` file is used to run docker containers with specified config context. Create a separate shell file (i.e. `.envShell`) that exports all configs into the current shell for local testing via `python manage.py runserver`

Run migrations + server and open http://localhost:8000/ to view DRF Browsable API in browser:

```bash
python manage.py migrate
python manage.py runserver
```

If update to models, run commands to generate migrations:

```bash
python manage.py makemigrations
```

To see current state of migrations, run:

```bash
python manage.py showmigrations
```

Start up Redis cache by installing and running server:
```bash
brew install redis
redis-server
```

## GIT Tips

If you are in `main`, create and checkout into your own branch. If you already have your own branch, remove `-b` flag :

```bash
git checkout -b my-branch
```

Update your own branch with `main` so that you can make a pull request:

```bash
git pull main
```

Stage the edits, commit, and push them:

```
git add .
git commit -m "YOUR_MESSAGE_HERE"
git push
```

## Docker

You can also use Docker to develop locally.

Download [Docker Desktop](https://www.docker.com/products/docker-desktop/)

Build the image (do not set build arg when building for prod):

```
docker build -t YOUR_TAG .
```

Run the image in a container and expose 8000 (in prod we run with env vars configured in console). Make sure to check `PROD_ENV` value:

```
docker run --env-file server/.env -p 8000:8000 --name milal-app YOUR_TAG
```

Exec into a container:

```
docker exec -it milal-app sh
```

Other useful commands:

```
docker stop $(docker ps -aq) 
docker rm $(docker ps -aq)
```


## Linter:

### Python Server

For commits to python `server`, we use [pre-commit](https://pre-commit.com/). `CD` into `server` and run:
```bash
pre-commit install
```
This will install pre-commit and any commit will run the python linter on `server` files only.

### JS Client

For commits to js `client`, we use [prettier](https://prettier.io/docs/en/install.html#git-hooks) with git hooks. `CD` into top level directory and run commands:
```bash
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

`CD` into `client` and run `npm i` to install new devDependencies.

This will run prettier before committing any changes in `client` folder.

## FOR PROD:

Useful AWS commands:
```
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_TAG/milal-app

docker build -t YOUR_ECR_TAG/milal-app .

docker push YOUR_ECR_TAG/milal-app:latest

aws ecs update-service --cluster MilalAppCluster --service MilalAppService --force-new-deployment

```

Client Environment Vars:
- Create `client/.env.production` to use prod env values when running `npm run build`. See Client section above for variables to set.

Server Environment Vars:
- Update environment vars in task definitions in ECS


## Tips

- For managing Node versions, use [nvm](https://github.com/nvm-sh/nvm). For managing python versions, use [pyenv](https://github.com/pyenv/pyenv)
  - `nvm install 19.6.0`
  - `pyenv install 3.10.4`
  - `pyenv local 3.10.4` 
- pip installation errors on MacOS:
  - `Error: pg_config executable not found.`
    - Install postgresql on your device via `brew install postgresql`

