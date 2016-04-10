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

def roundTime(dt=None):
    """Round a datetime object to a multiple of a timedelta
    dt : datetime.datetime object, default now.
    dateDelta : timedelta object, we round to a multiple of this, default 1 minute.
    Author: Thierry Husson 2012 - Use it as you want but don't blame me.
            Stijn Nevens 2014 - Changed to use only datetime objects as variables
    """
    now = datetime.datetime.now()
    if dt == None : dt = now

    return datetime.time(dt.hour,0,0)


def getAndSaveData(db):
    now = datetime.datetime.now()
    thisHourRounded = datetime.datetime.combine(now.date(),roundTime())
    prevHourRounded = datetime.datetime.combine(now.date(),roundTime(now-datetime.timedelta(hours=1)))

    isoDateThisHourRounded = thisHourRounded.isoformat()
    isoDateprevHourRounded = prevHourRounded.isoformat()
    sqlFormatthisHourRounded = datetime.datetime.strftime(thisHourRounded,'%Y-%m-%d %H:%M:%S')
    sqlFormatprevHourRounded = datetime.datetime.strftime(prevHourRounded,'%Y-%m-%d %H:%M:%S')
    
    username = cfg['scanalytics']['username']
    password = cfg['scanalytics']['password']
    clientId = cfg['scanalytics']['clientId']
    clientSecret = cfg['scanalytics']['clientSecret']
    access_token = scanalytics.get_token(username, password, clientId, clientSecret)
    #print "access_token=",access_token
    print(sqlFormatprevHourRounded, " - ", sqlFormatthisHourRounded)
    
    #get_available_metrics(access_token)

    for doc in scanalytics.get_entrances_report(access_token, array_keys_list, isoDateprevHourRounded, isoDateThisHourRounded):
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
        sql_cmd = "INSERT INTO hourly_traffic (zone_id, zone_name, time_from, time_to, entrances, exits, occupancy) VALUES (1,'Crowne Fitness Center','"+ sqlFormatprevHourRounded + "','" + sqlFormatthisHourRounded + "'," + str(entrances) + "," + str(exits) + "," + str(occupancy) + ")" 
        c.execute(sql_cmd)
        db.commit()
    except Exception as e:
        print(e)
        pass
   
if __name__ == "__main__":
    curdir = os.path.dirname(os.path.abspath(__file__))
    with open(curdir+"/config.yml", 'r') as ymlfile:
        cfg = yaml.load(ymlfile)

    # Connection to Heroku mysql db
    
    mysql_env = 'mysql' # Production
    # mysql_env = 'mysql_heroku' # Heroku test

    host = cfg[mysql_env]['host']
    username = cfg[mysql_env]['user']
    passwd = cfg[mysql_env]['passwd']
    database = cfg[mysql_env]['db']
    db=MySQLdb.connect(host=host,user=username, passwd=passwd,db=database,charset='utf8',use_unicode=True)
    
    getAndSaveData(db)

