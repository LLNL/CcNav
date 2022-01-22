from flask import Flask
from flask import request
import subprocess

app = Flask(__name__, template_folder='.')

@app.route('/optvis_request')
def optvis_request():

    command = request.args.get('command');
    command = command.split(' ') # /g/g0/pascal/inputs/1/a.out'
    time = subprocess.call( command )

    return 'It is' + str(time)