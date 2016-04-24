class PagesController < ApplicationController
def student
      mysql_host = 'us-cdbr-iron-east-03.cleardb.net'
      mysql_username = 'bbaf414965fded'
      mysql_password = '2f3310e8'
      mysql_db_name = 'heroku_fa3c47157b8ffc1'
      db = Mysql2::Client.new(:host => mysql_host, :username => mysql_username, :password => mysql_password, :port => 3306, :database => mysql_db_name, :flags => Mysql2::Client::MULTI_STATEMENTS )
    sql = "select occupancy
    from 
    (SELECT max(time_to), occupancy FROM occupancy) most_recent
     "
    results = ''

    #output = []

    results = db.query(sql)
    results.each do |row|
      # conveniently, row is a hash
      # the keys are the fields, as you'd expect
      # the values are pre-built ruby primitives mapped from their corresponding field types in MySQL
      @occupancy = row["occupancy"]
      puts row["occupancy"] # row["id"].class == Fixnum
      if row["dne"]  # non-existant hash entry is nil
      puts row["dne"]
      end
    end
    
    # puts "Latest Occupancy: " + results
  end

end
