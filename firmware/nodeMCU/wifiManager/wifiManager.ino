#include <ESP8266WiFi.h>          //https://github.com/esp8266/Arduino

//needed for library
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include "WiFiManager.h"         //https://github.com/tzapu/WiFiManager

std::unique_ptr<ESP8266WebServer> server;

void handleRoot() {
  server->send(200, "text/plain", "hello from esp8266!");
}

void handleNotFound() {
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server->uri();
  message += "\nMethod: ";
  message += (server->method() == HTTP_GET) ? "GET" : "POST";
  message += "\nArguments: ";
  message += server->args();
  message += "\n";
  for (uint8_t i = 0; i < server->args(); i++) {
    message += " " + server->argName(i) + ": " + server->arg(i) + "\n";
  }
  server->send(404, "text/plain", message);
}

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  //Serial.setDebugOutput(true);
  //WiFiManager
  //Local intialization. Once its business is done, there is no need to keep it around
  WiFiManager wifiManager;
  //reset saved settings
  wifiManager.resetSettings();

  //fetches ssid and pass from eeprom and tries to connect
  //if it does not connect it starts an access point with the specified name
  //here  "AutoConnectAP"
  //and goes into a blocking loop awaiting configuration
  //wifiManager.autoConnect("AutoConnectAP");
  //or use this for auto generated name ESP + ChipID
  wifiManager.autoConnect();


  //if you get here you have connected to the WiFi
  Serial.println("connected...yeey :)");
  
  server.reset(new ESP8266WebServer(WiFi.localIP(), 80));

  server->on("/", handleRoot);

  server->on("/inline", []() {
    server->send(200, "text/plain", "this works as well");
  });

  server->onNotFound(handleNotFound);

  server->begin();
  Serial.println("HTTP server started");
  Serial.println(WiFi.localIP());
}

void loop() {
  // put your main code here, to run repeatedly:
  server->handleClient();
}
