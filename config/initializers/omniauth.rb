OmniAuth.config.logger = Rails.logger

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :google_oauth2, '1086015854948-3qbc6jdl0vsvknpm9sb8geksv016fou1.apps.googleusercontent.com', '6x5CLQBrmzUonptsmvuHhZlv', skip_jwt: true
end