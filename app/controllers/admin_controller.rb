class AdminController < ApplicationController
	cfg_path = Rails.root.join('python-jobs', 'config.yml').to_s
    @@cfg = YAML.load File.open(cfg_path)
    
    if Rails.env.development? 
        mysql_env = 'mysql_heroku' # Dev
    elsif Rails.env.production? 
        mysql_env = 'mysql' # Production
    end

    @@mysql_host = @@cfg[mysql_env]['host']
    @@mysql_username = @@cfg[mysql_env]['user']
    @@mysql_password = @@cfg[mysql_env]['passwd']
    @@mysql_db_name = @@cfg[mysql_env]['db']
    @@array_keys_list = ['1AMDJ']

    def dashboard_realtime
        # puts Rails.env
        db = Mysql2::Client.new(:host => @@mysql_host, :username => @@mysql_username, :password => @@mysql_password, :port => 3306, :database => @@mysql_db_name, :flags => Mysql2::Client::MULTI_STATEMENTS )
        sql = "SELECT zone_name, time_to, occupancy FROM occupancy order by time_to desc limit 1
         "
        results = ''

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
        
    end

    def data_post
    	# time = Time.new
     #    time1 = time.strftime("%Y-%m-%d %H:%M:%S")
     #    p time1

     #    now = DateTime.now
     #    twelveAmToday = DateTime.new(now.year, now.mon, now.mday, 0,0,0,now.zone)
     #    isoDateNow = now.iso8601()
     #    isoDateDayStart = twelveAmToday.iso8601()
     #    sqlFormatNow = now.strftime('%Y-%m-%d %H:%M:%S')
     #    sqlFormatDayStart = twelveAmToday.strftime('%Y-%m-%d %H:%M:%S')
        
        # result = get_entrances_report(access_token, @@array_keys_list, isoDateDayStart, isoDateNow) 

        # Get time frame from POST request
        time_from = params[:time_from]
        time_to = params[:time_to]

        db = Mysql2::Client.new(:host => @@mysql_host, :username => @@mysql_username, :password => @@mysql_password, :port => 3306, :database => @@mysql_db_name, :flags => Mysql2::Client::MULTI_STATEMENTS )


        # Get current occupancy =============================
        sql = "SELECT zone_name, time_to, occupancy FROM occupancy order by time_to desc limit 1
         "
        results = ''

        #output = []

        results = db.query(sql)
        results.each do |row|
            @occupancy = row["occupancy"]
            @zone_name = row["zone_name"]
            @updated_at = row["time_to"]
            if row["dne"]  # non-existant hash entry is nil
            puts row["dne"]
            end
        end

        # Get total entrances and exits of the chosen times =============================
        sql_total = "select sum(entrances) total_entrances, sum(exits) total_exits
				from hourly_traffic h
				where
				h.time_from >= '#{time_from}'
				and h.time_from <= '#{time_to}';
        "

        results_total = db.query(sql_total)

        results_total.each do |row|
            # conveniently, row is a hash
            # the keys are the fields, as you'd expect
            # the values are pre-built ruby primitives mapped from their corresponding field types in MySQL
            @total_entrances = row["total_entrances"]
            @total_exits = row["total_exits"]
            
            if row["dne"]  # non-existant hash entry is nil
            	puts row["dne"]
            end
        end

        # Get entrances & exits by date =============================
        sql_by_date = "select DATE_FORMAT(time_from, '%Y/%m/%d') d, sum(entrances) date_entrances, sum(exits) date_exits
					from hourly_traffic h
					where
					h.time_from >= '#{time_from}'
					and h.time_from <= '#{time_to}'
					group by date(time_from);
        "

        results_date = db.query(sql_by_date)

        @date_arr = Array.new
        i = 0
        results_date.each do |row|
        	@date_arr.push(Array.new(3))
            @date_arr[i][0] = row["d"]
            @date_arr[i][1] = row["date_entrances"]
            @date_arr[i][2] = row["date_exits"]
            i+=1
        end
        
        # @date_hash = Hash.new
        # results_date.each do |row|
        #     @date_hash[row["d"]] = {
        #         "entrances": row["date_entrances"],
        #         "exits": row["date_exits"]
        #     }
        # end

        response = @date_arr.to_json
        # response = @date_hash.to_json
        puts response
        respond_to do |format|
          format.json {
            render :json => response
          }
        end
    end
end
