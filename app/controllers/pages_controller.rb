require "yaml"

class PagesController < ApplicationController
    include ApplicationHelper  

    cfg_path = Rails.root.join('python-jobs', 'config.yml').to_s
    @@cfg = YAML.load File.open(cfg_path)
    Rails.env.production?
        mysql_env = 'mysql' # Production
    Rails.env.development?
        mysql_env = 'mysql_heroku' # Dev

    @@mysql_host = @@cfg[mysql_env]['host']
    @@mysql_username = @@cfg[mysql_env]['user']
    @@mysql_password = @@cfg[mysql_env]['passwd']
    @@mysql_db_name = @@cfg[mysql_env]['db']
    @@array_keys_list = ['1AMDJ']

    def student
        Rails.logger.debug "#{mysql_host}"
        Rails.logger.info "#{mysql_host}"
        puts mysql_host
        db = Mysql2::Client.new(:host => @@mysql_host, :username => @@mysql_username, :password => @@mysql_password, :port => 3306, :database => @@mysql_db_name, :flags => Mysql2::Client::MULTI_STATEMENTS )
        sql = "SELECT zone_name, time_to, occupancy FROM occupancy order by time_to desc limit 1
         "
        results = ''

        #output = []

        results = db.query(sql)
        results.each do |row|
            # conveniently, row is a hash
            # the keys are the fields, as you'd expect
            # the values are pre-built ruby primitives mapped from their corresponding field types in MySQL
            @occupancy = row["occupancy"]
            @zone_name = row["zone_name"]
            @updated_at = row["time_to"]
            if row["dne"]  # non-existant hash entry is nil
            puts row["dne"]
            end
        end
    end

    def data_get
        time = Time.new
        time1 = time.strftime("%Y-%m-%d %H:%M:%S")
        p time1

        now = DateTime.now
        twelveAmToday = DateTime.new(now.year, now.mon, now.mday, 0,0,0,now.zone)
        isoDateNow = now.iso8601()
        isoDateDayStart = twelveAmToday.iso8601()
        sqlFormatNow = now.strftime('%Y-%m-%d %H:%M:%S')
        sqlFormatDayStart = twelveAmToday.strftime('%Y-%m-%d %H:%M:%S')
        
        username = @@cfg['scanalytics']['username']
        password = @@cfg['scanalytics']['password']
        clientId = @@cfg['scanalytics']['clientId']
        clientSecret = @@cfg['scanalytics']['clientSecret']
        access_token = get_token(username, password, clientId, clientSecret)

        result = get_entrances_report(access_token, @@array_keys_list, isoDateDayStart, isoDateNow) 
        result.each {
            |row| 
                @entrances = row["entrances"]
                @exits = row["exits"]
                @occupancy = @entrances - @exits
                
                puts @entrances
                puts @exits
                puts @occupancy
        }
        
        response = {'time' => time1,
                    'entrances' => @entrances,
                    'exits' => @exits,
                    'occupancy' => @occupancy
                }.to_json

        respond_to do |format|
          format.json {
            render :json => response
          }
        end
    end

    def data_post
        name = params[:name]
        location = params[:location]
        respond_to do |format|
          format.json {
            render :json => [name, location]
          }
        end
    end
end
