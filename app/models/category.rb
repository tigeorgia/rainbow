class Category < ActiveRecord::Base
  belongs_to :data_visualization
  has_many :items
  attr_accessible :name
end
