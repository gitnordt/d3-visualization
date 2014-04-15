var templates = {
	Program: "<h2>{{DARPA Program Name}}</h2><p>{{Description}}</p>",
	
	Publications: "<h2>{{Title}}</h2><p><a href='#'>{{Link}}</a></p><div><ul>Teams:{{#Program Teams}}<li>{{.}}</li>{{/Program Teams}}</ul></div><div><ul>Authors:{{#Authors}}<li>{{.}}</li>{{/Authors}}</ul></div>",
	
	Software: "<h2>{{Software}}</h2><p>{{Description}}<br><a href='#'>{{Public Code Repo}}</a></p><div><ul>Teams:{{#Program Teams}}<li>{{.}}</li>{{/Program Teams}}</ul></div><div><ul>Languages:{{#Languages}}<li>{{.}}</li>{{/Languages}}</ul></div><div><ul>Licenses:{{#License}}<li>{{.}}</li>{{/License}}</ul></div><div><ul>Categories:{{#Categories}}<li>{{.}}</li>{{/Categories}}</ul></div>",
	
	Licenses: "<h2>{{License Long Name}}</h2><br><p>{{License Description}}<br><a href='#'>{{License Link}}</a><div><ul>Short Names:{{#License Short Name}}<li>{{.}}</li>{{/License Short Name}}</ul></div>"
};