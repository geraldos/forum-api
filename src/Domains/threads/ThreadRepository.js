class ThreadRepository {
  async addThread (addThread) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyAvailableThread (threadId) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }

  async getDetailThread (threadId) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED')
  }
}

module.exports = ThreadRepository;
