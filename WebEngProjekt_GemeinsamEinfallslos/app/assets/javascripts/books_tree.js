$(document).ready(function () {
    $("div#books_tree").jstree({
        "themes": { "theme": "apple", "dots": true, "icons": true },
        "ui": { "select_limit": 1 },
        "plugins": [ "themes", "html_data", "ui" ]
    }).bind("select_node.jstree", function (event, data) {
        var node_url = data.rslt.obj.children("a").attr("href");
        $.get(node_url, { 'render_template': false }, function (new_data) {
            $("div#content").html(new_data);
        });
    });
});