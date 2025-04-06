const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'alpha',
        body: 'body',
      };
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      const { accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'alpha',
      };
      const server = await createServer(container);
      const { accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 'alpha',
        body: ['body']
      };
      const server = await createServer(container);
      const { accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });

    it('should response 400 when title more than 50 character', async () => {
      // Arrange
      const requestPayload = {
        title: 'alphaalphaalphaalphaalphaalphaalphaalphaalphaalphaaa',
        body: 'body',
      };
      const server = await createServer(container);
      const { accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena karakter title melebihi batas limit');
    });

    it('should response 400 when body more than 50 character', async () => {
      // Arrange
      const requestPayload = {
        title: 'alpha',
        body: 'bodybodybodybodybodybodybodybodybodybodybodybodybody',
      };
      const server = await createServer(container);
      const { accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena karakter body melebihi batas limit');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and return detail thread with comments', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-1',
        title: 'alpha',
        body: 'body',
        owner: 'user-1',
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        threadId: 'thread-1',
        content: 'thread ini bagus',
        owner: 'user-1',
      });
      await RepliesTableTestHelper.addReplies({
        id: 'reply-1',
        commentId: 'comment-1',
        threadId: 'thread-1',
        owner: 'user-1',
        content: 'komentar ini bagus',
      })
      const threadId = 'thread-1';
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      const thread = responseJson.data.thread;
      expect(thread.id).toEqual('thread-1');
      expect(thread.title).toEqual('alpha');
      expect(thread.body).toEqual('body');
      expect(thread.username).toEqual('dicoding');
      expect(Array.isArray(thread.comments)).toBe(true);
      expect(Array.isArray(thread.comments[0].replies)).toBe(true);
      expect(thread.comments[0].content).toEqual('thread ini bagus');
    });

    it('should response 404 when thread is not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/non-existent-thread',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });
  });
});
