sudo chmod -R 777 /var/www/html
sudo pm2 restart index --time
sudo cp -rf /root/.pm2/logs/ /var/www/html/pm2-logs/
sudo echo "" > /root/.pm2/logs/index-error.log
sudo echo "" > /root/.pm2/logs/index-out.log