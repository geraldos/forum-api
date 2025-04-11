class LikeCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyAvailableThread(useCasePayload.thread);
    await this._commentRepository.verifyAvailableComment(useCasePayload.comment, useCasePayload.thread);
    await this._commentRepository.likeComment(useCasePayload.comment, useCasePayload.owner);

    return {
      status: 'success',
    };
  }
}

module.exports = LikeCommentUseCase;
