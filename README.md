To setup a development environment:
1. Install Node.js
2. Install Mongodb
- https://www.mongodb.com/dr/fastdl.mongodb.org/win32/mongodb-win32-x86_64-2008plus-ssl-4.0.4-signed.msi/download
- Add environment path var. - C:\Program Files\MongoDB\Server\4.0\bin [or whereever mongod.exe is]
- Command prompt down to C:\
	- mkdir MongoData
	- mkdir MongoLogs
	- mongod --dbpath MongoData\ --logpath MongoLogs\mongolog.log

Reference - https://docs.microsoft.com/en-us/azure/virtual-machines/windows/install-mongodb

3. Install IDE (probably at least Visual Studio and Android Studio)

To run application:
1. browse to local host 3000 to see web client
2. node index.js
3. node mqttBroker.js
4. mongod

To run tests:
1. cd application/
2. npm test 


