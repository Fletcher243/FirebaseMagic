var Lab4 = function() {
  
  var self = this;
  
  //Your submitted/base URL should be of the form: xxx.xxx:3004
  self.lab4URL = "/"; //This really shouldn't impact you, unless you try to submit something that doesn't meet the form above.

  //The elements from lab 2 needed for the weather search (which should still work)
  self.cityInput = $("#cityField"); //The ID for your city input field
  self.suggestionsList = $("#txtHint"); //The ID for your suggestions list (should be a ul)
  self.allSuggestions = $$("#txtHint li"); //This will grab all of the suggestions in your list - assuming your ul has the correct ID
  self.weatherButton = $("#weatherButton"); //The ID for your submit button that will pull the weather data
  self.cityTextArea = $("#displayCity"); //The ID for the text area that displays the city name that was submitted
  self.weatherText =$("#weather"); //The ID for the weather results section

  //The elements needed on the frontend for the owlbot search
  self.owlSearchInput = $("#searchWord"); //An input field to type a word to get a definition of
  self.owlSearchButton = $("#searchButton"); //The button that asks for the definition
  self.owlSearchResults = $("#searchResults"); //The ID of the area where the definition is placed. Make sure it displays at least the first definition

  //These are your route URLs (when appended to the base one)
  self.getcityRoute = "/getcity?q="; //You should be expecting a query parameter 'q' in your /getcity route
  self.owlRoute = "/word?w="; //You should be expecting a query parameter 'w' in your /word route
}

module.exports = new Lab4();
/**
 * For more information about the test driver used, check out: protractortest.org
 * For information about page objects: http://www.protractortest.org/#/page-objects
 */