const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Custom route để thêm note vào folder
server.post('/folders/:id/notes', (req, res) => {
  const folderId = req.params.id;
  const noteId = req.body.noteId;
  const db = router.db;

  const folder = db.get('folders').find({ id: folderId }).value();
  if (!folder) {
    return res.status(404).json({ error: 'Thư mục không tồn tại' });
  }
  if (!folder.noteIds.includes(noteId)) {
    db.get('folders')
      .find({ id: folderId })
      .update('noteIds', noteIds => [...noteIds, noteId])
      .write();
  }

  const note = db.get('notes').find({ id: noteId }).value();
  if (!note) {
    return res.status(404).json({ error: 'Ghi chú không tồn tại' });
  }
  db.get('notes')
    .find({ id: noteId })
    .assign({ folderId: folderId })
    .write();

  res.status(201).json({ message: 'Thêm ghi chú vào thư mục thành công' });
});

// Custom route để xóa note khỏi folder
server.delete('/folders/:id/notes/:noteId', (req, res) => {
  const folderId = req.params.id;
  const noteId = req.params.noteId;
  const db = router.db;

  const folder = db.get('folders').find({ id: folderId }).value();
  if (!folder) {
    return res.status(404).json({ error: 'Thư mục không tồn tại' });
  }
  db.get('folders')
    .find({ id: folderId })
    .update('noteIds', noteIds => noteIds.filter(id => id !== noteId))
    .write();

  const note = db.get('notes').find({ id: noteId }).value();
  if (!note) {
    return res.status(404).json({ error: 'Ghi chú không tồn tại' });
  }
  db.get('notes')
    .find({ id: noteId })
    .assign({ folderId: null })
    .write();

  res.status(200).json({ message: 'Xóa ghi chú khỏi thư mục thành công' });
});

server.use(router);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
});
