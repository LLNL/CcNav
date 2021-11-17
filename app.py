import time

import redis

from flask import Blueprint, render_template, abort
from jinja2 import TemplateNotFound
from flask import Flask
from flask import render_template

app = Flask(__name__, template_folder='.')
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


@app.route('/optvis_request')
def optvis_request():

    #import os
    #ret = os.system()
    from flask import request
    import subprocess

    command = request.args.get('command');
    command = command.split(' ') # /g/g0/pascal/inputs/1/a.out'
    time = subprocess.call( command )

    return 'It is' + str(time)


@app.route('/')
def hello():
    count = get_hit_count()
    #site = Blueprint('site', __name__, template_folder='../')
    #return 'Arc asdf5  Hello World! I have been seen {} times.\n'.format(count)
    return render_template("index.html")