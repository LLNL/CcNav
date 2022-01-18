#!/bin/bash

if [[ $UID == 0 ]] ; then

    export FLASK_APP=app2.py
    export FLASK_RUN_HOST=0.0.0.0
    export LC_ALL=C.UTF-8
    export LANG=C.UTF-8

    echo 'FLASK_APP='$FLASK_APP
    exec sudo -u ccnavuser flask run
    #exec flask run
fi
