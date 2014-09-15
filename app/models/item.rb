class Item < ActiveRecord::Base
  belongs_to :category
  attr_accessible :amount, :name
end
