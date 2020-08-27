import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';

import FileController from './app/controllers/FileController';
import UserSessionController from './app/controllers/UserSessionController';
import UserController from './app/controllers/UserController';
import ServerController from './app/controllers/ServerController';
import AccountController from './app/controllers/AccountController';
import UpgradeUserController from './app/controllers/UpgradeUserController';
import RecoveryAccountController from './app/controllers/RecoveryAccountController';
import CommemorativeController from './app/controllers/CommemorativeController';
import EventController from './app/controllers/EventController';

import authMiddleware from './app/middlewares/auth';
import userMiddleware from './app/middlewares/user';

const routes = new Router();
const upload = multer(multerConfig);

// rotas publicas
routes.get('/', ServerController.show);
routes.post('/sessions/users', UserSessionController.store);
routes.get('/confirme/:token', AccountController.show);
routes.post('/recovery', RecoveryAccountController.store);
routes.put('/recovery/:token', RecoveryAccountController.update);

// todas as rotas depois da linha abaixo sera validado no middleware de authenticacao.
routes.use(authMiddleware);

// rotas privadas users
routes.post('/users', userMiddleware, UserController.store);
routes.get('/users', userMiddleware, UserController.index);
routes.get('/user/:id', userMiddleware, UserController.show);
routes.put('/users', userMiddleware, UserController.update);
routes.put('/users/:id', userMiddleware, UpgradeUserController.update);
routes.put('/account/:id', userMiddleware, AccountController.update);
routes.delete('/account/:id', userMiddleware, AccountController.delete);
routes.post(
    '/commemoratives',
    userMiddleware,
    upload.array('images'),
    CommemorativeController.store
);
routes.put(
    '/commemoratives/:id',
    userMiddleware,
    upload.array('images'),
    CommemorativeController.update
);
routes.delete(
    '/commemoratives/:id',
    userMiddleware,
    CommemorativeController.delete
);
routes.get('/commemoratives', userMiddleware, CommemorativeController.index);
routes.get('/commemoratives/:id', userMiddleware, CommemorativeController.show);
routes.post('/events', userMiddleware, EventController.store);
routes.get('/events', userMiddleware, EventController.index);
routes.get('/events/:id', userMiddleware, EventController.show);
routes.put('/events', userMiddleware, EventController.update);
routes.delete('/events/:id', userMiddleware, EventController.delete);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
