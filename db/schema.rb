# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20160417205754) do

  create_table "facilities", id: false, force: :cascade do |t|
    t.integer "zone_id",   limit: 4
    t.string  "zone_name", limit: 255
  end

  create_table "hourly_traffic", force: :cascade do |t|
    t.integer  "zone_id",   limit: 4
    t.string   "zone_name", limit: 255
    t.datetime "time_from"
    t.datetime "time_to"
    t.integer  "entrances", limit: 4
    t.integer  "exits",     limit: 4
    t.integer  "occupancy", limit: 4
  end

  create_table "occupancies", id: false, force: :cascade do |t|
    t.integer  "zone_id",   limit: 4
    t.string   "zone_name", limit: 255
    t.datetime "time_from"
    t.datetime "time_to"
    t.integer  "entrances", limit: 4
    t.integer  "exits",     limit: 4
    t.integer  "occupancy", limit: 4
  end

  create_table "occupancy", force: :cascade do |t|
    t.integer  "zone_id",   limit: 4
    t.string   "zone_name", limit: 255
    t.datetime "time_from"
    t.datetime "time_to"
    t.integer  "entrances", limit: 4
    t.integer  "exits",     limit: 4
    t.integer  "occupancy", limit: 4
  end

  create_table "users", force: :cascade do |t|
    t.string   "provider",         limit: 255
    t.string   "uid",              limit: 255
    t.string   "name",             limit: 255
    t.string   "oauth_token",      limit: 255
    t.datetime "oauth_expires_at"
    t.datetime "created_at",                   null: false
    t.datetime "updated_at",                   null: false
  end

end
