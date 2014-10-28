class BudgetController < ApplicationController

  include BudgetHelper

  def show

    # Those are the main programs, which we can transfer some funds, from the other programs.
    @main_programs = ['Priority 23', # განათლება და მეცნიერება / Education and Science
                      'Priority 24', # ჯანმრთელობა და სოციალური დაცვა / Health and Social Affairs
                      'Priority 25'] # სოფლის მეურნეობა / Agriculture

    items = Item.includes(:category).where('categories.data_visualization_id=?',DATA_VISUALISATION_ID)

    # We are sorting the items by category
    @category_item = {}
    @category_names = []
    @input_names = []
    @total_programs = 0.000
    @total_main = 0.000

    @amount_hash = {}

    items.each do |item|
      category_name = item.category.name
      if !@category_item.has_key? (category_name)
        @category_item[category_name] = []
        @category_names << t('budget.'+category_name)
        @input_names << category_name
      end
      amount_with_decimals = '%.3f' % (item.amount.to_f / 1000000)
      @amount_hash["#{category_name.gsub(' ','_')}-#{@category_item[category_name].length}"] = amount_with_decimals
      @category_item[category_name] << {'name'=> item.name, 'amount' => amount_with_decimals, 'index' => @category_item[category_name].length}

      if !@main_programs.include?category_name
        @total_programs += amount_with_decimals.to_f
      else
        @total_main += amount_with_decimals.to_f
      end
    end

    @category_item.each do |cat,items|
      if items.length % 2 == 1
        # As we're displaying the item information in a 2-col table, we want to have an even number of items, so we don't mess with the html code.
        @category_item[cat] << {'name' => '', 'amount' => '', 'index' => @category_item[cat].length}
      end
    end

    puts @amount_hash.to_json

    if params[:embed]
      render layout: 'embed'
    end

  end
end
