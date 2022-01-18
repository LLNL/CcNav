#FROM jupyter/minimal-notebook
FROM ghcr.io/autamus/dyninst:11.0.1
#FROM ubuntu:focal

USER root
RUN apt-get    update

RUN apt-get install -y gcc g++
RUN apt-get install -y cmake
RUN apt-get install -y libboost-dev
# yajl-tools is for json_verify which is in the optparser Makefile
RUN apt-get install -y yajl-tools
# graphviz is required for "dot" which is in the optparser Makefile
RUN apt-get install -y git vim graphviz
RUN apt-get install -y libtbb2 libtbb-dev
RUN apt-get install -y libboost-atomic-dev libboost-chrono-dev libboost-date-time-dev libboost-filesystem-dev libboost-system-dev libboost-thread-dev libboost-timer-dev
RUN apt-get install -y curl xz-utils m4
RUN apt-get install -y zlib1g zlib1g-dev

# utrns out we need this to run flask as a user
RUN apt-get install -y supervisor

# got a warning message from running "open". it said: "UserWarning: redis-py works best with hiredis. Please consider installing"
RUN apt-get install -y python3-pip libhiredis-dev

RUN apt-get install -y sudo


WORKDIR /home/ccnavuser
RUN git  clone https://github.com/LLNL/CcNav.git

WORKDIR /home/ccnavuser/CcNav
RUN git  checkout pa-docker-static-setup
RUN git  fetch
RUN git   pull  origin pa-docker-static-setup

WORKDIR /home/ccnavuser/CcNav/optparser/optparser
RUN make -f Makefile.container

WORKDIR /home/ccnavuser
COPY . .

ENV FLASK_APP=app2.py
ENV FLASK_RUN_HOST=0.0.0.0

ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8

#  create sample a.out executable for testing purposes.
WORKDIR  /home/ccnavuser/CcNav/misc/sample_inputs/a0
RUN gcc  -g /home/ccnavuser/CcNav/misc/sample_inputs/a0/hello.c -o /home/ccnavuser/a3.out

RUN chmod 755 /home/ccnavuser/CcNav/misc/fixperms.bash
#RUN chmod 755 /home/ccnavuser/CcNav/misc/runflask.sh

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt
EXPOSE 5000 5000/tcp

WORKDIR /home/ccnavuser/CcNav
WORKDIR /home/ccnavuser

#RUN g++ -o optparser /home/ccnavuser/CcNav/optparser/optparser/optparser.cc -g -O2 -std=c++11 -Wall -lparseAPI -linstructionAPI -lsymtabAPI -lboost_system -lcommon
#RUN cp /home/ccnavuser/CcNav/optparser/optparser.py .


RUN addgroup ccnavgroup
RUN useradd --create-home --shell /bin/bash -g ccnavgroup ccnavuser

RUN echo "[program:flask_app]\r\nuser=ccnavuser" >> /etc/supervisor/supervisord.conf

ENTRYPOINT ["flask", "run"]
#CMD [ "/home/ccnavuser/CcNav/misc/runflask.sh" ]
#CMD [ "sleep 5000000" ]