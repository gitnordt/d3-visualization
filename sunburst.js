$.getScript("d3.min.js", function(){});

	
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

	var margin = {top: 320, right: 445, bottom: 350, left: 427},
		radius = Math.min(margin.top, margin.right, margin.bottom, margin.left);

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

	var path = g.append("path")
	  .attr("d", arc)
	  .style("fill", function(d) { return color(( d.children ? d : d.parent).name); })
	  .attr("title", function(d) { var title = ""; d.depth == 0 ? title = "zoom out" : title = d.name + " - zoom in"; return title; })
	  .on("click", click);
	  
	var text = g.append("text")
	  .attr("x", function(d) { return y(d.y); })
	  .attr("dx", function(d) { var horizontal = ""; d.depth == 0 ? horizontal = "-50" : horizontal = "12"; return horizontal; })
	  .attr("dy", ".35em") // vertical-align
	  .attr("font-size", "80%")
	  .attr("title", function(d) { var title = ""; d.depth == 0 ? title = "zoom out" : title = d.name + " - zoom in"; return title; })
	  .on("click", click)
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