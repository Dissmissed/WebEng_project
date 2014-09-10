// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
// You can use CoffeeScript in this file: http://jashkenas.github.com/coffee-script/
$(document).ready(function() {

   var tablebooks = $('#table_show_books').DataTable({
    "info" : false,
    "paging": false,
    "searching": false});

   var tablechunks = $('#table_show_bookchunks').DataTable({
    "info": false,
    "paging": false,
    "searching": false});


    var criteriaCount = 0;
    var mapOperands = [[0,1],[2,3,4,5],[6,7],[0,1],[0,1]];

    $("[id^=div_advanced]").hide();
    $("#btn_simple").click(function(){
        $("[id^=div_advanced]").hide();
        $("#div_simple").show();
        $("#btn_advanced").removeClass("btn-info");
        $("#btn_simple").addClass("btn-info");
    });
    $("#btn_advanced").click(function(){
        $("#div_simple").hide();
        $("[id^=div_advanced]").show();
        $("#btn_simple").removeClass("btn-info");
        $("#btn_advanced").addClass("btn-info");
    });
    $("#btn_plus").click(function(){
        var newDiv = $("#div_advanced0").clone(true)
        newDiv.attr('id', 'div_advanced' + (++criteriaCount));
        newDiv.css('margin-top','3px').insertBefore("#div_advancedGo");
        var newSel = newDiv.find("#adv_sel_op");
        newSel.val(0);
        filterOperands(newSel);
    });
    $("#adv_btn_del").click(function(){
        if(criteriaCount > 0) {
            $(this).parent().parent().remove();
            $("[id^=div_advanced]").each(function( index ) {
                if(this.id.match(/\d+$/)) {
                    if(index == 0) {
                        $(this).css('margin-top','0px')
                    }
                    $(this).attr('id', 'div_advanced' + index);
                }
            })
            criteriaCount--;
        }
        else {
            var div_adv = $("#div_advanced0");
            div_adv.find("#adv_sel_col").val(0).change();
            div_adv.find("#adv_text").val("");
            $("#simple_text").val("");
            $("#simple_go").click();
        }
    });
    $("#simple_btn_del").click(function() {
        $("#simple_text").val("");
        $("#simple_go").click();
    });
    $("#adv_sel_col").change(function(){
        filterOperands($(this));
    });
    function filterOperands(component){
        component.parent().find("#adv_text").removeAttr('placeholder');
        if(component.val() == 2) {
            component.parent().find("#adv_text").attr('placeholder','dd.MM.yyyy');
        }
        var elem = component.parent().find("#adv_sel_op option");
        var map = mapOperands[component.val()];
        elem.each(function(index) {
            $(this).removeAttr('selected');
            if(map.indexOf(index) > -1) {
                $(this).show();
            }
            else {
                $(this).hide();
            }
        })
        component.parent().find("#adv_sel_op option:visible:first").attr('selected','selected');
    };
    filterOperands($("#adv_sel_col"));

    $("#simple_go").click(function goSimple(){

        var query = $("#simple_text").val();
        $.post( "/filterbookssimple", { query: query }, function( data ) {
            tablebooks.clear();
            tablebooks.rows.add(data).draw();

        });

    });

    $("#adv_go").click(function(){

        var arr = [];
        $(".search-adv").each( function() {
          var col = $(this).find("#adv_sel_col").val();
          var op = $(this).find("#adv_sel_op").val();
          var text = $(this).find("#adv_text").val();
          var crit = new search_crit(col, op, text);
          arr.push(crit);
        });

        var title = new search_text("","");
        var edition = new search_number("","","","");
        var published = new search_date("","");
        var tags = new search_text("","");
        var genre = new search_text("","");
        var autoren = new search_text("","");

        arr.forEach(function(entry){
          if( entry.col == 0 ){
            if( entry.op == 0 ) {
              title.contains += entry.text;
            } else if( entry.op == 1) {
              title.contains_not += entry.text;
            }
          } else if( entry.col == 1){
            if( entry.op == 2 ){
              edition.eq += entry.text;
            } else if( entry.op == 3 ){
              edition.neq += entry.text;
            } else if( entry.op == 4 ){
              edition.gt += entry.text;
            } else if( entry.op == 5 ){
              edition.lt += entry.text;
            }
          } else if( entry.col == 2){
            if( entry.op == 6 ){
                published.before += entry.text;
            } else if( entry.op == 7 ){
                published.after += entry.text;
            }
          } else if( entry.col == 3 ){
              if( entry.op == 0 ) {
                  genre.contains += entry.text;
              } else if( entry.op == 1) {
                  genre.contains_not += entry.text;
              }
          } else if( entry.col == 4 ){
              if( entry.op == 0 ) {
                  tags.contains += entry.text;
              } else if( entry.op == 1) {
                  tags.contains_not += entry.text;
              }
          } else if( entry.col == 5 ){
              if( entry.op == 0 ) {
                  autor.contains += entry.text;
              } else if( entry.op == 1) {
                  autor.contains_not += entry.text;
              }
          }
        });
        var search = new search_obj(title, edition, published, tags, genre, autoren);

        $.post( "/filterbooksadv", { search_obj: JSON.stringify(search) }, function( data ) {
            tablebooks.clear();
            tablebooks.rows.add(data).draw();

        });
    });

})

function search_crit(col, op, text){
  this.col = col;
  this.op = op;
  this.text = text;
}

function search_text(contains, contains_not){
  this.contains = contains;
  this.contains_not = contains_not;
}

function search_number(eq, neq, gt, lt){
  this.eq = eq;
  this.neq = neq;
  this.gt = gt;
  this.lt = lt;
}

function search_date(before, after){
  this.before = before;
  this.after = after;
}

function search_obj(title, edition, published, tags, genre, autor) {
  this.title = title;
  this.edition = edition;
  this.published = published;
  this.tags = tags;
  this.genre = genre;
  this.autor = autor;
}