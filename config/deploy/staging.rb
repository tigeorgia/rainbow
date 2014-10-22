##################################
##### SET THESE VARIABLES ########
##################################
server "web331.webfaction.com", :web, :app, :db, primary: true # server where app is located
set :application, "rainbow_staging" # unique name of application
set :user, "tigeorgia" # name of user on server
set :ngnix_conf_file_loc, "staging/nginx.conf" # location of nginx conf file
set :unicorn_init_file_loc, "staging/unicorn_init.sh" # location of unicor init shell file
set :github_account_name, "tigeorgia" # name of accout on git hub
set :github_repo_name, "rainbow" # name of git hub repo
set :git_branch_name, "popover" # name of branch to deploy
set :rails_env, "staging" # name of environment: production, staging, ...
##################################
