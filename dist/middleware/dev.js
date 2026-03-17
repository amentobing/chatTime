export default async function devVerify(req, res, next) {
    const { token } = req.body;
    if (!token || token !== "amengantengSedunia775")
        return res.status(404);
    next();
}
