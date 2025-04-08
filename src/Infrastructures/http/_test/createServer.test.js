const createServer = require('../createServer');
const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const container = require('../../container');

describe('HTTP server', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  it('should response 404 when request unregistered route', async () => {
    // Arrange
    const server = await createServer({});

    // Action
    const response = await server.inject({
      method: 'GET',
      url: '/unregisteredRoute',
    });

    // Assert
    expect(response.statusCode).toEqual(404);
  });

  describe('when GET /', () => {
    it('should return 200 and hello world', async () => {
      // Arrange
      const server = await createServer({});
      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/',
      });
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.value).toEqual('Hello world!!');
    });
  });

  it('should handle server users error correctly', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'super_secret',
    };
    const server = await createServer({}); // fake injection

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload: requestPayload,
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(500);
    expect(responseJson.status).toEqual('error');
    expect(responseJson.message).toEqual('terjadi kegagalan pada server kami');
  });

  it('should handle server threads error correctly', async () => {
    // Arrange
    const requestPayload = {
      title: 'alpha',
      body: 'body',
    };
    await UsersTableTestHelper.addUser({ id: 'user-1', username: 'dicoding-1' });
    let server = await createServer(container); // fake injection
    const { accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
    server = await createServer({});

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
    expect(response.statusCode).toEqual(500);
    expect(responseJson.status).toEqual('error');
    expect(responseJson.message).toEqual('terjadi kegagalan pada server kami');
  });

  it('should handle server comments error correctly', async () => {
    // Arrange
    const requestPayload = {
      title: 'alpha',
      body: 'body',
    };
    const threadsId = 'thread-1'
    await UsersTableTestHelper.addUser({ id: 'user-1', username: 'dicoding-1' });
    let server = await createServer(container); // fake injection
    const { accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
    server = await createServer({});

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
    expect(response.statusCode).toEqual(500);
    expect(responseJson.status).toEqual('error');
    expect(responseJson.message).toEqual('terjadi kegagalan pada server kami');
  });

  it('should handle server comments error correctly', async () => {
    // Arrange
    const threadId = 'thread-1';
    const commentId = 'comment-1';
    let server = await createServer(container);
    await UsersTableTestHelper.addUser({ id: 'user-1', username: 'dicoding-1' });
    const { accessToken } = await AuthenticationsTableTestHelper.getAccessToken({ server });
    server = await createServer({});

    // Action
    const response = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments/${commentId}/replies`,
      payload: { content: 'balasan error' },
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(500);
    expect(responseJson.status).toEqual('error');
    expect(responseJson.message).toEqual('terjadi kegagalan pada server kami');
  });
});
