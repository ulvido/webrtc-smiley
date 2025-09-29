fetch("https://jsonplaceholder.typicode.com/todos/2")
	.then((response) => response.json())
	.then((json) => console.log(json));
