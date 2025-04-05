class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const detailThread = await this._threadRepository.getDetailThread(useCasePayload.id);
    let comments = await this._commentRepository.getCommentByThreadId(useCasePayload.id);

    if (comments.length > 0) {
      comments = comments.map(({ is_delete, ...rest }) => ({
        ...rest,
        content: is_delete ? '**komentar telah dihapus**' : rest.content,
      }));
    };
    detailThread.comments = comments.length === 0 ? [] : comments;

    return detailThread;
  }
}

module.exports = GetDetailThreadUseCase;
