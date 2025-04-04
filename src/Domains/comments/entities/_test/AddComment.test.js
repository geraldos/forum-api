const AddComment = require("../AddComment");

describe('a AddComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: ['thread ini bagus']
    };

    // Action and Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when title contains more than 80 character', () => {
    // Arrange
    const payload = {
      content: 'commentcommentcommentcommentcommentcommentcommentcommentcommentcommentcommentcommentcommentcommentcommentcomment'
    };

    // Action and Assert
    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.CONTENT_LIMIT_CHAR');
  });

  it('should create addComment object correctly', () => {
    // Arrange
    const payload = {
      content: 'thread ini bagus'
    };

    // Action
    const { content } = new AddComment(payload);

    // Assert
    expect(content).toEqual(payload.content);
  });
});
