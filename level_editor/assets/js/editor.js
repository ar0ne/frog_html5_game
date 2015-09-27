;(function() {
	"use strict"

	window.addEventListener('load', function () {
	    new Editor({
	    	width: 20, 
	    	height: 15
	    });
	});

	var Editor = function(size) {

		size = size || {width: 15, height: 15};

		var level_container = $('#map'),
			mouse_down_state = false,
			buttons = $('#tiled_container div'),
			current = null,
			current_class = "empty",
			html 	= '';


		for(var i = 0; i < size.height + 1; i++) {

			html 	+= "<tr>";

			for(var j = 0 ; j < size.width + 1; j++) {

				if( i == size.height && j == size.width ) {
					continue;
				}

				if(i == size.height || j == size.width ) {
					html += "<td class='speeds'><input type='number' /></td>";
					continue;
				}

				html 	+=		"<td class='empty' >&nbsp;</td>"
			}

			html 	+= "</tr>";
		}

		level_container.append(html);


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

		});


		level_container.on('click', function (e) {

			if(!current) {
				return;
			}

			var selected = $(e.target);

			if(!selected.is('td')) {
				return;
			}


			selected.addClass(current_class);
		});


		level_container.delegate("td", "mousedown", function() {

			mouse_down_state = true;
			if(!$(this).hasClass('speeds')) {
				$(this).removeClass().addClass(current_class);
			}
		    
		}).delegate("td", "mouseenter", function() {

			if (mouse_down_state && !$(this).hasClass('speeds') ) {
				$(this).removeClass().addClass(current_class);
			}

		});

		$("html").bind("mouseup", function() {
			mouse_down_state = false;
		});

		var self = this;

		$("#button_export").on("click", function() {
			self.saveTextAsFile(size);
		});

		$("#button_erase").on("click", function() {
			self.clearMap(size);
		})

		$("#button_load").on('click', function() {
			if ($("#file_to_load").val()) {
				self.loadFileAsText();
			} else if($("#json_to_load").val()) {
				self.import(JSON.parse($("#json_to_load").val()));
			} else {
				alert("Can't load map!");
			}
			
		})

	};

	/**
	*  0 - empty field
	*  1 - wall static
	*  2 - wall dynamic by axis X
	*  3 - wall dynamic by axis Y
	*  4 - player
	*  5 - exit
	*/

	Editor.prototype = {

		export: function(size) {
			var map = $("#map td:not(.speeds)"),

				json = { 
					map: 	[],
				 	speedX: [],
				 	speedY: [],
		 		};

			for(var i = 0; i < size.height; i++ ) {
				var row = [];
				for(var j = 0; j < size.width; j++ ) {
					var id;
					switch( $( map.get(i * size.width + j)).attr("class") ) {
						case "empty":
							id = 0;
							break;
						case "static":
							id = 1;
							break;
						case "move_x":
							id = 2;
							break;
						case "move_y":
							id = 3;
							break;
						case "player":
							id = 4;
							break;
						case "exit":
							id = 5;
							break;
						default:
							id = 0;
					}
					row.push(id);
				}
				json.map.push(row);
			}

			// speedY
			var speedY = [],
				speedX = [],
				speeds = $("td.speeds input");

			for(var i = 0; i < speeds.length; i++) {
				var value = $(speeds.get(i) ).val() ? $( speeds.get(i) ).val() : 0 ;
				if(i < size.height) {
					speedY.push( parseInt(value) );
				} else {
					speedX.push( parseInt(value) );
				}
			}

			json.speedX = speedX;
			json.speedY = speedY;

			return JSON.stringify(json);
		},

		clearMap: function () {
			$("#map td:not(.speeds)").removeClass().addClass("empty");
			$("td.speeds input").each(function(){
				$(this).val('')					
					.removeClass(); // erase old classes
			})
		},

		saveTextAsFile: function(size) {

			var textToWrite = this.export(size);
			var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
			var fileNameToSaveAs = $("#input_file_name_to_save_as").val();

			// if user input type of file (like *.txt) cut this and add "json"
			if(fileNameToSaveAs.indexOf(".") + 1) {
				fileNameToSaveAs = fileNameToSaveAs.split('.')[0];
			}

			fileNameToSaveAs += ".json";

			var downloadLink = document.createElement("a");
			downloadLink.download = fileNameToSaveAs;
			downloadLink.innerHTML = "Download File";
			if (window.webkitURL != null) {
				// Chrome allows the link to be clicked
				// without actually adding it to the DOM.
				downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
			} else {
				// Firefox requires the link to be added to the DOM
				// before it can be clicked.
				downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
				downloadLink.onclick = destroyClickedElement;
				downloadLink.style.display = "none";
				document.body.appendChild(downloadLink);
			}

			downloadLink.click();

			function destroyClickedElement(event) {
				document.body.removeChild(event.target);
			}

		}, 

		loadFileAsText: function () {
			var self = this;
			var file_to_load = document.getElementById("file_to_load").files[0];

			var fileReader = new FileReader();

			fileReader.onload = function(fileLoadedEvent) {

				var textFromFileLoaded = fileLoadedEvent.target.result;

				var json = JSON.parse(textFromFileLoaded);

				self.import(json);

			};

			fileReader.readAsText(file_to_load, "UTF-8");
		},

		import: function (level) {

			this.clearMap();

			$("#file_to_load").val('');

			var map 		= $("#map td:not(.speeds)"),
				speeds 		= $("td.speeds input"),
				rows        = level.map.length,
			    columns     = level.map[0].length;

			for(var i = 0; i < rows; i++ ) {
				for(var j = 0; j < columns; j++ ) {

					switch( level.map[i][j] ) {
						case 0:
							$( map.get(i * columns + j)).addClass("empty");
							break;
						case 1:
							$( map.get(i * columns + j)).addClass("static");
							break;
						case 2:
							$( map.get(i * columns + j)).addClass("move_x");
							break;
						case 3:
							$( map.get(i * columns + j)).addClass("move_y");
							break;
						case 4:
							$( map.get(i * columns + j)).addClass("player");
							break;
						case 5:
							$( map.get(i * columns + j)).addClass("exit");
							break;
						default:
							console.log("Error: Not recognized type of wall: " +  level.map[i][j]);
					}
				}
			}

			for(var i = 0; i < level.speedY.length; i++) {
				$( speeds.get(i) ).val( level.speedY[i] != 0 ? level.speedY[i] : "" );
			}

			for(var i = 0; i < level.speedX.length ; i++) {
				$( speeds.get(i + level.speedY.length) ).val ( level.speedX[i] != 0 ? level.speedX[i] : "" );
			}

		}
	};



})();