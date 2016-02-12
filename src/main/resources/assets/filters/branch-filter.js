var el = document.getElementsByName("branch");
var branch = el && el.length > 0 ? el[0].value : 'unknown';
console.log('Current branch: ' + branch);