#!/bin/bash

if [[ $UID == 0 ]] ; then

    export FLASK_APP=app2.py
    export FLASK_RUN_HOST=0.0.0.0
    export LC_ALL=C.UTF-8
    export LANG=C.UTF-8

    echo 'FLASK_APP='$FLASK_APP
    exec sudo --preserve-env=FLASK_APP,FLASK_RUN_HOST,LC_ALL,LANG -u ccnavuser flask run
    #exec flask run
fi
