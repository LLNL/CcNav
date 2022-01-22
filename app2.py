import time

from flask import Blueprint, render_template, abort
from jinja2 import TemplateNotFound
from flask import Flask
from flask import render_template

app = Flask(__name__, template_folder='.')

@app.route('/')
def hello():
    return render_template("index.html")


@app.route('/get_file')
def get_file():

    from flask import request

    # get the source for this filename.
    file_path = request.args.get('see_sourcecode')

    from pathlib import Path
    contents = Path(file_path).read_text()

    return contents



@app.route('/optvis_request')
def optvis_request():

    from flask import request
    import subprocess

    command = request.args.get('command');
    command = command.split(' ') # /g/g0/pascal/inputs/1/a.out'

    # optparser.py open returns this: /tmp/optvis_zf90q08a
    # the server think this is an error because it's nonzero, so let's catch it
    # to prevent them from sending an error response.

    #output = subprocess.call( command )
    #sout = 'output: ' + str(output)
    out = subprocess.check_output( command )


    #from subprocess import PIPE, run

    #result = run(command, stdout=PIPE, stderr=PIPE, universal_newlines=True)
    #print(result.returncode, result.stdout, result.stderr)

    #return 'It is ' + result.stdout + \
    #       '   error=' + result.stderr + \
    #       '    rc=' + str(result.returncode)
    return out