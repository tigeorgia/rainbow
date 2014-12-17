class CreateTriggers < ActiveRecord::Migration
  def change
    create_table :triggers do |t|
      t.string :code
      t.integer :percent_start
      t.integer :percent_end
      t.text :description

      t.timestamps
    end
  end
end
