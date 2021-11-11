#FROM jupyter/minimal-notebook
FROM ghcr.io/autamus/dyninst:11.0.1
#FROM ubuntu:focal

RUN apt-get update

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
RUN apt-get install -y python3-pip
#CMD [ "/bin/bash" ]

#WORKDIR /code/binutils
#RUN curl ftp://sourceware.org/pub/binutils/snapshots/binutils-2.36.90.tar.xz --output binutils-2.36.90.tar.xz
#RUN tar xf binutils-2.36.90.tar.xz
#WORKDIR /code/binutils/binutils-2.36.90/build
#RUN ../configure CFLAGS='-fPIC -O2' --prefix=/code/binutils/install --enable-install-libiberty
#RUN make
#RUN make install

#WORKDIR /code/elfutils
#RUN curl ftp://sourceware.org/pub/elfutils/0.185/elfutils-0.185.tar.bz2 --output elfutils-0.185.tar.bz2
#RUN tar xf elfutils-0.185.tar.bz2
#WORKDIR /code/elfutils/elfutils-0.185/build
#RUN ../configure --prefix=/code/elfutils/install --disable-debuginfod --disable-libdebuginfod CFLAGS=-O2
#RUN make
#RUN make install

#WORKDIR /code/dyninst
#RUN git clone https://github.com/dyninst/dyninst.git
#WORKDIR /code/dyninst/dyninst/
#RUN git checkout v11.0.1
#WORKDIR /code/dyninst/dyninst/build
#RUN cmake -DCMAKE_INSTALL_PREFIX=/usr -DBUILD_DOCS=Off -DLibIberty_ROOT_DIR=/code/binutils/install -DElfUtils_ROOT_DIR=/code/elfutils/install -DCMAKE_BUILD_TYPE=Release ..
#RUN make
#RUN make install

WORKDIR /root/
RUN git clone https://github.com/LLNL/CcNav.git
WORKDIR /root/CcNav
RUN git checkout pa-docker-static-setup
RUN git fetch
RUN git      pull origin pa-docker-static-setup

WORKDIR /root/CcNav/optparser/optparser
RUN make -f Makefile.container

#  create sample a.out executable for testing purposes.
WORKDIR /root/CcNav/misc/sample_inputs/a0
RUN g++ hello.c

WORKDIR /code
COPY . .

ENV FLASK_APP=app2.py
ENV FLASK_RUN_HOST=0.0.0.0

ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt
EXPOSE 5000

WORKDIR /code/CcNav
WORKDIR /code

#RUN g++ -o optparser /code/CcNav/optparser/optparser/optparser.cc -g -O2 -std=c++11 -Wall -lparseAPI -linstructionAPI -lsymtabAPI -lboost_system -lcommon
#RUN cp /code/CcNav/optparser/optparser.py .

#CMD ["script", "--return", "--quiet", "flask run", "/dev/null"]
#CMD ["/bin/bash", "-c", "flask", "run"]
#CMD ["flask", "run"]
ENTRYPOINT ["flask", "run"]
