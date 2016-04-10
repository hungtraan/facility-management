import MySQLdb
import yaml

   
if __name__ == "__main__":
    with open("config.yml", 'r') as ymlfile:
        cfg = yaml.load(ymlfile)

    mysql_env = 'mysql' # Production
    # mysql_env = 'mysql_heroku' # Heroku test

    host = cfg[mysql_env]['host']
    username = cfg[mysql_env]['user']
    passwd = cfg[mysql_env]['passwd']
    database = cfg[mysql_env]['db']
    db=MySQLdb.connect(host=host,user=username, passwd=passwd,db=database,charset='utf8',use_unicode=True)

    c = db.cursor()

    try:
        sql_cmd = "DELETE from occupancy WHERE time_from < DATE_SUB(now(), INTERVAL 1 WEEK);" 
        c.execute(sql_cmd)
        db.commit()
    except Exception as e:
        print(e)
        pass
