class BudgetController < ApplicationController

  include BudgetHelper

  def show
    items = Item.includes(:category).where('categories.data_visualization_id=?',DATA_VISUALISATION_ID)

    # We are sorting the items by category
    @category_item = {}
    @category_names = []
    items.each do |item|
      category_name = item.category.name
      if !@category_item.has_key? (category_name)
        @category_item[category_name] = []
        @category_names << category_name
      end
      @category_item[category_name] << {'name'=> item.name, 'amount' => item.amount}
    end

  end
end
