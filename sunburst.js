$.getScript("d3.min.js", function(){});
$.getScript("templates.js", function(){});
$.getScript("mustache.js", function(){});


var active_programs = [];

function getPrograms() {
	var programs;
	$.ajax({
		async: false,
		url: '../../active_content.json',
		dataType: 'json',
		success: function(response){
		   programs = response;
		}
	});
	return programs;
}


function getProgramDetails(filename) {
	var data;
	$.ajax({
		async: false,
		url: '../../darpa_open_catalog/' + filename,
		dataType: 'json',
		success: function(response){
		   data = response;
		}
	});
	return data;
}

function isInArray(value, array) {
  return array.indexOf(value) > -1;
}


function isIE() {
	var ua = window.navigator.userAgent;
	var msie = ua.indexOf("MSIE ");

	if (msie > 0)      
		return true;
	else    // If another browser, return false
		return false;
}

function sortByProperty(property) {
    return function (a, b) {
        var sortStatus = 0;
        if (a[property] < b[property]) {
            sortStatus = -1;
        } else if (a[property] > b[property]) {
            sortStatus = 1;
        }
 
        return sortStatus;
    };
}


function getScrollHeight(){
	 // var height = 0;
	  
	  if($('#ontology_view').height() > $('#ontology_map').height()){
		  /*if(isIE())
			top_margin = $(window).scrollTop() < 3220 ? $(window).scrollTop() : 3220; //subtract 1007 from height 
		  else
			top_margin = $(window).scrollTop() < 4050 ? $(window).scrollTop() : 4050; //subtract 655.8 from height*/
	  }
	  else{
		//return height;
			console.log($(window).scrollTop();
		}
}


function getDetailsNode(data, edges, node_name, size){
	var _details_edge = new Array();
	var _details_node = new Array();
	
	for( edge in edges){

		var values = new Array();
		var _edge = new Array();

		for (i in data) {
			for(value in data[i][edges[edge]]){
				var data_value = data[i][edges[edge]][value];
				if(!isInArray(data_value, values)){
					_edge.push({"name": data_value, "size": size});
					values.push(data_value);
				}
			}

			if(i == data.length - 1){
				var _node = "";
				if(edges[edge] == "Program Teams")
					_node = {"name":"Teams", "children": _edge};
				else
					_node = {"name":edges[edge], "children": _edge};
					
				_details_edge.push(_node);
			}

		}
	}

	_details_node = {"name":node_name, "children": _details_edge};
	return _details_node;

}

function adjustOntologyView(query_array){

	  query_array = typeof query_array == 'string' ? [query_array] : query_array;
	  console.log(query_array);
	  var html = "";
	  var level_data = [];
	  if(query_array.length == 0){
		html = getProgramView();
      }
	  else if(query_array.length == 1){
			var program_data = getProgramDetails(query_array[0] + "-program.json");
			var links = [];
			html = Mustache.to_html(templates.Program, program_data);
			html += '<p id="program_templ_links">';
			if (active_programs[program]['Pubs File'] != "")
				links.push('<a href="#">Publications</a>');
			if (active_programs[program]['Software File'] != "")
				links.push('<a href="#">Software</a>');
	
			if(links.length > 1){
				$.each(links, function (link) {
					html += links[link];
					if(link < links.length - 1)
						html += ' | '
				});
			}
			else
				html += links[0];

			html += '</p>';		
	  }
	  else if(query_array.length > 1){
		var file_type = "";
		if(query_array[1] == "Software")
			file_type = "software";
		else
			file_type = "pubs";
			
		var program_data = getProgramDetails(query_array[0] + "-" + file_type + ".json");
		var template = "";

		if(query_array[1] == "Software"){
			template = templates.Software;
			program_data.sort(sortByProperty("Software"));
		}
		else if(query_array[1] == "Publications"){
			template = templates.Publications;
			program_data.sort(sortByProperty("Title"));
		}

		if(query_array.length == 3){
			for (data in program_data) {
				var child_query = getChildQueryArray(query_array[2], program_data[data]);
				for( child in child_query){
					if(!isInArray(child_query[child], level_data))
						level_data.push(child_query[child]);
					break;
				}
			}
			level_data.sort();
		}


		if(query_array.length == 4){
			var lowest_value = "";
			if(query_array[2] == "Categories")
				lowest_value = "Category";
			else if(query_array[2] == "Teams")
				lowest_value = "Team";
			else
				lowest_value = "License";
		}

		if (query_array.length == 2)
			html = '<h1>' + query_array[0] + " " + query_array[1] + ':</h1><p>Total Records: ' + program_data.length + '</p>';
		if (query_array.length == 3)
			html = '<h1>' + query_array[0] + " " + query_array[1] + ' ordered by '+ query_array[2] +':</h1><p>Total Records: ' + program_data.length + '</p>';
		if (query_array.length == 4)
			html = '<h1>' + query_array[0] + " " + query_array[1] + ' with ' + lowest_value + ' \"' + query_array[3] + '\":</h1>';			



		if(query_array.length == 3){
			 for (var i=0;i < level_data.length;i++){ //all category array
				var heading = level_data[i] != "" ? level_data[i] : "Undefined " + query_array[2];
				html +="<h2><u>" + heading + "</u></h2>";
				for (data in program_data) {
					var child_query = getChildQueryArray(query_array[2], program_data[data]);
					
					for( child in child_query){ //value category array
						if(child_query[child] == level_data[i]){
							html += Mustache.to_html(template, program_data[data]);
							break;
						}
					}	
				}
			}

		}
		else{	
			var match_html = "";
			var match_count = 0;
			for (data in program_data) {	
				if (program_data[data]["Software"] == "")
					program_data[data]["Software"] = "No Name Available";
				if(program_data[data]["Title"] == "")
					program_data[data]["Title"] = "No Name Available";

				if(query_array.length == 4){

					var child_query = getChildQueryArray(query_array[2], program_data[data]);
					for( child in child_query){
						if(child_query[child] == query_array[3]){
							console.log("match");
							match_count ++;
							match_html += Mustache.to_html(template, program_data[data]);
							break;
						}
					}
					if(data == program_data.length -1){
						html += "<p>Total Records: " + match_count + "</p>" + match_html;
					}
				}
				else
					html += Mustache.to_html(template, program_data[data]);
			}	
		}
	  }

	$('#ontology_view').html(html);
	//if($('#ontology_map').height > $('#ontology_view').height())
		$('#ontology_map').height($('#ontology_view').height());
}

function getProgramView(){
	if(active_programs.length == 0 )
		active_programs = getPrograms();
	
	var html = "<h1>DARPA Programs</h1><p>Total Number of Programs: " + active_programs.length + "</p>";
	var template = templates.Program;
	
	active_programs.sort(sortByProperty('Program Name'));
	
	$.each(active_programs, function (program) {
		var program_nm = active_programs[program]['Program Name']
		var program_data = getProgramDetails(program_nm + "-program.json");
		var links = [];
		var file_type = "";
		html += Mustache.to_html(template, program_data);
		html += '<p id="program_templ_links">';

		
		if (active_programs[program]['Pubs File'] != "")
			file_type = "Publications";
		if (active_programs[program]['Software File'] != "")
			file_type = "Software";

		if (active_programs[program]['Pubs File'] != "")
			links.push('Publications');
		if (active_programs[program]['Software File'] != "")
			links.push('Software');	
	
		if(links.length > 1){
			$.each(links, function (link) {
				html += links[link];
				if(link < links.length - 1)
					html += ' | '
			});
		}
		else
			html += links[0];
		
		html += '</p>';
		
	});
	

	//console.log(html);
	return html;
}


function getChildQueryArray(query, data){
	var child_query = [];
	if(query == "Categories")
		child_query = data.Categories;
	else if(query == "Teams")
		child_query = data["Program Teams"];
	else if(query == "License")
		child_query = data.License;
		
	return child_query;

}




function getSunburstJSON(){
	var _root = new Array();
	var program_data = getPrograms();

	var sw_edges = ["Program Teams","Categories","License"];
	var pubs_edges = ["Program Teams"];
	var _primary_edge = new Array();
	var _primary_node = new Array();

	program_data.sort(sortByProperty('Program Name'));
	for (program in program_data){

		var program_nm = program_data[program]["Program Name"];
		var _program_edge = new Array();
		var _program_node = new Array();
		
		if(program_data[program]["Software File"] != ""){
			var details_node = getDetailsNode(getProgramDetails(program_data[program]["Software File"]), sw_edges, "Software", 3000); 
			_program_edge.push(details_node);
		}
		
		
		if(program_data[program]["Pubs File"] != ""){
			var details_node = getDetailsNode(getProgramDetails(program_data[program]["Pubs File"]), pubs_edges, "Publications", 2000); 
			_program_edge.push(details_node);
			
		}
		
		_program_node = {"name":program_nm, "children": _program_edge};
		_primary_edge.push(_program_node);
			
	}

	_primary_node = {"name":"DARPA PROGRAMS", "children": _primary_edge};
	_root.push(_primary_node);

	var json_string = JSON.stringify(_root, null, '  ');
	json_string = json_string.substring(1, json_string.length - 2);
	json_string = json_string.replace(/"key"/g, '"name"');
	json_string = json_string.replace(/"values"/g, '"children"');
	var json_object = $.parseJSON(json_string);

	return json_object;
}

	
function createSunburstGraph(div){
	
	var margin = {};
	
	if(isIE())
		margin = {top: 480, right: 500, bottom: 300, left: 520};
	else
		margin = {top: 320, right: 550, bottom: 350, left: 427};
	
	var radius = Math.min(margin.top, margin.right, margin.bottom, margin.left);

	var x = d3.scale.linear()
		.range([0, 2 * Math.PI]);

	var y = d3.scale.sqrt()
		.range([0, radius]);

	var color = d3.scale.category20c();

	var svg = d3.select(div).append("svg")
		.attr("width", margin.left + margin.right)
		.attr("height", margin.top + margin.bottom)
	  .append("g")	
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var partition = d3.layout.partition()
		.value(function(d) { return d.size; });

	var arc = d3.svg.arc()
		.startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
		.endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
		.innerRadius(function(d) { return Math.max(0, y(d.y)); })
		.outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });
	
	var root = getSunburstJSON();
	
	var g = svg.selectAll("g")
	  .data(partition.nodes(root))
		.enter().append("g");

	var tooltip = d3.select("body")
		.append("div")
		.style("position", "absolute")
		.style("z-index", "10")
		.style("color", "black")
		.style("background-color", "#FEFCFF")
		.style("-webkit-border-radius", "10px")
		.style("border", "solid 1 #726E6D")
		.style("visibility", "hidden");
		
	var path = g.append("path")
	  .attr("d", arc)
	  .style("fill", function(d) { return color(( d.children ? d : d.parent).name); })
	  .attr("title", function(d) { var title = ""; d.depth == 0 ? title = "zoom out" : title = d.name; return title; })
      .on("mousemove", function(d){if(isIE()){  var text = ""; d.depth == 0 ? text = " zoom out " : text = " " + d.name; return tooltip.text(text).style("top", window.event.y-10 +"px").style("left",window.event.x+10+"px").style("text-align", "center").style("visibility", "visible");}})
	  .on("mouseout", function(){if(isIE()) return tooltip.style("visibility", "hidden");})
	  .on("click", click);
	  
	var text = g.append("text")
	  .attr("x", function(d) { return y(d.y); })
	  .attr("dx", function(d) { var horizontal = ""; d.depth == 0 ? horizontal = "-50" : horizontal = "12"; return horizontal; })
	  .attr("dy", ".35em") // vertical-align
	  .attr("font-size", "80%")
	  .text(function(d) { return d.name; });

	function computeTextRotation(d) {
	  var angle = x(d.x + d.dx / 2) - Math.PI / 2;
	  return angle / Math.PI * 180;
	}

	text.attr("transform", function(d) { var rotate = ""; d.depth == 0 ? rotate = "rotate(0)" : rotate = "rotate(" + computeTextRotation(d) + ")"; return rotate; });	

	function click(d) {
	  // fade out all text elements
	  text.transition().attr("opacity", 0);
		  
	  path.transition()
		.duration(750)
		.attrTween("d", arcTween(d))
		.each("end", function(e, i) {
			// check if the animated element's data e lies within the visible angle span given in d
			if (e.x >= d.x && e.x < (d.x + d.dx)) {
			  var arcText = d3.select(this.parentNode).select("text");
			  // fade in the text element and recalculate positions
			  arcText.transition().duration(750)
				.attr("opacity", 1)
				.attr("transform", function() { var rotate = ""; e.depth == 0 ? rotate = "rotate(0)" : rotate = "rotate(" + computeTextRotation(e) + ")"; return rotate; })
				.attr("x", function(d) { return y(d.y); });
			}
		});

	   var parent_array = [];
	   var d_parent = d;
	   for (var i=d.depth;i > 0;i--){
		 parent_array[i-1] = d_parent.name;
		 d_parent = d_parent.parent;
	   }		
		adjustOntologyView(parent_array);
	}
	
	// Interpolate the scales!
	function arcTween(d) {
	  var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
		  yd = d3.interpolate(y.domain(), [d.y, 1]),
		  yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
	  return function(d, i) {
		return i
			? function(t) { return arc(d); }
			: function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
	  };
	}	
	
	d3.select(self.frameElement).style("height", margin.top + margin.bottom + "px");
}