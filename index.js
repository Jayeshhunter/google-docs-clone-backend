const mongoose = require("mongoose");
const Document = require("./document");
require("dotenv").config();
mongoose.connect(
  "mongodb+srv://hackDB:Jayesh@135@cluster0.lev68.mongodb.net/hackDB",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
    useCreateIndex: true,
  }
);
const port = process.env.PORT || 3001;
// console.log(process.env.PORT);
const io = require("socket.io")(port, {
  cors: {
    origin: "https://google-docs-clone-frontend.vercel.app",
    method: ["GET", "POST"],
  },
});
const defaultValue = "";
io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);
    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });
    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
  });
});
async function findOrCreateDocument(id) {
  if (id == null) return;
  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: defaultValue });
}
