const express = require("express");
const {Pool} = require('pg');
const multer = require('multer');
import {getFromConfig, handleDefault, db} from './utils';

const hostname = process.env.IP_ADDRESS || '10.0.0.6';
const port = 8081;
const app = express();
const savePool = (req, res, next) => {
    req.pool = pool;
    next();
};
const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
		
        cb(null, `./uploads/${req.query.projectId}/`);
    },
    filename: (req, file, cb) =>{
        cb(null, file.originalname);
    }
});

var pool = null;
const connectToDataBase = () => {
    pool = new Pool(getFromConfig('postgresql'));
}

const ALLOWED_ORIGINS = [
  'http://168.63.58.52:80',
  'http://localhost:63342',
  'http://localhost:80',
  'http://ksutechrosset.northeurope.cloudapp.azure.com'
];

const testServer = () => {
    // DB
    console.log(db.queries.select('users', { login: 'Петя', role: 1 }));
    console.log(db.queries.insert('users', { login: 'Петя', ddd: 1 }));
    console.log(db.queries.update('users', { login: 'Петя', ddd: 1 }, { user_id: 1 }));
    console.log(db.queries.delete('users', { login: 'Петя', ddd: 1 }));

    console.log(db.queries.user.setDocuments({ user_id: 1 }));
    console.log(db.queries.project.setDocuments({ project_id: 1 }));
}

var upload = multer({storage:storageConfig}).single("file") ;
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
app.use(savePool);
app.use('/api/user/', require('./routes/user.routes'));
app.use('/api/user_roles/', require('./routes/user_roles.routes'));
app.use('/api/region/', require('./routes/region.routes'));
app.use('/api/kanban/', require('./routes/kanban.routes'));
app.use('/api/project/', require('./routes/project.routes'));
app.use('/api/like/', require('./routes/like.routes'));
app.use('/api/comment/', require('./routes/comment.routes'));
app.use('/api/document/', require('./routes/document.routes'));
app.use('/api/dashboard/', require('./routes/dashboard.routes'));

app.listen(port, hostname, async () => {
    try {
        await connectToDataBase();
        console.log(`Server running at http://${hostname}:${port}/`);
        // testServer();
    } catch(error) {
        handleDefault(error);
    }
});
