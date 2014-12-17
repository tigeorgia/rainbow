class Trigger < ActiveRecord::Base
  attr_accessible :code, :description, :percent_end, :percent_start
end
