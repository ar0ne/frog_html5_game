;(function() {
	"use strict"

	window.addEventListener('load', function () {
	    new Editor({
	    	width: 15, 
	    	height: 20
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
			self.loadFileAsText();
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

				json = { map: [],
				 		 speed_x: [],
				 		 speed_y: [],
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

			// speed_y
			var speed_y = [],
				speed_x = [],
				speeds = $("td.speeds input");

			for(var i = 0; i < speeds.length; i++) {
				if(i < size.height) {
					speed_y.push( $(speeds.get(i) ).val() ? $( speeds.get(i) ).val() : 0 );
				} else {
					speed_x.push( $(speeds.get(i) ).val() ? $( speeds.get(i) ).val() : 0 );
				}
			}
						

			json.speed_x = speed_x;
			json.speed_y = speed_y;


			return JSON.stringify(json);

		},

		clearMap: function () {
			$("#map td:not(.speeds)").removeClass().addClass("empty");
			$("td.speeds input").each(function(){
				$(this).val('');
			})
		},

		saveTextAsFile: function(size) {
			var textToWrite = this.export(size);
			var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
			var fileNameToSaveAs = $("#inputFileNameToSaveAs").val();

			var downloadLink = document.createElement("a");
			downloadLink.download = fileNameToSaveAs;
			downloadLink.innerHTML = "Download File";
			if (window.webkitURL != null)
			{
				// Chrome allows the link to be clicked
				// without actually adding it to the DOM.
				downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
			}
			else
			{
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

		// @TODO: load JSON from file
		loadFileAsText: function () {
			var fileToLoad = document.getElementById("fileToLoad").files[0];

			var fileReader = new FileReader();
			fileReader.onload = function(fileLoadedEvent) 
			{
				var textFromFileLoaded = fileLoadedEvent.target.result;
				document.getElementById("inputTextToSave").value = textFromFileLoaded;
			};
			fileReader.readAsText(fileToLoad, "UTF-8");
		}
	};



})();