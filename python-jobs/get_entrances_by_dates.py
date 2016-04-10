#!/usr/bin/env python
from urllib2 import Request, urlopen
from urllib import urlencode
import base64
import json
import requests
import MySQLdb
import datetime
import time
import yaml
import scanalytics


array_keys_list = ["1AMDJ"]  # may have one or more array keys in the list

def getAndSaveData(db):
    now = datetime.datetime.now()
    twelveAmToday = datetime.datetime.combine(now.date(), datetime.time(0,0,0))
    isoDateNow = now.isoformat()
    isoDateDayStart = twelveAmToday.isoformat()
    sqlFormatNow = datetime.datetime.strftime(now,'%Y-%m-%d %H:%M:%S')
    sqlFormatDayStart = datetime.datetime.strftime(twelveAmToday,'%Y-%m-%d %H:%M:%S')
    
    username = cfg['scanalytics']['username']
    password = cfg['scanalytics']['password']
    clientId = cfg['scanalytics']['clientId']
    clientSecret = cfg['scanalytics']['clientSecret']
    access_token = scanalytics.get_token(username, password, clientId, clientSecret)
    print(sqlFormatDayStart)
    print(sqlFormatNow)
    
    #scanalytics.get_available_metrics(access_token)

    for doc in scanalytics.get_entrances_report(access_token, array_keys_list, isoDateDayStart, isoDateNow):
        entrances = doc["entrances"]
        exits = doc["exits"]
        occupancy = entrances - exits
        print(doc["name"])
        print(entrances)
        print(exits)
        print(occupancy)
    
    # Process with list command in db
    c = db.cursor()
    try:
        sql_cmd = "INSERT INTO occupancy (zone_id, zone_name, time_from, time_to, entrances, exits, occupancy) VALUES (1,'Crowne Fitness Center','"+ sqlFormatDayStart + "','" + sqlFormatNow + "'," + str(entrances) + "," + str(exits) + "," + str(occupancy) + ")"
        c.execute(sql_cmd)
        db.commit()
    except Exception as e:
        print(e)
        pass
   
if __name__ == "__main__":
    with open("config.yml", 'r') as ymlfile:
        cfg = yaml.load(ymlfile)

    # Connection to Heroku mysql db
    
    # mysql_env = 'mysql' # Production
    mysql_env = 'mysql_heroku' # Heroku test

    host = cfg[mysql_env]['host']
    username = cfg[mysql_env]['user']
    passwd = cfg[mysql_env]['passwd']
    database = cfg[mysql_env]['db']
    db=MySQLdb.connect(host=host,user=username, passwd=passwd,db=database,charset='utf8',use_unicode=True)
    
    getAndSaveData(db)
