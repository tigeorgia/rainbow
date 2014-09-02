class RootController < ApplicationController

  def index
    @about = Page.find_by_name('about')
    
    respond_to do |format|
      format.html # index.html.erb
    end
  end

end
