const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadsId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadsId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'thread ini bagus',
      };
      const threadsId = 'thread-1';
      // eslint-disable-next-line no-undef
      const server = await createServer(container);
      const { accessToken, userId } = await AuthenticationsTableTestHelper.getAccessToken({ server });

      await UsersTableTestHelper.addUser({ id: 'user-2', username: 'dicoding-1'});
      await ThreadsTableTestHelper.addThread({ id: threadsId, owner: 'user-2' });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadsId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      await UsersTableTestHelper.findUsersById('user-2');
      await ThreadsTableTestHelper.findThreadsById('thread-1');

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {};
      const threadsId = 'thread-1';
      const server = await createServer(container);
      const { accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThread({ id: threadsId, owner: 'user-1' });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadsId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: ['thread ini bagus'],
      };
      const threadsId = 'thread-1';
      const server = await createServer(container);
      const { accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThread({ id: threadsId, owner: 'user-1' });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadsId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena tipe data tidak sesuai');
    });

    it('should response 400 when content more than 80 character', async () => {
      // Arrange
      const requestPayload = {
        content: 'commentcommentcommentcommentcommentcommentcommentcommentcommentcommentcommentcommentcommentcommentcommentcomment',
      };
      const threadsId = 'thread-1';
      const server = await createServer(container);
      const { accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
      await ThreadsTableTestHelper.addThread({ id: threadsId, owner: 'user-1' });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadsId}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena karakter content melebihi batas limit');
    });
  });
});
