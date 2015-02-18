;(function() {
	"use strict"

	window.addEventListener('load', function () {
	    new Editor();
	});

	var Editor = function() {

		var level_container = $('#map'),
			size 	= 15,
			html 	= '';

		for(var i = 0; i < size; i++) {
			html 	+= "<tr>";

			for(var j = 0 ; j < size; j++) {
				html 	+=		"<td> </td>"
			}

			html 	+= "</tr>";
		}

		level_container.append(html);


		var buttons = $('#tiled_container div'),
			current = null,
			current_class = "";


		buttons.on('click', function(e) {

			current = $(this);

			if(current.hasClass("selected")){
				return;
			}

			buttons.each(function(){
				$(this).removeClass("selected");
			})

			current.addClass("selected");

			current_class = current.attr("class").split(" ")[0];


		})

		level_container.on('click', function (e) {

			if(!current) {
				return;
			}

			var selected = $(e.target);

			if(!selected.is('td')) {
				return;
			}


			selected.addClass(current_class);
		})
		

	};

})();