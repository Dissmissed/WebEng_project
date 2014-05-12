class ApplicationController < ActionController::Base
  protect_from_forgery

  def render_check_template
    if params[:render_template] == 'false'
      render layout: false
    end
  end
end
