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
  text: './includes/text.txt',
  button: './includes/button.html',
  includes: {
    text: './includes/text.txt',
    button: './includes/button.html',
    include: {
      button: './includes/button.html'
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
        text: '<p>./includes/text.txt</p>'
      }
    }
  }
}
