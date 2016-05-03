class User < ActiveRecord::Base
  has_and_belongs_to_many :oauth_credentials
  devise :omniauthable , :omniauth_providers => [:google_oauth2]

  def self.find_for_google_oauth2(access_token, signed_in_resource=nil)
      data = access_token.info
      user = User.where(:provider => access_token.provider, :uid => access_token.uid ).first
      if user
        return user
      else
        registered_user = User.where(:email => access_token.info.email).first
        if registered_user
          return registered_user
        else
          user = User.create(name: data["name"],
            provider:access_token.provider,
            email: data["email"],
            uid: access_token.uid ,
            encrypted_password: Devise.friendly_token[0,20],
          )
        end
     end
  end

end