class BudgetController < ApplicationController

  include BudgetHelper

  def show

    # Those are the main programs, which we can transfer some funds, from the other programs.
    @main_programs = ['Agriculture','Health and Social Affairs','Education and Science']

    items = Item.includes(:category).where('categories.data_visualization_id=?',DATA_VISUALISATION_ID)

    # We are sorting the items by category
    @category_item = {}
    @category_names = []
    @input_names = []
    @total_programs = 0.0
    @total_main = 0.0
    items.each do |item|
      category_name = item.category.name
      if !@category_item.has_key? (category_name)
        @category_item[category_name] = []
        @category_names << t('budget.'+category_name)
        @input_names << category_name
      end
      @category_item[category_name] << {'name'=> item.name, 'amount' => item.amount}

      if !@main_programs.include?category_name
        @total_programs += item.amount
      else
        @total_main += item.amount
      end
    end

    if params[:embed]
      render layout: 'embed'
    end

  end
end
