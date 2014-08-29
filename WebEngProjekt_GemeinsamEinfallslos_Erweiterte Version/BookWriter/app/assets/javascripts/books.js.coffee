# Place all the behaviors and hooks related to the matching controller here.
# All this logic will automatically be available in application.js.
# You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/

jQuery ->
  $('#table_show_books').dataTable
    info: false
    paging: false
    searching: false

  $('#table_show_bookchunks').dataTable
    info: false
    paging: false
    searching: false
