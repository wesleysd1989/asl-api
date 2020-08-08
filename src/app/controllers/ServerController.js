class ServerController {
    async show(req, res) {
        return res
            .status(200)
            .json({ menssage: 'Application on, congratulations.' });
    }
}

export default new ServerController();
