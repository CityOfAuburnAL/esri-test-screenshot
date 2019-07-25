const fse = require('fs-extra')

fse.copySync('app', '\\\\webserver1\\inetpub\\my\\map-maker\\app');
fse.copySync('index.html', '\\\\webserver1\\inetpub\\my\\map-maker\\index.html');