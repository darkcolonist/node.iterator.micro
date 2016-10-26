# node.iterator.micro
Node Command Line Iterator is useful for applications that rely on applications to consistently call specific urls that need to be triggered less than a minute (CRON). Due to CRON's limitation of running per minute when running minutely `wget` or `curl` commands, sometimes we need something quicker ie., every second.
## configuration
populate the actions.txt file with urls
```
  # put a sharp for comments
  http://localhost/api1/call
  http://localhost/api2/call
  http://localhost/api3/call
```
## usage
run the server using node
`node server.js`
or using pm2
`pm2 package.json`
