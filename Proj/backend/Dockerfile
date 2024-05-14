# from Ubuntu 20.04
FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

COPY . /app

RUN apt update 
RUN apt upgrade -y

RUN apt install -y sudo

RUN sudo apt install -y curl gnupg2

RUN curl -fsSL https://packages.erlang-solutions.com/ubuntu/erlang_solutions.asc | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/erlang.gpg

RUN echo "deb https://packages.erlang-solutions.com/ubuntu focal contrib" | sudo tee /etc/apt/sources.list.d/erlang-solution.list

# Update and install packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libc6-dev-i386 \
    git \
    cmake \
    make \
    ubuntu-dev-tools \
    erlang \
    logrotate \
    software-properties-common \
    apt-transport-https \
    lsb-release \
    libpam0g-dev \
    debhelper \
    tzdata \
    && ln -fs /usr/share/zoneinfo/Etc/UTC /etc/localtime \
    && dpkg-reconfigure -f noninteractive tzdata \
    && rm -rf /var/lib/apt/lists/*

RUN sudo update-alternatives --set fakeroot /usr/bin/fakeroot-tcp # workaround to fix wsl fakeroot problem

RUN git clone https://github.com/basho/riak.git
RUN mkdir riak/rel/pkg/packages

RUN cd riak/rel/pkg && curl -o riak_3.2.0-OTP22_amd64.deb https://files.tiot.jp/riak/kv/3.2/3.2.0/ubuntu/focal64/riak_3.2.0-OTP22_amd64.deb

RUN cd riak && make rel

RUN cd riak/rel/pkg/packages && sudo dpkg -i riak_3.2.0-OTP22_amd64.deb

CMD ["riak daemon"]

