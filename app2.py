import time
import redis

from flask import Blueprint, render_template, abort
from jinja2 import TemplateNotFound
from flask import Flask
from flask import render_template

app = Flask(__name__, template_folder='.')

@app.route('/')
def hello():
    return render_template("index.html")


@app.route('/optvis_request')
def optvis_request():

    from flask import request
    import subprocess

    command = request.args.get('command');
    command = command.split(' ') # /g/g0/pascal/inputs/1/a.out'

    # optparser.py open returns this: /tmp/optvis_zf90q08a
    # the server think this is an error because it's nonzero, so let's catch it
    # to prevent them from sending an error response.
    try:
        output = subprocess.check_output( command )
    except:
        return 'It 0'

    return 'It is' + str(output)
