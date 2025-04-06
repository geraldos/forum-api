const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();

  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
      // Arrange
      const requestPayload = {
        content: 'komentar ini bagus',
      };
      const threadId = 'thread-1';
      const commentId = 'comment-1';
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      const { accessToken, id: userId } = await AuthenticationsTableTestHelper.getAccessToken({ server });

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId: threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      await UsersTableTestHelper.findUsersById('user-2');
      await ThreadsTableTestHelper.findThreadsById('thread-1');
      await CommentsTableTestHelper.findCommentsById('comment-1');

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {};
      const threadId = 'thread-1';
      const commentId = 'comment-1';
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      const { accessToken, id: userId } = await AuthenticationsTableTestHelper.getAccessToken({ server });

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId: threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: ['komentar ini bagus'],
      };
      const threadId = 'thread-1';
      const commentId = 'comment-1';
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      const { accessToken, id: userId } = await AuthenticationsTableTestHelper.getAccessToken({ server });

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId: threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena tipe data tidak sesuai');
    });

    it('should response 400 when content more than 80 character', async () => {
      // Arrange
      const requestPayload = {
        content: 'commentcommentcommentcommentcommentcommentcommentcommentcommentcommentcommentcommentcommentcommentcommentcomment',
      };
      const threadId = 'thread-1';
      const commentId = 'comment-1';
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      const { accessToken, id: userId } = await AuthenticationsTableTestHelper.getAccessToken({ server });

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentsTableTestHelper.addComment({ id: commentId, threadId: threadId, owner: userId });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat reply baru karena karakter content melebihi batas limit');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and deleted reply', async () => {
      // Arrange
      const requestPayload = {};
      const threadId = 'thread-1';
      const commentId = 'comment-1';
      const replyId = 'reply-1';
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      const { accessToken, id } = await AuthenticationsTableTestHelper.getAccessToken({ server });

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: id, body: 'alpha' });
      await CommentsTableTestHelper.addComment({ id: commentId, owner: id, content: 'thread ini bagus' });
      await RepliesTableTestHelper.addReplies({ id: replyId, threadId, commentId, owner: id, content: 'komentar ini bagus' });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      await UsersTableTestHelper.findUsersById(id);
      await ThreadsTableTestHelper.findThreadsById(threadId);
      await CommentsTableTestHelper.findCommentsById(commentId);
      await RepliesTableTestHelper.findReplyById(replyId);

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 400 when deleting from unavailable thread', async () => {
      // Arrange
      const requestPayload = {};
      const threadId = 'xxx';
      const commentId = 'comment-1';
      const replyId = 'reply-1';
      const server = await createServer(container);
      const { accessToken, id } = await AuthenticationsTableTestHelper.getAccessToken({ server });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 when deleting from unavailable comment', async () => {
      // Arrange
      const requestPayload = {};
      const threadId = 'thread-1';
      const commentId = 'comment-10';
      const replyId = 'reply-1';
      const server = await createServer(container);
      const { accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 404 when deleting from unavailable reply', async () => {
      // Arrange
      const requestPayload = {};
      const threadId = 'thread-1';
      const commentId = 'comment-1';
      const replyId = 'reply-10';
      const server = await createServer(container);
      const { accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
  });
});
