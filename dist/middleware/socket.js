import jwt from "jsonwebtoken";
export default function socketMid(socket, next) {
    const token = socket.handshake.auth.token || socket.handshake.headers.token;
    if (!token)
        return next(new Error("Akses ditolak, Silahkan anda login terlebih dahulu."));
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        socket.data.userId = decode.userId;
        next();
    }
    catch (err) {
        console.error(err);
        return next(new Error("Akses ditolak, silahkan login kembali."));
    }
}
