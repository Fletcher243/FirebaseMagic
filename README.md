# Lab4-NodeREST

In this lab you will implement the Utah cities suggestions RESTful service in Node.js that connects to your weather AJAX application. 
You will take a URL with a ?q=chars suffix and will look up all of the utah cities that have those chars as a prefix. You will then return a JSON string corresponding to the entries.

If you haven't seen the express generated files before, check out this [documentation](https://expressjs.com/en/starter/generator.html).

The jquery application from a previous lab should be modified to make the jsonp request to your own REST server instead of the <a href="http://bioresearch.byu.edu/cs260/jquery/getcity.cgi?q=P">one used</a> for your jquery lab. 
Before you do that, you should copy the related files over to your newly created express server. 

These [hints](https://github.com/BYUCS260/Lab4-NodeREST/wiki/Cities-REST-Service-Hints) may be helpful if you get stuck.

Once you have the getcity service working, 
implement a proxy for the [Owlbot](https://owlbot.info/api/v1/dictionary/owl) api that will allow the user to search for a word and see the definition. 
These [hints](https://github.com/mjcleme/node-api-server-tutorial#cors-issues) may be useful to make it easy to do.

When you're finished, you should run your node application with something like:

nohup node ./bin/www >& output &

<strong>After you use nohup, make sure to exit by typing "exit" into the terminal (for PUTTY, there should be an equivalent if that doesn't work), otherwise the OS will kill the process in a short while.</strong>

**You should test your server to make sure it works with your jquery front-end.**

#### Grading:

- Grading will be based off the following (subject to change):

Behavior |	Approximate Points
 --- | ---
Your base url is of the form xxx.xxx:3004 and correctly serves static files (including your weather.html as the file when you go to '/') | 10
Your getcity service correctly returns the JSON containing the list of cities (all cities if no prefix given) | 20
Your jquery front-end correctly uses your getcity service instead of the one from lab 2 | 20
You implement a route that is a proxy for the Owlbot service that can be accessed by going to the owlRoute in the page object | 20
Your Owlbot route has associated front-end code, allowing the user to search for a word and be shown the definition | 20
Your code is correctly up to date on github, and your frontend page looks really good. This is subjective, so wow us. | 10
# Creative4
# MongoCreative
# FirebaseMagic
