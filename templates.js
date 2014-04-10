var templates = {
	program: "<h2>{{DARPA Program Name}}</h2><p>{{Description}}</p>",
	
	publications: "<h1>{{DARPA Program}} : {{Title}}</h1><a href='#'>{{Link}}</a><div><ul>Teams:{{#Program Teams}}<li>{{.}}</li>{{/Program Teams}}</ul></div><div><ul>Authors:{{#Authors}}<li>{{.}}</li>{{/Authors}}</ul></div>",
	
	software: "<h1>{{DARPA Program}} : {{Software}}</h1><br><p>{{Description}}</p><br><a href='#'>{{Public Code Repo}}</a><div><ul>Teams:{{#Program Teams}}<li>{{.}}</li>{{/Program Teams}}</ul></div><div><ul>Languages:{{#Languages}}<li>{{.}}</li>{{/Languages}}</ul></div><div><ul>Licenses:{{#Licenses}}<li>{{.}}</li>{{/Licenses}}</ul></div><div><ul>Categories:{{#Categories}}<li>{{.}}</li>{{/Categories}}</ul></div>",
	
	licenses: "<h1>{{License Long Name}}</h1><br><p>{{License Description}}</p><br><a href='#'>{{License Link}}</a><div><ul>Short Names:{{#License Short Name}}<li>{{.}}</li>{{/License Short Name}}</ul></div>"
};