#!/bin/bash

if [[ $UID == 0 ]] ; then

    exec flask run
fi
