const express = require("express");
const {Client} = require('pg');
import {getFromConfig, handleDefault, db} from './utils';

const hostname = process.env.IP_ADDRESS || '10.0.0.6';
const port = 8081;
const app = express();
const saveClient = (req, res, next) => {
    req.client = client;
    next();
};

var client = null;
const connectToDataBase = () => {
    client = new Client(getFromConfig('postgresql'));
    client.connect();
}

const ALLOWED_ORIGINS = [
  'http://168.63.58.52:80',
  'http://localhost:63342',
  'http://ksutechrosset.northeurope.cloudapp.azure.com'
];

const testServer = () => {
    // DB
    console.log(db.queries.select('users', { login: 'Петя', role: 1 }));
    console.log(db.queries.insert('users', { login: 'Петя', ddd: 1 }));
    console.log(db.queries.update('users', { login: 'Петя', ddd: 1 }, { user_id: 1 }));
    console.log(db.queries.delete('users', { login: 'Петя', ddd: 1 }));
}

app.use(function (req, res, next) {
	if(ALLOWED_ORIGINS.indexOf(req.headers.origin) > -1) {
		res.set('Access-Control-Allow-Credentials', 'true')
		res.set('Access-Control-Allow-Origin', req.headers.origin)
	} else { // разрешить другим источникам отправлять неподтвержденные запросы CORS
		res.set('Access-Control-Allow-Origin', '*')        
	}
	
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, x-ijt, Authorization');
 
 
    next();
});

app.use(express.json({ extended: true }));
app.use(saveClient);
app.use('/api/user/', require('./routes/user.routes'));
app.use('/api/user_roles/', require('./routes/user_roles.routes'));
app.use('/api/region/', require('./routes/region.routes'));

app.listen(port, hostname, async () => {
    try {
        await connectToDataBase();
        console.log(`Server running at http://${hostname}:${port}/`);
    } catch(error) {
        handleDefault(error);
    }
});
