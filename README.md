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

Run the app in the development mode and
open http://localhost:3000 to view it in the browser:

```bash
npm start
```

The page will reload if you make edits.
You will also see any lint errors in the console.

## Server

Boilerplate Django App using Django Rest Framework. Follows [MVC](https://developer.mozilla.org/en-US/docs/Glossary/MVC) design pattern.

Setup python (2.7) packages by creating virtual env in python and activating it:

```bash
cd server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

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

## GIT Tips

If you are in `main`, create and checkout into your own branch. If you already have your own branch, remove `-b` flag :

```
git checkout -b my-branch
```

Update your own branch with `main` so that you can make a pull request:

```
git pull main
```

Stage the edits, commit, and push them:

```
git add .
git commit -m "YOUR_MESSAGE_HERE"
git push
```

NOTE: 

For commits to python `server`, we use [pre-commit](https://pre-commit.com/). `CD` into `server` and run:
```
pre-commit install
```
This will install pre-commit and any commit will run the python linter on `server` files only.


## Tips

- For managing Node versions, use [nvm](https://github.com/nvm-sh/nvm). For managing python versions, use [pyenv](https://github.com/pyenv/pyenv)

- API Docs:
  - https://readthedocs.org/projects/django-rest-framework-old-docs/

  - https://docs.djangoproject.com/en/1.11/
