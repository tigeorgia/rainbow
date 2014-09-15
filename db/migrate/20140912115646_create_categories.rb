class CreateCategories < ActiveRecord::Migration
  def change
    create_table :categories do |t|
      t.string :name
      t.references :data_visualization

      t.timestamps
    end
    add_index :categories, :data_visualization_id
  end
end
