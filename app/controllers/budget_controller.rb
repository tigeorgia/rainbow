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

    # We're initializing a hash that will track the changes made by the user. Below is what this hash will contain:
    # { origin_id: { initial_amount: amount_val
    #                amount_taken: amount_val
    #                amount_added: amount_val
    #                target: {id_val: amount_added_value,
    #                         id_val: amount_added_value,
    #                         ...
    #                        }
    #              },
    #  origin_id_2: {...},
    #  ...
    # }
    #
    @tracked_changes = {}

    # This hash will contain all the sub-programs amounts.
    @amount_hash = {}

    items.each do |item|
      category_name = item.category.name
      @tracked_changes[item.id] = {}
      @tracked_changes[item.id]['amount_taken'] = 0
      @tracked_changes[item.id]['amount_added'] = 0
      @tracked_changes[item.id]['target'] = {}

      if !@category_item.has_key? (category_name)
        @category_item[category_name] = []
        @category_names << t('budget.'+category_name)
        @input_names << category_name
      end
      amount_with_decimals = '%.3f' % (item.amount.to_f / 1000000)
      @amount_hash["#{category_name.gsub(' ','_')}-#{@category_item[category_name].length}-#{item.id}"] = amount_with_decimals

      @tracked_changes[item.id]['initial_amount'] = amount_with_decimals

      @category_item[category_name] << {'name'=> item.name, 'amount' => amount_with_decimals, 'index' => @category_item[category_name].length, 'id' => item.id}

      if !@main_programs.include?category_name
        @total_programs += amount_with_decimals.to_f
      else
        @total_main += amount_with_decimals.to_f
      end


    end

    @category_item.each do |cat,items|
      if items.length % 2 == 1
        # As we're displaying the item information in a 2-col table, we want to have an even number of items, so we don't mess with the html code.
        @category_item[cat] << {'name' => '', 'amount' => '', 'index' => @category_item[cat].length, 'id' => 0}
      end
    end

    @tranlations_for_scripts = t('scripts_messages')

    if params[:embed]
      render layout: 'embed'
    end

  end

  def process_budget
    changes = params[:data]

    statements = {}
    left_statements = []
    right_statements = []
    changes.each do |item_id, change|
        if (change['amount_taken'] != '0') || (change['amount_added'] != '0')
          if change['amount_taken'] != '0'
            # There's been some changes for this left-hand side column. Let's process it.
            amount_taken = change['amount_taken']
            initial_amount = change['initial_amount']

            # We calculate how much this sub-program has been changed.
            percent = (amount_taken.to_f / initial_amount.to_f) * 100
            program_code = Item.find_by_id(item_id).code
            description = Trigger.where("code = '#{program_code}' AND percent_start <= #{percent} AND percent_end >= #{percent}")

            if description && description.length > 0
              description_text = description.first.description

              origin_program = t("budget.programs.Program #{item_id}")
              statement = "#{amount_taken} #{t('scripts_messages.money_taken_from')} '#{origin_program}': #{description_text}"
              left_statements << statement
            end
          elsif change['amount_added'] != '0'
            # Amounts have been added to this program on the right hand side column.
            amount_added = change['amount_added']
            initial_amount = change['initial_amount']

            # We calculate how much this sub-program has been changed.
            percent = (amount_added.to_f / initial_amount.to_f) * 100
            if percent > 100
              # In this case, the same trigger implication for 100% applies
              percent = 100
            end
            program_code = Item.find_by_id(item_id).code
            description = Trigger.where("code = '#{program_code}' AND percent_start <= #{percent} AND percent_end >= #{percent}")

            if description && description.length > 0
              description_text = description.first.description

              target_program = t("budget.programs.Program #{item_id}")
              statement = "#{amount_added} #{t('scripts_messages.money_added_to')} '#{target_program}': #{description_text}"
              right_statements << statement
            end
          end
          #statement = "#{amount_taken} million(s) have been taken from '#{origin_program}', and have been redistributed in the following sub-programs: \n"
          #allocated = []
          #change['target'].each do |target_id, amount_added|
            #target_program = t("budget.programs.Program #{target_id}")
            #allocated << "#{amount_added} M(s) allocated to '#{target_program}'"
          #end
          #statement += allocated.join(', ')
          # statements << statement
        end
    end

    #left_statements.each do |statement|
      #statements << statement
    #end

    #right_statements.each do |statement|
      #statements << statement
    #end
    statements['left'] = left_statements
    statements['right'] = right_statements

    render json: statements
  end
end
