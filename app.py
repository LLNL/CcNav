import time

import redis

from flask import Blueprint, render_template, abort
from jinja2 import TemplateNotFound
from flask import Flask
from flask import render_template

app = Flask(__name__)
cache = redis.Redis(host='redis', port=6379)

def get_hit_count():
    retries = 5
    while True:
        try:
            return cache.incr('hits')
        except redis.exceptions.ConnectionError as exc:
            if retries == 0:
                raise exc
            retries -= 1
            time.sleep(0.5)

@app.route('/')
def hello():
    count = get_hit_count()
    site = Blueprint('site', __name__, template_folder='templates')
    #return 'Arc asdf5  Hello World! I have been seen {} times.\n'.format(count)
    return render_template("index.html")