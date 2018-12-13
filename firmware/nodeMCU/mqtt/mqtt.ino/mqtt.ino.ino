/*
 *  HTTP over TLS (HTTPS) example sketch
 *
 *  This example demonstrates how to use
 *  WiFiClientSecure class to access HTTPS API.
 *  We fetch and display the status of
 *  esp8266/Arduino project continuous integration
 *  build.
 *
 *  Limitations:
 *    only RSA certificates
 *    no support of Perfect Forward Secrecy (PFS)
 *    TLSv1.2 is supported since version 2.4.0-rc1
 *
 *  Created by Ivan Grokhotkov, 2015.
 *  This example is in public domain.
 */

#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <DNSServer.h>            //Local DNS Server used for redirecting all requests to the configuration portal
#include <ESP8266WebServer.h>     //Local WebServer used to serve the configuration portal
#include <WiFiManager.h>

WiFiClient wifiConnection;
PubSubClient mqttClient(wifiConnection);

const char* ssid = "S6RJ4";
const char* password = "94A43332AA";

const char* mqttHost = "192.168.1.56";
const int mqttPort = 8080;

const int led = 13;

void setup() {
  pinMode(led, OUTPUT);
  digitalWrite(led, 0);
  Serial.begin(115200);
  Serial.print("connecting to ");
  Serial.println(ssid);
  
  WiFi.mode(WIFI_STA);

  connect();
//  WiFi.begin(ssid, password);
//  while (WiFi.status() != WL_CONNECTED) {
//    delay(500);
//    Serial.print(".");
//  }
//  Serial.println("");
//  Serial.println("WiFi connected");
//  Serial.println("IP address: ");
//  Serial.println(WiFi.localIP());


//  setupMQTT();
  Serial.println("Done setting up");
}

void connect() {
  WiFiManager wifiManager;

  wifiManager.autoConnect();
  wifiManager.setAPCallback(configModeCallback);

}

void configModeCallback (WiFiManager *myWiFiManager) {
  Serial.println("Entered config mode");
  Serial.println(WiFi.softAPIP());

  Serial.println(myWiFiManager->getConfigPortalSSID());
}


void setupMQTT() {
  //connect to the wifiConnection with mqtt
  mqttClient.setServer(mqttHost, mqttPort);

  //set the callback when the programme recieves a callback
  mqttClient.setCallback(callback);

  while (!mqttClient.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (mqttClient.connect("device1")) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" try again in one second");
      // Wait a second before retrying
      delay(1000);
    }
  }

  mqttClient.publish("fromESP8266", "hi from esp");
}

void callback(char *topic, byte *payload, unsigned int length) {
  
  char message_buff[3];
  int i = 0;

  //for loop that loops through the playload array
  for(i = 0; i < length; i++) {
    message_buff[i] = payload[i];
  }

  //\0 is null, this makes it that the String typecast understands where to stop
  message_buff[i] = *"\0";

  Serial.println(String(message_buff));
}

void loop() {
}
