from flask import Flask, render_template, request
import subprocess
from pathlib import Path

app = Flask(__name__, template_folder='.')

@app.route('/')
def hello():
    return render_template("index.html")


@app.route('/get_file')
def get_file():
    # get the source for this filename.
    file_path = request.args.get('see_sourcecode')
    contents = Path(file_path).read_text()
    return contents



@app.route('/optvis_request')
def optvis_request():
    command = request.args.get('command').split(' ') # /g/g0/pascal/inputs/1/a.out'
    out = subprocess.check_output( command )
    return out