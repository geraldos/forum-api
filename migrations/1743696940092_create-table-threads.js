/* eslint-disable camelcase */

exports.up = pgm => {
  pgm.createTable('threads', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    title: {
      type: 'VARCHAR(50)',
      notNull: true
    },
    body: {
      type: 'TEXT',
      notNull: true,
    },
    owner: {
      type: 'VARCHAR(30)',
      notNull: true,
    },
    date: {
      type: 'TEXT',
    }
  })
}

exports.down = pgm => {
  pgm.dropTable('threads')
}
