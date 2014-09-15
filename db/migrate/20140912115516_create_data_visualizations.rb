class CreateDataVisualizations < ActiveRecord::Migration
  def change
    create_table :data_visualizations do |t|
      t.string :name
      t.string :description

      t.timestamps
    end
  end
end
