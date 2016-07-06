module.exports = {
  test: 'Hello',
  pipe: 'World!',
  firstname: 'Post',
  middlename: 'HTML',
  lastname: 'Exps',
  fullname: {
    firstname: 'Post',
    middlename: 'HTML',
    lastname: 'Exps'
  },
  text: './imports/text.txt',
  button: './imports/button.html',
  imports: {
    text: './imports/text.txt',
    button: './imports/button.html',
    include: {
      button: './imports/button.html'
    }
  },
  items: [{name: 'Hans', age: 65}, 'Two', 'Three'],
  list: {
    items: [{name: 'Hans', age: 65}, 'Two', 'Three']
  },
  note: {
    list: {
      items: [
        {name: 'Hans', age: 65}, 'Two', 'Three'
      ]
    }
  },
  article: {
    title: 'Article Title',
    content: {
      title: 'Content Title',
      text: 'Hello World!',
      chapter: {
        title: '<h1>Chapter Title</h1>\n',
        text: '<p>./imports/text.txt</p>'
      }
    }
  }
}
