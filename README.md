# QUICK README

Going to flesh this out better later...

App is split into two directories: `client` that holds the React JS code and `server` for hosting the Django Server.

## Client

`CD` into Client Dir.

Boilerplate `create-react-app` code.

```js
npm start
```

Runs the app in the development mode.
Open http://localhost:3000 to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

## Server

`CD` into Server Dir.

Boilerplate Django App using Django Rest Framework. Follows [MVC](https://developer.mozilla.org/en-US/docs/Glossary/MVC) design pattern.

Run migrations and open http://localhost:8000/ to view DRF Browsable API in browser:

```python
python manage.py migrate
python manage.py runserver
```

If update to models, run commands to generate migrations:

```python
python manage.py makemigrations
```