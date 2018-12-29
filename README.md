To setup development environment:
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
1. "node index.js" to run the main application on localhost:3000
2. "mongod" to start MongoDB on the default URI mongodb://localhost:27017
3. "node mqttBroker.js" to start the MQTT broker. This runs on mqtt://localhost:4000. Note: mongo must be running before the MQTT broker can be run.

To run tests:
1. cd application/
2. npm test 

Current hardware list:
1. ESP8266 WIFI shield RB-Mkf-14 from RobotShop ($9.80)
    a. Reference: https://www.instructables.com/id/ESP8266-Pro-Tips/?utm_source=newsletter&utm_medium=email

