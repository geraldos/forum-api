const AddReply = require("../AddReply");

describe('a AddReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: ['komentar ini bagus']
    };

    // Action and Assert
    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when title contains more than 80 character', () => {
    // Arrange
    const payload = {
      content: 'commentcommentcommentcommentcommentcommentcommentcommentcommentcommentcommentcommentcommentcommentcommentcomment'
    };

    // Action and Assert
    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.CONTENT_LIMIT_CHAR');
  });

  it('should create addReplies object correctly', () => {
    // Arrange
    const payload = {
      content: 'komentar ini bagus'
    };

    // Action
    const { content } = new AddReply(payload);

    // Assert
    expect(content).toEqual(payload.content);
  });
});
