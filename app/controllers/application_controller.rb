class ApplicationController < ActionController::Base
  def hello
  	render text: "hello"
  end

  def bye
  	render text: 'byeeee'
  end

  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception
  helper_method :current_user

  def current_user
    @current_user ||= User.find(session[:user_id]) if session[:user_id]
  end
end
