const DeletedComment = require('../DeletedComment');

describe('a DeletedComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {};

    // Action and Assert
    expect(() => new DeletedComment(payload)).toThrowError('DELETED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      status: ['success'],
    };

    // Action and Assert
    expect(() => new DeletedComment(payload)).toThrowError('DELETED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DeletedComment object correctly', () => {
    // Arrange
    const payload = {
      status: 'success',
    };

    // Action
    const deletedComment = new DeletedComment(payload);

    // Assert
    expect(deletedComment.status).toEqual(payload.status);
  });
});
