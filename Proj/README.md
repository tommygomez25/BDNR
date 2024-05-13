## SETUP

### INSTALL riak:

curl -fsSL https://packages.erlang-solutions.com/ubuntu/erlang_solutions.asc | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/erlang.gpg

echo "deb https://packages.erlang-solutions.com/ubuntu focal contrib" | sudo tee /etc/apt/sources.list.d/erlang-solution.list

sudo apt update
sudo apt upgrade

sudo apt-get install build-essential libc6-dev-i386 git cmake make ubuntu-dev-tools erlang curl software-properties-common apt-transport-https lsb-release libpam0g-dev debhelper

sudo update-alternatives --set fakeroot /usr/bin/fakeroot-tcp
git clone https://github.com/basho/riak.git
cd riak
sudo apt-get install libsnappy-dev
make rel

mkdir rel/pkg/packages
cd rel/pkg/packages
curl -o riak_3.2.0-OTP22_amd64.deb https://files.tiot.jp/riak/kv/3.2/3.2.0/ubuntu/focal64/riak_3.2.0-OTP22_amd64.deb

sudo dpkg -i riak_3.2.0-OTP22_amd64.deb

(cd to project root)

sudo cp config_files/riak.conf /etc/riak/riak.conf
sudo cp config_files/advanced.config /etc/riak/advanced.config

### START riak:

sudo riak daemon

### STOP riak:

sudo riak stop


### SETUP frontend (inside frontend folder):

(tested using: 
 - node: 21
 - npm: 10.2 )

npm install

### START frontend: 

npm start


### SETUP backend (inside backend folder):

(tested using: 
 - node: 21
 - npm: 10.2 )

npm install
node populate.js

( CTRL+C when "Data stored successfully." is printed in the console)

### START backend

npm start