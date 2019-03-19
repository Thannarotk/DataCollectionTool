  var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
	var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
		    maxZoom: 25,
				minZoom: 5,
		    subdomains:['mt0','mt1','mt2','mt3']
		});
	var grayscale   = L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr,minZoom: 5, maxZoom:25}),
		streets  = L.tileLayer(mbUrl, {id: 'mapbox.streets',   attribution: mbAttr,minZoom: 5, maxZoom:25});
	var baseMaps = {
	    "Grayscale": grayscale,
	    "Streets": streets,
			"Satellite": googleSat
	};

	var map = L.map('map', {
		center: [33.274383, 131.504815],
		zoom: 16,
		layers: [streets]
	});
  var control = new L.Control.Layers(baseMaps).addTo(map);
  control.setPosition('topleft');
  map.zoomControl.setPosition('topleft');
	// Initialise the FeatureGroup to store editable layers
var editableLayers = new L.FeatureGroup();
map.addLayer(editableLayers);
var drawPluginOptions = {
  draw: {
    polygon: {
      allowIntersection: false, // Restricts shapes to simple polygons
      drawError: {
        color: '#e1e100', // Color the shape will turn when intersects
        message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
      },
      shapeOptions: {
        color: '#97009c'
      }
    },
    // disable toolbar item by setting it to false
    polyline: false,
    circle: false, // Turns off this drawing tool
    circlemarker: false,
    rectangle: false,
    marker: true,
    },
  edit: {
    featureGroup: editableLayers, //REQUIRED!!
    remove: true,

  }
};
function toWKT (layer) {
    var lng, lat, coords = [];
		if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
			var latlngs = layer.getLatLngs();
		for (var i = 0; i < latlngs.length; i++) {
				var latlngs1 = latlngs[i];
				if (latlngs1.length){
				for (var j = 0; j < latlngs1.length; j++) {
					coords.push(latlngs1[j].lng + " " + latlngs1[j].lat);
					if (j === 0) {
						lng = latlngs1[j].lng;
						lat = latlngs1[j].lat;
					}
				}}
				else
				{
					coords.push(latlngs[i].lng + " " + latlngs[i].lat);
					if (i === 0) {
						lng = latlngs[i].lng;
						lat = latlngs[i].lat;
					}}
		};
			if (layer instanceof L.Polygon) {
				return "MULTIPOLYGON(((" + coords.join(",") + "," + lng + " " + lat + ")))";
			} else if (layer instanceof L.Polyline) {
				return "LINESTRING(" + coords.join(",") + ")";
			}
		} else if (layer instanceof L.Marker) {
			return "POINT(" + layer.getLatLng().lng + " " + layer.getLatLng().lat + ")";
		}
	};
// Initialise the draw control and pass it the FeatureGroup of editable layers
var drawControl = new L.Control.Draw(drawPluginOptions);
map.addControl(drawControl);

map.on('draw:created', function(e) {
  editableLayers.clearLayers();
  var type = e.layerType,
    layer = e.layer;
		layer_WKT = toWKT(layer);
		console.log(layer_WKT);
    var popupInfoContent = '<div class="form-popup" id="addForm">'+
      '<form id="add_form" name="add_form" action="svr/add_script.php" method="post" class="form-container">'+
      '<input type="hidden" id="input-bid" name="input-bid" value=""/"></input>'+
  		'<input type="hidden" id="input-geom" name="input-geom" value="'+layer_WKT+'"/"></input>'+
      '<input type="hidden" id="input-typelayer" name="input-typelayer" value="'+type+'"/"></input>'+ popupContent_addinfo()+
      '<button id="submit" name="submit" type="submit" class="btn">SAVE</button>'+
      '<button type="button" class="btn cancel" onclick="closeaddForm()">CLOSE</button>'+
    '</form>'+
  '</div>';
  $("#info").html(popupInfoContent);
  openaddForm();
    layer.on({
          'click': function (e) {
            $("#info").html(popupInfoContent);
            openaddForm();
          }
        });

  editableLayers.addLayer(layer);
});


	function onLocationFound(e) {
		var radius = e.accuracy / 2;

		L.marker(e.latlng).addTo(map)
			.bindPopup("You are within " + radius + " meters from this point").openPopup();

		L.circle(e.latlng, radius).addTo(map);
	}

	function onLocationError(e) {
		alert(e.message);
	}

	function highlight (layer) {
			layer.setStyle({
				weight: 5,
				color: 'yellow',
				dashArray: ''
			});
			if (!L.Browser.ie && !L.Browser.opera) {
				layer.bringToFront();
			}
		}

		function dehighlight (layer) {
		  if (selected === null || selected._leaflet_id !== layer._leaflet_id) {
			  geojsonLayer.resetStyle(layer);
		  }
		}
		function dehighlight2 (layer) {
			if (selected2 === null || selected2._leaflet_id !== layer._leaflet_id) {
				geojsonLayer2.resetStyle(layer);
			}
		}
		function select (layer) {
		  if (selected !== null) {
		    var previous = selected;
		  }
			map.fitBounds(layer.getBounds());
			selected = layer;
			if (previous) {
			  dehighlight(previous);
			}
		}
		function select2 (layer) {
		  if (selected2 !== null) {
		    var previous = selected2;
		  }
			map.fitBounds(layer.getBounds());
			selected2 = layer;
			if (previous) {
			  dehighlight2(previous);
			}
		}

		var selected = null;
		var selected2 = null;

		$.ajax({
			url:'svr/load_mashi.php',
			dataType: 'json',
			success: function(response){
				 moshi_boundary = L.geoJson(response,{
				 style: function (feature) {
					 return {
						 'weight': 2,
						 'color': 'blue',
						 'dashArray': '10, 10',
						 'dashOffset': '20',
						 'fillColor' : 'lightskyblue',
						 'fillOpacity': 0.2
					 }
				 },
				 onEachFeature: function (feature, layer) {
					layer.bindPopup('<h1>'+feature.properties.name+'</h1>' );
			}
				}).addTo(map);
				// Add the geojson layer to the layercontrol
			 control.addOverlay(moshi_boundary,'Moshi Boundary ');
			 load_bd1();
			},
			error: function(xhr, status, error){
				alert(error);
			}
		});
		function load_bd1(){
			$.ajax({
				url:'svr/load_bd.php',
				dataType: 'json',
				success: function(response){
					var route5Layer = L.geoJSON(response);
					 geojsonLayer = L.geoJson(response,{
					 style: function (feature) {
						 return {
							 'weight': 1,
							 'color': 'red',
							 'fillOpacity': 0
						 }
					 },
					 onEachFeature: function (feature, layer) {
             var popupInfoContent = popupContent_showinfo(feature, layer)+'<div class="form-popup" id="editForm">'+
               '<form id="edit_form" name="edit_form" action="svr/update_script.php" method="post" class="form-container">'+ popupContent_editinfo(feature, layer)+
               '<button id="submit" name="submit" type="submit" class="btn">SAVE</button>'+
               '<button type="button" class="btn cancel" onclick="closeForm()">CLOSE</button>'+
             '</form>'+
           '</div>';
						// layer.bindPopup(popupContent_info(feature, layer)+'<div id="div_edit" class="hide_obj">'+
						// '<h1>Edit Information</h1>' +
						// '<form id="edit_form" name="edit_form" action="" method="post">'+
						// popupContent_edit(feature, layer)+
						// '<button id="submit" name="submit" type="button" onClick="submit_form(1)">Save Changes</button></form></div>');
						layer.on({
									'mouseover': function (e) {
										highlight(e.target);
									},
									'mouseout': function (e) {
										dehighlight(e.target);
									},
									'click': function (e) {
										select(e.target);
                    $("#info").html(popupInfoContent);
                    $("#input-status").val(feature.properties.status);
                    openinfoForm();
									}
								});
					}
					}).addTo(map);
					map.fitBounds(geojsonLayer.getBounds());
					// Add the geojson layer to the layercontrol
				 control.addOverlay(geojsonLayer,'OSM Building (Unchecked)');
				 load_bd2();
				},
				error: function(xhr, status, error){
					alert(error);
				}
			});
		}


function load_bd2(){
	$.ajax({
		url:'svr/load_bd2.php',
		dataType: 'json',
		success: function(response){
			 geojsonLayer2 = L.geoJson(response,{
			 style: function (feature) {
				 return {
					 'weight': 0,
					 'fillColor': 'green',
					 'fillOpacity': 1
				 }
			 },
			 onEachFeature: function (feature, layer) {
         var popupInfoContent = popupContent_showinfo(feature, layer)+'<div class="form-popup" id="editForm">'+
           '<form id="edit_form2" name="edit_form2" action="svr/update_script.php" method="post" class="form-container">'+ popupContent_editinfo(feature, layer)+
           '<button id="submit" name="submit" type="submit" class="btn">SAVE</button>'+
           '<button type="button" class="btn cancel" onclick="closeForm()">CLOSE</button>'+
         '</form>'+
       '</div>';
				// layer.bindPopup(popupContent_info(feature, layer)+'<div id="div_edit" class="hide_obj">'+
				// '<h1>Edit Information</h1>' +
				// '<form id="edit_form2" name="edit_form2" action="" method="post">'+
				// popupContent_edit2(feature, layer)+
				// '<button id="submit" name="submit" type="button" onClick="submit_form(2)">Save Changes</button></form></div>');
				layer.on({
							'mouseover': function (e) {
								highlight(e.target);
							},
							'mouseout': function (e) {
								dehighlight2(e.target);
							},
							'click': function (e) {
								select2(e.target);
                $("#info").html(popupInfoContent);
                $("#input-status").val(feature.properties.status);
                openinfoForm();
							}
						});
			}
			}).addTo(map);
			// Add the geojson layer to the layercontrol
		 control.addOverlay(geojsonLayer2,'OSM Building (Checked)');
		 load_polygon();
		 $("input-status").val("2");
		},
		error: function(xhr, status, error){
			alert(error);
		}
	});
}
function load_polygon(){
	$.ajax({
		url:'svr/load_polygon.php',
		dataType: 'json',
		success: function(response){
			 geojsonLayer_polygon = L.geoJson(response,{
			 style: function (feature) {
				 return {
					 'weight': 1.5,
					 'color': 'darkorange',
					 'fillOpacity': 0
				 }
			 },
			 onEachFeature: function (feature, layer) {
         var popupInfoContent = popupContent_showinfo(feature, layer)+'<div class="form-popup" id="editForm">'+
           '<form id="edit_form" name="edit_form" action="svr/update_script.php" method="post" class="form-container">'+ popupContent_editinfo(feature, layer)+
           '<button id="submit" name="submit" type="submit" class="btn">SAVE</button>'+
           '<button type="button" class="btn cancel" onclick="closeForm()">CLOSE</button>'+
         '</form>'+
       '</div>';
       layer.on({
             'click': function (e) {
               $("#info").html(popupInfoContent);
               $("#input-status").val(feature.properties.status);
               openinfoForm();
             }
           });

			// 	layer.bindPopup(popupContent_info(feature, layer)+'<div id="div_edit" class="hide_obj">'+
			// 	'<h1>Edit Information</h1>' +
			// 	'<form id="edit_form" name="edit_form" action="" method="post">'+
			// 	popupContent_edit(feature, layer)+
			// 	'<button id="submit" name="submit" type="button" onClick="submit_form(1)">Save Changes</button></form></div>'
			// );
		}
			}).addTo(map);
			// Add the geojson layer to the layercontrol
		 control.addOverlay(geojsonLayer_polygon,'New Building (Polygon)');
		 load_point();
		},
		error: function(xhr, status, error){
			alert(error);
		}
	});
}
function load_point(){
	$.ajax({
		url:'svr/load_point.php',
		dataType: 'json',
		success: function(response){
			 geojsonLayer_point = L.geoJson(response,{
			 style: function (feature) {
				 return {
					 'weight': 1,
					 'color': 'red',
					 'fillOpacity': 0
				 }
			 },
			 onEachFeature: function (feature, layer) {
         var popupInfoContent = popupContent_showinfo(feature, layer)+'<div class="form-popup" id="editForm">'+
           '<form id="edit_form" name="edit_form" action="svr/update_script.php" method="post" class="form-container">'+ popupContent_editinfo(feature, layer)+
           '<button id="submit" name="submit" type="submit" class="btn">SAVE</button>'+
           '<button type="button" class="btn cancel" onclick="closeForm()">CLOSE</button>'+
         '</form>'+
       '</div>';
       layer.on({
             'click': function (e) {
               $("#info").html(popupInfoContent);
               $("#input-status").val(feature.properties.status);
               openinfoForm();
             }
           });
		  //   layer.bindPopup(popupContent_info(feature, layer)+'<div id="div_edit" class="hide_obj">'+
			// 	'<h1>Edit Information</h1>' +
			// 	'<form id="edit_form" name="edit_form" action="" method="post">'+
			// 	popupContent_edit(feature, layer)+
			// 	'<button id="submit" name="submit" type="button" onClick="submit_form(1)">Save Changes</button></form></div>'
			// );

		  }
			}).addTo(map);
			// Add the geojson layer to the layercontrol
     control.addOverlay(geojsonLayer_point,'New Building (Point)');
		},
		error: function(xhr, status, error){
			alert(error);
		}
	});
}

	map.on('locationfound', onLocationFound);
	map.on('locationerror', onLocationError);
function showFormEdit()
	{
	 $('#div_info').removeClass('show_obj');
	 $('#div_info').toggleClass('hide_obj');
	 $('#div_edit').removeClass('hide_obj');
	 $('#div_edit').toggleClass('show_obj');
	}
function showFormInfo()
	{
	 $('#div_info').removeClass('hide_obj');
 	 $('#div_info').toggleClass('show_obj');
	 $('#div_edit').removeClass('show_obj');
	 $('#div_edit').toggleClass('hide_obj');
	}

function popupContent_edit(feature, layer){
		var content =
		'<input type="hidden" id="input-bid" name="input-bid" value="'+feature.properties.gid+'"/"></input>'+
		'<table class="popup-table">'+
		'<tr class="popup-table-row">'+
			'<th class="popup-table-header">Building Name:</th>'+
			'<td><input id="input-name" name="input-name" type="text" value="'+feature.properties.name+'" required/></td>'+
		'</tr>'+
		'<tr class="popup-table-row">'+
			'<th class="popup-table-header">Occupancy Class:</th>'+
			'<td><select id="input-occupancy-conditon" name="input-occupancy-conditon">'+
        '<option value=""></option>'+
				'<option value="concrete">Concrete</option>'+
				'<option value="masonry">Masonry</option>'+
        '<option value="steel">Steel</option>'+
				'<option value="mixed">Mixed</option>'+
			'</select></td>'+
		'</tr>'+
		'<tr class="popup-table-row">'+
			'<th class="popup-table-header">Structural Type:</th>'+
			'<td><select id="input-structural-conditon" name="input-structural-conditon">'+
        '<option value=""></option>'+
				'<option value="concrete">Concrete</option>'+
				'<option value="masonry">Masonry</option>'+
        '<option value="steel">Steel</option>'+
				'<option value="mixed">Mixed</option>'+
			'</select></td>'+
		'</tr>'+
		'<tr class="popup-table-row">'+
			'<th class="popup-table-header">No. Story:</th>'+
			'<td><input id="input-story" name="input-story" type="number" value="'+feature.properties.no_story+'" required/></td>'+
		'</tr>'+
		'<tr class="popup-table-row">'+
			'<th class="popup-table-header">Physical Building Condition:</th>'+
			'<td><select id="input-physical-conditon" name="input-physical-conditon">'+
        '<option value=""></option>'+
				'<option value="good">Good</option>'+
				'<option value="poor">Poor</option>'+
			'</select></td>'+
		'</tr>'+
		'<tr class="popup-table-row">'+
			'<th class="popup-table-header">Ground Floor Condition:</th>'+
			'<td><select id="input-ground-conditon" name="input-ground-conditon">'+
				'<option value="Open wall">Open wall</option>'+
				'<option value="close wall">Close wall</option>'+
			'</select></td>'+
		'</tr>'+
		'<tr class="popup-table-row">'+
			'<th class="popup-table-header">No. Disabled:</th>'+
			'<td><input id="input-pop" name="input-pop" type="number"/></td>'+
		'</tr>'+
		'<tr class="popup-table-row">'+
			'<th class="popup-table-header">No. Elderly People:</th>'+
			'<td><input id="input-pop" name="input-pop" type="number"/></td>'+
		'</tr>'+
		'<tr class="popup-table-row">'+
			'<th class="popup-table-header">No. Children:</th>'+
			'<td><input id="input-pop" name="input-pop" type="number"/></td>'+
		'</tr>'+
		'<tr class="popup-table-row">'+
			'<th class="popup-table-header">Status:</th>'+
			'<td><select id="input-status" name="input-status">'+
				'<option value="1">Not complete</option>'+
				'<option value="2">Complete</option>'+
			'</select></td>'+
		'</tr>'+
	'</table><br>';
		return content;
	}

	function popupContent_edit2(feature, layer){
			var content =
			'<input type="hidden" id="input-bid" name="input-bid" value="'+feature.properties.gid+'"/"></input>'+
			'<table class="popup-table">'+
			'<tr class="popup-table-row">'+
				'<th class="popup-table-header">Building Name:</th>'+
				'<td><input id="input-name" name="input-name" type="text" value="'+feature.properties.name+'" required/></td>'+
			'</tr>'+
			'<tr class="popup-table-row">'+
				'<th class="popup-table-header">Type:</th>'+
				'<td><input id="input-type" name="input-type" type="text" value="'+feature.properties.type+'" required/></td>'+
			'</tr>'+
			'<tr class="popup-table-row">'+
				'<th class="popup-table-header">No. Story:</th>'+
				'<td><input id="input-story" name="input-story" type="number" value="'+feature.properties.no_story+'" required/></td>'+
			'</tr>'+
			'<tr class="popup-table-row">'+
				'<th class="popup-table-header">No. Population:</th>'+
				'<td><input id="input-pop" name="input-pop" type="number"/></td>'+
			'</tr>'+
			'<tr class="popup-table-row">'+
				'<th class="popup-table-header">Status:</th>'+
				'<td><select id="input-status" name="input-status">'+
					'<option value="1">Not complete</option>'+
					'<option value="2" selected>Complete</option>'+
				'</select></td>'+
			'</tr>'+
		'</table><br>';
			return content;
		}

	function popupContent_info(feature, layer){
			var content = '<div id="div_info" class="show_obj">'+
			'<h1>Infomation</h1>' +
			'<table class="popup-table">'+
			'<tr class="popup-table-row">'+
				'<th class="popup-table-header">Building Name:</th>'+
				'<td><input id="input-name" type="text" value="'+feature.properties.name+'" disabled/></td>'+
			'</tr>'+
			'<tr class="popup-table-row">'+
				'<th class="popup-table-header">Type:</th>'+
				'<td><input id="input-name" type="text" value="'+feature.properties.type+'"disabled/></td>'+
			'</tr>'+
			'<tr class="popup-table-row">'+
				'<th class="popup-table-header">No. Story:</th>'+
				'<td><input id="input-story" type="number" value="'+feature.properties.no_story+'"disabled/></td>'+
			'</tr>'+
			'<tr class="popup-table-row">'+
				'<th class="popup-table-header">No. Population:</th>'+
				'<td><input id="input-story" type="number" disabled/></td>'+
			'</tr>'+
		'</table><br>'+
			'<a id="btn_edit" href="#" onClick="showFormEdit();"><i class="fa fa-pencil-square fa-2x" aria-hidden="true"></i></a></div>';
			return content;
		}

    function popupContent_showinfo(feature, layer){

  			var content = '<div class="form-popup" id="infoForm">'+
        	'<form id="add_form" name="add_form" action="" method="post" class="form-container">'+
            '<h1>Information</h1>'+
            '<label for="input-name"><b>Building Name:</b></label>'+
            '<input id="input-name" name="input-name" type="text" value="'+feature.properties.name+'" disabled>'+
            '<label for="input-occupancy-conditon"><b>Occupancy Class</b></label>'+
            '<select id="input-occupancy-conditon" name="input-occupancy-conditon" disabled>'+
              '<option value=""></option>'+
              '<option value="commercial">Commercial</option>'+
              '<option value="ressidential">Residential</option>'+
            '</select>'+
        		'<label for="psw"><b>Structural Type</b></label>'+
            '<select id="input-structural-conditon" name="input-structural-conditon" disabled>'+
              '<option value=""></option>'+
      				'<option value="concrete">Concrete</option>'+
      				'<option value="masonry">Masonry</option>'+
              '<option value="steel">Steel</option>'+
      				'<option value="mixed">Mixed</option>'+
      			'</select>'+
        		'<label for="input-story"><b>No. Stories</b></label>'+
            '<input id="input-story" name="input-story" type="number" value="'+feature.properties.no_story+'" disabled>'+
        		'<label for="input-physical-conditon"><b>Physical Building Condition</b></label>'+
            '<select id="input-physical-conditon" name="input-physical-conditon" disabled>'+
              '<option value=""></option>'+
      				'<option value="good">Good</option>'+
      				'<option value="poor">Poor</option>'+
      			'</select>'+
        		'<label for="input-ground-conditon"><b>Ground Floor Condition</b></label>'+
            '<select id="input-ground-conditon" name="input-ground-conditon" disabled>'+
              '<option value=""></option>'+
      				'<option value="Open wall">Open wall</option>'+
      				'<option value="close wall">Close wall</option>'+
      			'</select>'+
        		'<label for="input-pop"><b>No. Disabled</b></label>'+
            '<input id="input-pop" name="input-pop" type="number" disabled>'+
        		'<label for="input-pop"><b>No. Elderly People</b></label>'+
            '<input id="input-pop" name="input-pop" type="number" disabled>'+
        		'<label for="input-children"><b>No. Children</b></label>'+
            '<input id="input-children" name="input-children" type="number" disabled>'+
            '<button type="button" class="btn" onclick="openeditForm()">EDIT</button>'+
            '<button type="button" class="btn cancel" onclick="closeForm()">CLOSE</button>'+
          '</form>'+
        '</div>';
  			return content;
  		}


      function popupContent_editinfo(feature, layer){
          var content = '<h1>Edit Information</h1>'+
              '<label for="input-name"><b>Building Name:</b></label>'+
              '<input type="hidden" id="input-bid" name="input-bid" value="'+feature.properties.gid+'">'+
              '<input id="input-name" name="input-name" type="text" value="'+feature.properties.name+'" required>'+
              '<label for="input-occupancy-conditon"><b>Occupancy Class</b></label>'+
              '<select id="input-occupancy-conditon" name="input-occupancy-conditon" required>'+
                '<option value=""></option>'+
                '<option value="commercial">Commercial</option>'+
                '<option value="ressidential">Residential</option>'+
              '</select>'+
              '<label for="psw"><b>Structural Type</b></label>'+
              '<select id="input-structural-conditon" name="input-structural-conditon" required>'+
                '<option value=""></option>'+
                '<option value="concrete">Concrete</option>'+
                '<option value="masonry">Masonry</option>'+
                '<option value="steel">Steel</option>'+
                '<option value="mixed">Mixed</option>'+
              '</select>'+
              '<label for="input-story"><b>No. Stories</b></label>'+
              '<input id="input-story" name="input-story" type="number" value="'+feature.properties.no_story+'" required>'+
              '<label for="input-physical-conditon"><b>Physical Building Condition</b></label>'+
              '<select id="input-physical-conditon" name="input-physical-conditon" required>'+
                '<option value=""></option>'+
                '<option value="good">Good</option>'+
                '<option value="poor">Poor</option>'+
              '</select>'+
              '<label for="input-ground-conditon"><b>Ground Floor Condition</b></label>'+
              '<select id="input-ground-conditon" name="input-ground-conditon" required>'+
                '<option value=""></option>'+
                '<option value="Open wall">Open wall</option>'+
                '<option value="close wall">Close wall</option>'+
              '</select>'+
              '<label for="input-pop"><b>No. Disabled</b></label>'+
              '<input id="input-pop" name="input-pop" type="number" required>'+
              '<label for="input-pop"><b>No. Elderly People</b></label>'+
              '<input id="input-pop" name="input-pop" type="number" required>'+
              '<label for="input-children"><b>No. Children</b></label>'+
              '<input id="input-children" name="input-children" type="number" required>'+
              '<label for="input-status"><b>Status</b></label>'+
              '<select id="input-status" name="input-status" required>'+
                '<option value="1">Not complete</option>'+
                '<option value="2">Complete</option>'+
              '</select>';
          return content;
        }

        function popupContent_addinfo(){
            var content = '<h1>Add Information</h1>'+
                '<label for="input-name"><b>Building Name:</b></label>'+
                '<input id="input-name" name="input-name" type="text" value="" required>'+
                '<label for="input-occupancy-conditon"><b>Occupancy Class</b></label>'+
                '<select id="input-occupancy-conditon" name="input-occupancy-conditon" required>'+
                  '<option value=""></option>'+
                  '<option value="commercial">Commercial</option>'+
                  '<option value="ressidential">Residential</option>'+
                '</select>'+
                '<label for="psw"><b>Structural Type</b></label>'+
                '<select id="input-structural-conditon" name="input-structural-conditon" required>'+
                  '<option value=""></option>'+
                  '<option value="concrete">Concrete</option>'+
                  '<option value="masonry">Masonry</option>'+
                  '<option value="steel">Steel</option>'+
                  '<option value="mixed">Mixed</option>'+
                '</select>'+
                '<label for="input-story"><b>No. Stories</b></label>'+
                '<input id="input-story" name="input-story" type="number" value="" required>'+
                '<label for="input-physical-conditon"><b>Physical Building Condition</b></label>'+
                '<select id="input-physical-conditon" name="input-physical-conditon" required>'+
                  '<option value=""></option>'+
                  '<option value="good">Good</option>'+
                  '<option value="poor">Poor</option>'+
                '</select>'+
                '<label for="input-ground-conditon"><b>Ground Floor Condition</b></label>'+
                '<select id="input-ground-conditon" name="input-ground-conditon" required>'+
                  '<option value=""></option>'+
                  '<option value="Open wall">Open wall</option>'+
                  '<option value="close wall">Close wall</option>'+
                '</select>'+
                '<label for="input-pop"><b>No. Disabled</b></label>'+
                '<input id="input-pop" name="input-pop" type="number" required>'+
                '<label for="input-pop"><b>No. Elderly People</b></label>'+
                '<input id="input-pop" name="input-pop" type="number" required>'+
                '<label for="input-children"><b>No. Children</b></label>'+
                '<input id="input-children" name="input-children" type="number" required>'+
                '<label for="input-status"><b>Status</b></label>'+
                '<select id="input-status" name="input-status" required>'+
                  '<option value="1">Not complete</option>'+
                  '<option value="2">Complete</option>'+
                '</select>';
            return content;
          }
	map.locate({setView: true, maxZoom: 16});
	function submit_form(form_id){
		if(form_id == 1){
			data_form = $('#edit_form').serialize();
		}else{
			data_form = $('#edit_form2').serialize();
		}
		$.ajax({
				type: 'post',
				url: 'svr/update_script.php',
				data: data_form,
				success: function (data) {
					var arr = JSON.parse(data);
					if(arr.success == true){
						location.href = "map.html";
					}else{
						alert('Try again');
					}
				},
				error: function (data) {
						console.log('An error occurred.');
						console.log(data);
				},
		});
	};
	function submit_formAdd(){
			data_form = $('#add_form').serialize();
		$.ajax({
				type: 'post',
				url: 'svr/add_script.php',
				data: data_form,
				success: function (data) {
					var arr = JSON.parse(data);
					if(arr.success == true){
						location.href = "map.html";
					}else{
						alert('Try again');
					}
				},
				error: function (data) {
						console.log('An error occurred.');
						console.log(data);
				},
		});
	};
  function openinfoForm() {
  document.getElementById("infoForm").style.display = "block";
  document.getElementById("editForm").style.display = "none";
}
function openaddForm() {
  document.getElementById("addForm").style.display = "block";
}
function closeaddForm() {
  document.getElementById("addForm").style.display = "none";
}
function openeditForm() {
  document.getElementById("editForm").style.display = "block";
  document.getElementById("infoForm").style.display = "none";
}
function closeForm() {
  document.getElementById("editForm").style.display = "none";
  document.getElementById("infoForm").style.display = "none";
}
