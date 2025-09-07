require('dotenv').config();
const session = require('express-session');
const flash = require('connect-flash');
const express = require('express');
const MongoStore = require('connect-mongo')
const cookieParser = require('cookie-parser')
const path = require('path');
const useRouter = require('./routes/routes');
const staticRouter = require('./routes/staticRoutes');
const noAuthRoute = require('./routes/routeWithNoAuth');
const mainPageRouter = require('./routes/mainPage');
const AdminRoutes = require('./routes/admin');
const { checkForAuthentication  } = require('./middleware/auth')
const cluster = require('cluster')
const os = require('os'); 
const { Socket } = require('dgram');
const CPU = os.cpus().length
console.log('total cpu for this app',CPU);
if(cluster.isPrimary){
    console.log(`Primary process ${process.pid} is running`);
    console.log(`Total CPU cores: ${CPU}`);
    for(let i = 0 ; i<= CPU; i++){
        cluster.fork()
        
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork();
    });
}else{

const app = express();
const templatePath = path.join(__dirname, './template');
const publicPath = path.join(__dirname, './public');
const http = require("http")
app.use(session({
    secret:process.env.JWT_Secret, 
    resave: false,
    saveUninitialized: true,
}));
app.use(session({
    secret: process.env.JWT_Secret,
    resave: false,
    saveUninitialized: false, 
    store: MongoStore.create({       
        mongoUrl: process.env.MONGO_URI,
        collectionName: 'sessions',
        ttl: 14 * 24 * 60 * 60 
    })
}));
app.use(flash());

const socketIo = require("socket.io");
const server = http.createServer(app);
const io = socketIo(server);

app.use((req, res, next) => {
    res.locals.successMessage = req.flash('success');
    res.locals.errorMessage = req.flash('error');
    next(); 
});
app.use(express.static(publicPath));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


app.use('/api/user', useRouter);
app.use('/api',checkForAuthentication, staticRouter)
app.use('/',noAuthRoute )
app.use('/',mainPageRouter )
app.use('/admin',AdminRoutes )

app.set('view engine', 'ejs');
app.set('views', templatePath);

const PORT = process.env.PORT || 3000 ;

app.set('io', io);

const startServer = (port) => {
    try {
        server.listen(port, () => {
            console.log(`Worker ${process.pid} started - on port No : ${port}`);
        });
    } catch (error) {
        if (error.code === 'EADDRINUSE') {
            console.log(`Port ${port} is busy, trying ${port + 1}`);
            startServer(port + 1);
        } else {
            console.error('Server error:', error);
        }
    }
};

startServer(PORT);

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying ${PORT + 1}`);
        server.close();
        startServer(PORT + 1);
    } else {
        console.error('Server error:', error);
    }
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    if (error.code === 'EADDRINUSE') {
        console.log('Port is already in use. Please try a different port.');
    }
});

module.exports = { app, io };
}    