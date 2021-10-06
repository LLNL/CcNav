.PHONY: default
.PHONY: test
.PHONY: clean

#DYNINST = /g/g0/legendre/workspace/spack/opt/spack/linux-rhel7-x86_64/gcc-8.1.0/dyninst-10.0.0-u5zpf6latj5jc5mat4ut6h6zm2e3ya6d
#BOOST = /usr/WS1/legendre/spack/opt/spack/linux-rhel7-x86_64/gcc-8.1.0/boost-1.69.0-bwshziub3mwja23lhp2s3eh435st2w64

CXX = /usr/tce/packages/gcc/gcc-8.1.0/bin/g++
DYNINST = /usr/gapps/spot/optvis/toss_3_x86_64_ib
BOOST = /usr/gapps/spot/optvis/toss_3_x86_64_ib

DYNINST_LIB = $(DYNINST)/lib
DYNINST_INC = $(DYNINST)/include
BOOST_LIB = $(BOOST)/lib
BOOST_INC = $(BOOST)/include
CFLAGS = -g -O2 -std=c++11
CXXFLAGS = $(CFLAGS)

# DYNINST_LIB = /usr/lib64/dyninst
# DYNINST_INC = /usr/include/dyninst
# BOOST_LIB = /usr/lib64/boost
# BOOST_INC = /usr/include/boost


default: optparser test

optparser.o: optparser.cc
	$(CXX) $(CXXFLAGS) -o $@ $< -Wall -g -I $(DYNINST_INC) -I $(BOOST_INC) -c

optparser: optparser.o
	$(CXX) $(CXXFLAGS) -o $@ $< -g -L $(DYNINST_LIB) -Wl,-rpath,$(DYNINST_LIB) -Wl,-rpath,$(BOOST_LIB) -L$(BOOST_LIB) -lparseAPI -linstructionAPI -lsymtabAPI -lboost_system -lcommon

test: libtest.so.pdf libtest.so.json
	json_verify < libtest.so.json

libtest.so: test.c
	$(CC) $(CXXFLAGS) -o $@ $< -g -shared -fPIC -nostartfiles

libtest.so.json libtest.so.dot: libtest.so optparser
	./optparser ./libtest.so

libtest.so.pdf: libtest.so.dot
	dot -Tpdf -o$@ libtest.so.dot

clean:
	rm -f libtest.so libtest.so.json libtest.so.dot libtest.so.pdf optparser optparser.o
