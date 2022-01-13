#!/bin/bash

if [[ $UID == 0 ]] ; then

    exec sudo -u ccnavuser flask run
    #exec flask run
fi
